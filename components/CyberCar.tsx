"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import type * as CannonType from "cannon-es";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PX_PER_UNIT = 80;          // 1 physics unit = 80px
const CAR_COLOR   = "#e63946";
const CYAN        = "#89dceb";
const TRAIL_MAX   = 80;          // trail points per wheel

// ─────────────────────────────────────────────────────────────────────────────
// Build low-poly Cybertruck-style car mesh
// ─────────────────────────────────────────────────────────────────────────────
function buildCarMesh(): THREE.Group {
  const g = new THREE.Group();

  const bodyMat  = new THREE.MeshStandardMaterial({ color: CAR_COLOR, metalness: 0.7, roughness: 0.3 });
  const glassMat = new THREE.MeshStandardMaterial({ color: "#aef0ff", transparent: true, opacity: 0.55, metalness: 0.2, roughness: 0.1 });
  const accentMat= new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 0.8, metalness: 0.9, roughness: 0.1 });
  const darkMat  = new THREE.MeshStandardMaterial({ color: "#111", metalness: 0.4, roughness: 0.8 });

  // chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 3.8), bodyMat);
  chassis.position.y = 0.05;
  chassis.castShadow = true;
  g.add(chassis);

  // wedge cab
  const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 2.0), bodyMat);
  cab.position.set(0, 0.47, -0.1);
  cab.castShadow = true;
  g.add(cab);

  // windshield
  const wind = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, 0.06), glassMat);
  wind.position.set(0, 0.52, 0.89);
  wind.rotation.x = 0.3;
  g.add(wind);

  // rear window
  const rearW = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.38, 0.06), glassMat);
  rearW.position.set(0, 0.52, -1.09);
  rearW.rotation.x = -0.25;
  g.add(rearW);

  // front bumper
  const bumper = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 0.18), darkMat);
  bumper.position.set(0, -0.08, 1.99);
  g.add(bumper);

  // cyan accent stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.07, 3.82), accentMat);
  stripe.position.y = 0.27;
  g.add(stripe);

  // underbody glow plate
  const glow = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 3.4), accentMat);
  glow.position.y = -0.23;
  g.add(glow);

  // headlights
  for (const x of [-0.6, 0.6]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.04), accentMat);
    hl.position.set(x, 0.08, 1.92);
    g.add(hl);
  }

  // tail lights
  for (const x of [-0.6, 0.6]) {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.04),
      new THREE.MeshStandardMaterial({ color: "#ff2244", emissive: "#ff2244", emissiveIntensity: 1.5 }));
    tl.position.set(x, 0.08, -1.92);
    g.add(tl);
  }

  return g;
}

function buildWheelMesh(): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 18);
  geo.rotateZ(Math.PI / 2);
  const mat = new THREE.MeshStandardMaterial({ color: "#1a1a2e", metalness: 0.5, roughness: 0.9 });
  const m = new THREE.Mesh(geo, mat);
  // rim
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.3, 12),
    new THREE.MeshStandardMaterial({ color: "#c8c8c8", metalness: 0.95, roughness: 0.05 })
  );
  rim.rotation.z = Math.PI / 2;
  m.add(rim);
  m.castShadow = true;
  return m;
}

// ─────────────────────────────────────────────────────────────────────────────
// Drift trail system
// ─────────────────────────────────────────────────────────────────────────────
class DriftTrail {
  points: THREE.Vector3[] = [];
  colors: number[] = [];
  line: THREE.Line;
  scene: THREE.Scene;

  constructor(scene: THREE.Scene, color: string) {
    this.scene = scene;
    const geo = new THREE.BufferGeometry();
    const col = new THREE.Color(color);
    const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.8, linewidth: 2 });
    this.line = new THREE.Line(geo, mat);
    this.line.frustumCulled = false;
    scene.add(this.line);
  }

  addPoint(pos: THREE.Vector3, sliding: boolean) {
    if (!sliding) { if (this.points.length > 0) this.points = []; return; }
    this.points.push(pos.clone());
    if (this.points.length > TRAIL_MAX) this.points.shift();
    this.update();
  }

  update() {
    const n = this.points.length;
    if (n < 2) return;
    const positions = new Float32Array(n * 3);
    const colors    = new Float32Array(n * 3);
    const col = new THREE.Color(CYAN);
    for (let i = 0; i < n; i++) {
      positions[i * 3 + 0] = this.points[i].x;
      positions[i * 3 + 1] = this.points[i].y;
      positions[i * 3 + 2] = this.points[i].z;
      const alpha = i / n;
      colors[i * 3 + 0] = col.r * alpha;
      colors[i * 3 + 1] = col.g * alpha;
      colors[i * 3 + 2] = col.b * alpha;
    }
    this.line.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.line.geometry.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    this.line.geometry.computeBoundingSphere();
  }

  dispose() { this.scene.remove(this.line); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function CyberCar() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const activeRef  = useRef(false);
  const [active, setActive] = useState(false);
  const [speed, setSpeed]   = useState(0);

  const toggle = useCallback(() => {
    setActive(a => {
      activeRef.current = !a;
      return !a;
    });
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current!;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x000000, 0);

    // ── Scene ────────────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 300);

    // ── Lighting ─────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x112244, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far  = 100;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -30;
    sun.shadow.camera.right= sun.shadow.camera.top    = 30;
    scene.add(sun);

    // Car headlights (SpotLights)
    const headlightL = new THREE.SpotLight(CYAN, 4, 18, Math.PI / 8, 0.4);
    const headlightR = headlightL.clone();
    headlightL.castShadow = headlightR.castShadow = true;
    scene.add(headlightL, headlightR);
    scene.add(headlightL.target, headlightR.target);

    // Underbody glow point light
    const underglow = new THREE.PointLight(CYAN, 2, 5);
    scene.add(underglow);

    // ── Contact shadow (fake soft shadow) ────────────────────────────────────
    const shadowGeo = new THREE.CircleGeometry(2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    scene.add(shadowMesh);

    // ── Ramp ─────────────────────────────────────────────────────────────────
    const rampGeo = new THREE.BoxGeometry(4, 1, 6);
    const rampMat = new THREE.MeshStandardMaterial({ color: "#1a1a2e", metalness: 0.6, roughness: 0.4 });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    // tilt so front is 0, back is +1 height
    rampMesh.rotation.x = -Math.atan2(1, 6);
    rampMesh.position.set(0, 0.5, -10);
    rampMesh.castShadow = rampMesh.receiveShadow = true;
    scene.add(rampMesh);

    // Ramp neon edges
    const rampEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(rampGeo),
      new THREE.LineBasicMaterial({ color: CYAN })
    );
    rampEdges.rotation.copy(rampMesh.rotation);
    rampEdges.position.copy(rampMesh.position);
    scene.add(rampEdges);

    // ── Ground grid ──────────────────────────────────────────────────────────
    const grid = new THREE.GridHelper(200, 80, 0x89dceb, 0x89dceb);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.06;
    grid.position.y = 0.01;
    scene.add(grid);

    // ── Car mesh ─────────────────────────────────────────────────────────────
    const carMesh = buildCarMesh();
    scene.add(carMesh);
    const wheelMeshes = [buildWheelMesh(), buildWheelMesh(), buildWheelMesh(), buildWheelMesh()];
    wheelMeshes.forEach(w => scene.add(w));

    // ── Drift trails ─────────────────────────────────────────────────────────
    const trails = [new DriftTrail(scene, CYAN), new DriftTrail(scene, CYAN),
                    new DriftTrail(scene, CAR_COLOR), new DriftTrail(scene, CAR_COLOR)];

    // ── Physics (cannon-es) ─────────────────────────────────────────────────
    let physicsCleanup: () => void = () => {};

    import("cannon-es").then(CANNON => {
      const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -25, 0) });
      world.broadphase = new CANNON.SAPBroadphase(world);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (world.solver as any).iterations = 10;
      world.allowSleep = true;

      // Ground
      const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
      groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
      world.addBody(groundBody);

      // Ramp physics body
      const rampBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(2, 0.5, 3)) });
      rampBody.position.set(0, 0.5, -10);
      rampBody.quaternion.setFromEuler(-Math.atan2(1, 6), 0, 0);
      world.addBody(rampBody);

      // ── DOM element walls ──────────────────────────────────────────────────
      const uiBodies: CannonType.Body[] = [];
      function syncUIBodies() {
        uiBodies.forEach(b => world.removeBody(b));
        uiBodies.length = 0;
        const els = document.querySelectorAll("[data-physics]");
        els.forEach(el => {
          const r = el.getBoundingClientRect();
          const ww = window.innerWidth, wh = window.innerHeight;
          const cx = (r.left + r.right  ) / 2 - ww / 2;
          const cy = (r.top  + r.bottom ) / 2 - wh / 2;
          const hw = r.width  / 2 / PX_PER_UNIT;
          const hh = r.height / 2 / PX_PER_UNIT;
          const body = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(hw, 1.5, hh)),
          });
          body.position.set(cx / PX_PER_UNIT, 1.5, cy / PX_PER_UNIT);
          world.addBody(body);
          uiBodies.push(body);
        });
      }
      syncUIBodies();
      window.addEventListener("resize", syncUIBodies);

      // ── Chassis ────────────────────────────────────────────────────────────
      const chassisBody = new CANNON.Body({
        mass: 150,
        shape: new CANNON.Box(new CANNON.Vec3(0.9, 0.3, 1.9)),
        linearDamping: 0.3,
        angularDamping: 0.4,
      });
      chassisBody.position.set(0, 2, 5);

      // ── RaycastVehicle ─────────────────────────────────────────────────────
      const vehicle = new CANNON.RaycastVehicle({
        chassisBody,
        indexRightAxis: 0,
        indexUpAxis: 1,
        indexForwardAxis: 2,
      });

      const wheelOpts = {
        radius: 0.38,
        directionLocal:  new CANNON.Vec3(0, -1, 0),
        axleLocal:       new CANNON.Vec3(-1, 0, 0),
        suspensionStiffness: 45,
        suspensionRestLength: 0.38,
        frictionSlip: 1.6,
        dampingRelaxation: 2.3,
        dampingCompression: 4.5,
        maxSuspensionForce: 100000,
        rollInfluence: 0.01,
        maxSuspensionTravel: 0.35,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true,
      };

      const connections: [number, number, number][] = [
        [-0.82,  0,  1.4],   // FL
        [ 0.82,  0,  1.4],   // FR
        [-0.82,  0, -1.4],   // RL
        [ 0.82,  0, -1.4],   // RR
      ];
      connections.forEach(([x, y, z]) => {
        vehicle.addWheel({ ...wheelOpts, chassisConnectionPointLocal: new CANNON.Vec3(x, y, z) });
      });
      vehicle.addToWorld(world);

      // ── Input ──────────────────────────────────────────────────────────────
      const keys: Record<string, boolean> = {};
      const onKey = (e: KeyboardEvent) => {
        keys[e.code] = e.type === "keydown";
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyW","KeyA","KeyS","KeyD"].includes(e.code))
          e.preventDefault();
      };
      window.addEventListener("keydown", onKey);
      window.addEventListener("keyup",   onKey);

      const MAX_STEER = 0.52;
      const ENGINE_FORCE = 900;
      const BRAKE_FORCE  = 28;
      let steerValue = 0;

      // ── Resize ────────────────────────────────────────────────────────────
      function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        canvas.width  = w;
        canvas.height = h;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      resize();
      window.addEventListener("resize", resize);

      // ── Loop ──────────────────────────────────────────────────────────────
      const fixedStep = 1 / 60;
      let last = performance.now();
      let rafId: number;

      function loop(now: number) {
        if (!activeRef.current) return;
        rafId = requestAnimationFrame(loop);

        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        // ── Apply inputs ────────────────────────────────────────────────────
        const fwd   = keys["ArrowUp"]    || keys["KeyW"];
        const back  = keys["ArrowDown"]  || keys["KeyS"];
        const left  = keys["ArrowLeft"]  || keys["KeyA"];
        const right = keys["ArrowRight"] || keys["KeyD"];
        const brake = keys["Space"];

        const engineF = fwd ? -ENGINE_FORCE : back ? ENGINE_FORCE * 0.6 : 0;
        const brakeF  = brake ? BRAKE_FORCE : 0;

        // Smooth steering
        const targetSteer = left ? MAX_STEER : right ? -MAX_STEER : 0;
        steerValue += (targetSteer - steerValue) * 0.18;

        vehicle.setSteeringValue(steerValue, 0);
        vehicle.setSteeringValue(steerValue, 1);
        vehicle.applyEngineForce(engineF, 2);
        vehicle.applyEngineForce(engineF, 3);
        vehicle.setBrake(brakeF, 0);
        vehicle.setBrake(brakeF, 1);
        vehicle.setBrake(brakeF * 0.5, 2);
        vehicle.setBrake(brakeF * 0.5, 3);

        world.step(fixedStep, dt, 3);

        // ── Sync car mesh ───────────────────────────────────────────────────
        const cp = chassisBody.position;
        const cq = chassisBody.quaternion;
        carMesh.position.set(cp.x, cp.y, cp.z);
        carMesh.quaternion.set(cq.x, cq.y, cq.z, cq.w);

        // ── Sync wheels ─────────────────────────────────────────────────────
        vehicle.wheelInfos.forEach((wheel, i) => {
          vehicle.updateWheelTransform(i);
          const t = wheel.worldTransform;
          wheelMeshes[i].position.set(t.position.x, t.position.y, t.position.z);
          wheelMeshes[i].quaternion.set(t.quaternion.x, t.quaternion.y, t.quaternion.z, t.quaternion.w);

          // Drift trails on rear wheels (2,3)
          const sliding = (brake || (fwd && Math.abs(steerValue) > 0.25)) && (i === 2 || i === 3);
          trails[i].addPoint(new THREE.Vector3(t.position.x, 0.05, t.position.z), sliding);
        });

        // ── Headlights & underglow ──────────────────────────────────────────
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
          new THREE.Quaternion(cq.x, cq.y, cq.z, cq.w)
        );
        const pos3 = new THREE.Vector3(cp.x, cp.y, cp.z);
        const right3 = new THREE.Vector3(1, 0, 0).applyQuaternion(new THREE.Quaternion(cq.x, cq.y, cq.z, cq.w));

        headlightL.position.copy(pos3.clone().add(right3.clone().multiplyScalar(-0.6)).add(new THREE.Vector3(0, 0.2, 0)).add(forward.clone().multiplyScalar(1.9)));
        headlightR.position.copy(pos3.clone().add(right3.clone().multiplyScalar( 0.6)).add(new THREE.Vector3(0, 0.2, 0)).add(forward.clone().multiplyScalar(1.9)));
        headlightL.target.position.copy(headlightL.position.clone().add(forward.clone().multiplyScalar(8)));
        headlightR.target.position.copy(headlightR.position.clone().add(forward.clone().multiplyScalar(8)));
        headlightL.target.updateMatrixWorld();
        headlightR.target.updateMatrixWorld();
        underglow.position.set(cp.x, cp.y - 0.25, cp.z);

        // ── Contact shadow ──────────────────────────────────────────────────
        shadowMesh.position.set(cp.x, 0.02, cp.z);

        // ── Camera follow ───────────────────────────────────────────────────
        const camOffset = forward.clone().multiplyScalar(-8).add(new THREE.Vector3(0, 4, 0));
        camera.position.lerp(pos3.clone().add(camOffset), 0.08);
        camera.lookAt(pos3.x, pos3.y + 0.5, pos3.z);

        // ── Speed HUD ───────────────────────────────────────────────────────
        const vel = chassisBody.velocity;
        const spd = Math.round(Math.sqrt(vel.x ** 2 + vel.z ** 2) * 10);
        setSpeed(spd);

        renderer.render(scene, camera);
      }
      rafId = requestAnimationFrame(loop);

      physicsCleanup = () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("keyup",   onKey);
        window.removeEventListener("resize",  resize);
        window.removeEventListener("resize",  syncUIBodies);
      };
    });

    return () => {
      physicsCleanup();
      trails.forEach(t => t.dispose());
      renderer.dispose();
    };
  }, [active]);

  return (
    <>
      {/* Transparent overlay canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 45, display: active ? "block" : "none" }}
      />

      {/* HUD */}
      {active && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2">
          <div className="font-mono text-xs text-slate-500 px-3 py-1 rounded-full border border-white/5 bg-black/50 backdrop-blur-md">
            WASD / ← → ↑ ↓ · SPACE = drift brake
          </div>
          <div className="font-mono font-bold text-2xl" style={{ color: CYAN, textShadow: `0 0 12px ${CYAN}` }}>
            {speed} <span className="text-xs text-slate-500">km/h</span>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full border font-mono text-xs font-bold transition-all hover:scale-105"
        style={active
          ? { background: "#e63946", borderColor: "#e63946", color: "#fff", boxShadow: "0 0 20px #e6394650" }
          : { background: "rgba(13,13,20,0.85)", borderColor: "rgba(137,220,235,0.3)", color: "#89dceb", backdropFilter: "blur(8px)" }
        }
      >
        {active ? "✕ Exit Drive" : "🏎 Drive Mode"}
      </button>
    </>
  );
}
