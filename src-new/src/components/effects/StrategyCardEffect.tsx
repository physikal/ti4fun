import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { HudButton } from "src/components/layout/HudButton";

interface StrategyCardEffectProps {
  cardName: string;
  cardColor: string;
  primaryText?: string | undefined;
  secondaryText?: string | undefined;
  onContinue: () => void;
}

const MAX_PARTICLES = 4000;
const ASSEMBLE_DURATION = 2.0;

function sampleTextPositions(
  text: string,
  width: number,
  height: number,
): Float32Array {
  // Sample on a half-res canvas for denser coverage with fewer iterations
  const scale = 0.5;
  const cw = Math.floor(width * scale);
  const ch = Math.floor(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Float32Array(0);

  // Start with a large font, then shrink to fit within 90% of canvas width
  const label = text.toUpperCase();
  const maxWidth = cw * 0.9;
  let fontSize = Math.min(width * 0.14, height * 0.3);
  ctx.font = `900 ${fontSize * scale}px sans-serif`;
  let measured = ctx.measureText(label).width;
  if (measured > maxWidth) {
    fontSize *= maxWidth / measured;
    ctx.font = `900 ${fontSize * scale}px sans-serif`;
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText(label, cw / 2, ch / 2);

  const imageData = ctx.getImageData(0, 0, cw, ch);
  const pixels = imageData.data;

  const filled: [number, number][] = [];
  const step = Math.max(
    1,
    Math.floor(Math.sqrt((cw * ch) / (MAX_PARTICLES * 6))),
  );

  for (let y = 0; y < ch; y += step) {
    for (let x = 0; x < cw; x += step) {
      const idx = (y * cw + x) * 4;
      if (pixels[idx + 3]! > 128) {
        filled.push([
          (x / scale) - width / 2,
          -((y / scale) - height / 2),
        ]);
      }
    }
  }

  // Trim to MAX_PARTICLES via Fisher-Yates partial shuffle
  if (filled.length > MAX_PARTICLES) {
    for (
      let i = filled.length - 1;
      i > filled.length - 1 - MAX_PARTICLES;
      i--
    ) {
      const j = Math.floor(Math.random() * (i + 1));
      [filled[i], filled[j]] = [filled[j]!, filled[i]!];
    }
    filled.splice(0, filled.length - MAX_PARTICLES);
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
  primaryText,
  secondaryText,
  onContinue,
}: StrategyCardEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Defer one frame so the browser has completed layout —
    // container may report 0 dimensions immediately after mount
    const frameId = requestAnimationFrame(() => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

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
        -w / 2, w / 2, h / 2, -h / 2, 0.1, 100,
      );
      camera.position.z = 10;

      const scene = new THREE.Scene();

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
          uColor: {
            value: new THREE.Vector3(color.r, color.g, color.b),
          },
          uPixelRatio: { value: pixelRatio },
        },
        vertexShader: `
          attribute vec3 targetPosition;
          uniform float uProgress;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vAlpha;

          float ease(float t) {
            float t1 = 1.0 - t;
            return 1.0 - t1 * t1 * t1;
          }

          void main() {
            float p = ease(clamp(uProgress, 0.0, 1.0));

            float wobbleScale = 1.0 - p;
            vec3 wobble = vec3(
              sin(uTime * 1.5 + position.x * 0.01) * 30.0,
              cos(uTime * 1.2 + position.y * 0.01) * 30.0,
              0.0
            ) * wobbleScale;

            vec3 pos = mix(position + wobble, targetPosition, p);
            gl_Position =
              projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

            float sizeOsc =
              1.0 + sin(uTime * 3.0 + position.x * 0.05) * 0.2;
            gl_PointSize = 6.0 * uPixelRatio * sizeOsc;

            vAlpha = 0.6 + p * 0.4;
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

            float core = smoothstep(0.5, 0.0, d);
            float glow = core * core;

            float assembled = step(0.95, uProgress);
            float pulse = 0.85 + 0.15 * sin(uTime * 2.5);
            float brightness = mix(1.0, pulse, assembled);

            vec3 col = uColor * 1.5 * glow * brightness;
            float alpha = glow * vAlpha;
            gl_FragColor = vec4(col, alpha);
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

      cleanupRef.current = () => {
        cancelAnimationFrame(animId);
        for (const d of disposables) d.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    });

    return () => {
      cancelAnimationFrame(frameId);
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [cardName, cardColor]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      {!webglFailed && (
        <div ref={containerRef} className="absolute inset-0" />
      )}
      {showContinue && (
        <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-5 screen-fade-in px-6">
          {(primaryText || secondaryText) && (
            <div
              className="max-w-md w-full rounded-xl p-4 sm:p-5 backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${cardColor}15, ${cardColor}08)`,
                border: `1px solid ${cardColor}40`,
                boxShadow: `0 0 20px ${cardColor}20`,
              }}
            >
              {primaryText && (
                <p
                  className="text-sm sm:text-base font-medium leading-relaxed"
                  style={{ color: `${cardColor}ee` }}
                >
                  {primaryText}
                </p>
              )}
              {secondaryText && (
                <p className="mt-2 text-xs sm:text-sm text-white/50 leading-relaxed">
                  <span className="uppercase tracking-wider text-[10px] text-white/30 mr-1">
                    Secondary:
                  </span>
                  {secondaryText}
                </p>
              )}
            </div>
          )}
          <HudButton variant="accent" onClick={onContinue}>
            Continue
          </HudButton>
        </div>
      )}
    </div>
  );
}
