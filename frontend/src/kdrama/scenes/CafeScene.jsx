// ─────────────────────────────────────────────────────────────────────────────

// KOREAN CAFÉ — 3D Scene (React Three Fiber)
// Warm, intimate interior with realistic lighting, wooden textures, neon signs
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function WoodMaterial({ color = '#5c3d2e' }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.85}
      metalness={0.05}
    />
  );
}

function ConcreteMaterial({ color = '#2a2a3a' }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.95}
      metalness={0.0}
    />
  );
}

// Café Counter
function Counter() {
  return (
    <group position={[0, 0, -4]}>
      {/* Main counter body */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[6, 1.2, 1]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.75} metalness={0.1} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 1.22, 0]} castShadow>
        <boxGeometry args={[6.2, 0.06, 1.15]} />
        <meshStandardMaterial color="#5a4030" roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Espresso machine */}
      <mesh position={[-1.5, 1.6, -0.1]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.5]} />
        <meshStandardMaterial color="#888888" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* Steam nozzle */}
      <mesh position={[-1.5, 2.0, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Display case */}
      <mesh position={[1.5, 1.5, 0]} castShadow>
        <boxGeometry args={[1.5, 0.6, 0.6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Glass front */}
      <mesh position={[1.5, 1.5, 0.32]} castShadow>
        <boxGeometry args={[1.5, 0.6, 0.02]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.12} roughness={0.05} metalness={0.3} />
      </mesh>
      {/* Pastries inside display */}
      {[-0.2, 0.3, 0.8].map((x, i) => (
        <mesh key={i} position={[1.5 + x * 0.8, 1.35, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={['#d4a574', '#c4956a', '#dab88c'][i]} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Tables & Chairs
function Table({ position }) {
  return (
    <group position={position}>
      {/* Table top */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.55, 0.05, 24]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Table leg */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.7, 8]} />
        <meshStandardMaterial color="#2c1810" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.03, 16]} />
        <meshStandardMaterial color="#2c1810" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Coffee cup */}
      <mesh position={[0.15, 0.8, 0.1]}>
        <cylinderGeometry args={[0.04, 0.035, 0.07, 12]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Chair({ position, rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.4]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.72, -0.18]} castShadow>
        <boxGeometry args={[0.38, 0.5, 0.04]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[[-0.15, 0, -0.15], [0.15, 0, -0.15], [-0.15, 0, 0.15], [0.15, 0, 0.15]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.22, pos[2]]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.44, 6]} />
          <meshStandardMaterial color="#2c1810" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Neon Sign
function NeonSign({ position, text, color = '#ff6b8a' }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.intensity = 2. + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group position={position}>
      {/* Sign backing */}
      <mesh>
        <boxGeometry args={[1.8, 0.6, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Glow light */}
      <pointLight ref={ref} color={color} intensity={2.5} distance={5} decay={2} position={[0, 0, 0.3]} />
      {/* Glow mesh */}
      <mesh position={[0, 0, 0.04]}>
        <boxGeometry args={[1.5, 0.35, 0.02]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

// Window with street view
function Window({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.material.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group position={position}>
      {/* Window frame */}
      <mesh castShadow>
        <boxGeometry args={[2.5, 2, 0.08]} />
        <meshStandardMaterial color="#2c1810" roughness={0.6} />
      </mesh>
      {/* Glass pane */}
      <mesh ref={ref} position={[0, 0, 0.01]}>
        <boxGeometry args={[2.2, 1.7, 0.02]} />
        <meshStandardMaterial
          color="#0a1628"
          emissive="#1a2a4a"
          emissiveIntensity={0.12}
          transparent
          opacity={0.5}
          roughness={0.05}
          metalness={0.2}
        />
      </mesh>
      {/* Cross bars */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[2.5, 0.04, 0.04]} />
        <meshStandardMaterial color="#2c1810" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.04, 2, 0.04]} />
        <meshStandardMaterial color="#2c1810" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Steam particles
function SteamParticles({ position }) {
  const ref = useRef();
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 20; i++) {
      arr.push({
        x: (Math.random() - 0.5) * 0.3,
        y: Math.random() * 0.8,
        z: (Math.random() - 0.5) * 0.3,
        speed: 0.2 + Math.random() * 0.3,
        size: 0.02 + Math.random() * 0.03,
        offset: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const positions = ref.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      const y = ((p.y + t * p.speed * 0.5) % 0.8);
      positions.setXYZ(i,
        p.x + Math.sin(t + p.offset) * 0.05,
        y,
        p.z + Math.cos(t + p.offset) * 0.05
      );
    });
    positions.needsUpdate = true;
  });

  return (
    <points ref={ref} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.04} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// Shelf
function Shelf({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.5, 0.04, 0.3]} />
        <WoodMaterial color="#3d2b1f" />
      </mesh>
      {/* Books / Jars */}
      {[0, 1, 2, 3].map(i => (
        <mesh key={i} position={[-0.5 + i * 0.35, 0.1, 0]} castShadow>
          <boxGeometry args={[0.15, 0.2, 0.12]} />
          <meshStandardMaterial
            color={['#8b4513', '#654321', '#a0522d', '#6b3a2a'][i]}
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main Café Scene
export default function CafeScene() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#2a2018" roughness={0.9} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.5, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial color="#1a1510" roughness={0.95} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.75, -5.5]} receiveShadow>
        <boxGeometry args={[14, 3.5, 0.15]} />
        <meshStandardMaterial color="#1e1a15" roughness={0.92} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-7, 1.75, 0]} receiveShadow>
        <boxGeometry args={[0.15, 3.5, 12]} />
        <meshStandardMaterial color="#1e1a15" roughness={0.92} />
      </mesh>

      {/* Right wall (with windows) */}
      <mesh position={[7, 1.75, 0]} receiveShadow>
        <boxGeometry args={[0.15, 3.5, 12]} />
        <meshStandardMaterial color="#1e1a15" roughness={0.92} />
      </mesh>

      {/* Front wall (entrance, mostly open) */}
      <mesh position={[-4, 1.75, 5.85]}>
        <boxGeometry args={[6, 3.5, 0.15]} />
        <meshStandardMaterial color="#1e1a15" roughness={0.92} />
      </mesh>
      <mesh position={[5, 1.75, 5.85]}>
        <boxGeometry args={[4, 3.5, 0.15]} />
        <meshStandardMaterial color="#1e1a15" roughness={0.92} />
      </mesh>

      {/* Door frame */}
      <mesh position={[1.5, 3.2, 5.85]}>
        <boxGeometry args={[2.2, 0.15, 0.2]} />
        <meshStandardMaterial color="#2c1810" roughness={0.6} />
      </mesh>

      {/* Counter */}
      <Counter />

      {/* Tables */}
      <Table position={[-3, 0, 1]} />
      <Table position={[-3, 0, 3]} />
      <Table position={[3, 0, 1]} />
      <Table position={[3, 0, 3]} />
      <Table position={[0, 0, 3]} />

      {/* Chairs */}
      <Chair position={[-3.5, 0, 1]} rotation={Math.PI / 4} />
      <Chair position={[-2.5, 0, 1]} rotation={-Math.PI / 4} />
      <Chair position={[-3.5, 0, 3]} rotation={Math.PI / 3} />
      <Chair position={[-2.5, 0, 3]} rotation={-Math.PI / 3} />
      <Chair position={[2.5, 0, 1]} rotation={Math.PI / 4} />
      <Chair position={[3.5, 0, 1]} rotation={-Math.PI / 6} />
      <Chair position={[2.5, 0, 3]} rotation={Math.PI / 5} />
      <Chair position={[3.5, 0, 3]} rotation={-Math.PI / 5} />
      <Chair position={[-0.5, 0, 3]} rotation={Math.PI / 3} />
      <Chair position={[0.5, 0, 3]} rotation={-Math.PI / 3} />

      {/* Windows */}
      <Window position={[6.9, 2, -2]} />
      <Window position={[6.9, 2, 2]} />

      {/* Neon signs */}
      <NeonSign position={[0, 2.9, -5.3]} text="카페" color="#ff8fab" />
      <NeonSign position={[-5, 2.9, -5.3]} text="커피" color="#f0a050" />

      {/* Shelves */}
      <Shelf position={[-6.8, 2.2, -3]} />
      <Shelf position={[-6.8, 1.6, -3]} />
      <Shelf position={[-6.8, 2.2, 0]} />

      {/* Steam from espresso machine */}
      <SteamParticles position={[-1.5, 2.1, -4]} />

      {/* ── LIGHTING ── */}
      {/* Warm ambient */}
      <ambientLight intensity={0.15} color="#2a1a0a" />

      {/* Main warm overhead lights */}
      <pointLight position={[0, 3, 0]} intensity={1.2} color="#ffa040" distance={10} decay={2} castShadow />
      <pointLight position={[-3, 3, 2]} intensity={0.8} color="#ff9030" distance={8} decay={2} castShadow />
      <pointLight position={[3, 3, 2]} intensity={0.8} color="#ff9030" distance={8} decay={2} castShadow />

      {/* Counter accent light */}
      <spotLight
        position={[0, 3, -3.5]}
        angle={0.6}
        penumbra={0.8}
        intensity={1.5}
        color="#ffcc88"
        distance={5}
        castShadow
        target-position={[0, 0, -4]}
      />

      {/* Window ambient — cool blue from outside */}
      <pointLight position={[6.5, 2, -2]} intensity={0.3} color="#4488cc" distance={4} decay={2} />
      <pointLight position={[6.5, 2, 2]} intensity={0.3} color="#4488cc" distance={4} decay={2} />

      {/* Neon glow */}
      <pointLight position={[0, 2.9, -4.5]} intensity={0.6} color="#ff8fab" distance={4} decay={2} />

      {/* Hanging pendant lights (visual) */}
      {[-3, 0, 3].map((x, i) => (
        <group key={i} position={[x, 2.8, 2]}>
          <mesh>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.25, 0]}>
            <coneGeometry args={[0.15, 0.12, 12]} />
            <meshStandardMaterial color="#2c2c2c" metalness={0.6} roughness={0.4} />
          </mesh>
          <pointLight position={[0, -0.35, 0]} intensity={0.5} color="#ffaa55" distance={3} decay={2} />
        </group>
      ))}
    </group>
  );
}
