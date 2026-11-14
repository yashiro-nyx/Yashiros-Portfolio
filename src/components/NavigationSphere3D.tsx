import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Compass, ChevronRight, ChevronLeft } from 'lucide-react';

export interface NavSphereSection {
  id: string;
  code: string;
  label: string;
  orbitPhi: number;
  orbitTheta: number;
}

export const PORTFOLIO_SECTIONS: NavSphereSection[] = [
  { id: 'home', code: '00', label: 'Home', orbitPhi: 0.42, orbitTheta: 0.0 },
  {
    id: 'work',
    code: '01',
    label: 'Selected Works',
    orbitPhi: 0.78,
    orbitTheta: 0.78,
  },
  {
    id: 'tech-stack',
    code: '02',
    label: 'Tech Stack',
    orbitPhi: 1.1,
    orbitTheta: 1.57,
  },
  {
    id: 'expertise',
    code: '03',
    label: 'Expertise',
    orbitPhi: 1.42,
    orbitTheta: 2.35,
  },
  {
    id: 'about',
    code: '04',
    label: 'Highlights',
    orbitPhi: 1.72,
    orbitTheta: 3.14,
  },
  {
    id: 'explorations',
    code: '05',
    label: 'Gallery',
    orbitPhi: 2.04,
    orbitTheta: 3.92,
  },
  {
    id: 'credentials',
    code: '06',
    label: 'Credentials',
    orbitPhi: 2.36,
    orbitTheta: 4.71,
  },
  {
    id: 'contact',
    code: '07',
    label: 'Connect',
    orbitPhi: 2.68,
    orbitTheta: 5.5,
  },
];

interface NavigationSphere3DProps {
  isDark?: boolean;
}

/**
 * Populates scene.environment using RoomEnvironment + PMREMGenerator
 * for realistic metallic and clearcoat reflections without external HDR assets.
 */
const StudioEnvironment: React.FC = () => {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;

    return () => {
      envTexture.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);

  return null;
};

interface OrbitalNodeProps {
  section: NavSphereSection;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  isDark: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const ORBIT_RADIUS = 1.62;

const OrbitalNodeMesh: React.FC<OrbitalNodeProps> = ({
  section,
  isActive,
  isHovered,
  isDark,
  onSelect,
  onHover,
}) => {
  const nodeGroupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);

  // Compute 3D spherical coordinates on the orbital shell
  const position = useMemo(() => {
    const x =
      ORBIT_RADIUS *
      Math.sin(section.orbitPhi) *
      Math.cos(section.orbitTheta);
    const y = ORBIT_RADIUS * Math.cos(section.orbitPhi);
    const z =
      ORBIT_RADIUS *
      Math.sin(section.orbitPhi) *
      Math.sin(section.orbitTheta);
    return new THREE.Vector3(x, y, z);
  }, [section.orbitPhi, section.orbitTheta]);

  // Midpoint and orientation for the radial tether spoke connecting core -> node
  const tetherTransform = useMemo(() => {
    const mid = position.clone().multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      position.clone().normalize()
    );
    return { mid, quat, length: position.length() };
  }, [position]);

  useFrame((_, delta) => {
    if (!nodeGroupRef.current || !ringRef.current || !coreMeshRef.current) {
      return;
    }

    const targetScale = isActive ? 1.48 : isHovered ? 1.3 : 1.0;
    const currentScale = nodeGroupRef.current.scale.x;
    const nextScale = THREE.MathUtils.damp(
      currentScale,
      targetScale,
      10,
      delta
    );
    nodeGroupRef.current.scale.setScalar(nextScale);

    ringRef.current.rotation.z += delta * (isActive ? 2.2 : 0.7);
    ringRef.current.rotation.x += delta * (isActive ? 1.4 : 0.4);
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
    onHover(section.id);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    onHover(null);
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(section.id);
  };

  const nodeColor = isActive
    ? isDark
      ? '#FFFFFF'
      : '#1E3A5F'
    : isHovered
      ? '#89AACC'
      : isDark
        ? '#6488AD'
        : '#4E85BF';

  const emissiveColor = isActive
    ? '#89AACC'
    : isHovered
      ? '#4E85BF'
      : '#1E293B';

  const emissiveIntensity = isActive ? 1.35 : isHovered ? 0.85 : 0.2;

  return (
    <group>
      {/* Radial Tether Beam from Sphere Core to Orbital Node */}
      <mesh
        position={tetherTransform.mid}
        quaternion={tetherTransform.quat}
      >
        <cylinderGeometry
          args={[0.008, 0.008, tetherTransform.length, 6]}
        />
        <meshBasicMaterial
          color={isActive || isHovered ? '#89AACC' : '#4E85BF'}
          transparent
          opacity={isActive ? 0.65 : isHovered ? 0.45 : 0.16}
        />
      </mesh>

      {/* Interactive Orbital Satellite Node */}
      <group
        ref={nodeGroupRef}
        position={position}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Invisible Larger Hit Sphere for Easy Clicking */}
        <mesh>
          <sphereGeometry args={[0.28, 12, 12]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Primary Node Core Sphere */}
        <mesh ref={coreMeshRef}>
          <sphereGeometry args={[0.115, 24, 24]} />
          <meshPhysicalMaterial
            color={nodeColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            metalness={0.75}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Secondary Equatorial Gimbal Ring around Node */}
        <mesh ref={ringRef}>
          <torusGeometry args={[0.19, 0.014, 12, 36]} />
          <meshStandardMaterial
            color={isActive ? '#89AACC' : '#4E85BF'}
            emissive={isActive ? '#89AACC' : '#000000'}
            emissiveIntensity={isActive ? 0.9 : 0}
            metalness={0.85}
            roughness={0.2}
            transparent
            opacity={isActive ? 0.95 : isHovered ? 0.75 : 0.35}
          />
        </mesh>
      </group>
    </group>
  );
};

interface SphereAssemblyProps {
  activeSectionId: string;
  hoveredSectionId: string | null;
  scrollProgress: number;
  isDark: boolean;
  onSelectSection: (id: string) => void;
  onHoverSection: (id: string | null) => void;
}

const SphereAssembly: React.FC<SphereAssemblyProps> = ({
  activeSectionId,
  hoveredSectionId,
  scrollProgress,
  isDark,
  onSelectSection,
  onHoverSection,
}) => {
  const rootGroupRef = useRef<THREE.Group>(null);
  const coreMeshRef = useRef<THREE.Mesh>(null);
  const wireShellRef = useRef<THREE.Mesh>(null);
  const gimbal1Ref = useRef<THREE.Mesh>(null);
  const gimbal2Ref = useRef<THREE.Mesh>(null);

  const activeIndex = useMemo(() => {
    const idx = PORTFOLIO_SECTIONS.findIndex((s) => s.id === activeSectionId);
    return idx >= 0 ? idx : 0;
  }, [activeSectionId]);

  useFrame((state, delta) => {
    if (!rootGroupRef.current) return;

    const activeSec = PORTFOLIO_SECTIONS[activeIndex];
    // Orient the sphere so the active section's orbital node faces toward the viewer (+Z)
    const targetRotY =
      -activeSec.orbitTheta +
      Math.PI * 0.5 +
      state.pointer.x * 0.35 +
      scrollProgress * 0.35;
    const targetRotX =
      (activeSec.orbitPhi - Math.PI * 0.5) * 0.45 - state.pointer.y * 0.25;

    rootGroupRef.current.rotation.y = THREE.MathUtils.damp(
      rootGroupRef.current.rotation.y,
      targetRotY,
      5.5,
      delta
    );
    rootGroupRef.current.rotation.x = THREE.MathUtils.damp(
      rootGroupRef.current.rotation.x,
      targetRotX,
      5.5,
      delta
    );

    if (coreMeshRef.current) {
      coreMeshRef.current.rotation.y += delta * 0.35;
      coreMeshRef.current.rotation.x += delta * 0.2;
    }
    if (wireShellRef.current) {
      wireShellRef.current.rotation.y -= delta * 0.18;
    }
    if (gimbal1Ref.current) {
      gimbal1Ref.current.rotation.z += delta * 0.28;
    }
    if (gimbal2Ref.current) {
      gimbal2Ref.current.rotation.x -= delta * 0.22;
    }
  });

  return (
    <group ref={rootGroupRef}>
      {/* 1. Primary Silhouette: Faceted Astrolabe Core */}
      <mesh ref={coreMeshRef}>
        <icosahedronGeometry args={[0.56, 1]} />
        <meshPhysicalMaterial
          color={isDark ? '#162032' : '#D8E6F5'}
          metalness={0.9}
          roughness={0.2}
          clearcoat={0.9}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* 2. Secondary Read: Geodesic Wireframe Lattice Sphere */}
      <mesh ref={wireShellRef}>
        <icosahedronGeometry args={[0.98, 2]} />
        <meshBasicMaterial
          color="#89AACC"
          wireframe
          transparent
          opacity={isDark ? 0.16 : 0.24}
        />
      </mesh>

      {/* 3. Accent Detail: Inner & Outer Gyroscopic Gimbal Rings */}
      <mesh ref={gimbal1Ref} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.28, 0.012, 16, 100]} />
        <meshStandardMaterial
          color="#89AACC"
          metalness={0.85}
          roughness={0.2}
          transparent
          opacity={0.45}
        />
      </mesh>

      <mesh ref={gimbal2Ref} rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <torusGeometry args={[1.62, 0.01, 16, 100]} />
        <meshStandardMaterial
          color="#4E85BF"
          metalness={0.8}
          roughness={0.25}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* 4. Interactive Orbital Section Nodes */}
      {PORTFOLIO_SECTIONS.map((section, idx) => (
        <OrbitalNodeMesh
          key={section.id}
          section={section}
          index={idx}
          isActive={activeSectionId === section.id}
          isHovered={hoveredSectionId === section.id}
          isDark={isDark}
          onSelect={onSelectSection}
          onHover={onHoverSection}
        />
      ))}
    </group>
  );
};

export const NavigationSphere3D: React.FC<NavigationSphere3DProps> = ({
  isDark = true,
}) => {
  const [activeSectionId, setActiveSectionId] = useState<string>('home');
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Track scroll position to highlight active orbital node
  useEffect(() => {
    const handleScroll = () => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 0;
      setScrollProgress(pct);

      const triggerOffset = window.scrollY + window.innerHeight * 0.36;
      let currentId = 'home';

      for (const sec of PORTFOLIO_SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          if (triggerOffset >= top) {
            currentId = sec.id;
          }
        }
      }
      setActiveSectionId(currentId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jumpToSection = (id: string) => {
    setActiveSectionId(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      el.focus({ preventScroll: true });
    }
  };

  const displayedSection =
    PORTFOLIO_SECTIONS.find((s) => s.id === (hoveredSectionId || activeSectionId)) ||
    PORTFOLIO_SECTIONS[0];

  return (
    <aside
      aria-label="3D Orbital Section Navigation"
      className="fixed right-3 lg:right-5 top-1/2 -translate-y-1/2 z-40 hidden md:flex items-center gap-2.5 select-none pointer-events-none"
    >
      {/* Floating Section Telemetry Readout & Node Quick-Jump Strip */}
      {!isCollapsed && (
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          {/* Active / Hovered Node Readout Pill */}
          <div className="rounded-2xl bg-surface border border-stroke px-3.5 py-2 shadow-xl text-right transition-colors">
            <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#89AACC]">
              <Compass className="w-3 h-3" />
              <span>NODE {displayedSection.code}</span>
              <span>·</span>
              <span>{Math.round(scrollProgress * 100)}%</span>
            </div>
            <div className="text-sm font-display italic text-text-primary leading-tight mt-0.5">
              {displayedSection.label}
            </div>
          </div>

          {/* 3D WebGL Orbital Sphere Container (Dedicated ref-clean wrapper, no backdrop-filter over canvas) */}
          <div className="relative w-[136px] h-[136px] lg:w-[152px] lg:h-[152px] rounded-3xl bg-surface border border-stroke shadow-2xl overflow-hidden flex items-center justify-center">
            <Canvas
              camera={{ position: [0, 0, 4.35], fov: 42 }}
              dpr={[1, 2]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
              }}
            >
              <StudioEnvironment />
              <hemisphereLight
                args={['#B8D4F2', '#0F172A', isDark ? 1.1 : 1.4]}
              />
              <directionalLight position={[4, 5, 4]} intensity={2.2} color="#89AACC" />
              <directionalLight position={[-4, -3, 2]} intensity={1.2} color="#4E85BF" />

              <SphereAssembly
                activeSectionId={activeSectionId}
                hoveredSectionId={hoveredSectionId}
                scrollProgress={scrollProgress}
                isDark={isDark}
                onSelectSection={jumpToSection}
                onHoverSection={setHoveredSectionId}
              />
            </Canvas>

            {/* Subtle Corner Label */}
            <span className="pointer-events-none absolute bottom-2 inset-x-0 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
              Click 3D Nodes
            </span>
          </div>

          {/* Synchronized Accessible Keyboard Node Buttons */}
          <div
            role="group"
            aria-label="Quick jump to portfolio sections"
            className="flex flex-col items-end gap-1 rounded-2xl bg-surface border border-stroke p-1.5 shadow-lg"
          >
            {PORTFOLIO_SECTIONS.map((sec) => {
              const isCurrent = activeSectionId === sec.id;
              const isHover = hoveredSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => jumpToSection(sec.id)}
                  onMouseEnter={() => setHoveredSectionId(sec.id)}
                  onMouseLeave={() => setHoveredSectionId(null)}
                  onFocus={() => setHoveredSectionId(sec.id)}
                  onBlur={() => setHoveredSectionId(null)}
                  aria-label={`Jump to ${sec.code} ${sec.label}`}
                  aria-current={isCurrent ? 'location' : undefined}
                  className={`group flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-mono transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-text-primary text-bg font-medium'
                      : isHover
                        ? 'bg-stroke/70 text-text-primary'
                        : 'text-muted hover:text-text-primary'
                  }`}
                >
                  <span>{sec.code}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      isCurrent
                        ? 'bg-[#89AACC]'
                        : 'bg-stroke group-hover:bg-[#89AACC]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Collapse / Expand Toggle Button */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        aria-expanded={!isCollapsed}
        aria-label={
          isCollapsed
            ? 'Expand 3D Navigation Sphere'
            : 'Collapse 3D Navigation Sphere'
        }
        title={
          isCollapsed
            ? 'Expand 3D Navigation Sphere'
            : 'Minimize 3D Navigation Sphere'
        }
        className="pointer-events-auto w-8 h-12 rounded-full bg-surface border border-stroke hover:border-[#89AACC] flex items-center justify-center text-muted hover:text-text-primary shadow-xl transition-colors cursor-pointer"
      >
        {isCollapsed ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
};

export default NavigationSphere3D;
