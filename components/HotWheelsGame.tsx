"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── Track path ────────────────────────────────────────────────────────────────
const TRACK_POINTS = [
  [0, 0, -11],
  [4.5, 0, -10],
  [8, 0, -7.5],
  [10.5, 0, -4],
  [11, 0, 0],
  [10.5, 0, 4],
  [8, 0, 7.5],
  [4.5, 0, 10],
  [0, 0, 11],
  [-4.5, 0, 10],
  [-8, 0, 7.5],
  [-10.5, 0, 4],
  [-11, 0, 0],
  [-10.5, 0, -4],
  [-8, 0, -7.5],
  [-4.5, 0, -10],
].map(([x, y, z]) => new THREE.Vector3(x, y, z));

const curve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, "catmullrom", 0.5);
const TUBE_SEGMENTS = 200;
const trackGeometry = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 1.6, 12, true);

// ── Car body ──────────────────────────────────────────────────────────────────
function Car({ progress, speed }: { progress: React.MutableRefObject<number>; speed: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null!);
  const wheelRefs = [useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!), useRef<THREE.Mesh>(null!)];
  const trailRef = useRef<THREE.Points>(null!);
  const trailPositions = useRef<Float32Array>(new Float32Array(60 * 3));
  const trailHead = useRef(0);

  // colours cycle with speed
  const bodyColor = "#e63946";
  const stripeColor = "#ffd60a";
  const wheelColor = "#1a1a2e";
  const rimColor = "#c8c8c8";

  useFrame((_, delta) => {
    const t = progress.current;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const ahead = curve.getPointAt((t + 0.001) % 1);

    if (groupRef.current) {
      groupRef.current.position.copy(pos);
      groupRef.current.position.y = 0.38;
      groupRef.current.lookAt(ahead.x, 0.38, ahead.z);
    }

    // spin wheels
    const wheelSpin = speed.current * delta * 60;
    wheelRefs.forEach(w => { if (w.current) w.current.rotation.x += wheelSpin; });

    // update trail
    const ti = trailHead.current % 60;
    trailPositions.current[ti * 3 + 0] = pos.x;
    trailPositions.current[ti * 3 + 1] = 0.3;
    trailPositions.current[ti * 3 + 2] = pos.z;
    trailHead.current++;
    if (trailRef.current) {
      (trailRef.current.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
    }
  });

  const trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions.current, 3));

  return (
    <>
      {/* Trail */}
      <points ref={trailRef} geometry={trailGeo}>
        <pointsMaterial color="#ffd60a" size={0.08} transparent opacity={0.5} sizeAttenuation />
      </points>

      <group ref={groupRef}>
        {/* Body */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[1.6, 0.38, 3.2]} />
          <meshStandardMaterial color={bodyColor} metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Cab/roof */}
        <mesh position={[0, 0.46, 0.1]} castShadow>
          <boxGeometry args={[1.35, 0.34, 1.7]} />
          <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Yellow stripe */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.18, 0.42, 3.22]} />
          <meshStandardMaterial color={stripeColor} metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Windshield */}
        <mesh position={[0, 0.46, 0.97]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[1.1, 0.3, 0.04]} />
          <meshStandardMaterial color="#aef0ff" transparent opacity={0.7} metalness={0.2} roughness={0.1} />
        </mesh>
        {/* Headlights */}
        {[-0.5, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 0.18, 1.62]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#fffbe6" emissive="#fffbe6" emissiveIntensity={2} />
          </mesh>
        ))}
        {/* Rear lights */}
        {[-0.5, 0.5].map((x, i) => (
          <mesh key={i} position={[x, 0.18, -1.62]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial color="#ff2244" emissive="#ff2244" emissiveIntensity={1.5} />
          </mesh>
        ))}

        {/* Wheels — FL, FR, RL, RR */}
        {([[-0.92, -0.1, 1.05], [0.92, -0.1, 1.05], [-0.92, -0.1, -1.05], [0.92, -0.1, -1.05]] as [number,number,number][]).map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]}>
            {/* tyre */}
            <mesh ref={wheelRefs[i]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.24, 16]} />
              <meshStandardMaterial color={wheelColor} roughness={0.9} />
            </mesh>
            {/* rim */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.26, 12]} />
              <meshStandardMaterial color={rimColor} metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

// ── Track mesh + road markings ────────────────────────────────────────────────
function Track() {
  // centre line dashes
  const dashCount = 40;
  const dashes = Array.from({ length: dashCount }, (_, i) => {
    const t = i / dashCount;
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const angle = Math.atan2(tangent.x, tangent.z);
    return { p, angle };
  });

  return (
    <group>
      {/* Road surface */}
      <mesh geometry={trackGeometry} receiveShadow>
        <meshStandardMaterial color="#1a1a2e" roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      {/* Road kerb/edge stripes */}
      <mesh>
        <torusGeometry args={[11, 1.75, 6, 120]} />
        <meshStandardMaterial color="#cc0022" roughness={0.7} wireframe={false} />
      </mesh>
      {/* Centre dashes */}
      {dashes.map(({ p, angle }, i) => (
        <mesh key={i} position={[p.x, 0.02, p.z]} rotation={[0, angle, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.7]} />
          <meshStandardMaterial color="#ffd60a" emissive="#ffd60a" emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#0d0d14" roughness={1} />
      </mesh>
      {/* Outer wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <ringGeometry args={[12.8, 14, 64]} />
        <meshStandardMaterial color="#0f0f1a" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── Camera follow ─────────────────────────────────────────────────────────────
function FollowCamera({ progress, mode }: { progress: React.MutableRefObject<number>; mode: "chase" | "top" | "side" }) {
  const { camera } = useThree();
  const camPos = useRef(new THREE.Vector3(0, 20, 0));

  useFrame(() => {
    const t = progress.current;
    const carPos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();

    let target: THREE.Vector3;
    if (mode === "chase") {
      const back = tangent.clone().multiplyScalar(-6);
      target = carPos.clone().add(back).add(new THREE.Vector3(0, 3.5, 0));
    } else if (mode === "side") {
      target = new THREE.Vector3(22, 10, 0);
    } else {
      target = new THREE.Vector3(0, 28, 0);
    }

    camPos.current.lerp(target, 0.06);
    camera.position.copy(camPos.current);
    camera.lookAt(mode === "top" ? 0 : carPos.x, 0, mode === "top" ? 0 : carPos.z);
  });

  return null;
}

// ── Boost particles ───────────────────────────────────────────────────────────
function BoostParticles({ boosting }: { boosting: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const count = 120;
  const positions = useRef(new Float32Array(count * 3));
  const velocities = useRef(Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 0.3,
    y: Math.random() * 0.2,
    z: (Math.random() - 0.5) * 0.3,
    life: Math.random(),
  })));

  useFrame((_, delta) => {
    if (!boosting || !ref.current) return;
    velocities.current.forEach((v, i) => {
      v.life -= delta * 1.5;
      if (v.life <= 0) {
        v.life = 1;
        positions.current[i * 3 + 0] = (Math.random() - 0.5) * 25;
        positions.current[i * 3 + 1] = Math.random() * 2;
        positions.current[i * 3 + 2] = (Math.random() - 0.5) * 25;
      }
      positions.current[i * 3 + 0] += v.x;
      positions.current[i * 3 + 1] += v.y;
      positions.current[i * 3 + 2] += v.z;
    });
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions.current, 3));

  return boosting ? (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#ffd60a" size={0.15} transparent opacity={0.7} sizeAttenuation />
    </points>
  ) : null;
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ camMode }: { camMode: "chase" | "top" | "side" }) {
  const progress = useRef(0);
  const speed = useRef(0.0018);
  const [boosting, setBoosting] = useState(false);
  const boostRef = useRef(false);

  const boost = useCallback(() => {
    boostRef.current = true;
    setBoosting(true);
    speed.current = 0.005;
    setTimeout(() => {
      boostRef.current = false;
      setBoosting(false);
      speed.current = 0.0018;
    }, 1200);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !boostRef.current) { e.preventDefault(); boost(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [boost]);

  useFrame((_, delta) => {
    progress.current = (progress.current + speed.current) % 1;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#89dceb" />
      <pointLight position={[11, 2, 0]} intensity={0.8} color="#ffd60a" />
      <pointLight position={[-11, 2, 0]} intensity={0.8} color="#e63946" />

      <Track />
      <Car progress={progress} speed={speed} />
      <BoostParticles boosting={boosting} />
      <FollowCamera progress={progress} mode={camMode} />
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function HotWheelsGame() {
  const [camMode, setCamMode] = useState<"chase" | "top" | "side">("chase");
  const [boosting, setBoosting] = useState(false);

  const handleBoost = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { code: "Space" }));
    setBoosting(true);
    setTimeout(() => setBoosting(false), 1200);
  };

  return (
    <div className="relative w-full h-full flex flex-col" style={{ background: "#0d0d14" }}>
      {/* HUD */}
      <div className="absolute top-4 left-4 z-10 font-mono text-xs space-y-1 pointer-events-none">
        <div className="px-3 py-1.5 rounded-lg border border-[#e63946]/30 bg-[#e63946]/10 text-[#e63946] font-bold text-sm">
          🏎 HOT WHEELS — DevOps Circuit
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 text-slate-400">
          SPACE / tap button → BOOST
        </div>
      </div>

      {/* Camera mode pills */}
      <div className="absolute top-4 right-16 z-10 flex gap-2">
        {(["chase", "top", "side"] as const).map(m => (
          <button
            key={m}
            onClick={() => setCamMode(m)}
            className="px-3 py-1 rounded-full text-xs font-mono border transition-all"
            style={camMode === m
              ? { background: "#e63946", borderColor: "#e63946", color: "#fff" }
              : { background: "rgba(0,0,0,0.5)", borderColor: "rgba(255,255,255,0.1)", color: "#64748b" }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas
          shadows
          camera={{ fov: 60, near: 0.1, far: 200 }}
          gl={{ antialias: true }}
        >
          <Scene camMode={camMode} />
        </Canvas>
      </div>

      {/* Boost button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <button
          onPointerDown={handleBoost}
          className="px-8 py-3 rounded-full font-mono font-bold text-sm border-2 transition-all active:scale-95"
          style={{
            background: boosting ? "#ffd60a" : "#e63946",
            borderColor: boosting ? "#ffd60a" : "#e63946",
            color: boosting ? "#000" : "#fff",
            boxShadow: boosting
              ? "0 0 30px #ffd60a80, 0 0 60px #ffd60a40"
              : "0 0 20px #e6394640",
          }}
        >
          {boosting ? "⚡ TURBO!" : "🔥 BOOST"}
        </button>
      </div>
    </div>
  );
}
