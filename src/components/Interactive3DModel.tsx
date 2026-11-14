import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PROFILE_DATA } from '../data/portfolioData';
import { lenisScrollState } from './SmoothScrollProvider';

export type StageLayerMode = 'photo' | 'chrome';

interface Interactive3DModelProps {
  mode: StageLayerMode;
  onToggleMode?: () => void;
  className?: string;
}

export const Interactive3DModel: React.FC<Interactive3DModelProps> = ({
  mode,
  onToggleMode,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<StageLayerMode>(mode);
  modeRef.current = mode;

  const orbitRef = useRef<{ x: number; y: number }>({ x: 0.15, y: -0.25 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio & Accent Lighting (#89AACC -> #4E85BF)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x89aacc, 2.8);
    keyLight.position.set(4, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4e85bf, 1.8);
    fillLight.position.set(-4, -3, 3);
    scene.add(fillLight);

    const titaniumMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      metalness: 0.88,
      roughness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });

    const graphiteMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.75,
      roughness: 0.25,
    });

    const hairlineWireMat = new THREE.MeshBasicMaterial({
      color: 0x89aacc,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const knotGeo = new THREE.TorusKnotGeometry(0.78, 0.2, 160, 36, 2, 3);
    const knotMesh = new THREE.Mesh(knotGeo, titaniumMat);
    rootGroup.add(knotMesh);

    const innerSphereGeo = new THREE.IcosahedronGeometry(0.42, 2);
    const innerSphere = new THREE.Mesh(innerSphereGeo, graphiteMat);
    rootGroup.add(innerSphere);

    const wireShellGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const wireShell = new THREE.Mesh(wireShellGeo, hairlineWireMat);
    rootGroup.add(wireShell);

    const ring1Geo = new THREE.TorusGeometry(1.9, 0.014, 16, 120);
    const ring1 = new THREE.Mesh(ring1Geo, graphiteMat);
    ring1.rotation.x = Math.PI / 2.3;
    rootGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.15, 0.012, 16, 120);
    const ring2 = new THREE.Mesh(ring2Geo, titaniumMat);
    ring2.rotation.y = Math.PI / 3;
    rootGroup.add(ring2);

    const targetPointer = { x: 0, y: 0 };
    const smoothPointer = { x: 0, y: 0 };
    let dragging = false;
    let prev = { x: 0, y: 0 };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      targetPointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetPointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (dragging) {
        orbitRef.current.y += (e.clientX - prev.x) * 0.008;
        orbitRef.current.x = Math.max(
          -0.8,
          Math.min(0.8, orbitRef.current.x + (e.clientY - prev.y) * 0.008)
        );
        prev = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      prev = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      dragging = false;
    };

    const dom = renderer.domElement;
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 320;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    let scrollSpinAccumulator = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const scrollVel = Math.max(-20, Math.min(20, lenisScrollState.velocity));
      scrollSpinAccumulator += scrollVel * 0.004;

      smoothPointer.x += (targetPointer.x - smoothPointer.x) * 0.06;
      smoothPointer.y += (targetPointer.y - smoothPointer.y) * 0.06;

      rootGroup.position.y = Math.sin(t * 1.1) * 0.06;
      rootGroup.rotation.y =
        orbitRef.current.y + smoothPointer.x * 0.35 + scrollSpinAccumulator * 0.35;
      rootGroup.rotation.x =
        orbitRef.current.x - smoothPointer.y * 0.22 + scrollVel * 0.015;

      knotMesh.rotation.x = t * 0.35 + scrollSpinAccumulator * 0.5;
      knotMesh.rotation.y = t * 0.45 + scrollSpinAccumulator;
      wireShell.rotation.y = -t * 0.18 - scrollSpinAccumulator * 0.4;
      ring1.rotation.z = t * 0.28 + scrollSpinAccumulator * 0.6;
      ring2.rotation.x = -t * 0.24 - scrollSpinAccumulator * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  const handleStageKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;

    if ((e.key === 'Enter' || e.key === ' ') && onToggleMode) {
      e.preventDefault();
      onToggleMode();
      return;
    }

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      orbitRef.current.y -= 0.22;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      orbitRef.current.y += 0.22;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      orbitRef.current.x = Math.max(-0.8, orbitRef.current.x - 0.18);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      orbitRef.current.x = Math.min(0.8, orbitRef.current.x + 0.18);
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center select-none ${className}`}
    >
      <div
        tabIndex={0}
        role="button"
        aria-label={`Interactive 3D sculpture stage (${
          mode === 'chrome' ? '3D Sculpture view' : 'Portrait view'
        }). Use Arrow keys to rotate sculpture or press Enter to switch view.`}
        onKeyDown={handleStageKeyDown}
        className="relative w-full aspect-square max-w-[300px] rounded-3xl bg-surface/90 border border-stroke focus-visible:border-[#89AACC] overflow-hidden flex items-center justify-center shadow-2xl"
      >
        {/* Three.js Canvas */}
        <div
          ref={mountRef}
          title="Drag or use Arrow keys to rotate 3D sculpture"
          className={`w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-500 ${
            mode === 'chrome' ? 'opacity-100' : 'opacity-25'
          }`}
        />

        {/* Editorial Portrait View */}
        <div
          className={`pointer-events-none absolute inset-3 rounded-2xl overflow-hidden transition-all duration-500 ${
            mode === 'photo'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-95'
          }`}
        >
          <img
            src={PROFILE_DATA.portraitUrl}
            alt={PROFILE_DATA.fullName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pb-11 text-left">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#89AACC]">
              @{PROFILE_DATA.handle}
            </p>
            <p className="text-sm font-display italic text-text-primary">
              {PROFILE_DATA.fullName}
            </p>
          </div>
        </div>

        {/* Bottom Mode Switcher */}
        {onToggleMode && (
          <div className="absolute bottom-2.5 inset-x-2.5 z-20 flex items-center justify-between rounded-full bg-bg/90 backdrop-blur-md border border-stroke px-3.5 py-1.5">
            <span className="font-mono text-[10px] text-muted">
              {mode === 'chrome' ? '3D Stage (←→↑↓ / Drag)' : 'Portrait View'}
            </span>
            <button
              type="button"
              onClick={onToggleMode}
              className="font-mono text-[10px] font-medium text-[#89AACC] hover:text-text-primary transition-colors cursor-pointer"
            >
              {mode === 'chrome' ? 'Show Portrait ↗' : 'Show 3D ↗'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Interactive3DModel;
