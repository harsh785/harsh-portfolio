"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshDistortMaterial, Torus, Icosahedron, Octahedron, Float } from "@react-three/drei";
import * as THREE from "three";

// ── Mouse tracker ─────────────────────────────────────────────────────────────
function MouseTracker({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useThree(({ gl }) => {
    gl.domElement.addEventListener("mousemove", (e) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 1.2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * -0.8;
    });
  });

  useFrame(() => {
    target.current.x += (mouse.current.x - target.current.x) * 0.05;
    target.current.y += (mouse.current.y - target.current.y) * 0.05;
    if (groupRef.current) {
      groupRef.current.rotation.y = target.current.x;
      groupRef.current.rotation.x = target.current.y;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// ── Glowing wireframe icosahedron ─────────────────────────────────────────────
function GlowIcosahedron({ position, color, speed, distort }: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.6;
    }
  });
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.2}>
      <Icosahedron ref={meshRef} args={[1, 1]} position={position}>
        <MeshDistortMaterial
          color={color}
          wireframe
          distort={distort}
          speed={2}
          opacity={0.35}
          transparent
        />
      </Icosahedron>
    </Float>
  );
}

// ── Glowing torus ─────────────────────────────────────────────────────────────
function GlowTorus({ position, color, speed }: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.5;
      meshRef.current.rotation.z = state.clock.elapsedTime * speed * 0.3;
    }
  });
  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
      <Torus ref={meshRef} args={[1, 0.3, 16, 60]} position={position}>
        <meshStandardMaterial
          color={color}
          wireframe
          opacity={0.25}
          transparent
        />
      </Torus>
    </Float>
  );
}

// ── Octahedron ────────────────────────────────────────────────────────────────
function GlowOctahedron({ position, color, speed }: {
  position: [number, number, number];
  color: string;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * speed;
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.4;
    }
  });
  return (
    <Float speed={1.8} rotationIntensity={1} floatIntensity={2}>
      <Octahedron ref={meshRef} args={[0.8]} position={position}>
        <MeshDistortMaterial
          color={color}
          wireframe
          distort={0.3}
          speed={3}
          opacity={0.4}
          transparent
        />
      </Octahedron>
    </Float>
  );
}

// ── Particle field ────────────────────────────────────────────────────────────
function Particles({ count = 120 }: { count?: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);

  const geoRef = useRef<THREE.BufferGeometry>(null);
  useFrame((state) => {
    if (geoRef.current) {
      geoRef.current.rotateY(0.0008);
    }
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00d4ff" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ── Scene ─────────────────────────────────────────────────────────────────────
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]}  intensity={1}   color="#00d4ff" />
      <pointLight position={[-5, -3, -5]} intensity={0.8} color="#7c3aed" />
      <pointLight position={[0, 5, -5]}  intensity={0.6} color="#39ff14" />

      <Particles />

      <MouseTracker>
        {/* Big central distorted icosahedron */}
        <GlowIcosahedron position={[0, 0, -2]}    color="#00d4ff" speed={0.3} distort={0.5} />

        {/* Surrounding shapes */}
        <GlowTorus       position={[-4, 1.5, -3]}  color="#7c3aed" speed={0.4} />
        <GlowTorus       position={[4.5, -1, -4]}  color="#00d4ff" speed={0.25} />

        <GlowOctahedron  position={[3.5, 2, -2]}   color="#39ff14" speed={0.5} />
        <GlowOctahedron  position={[-3.5, -2, -3]} color="#f59e0b" speed={0.35} />

        <GlowIcosahedron position={[-2.5, 2.5, -4]} color="#7c3aed" speed={0.6} distort={0.3} />
        <GlowIcosahedron position={[2, -2.5, -3]}   color="#f59e0b" speed={0.45} distort={0.4} />
      </MouseTracker>
    </>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
