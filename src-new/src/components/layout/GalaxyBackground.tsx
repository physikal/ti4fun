import { useEffect, useRef } from "react";
import * as THREE from "three";

const STAR_COUNT = 3000;
const NEBULA_COUNT = 8;
const DRIFT_SPEED = 0.00008;
const TWINKLE_SPEED = 0.002;

export function GalaxyBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050510);
    container.appendChild(renderer.domElement);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const twinklePhase = new Float32Array(STAR_COUNT);

    const starColors = [
      [0.8, 0.85, 1.0],
      [1.0, 0.95, 0.8],
      [0.7, 0.8, 1.0],
      [1.0, 0.85, 0.7],
      [0.6, 0.7, 1.0],
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 2;

      const c = starColors[Math.floor(Math.random() * starColors.length)]!;
      colors[i * 3] = c[0]!;
      colors[i * 3 + 1] = c[1]!;
      colors[i * 3 + 2] = c[2]!;

      sizes[i] = Math.random() * 3 + 0.5;
      twinklePhase[i] = Math.random() * Math.PI * 2;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const starMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float twinkle = sin(uTime * 2.0 + position.x * 10.0 + position.y * 7.0) * 0.3 + 0.7;
          gl_PointSize = size * twinkle * uPixelRatio * (3.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.1, d);
          float glow = exp(-d * 4.0) * 0.5;
          gl_FragColor = vec4(vColor, (alpha + glow) * 0.9);
        }
      `,
      transparent: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Nebula clouds
    const nebulaColors = [
      [0.1, 0.15, 0.4],
      [0.2, 0.05, 0.3],
      [0.05, 0.15, 0.25],
      [0.15, 0.05, 0.2],
      [0.0, 0.1, 0.3],
      [0.1, 0.02, 0.15],
      [0.05, 0.1, 0.2],
      [0.12, 0.08, 0.25],
    ];

    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255,255,255,0.4)");
      gradient.addColorStop(0.4, "rgba(255,255,255,0.1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    const nebulaTexture = new THREE.CanvasTexture(canvas);

    const nebulae: THREE.Mesh[] = [];
    for (let i = 0; i < NEBULA_COUNT; i++) {
      const nc = nebulaColors[i % nebulaColors.length]!;
      const nebMat = new THREE.MeshBasicMaterial({
        map: nebulaTexture,
        color: new THREE.Color(nc[0]!, nc[1]!, nc[2]!),
        transparent: true,
        opacity: 0.15 + Math.random() * 0.1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const size = 3 + Math.random() * 5;
      const nebMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        nebMat,
      );
      nebMesh.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        -5 - Math.random() * 5,
      );
      nebMesh.rotation.z = Math.random() * Math.PI;
      scene.add(nebMesh);
      nebulae.push(nebMesh);
    }

    let animId = 0;
    let time = 0;

    function animate() {
      animId = requestAnimationFrame(animate);
      time += 16;

      starMat.uniforms["uTime"]!.value = time * TWINKLE_SPEED;

      stars.rotation.y = time * DRIFT_SPEED * 0.3;
      stars.rotation.x = Math.sin(time * DRIFT_SPEED * 0.5) * 0.05;

      for (const neb of nebulae) {
        neb.rotation.z += 0.00005;
      }

      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      starMat.uniforms["uPixelRatio"]!.value = Math.min(
        window.devicePixelRatio,
        2,
      );
    }
    window.addEventListener("resize", onResize);

    cleanupRef.current = () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      nebulaTexture.dispose();
      for (const neb of nebulae) {
        neb.geometry.dispose();
        (neb.material as THREE.MeshBasicMaterial).dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };

    return () => {
      cleanupRef.current?.();
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
