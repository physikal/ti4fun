import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "src/store/gameStore";
import { PLAYER_COLOR_HEX } from "src/store/types";

const SPIRAL_STARS = 12000;
const BG_STARS = 4000;
const ARMS = 4;
const ARM_SPREAD = 0.4;
const SPIRAL_TIGHTNESS = 2.5;
const MAX_SHIPS = 8;
const MAX_LASERS = 20;
const MAX_EXPLOSION_PARTICLES = 64;
const PARTICLES_PER_EXPLOSION = 8;

const DEFAULT_SHIP_COLORS = [
  0x44aaff, 0xff4444, 0x44ff88, 0xffaa22,
  0xaa44ff, 0xff44aa, 0x22dddd, 0xffdd44,
];

function makeNoiseTexture(size: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;

  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    const cx = x / size - 0.5;
    const cy = y / size - 0.5;
    const dist = Math.sqrt(cx * cx + cy * cy) * 2;

    const n1 = Math.sin(cx * 12.9898 + cy * 78.233) * 43758.5453;
    const noise = (n1 - Math.floor(n1)) * 0.3;

    const falloff = Math.max(0, 1 - dist * 1.2);
    const val = Math.pow(falloff, 1.5) * (0.7 + noise);

    const idx = i * 4;
    data[idx] = 255;
    data[idx + 1] = 255;
    data[idx + 2] = 255;
    data[idx + 3] = Math.floor(val * 255);
  }

  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function GalaxyBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000,
    );
    camera.position.set(0, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020208);
    container.appendChild(renderer.domElement);

    const disposables: { dispose: () => void }[] = [];

    // --- Spiral galaxy stars ---
    const spiralPositions = new Float32Array(SPIRAL_STARS * 3);
    const spiralColors = new Float32Array(SPIRAL_STARS * 3);
    const spiralSizes = new Float32Array(SPIRAL_STARS);
    const spiralRandomness = new Float32Array(SPIRAL_STARS);

    const innerColor = new THREE.Color(0.9, 0.7, 0.4);
    const midColor = new THREE.Color(0.4, 0.5, 0.9);
    const outerColor = new THREE.Color(0.2, 0.3, 0.8);
    const hotColor = new THREE.Color(1.0, 0.85, 0.6);

    for (let i = 0; i < SPIRAL_STARS; i++) {
      const radius = Math.pow(Math.random(), 0.6) * 10;
      const armIndex = i % ARMS;
      const armAngle = (armIndex / ARMS) * Math.PI * 2;
      const spiralAngle = radius * SPIRAL_TIGHTNESS;

      const randomX =
        (Math.random() - 0.5) * ARM_SPREAD * radius * 0.5 +
        (Math.random() - 0.5) * 0.3;
      const randomY =
        (Math.random() - 0.5) * 0.15 * Math.exp(-radius * 0.15);
      const randomZ =
        (Math.random() - 0.5) * ARM_SPREAD * radius * 0.5 +
        (Math.random() - 0.5) * 0.3;

      const angle = armAngle + spiralAngle;
      spiralPositions[i * 3] = Math.cos(angle) * radius + randomX;
      spiralPositions[i * 3 + 1] = randomY;
      spiralPositions[i * 3 + 2] = Math.sin(angle) * radius + randomZ;

      const t = radius / 10;
      const color = new THREE.Color();
      if (t < 0.15) {
        color.lerpColors(hotColor, innerColor, t / 0.15);
      } else if (t < 0.5) {
        color.lerpColors(innerColor, midColor, (t - 0.15) / 0.35);
      } else {
        color.lerpColors(midColor, outerColor, (t - 0.5) / 0.5);
      }

      const brightness = 0.7 + Math.random() * 0.3;
      spiralColors[i * 3] = color.r * brightness;
      spiralColors[i * 3 + 1] = color.g * brightness;
      spiralColors[i * 3 + 2] = color.b * brightness;

      spiralSizes[i] = (Math.random() * 2 + 0.5) * (1 - t * 0.5);
      spiralRandomness[i] = Math.random() * Math.PI * 2;
    }

    const spiralGeo = new THREE.BufferGeometry();
    spiralGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(spiralPositions, 3),
    );
    spiralGeo.setAttribute(
      "color",
      new THREE.BufferAttribute(spiralColors, 3),
    );
    spiralGeo.setAttribute(
      "size",
      new THREE.BufferAttribute(spiralSizes, 1),
    );
    spiralGeo.setAttribute(
      "aRandom",
      new THREE.BufferAttribute(spiralRandomness, 1),
    );
    disposables.push(spiralGeo);

    const spiralMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute float aRandom;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(position.xz);
          float twinkle = sin(uTime * 1.5 + aRandom * 6.28) * 0.25 + 0.75;
          float coreBrightness = exp(-dist * 0.3) * 0.5 + 0.5;
          vAlpha = twinkle * coreBrightness;
          gl_PointSize = size * twinkle * uPixelRatio * (4.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float core = exp(-d * 8.0);
          float glow = exp(-d * 3.0) * 0.6;
          float alpha = (core + glow) * vAlpha;
          gl_FragColor = vec4(vColor * (1.0 + core * 0.5), alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(spiralMat);

    const spiralStars = new THREE.Points(spiralGeo, spiralMat);
    scene.add(spiralStars);

    // --- Galactic core glow ---
    const coreTexture = makeNoiseTexture(256);
    disposables.push(coreTexture);

    const coreLayers = [
      { size: 4, color: 0xffe8c0, opacity: 0.12 },
      { size: 6, color: 0xffcc80, opacity: 0.06 },
      { size: 9, color: 0xaa88ff, opacity: 0.03 },
    ];

    const coreMeshes: THREE.Mesh[] = [];
    for (const layer of coreLayers) {
      const mat = new THREE.MeshBasicMaterial({
        map: coreTexture,
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(layer.size, layer.size),
        mat,
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.01;
      scene.add(mesh);
      coreMeshes.push(mesh);
      disposables.push(mat, mesh.geometry);
    }

    // --- Nebula clouds along arms ---
    const nebulaTexture = makeNoiseTexture(256);
    disposables.push(nebulaTexture);

    const nebulaSpecs = [
      { angle: 0, dist: 3, size: 4, color: 0x4466cc, opacity: 0.07 },
      { angle: 1.2, dist: 4.5, size: 5, color: 0x6633aa, opacity: 0.05 },
      { angle: 2.5, dist: 3.5, size: 3.5, color: 0x3355bb, opacity: 0.06 },
      { angle: 3.8, dist: 5, size: 4.5, color: 0x553399, opacity: 0.05 },
      { angle: 0.8, dist: 6, size: 5.5, color: 0x2244aa, opacity: 0.04 },
      { angle: 2.0, dist: 2, size: 3, color: 0x7744aa, opacity: 0.08 },
      { angle: 4.5, dist: 4, size: 4, color: 0x4455cc, opacity: 0.06 },
      { angle: 5.5, dist: 5.5, size: 5, color: 0x553388, opacity: 0.04 },
      { angle: 1.8, dist: 7, size: 6, color: 0x334499, opacity: 0.03 },
      { angle: 3.2, dist: 2.5, size: 3, color: 0x885533, opacity: 0.05 },
      { angle: 5.0, dist: 3, size: 3.5, color: 0xcc6644, opacity: 0.04 },
      { angle: 0.4, dist: 8, size: 7, color: 0x223366, opacity: 0.025 },
    ];

    const nebulaMeshes: THREE.Mesh[] = [];
    for (const spec of nebulaSpecs) {
      const spiralOff = spec.dist * SPIRAL_TIGHTNESS;
      const x = Math.cos(spec.angle + spiralOff) * spec.dist;
      const z = Math.sin(spec.angle + spiralOff) * spec.dist;

      const mat = new THREE.MeshBasicMaterial({
        map: nebulaTexture,
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(spec.size, spec.size),
        mat,
      );
      mesh.position.set(x, (Math.random() - 0.5) * 0.3, z);
      mesh.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.3;
      mesh.rotation.z = Math.random() * Math.PI;
      scene.add(mesh);
      nebulaMeshes.push(mesh);
      disposables.push(mat, mesh.geometry);
    }

    // --- Dust lanes (darker bands) ---
    const dustTexture = makeNoiseTexture(128);
    disposables.push(dustTexture);

    const dustSpecs = [
      { angle: 0.5, dist: 3, size: 3, opacity: 0.15 },
      { angle: 2.1, dist: 4, size: 3.5, opacity: 0.12 },
      { angle: 3.6, dist: 3.5, size: 2.5, opacity: 0.1 },
      { angle: 5.2, dist: 4.5, size: 3, opacity: 0.12 },
    ];

    for (const spec of dustSpecs) {
      const spiralOff = spec.dist * SPIRAL_TIGHTNESS;
      const x = Math.cos(spec.angle + spiralOff) * spec.dist;
      const z = Math.sin(spec.angle + spiralOff) * spec.dist;

      const mat = new THREE.MeshBasicMaterial({
        map: dustTexture,
        color: 0x030308,
        transparent: true,
        opacity: spec.opacity,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(spec.size, spec.size),
        mat,
      );
      mesh.position.set(x, -0.02, z);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = spec.angle + spiralOff;
      scene.add(mesh);
      disposables.push(mat, mesh.geometry);
    }

    // --- Background stars (distant) ---
    const bgPositions = new Float32Array(BG_STARS * 3);
    const bgColors = new Float32Array(BG_STARS * 3);
    const bgSizes = new Float32Array(BG_STARS);
    const bgRandom = new Float32Array(BG_STARS);

    for (let i = 0; i < BG_STARS; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 40 + Math.random() * 60;
      bgPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      bgPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      bgPositions[i * 3 + 2] = r * Math.cos(phi);

      const temp = Math.random();
      if (temp < 0.3) {
        bgColors[i * 3] = 0.6;
        bgColors[i * 3 + 1] = 0.7;
        bgColors[i * 3 + 2] = 1.0;
      } else if (temp < 0.6) {
        bgColors[i * 3] = 1.0;
        bgColors[i * 3 + 1] = 0.95;
        bgColors[i * 3 + 2] = 0.85;
      } else {
        bgColors[i * 3] = 0.9;
        bgColors[i * 3 + 1] = 0.9;
        bgColors[i * 3 + 2] = 0.95;
      }

      bgSizes[i] = Math.random() * 1.5 + 0.3;
      bgRandom[i] = Math.random() * Math.PI * 2;
    }

    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(bgPositions, 3),
    );
    bgGeo.setAttribute("color", new THREE.BufferAttribute(bgColors, 3));
    bgGeo.setAttribute("size", new THREE.BufferAttribute(bgSizes, 1));
    bgGeo.setAttribute("aRandom", new THREE.BufferAttribute(bgRandom, 1));
    disposables.push(bgGeo);

    const bgMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute float aRandom;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * 0.8 + aRandom * 6.28) * 0.4 + 0.6;
          gl_PointSize = size * twinkle * uPixelRatio * (2.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 0.5);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, alpha * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(bgMat);

    const bgStars = new THREE.Points(bgGeo, bgMat);
    scene.add(bgStars);

    // --- Ships & combat ---
    interface Ship {
      mesh: THREE.Mesh;
      index: number;
      orbitRadius: number;
      orbitAngle: number;
      orbitSpeed: number;
      orbitY: number;
      cooldown: number;
    }

    interface Laser {
      mesh: THREE.Mesh;
      vel: THREE.Vector3;
      life: number;
      targetIndex: number;
      homingStrength: number;
    }

    interface ExplosionParticle {
      active: boolean;
      life: number;
      maxLife: number;
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      r: number;
      g: number;
      b: number;
    }

    function makeShipMesh(color: number): THREE.Mesh {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0.12);
      shape.lineTo(0.05, -0.06);
      shape.lineTo(0.03, -0.04);
      shape.lineTo(0, -0.08);
      shape.lineTo(-0.03, -0.04);
      shape.lineTo(-0.05, -0.06);
      shape.closePath();

      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      disposables.push(geo, mat);
      return mesh;
    }

    const ships: Ship[] = [];
    for (let i = 0; i < MAX_SHIPS; i++) {
      const mesh = makeShipMesh(DEFAULT_SHIP_COLORS[i]!);
      mesh.visible = false;
      mesh.scale.set(1.5, 1.5, 1.5);
      const orbitRadius = 2 + Math.random() * 6;
      const orbitAngle = Math.random() * Math.PI * 2;
      const orbitY = (Math.random() - 0.5) * 1.5;
      mesh.position.set(
        Math.cos(orbitAngle) * orbitRadius,
        orbitY,
        Math.sin(orbitAngle) * orbitRadius,
      );
      scene.add(mesh);

      ships.push({
        mesh,
        index: i,
        orbitRadius,
        orbitAngle,
        orbitSpeed:
          (0.15 + Math.random() * 0.25) * (Math.random() > 0.5 ? 1 : -1),
        orbitY,
        cooldown: Math.random() * 3,
      });
    }

    const lasers: Laser[] = [];

    function makeLaserMesh(color: number): THREE.Mesh {
      const geo = new THREE.PlaneGeometry(0.01, 0.15);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      disposables.push(geo, mat);
      return mesh;
    }

    function fireLaser(
      ship: Ship,
      targetShip: Ship,
      targetIdx: number,
      homingStrength: number,
    ) {
      if (lasers.length >= MAX_LASERS) return;
      const shipMat = ship.mesh.material as THREE.MeshBasicMaterial;
      const mesh = makeLaserMesh(shipMat.color.getHex());

      mesh.position.copy(ship.mesh.position);
      scene.add(mesh);

      const dir = new THREE.Vector3()
        .subVectors(targetShip.mesh.position, ship.mesh.position)
        .normalize();
      const vel = dir.multiplyScalar(0.15);

      mesh.lookAt(targetShip.mesh.position);

      lasers.push({
        mesh,
        vel,
        life: 1.5,
        targetIndex: targetIdx,
        homingStrength,
      });
    }

    // --- Explosion particle system (1 draw call) ---
    const explosionParticles: ExplosionParticle[] = [];
    for (let i = 0; i < MAX_EXPLOSION_PARTICLES; i++) {
      explosionParticles.push({
        active: false,
        life: 0,
        maxLife: 1,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        r: 1,
        g: 1,
        b: 1,
      });
    }

    const expPositions = new Float32Array(MAX_EXPLOSION_PARTICLES * 3);
    const expColors = new Float32Array(MAX_EXPLOSION_PARTICLES * 3);
    const expSizes = new Float32Array(MAX_EXPLOSION_PARTICLES);
    const expAlphas = new Float32Array(MAX_EXPLOSION_PARTICLES);

    const expPosAttr = new THREE.BufferAttribute(expPositions, 3);
    const expColorAttr = new THREE.BufferAttribute(expColors, 3);
    const expSizeAttr = new THREE.BufferAttribute(expSizes, 1);
    const expAlphaAttr = new THREE.BufferAttribute(expAlphas, 1);

    const expGeo = new THREE.BufferGeometry();
    expGeo.setAttribute("position", expPosAttr);
    expGeo.setAttribute("color", expColorAttr);
    expGeo.setAttribute("size", expSizeAttr);
    expGeo.setAttribute("aAlpha", expAlphaAttr);

    const explosionMat = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute float aAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vAlpha = aAlpha;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPixelRatio * (4.0 / -mvPosition.z);
          gl_PointSize = max(gl_PointSize, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float core = exp(-d * 8.0);
          float glow = exp(-d * 3.0) * 0.6;
          float alpha = (core + glow) * vAlpha;
          gl_FragColor = vec4(vColor * (1.0 + core * 0.5), alpha);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const explosionPoints = new THREE.Points(expGeo, explosionMat);
    scene.add(explosionPoints);
    disposables.push(expGeo, explosionMat);

    function spawnExplosion(
      pos: THREE.Vector3,
      r: number,
      g: number,
      b: number,
    ) {
      let spawned = 0;
      for (const p of explosionParticles) {
        if (spawned >= PARTICLES_PER_EXPLOSION) break;
        if (p.active) continue;

        p.active = true;
        p.life = 0.3 + Math.random() * 0.2;
        p.maxLife = p.life;
        p.x = pos.x;
        p.y = pos.y;
        p.z = pos.z;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 0.5 + Math.random() * 1.0;
        p.vx = Math.sin(phi) * Math.cos(theta) * speed;
        p.vy = Math.sin(phi) * Math.sin(theta) * speed;
        p.vz = Math.cos(phi) * speed;

        p.r = r;
        p.g = g;
        p.b = b;

        spawned++;
      }
    }

    // --- Animation ---
    let animId = 0;
    let time = 0;
    const cameraBaseY = camera.position.y;
    const cameraBaseZ = camera.position.z;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 16;
      const t = time * 0.001;
      const dt = 0.016;

      spiralMat.uniforms["uTime"]!.value = t;
      bgMat.uniforms["uTime"]!.value = t;

      spiralStars.rotation.y = t * 0.015;

      for (const mesh of coreMeshes) {
        mesh.rotation.z = t * 0.02;
      }

      for (let i = 0; i < nebulaMeshes.length; i++) {
        const neb = nebulaMeshes[i]!;
        neb.rotation.z += 0.0001;
        const mat = neb.material as THREE.MeshBasicMaterial;
        const baseOpacity = nebulaSpecs[i]?.opacity ?? 0.05;
        mat.opacity =
          baseOpacity * (0.85 + Math.sin(t * 0.3 + i * 1.5) * 0.15);
      }

      // Read game state (sync, zero-cost, no re-renders)
      const { players } = useGameStore.getState();
      const inGame = players.length >= 3;
      const visibleCount = inGame ? players.length : MAX_SHIPS;
      const maxVP = inGame
        ? Math.max(1, ...players.map((p) => p.vp))
        : 1;

      // Update ships
      for (let i = 0; i < MAX_SHIPS; i++) {
        const ship = ships[i]!;
        const mat = ship.mesh.material as THREE.MeshBasicMaterial;

        if (i < visibleCount) {
          ship.mesh.visible = true;
          if (inGame) {
            mat.color.set(PLAYER_COLOR_HEX[players[i]!.color]);
          } else {
            mat.color.setHex(DEFAULT_SHIP_COLORS[i]!);
          }
        } else {
          ship.mesh.visible = false;
          continue;
        }

        ship.orbitAngle += ship.orbitSpeed * dt;
        ship.orbitRadius +=
          Math.sin(t * 0.5 + ship.orbitAngle) * 0.002;

        const tx = Math.cos(ship.orbitAngle) * ship.orbitRadius;
        const tz = Math.sin(ship.orbitAngle) * ship.orbitRadius;
        const ty =
          ship.orbitY +
          Math.sin(t * 0.3 + ship.orbitAngle * 2) * 0.3;

        const prev = ship.mesh.position.clone();
        ship.mesh.position.set(tx, ty, tz);

        const dir = ship.mesh.position.clone().sub(prev);
        if (dir.length() > 0.001) {
          const angle = Math.atan2(-dir.x, -dir.z);
          ship.mesh.rotation.set(-Math.PI / 2, angle, 0);
        }

        ship.cooldown -= dt;
        if (ship.cooldown <= 0 && visibleCount > 1) {
          const offset =
            1 + Math.floor(Math.random() * (visibleCount - 1));
          const targetIdx = (i + offset) % visibleCount;
          const targetShip = ships[targetIdx]!;
          const dist = ship.mesh.position.distanceTo(
            targetShip.mesh.position,
          );
          if (dist < 6) {
            let homing = 0.06;
            let mult = 1.0;
            if (inGame && players[i]) {
              const vpRatio = players[i]!.vp / maxVP;
              mult = 1.0 - vpRatio * 0.6;
              homing = 0.03 + vpRatio * 0.09;
            }
            fireLaser(ship, targetShip, targetIdx, homing);
            ship.cooldown = 2.5 * mult + Math.random() * mult;
          }
        }
      }

      // Update lasers (homing toward target)
      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i]!;
        const target = ships[laser.targetIndex];

        if (target && target.mesh.visible) {
          const toTarget = new THREE.Vector3()
            .subVectors(target.mesh.position, laser.mesh.position)
            .normalize()
            .multiplyScalar(0.15);
          laser.vel.lerp(toTarget, laser.homingStrength);
          laser.vel.normalize().multiplyScalar(0.15);
          laser.mesh.lookAt(
            laser.mesh.position.clone().add(laser.vel),
          );
        }

        laser.mesh.position.add(laser.vel);
        laser.life -= dt;

        let hit = false;
        if (target && target.mesh.visible) {
          const dist = laser.mesh.position.distanceTo(
            target.mesh.position,
          );
          if (dist < 0.3) hit = true;
        }

        if (hit || laser.life <= 0) {
          if (hit) {
            const targetMat =
              target?.mesh.material as THREE.MeshBasicMaterial;
            const c = targetMat?.color ?? new THREE.Color(1, 1, 1);
            spawnExplosion(laser.mesh.position, c.r, c.g, c.b);
          }
          scene.remove(laser.mesh);
          lasers.splice(i, 1);
        } else {
          const mat = laser.mesh.material as THREE.MeshBasicMaterial;
          mat.opacity = Math.max(0, laser.life * 0.9);
        }
      }

      // Update explosion particles
      for (let i = 0; i < MAX_EXPLOSION_PARTICLES; i++) {
        const p = explosionParticles[i]!;
        if (p.active) {
          p.life -= dt;
          if (p.life <= 0) {
            p.active = false;
          } else {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.vz *= 0.96;
          }
        }

        if (p.active) {
          const frac = p.life / p.maxLife;
          expPositions[i * 3] = p.x;
          expPositions[i * 3 + 1] = p.y;
          expPositions[i * 3 + 2] = p.z;
          expColors[i * 3] = p.r;
          expColors[i * 3 + 1] = p.g;
          expColors[i * 3 + 2] = p.b;
          expSizes[i] = 3.0 * frac;
          expAlphas[i] = frac;
        } else {
          expPositions[i * 3] = 0;
          expPositions[i * 3 + 1] = 0;
          expPositions[i * 3 + 2] = 0;
          expSizes[i] = 0;
          expAlphas[i] = 0;
        }
      }

      expPosAttr.needsUpdate = true;
      expColorAttr.needsUpdate = true;
      expSizeAttr.needsUpdate = true;
      expAlphaAttr.needsUpdate = true;

      camera.position.y = cameraBaseY + Math.sin(t * 0.08) * 0.5;
      camera.position.z = cameraBaseZ + Math.sin(t * 0.05) * 0.3;
      camera.position.x = Math.sin(t * 0.03) * 0.8;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      const pr = Math.min(window.devicePixelRatio, 2);
      spiralMat.uniforms["uPixelRatio"]!.value = pr;
      bgMat.uniforms["uPixelRatio"]!.value = pr;
      explosionMat.uniforms["uPixelRatio"]!.value = pr;
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      for (const d of disposables) d.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10"
      aria-hidden="true"
    />
  );
}
