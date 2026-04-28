// ─────────────────────────────────────────────────────────────────────────────
// CITY STREET — Seoul Nighttime Street Scene (React Three Fiber)
// Neon-lit buildings, shop signs, street lights, cherry blossoms
// ─────────────────────────────────────────────────────────────────────────────
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Building facade
function Building({ position, width = 3, height = 8, depth = 3, color = '#1a1a2e', signs = [] }) {
  return (
    <group position={position}>
      {/* Main structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Windows — grid pattern */}
      {Array.from({ length: Math.floor(height / 1.5) }).map((_, row) => (
        Array.from({ length: Math.max(1, Math.floor(width / 1.2)) }).map((_, col) => (
          <mesh
            key={`${row}-${col}`}
            position={[
              -width / 2 + 0.8 + col * 1.2,
              1.5 + row * 1.5,
              depth / 2 + 0.01
            ]}
          >
            <boxGeometry args={[0.6, 0.8, 0.02]} />
            <meshStandardMaterial
              color={Math.random() > 0.4 ? '#ffd89010' : '#1a1a30'}
              emissive={Math.random() > 0.4 ? '#ffa020' : '#000000'}
              emissiveIntensity={Math.random() > 0.4 ? 0.3 + Math.random() * 0.3 : 0}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))
      ))}

      {/* Neon signs on building */}
      {signs.map((sign, i) => (
        <group key={i} position={[sign.x || 0, sign.y || 3, depth / 2 + 0.1]}>
          <mesh>
            <boxGeometry args={[sign.width || 1.5, sign.height || 0.4, 0.05]} />
            <meshBasicMaterial color={sign.color || '#ff0066'} transparent opacity={0.7} />
          </mesh>
          <pointLight
            color={sign.color || '#ff0066'}
            intensity={1.5}
            distance={4}
            decay={2}
            position={[0, 0, 0.3]}
          />
        </group>
      ))}
    </group>
  );
}

// Street lamp
function StreetLamp({ position }) {
  const lightRef = useRef();

  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.5 + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 5, 8]} />
        <meshStandardMaterial color="#333340" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.4, 4.8, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
        <meshStandardMaterial color="#333340" roughness={0.4} metalness={0.7} />
      </mesh>
      {/* Lamp head */}
      <mesh position={[0.7, 5, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshBasicMaterial color="#ffdd88" />
      </mesh>
      {/* Light */}
      <pointLight
        ref={lightRef}
        position={[0.7, 4.8, 0]}
        color="#ffcc66"
        intensity={1.5}
        distance={10}
        decay={2}
        castShadow
      />
    </group>
  );
}

// Road markings
function RoadMarkings() {
  const markings = useMemo(() => {
    const arr = [];
    for (let z = -25; z < 25; z += 4) {
      arr.push(z);
    }
    return arr;
  }, []);

  return (
    <group>
      {markings.map((z, i) => (
        <mesh key={i} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.15, 2]} />
          <meshBasicMaterial color="#ccaa00" />
        </mesh>
      ))}
    </group>
  );
}

// Crosswalk
function Crosswalk({ position }) {
  return (
    <group position={position}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-3 + i * 0.85, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.5, 2.5]} />
          <meshBasicMaterial color="#eeeeee" />
        </mesh>
      ))}
    </group>
  );
}

// Cherry blossom particles
function CherryBlossoms() {
  const ref = useRef();
  const count = 100;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = Math.random() * 10 + 2;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = pos.getY(i) - 0.008;
      let x = pos.getX(i) + Math.sin(t * 0.5 + i) * 0.005;
      if (y < 0) {
        y = 10 + Math.random() * 3;
        x = (Math.random() - 0.5) * 30;
      }
      pos.setY(i, y);
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffb7c5" size={0.08} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

// Puddle (reflective)
function Puddle({ position, size = 1 }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 24]} />
      <meshStandardMaterial
        color="#0a1628"
        roughness={0.05}
        metalness={0.9}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

// Parked car (simplified)
function ParkedCar({ position, color = '#222233', rotation = 0 }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.8, 0.6, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Top */}
      <mesh position={[0.1, 0.95, 0]} castShadow>
        <boxGeometry args={[1.2, 0.45, 0.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Windshield */}
      <mesh position={[-0.4, 0.9, 0]}>
        <boxGeometry args={[0.02, 0.35, 0.7]} />
        <meshStandardMaterial color="#88aacc" transparent opacity={0.3} metalness={0.5} />
      </mesh>
      {/* Wheels */}
      {[[-0.6, 0.15, 0.45], [-0.6, 0.15, -0.45], [0.6, 0.15, 0.45], [0.6, 0.15, -0.45]].map((p, i) => (
        <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
          <meshStandardMaterial color="#111111" roughness={0.9} />
        </mesh>
      ))}
      {/* Tail lights */}
      <mesh position={[0.91, 0.5, 0.3]}>
        <boxGeometry args={[0.02, 0.1, 0.15]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>
      <mesh position={[0.91, 0.5, -0.3]}>
        <boxGeometry args={[0.02, 0.1, 0.15]} />
        <meshBasicMaterial color="#ff2222" />
      </mesh>
    </group>
  );
}

// Main Street Scene
export default function StreetScene() {
  return (
    <group>
      {/* Ground / Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 60]} />
        <meshStandardMaterial color="#141420" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* Sidewalk left */}
      <mesh position={[-8, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 60]} />
        <meshStandardMaterial color="#222230" roughness={0.9} />
      </mesh>

      {/* Sidewalk right */}
      <mesh position={[8, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 60]} />
        <meshStandardMaterial color="#222230" roughness={0.9} />
      </mesh>

      {/* Road markings */}
      <RoadMarkings />

      {/* Crosswalk */}
      <Crosswalk position={[0, 0, 0]} />

      {/* ─── Buildings LEFT side ─── */}
      <Building
        position={[-11, 0, -15]}
        width={4} height={10} depth={4}
        color="#161628"
        signs={[
          { color: '#ff0066', x: 0, y: 4, width: 2 },
          { color: '#00ffcc', x: 0, y: 2.5, width: 1.2 },
        ]}
      />
      <Building
        position={[-11, 0, -5]}
        width={4} height={7} depth={4}
        color="#1a1a30"
        signs={[{ color: '#ffaa00', x: 0, y: 3.5, width: 1.5 }]}
      />
      <Building
        position={[-11, 0, 5]}
        width={4} height={12} depth={4}
        color="#151525"
        signs={[
          { color: '#ff6688', x: 0, y: 4, width: 1.8 },
          { color: '#6688ff', x: 0, y: 6, width: 1 },
        ]}
      />
      <Building
        position={[-11, 0, 15]}
        width={4} height={8} depth={4}
        color="#181830"
        signs={[{ color: '#44ffaa', x: 0, y: 3, width: 1.5 }]}
      />

      {/* ─── Buildings RIGHT side ─── */}
      <Building
        position={[11, 0, -15]}
        width={4} height={9} depth={4}
        color="#1a1a35"
        signs={[{ color: '#ff4488', x: 0, y: 3, width: 1.5 }]}
      />
      <Building
        position={[11, 0, -5]}
        width={4} height={14} depth={4}
        color="#141430"
        signs={[
          { color: '#00ccff', x: 0, y: 4, width: 2 },
          { color: '#ff9900', x: 0, y: 7, width: 1 },
        ]}
      />
      <Building
        position={[11, 0, 5]}
        width={4} height={6} depth={4}
        color="#181828"
        signs={[{ color: '#aa88ff', x: 0, y: 3, width: 1.8 }]}
      />
      <Building
        position={[11, 0, 15]}
        width={4} height={11} depth={4}
        color="#161630"
        signs={[
          { color: '#ff3366', x: 0, y: 4, width: 1.5 },
          { color: '#33ff99', x: 0, y: 6.5, width: 1.2 },
        ]}
      />

      {/* Street lamps */}
      <StreetLamp position={[-5, 0, -18]} />
      <StreetLamp position={[-5, 0, -6]} />
      <StreetLamp position={[-5, 0, 6]} />
      <StreetLamp position={[-5, 0, 18]} />
      <StreetLamp position={[5, 0, -12]} />
      <StreetLamp position={[5, 0, 0]} />
      <StreetLamp position={[5, 0, 12]} />

      {/* Parked cars */}
      <ParkedCar position={[-5.5, 0, -10]} color="#1a2244" rotation={Math.PI / 2} />
      <ParkedCar position={[5.5, 0, 8]} color="#2a1a1a" rotation={-Math.PI / 2} />
      <ParkedCar position={[-5.5, 0, 10]} color="#1a1a1a" rotation={Math.PI / 2} />

      {/* Puddles — wet street look */}
      <Puddle position={[-2, 0.02, 5]} size={1.2} />
      <Puddle position={[3, 0.02, -8]} size={0.8} />
      <Puddle position={[1, 0.02, 14]} size={1.0} />

      {/* Cherry blossoms */}
      <CherryBlossoms />

      {/* ── LIGHTING ── */}
      <ambientLight intensity={0.08} color="#0a0a20" />

      {/* Moon / sky light */}
      <directionalLight
        position={[-15, 30, -10]}
        intensity={0.3}
        color="#3355aa"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Neon ambient bounce */}
      <pointLight position={[0, 3, 0]} intensity={0.2} color="#ff3366" distance={15} decay={2} />
      <pointLight position={[0, 2, -10]} intensity={0.15} color="#00ccff" distance={10} decay={2} />
      <pointLight position={[0, 2, 10]} intensity={0.15} color="#ffaa00" distance={10} decay={2} />

      {/* Fog */}
      <fog attach="fog" args={['#050510', 15, 45]} />
    </group>
  );
}
