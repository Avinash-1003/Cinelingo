// ─────────────────────────────────────────────────────────────────────────────
// SCENE RENDERER — AAA-Quality Cinematic Pipeline
// Post-processing: Bloom, SSAO, Depth of Field, Vignette, Tone Mapping
// ─────────────────────────────────────────────────────────────────────────────
import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette, SSAO, ChromaticAberration, ToneMapping, Noise } from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode, KernelSize } from 'postprocessing';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import CafeScene from '../scenes/CafeScene';
import StreetScene from '../scenes/StreetScene';
import SubwayScene from '../scenes/SubwayScene';
import PlayerController from './PlayerController';
import NPCEntity from './NPCEntity';
import { getNPCsByLocation } from '../data/npcs';

// NPC positions per scene
const NPC_POSITIONS = {
  cafe: {
    jisu: [0.5, 0, -3.5],
    haeun: [-4, 0, -2],
  },
  street: {
    minjun: [3, 0, -5],
  },
  subway: {
    sua: [1, 0, -3],
  },
};

// Scene-specific post-processing configs
const POST_PROCESSING_CONFIG = {
  cafe: {
    bloom: { intensity: 0.4, luminanceThreshold: 0.6, luminanceSmoothing: 0.4, kernelSize: KernelSize.LARGE },
    dof: { focusDistance: 0.02, focalLength: 0.06, bokehScale: 3.5 },
    vignette: { offset: 0.25, darkness: 0.65 },
    ssaoIntensity: 12,
    ssaoRadius: 0.08,
    envPreset: 'apartment',
    envIntensity: 0.12,
    chromaticAberration: 0.0004,
    noiseOpacity: 0.02,
  },
  street: {
    bloom: { intensity: 0.7, luminanceThreshold: 0.35, luminanceSmoothing: 0.3, kernelSize: KernelSize.HUGE },
    dof: { focusDistance: 0.015, focalLength: 0.04, bokehScale: 4 },
    vignette: { offset: 0.2, darkness: 0.75 },
    ssaoIntensity: 10,
    ssaoRadius: 0.1,
    envPreset: 'night',
    envIntensity: 0.05,
    chromaticAberration: 0.0008,
    noiseOpacity: 0.03,
  },
  subway: {
    bloom: { intensity: 0.35, luminanceThreshold: 0.55, luminanceSmoothing: 0.5, kernelSize: KernelSize.LARGE },
    dof: { focusDistance: 0.018, focalLength: 0.05, bokehScale: 3 },
    vignette: { offset: 0.3, darkness: 0.6 },
    ssaoIntensity: 15,
    ssaoRadius: 0.06,
    envPreset: 'warehouse',
    envIntensity: 0.08,
    chromaticAberration: 0.0003,
    noiseOpacity: 0.025,
  },
};

// Cinematic post-processing pipeline
function CinematicPostProcessing({ scene }) {
  const config = POST_PROCESSING_CONFIG[scene] || POST_PROCESSING_CONFIG.cafe;

  const chromaticOffset = useMemo(
    () => new THREE.Vector2(config.chromaticAberration, config.chromaticAberration),
    [config.chromaticAberration]
  );

  return (
    <EffectComposer multisampling={4} disableNormalPass={false}>
      {/* Screen-Space Ambient Occlusion — adds depth to crevices */}
      <SSAO
        blendFunction={BlendFunction.MULTIPLY}
        samples={21}
        rings={4}
        distanceThreshold={0.6}
        distanceFalloff={0.15}
        rangeThreshold={0.15}
        rangeFalloff={0.05}
        luminanceInfluence={0.7}
        radius={config.ssaoRadius}
        intensity={config.ssaoIntensity}
        bias={0.025}
        color={new THREE.Color(0x000008)}
      />

      {/* Bloom — neon glow, light bleed */}
      <Bloom
        intensity={config.bloom.intensity}
        luminanceThreshold={config.bloom.luminanceThreshold}
        luminanceSmoothing={config.bloom.luminanceSmoothing}
        kernelSize={config.bloom.kernelSize}
        blendFunction={BlendFunction.ADD}
        mipmapBlur
      />

      {/* Depth of Field — cinematic bokeh */}
      <DepthOfField
        focusDistance={config.dof.focusDistance}
        focalLength={config.dof.focalLength}
        bokehScale={config.dof.bokehScale}
      />

      {/* Chromatic Aberration — subtle lens effect */}
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={chromaticOffset}
        radialModulation
        modulationOffset={0.2}
      />

      {/* Film grain — cinematic texture */}
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={config.noiseOpacity}
      />

      {/* Vignette — darkened edges for focus */}
      <Vignette
        offset={config.vignette.offset}
        darkness={config.vignette.darkness}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Tone Mapping — cinematic color grading */}
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
      />
    </EffectComposer>
  );
}

// Environment map wrapper per scene
function SceneEnvironment({ scene }) {
  const config = POST_PROCESSING_CONFIG[scene] || POST_PROCESSING_CONFIG.cafe;

  return (
    <Environment
      preset={config.envPreset}
      environmentIntensity={config.envIntensity}
      background={false}
    />
  );
}

function SceneContent() {
  const currentScene = useGameStore(s => s.currentScene);
  const gamePhase = useGameStore(s => s.gamePhase);

  const sceneNPCs = getNPCsByLocation(currentScene);
  const npcPositions = NPC_POSITIONS[currentScene] || {};

  return (
    <>
      {/* HDR Environment map — provides realistic reflections & ambient IBL */}
      <SceneEnvironment scene={currentScene} />

      {/* Scene geometry */}
      {currentScene === 'cafe' && <CafeScene />}
      {currentScene === 'street' && <StreetScene />}
      {currentScene === 'subway' && <SubwayScene />}

      {/* Player */}
      {(gamePhase === 'playing' || gamePhase === 'dialogue') && (
        <PlayerController />
      )}

      {/* NPCs */}
      {sceneNPCs.map(npc => {
        const pos = npcPositions[npc.id];
        if (!pos) return null;
        return (
          <NPCEntity
            key={npc.id}
            npc={npc}
            position={pos}
          />
        );
      })}

      {/* Cinematic post-processing pipeline */}
      <CinematicPostProcessing scene={currentScene} />
    </>
  );
}

export default function SceneRenderer() {
  const currentScene = useGameStore(s => s.currentScene);

  const cameraConfig = {
    cafe: { position: [0, 6, 8], fov: 50 },
    street: { position: [0, 8, 12], fov: 55 },
    subway: { position: [0, 4, 6], fov: 48 },
  };

  const cc = cameraConfig[currentScene] || cameraConfig.cafe;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
    }}>
      <Canvas
        shadows="soft"
        camera={{
          position: cc.position,
          fov: cc.fov,
          near: 0.1,
          far: 200,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
          stencil: false,
        }}
        dpr={[1, 2]}
        style={{ background: '#020208' }}
        flat={false}
        linear={false}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
