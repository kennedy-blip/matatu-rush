import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type ObstacleKind = "crate" | "laundry" | "drain" | "boda";
type Obstacle = { at: number; lane: number; kind: ObstacleKind };
type Props = { lane: number; distance: number; running: boolean; jumping: boolean; sliding: boolean; outfit: string };

const LANES = [-2.15, 0, 2.15];
const OBSTACLES: Obstacle[] = [
  { at: 24, lane: 1, kind: "crate" }, { at: 43, lane: 0, kind: "drain" }, { at: 61, lane: 2, kind: "laundry" },
  { at: 79, lane: 1, kind: "boda" }, { at: 98, lane: 0, kind: "crate" }, { at: 117, lane: 2, kind: "drain" },
  { at: 137, lane: 1, kind: "laundry" }, { at: 155, lane: 0, kind: "boda" }, { at: 174, lane: 2, kind: "crate" },
  { at: 192, lane: 1, kind: "drain" }, { at: 211, lane: 0, kind: "laundry" }, { at: 229, lane: 2, kind: "boda" },
  { at: 247, lane: 1, kind: "crate" }, { at: 265, lane: 0, kind: "drain" }, { at: 284, lane: 2, kind: "laundry" },
  { at: 302, lane: 1, kind: "boda" }, { at: 321, lane: 0, kind: "crate" }, { at: 339, lane: 2, kind: "drain" },
];
const CYCLE = 360;

function Shack({ side, z, index }: { side: number; z: number; index: number }) {
  const width = 2.25 + (index % 3) * 0.36;
  const height = 2.05 + (index % 2) * 0.52;
  return (
    <group position={[side * (4.4 + (index % 2) * 0.45), 0, z]}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height, 2.7]} />
        <meshStandardMaterial color={index % 3 === 0 ? "#4c382e" : "#65564b"} roughness={0.91} />
      </mesh>
      <mesh position={[0, height + 0.07, 0]} rotation={[0, 0, side * -0.035]}>
        <boxGeometry args={[width + 0.32, 0.16, 2.95]} />
        <meshStandardMaterial color={index % 2 ? "#7d7b71" : "#8b7662"} metalness={0.62} roughness={0.45} />
      </mesh>
      <mesh position={[side * -0.25, 1.22, 1.37]}>
        <boxGeometry args={[0.78, 0.55, 0.05]} />
        <meshStandardMaterial color={index % 2 ? "#06b6d4" : "#f3a23b"} emissive={index % 2 ? "#06b6d4" : "#db641c"} emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[side * 0.27, 0.69, 1.39]}>
        <boxGeometry args={[0.55, 1.35, 0.09]} />
        <meshStandardMaterial color="#211c1a" roughness={0.8} />
      </mesh>
      <mesh position={[side * -0.25, 1.22, 1.42]}>
        <boxGeometry args={[0.79, 0.025, 0.02]} />
        <meshBasicMaterial color="#fff0cf" />
      </mesh>
    </group>
  );
}

function Road({ distance }: { distance: number }) {
  const offset = (distance * 0.55) % 24;
  const buildings = useMemo(() => Array.from({ length: 17 }, (_, i) => i), []);
  return (
    <group>
      <mesh receiveShadow position={[0, -0.13, -43]}>
        <boxGeometry args={[7.2, 0.28, 105]} />
        <meshStandardMaterial color="#49382d" roughness={0.82} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.025, -42]}>
        <boxGeometry args={[3.3, 0.03, 106]} />
        <meshStandardMaterial color="#605047" roughness={0.35} metalness={0.28} />
      </mesh>
      {[-1, 1].map((side) => <mesh key={`edge-${side}`} position={[side * 1.1, 0.045, -42]}>
        <boxGeometry args={[0.035, 0.025, 105]} />
        <meshBasicMaterial color="#d88137" />
      </mesh>)}
      {[-1.08, 1.08].map((x) => Array.from({ length: 8 }, (_, i) => (
        <mesh key={`${x}-${i}`} position={[x, 0.055, -i * 12 - offset]}>
          <boxGeometry args={[0.055, 0.025, 5.5]} />
          <meshBasicMaterial color="#d3b082" />
        </mesh>
      )))}
      {Array.from({ length: 10 }, (_, i) => {
        const z = -i * 10.5 - ((distance * 0.44) % 10.5) - 3;
        const x = ((i * 17) % 53) / 10 - 2.55;
        return <mesh key={`puddle-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.024, z]}>
          <circleGeometry args={[0.35 + (i % 3) * 0.18, 18]} />
          <meshStandardMaterial color={i % 2 ? "#2a6570" : "#8f562f"} roughness={0.16} metalness={0.72} transparent opacity={0.75} />
        </mesh>;
      })}
      {buildings.map((i) => {
        const z = -i * 8.4 - ((distance * 0.35) % 8.4) - 3;
        return <group key={i}><Shack side={-1} z={z} index={i} /><Shack side={1} z={z - 2.2} index={i + 1} /></group>;
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -i * 14 - ((distance * 0.35) % 14) - 4;
        return <group key={`cable-${i}`} position={[0, 3.4 + (i % 2) * 0.35, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.018, 0.018, 9.4, 6]} /><meshStandardMaterial color="#171b24" roughness={0.6} /></mesh>
          <mesh position={[-1.4, -0.55, 0]}><cylinderGeometry args={[0.012, 0.012, 1.1, 5]} /><meshStandardMaterial color="#16181e" /></mesh>
        </group>;
      })}
      <fog attach="fog" args={["#342b31", 15, 82]} />
    </group>
  );
}

function ObstacleMesh({ obstacle, distance }: { obstacle: Obstacle; distance: number }) {
  let relative = obstacle.at - distance;
  if (relative < -16) relative += CYCLE;
  if (relative > CYCLE / 2) relative -= CYCLE;
  if (relative < -15 || relative > 76) return null;
  const z = -relative * 0.58 - 2.8;
  const x = LANES[obstacle.lane];
  if (obstacle.kind === "drain") return <group position={[x, 0, z]}>
    <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}><boxGeometry args={[1.72, 1.48, 0.05]} /><meshStandardMaterial color="#12191c" roughness={0.26} metalness={0.52} /></mesh>
    <mesh position={[0, 0.058, -0.77]}><boxGeometry args={[1.82, 0.06, 0.12]} /><meshStandardMaterial color="#9d6c3e" /></mesh>
    <mesh position={[0, 0.058, 0.77]}><boxGeometry args={[1.82, 0.06, 0.12]} /><meshStandardMaterial color="#9d6c3e" /></mesh>
    <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.95, 0.035, 0.04]} /><meshBasicMaterial color="#06b6d4" /></mesh>
  </group>;
  if (obstacle.kind === "laundry") return <group position={[x, 0, z]}>
    <mesh position={[0, 1.45, 0]}><boxGeometry args={[2.7, 0.045, 0.04]} /><meshStandardMaterial color="#29232a" /></mesh>
    {[-0.95, -0.5, 0, 0.5, 0.95].map((cx, i) => <mesh key={i} position={[cx, 1.17 + (i % 2) * 0.07, 0]} rotation={[0, 0, (i % 2 ? 0.04 : -0.04)]}>
      <boxGeometry args={[0.43, 0.52, 0.045]} /><meshStandardMaterial color={["#f1a95b", "#307b83", "#d65855", "#ddd1b8", "#815c9d"][i]} roughness={0.82} />
    </mesh>)}
    <mesh position={[0, 1.75, 0]}><boxGeometry args={[2.9, 0.04, 0.045]} /><meshStandardMaterial color="#322a28" /></mesh>
  </group>;
  if (obstacle.kind === "boda") return <group position={[x, 0, z]} rotation={[0, 0, -0.04]}>
    <mesh position={[-0.46, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.065, 8, 18]} /><meshStandardMaterial color="#17191c" /></mesh>
    <mesh position={[0.47, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.065, 8, 18]} /><meshStandardMaterial color="#17191c" /></mesh>
    <mesh position={[0, 0.55, 0]}><boxGeometry args={[0.82, 0.25, 0.28]} /><meshStandardMaterial color="#b84b28" metalness={0.35} /></mesh>
    <mesh position={[-0.15, 0.79, 0]}><boxGeometry args={[0.36, 0.28, 0.3]} /><meshStandardMaterial color="#d8d1c4" /></mesh>
    <mesh position={[0.58, 0.62, 0]}><cylinderGeometry args={[0.025, 0.025, 0.5, 6]} /><meshStandardMaterial color="#b1a997" /></mesh>
  </group>;
  return <group position={[x, 0, z]}>
    <mesh position={[0, 0.42, 0]} castShadow><boxGeometry args={[0.92, 0.82, 0.8]} /><meshStandardMaterial color="#70472b" roughness={0.88} /></mesh>
    <mesh position={[0, 0.45, 0.42]}><boxGeometry args={[0.82, 0.07, 0.025]} /><meshStandardMaterial color="#b57b44" /></mesh>
    <mesh position={[0, 0.19, 0.42]}><boxGeometry args={[0.82, 0.07, 0.025]} /><meshStandardMaterial color="#b57b44" /></mesh>
    <mesh position={[0, 0.69, 0.42]}><boxGeometry args={[0.82, 0.07, 0.025]} /><meshStandardMaterial color="#b57b44" /></mesh>
  </group>;
}

function Runner({ lane, running, jumping, sliding, outfit }: Props) {
  const group = useRef<THREE.Group>(null);
  const legs = useRef<THREE.Group>(null);
  const laneRef = useRef(LANES[lane]);
  const jumpRef = useRef(0);
  useFrame((state, delta) => {
    if (!group.current) return;
    laneRef.current = THREE.MathUtils.damp(laneRef.current, LANES[lane], 9, delta);
    group.current.position.x = laneRef.current;
    const bob = running && !sliding ? Math.sin(state.clock.elapsedTime * 13) * 0.06 : 0;
    if (jumping) jumpRef.current = Math.min(1.25, jumpRef.current + delta * 3.5);
    else jumpRef.current = Math.max(0, jumpRef.current - delta * 3.4);
    group.current.position.y = jumpRef.current + bob;
    group.current.scale.y = sliding ? 0.55 : 1;
    if (legs.current) legs.current.rotation.x = running ? Math.sin(state.clock.elapsedTime * 15) * 0.22 : 0;
  });
  const suitColor = outfit === "Sunset Runner" ? "#ef7839" : outfit === "Night Courier" ? "#8b5cf6" : "#10a9b9";
  return <group ref={group} position={[LANES[lane], 0, -2.8]}>
    <group ref={legs}>
      <mesh position={[-0.18, 0.43, 0]} castShadow><capsuleGeometry args={[0.12, 0.43, 4, 8]} /><meshStandardMaterial color="#25252a" roughness={0.7} /></mesh>
      <mesh position={[0.18, 0.43, 0]} castShadow><capsuleGeometry args={[0.12, 0.43, 4, 8]} /><meshStandardMaterial color="#25252a" roughness={0.7} /></mesh>
      <mesh position={[-0.2, 0.14, 0.08]}><boxGeometry args={[0.3, 0.12, 0.42]} /><meshStandardMaterial color="#d4c6a9" emissive="#06b6d4" emissiveIntensity={0.22} /></mesh>
      <mesh position={[0.2, 0.14, 0.08]}><boxGeometry args={[0.3, 0.12, 0.42]} /><meshStandardMaterial color="#d4c6a9" emissive="#06b6d4" emissiveIntensity={0.22} /></mesh>
    </group>
    <mesh position={[0, 1.07, 0]} castShadow><capsuleGeometry args={[0.27, 0.48, 5, 10]} /><meshStandardMaterial color={suitColor} roughness={0.65} /></mesh>
    <mesh position={[0, 1.77, 0]} castShadow><sphereGeometry args={[0.23, 16, 12]} /><meshStandardMaterial color="#a56e52" roughness={0.8} /></mesh>
    <mesh position={[0, 1.91, 0.015]}><sphereGeometry args={[0.245, 16, 10, 0, Math.PI * 2, 0, 0.86]} /><meshStandardMaterial color="#23232a" /></mesh>
    <mesh position={[-0.37, 1.17, 0]} rotation={[0, 0, -0.48]}><capsuleGeometry args={[0.09, 0.5, 4, 8]} /><meshStandardMaterial color={suitColor} /></mesh>
    <mesh position={[0.37, 1.17, 0]} rotation={[0, 0, 0.48]}><capsuleGeometry args={[0.09, 0.5, 4, 8]} /><meshStandardMaterial color={suitColor} /></mesh>
    <mesh position={[0, 1.04, -0.17]}><boxGeometry args={[0.33, 0.32, 0.09]} /><meshStandardMaterial color="#202026" /></mesh>
  </group>;
}

function Matatu() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => { if (group.current) group.current.position.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.1; });
  return <group ref={group} position={[2.85, -0.18, 3.45]} scale={[0.56, 0.56, 0.56]}>
    <mesh position={[0, 0.91, 0]} castShadow><boxGeometry args={[2.4, 1.72, 3.45]} /><meshStandardMaterial color="#171a21" metalness={0.66} roughness={0.28} /></mesh>
    <mesh position={[0, 1.28, -1.75]}><boxGeometry args={[2.18, 0.58, 0.07]} /><meshStandardMaterial color="#131821" emissive="#087b8d" emissiveIntensity={0.72} metalness={0.4} /></mesh>
    <mesh position={[0, 0.62, -1.77]}><boxGeometry args={[2.22, 0.1, 0.06]} /><meshBasicMaterial color="#f43f5e" /></mesh>
    {[-0.78, 0.78].map((x) => <mesh key={x} position={[x, 0.59, -1.83]}><boxGeometry args={[0.3, 0.2, 0.06]} /><meshBasicMaterial color="#ff5c74" /></mesh>)}
    <mesh position={[0, 1.82, 0]}><boxGeometry args={[1.95, 0.12, 2.8]} /><meshStandardMaterial color="#191d27" metalness={0.72} roughness={0.31} /></mesh>
    <mesh position={[0, 1.89, -1.35]}><boxGeometry args={[1.95, 0.035, 0.04]} /><meshBasicMaterial color="#06b6d4" /></mesh>
    <mesh position={[0, 1.89, 1.35]}><boxGeometry args={[1.95, 0.035, 0.04]} /><meshBasicMaterial color="#f43f5e" /></mesh>
    {[-1, 1].map((x) => <group key={x}><mesh position={[x * 1.18, 0.39, -1.08]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.32, 0.32, 0.18, 20]} /><meshStandardMaterial color="#101115" /></mesh><pointLight position={[x * 0.7, 0.9, -2]} color="#f43f5e" intensity={1.1} distance={4} /></group>)}
    <mesh position={[0, 1.84, -1.8]}><boxGeometry args={[0.44, 0.26, 0.07]} /><meshBasicMaterial color="#06b6d4" /></mesh>
  </group>;
}

function Dust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(330 * 3);
    for (let i = 0; i < 330; i++) { arr[i * 3] = (Math.random() - 0.5) * 8; arr[i * 3 + 1] = Math.random() * 4; arr[i * 3 + 2] = -Math.random() * 80; }
    return arr;
  }, []);
  useFrame((_, delta) => { if (ref.current) { ref.current.rotation.y += delta * 0.012; ref.current.position.z = (ref.current.position.z + delta * 2) % 8; } });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ffd39a" size={0.045} transparent opacity={0.54} sizeAttenuation /></points>;
}

function World(props: Props) {
  const current = props.distance;
  return <>
    <color attach="background" args={["#171b27"]} />
    <hemisphereLight args={["#f3b86b", "#1a1211", 1.5]} />
    <ambientLight intensity={0.58} />
    <directionalLight position={[-5, 8, 4]} intensity={2.1} color="#ffb861" castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[0, 4, -12]} color="#06b6d4" intensity={18} distance={28} />
    <pointLight position={[0, 2.4, 1]} color="#f43f5e" intensity={8} distance={11} />
    <Road distance={current} />
    {OBSTACLES.map((o, i) => <ObstacleMesh key={i} obstacle={o} distance={current} />)}
    <Runner {...props} />
    <Matatu />
    <Dust />
    <mesh position={[0, -0.32, -42]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[200, 200]} /><meshBasicMaterial color="#211c20" /></mesh>
  </>;
}

export default function RunnerCanvas(props: Props) {
  return <Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 5.1, 10], fov: 52, near: 0.1, far: 130 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
    <World {...props} />
  </Canvas>;
}
