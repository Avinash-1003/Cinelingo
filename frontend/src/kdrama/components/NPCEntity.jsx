// ─────────────────────────────────────────────────────────────────────────────
// NPC ENTITY — Interactive 3D NPC in the game world
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

export default function NPCEntity({ npc, position = [0, 0, 0] }) {
  const meshRef = useRef();
  const [isNearby, setIsNearby] = useState(false);
  const [hovered, setHovered] = useState(false);
  const playerPosition = useGameStore(s => s.playerPosition);
  const isInDialogue = useGameStore(s => s.isInDialogue);
  const talkToNPC = useGameStore(s => s.talkToNPC);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Idle breathing animation
    meshRef.current.children.forEach(child => {
      if (child.name === 'body') {
        child.scale.y = 1 + Math.sin(t * 1.5) * 0.02;
      }
    });

    // Check proximity to player
    const dx = meshRef.current.position.x - playerPosition.x;
    const dz = meshRef.current.position.z - playerPosition.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const near = dist < 2;

    if (near !== isNearby) {
      setIsNearby(near);
    }

    // Face player when nearby
    if (near && !isInDialogue) {
      const angle = Math.atan2(-dx, -dz);
      meshRef.current.rotation.y += (angle - meshRef.current.rotation.y) * 0.05;
    }

    // Glow indicator
    meshRef.current.children.forEach(child => {
      if (child.name === 'proximity_glow') {
        child.material.opacity = near ? 0.3 + Math.sin(t * 3) * 0.15 : 0;
        child.scale.setScalar(near ? 1 + Math.sin(t * 2) * 0.1 : 0.8);
      }
      if (child.name === 'interact_indicator') {
        child.visible = near && !isInDialogue;
        if (child.visible) {
          child.position.y = 2 + Math.sin(t * 3) * 0.1;
          child.rotation.y = t * 2;
        }
      }
    });
  });

  const handleClick = () => {
    if (isNearby && !isInDialogue) {
      talkToNPC(npc.id);
    }
  };

  const bodyColor = npc.bodyColor || 0x7c8cf8;
  const hairColor = npc.hairColor || 0x1a1a2e;
  const outfitColor = npc.outfitColor || 0x2d2d44;

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered && isNearby ? 1.05 : 1}
    >
      {/* Body */}
      <mesh name="body" position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.38, 0.55, 0.22]} />
        <meshStandardMaterial color={outfitColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.28, 0]} castShadow>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#f0c8a0" roughness={0.85} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.38, -0.02]}>
        <sphereGeometry args={[0.17, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={hairColor} roughness={0.95} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.05, 1.28, 0.14]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.05, 1.28, 0.14]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Left leg */}
      <mesh name="leg_l" position={[-0.09, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.45, 0.14]} />
        <meshStandardMaterial color="#2c2c40" roughness={0.85} />
      </mesh>

      {/* Right leg */}
      <mesh name="leg_r" position={[0.09, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.45, 0.14]} />
        <meshStandardMaterial color="#2c2c40" roughness={0.85} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.26, 0.85, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={outfitColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.26, 0.85, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color={outfitColor} roughness={0.7} />
      </mesh>

      {/* NPC accent color indicator */}
      <pointLight position={[0, 1, 0.3]} intensity={0.4} color={bodyColor} distance={2} decay={2} />

      {/* Proximity glow ring */}
      <mesh name="proximity_glow" position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 24]} />
        <meshBasicMaterial
          color={bodyColor}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Interact indicator (floating diamond) */}
      <mesh name="interact_indicator" position={[0, 2, 0]} visible={false}>
        <octahedronGeometry args={[0.08, 0]} />
        <meshBasicMaterial color={bodyColor} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
