import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Generates a soft circular radial-gradient texture for 3D particles
 * so points render as smooth luminous orbs instead of hard squares.
 */
function createSoftParticleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.25, 'rgba(215, 232, 250, 0.85)');
    gradient.addColorStop(0.6, 'rgba(137, 170, 204, 0.28)');
    gradient.addColorStop(1, 'rgba(137, 170, 204, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface ParticleFieldProps {
  isLowPerf: boolean;
}

const RotatingParticleUniverse: React.FC<ParticleFieldProps> = ({
  isLowPerf,
}) => {
  const primaryPointsRef = useRef<THREE.Points>(null);
  const secondaryPointsRef = useRef<THREE.Points>(null);
  const orbitalRingRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Track global pointer and scroll for subtle 3D parallax even with pointer-events-none
  const pointerTarget = useRef({ x: 0, y: 0 });
  const scrollTarget = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      pointerTarget.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointerTarget.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      scrollTarget.current = window.scrollY / maxScroll;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const particleTexture = useMemo(() => createSoftParticleTexture(), []);

  // Layer 1: Primary 3D spherical starfield
  const primaryGeometry = useMemo(() => {
    const count = isLowPerf ? 650 : 1650;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color('#89AACC'),
      new THREE.Color('#4E85BF'),
      new THREE.Color('#C8DFF5'),
      new THREE.Color('#F5F5F5'),
      new THREE.Color('#6B9AC4'),
    ];

    for (let i = 0; i < count; i++) {
      // Distribute in a wide 3D spherical shell + deep volume
      const radius = 4 + Math.pow(Math.random(), 0.75) * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = (radius * Math.cos(phi)) - 4;

      const baseColor = palette[i % palette.length];
      const brightness = 0.55 + Math.random() * 0.45;
      colors[i * 3] = baseColor.r * brightness;
      colors[i * 3 + 1] = baseColor.g * brightness;
      colors[i * 3 + 2] = baseColor.b * brightness;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [isLowPerf]);

  // Layer 2: Closer ambient stardust for depth parallax
  const secondaryGeometry = useMemo(() => {
    const count = isLowPerf ? 200 : 480;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const accentA = new THREE.Color('#89AACC');
    const accentB = new THREE.Color('#FFFFFF');

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      const mixed = accentA.clone().lerp(accentB, Math.random() * 0.65);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [isLowPerf]);

  // Layer 3: Subtle tilted celestial ring in deep 3D space
  const orbitalGeometry = useMemo(() => {
    const count = isLowPerf ? 180 : 420;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const ringColor = new THREE.Color('#89AACC');
    const coreColor = new THREE.Color('#4E85BF');

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
      const radialSpread = 9.5 + (Math.random() - 0.5) * 3.8;
      const verticalSpread = (Math.random() - 0.5) * 1.1;

      positions[i * 3] = Math.cos(angle) * radialSpread;
      positions[i * 3 + 1] = verticalSpread;
      positions[i * 3 + 2] = Math.sin(angle) * radialSpread - 3;

      const c = ringColor.clone().lerp(coreColor, Math.random());
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [isLowPerf]);

  // Dispose resources cleanly on unmount
  useEffect(() => {
    return () => {
      primaryGeometry.dispose();
      secondaryGeometry.dispose();
      orbitalGeometry.dispose();
      particleTexture.dispose();
    };
  }, [primaryGeometry, secondaryGeometry, orbitalGeometry, particleTexture]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const elapsed = state.clock.getElapsedTime();

    // Slow, continuous 3D rotation for the primary starfield
    if (primaryPointsRef.current) {
      primaryPointsRef.current.rotation.y += dt * 0.032;
      primaryPointsRef.current.rotation.x += dt * 0.011;
      primaryPointsRef.current.rotation.z = Math.sin(elapsed * 0.08) * 0.06;
    }

    // Counter-rotating closer stardust with gentle breathing wave
    if (secondaryPointsRef.current) {
      secondaryPointsRef.current.rotation.y -= dt * 0.022;
      secondaryPointsRef.current.rotation.x = Math.cos(elapsed * 0.12) * 0.08;
    }

    // Tilted orbital ring precession
    if (orbitalRingRef.current) {
      orbitalRingRef.current.rotation.y += dt * 0.048;
      orbitalRingRef.current.rotation.z =
        0.38 + Math.sin(elapsed * 0.15) * 0.04;
    }

    // Smooth camera/group parallax from pointer + page scroll
    if (groupRef.current) {
      const targetRotY =
        pointerTarget.current.x * 0.12 + scrollTarget.current * Math.PI * 0.35;
      const targetRotX =
        pointerTarget.current.y * 0.08 + scrollTarget.current * 0.25;
      const targetPosY = (scrollTarget.current - 0.5) * 2.2;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        dt * 1.8
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        dt * 1.8
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        targetPosY,
        dt * 2.0
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Layer 1: Deep 3D Starfield */}
      <points ref={primaryPointsRef} geometry={primaryGeometry}>
        <pointsMaterial
          map={particleTexture}
          size={0.14}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Layer 2: Closer Parallax Bokeh Dust */}
      <points ref={secondaryPointsRef} geometry={secondaryGeometry}>
        <pointsMaterial
          map={particleTexture}
          size={0.22}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Layer 3: Tilted Celestial Ring */}
      <points
        ref={orbitalRingRef}
        geometry={orbitalGeometry}
        rotation={[0.42, 0, 0.38]}
      >
        <pointsMaterial
          map={particleTexture}
          size={0.12}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export const Global3DParticleBackground: React.FC = () => {
  const [webglSupported, setWebglSupported] = useState(true);
  const [isLowPerf, setIsLowPerf] = useState(false);

  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl =
        testCanvas.getContext('webgl2') ||
        testCanvas.getContext('webgl') ||
        testCanvas.getContext('experimental-webgl');

      if (!gl) {
        setWebglSupported(false);
        return;
      }

      if (gl instanceof WebGLRenderingContext || (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext)) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        const rendererInfo = dbg
          ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
          : '';
        const isSoftware = /SwiftShader|llvmpipe|softpipe|Microsoft Basic Render/i.test(
          String(rendererInfo)
        );
        if (isSoftware || window.innerWidth < 768) {
          setIsLowPerf(true);
        }
      }
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
    >
      <Canvas
        dpr={isLowPerf ? 1 : [1, 1.5]}
        camera={{ position: [0, 0, 14], fov: 60, near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
        }}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <RotatingParticleUniverse isLowPerf={isLowPerf} />
      </Canvas>
    </div>
  );
};
