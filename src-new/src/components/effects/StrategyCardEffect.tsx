import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { HudButton } from "src/components/layout/HudButton";

interface StrategyCardEffectProps {
  cardName: string;
  cardColor: string;
  onContinue: () => void;
}

const MAX_PARTICLES = 1200;
const ASSEMBLE_DURATION = 2.0;

function sampleTextPositions(
  text: string,
  width: number,
  height: number,
): Float32Array {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Float32Array(0);

  const fontSize = Math.min(width * 0.12, height * 0.25);
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  const filled: [number, number][] = [];
  const step = Math.max(
    2,
    Math.floor(Math.sqrt((width * height) / (MAX_PARTICLES * 4))),
  );

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      if (pixels[idx + 3]! > 128) {
        filled.push([x - width / 2, -(y - height / 2)]);
      }
    }
  }

  // Randomly select up to MAX_PARTICLES
  while (filled.length > MAX_PARTICLES) {
    const removeIdx = Math.floor(Math.random() * filled.length);
    filled.splice(removeIdx, 1);
  }

  const result = new Float32Array(filled.length * 3);
  for (let i = 0; i < filled.length; i++) {
    result[i * 3] = filled[i]![0];
    result[i * 3 + 1] = filled[i]![1];
    result[i * 3 + 2] = 0;
  }
  return result;
}

export default function StrategyCardEffect({
  cardName,
  cardColor,
  onContinue,
}: StrategyCardEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;

    const targets = sampleTextPositions(cardName, w, h);
    const particleCount = targets.length / 3;

    if (particleCount === 0) {
      setShowContinue(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
      });
    } catch {
      setWebglFailed(true);
      setShowContinue(true);
      return;
    }

    const pixelRatio = Math.min(window.devicePixelRatio, 2);
    renderer.setSize(w, h);
    renderer.setPixelRatio(pixelRatio);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const disposables: { dispose: () => void }[] = [];

    const camera = new THREE.OrthographicCamera(
      -w / 2,
      w / 2,
      h / 2,
      -h / 2,
      0.1,
      100,
    );
    camera.position.z = 10;

    const scene = new THREE.Scene();

    // Starting positions: scattered randomly across 2x screen
    const startPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      startPositions[i * 3] = (Math.random() - 0.5) * w * 2;
      startPositions[i * 3 + 1] = (Math.random() - 0.5) * h * 2;
      startPositions[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(startPositions, 3),
    );
    geometry.setAttribute(
      "targetPosition",
      new THREE.BufferAttribute(targets, 3),
    );
    disposables.push(geometry);

    const color = new THREE.Color(cardColor);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Vector3(color.r, color.g, color.b) },
        uPixelRatio: { value: pixelRatio },
      },
      vertexShader: `
        attribute vec3 targetPosition;
        uniform float uProgress;
        uniform float uTime;
        uniform float uPixelRatio;

        varying float vAlpha;

        // easeOutCubic
        float ease(float t) {
          float t1 = 1.0 - t;
          return 1.0 - t1 * t1 * t1;
        }

        void main() {
          float p = ease(clamp(uProgress, 0.0, 1.0));

          // Drift/wobble on unassembled particles
          float wobbleScale = 1.0 - p;
          vec3 wobble = vec3(
            sin(uTime * 1.5 + position.x * 0.01) * 20.0,
            cos(uTime * 1.2 + position.y * 0.01) * 20.0,
            0.0
          ) * wobbleScale;

          vec3 pos = mix(position + wobble, targetPosition, p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

          float sizeOsc = 1.0 + sin(uTime * 3.0 + position.x * 0.05) * 0.15;
          gl_PointSize = 2.5 * uPixelRatio * sizeOsc;

          vAlpha = 0.5 + p * 0.5;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        uniform float uProgress;

        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;

          float glow = pow(1.0 - d * 2.0, 1.5);

          // Pulse after assembly
          float assembled = step(0.95, uProgress);
          float pulse = 0.8 + 0.2 * sin(uTime * 2.5);
          float brightness = mix(1.0, pulse, assembled);

          gl_FragColor = vec4(
            uColor * glow * brightness,
            glow * vAlpha
          );
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(material);

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let animId = 0;
    const startTime = performance.now();
    let continueShown = false;

    function animate() {
      animId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;

      material.uniforms["uTime"]!.value = elapsed;
      material.uniforms["uProgress"]!.value = Math.min(
        elapsed / ASSEMBLE_DURATION,
        1.0,
      );

      if (!continueShown && elapsed >= ASSEMBLE_DURATION) {
        continueShown = true;
        setShowContinue(true);
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      for (const d of disposables) d.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [cardName, cardColor]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      {!webglFailed && (
        <div ref={containerRef} className="absolute inset-0" />
      )}
      {showContinue && (
        <div className="absolute inset-x-0 bottom-12 flex justify-center screen-fade-in">
          <HudButton variant="accent" onClick={onContinue}>
            Continue
          </HudButton>
        </div>
      )}
    </div>
  );
}
