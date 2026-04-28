// ─────────────────────────────────────────────────────────────────────────────
// PLAYER CONTROLLER — First/Third person movement within 3D scenes
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

const MOVE_SPEED = 0.06;
const ROTATION_SPEED = 0.03;

const SCENE_BOUNDS = {
  cafe: { minX: -6, maxX: 6, minZ: -4.5, maxZ: 5 },
  street: { minX: -7, maxX: 7, minZ: -25, maxZ: 25 },
  subway: { minX: -2, maxX: 2, minZ: -7, maxZ: 7 },
};

export default function PlayerController({ onNPCProximity }) {
  const meshRef = useRef();
  const keysRef = useRef({});
  const currentScene = useGameStore(s => s.currentScene);
  const isInDialogue = useGameStore(s => s.isInDialogue);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const setPlayerRotation = useGameStore(s => s.setPlayerRotation);
  const playerPosition = useGameStore(s => s.playerPosition);
  const { camera } = useThree();

  useEffect(() => {
    const handleKeyDown = (e) => { keysRef.current[e.key.toLowerCase()] = true; };
    const handleKeyUp = (e) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current || isInDialogue) return;

    const keys = keysRef.current;
    const mesh = meshRef.current;
    let dx = 0, dz = 0;

    // WASD movement
    if (keys['w'] || keys['arrowup']) dz -= MOVE_SPEED;
    if (keys['s'] || keys['arrowdown']) dz += MOVE_SPEED;
    if (keys['a'] || keys['arrowleft']) dx -= MOVE_SPEED;
    if (keys['d'] || keys['arrowright']) dx += MOVE_SPEED;

    // Apply movement
    if (dx !== 0 || dz !== 0) {
      const bounds = SCENE_BOUNDS[currentScene] || SCENE_BOUNDS.street;
      const newX = Math.max(bounds.minX, Math.min(bounds.maxX, mesh.position.x + dx));
      const newZ = Math.max(bounds.minZ, Math.min(bounds.maxZ, mesh.position.z + dz));

      mesh.position.x = newX;
      mesh.position.z = newZ;

      // Face direction of movement
      mesh.rotation.y = Math.atan2(dx, dz);

      setPlayerPosition({ x: newX, z: newZ });
      setPlayerRotation(mesh.rotation.y);

      // Leg animation
      const t = state.clock.elapsedTime;
      mesh.children.forEach(child => {
        if (child.name === 'leg_l') child.rotation.x = Math.sin(t * 8) * 0.5;
        if (child.name === 'leg_r') child.rotation.x = -Math.sin(t * 8) * 0.5;
        if (child.name === 'arm_l') child.rotation.x = Math.sin(t * 8 + Math.PI) * 0.4;
        if (child.name === 'arm_r') child.rotation.x = -Math.sin(t * 8 + Math.PI) * 0.4;
      });
    } else {
      // Idle animation
      mesh.children.forEach(child => {
        if (child.name === 'leg_l' || child.name === 'leg_r') {
          child.rotation.x *= 0.9;
        }
        if (child.name === 'arm_l' || child.name === 'arm_r') {
          child.rotation.x *= 0.9;
        }
      });
    }

    // Camera follow
    const camConfig = {
      cafe: { offsetY: 6, offsetZ: 7, lookAtY: 1.5 },
      street: { offsetY: 8, offsetZ: 10, lookAtY: 1 },
      subway: { offsetY: 4, offsetZ: 5, lookAtY: 1.2 },
    };
    const cc = camConfig[currentScene] || camConfig.cafe;
    const targetCamPos = new THREE.Vector3(
      mesh.position.x,
      mesh.position.y + cc.offsetY,
      mesh.position.z + cc.offsetZ
    );
    camera.position.lerp(targetCamPos, 0.05);
    const lookTarget = new THREE.Vector3(mesh.position.x, cc.lookAtY, mesh.position.z);
    camera.lookAt(lookTarget);
  });

  // Player avatar body
  return (
    <group
      ref={meshRef}
      position={[playerPosition.x, 0, playerPosition.z]}
      castShadow
    >
      {/* Body */}
      <mesh name="body" position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.2]} />
        <meshStandardMaterial color="#e8698d" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#f5d0a9" roughness={0.8} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.35, -0.03]}>
        <sphereGeometry args={[0.16, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>

      {/* Left leg */}
      <mesh name="leg_l" position={[-0.09, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.45, 0.14]} />
        <meshStandardMaterial color="#2a2a44" roughness={0.8} />
      </mesh>

      {/* Right leg */}
      <mesh name="leg_r" position={[0.09, 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.45, 0.14]} />
        <meshStandardMaterial color="#2a2a44" roughness={0.8} />
      </mesh>

      {/* Left arm */}
      <mesh name="arm_l" position={[-0.25, 0.85, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#e8698d" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Right arm */}
      <mesh name="arm_r" position={[0.25, 0.85, 0]} castShadow>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#e8698d" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Player glow indicator */}
      <pointLight position={[0, 1, 0]} intensity={0.3} color="#e8698d" distance={2} decay={2} />
    </group>
  );
}
