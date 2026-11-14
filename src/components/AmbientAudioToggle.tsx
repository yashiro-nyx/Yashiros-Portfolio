import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Waves,
  Radio,
  Activity,
  X,
} from 'lucide-react';
import { Magnetic } from './Magnetic';
import { lenisScrollState } from './SmoothScrollProvider';

export interface SectionAcousticProfile {
  id: string;
  number: string;
  name: string;
  mood: string;
  chordName: string;
  // 5-voice frequencies for harmonic pad + shimmer
  frequencies: [number, number, number, number, number];
  // Target relative weights [subDrone, harmonicPad, crystalShimmer, spatialPulse] (0..1)
  layerWeights: [number, number, number, number];
  filterCutoff: number;
  chimeFreq: number;
}

export const SECTION_ACOUSTIC_PROFILES: Record<string, SectionAcousticProfile> = {
  home: {
    id: 'home',
    number: '00',
    name: 'Hero Galaxy',
    mood: 'Deep Cosmic & Expansive',
    chordName: 'Amaj9',
    frequencies: [110.0, 164.81, 207.65, 246.94, 329.63],
    layerWeights: [0.85, 0.78, 0.65, 0.55],
    filterCutoff: 520,
    chimeFreq: 659.25,
  },
  work: {
    id: 'work',
    number: '01',
    name: 'Selected Works',
    mood: 'Focused Editorial Depth',
    chordName: 'F#m11',
    frequencies: [92.5, 138.59, 185.0, 220.0, 277.18],
    layerWeights: [0.72, 0.88, 0.48, 0.82],
    filterCutoff: 460,
    chimeFreq: 554.37,
  },
  'tech-stack': {
    id: 'tech-stack',
    number: '02',
    name: 'Tech Stack',
    mood: 'Crystalline & Precision',
    chordName: 'Dmaj9(#11)',
    frequencies: [146.83, 185.0, 220.0, 277.18, 369.99],
    layerWeights: [0.55, 0.74, 0.92, 0.78],
    filterCutoff: 740,
    chimeFreq: 739.99,
  },
  expertise: {
    id: 'expertise',
    number: '03',
    name: 'Expertise',
    mood: 'Warm Tactile Balance',
    chordName: 'Bm9',
    frequencies: [123.47, 146.83, 185.0, 220.0, 277.18],
    layerWeights: [0.68, 0.85, 0.52, 0.64],
    filterCutoff: 490,
    chimeFreq: 587.33,
  },
  about: {
    id: 'about',
    number: '04',
    name: 'Highlights & Bio',
    mood: 'Reflective & Grounded',
    chordName: 'Gmaj9',
    frequencies: [98.0, 146.83, 185.0, 220.0, 293.66],
    layerWeights: [0.78, 0.9, 0.45, 0.58],
    filterCutoff: 430,
    chimeFreq: 587.33,
  },
  explorations: {
    id: 'explorations',
    number: '05',
    name: 'Event Gallery',
    mood: 'Starlit Parallax & Ethereal',
    chordName: 'Em11',
    frequencies: [82.41, 123.47, 164.81, 196.0, 246.94],
    layerWeights: [0.92, 0.86, 0.96, 0.95],
    filterCutoff: 860,
    chimeFreq: 659.25,
  },
  credentials: {
    id: 'credentials',
    number: '06',
    name: 'Credentials',
    mood: 'Radiant Clarity',
    chordName: 'Asus2/C#',
    frequencies: [138.59, 164.81, 220.0, 246.94, 329.63],
    layerWeights: [0.6, 0.82, 0.75, 0.68],
    filterCutoff: 620,
    chimeFreq: 659.25,
  },
  contact: {
    id: 'contact',
    number: '07',
    name: 'Connect & Footer',
    mood: 'Horizon Resolution',
    chordName: 'Amaj9',
    frequencies: [110.0, 164.81, 220.0, 277.18, 329.63],
    layerWeights: [0.9, 0.84, 0.7, 0.6],
    filterCutoff: 540,
    chimeFreq: 880.0,
  },
};

export interface LayerState {
  id: 'sub' | 'pad' | 'shimmer' | 'spatial';
  label: string;
  description: string;
  userVolume: number; // 0..1 user multiplier
  muted: boolean;
  liveActivity: number; // 0..1 computed real-time level from scroll + section
}

export interface SoundscapeSnapshot {
  isPlaying: boolean;
  masterVolume: number; // 0..1
  chimeEnabled: boolean;
  activeSectionId: string;
  scrollProgress: number; // 0..1
  pan: number; // -1..1
  layers: LayerState[];
}

class MultiLayerSoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private mainFilter: BiquadFilterNode | null = null;
  private stereoPanner: StereoPannerNode | null = null;

  // 4 distinct stem GainNodes so each layer's volume adjusts independently
  private subLayerGain: GainNode | null = null;
  private padLayerGain: GainNode | null = null;
  private shimmerLayerGain: GainNode | null = null;
  private spatialLayerGain: GainNode | null = null;

  private subOscillators: OscillatorNode[] = [];
  private padOscillators: OscillatorNode[] = [];
  private shimmerOscillators: OscillatorNode[] = [];
  private spatialOscillators: OscillatorNode[] = [];

  private isPlaying = false;
  private masterVolume = 0.75;
  private chimeEnabled = true;
  private activeSectionId = 'home';
  private scrollProgress = 0;
  private currentPan = 0;

  private layers: LayerState[] = [
    {
      id: 'sub',
      label: 'Sub-Bass Drone',
      description: 'Deep harmonic foundation anchored to Hero & 3D sections',
      userVolume: 0.85,
      muted: false,
      liveActivity: 0.85,
    },
    {
      id: 'pad',
      label: 'Warm Analog Pad',
      description: 'Section-adaptive chord voicings that morph on section entry',
      userVolume: 0.9,
      muted: false,
      liveActivity: 0.78,
    },
    {
      id: 'shimmer',
      label: 'Crystal Shimmer',
      description: 'High-air overtones reactive to scroll velocity & Tech/3D',
      userVolume: 0.75,
      muted: false,
      liveActivity: 0.65,
    },
    {
      id: 'spatial',
      label: 'Spatial Pulse',
      description: 'Stereo-panned harmonic motion across viewport depth',
      userVolume: 0.8,
      muted: false,
      liveActivity: 0.55,
    },
  ];

  private listeners = new Set<() => void>();

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getSnapshot(): SoundscapeSnapshot {
    return {
      isPlaying: this.isPlaying,
      masterVolume: this.masterVolume,
      chimeEnabled: this.chimeEnabled,
      activeSectionId: this.activeSectionId,
      scrollProgress: this.scrollProgress,
      pan: this.currentPan,
      layers: this.layers.map((l) => ({ ...l })),
    };
  }

  public toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  }

  public setMasterVolume(val: number) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.isPlaying && this.ctx && this.masterGain) {
      const targetGain = 0.0001 + this.masterVolume * 0.075;
      this.masterGain.gain.setTargetAtTime(
        targetGain,
        this.ctx.currentTime,
        0.08
      );
    }
    this.notify();
  }

  public setChimeEnabled(enabled: boolean) {
    this.chimeEnabled = enabled;
    this.notify();
  }

  public setLayerVolume(id: LayerState['id'], val: number) {
    const layer = this.layers.find((l) => l.id === id);
    if (!layer) return;
    layer.userVolume = Math.max(0, Math.min(1, val));
    if (layer.userVolume > 0 && layer.muted) {
      layer.muted = false;
    }
    this.applyCurrentProfile(0);
    this.notify();
  }

  public toggleLayerMute(id: LayerState['id']) {
    const layer = this.layers.find((l) => l.id === id);
    if (!layer) return;
    layer.muted = !layer.muted;
    this.applyCurrentProfile(0);
    this.notify();
  }

  public start() {
    if (this.isPlaying) return;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const profile =
      SECTION_ACOUSTIC_PROFILES[this.activeSectionId] ||
      SECTION_ACOUSTIC_PROFILES.home;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, this.masterVolume * 0.065),
      now + 1.2
    );

    this.mainFilter = this.ctx.createBiquadFilter();
    this.mainFilter.type = 'lowpass';
    this.mainFilter.frequency.setValueAtTime(profile.filterCutoff, now);
    this.mainFilter.Q.setValueAtTime(1.15, now);

    this.stereoPanner = this.ctx.createStereoPanner();
    this.stereoPanner.pan.setValueAtTime(0, now);

    // Connect master chain
    this.mainFilter.connect(this.stereoPanner);
    this.stereoPanner.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    // Create 4 stem gain nodes
    this.subLayerGain = this.ctx.createGain();
    this.padLayerGain = this.ctx.createGain();
    this.shimmerLayerGain = this.ctx.createGain();
    this.spatialLayerGain = this.ctx.createGain();

    this.subLayerGain.connect(this.mainFilter);
    this.padLayerGain.connect(this.mainFilter);
    this.shimmerLayerGain.connect(this.mainFilter);
    this.spatialLayerGain.connect(this.mainFilter);

    // 1. Sub-Bass Drone Oscillators (Root & fifth in low register)
    this.subOscillators = [
      profile.frequencies[0] * 0.5,
      profile.frequencies[0],
    ].map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(idx === 0 ? 0.28 : 0.18, now);
      osc.connect(g);
      g.connect(this.subLayerGain!);
      osc.start(now);
      return osc;
    });

    // 2. Warm Analog Pad Oscillators (3 core chord voices)
    this.padOscillators = profile.frequencies.slice(0, 3).map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx - 1) * 5, now);
      g.gain.setValueAtTime(0.16 / (idx * 0.35 + 1), now);
      osc.connect(g);
      g.connect(this.padLayerGain!);
      osc.start(now);
      return osc;
    });

    // 3. Crystal Shimmer Oscillators (Upper extensions + octave air)
    this.shimmerOscillators = [
      profile.frequencies[3],
      profile.frequencies[4],
      profile.frequencies[4] * 2,
    ].map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime((idx + 1) * 6.5, now);
      g.gain.setValueAtTime(idx === 2 ? 0.045 : 0.09, now);
      osc.connect(g);
      g.connect(this.shimmerLayerGain!);
      osc.start(now);
      return osc;
    });

    // 4. Spatial Pulse Oscillators (Binaural detuned pair)
    this.spatialOscillators = [
      profile.frequencies[1] * 2,
      profile.frequencies[2] * 2,
    ].map((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(idx === 0 ? -9 : 9, now);
      g.gain.setValueAtTime(0.065, now);
      osc.connect(g);
      g.connect(this.spatialLayerGain!);
      osc.start(now);
      return osc;
    });

    this.isPlaying = true;
    this.applyCurrentProfile(0);
    this.notify();
  }

  public stop() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(
      Math.max(this.masterGain.gain.value, 0.001),
      now
    );
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    const allOscs = [
      ...this.subOscillators,
      ...this.padOscillators,
      ...this.shimmerOscillators,
      ...this.spatialOscillators,
    ];
    this.subOscillators = [];
    this.padOscillators = [];
    this.shimmerOscillators = [];
    this.spatialOscillators = [];
    this.isPlaying = false;
    this.notify();

    window.setTimeout(() => {
      allOscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Ignore already stopped oscillators
        }
      });
    }, 480);
  }

  public onSectionEnter(sectionId: string) {
    if (!SECTION_ACOUSTIC_PROFILES[sectionId]) return;
    const prevId = this.activeSectionId;
    if (prevId === sectionId) return;

    this.activeSectionId = sectionId;
    const profile = SECTION_ACOUSTIC_PROFILES[sectionId];

    // Morph oscillator frequencies & layer weights smoothly when entering a new section
    if (this.isPlaying && this.ctx) {
      const now = this.ctx.currentTime;

      // Retune Sub
      if (this.subOscillators.length === 2) {
        this.subOscillators[0].frequency.setTargetAtTime(
          profile.frequencies[0] * 0.5,
          now,
          0.65
        );
        this.subOscillators[1].frequency.setTargetAtTime(
          profile.frequencies[0],
          now,
          0.65
        );
      }

      // Retune Pad
      this.padOscillators.forEach((osc, idx) => {
        if (profile.frequencies[idx]) {
          osc.frequency.setTargetAtTime(profile.frequencies[idx], now, 0.75);
        }
      });

      // Retune Shimmer
      const shimmerTargets = [
        profile.frequencies[3],
        profile.frequencies[4],
        profile.frequencies[4] * 2,
      ];
      this.shimmerOscillators.forEach((osc, idx) => {
        if (shimmerTargets[idx]) {
          osc.frequency.setTargetAtTime(shimmerTargets[idx], now, 0.75);
        }
      });

      // Retune Spatial
      const spatialTargets = [
        profile.frequencies[1] * 2,
        profile.frequencies[2] * 2,
      ];
      this.spatialOscillators.forEach((osc, idx) => {
        if (spatialTargets[idx]) {
          osc.frequency.setTargetAtTime(spatialTargets[idx], now, 0.75);
        }
      });

      // Trigger subtle Section-Entry Harmonic Chime
      if (this.chimeEnabled) {
        this.triggerSectionChime(profile.chimeFreq);
      }
    }

    this.applyCurrentProfile(Math.abs(lenisScrollState.velocity));
    this.notify();
  }

  private triggerSectionChime(freq: number) {
    if (!this.ctx || !this.masterGain || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.004, now + 1.4);

    chimeGain.gain.setValueAtTime(0.0001, now);
    chimeGain.gain.linearRampToValueAtTime(0.055, now + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);

    osc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.7);
  }

  private applyCurrentProfile(scrollSpeed: number) {
    const profile =
      SECTION_ACOUSTIC_PROFILES[this.activeSectionId] ||
      SECTION_ACOUSTIC_PROFILES.home;
    const speedFactor = Math.min(scrollSpeed / 38, 1);

    // Compute live activity for each of the 4 layers based on section profile + scroll position + velocity
    const depthWave = Math.sin(this.scrollProgress * Math.PI * 2) * 0.08;

    const targetActivities: [number, number, number, number] = [
      Math.max(
        0.1,
        Math.min(1, profile.layerWeights[0] + depthWave * 0.5)
      ),
      Math.max(
        0.1,
        Math.min(1, profile.layerWeights[1] + speedFactor * 0.12)
      ),
      Math.max(
        0.1,
        Math.min(1, profile.layerWeights[2] + speedFactor * 0.28)
      ),
      Math.max(
        0.1,
        Math.min(1, profile.layerWeights[3] + Math.abs(this.currentPan) * 0.25)
      ),
    ];

    this.layers.forEach((layer, idx) => {
      const effective = layer.muted
        ? 0
        : targetActivities[idx] * layer.userVolume;
      layer.liveActivity = Number(effective.toFixed(2));
    });

    if (!this.isPlaying || !this.ctx) return;

    const now = this.ctx.currentTime;
    const gainNodes = [
      this.subLayerGain,
      this.padLayerGain,
      this.shimmerLayerGain,
      this.spatialLayerGain,
    ];

    this.layers.forEach((layer, idx) => {
      const node = gainNodes[idx];
      if (!node) return;
      const targetVal = layer.muted
        ? 0.0001
        : Math.max(0.0001, layer.liveActivity);
      node.gain.setTargetAtTime(targetVal, now, 0.22);
    });

    if (this.mainFilter) {
      const dynamicCutoff = profile.filterCutoff + speedFactor * 480;
      this.mainFilter.frequency.setTargetAtTime(dynamicCutoff, now, 0.2);
    }

    if (this.masterGain) {
      const baseMaster = 0.0001 + this.masterVolume * 0.065;
      const velocityBoost = speedFactor * 0.022 * this.masterVolume;
      this.masterGain.gain.setTargetAtTime(
        baseMaster + velocityBoost,
        now,
        0.18
      );
    }
  }

  public updateFromScroll(scrollY: number, scrollVelocity: number) {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress =
      docHeight > 0 ? Math.max(0, Math.min(1, scrollY / docHeight)) : 0;

    // Smooth stereo pan (-0.72 Left to +0.72 Right) as user scrolls through sections
    const targetPan = Math.sin(scrollY * 0.0026) * 0.72;
    this.currentPan = targetPan;

    if (this.isPlaying && this.ctx && this.stereoPanner) {
      this.stereoPanner.pan.setTargetAtTime(
        targetPan,
        this.ctx.currentTime,
        0.14
      );
    }

    this.applyCurrentProfile(Math.abs(scrollVelocity));
    this.notify();
  }
}

export const soundscapeEngine = new MultiLayerSoundscapeEngine();

let observersInitialized = false;
let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;

function ensureSoundscapeObservers() {
  if (observersInitialized || typeof window === 'undefined') return;
  observersInitialized = true;

  // 1. Scroll position & velocity listener
  window.addEventListener(
    'scroll',
    () => {
      const currentY = window.scrollY;
      const velocity =
        lenisScrollState.velocity !== 0
          ? lenisScrollState.velocity
          : currentY - lastScrollY;
      lastScrollY = currentY;
      soundscapeEngine.updateFromScroll(currentY, velocity);
    },
    { passive: true }
  );

  // 2. Section Entry IntersectionObserver for all 8 portfolio sections
  const attachSectionObservers = () => {
    const sectionIds = Object.keys(SECTION_ACOUSTIC_PROFILES);
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with highest intersection ratio
        let bestEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio)
          ) {
            bestEntry = entry;
          }
        }
        if (bestEntry && bestEntry.target.id) {
          soundscapeEngine.onSectionEnter(bestEntry.target.id);
        }
      },
      {
        rootMargin: '-25% 0px -35% 0px',
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  };

  if (document.readyState === 'complete') {
    window.setTimeout(attachSectionObservers, 300);
  } else {
    window.addEventListener('load', () =>
      window.setTimeout(attachSectionObservers, 300)
    );
  }
}

interface AmbientAudioToggleProps {
  compact?: boolean;
  popoverDirection?: 'up' | 'down';
}

export const AmbientAudioToggle: React.FC<AmbientAudioToggleProps> = ({
  compact = false,
  popoverDirection = 'down',
}) => {
  const [snapshot, setSnapshot] = useState<SoundscapeSnapshot>(
    soundscapeEngine.getSnapshot()
  );
  const [isMixerOpen, setIsMixerOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureSoundscapeObservers();
    return soundscapeEngine.subscribe(() => {
      setSnapshot(soundscapeEngine.getSnapshot());
    });
  }, []);

  // Close mixer popover on Escape or outside click
  useEffect(() => {
    if (!isMixerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMixerOpen(false);
      }
    };
    const handlePointerDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsMixerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isMixerOpen]);

  const activeProfile =
    SECTION_ACOUSTIC_PROFILES[snapshot.activeSectionId] ||
    SECTION_ACOUSTIC_PROFILES.home;

  const panLabel =
    snapshot.pan < -0.15
      ? `L ${Math.abs(Math.round(snapshot.pan * 100))}%`
      : snapshot.pan > 0.15
      ? `R ${Math.round(snapshot.pan * 100)}%`
      : 'CENTER';

  const getLayerIcon = (id: LayerState['id']) => {
    switch (id) {
      case 'sub':
        return <Waves className="w-3.5 h-3.5 text-[#89AACC]" />;
      case 'pad':
        return <Radio className="w-3.5 h-3.5 text-[#89AACC]" />;
      case 'shimmer':
        return <Sparkles className="w-3.5 h-3.5 text-[#89AACC]" />;
      case 'spatial':
        return <Activity className="w-3.5 h-3.5 text-[#89AACC]" />;
    }
  };

  const popoverPosClass =
    popoverDirection === 'up'
      ? 'right-0 bottom-full mb-3'
      : 'right-0 top-full mt-3';

  return (
    <div
      ref={containerRef}
      className="relative z-50 inline-flex items-center gap-1.5"
    >
      {/* Main Play/Mute Button */}
      <Magnetic strength={0.3}>
        <button
          type="button"
          onClick={() => soundscapeEngine.toggle()}
          aria-pressed={snapshot.isPlaying}
          title="Toggle multi-layered scroll-reactive ambient soundscape"
          className={`group inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs transition-all duration-300 cursor-pointer whitespace-nowrap ${
            snapshot.isPlaying
              ? 'bg-surface border-[#89AACC] text-text-primary shadow-lg shadow-[#89AACC]/15'
              : 'bg-surface border-stroke text-muted hover:text-text-primary hover:border-[#89AACC]/60'
          }`}
        >
          {snapshot.isPlaying ? (
            <Volume2 className="w-3.5 h-3.5 text-[#89AACC] shrink-0 animate-pulse" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-muted group-hover:text-text-primary shrink-0" />
          )}

          <span className="truncate">
            {compact ? (
              snapshot.isPlaying ? (
                <>
                  <span className="hidden sm:inline">Soundscape · </span>
                  <span>{activeProfile.chordName}</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Sound</span>
                  <span className="hidden sm:inline">Ambient Soundscape</span>
                </>
              )
            ) : snapshot.isPlaying ? (
              `Soundscape: ${activeProfile.name} (${activeProfile.chordName})`
            ) : (
              'Multi-Layer Soundscape'
            )}
          </span>

          {/* Mini 4-Bar Layer Visualizer when playing */}
          {snapshot.isPlaying && (
            <span
              aria-hidden="true"
              className="inline-flex items-end gap-0.5 h-3 border-l border-stroke pl-2"
            >
              {snapshot.layers.map((layer) => (
                <span
                  key={layer.id}
                  style={{
                    height: `${Math.max(22, Math.round(layer.liveActivity * 100))}%`,
                  }}
                  className="w-0.5 bg-[#89AACC] rounded-full transition-all duration-150"
                />
              ))}
            </span>
          )}
        </button>
      </Magnetic>

      {/* Multi-Layer Soundscape Controller Popover Trigger */}
      <Magnetic strength={0.28}>
        <button
          type="button"
          onClick={() => setIsMixerOpen((prev) => !prev)}
          aria-expanded={isMixerOpen}
          aria-label="Open multi-layer ambient soundscape mixer"
          title="Configure Multi-Layer Soundscape Channels & Section Mix"
          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
            isMixerOpen
              ? 'bg-text-primary text-bg border-text-primary'
              : 'bg-surface border-stroke text-muted hover:text-text-primary hover:border-[#89AACC]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </Magnetic>

      {/* Multi-Layer Soundscape Mixer Popover */}
      <AnimatePresence>
        {isMixerOpen && (
          <motion.div
            role="dialog"
            aria-label="Multi-Layer Ambient Soundscape Controller"
            initial={{
              opacity: 0,
              y: popoverDirection === 'up' ? -10 : 10,
              scale: 0.96,
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: popoverDirection === 'up' ? -10 : 10,
              scale: 0.96,
            }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute ${popoverPosClass} z-[110] w-[320px] sm:w-[360px] rounded-3xl bg-surface/95 backdrop-blur-xl border border-stroke p-5 text-left shadow-[0_24px_64px_rgba(0,0,0,0.28)]`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-stroke">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#89AACC] block">
                  Multi-Layer Soundscape Controller
                </span>
                <h4 className="text-lg font-display italic text-text-primary">
                  {activeProfile.number} · {activeProfile.name} ({activeProfile.chordName})
                </h4>
                <p className="text-[11px] text-muted">{activeProfile.mood}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMixerOpen(false)}
                aria-label="Close soundscape mixer"
                className="w-7 h-7 rounded-full bg-bg border border-stroke flex items-center justify-center text-muted hover:text-text-primary cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Master Power & Volume */}
            <div className="py-3.5 border-b border-stroke space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => soundscapeEngine.toggle()}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    snapshot.isPlaying
                      ? 'bg-[#89AACC] text-[#0a0a0a]'
                      : 'bg-bg border border-stroke text-text-primary hover:border-[#89AACC]'
                  }`}
                >
                  {snapshot.isPlaying ? 'Soundscape Active' : 'Start Soundscape'}
                </button>

                <div className="font-mono text-[10px] text-muted flex items-center gap-2">
                  <span>Pan: {panLabel}</span>
                  <span>·</span>
                  <span>Depth: {Math.round(snapshot.scrollProgress * 100)}%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1">
                  <label htmlFor="master-soundscape-vol">Master Level</label>
                  <span className="text-text-primary tabular-nums">
                    {Math.round(snapshot.masterVolume * 100)}%
                  </span>
                </div>
                <input
                  id="master-soundscape-vol"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(snapshot.masterVolume * 100)}
                  onChange={(e) =>
                    soundscapeEngine.setMasterVolume(
                      Number(e.target.value) / 100
                    )
                  }
                  className="w-full accent-[#89AACC] cursor-pointer h-1.5 bg-bg rounded-lg"
                />
              </div>
            </div>

            {/* 4 Individual Scroll & Section-Reactive Stem Layers */}
            <div className="py-3.5 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-muted">
                <span>Scroll-Reactive Stem Layers</span>
                <span className="text-[#89AACC]">Auto-Mix + Manual</span>
              </div>

              {snapshot.layers.map((layer) => (
                <div
                  key={layer.id}
                  className="rounded-2xl bg-bg/80 border border-stroke p-3 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => soundscapeEngine.toggleLayerMute(layer.id)}
                      className="inline-flex items-center gap-2 text-xs font-medium text-text-primary hover:text-[#89AACC] transition-colors cursor-pointer"
                    >
                      {getLayerIcon(layer.id)}
                      <span className={layer.muted ? 'line-through text-muted' : ''}>
                        {layer.label}
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#89AACC] tabular-nums">
                        {layer.muted
                          ? 'MUTED'
                          : `${Math.round(layer.liveActivity * 100)}%`}
                      </span>
                      <button
                        type="button"
                        onClick={() => soundscapeEngine.toggleLayerMute(layer.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                          layer.muted
                            ? 'border-rose-500/50 text-rose-400 bg-rose-500/10'
                            : 'border-stroke text-muted hover:text-text-primary'
                        }`}
                      >
                        {layer.muted ? 'Unmute' : 'Mute'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-muted leading-snug">
                    {layer.description}
                  </p>

                  {/* Live Activity Meter + User Trim Slider */}
                  <div className="flex items-center gap-2.5">
                    <input
                      type="range"
                      aria-label={`${layer.label} volume trim`}
                      min={0}
                      max={100}
                      value={Math.round(layer.userVolume * 100)}
                      onChange={(e) =>
                        soundscapeEngine.setLayerVolume(
                          layer.id,
                          Number(e.target.value) / 100
                        )
                      }
                      className="w-full accent-[#89AACC] cursor-pointer h-1 bg-surface rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section Entry Harmonic Chime Toggle */}
            <div className="pt-3 border-t border-stroke flex items-center justify-between text-xs">
              <span className="text-muted text-[11px]">
                Section-entry harmonic chime
              </span>
              <button
                type="button"
                aria-pressed={snapshot.chimeEnabled}
                onClick={() =>
                  soundscapeEngine.setChimeEnabled(!snapshot.chimeEnabled)
                }
                className={`px-3 py-1 rounded-full font-mono text-[10px] border transition-colors cursor-pointer ${
                  snapshot.chimeEnabled
                    ? 'bg-[#89AACC]/20 border-[#89AACC] text-[#89AACC]'
                    : 'bg-bg border-stroke text-muted'
                }`}
              >
                {snapshot.chimeEnabled ? 'Chime: ON' : 'Chime: OFF'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FloatingSoundscapeDock: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Ambient Soundscape Controller Dock"
      className="fixed bottom-4 right-4 z-[95] pointer-events-auto"
    >
      <AmbientAudioToggle compact popoverDirection="up" />
    </div>
  );
};

export default AmbientAudioToggle;
