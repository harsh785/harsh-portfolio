"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import * as CANNON from "cannon-es";

const CYAN = "#89dceb";
const RED  = "#e63946";

// ── Car mesh ──────────────────────────────────────────────────────────────────
function makeCarMesh() {
  const g = new THREE.Group();
  const add = (
    geo: THREE.BufferGeometry,
    color: number | string,
    x = 0, y = 0, z = 0,
    emissive?: number | string
  ) => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.7,
      roughness: 0.3,
      ...(emissive ? { emissive, emissiveIntensity: 1.2 } : {}),
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
    return m;
  };

  add(new THREE.BoxGeometry(1.8, 0.38, 3.8), 0xe63946, 0, 0, 0);           // body
  add(new THREE.BoxGeometry(1.55, 0.42, 1.9), 0xe63946, 0, 0.38, -0.1);    // cab
  add(new THREE.BoxGeometry(1.82, 0.06, 3.82), 0x89dceb, 0, 0.22, 0, 0x89dceb); // stripe
  add(new THREE.BoxGeometry(1.6, 0.04, 3.4), 0x89dceb, 0, -0.2, 0, 0x89dceb);   // glow

  // windshield
  const wsMat = new THREE.MeshStandardMaterial({ color: 0xaef0ff, transparent: true, opacity: 0.45 });
  const ws = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.38, 0.06), wsMat);
  ws.position.set(0, 0.44, 0.89); ws.rotation.x = 0.28; g.add(ws);

  // headlights
  for (const x of [-0.62, 0.62])
    add(new THREE.BoxGeometry(0.28, 0.1, 0.04), 0xfff9c4, x, 0.1, 1.9, 0xffffff);
  // tail lights
  for (const x of [-0.62, 0.62])
    add(new THREE.BoxGeometry(0.28, 0.1, 0.04), 0xff2244, x, 0.1, -1.9, 0xff2244);

  return g;
}

function makeWheelMesh() {
  const g = new THREE.Group();
  const tyre = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.26, 18),
    new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.9 })
  );
  tyre.rotation.z = Math.PI / 2;
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.28, 12),
    new THREE.MeshStandardMaterial({ color: 0xbbbbbb, metalness: 0.95, roughness: 0.05 })
  );
  rim.rotation.z = Math.PI / 2;
  g.add(tyre, rim);
  return g;
}

// ── Drift trail ───────────────────────────────────────────────────────────────
class Trail {
  private pts: THREE.Vector3[] = [];
  private geo = new THREE.BufferGeometry();
  line: THREE.Line;
  constructor(scene: THREE.Scene, color: string) {
    this.line = new THREE.Line(this.geo,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 })
    );
    this.line.frustumCulled = false;
    scene.add(this.line);
  }
  add(p: THREE.Vector3, on: boolean) {
    if (!on) { this.pts = []; this.geo.deleteAttribute("position"); return; }
    this.pts.push(p.clone());
    if (this.pts.length > 100) this.pts.shift();
    const a = new Float32Array(this.pts.length * 3);
    this.pts.forEach((v, i) => { a[i*3]=v.x; a[i*3+1]=v.y; a[i*3+2]=v.z; });
    this.geo.setAttribute("position", new THREE.BufferAttribute(a, 3));
    this.geo.computeBoundingSphere();
  }
  dispose(scene: THREE.Scene) { scene.remove(this.line); }
}

// ── Main game component ───────────────────────────────────────────────────────
export default function CyberCarGame() {
  const mountRef  = useRef<HTMLDivElement>(null);
  const keysRef   = useRef<Record<string, boolean>>({});
  const [kmh,    setKmh]    = useState(0);
  const [laps,   setLaps]   = useState(0);
  const [started, setStarted] = useState(false);
  const [keys,   setKeysVis] = useState({ fwd:false, back:false, left:false, right:false, drift:false });

  // Expose key state for HUD
  const updateKeysHUD = () => {
    const k = keysRef.current;
    setKeysVis({
      fwd:   !!(k["ArrowUp"]   || k["KeyW"]),
      back:  !!(k["ArrowDown"] || k["KeyS"]),
      left:  !!(k["ArrowLeft"] || k["KeyA"]),
      right: !!(k["ArrowRight"]|| k["KeyD"]),
      drift: !!(k["Space"]),
    });
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const W = window.innerWidth;
    const H = window.innerHeight - 56; // subtract header
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setClearColor(0x050510, 1);
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    // ── Scene ─────────────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, 0.016);
    const camera = new THREE.PerspectiveCamera(58, W / H, 0.1, 300);
    camera.position.set(0, 8, 18);
    camera.lookAt(0, 0, 0);

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x223355, 2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.4);
    dir.position.set(20, 30, 20); dir.castShadow = true;
    dir.shadow.camera.left = dir.shadow.camera.bottom = -50;
    dir.shadow.camera.right = dir.shadow.camera.top = 50;
    dir.shadow.mapSize.set(2048, 2048);
    scene.add(dir);
    const hlL = new THREE.SpotLight(CYAN, 5, 22, Math.PI / 9, 0.4);
    const hlR = new THREE.SpotLight(CYAN, 5, 22, Math.PI / 9, 0.4);
    hlL.castShadow = hlR.castShadow = true;
    scene.add(hlL, hlR, hlL.target, hlR.target);
    const glow = new THREE.PointLight(CYAN, 3, 5);
    scene.add(glow);

    // ── Ground ────────────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x080818, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(200, 50, 0x89dceb, 0x89dceb);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.1;
    grid.position.y = 0.01;
    scene.add(grid);

    // ── Buildings ─────────────────────────────────────────────────────────────
    const bldMat = new THREE.MeshStandardMaterial({ color: 0x0b0d22, metalness: 0.4, roughness: 0.7 });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x89dceb });
    const bldBodies: CANNON.Body[] = [];
    const bldData = [
      [-20,-20,4,10,4],[ 20,-20,4,14,4],[-20, 20,4,8,4],[ 20, 20,4,12,4],
      [  0,-25,6,9,4], [  0, 25,6,11,4],[-25,  0,4,10,6],[ 25,  0,4,13,6],
    ] as [number,number,number,number,number][];
    bldData.forEach(([x,z,w,h,d]) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, bldMat);
      mesh.position.set(x, h/2, z);
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat.clone());
      edges.position.copy(mesh.position);
      scene.add(edges);
      const body = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2)) });
      body.position.set(x, h/2, z);
      bldBodies.push(body);
    });

    // ── Ramp ──────────────────────────────────────────────────────────────────
    const rampAngle = Math.atan2(1.8, 7);
    const rampMesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 1.8, 7),
      new THREE.MeshStandardMaterial({ color: 0x12103a, metalness: 0.5, roughness: 0.5 })
    );
    rampMesh.rotation.x = -rampAngle;
    rampMesh.position.set(0, 0.9, 0);
    rampMesh.castShadow = rampMesh.receiveShadow = true;
    scene.add(rampMesh);
    const re = new THREE.LineSegments(
      new THREE.EdgesGeometry(rampMesh.geometry),
      new THREE.LineBasicMaterial({ color: RED })
    );
    re.rotation.copy(rampMesh.rotation); re.position.copy(rampMesh.position);
    scene.add(re);

    // ── Shadow blob ───────────────────────────────────────────────────────────
    const shadowBlob = new THREE.Mesh(
      new THREE.CircleGeometry(2, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false })
    );
    shadowBlob.rotation.x = -Math.PI / 2;
    shadowBlob.position.y = 0.02;
    scene.add(shadowBlob);

    // ── Car ───────────────────────────────────────────────────────────────────
    const carMesh = makeCarMesh();
    scene.add(carMesh);
    const wheelMeshes = [0,1,2,3].map(() => makeWheelMesh());
    wheelMeshes.forEach(w => scene.add(w));
    const trails = [
      new Trail(scene, CYAN), new Trail(scene, CYAN),
      new Trail(scene, RED),  new Trail(scene, RED),
    ];

    // ── Physics world ─────────────────────────────────────────────────────────
    const world = new CANNON.World();
    world.gravity.set(0, -22, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = false;

    // Ground
    const gndBody = new CANNON.Body({ mass: 0 });
    gndBody.addShape(new CANNON.Plane());
    gndBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(gndBody);

    // Ramp
    const rampBody = new CANNON.Body({ mass: 0 });
    rampBody.addShape(new CANNON.Box(new CANNON.Vec3(2.5, 0.9, 3.5)));
    rampBody.position.set(0, 0.9, 0);
    rampBody.quaternion.setFromEuler(-rampAngle, 0, 0);
    world.addBody(rampBody);

    // Buildings
    bldBodies.forEach((b, i) => {
      const [x, z, w, , d] = bldData[i];
      const h = bldData[i][3];
      b.addShape(new CANNON.Box(new CANNON.Vec3(w/2, h/2, d/2)));
      b.position.set(x, h/2, z);
      world.addBody(b);
    });

    // Chassis
    const chassisBody = new CANNON.Body({ mass: 160 });
    chassisBody.addShape(new CANNON.Box(new CANNON.Vec3(0.85, 0.25, 1.85)));
    chassisBody.position.set(0, 3, 14);   // start high so it falls to ground
    chassisBody.linearDamping  = 0.2;
    chassisBody.angularDamping = 0.5;
    chassisBody.allowSleep = false;

    // RaycastVehicle
    const vehicle = new CANNON.RaycastVehicle({
      chassisBody,
      indexRightAxis:   0,
      indexUpAxis:      1,
      indexForwardAxis: 2,
    });

    const wheelOpts = {
      radius: 0.36,
      directionLocal:  new CANNON.Vec3(0, -1, 0),
      axleLocal:       new CANNON.Vec3(-1, 0, 0),
      suspensionStiffness:   45,
      suspensionRestLength:  0.45,
      frictionSlip:          1.6,
      dampingRelaxation:     2.3,
      dampingCompression:    4.5,
      maxSuspensionForce:    100000,
      rollInfluence:         0.02,
      maxSuspensionTravel:   0.4,
      customSlidingRotationalSpeed: -30,
      useCustomSlidingRotationalSpeed: true,
    };

    // Connection points (local to chassis): FL, FR, RL, RR
    const conns: [number, number, number][] = [
      [-0.8, 0, 1.4],
      [ 0.8, 0, 1.4],
      [-0.8, 0,-1.4],
      [ 0.8, 0,-1.4],
    ];
    conns.forEach(([x, y, z]) =>
      vehicle.addWheel({ ...wheelOpts, chassisConnectionPointLocal: new CANNON.Vec3(x, y, z) })
    );
    vehicle.addToWorld(world);

    // ── Input ─────────────────────────────────────────────────────────────────
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
      setStarted(true);
      updateKeysHUD();
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space","KeyW","KeyA","KeyS","KeyD"]
          .includes(e.code)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      updateKeysHUD();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight - 56;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    // ── Physics constants ─────────────────────────────────────────────────────
    const FIXED_STEP  = 1 / 60;
    const ENGINE_F    = 1200;
    const MAX_STEER   = 0.48;
    const BRAKE_IDLE  = 6;
    let steerVal      = 0;
    let lastLapSide   = 1;
    let lapCount      = 0;
    let frameId       = 0;
    let lastTime      = -1;

    // ── Render loop ───────────────────────────────────────────────────────────
    const loop = (t: number) => {
      frameId = requestAnimationFrame(loop);

      if (lastTime < 0) { lastTime = t; }
      const dt = Math.min((t - lastTime) / 1000, 0.05);
      lastTime = t;

      const k = keysRef.current;
      const fwd   = !!(k["ArrowUp"]    || k["KeyW"]);
      const back  = !!(k["ArrowDown"]  || k["KeyS"]);
      const left  = !!(k["ArrowLeft"]  || k["KeyA"]);
      const right = !!(k["ArrowRight"] || k["KeyD"]);
      const drift = !!(k["Space"]);

      // Smooth steering
      const tgtSteer = left ? MAX_STEER : right ? -MAX_STEER : 0;
      steerVal += (tgtSteer - steerVal) * 0.14;

      vehicle.setSteeringValue(steerVal, 0);
      vehicle.setSteeringValue(steerVal, 1);

      const force = fwd ? -ENGINE_F : back ? ENGINE_F * 0.55 : 0;
      vehicle.applyEngineForce(force, 2);
      vehicle.applyEngineForce(force, 3);

      const bk = drift ? 40 : !fwd && !back ? BRAKE_IDLE : 0;
      vehicle.setBrake(bk * 0.3, 0);
      vehicle.setBrake(bk * 0.3, 1);
      vehicle.setBrake(bk, 2);
      vehicle.setBrake(bk, 3);

      world.step(FIXED_STEP, dt, 3);

      // Sync car mesh
      const cp = chassisBody.position;
      const cq = chassisBody.quaternion;
      const tq = new THREE.Quaternion(cq.x, cq.y, cq.z, cq.w);
      carMesh.position.set(cp.x, cp.y, cp.z);
      carMesh.quaternion.copy(tq);

      // Sync wheels + trails
      const vel   = chassisBody.velocity;
      const speed = Math.sqrt(vel.x ** 2 + vel.z ** 2);
      const isDrifting = drift && speed > 2;

      vehicle.wheelInfos.forEach((wi, i) => {
        vehicle.updateWheelTransform(i);
        const wt = wi.worldTransform;
        wheelMeshes[i].position.set(wt.position.x, wt.position.y, wt.position.z);
        wheelMeshes[i].quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
        trails[i].add(new THREE.Vector3(wt.position.x, 0.04, wt.position.z), isDrifting && i >= 2);
      });

      // Lights
      const fwdV  = new THREE.Vector3(0, 0, 1).applyQuaternion(tq);
      const rgtV  = new THREE.Vector3(1, 0, 0).applyQuaternion(tq);
      const carP  = new THREE.Vector3(cp.x, cp.y, cp.z);

      for (const [hl, sign] of [[hlL, -0.65], [hlR, 0.65]] as [THREE.SpotLight, number][]) {
        hl.position.copy(carP.clone().add(rgtV.clone().multiplyScalar(sign)).add(new THREE.Vector3(0, 0.3, 0)).add(fwdV.clone().multiplyScalar(1.9)));
        hl.target.position.copy(hl.position.clone().add(fwdV.clone().multiplyScalar(12)));
        hl.target.updateMatrixWorld();
      }
      glow.position.set(cp.x, cp.y - 0.28, cp.z);
      shadowBlob.position.set(cp.x, 0.02, cp.z);

      // Camera
      const camTgt = carP.clone().add(fwdV.clone().multiplyScalar(-10)).add(new THREE.Vector3(0, 5.5, 0));
      camera.position.lerp(camTgt, 0.06);
      camera.lookAt(cp.x, cp.y + 0.8, cp.z);

      // HUD
      setKmh(Math.round(speed * 11));
      const side = Math.sign(cp.z);
      if (side !== lastLapSide && speed > 3) { lapCount++; setLaps(lapCount); lastLapSide = side; }

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup",   onKeyUp);
      window.removeEventListener("resize",  onResize);
      trails.forEach(t => t.dispose(scene));
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const Btn = ({ label, active }: { label: string; active: boolean }) => (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded text-xs font-bold border transition-colors"
      style={{ borderColor: active ? CYAN : "rgba(255,255,255,0.15)", background: active ? `${CYAN}22` : "transparent", color: active ? CYAN : "#4a5568" }}>
      {label}
    </span>
  );

  return (
    <div className="fixed inset-0 flex flex-col select-none" style={{ background: "#050510", fontFamily: "JetBrains Mono, monospace" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 h-14 border-b shrink-0"
        style={{ borderColor: "rgba(137,220,235,0.15)", background: "rgba(5,5,16,0.98)" }}>

        <div className="flex items-center gap-4">
          <span className="text-sm font-bold tracking-widest" style={{ color: CYAN }}>🏎 CYBER DEVOPS CIRCUIT</span>
          {!started && (
            <span className="text-xs animate-pulse" style={{ color: "#6c7086" }}>Press W or ↑ to start driving</span>
          )}
        </div>

        {/* Key visualizer */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <Btn label="W" active={keys.fwd} />
            <div className="flex gap-1">
              <Btn label="A" active={keys.left} />
              <Btn label="S" active={keys.back} />
              <Btn label="D" active={keys.right} />
            </div>
          </div>
          <Btn label="⎵" active={keys.drift} />
        </div>

        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="text-2xl font-black tabular-nums" style={{ color: CYAN, textShadow: `0 0 10px ${CYAN}` }}>
              {kmh}<span className="text-xs font-normal text-slate-600 ml-1">km/h</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600 uppercase tracking-wider">Laps</div>
            <div className="text-xl font-black" style={{ color: RED }}>{laps}</div>
          </div>
          <Link href="/" className="px-4 py-1.5 rounded-lg border text-sm transition-all hover:scale-105"
            style={{ borderColor: "rgba(137,220,235,0.3)", color: CYAN, background: "rgba(137,220,235,0.06)" }}>
            ← Portfolio
          </Link>
        </div>
      </div>

      {/* ── 3D Canvas ─────────────────────────────────────────────────────── */}
      <div ref={mountRef} className="flex-1 cursor-crosshair" />

      {/* ── Controls hint ─────────────────────────────────────────────────── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-slate-700 pointer-events-none tracking-wide">
        W/S — throttle/brake · A/D — steer · SPACE — drift · hit ramp to jump
      </div>
    </div>
  );
}
