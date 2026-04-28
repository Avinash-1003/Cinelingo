// ─────────────────────────────────────────────────────────────────────────────
// SUBWAY INTERIOR — Modern Seoul Metro car (React Three Fiber)
// LED displays, seats, handrails, flickering lights, windows with passing city
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Individual seat row
function SeatRow({ position, side = 'left' }) {
  const dir = side === 'left' ? -1 : 1;
  return (
    <group position={position}>
      {/* Bench base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[3.5, 0.08, 0.55]} />
        <meshStandardMaterial color="#3a3a50" roughness={0.75} metalness={0.3} />
      </mesh>
      {/* Seat cushions */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-1.4 + i * 0.7, 0.48, 0]} castShadow>
          <boxGeometry args={[0.55, 0.06, 0.45]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#2a4a6a' : '#2a4a6a'}
            roughness={0.9}
          />
        </mesh>
      ))}
      {/* Seat back */}
      <mesh position={[0, 0.7, dir * -0.22]} castShadow>
        <boxGeometry args={[3.5, 0.55, 0.05]} />
        <meshStandardMaterial color="#3a3a50" roughness={0.75} metalness={0.3} />
      </mesh>
      {/* Armrests */}
      {[-1.75, -1.05, -0.35, 0.35, 1.05, 1.75].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0]}>
          <boxGeometry args={[0.04, 0.2, 0.5]} />
          <meshStandardMaterial color="#555568" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Handrail
function Handrail({ position, length = 6 }) {
  return (
    <group position={position}>
      {/* Horizontal bar */}
      <mesh>
        <cylinderGeometry args={[0.025, 0.025, length, 8]} />
        <meshStandardMaterial color="#ccccdd" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Vertical supports */}
      {[-(length / 2) + 0.3, 0, (length / 2) - 0.3].map((x, i) => (
        <mesh key={i} position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.5, 6]} />
          <meshStandardMaterial color="#bbbbcc" roughness={0.2} metalness={0.9} />
        </mesh>
      ))}
      {/* Hanging straps */}
      {Array.from({ length: Math.floor(length / 0.8) }).map((_, i) => (
        <group key={i} position={[0, -0.15, -(length / 2) + 0.5 + i * 0.8]}>
          <mesh>
            <boxGeometry args={[0.01, 0.25, 0.02]} />
            <meshStandardMaterial color="#aaaaaa" roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, -0.15, 0]}>
            <torusGeometry args={[0.045, 0.008, 6, 16]} />
            <meshStandardMaterial color="#888898" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// LED Display Board
function LEDDisplay({ position }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      ref.current.material.emissiveIntensity = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Display frame */}
      <mesh>
        <boxGeometry args={[2.5, 0.35, 0.06]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* Screen */}
      <mesh ref={ref} position={[0, 0, 0.035]}>
        <boxGeometry args={[2.3, 0.25, 0.01]} />
        <meshStandardMaterial
          color="#001a00"
          emissive="#00ff66"
          emissiveIntensity={0.8}
          roughness={0.5}
        />
      </mesh>
      {/* Dots representing station text */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.8 + i * 0.35, 0, 0.05]}>
          <circleGeometry args={[0.015, 8]} />
          <meshBasicMaterial color={i < 3 ? '#00ff66' : '#004400'} />
        </mesh>
      ))}
    </group>
  );
}

// Window with moving cityscape
function SubwayWindow({ position }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      // Simulate moving lights outside
      ref.current.material.emissiveIntensity =
        0.05 + Math.abs(Math.sin(state.clock.elapsedTime * 3 + position[2] * 0.5)) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Window frame */}
      <mesh>
        <boxGeometry args={[1.6, 1.2, 0.06]} />
        <meshStandardMaterial color="#383848" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Glass */}
      <mesh ref={ref} position={[0, 0, -0.01]}>
        <boxGeometry args={[1.4, 1.0, 0.02]} />
        <meshStandardMaterial
          color="#0a0a20"
          emissive="#2244aa"
          emissiveIntensity={0.08}
          transparent
          opacity={0.6}
          roughness={0.05}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}

// Doors (closed)
function SubwayDoor({ position }) {
  return (
    <group position={position}>
      {/* Door frame */}
      <mesh>
        <boxGeometry args={[1.6, 2.2, 0.08]} />
        <meshStandardMaterial color="#444458" roughness={0.4} metalness={0.6} />
      </mesh>
      {/* Door gap */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[0.02, 2.1, 0.04]} />
        <meshStandardMaterial color="#222233" roughness={0.8} />
      </mesh>
      {/* Door windows */}
      <mesh position={[0, 0.4, 0.05]}>
        <boxGeometry args={[0.7, 0.5, 0.02]} />
        <meshStandardMaterial
          color="#0a0a30"
          transparent
          opacity={0.4}
          roughness={0.05}
          metalness={0.4}
        />
      </mesh>
      {/* "문" sign above door */}
      <mesh position={[0, 1.25, 0.05]}>
        <boxGeometry args={[0.3, 0.12, 0.01]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>
    </group>
  );
}

// Floor handle/pole
function FloorPole({ position }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 2.8, 12]} />
      <meshStandardMaterial color="#ccccdd" roughness={0.15} metalness={0.95} />
    </mesh>
  );
}

// Flickering fluorescent light
function FluorescentLight({ position, index = 0 }) {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      // Subtle flicker
      const flicker = Math.sin(t * 60 + index * 100) > 0.95 ? 0.5 : 1;
      ref.current.intensity = (1.5 + Math.sin(t * 0.5 + index) * 0.15) * flicker;
    }
  });

  return (
    <group position={position}>
      {/* Light fixture */}
      <mesh>
        <boxGeometry args={[1.2, 0.04, 0.15]} />
        <meshBasicMaterial color="#eeeeff" />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[1.3, 0.02, 0.2]} />
        <meshStandardMaterial color="#ddddee" roughness={0.4} metalness={0.5} />
      </mesh>
      <rectAreaLight
        ref={ref}
        width={1.2}
        height={0.15}
        intensity={1.5}
        color="#e8e8ff"
        position={[0, -0.05, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}

// Main Subway Scene
export default function SubwayScene() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 16]} />
        <meshStandardMaterial color="#2a2a38" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.8, 0]}>
        <planeGeometry args={[5, 16]} />
        <meshStandardMaterial color="#38384a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-2.5, 1.4, 0]}>
        <boxGeometry args={[0.1, 2.8, 16]} />
        <meshStandardMaterial color="#303045" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Right wall */}
      <mesh position={[2.5, 1.4, 0]}>
        <boxGeometry args={[0.1, 2.8, 16]} />
        <meshStandardMaterial color="#303045" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* End walls */}
      <mesh position={[0, 1.4, -8]}>
        <boxGeometry args={[5, 2.8, 0.1]} />
        <meshStandardMaterial color="#2a2a3d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.4, 8]}>
        <boxGeometry args={[5, 2.8, 0.1]} />
        <meshStandardMaterial color="#2a2a3d" roughness={0.8} />
      </mesh>

      {/* Seat rows — left side */}
      <SeatRow position={[-1.8, 0, -4]} side="left" />
      <SeatRow position={[-1.8, 0, 4]} side="left" />

      {/* Seat rows — right side */}
      <SeatRow position={[1.8, 0, -4]} side="right" />
      <SeatRow position={[1.8, 0, 4]} side="right" />

      {/* Handrails */}
      <Handrail position={[-1, 2.4, 0]} length={12} />
      <Handrail position={[1, 2.4, 0]} length={12} />

      {/* Floor poles */}
      <FloorPole position={[-0.8, 1.4, -2]} />
      <FloorPole position={[0.8, 1.4, -2]} />
      <FloorPole position={[-0.8, 1.4, 2]} />
      <FloorPole position={[0.8, 1.4, 2]} />

      {/* Windows — left side */}
      <SubwayWindow position={[-2.45, 1.6, -5.5]} />
      <SubwayWindow position={[-2.45, 1.6, -2.5]} />
      <SubwayWindow position={[-2.45, 1.6, 2.5]} />
      <SubwayWindow position={[-2.45, 1.6, 5.5]} />

      {/* Windows — right side */}
      <SubwayWindow position={[2.45, 1.6, -5.5]} />
      <SubwayWindow position={[2.45, 1.6, -2.5]} />
      <SubwayWindow position={[2.45, 1.6, 2.5]} />
      <SubwayWindow position={[2.45, 1.6, 5.5]} />

      {/* Doors — left side */}
      <SubwayDoor position={[-2.45, 1.1, 0]} />
      <SubwayDoor position={[-2.45, 1.1, -7]} />
      <SubwayDoor position={[-2.45, 1.1, 7]} />

      {/* Doors — right side */}
      <SubwayDoor position={[2.45, 1.1, 0]} />
      <SubwayDoor position={[2.45, 1.1, -7]} />
      <SubwayDoor position={[2.45, 1.1, 7]} />

      {/* LED Display boards */}
      <LEDDisplay position={[0, 2.55, -3]} />
      <LEDDisplay position={[0, 2.55, 3]} />

      {/* Map frame above doors */}
      <mesh position={[-2.4, 2.3, 0]}>
        <boxGeometry args={[0.02, 0.4, 2]} />
        <meshStandardMaterial color="#444458" roughness={0.6} metalness={0.3} />
      </mesh>
      <mesh position={[-2.38, 2.3, 0]}>
        <boxGeometry args={[0.01, 0.35, 1.9]} />
        <meshStandardMaterial
          color="#e8e4d4"
          emissive="#ffffee"
          emissiveIntensity={0.15}
          roughness={0.95}
        />
      </mesh>

      {/* ── LIGHTING ── */}
      <ambientLight intensity={0.15} color="#e0e0ff" />

      {/* Fluorescent lights */}
      <FluorescentLight position={[0, 2.75, -5]} index={0} />
      <FluorescentLight position={[0, 2.75, -1.5]} index={1} />
      <FluorescentLight position={[0, 2.75, 1.5]} index={2} />
      <FluorescentLight position={[0, 2.75, 5]} index={3} />

      {/* Additional fill lights */}
      <pointLight position={[0, 2.5, 0]} intensity={0.4} color="#e0e0ff" distance={8} decay={2} />
      <pointLight position={[0, 2.5, -5]} intensity={0.3} color="#e8e8ff" distance={6} decay={2} />
      <pointLight position={[0, 2.5, 5]} intensity={0.3} color="#e8e8ff" distance={6} decay={2} />

      {/* Window spill — cool tones from outside */}
      <pointLight position={[-2.4, 1.6, -4]} intensity={0.15} color="#3355aa" distance={3} decay={2} />
      <pointLight position={[2.4, 1.6, 4]} intensity={0.15} color="#3355aa" distance={3} decay={2} />

      {/* LED green glow */}
      <pointLight position={[0, 2.5, -3]} intensity={0.15} color="#00ff66" distance={2} decay={2} />
      <pointLight position={[0, 2.5, 3]} intensity={0.15} color="#00ff66" distance={2} decay={2} />
    </group>
  );
}
