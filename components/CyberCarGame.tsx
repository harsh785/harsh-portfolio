"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import * as CANNON from "cannon-es";

// ── Palette ───────────────────────────────────────────────────────────────────
const C_RED   = 0xe63946;
const C_CYAN  = 0x89dceb;
const C_PURPLE= 0xcba6f7;
const C_BG    = 0x050510;
const S_CYAN  = "#89dceb";
const S_RED   = "#e63946";

// ── Build low-poly Cybertruck car ─────────────────────────────────────────────
function makeCarMesh() {
  const g = new THREE.Group();
  const body  = new THREE.MeshStandardMaterial({ color: C_RED,   metalness: 0.7, roughness: 0.25 });
  const accent= new THREE.MeshStandardMaterial({ color: C_CYAN,  emissive: C_CYAN, emissiveIntensity: 0.9, metalness: 0.9, roughness: 0.1 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xaef0ff, transparent: true, opacity: 0.5, metalness: 0.1, roughness: 0.05 });
  const dark  = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.4, roughness: 0.8 });

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x=0,y=0,z=0, rx=0,ry=0,rz=0) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=true; g.add(m); return m;
  };

  add(new THREE.BoxGeometry(1.8, 0.4, 3.8), body,   0, 0.05, 0);        // chassis
  add(new THREE.BoxGeometry(1.6, 0.48, 2.0), body,  0, 0.48, -0.1);     // cab
  add(new THREE.BoxGeometry(1.82,0.06, 3.82), accent,0,0.28, 0);         // stripe
  add(new THREE.BoxGeometry(1.6, 0.04, 3.4), accent, 0,-0.22, 0);        // underglow
  add(new THREE.BoxGeometry(1.46,0.4,  0.05), glass, 0, 0.52, 0.9,  0.28,0,0); // windshield
  add(new THREE.BoxGeometry(1.46,0.36, 0.05), glass, 0, 0.52,-1.1,-0.24,0,0);  // rear window
  add(new THREE.BoxGeometry(1.8, 0.26, 0.16), dark,  0,-0.06, 2.0);      // front bumper
  // headlights
  for (const x of [-0.62, 0.62]) add(new THREE.BoxGeometry(0.3,0.11,0.04), accent, x, 0.1, 1.93);
  // tail lights
  for (const x of [-0.62, 0.62]) {
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xff2244, emissive: 0xff2244, emissiveIntensity: 2 });
    add(new THREE.BoxGeometry(0.3,0.1,0.04), tlMat, x, 0.1, -1.93);
  }
  return g;
}

function makeWheelMesh() {
  const g = new THREE.Group();
  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38,0.38,0.28,20),
    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.9 })
  );
  tyre.rotation.z = Math.PI / 2;
  tyre.castShadow = true;
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2,0.2,0.3,14),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.95, roughness: 0.05 })
  );
  rim.rotation.z = Math.PI / 2;
  g.add(tyre, rim);
  return g;
}

// ── Drift trail ───────────────────────────────────────────────────────────────
class Trail {
  pts: THREE.Vector3[] = [];
  line: THREE.Line;
  constructor(scene: THREE.Scene, color: number) {
    const geo = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({ color, vertexColors: false, transparent: true, opacity: 0.7 });
    this.line = new THREE.Line(geo, mat);
    this.line.frustumCulled = false;
    scene.add(this.line);
  }
  push(p: THREE.Vector3, active: boolean) {
    if (!active) { this.pts = []; this.flush(); return; }
    this.pts.push(p.clone());
    if (this.pts.length > 120) this.pts.shift();
    this.flush();
  }
  flush() {
    if (this.pts.length < 2) return;
    const arr = new Float32Array(this.pts.length * 3);
    this.pts.forEach((v,i) => { arr[i*3]=v.x; arr[i*3+1]=v.y; arr[i*3+2]=v.z; });
    this.line.geometry.setAttribute("position", new THREE.BufferAttribute(arr,3));
    this.line.geometry.computeBoundingSphere();
  }
  dispose(scene: THREE.Scene) { scene.remove(this.line); }
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function CyberCarGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [kmh, setKmh] = useState(0);
  const [lap,  setLap]  = useState(0);
  const [info, setInfo] = useState("WASD / Arrow Keys · SPACE = Drift Brake");

  useEffect(() => {
    const mount = mountRef.current!;

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(C_BG, 1);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // ── Scene / Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.fog = new THREE.FogExp2(C_BG, 0.018);
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 300);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x112244, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(15, 30, 15);
    sun.castShadow = true;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 120;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -40;
    sun.shadow.camera.right= sun.shadow.camera.top    =  40;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const hlL = new THREE.SpotLight(S_CYAN, 6, 20, Math.PI/9, 0.5);
    const hlR = hlL.clone() as THREE.SpotLight;
    hlL.castShadow = hlR.castShadow = true;
    scene.add(hlL, hlR, hlL.target, hlR.target);
    const underglow = new THREE.PointLight(S_CYAN, 2.5, 6);
    scene.add(underglow);

    // ── Ground ────────────────────────────────────────────────────────────────
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200, 40, 40),
      new THREE.MeshStandardMaterial({ color: 0x0a0a1a, metalness: 0.1, roughness: 0.95 })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Grid overlay
    const grid = new THREE.GridHelper(200, 60, C_CYAN, C_PURPLE);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.12;
    grid.position.y = 0.02;
    scene.add(grid);

    // ── Cyberpunk buildings (obstacles) ───────────────────────────────────────
    const buildings: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
    const bldMat = new THREE.MeshStandardMaterial({ color: 0x0d1028, metalness: 0.5, roughness: 0.6 });
    const edgeMat = new THREE.LineBasicMaterial({ color: C_CYAN });
    const buildingData = [
      { x:-18, z:-18, w:4, h:8,  d:4 },
      { x: 18, z:-18, w:4, h:12, d:4 },
      { x:-18, z: 18, w:4, h:6,  d:4 },
      { x: 18, z: 18, w:4, h:10, d:4 },
      { x: 0,  z:-22, w:6, h:7,  d:4 },
      { x: 0,  z: 22, w:6, h:9,  d:4 },
      { x:-22, z: 0,  w:4, h:8,  d:6 },
      { x: 22, z: 0,  w:4, h:11, d:6 },
    ];
    buildingData.forEach(({ x, z, w, h, d }) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, bldMat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
      // neon edges
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
      edges.position.copy(mesh.position);
      scene.add(edges);
      buildings.push({ mesh, body: new CANNON.Body({ mass: 0 }) }); // body added below
    });

    // ── Ramp ──────────────────────────────────────────────────────────────────
    const rampAngle = Math.atan2(2, 8);
    const rampMesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 2, 8),
      new THREE.MeshStandardMaterial({ color: 0x1a1a3a, metalness: 0.6, roughness: 0.4 })
    );
    rampMesh.rotation.x = -rampAngle;
    rampMesh.position.set(0, 1, 0);
    rampMesh.castShadow = rampMesh.receiveShadow = true;
    scene.add(rampMesh);
    const rampEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(rampMesh.geometry),
      new THREE.LineBasicMaterial({ color: S_RED })
    );
    rampEdge.rotation.copy(rampMesh.rotation);
    rampEdge.position.copy(rampMesh.position);
    scene.add(rampEdge);

    // ── Contact shadow ─────────────────────────────────────────────────────────
    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.03;
    scene.add(shadowMesh);

    // ── Car mesh ──────────────────────────────────────────────────────────────
    const carMesh = makeCarMesh();
    scene.add(carMesh);
    const wheelMeshes = [0,1,2,3].map(() => makeWheelMesh());
    wheelMeshes.forEach(w => scene.add(w));

    // ── Drift trails ──────────────────────────────────────────────────────────
    const trails = [
      new Trail(scene, C_CYAN), new Trail(scene, C_CYAN),
      new Trail(scene, C_RED),  new Trail(scene, C_RED),
    ];

    // ── Physics ───────────────────────────────────────────────────────────────
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -25, 0) });
    world.broadphase = new CANNON.SAPBroadphase(world);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (world.solver as any).iterations = 10;
    world.allowSleep = false;

    // Ground body
    const groundBody = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Ramp body
    const rampBody = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(2.5, 1, 4)) });
    rampBody.position.set(0, 1, 0);
    rampBody.quaternion.setFromEuler(-rampAngle, 0, 0);
    world.addBody(rampBody);

    // Building bodies
    buildingData.forEach(({ x, z, w, h, d }, i) => {
      const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2)) });
      body.position.set(x, h/2, z);
      world.addBody(body);
      buildings[i].body = body;
    });

    // Chassis
    const chassisBody = new CANNON.Body({
      mass: 180,
      shape: new CANNON.Box(new CANNON.Vec3(0.9, 0.28, 1.9)),
      linearDamping: 0.25,
      angularDamping: 0.5,
    });
    chassisBody.position.set(0, 1.5, 8);

    // RaycastVehicle
    const vehicle = new CANNON.RaycastVehicle({
      chassisBody,
      indexRightAxis:   0,  // X
      indexUpAxis:      1,  // Y
      indexForwardAxis: 2,  // Z
    });

    const wOpts = {
      radius: 0.38,
      directionLocal:   new CANNON.Vec3(0, -1, 0),
      axleLocal:        new CANNON.Vec3(-1, 0, 0),
      suspensionStiffness: 50,
      suspensionRestLength: 0.4,
      frictionSlip: 1.5,
      dampingRelaxation: 2.3,
      dampingCompression: 4.5,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      maxSuspensionTravel: 0.35,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };
    // FL, FR, RL, RR
    [[-0.85, 0, 1.5], [0.85, 0, 1.5], [-0.85, 0, -1.5], [0.85, 0, -1.5]].forEach(([x, y, z]) => {
      vehicle.addWheel({ ...wOpts, chassisConnectionPointLocal: new CANNON.Vec3(x, y, z) });
    });
    vehicle.addToWorld(world);

    // ── Input ─────────────────────────────────────────────────────────────────
    const keys: Record<string, boolean> = {};
    const handleKey = (e: KeyboardEvent) => {
      const down = e.type === "keydown";
      keys[e.code] = down;
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space",
           "KeyW","KeyA","KeyS","KeyD"].includes(e.code)) e.preventDefault();
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup",   handleKey);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Loop ──────────────────────────────────────────────────────────────────
    const FIXED = 1 / 60;
    const ENGINE = 1100;
    const MAX_STEER = 0.5;
    let steer = 0;
    let lastT = performance.now();
    let running = true;
    let lapCount = 0;
    let lastSide = Math.sign(chassisBody.position.z);

    function loop(now: number) {
      if (!running) return;
      requestAnimationFrame(loop);

      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      // ── Apply controls ────────────────────────────────────────────────────
      const fwd   = keys["ArrowUp"]    || keys["KeyW"];
      const back  = keys["ArrowDown"]  || keys["KeyS"];
      const left  = keys["ArrowLeft"]  || keys["KeyA"];
      const right = keys["ArrowRight"] || keys["KeyD"];
      const space = keys["Space"];

      // Smooth steer
      const targetS = left ? MAX_STEER : right ? -MAX_STEER : 0;
      steer += (targetS - steer) * 0.15;

      vehicle.setSteeringValue(steer, 0);
      vehicle.setSteeringValue(steer, 1);

      const eForce = fwd ? -ENGINE : back ? ENGINE * 0.55 : 0;
      vehicle.applyEngineForce(eForce, 2);
      vehicle.applyEngineForce(eForce, 3);

      const brakeF = space ? 35 : (fwd || back) ? 0 : 8;
      vehicle.setBrake(brakeF * 0.3, 0);
      vehicle.setBrake(brakeF * 0.3, 1);
      vehicle.setBrake(brakeF, 2);
      vehicle.setBrake(brakeF, 3);

      world.step(FIXED, dt, 3);

      // ── Sync car ──────────────────────────────────────────────────────────
      const cp = chassisBody.position;
      const cq = chassisBody.quaternion;
      const tq = new THREE.Quaternion(cq.x, cq.y, cq.z, cq.w);
      carMesh.position.set(cp.x, cp.y, cp.z);
      carMesh.quaternion.copy(tq);

      // ── Sync wheels + trails ──────────────────────────────────────────────
      const vel = chassisBody.velocity;
      const speed = Math.sqrt(vel.x**2 + vel.z**2);
      const drifting = space && speed > 3;

      vehicle.wheelInfos.forEach((wi, i) => {
        vehicle.updateWheelTransform(i);
        const wt = wi.worldTransform;
        wheelMeshes[i].position.set(wt.position.x, wt.position.y, wt.position.z);
        wheelMeshes[i].quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
        const isRear = i >= 2;
        trails[i].push(new THREE.Vector3(wt.position.x, 0.05, wt.position.z), drifting && isRear);
      });

      // ── Lights follow car ─────────────────────────────────────────────────
      const fwdV = new THREE.Vector3(0, 0, 1).applyQuaternion(tq);
      const rightV = new THREE.Vector3(1, 0, 0).applyQuaternion(tq);
      const carP = new THREE.Vector3(cp.x, cp.y, cp.z);

      for (const [hl, side] of [[hlL, -0.65], [hlR, 0.65]] as [THREE.SpotLight, number][]) {
        hl.position.copy(carP.clone().add(rightV.clone().multiplyScalar(side)).add(new THREE.Vector3(0, 0.25, 0)).add(fwdV.clone().multiplyScalar(2)));
        hl.target.position.copy(hl.position.clone().add(fwdV.clone().multiplyScalar(10)));
        hl.target.updateMatrixWorld();
      }
      underglow.position.set(cp.x, cp.y - 0.3, cp.z);

      // Contact shadow follows car
      shadowMesh.position.set(cp.x, 0.03, cp.z);

      // ── Camera chase ─────────────────────────────────────────────────────
      const camTarget = carP.clone()
        .add(fwdV.clone().multiplyScalar(-9))
        .add(new THREE.Vector3(0, 5, 0));
      camera.position.lerp(camTarget, 0.07);
      camera.lookAt(cp.x, cp.y + 0.8, cp.z);

      // ── HUD ───────────────────────────────────────────────────────────────
      setKmh(Math.round(speed * 12));

      // Simple lap counter: cross z=0 line
      const side = Math.sign(cp.z);
      if (side !== lastSide && speed > 2) { lapCount++; setLap(lapCount); lastSide = side; }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(loop);

    return () => {
      running = false;
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup",   handleKey);
      window.removeEventListener("resize",  onResize);
      trails.forEach(t => t.dispose(scene));
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050510] flex flex-col" style={{ fontFamily: "JetBrains Mono, monospace" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: "rgba(137,220,235,0.15)", background: "rgba(5,5,16,0.95)" }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold" style={{ color: S_CYAN }}>🏎 CYBER DEVOPS CIRCUIT</span>
          <span className="text-xs px-2 py-0.5 rounded border" style={{ color: "#6c7086", borderColor: "rgba(255,255,255,0.08)" }}>
            WASD · SPACE=drift
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-black" style={{ color: S_CYAN, textShadow: `0 0 12px ${S_CYAN}` }}>
              {kmh} <span className="text-xs font-normal text-slate-500">km/h</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">LAPS</div>
            <div className="text-xl font-black" style={{ color: S_RED }}>{lap}</div>
          </div>
          <Link href="/harsh-portfolio/"
            className="px-4 py-2 rounded-lg border text-sm transition-all hover:scale-105"
            style={{ borderColor: "rgba(137,220,235,0.3)", color: S_CYAN, background: "rgba(137,220,235,0.05)" }}>
            ← Portfolio
          </Link>
        </div>
      </div>

      {/* 3D Canvas container */}
      <div ref={mountRef} className="flex-1" />

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-600 pointer-events-none">
        W/S — accelerate/brake · A/D — steer · SPACE — drift brake · drive over ramp to jump
      </div>
    </div>
  );
}
