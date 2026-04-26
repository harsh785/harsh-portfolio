"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import * as CANNON from "cannon-es";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  sky:       0x87c8e8,
  ground:    0x8cc966,
  groundDim: 0x6aad47,
  road:      0xd4bc8a,
  trunk:     0x8b6343,
  leaf:      0x4a9e4a,
  leafDark:  0x2e7d2e,
  car:       0xe63946,
  carDark:   0xb02030,
  wheel:     0x222222,
  sign:      0xfef9ef,
  post:      0xa0734a,
  water:     0x4fc3f7,
  fence:     0xd4bc8a,
  rock:      0x9e9e9e,
  hill:      0x7ec850,
};

function flat(color: number) {
  return new THREE.MeshLambertMaterial({ color, flatShading: true });
}

// ─── Tree ─────────────────────────────────────────────────────────────────────
function makeTree(x: number, z: number, scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.17 * scale, 0.9 * scale, 6),
    flat(C.trunk)
  );
  trunk.position.y = 0.45 * scale;
  const c1 = new THREE.Mesh(
    new THREE.ConeGeometry(0.7 * scale, 1.2 * scale, 6),
    flat(C.leaf)
  );
  c1.position.y = 1.5 * scale;
  const c2 = new THREE.Mesh(
    new THREE.ConeGeometry(0.55 * scale, 1.0 * scale, 6),
    flat(C.leafDark)
  );
  c2.position.y = 2.1 * scale;
  const c3 = new THREE.Mesh(
    new THREE.ConeGeometry(0.35 * scale, 0.8 * scale, 6),
    flat(C.leaf)
  );
  c3.position.y = 2.65 * scale;
  g.add(trunk, c1, c2, c3);
  g.position.set(x, 0, z);
  g.rotation.y = Math.random() * Math.PI * 2;
  g.traverse(m => { if ((m as THREE.Mesh).isMesh) m.castShadow = true; });
  return g;
}

// ─── Rock ─────────────────────────────────────────────────────────────────────
function makeRock(x: number, z: number) {
  const g = new THREE.Group();
  const geo = new THREE.DodecahedronGeometry(0.4 + Math.random() * 0.3, 0);
  geo.rotateY(Math.random() * 3);
  const m = new THREE.Mesh(geo, flat(C.rock));
  m.scale.y = 0.6;
  m.castShadow = true;
  g.add(m);
  g.position.set(x, 0.15, z);
  return g;
}

// ─── Sign post ────────────────────────────────────────────────────────────────
function makeSign(label: string, color = C.car) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6),
    flat(C.post)
  );
  post.position.y = 1.2;
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.8, 0.12),
    flat(color)
  );
  board.position.y = 2.5;
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.0, 0.08),
    flat(C.sign)
  );
  border.position.y = 2.5;
  border.position.z = -0.08;
  g.add(post, border, board);
  g.traverse(m => { if ((m as THREE.Mesh).isMesh) m.castShadow = true; });
  return g;
}

// ─── Car mesh ─────────────────────────────────────────────────────────────────
function makeCarMesh() {
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, color: number, x=0,y=0,z=0) => {
    const m = new THREE.Mesh(geo, flat(color));
    m.position.set(x,y,z); m.castShadow = true; g.add(m); return m;
  };
  add(new THREE.BoxGeometry(1.7, 0.4, 3.6), C.car);
  add(new THREE.BoxGeometry(1.45, 0.5, 1.8), C.car,    0, 0.42, -0.1);
  add(new THREE.BoxGeometry(1.72, 0.06, 3.62), C.carDark, 0, 0.22, 0);
  for (const x of [-0.58, 0.58])
    add(new THREE.BoxGeometry(0.26, 0.1, 0.06), 0xfff9c4, x, 0.08, 1.83);
  for (const x of [-0.58, 0.58])
    add(new THREE.BoxGeometry(0.26, 0.1, 0.06), 0xff2244, x, 0.08,-1.83);
  return g;
}

// ─── Zones ────────────────────────────────────────────────────────────────────
type Zone = {
  id: string;
  label: string;
  color: number;
  pos: [number, number];
  radius: number;
  content: { title: string; lines: string[] };
};

const ZONES: Zone[] = [
  {
    id: "home",
    label: "HD",
    color: 0x89dceb,
    pos: [0, 0],
    radius: 10,
    content: {
      title: "Harsh Dixit",
      lines: ["Senior Cloud & DevOps Engineer", "AWS SAA-C03 Certified", "Drive around to explore my world →"],
    },
  },
  {
    id: "about",
    label: "About",
    color: 0xa6e3a1,
    pos: [-30, -28],
    radius: 9,
    content: {
      title: "About Me",
      lines: [
        "5+ years in Cloud & DevOps",
        "Currently @ Caylent",
        "AWS · Terraform · Kubernetes · Python",
        "I build infra that scales.",
      ],
    },
  },
  {
    id: "experience",
    label: "Experience",
    color: 0xcba6f7,
    pos: [34, -22],
    radius: 9,
    content: {
      title: "Experience",
      lines: [
        "Caylent — Senior DevOps Engineer",
        "Accenture — Cloud Consultant",
        "CI/CD · GitOps · IaC · Observability",
        "Platform engineering at scale",
      ],
    },
  },
  {
    id: "skills",
    label: "Skills",
    color: 0xf9e2af,
    pos: [-28, 32],
    radius: 9,
    content: {
      title: "Skills",
      lines: [
        "AWS · GCP · Azure",
        "Terraform · Ansible · Helm",
        "Docker · Kubernetes · ArgoCD",
        "Python · Bash · TypeScript",
      ],
    },
  },
  {
    id: "contact",
    label: "Contact",
    color: 0xf38ba8,
    pos: [28, 34],
    radius: 9,
    content: {
      title: "Say Hello",
      lines: [
        "harsh.dixit@caylent.com",
        "github.com/harsh785",
        "linkedin.com/in/harshdixit",
        "Let's build something great.",
      ],
    },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CyberCarGame() {
  const mountRef  = useRef<HTMLDivElement>(null);
  const keysRef   = useRef<Record<string, boolean>>({});
  const [kmh, setKmh]         = useState(0);
  const [zone, setZone]       = useState<Zone | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.sky);
    scene.fog = new THREE.Fog(C.sky, 40, 120);

    // ── Lights ──
    const hemi = new THREE.HemisphereLight(0x87ceeb, 0x6aad47, 1.2);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff8e7, 1.8);
    sun.position.set(30, 50, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far  = 200;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -80;
    sun.shadow.camera.right = sun.shadow.camera.top  =  80;
    scene.add(sun);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 200);
    camera.position.set(0, 12, 25);

    // ── Physics ──
    const world = new CANNON.World();
    world.gravity.set(0, -20, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = false;

    // ── Ground (visual) ──
    const groundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200, 30, 30),
      flat(C.ground)
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // ── Ground (physics) ──
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(new CANNON.Plane());
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // ── Road strips ──
    const roadMat = flat(C.road);
    const addRoad = (x:number,z:number,w:number,d:number) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,0.02,d), roadMat);
      m.position.set(x,0.01,z); m.receiveShadow = true; scene.add(m);
    };
    addRoad(0, 0, 6, 120);   // main N-S road
    addRoad(0, 0, 120, 6);   // main E-W road
    addRoad(-30, -28, 3, 18); // to about
    addRoad(34, -22, 3, 18);  // to experience
    addRoad(-28, 32, 3, 18);  // to skills
    addRoad(28, 34, 3, 18);   // to contact

    // ── Zone markers + signs ──
    for (const z of ZONES) {
      const [zx, zz] = z.pos;
      // ground pad
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(z.radius, z.radius, 0.05, 20),
        new THREE.MeshLambertMaterial({ color: z.color, flatShading: true, transparent: true, opacity: 0.35 })
      );
      pad.position.set(zx, 0.03, zz);
      scene.add(pad);
      // sign
      const sign = makeSign(z.label, z.color);
      sign.position.set(zx, 0, zz - z.radius + 1.5);
      scene.add(sign);
    }

    // ── Trees ──
    const treePositions: [number,number][] = [
      [-8,-8],[-12,4],[-5,15],[8,-10],[14,-5],[10,12],[-6,-20],
      [-18,-10],[-22,5],[-15,20],[20,-15],[25,-5],[22,10],[18,22],
      [-25,25],[-10,28],[10,26],[28,5],[-30,10],[-8,35],[8,38],
      [-38,-15],[-35,0],[38,-10],[35,5],[0,-38],[0,38],[40,20],
      [-40,20],[15,-35],[-15,-35],[30,-35],[-30,35],[40,-30],[-40,-30],
    ];
    for (const [tx,tz] of treePositions) {
      const s = 0.7 + Math.random() * 0.6;
      scene.add(makeTree(tx, tz, s));
    }

    // ── Rocks ──
    const rockPos: [number,number][] = [
      [-16,-16],[16,-18],[18,16],[-14,18],[22,-28],[28,22],[-24,28]
    ];
    for (const [rx,rz] of rockPos) scene.add(makeRock(rx, rz));

    // ── Hills ──
    const addHill = (x:number,z:number,r:number,h:number) => {
      const geo = new THREE.ConeGeometry(r, h, 8);
      const m = new THREE.Mesh(geo, flat(C.hill));
      m.position.set(x, h/2 - 0.4, z);
      m.castShadow = true; m.receiveShadow = true;
      scene.add(m);
      const body = new CANNON.Body({ mass: 0 });
      body.addShape(new CANNON.Cylinder(0.1, r, h, 8));
      body.position.set(x, h/2 - 0.4, z);
      world.addBody(body);
    };
    addHill(-30, -28, 6, 4);
    addHill( 34, -22, 6, 4);
    addHill(-28,  32, 6, 4);
    addHill( 28,  34, 6, 4);

    // ── Ramp ──
    const rampMesh = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.3, 8),
      flat(C.road)
    );
    rampMesh.position.set(0, 0.8, -18);
    rampMesh.rotation.x = -0.2;
    rampMesh.castShadow = true; rampMesh.receiveShadow = true;
    scene.add(rampMesh);
    const rampBody = new CANNON.Body({ mass: 0 });
    rampBody.addShape(new CANNON.Box(new CANNON.Vec3(2.5, 0.15, 4)));
    rampBody.position.set(0, 0.8, -18);
    rampBody.quaternion.setFromEuler(-0.2, 0, 0);
    world.addBody(rampBody);

    // ── Pond ──
    const pond = new THREE.Mesh(
      new THREE.CylinderGeometry(5, 5, 0.1, 16),
      new THREE.MeshLambertMaterial({ color: C.water, flatShading: true })
    );
    pond.position.set(15, 0.05, 15);
    scene.add(pond);

    // ── Car ──
    const chassisShape = new CANNON.Box(new CANNON.Vec3(0.85, 0.22, 1.85));
    const chassisBody  = new CANNON.Body({ mass: 150 });
    chassisBody.addShape(chassisShape);
    chassisBody.position.set(0, 2, 12);
    chassisBody.allowSleep = false;
    chassisBody.linearDamping  = 0.05;
    chassisBody.angularDamping = 0.3;

    const vehicle = new CANNON.RaycastVehicle({
      chassisBody,
      indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2,
    });

    const wOpts = {
      radius: 0.35,
      directionLocal:  new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 40,
      suspensionRestLength: 0.3,
      frictionSlip: 1.4,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.01,
      axleLocal: new CANNON.Vec3(1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(0,0,0),
      maxSuspensionTravel: 0.3,
      useCustomSlidingRotationalSpeed: true,
      customSlidingRotationalSpeed: -30,
    };

    const wheels: [number, number, number][] = [
      [-0.82, 0.1,  1.35],
      [ 0.82, 0.1,  1.35],
      [-0.82, 0.1, -1.35],
      [ 0.82, 0.1, -1.35],
    ];
    wheels.forEach(([x,y,z]) => {
      vehicle.addWheel({ ...wOpts, chassisConnectionPointLocal: new CANNON.Vec3(x,y,z) });
    });
    vehicle.addToWorld(world);

    // ── Car visuals ──
    const carMesh = makeCarMesh();
    scene.add(carMesh);

    const wheelMeshes = wheels.map(() => {
      const wm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.28, 10),
        flat(C.wheel)
      );
      wm.rotation.z = Math.PI / 2;
      scene.add(wm);
      return wm;
    });

    // ── Input ──
    const onKey = (e: KeyboardEvent, val: boolean) => {
      keysRef.current[e.key] = val;
      if (val) setStarted(true);
      e.preventDefault();
    };
    window.addEventListener("keydown", e => onKey(e, true));
    window.addEventListener("keyup",   e => onKey(e, false));

    // ── Mobile touch controls ──
    // Exposed via keysRef — buttons set keys directly

    // ── Resize ──
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Loop ──
    const FIXED = 1 / 60;
    const MAX_FORCE = 1200;
    const MAX_STEER = 0.45;
    const BRAKE_F   = 30;

    const camTarget = new THREE.Vector3();
    const camPos    = new THREE.Vector3(0, 12, 25);
    let lastTime = -1;
    let frameId: number;

    const tmpQ = new THREE.Quaternion();
    const tmpV = new THREE.Vector3();

    const loop = (t: number) => {
      frameId = requestAnimationFrame(loop);
      if (lastTime < 0) { lastTime = t; return; }
      const dt = Math.min((t - lastTime) / 1000, 0.05);
      lastTime = t;

      const k = keysRef.current;
      const fwd  = k["w"] || k["W"] || k["ArrowUp"];
      const back = k["s"] || k["S"] || k["ArrowDown"];
      const left = k["a"] || k["A"] || k["ArrowLeft"];
      const right= k["r"] || k["d"] || k["D"] || k["ArrowRight"];
      const brake= k[" "] || k["Shift"];

      const engineForce = fwd ? -MAX_FORCE : back ? MAX_FORCE * 0.6 : 0;
      const steer = left ? MAX_STEER : right ? -MAX_STEER : 0;

      vehicle.applyEngineForce(engineForce, 2);
      vehicle.applyEngineForce(engineForce, 3);
      vehicle.setSteeringValue(steer, 0);
      vehicle.setSteeringValue(steer, 1);

      const bf = brake ? BRAKE_F : ((!fwd && !back) ? 5 : 0);
      for (let i = 0; i < 4; i++) vehicle.setBrake(bf, i);

      world.step(FIXED, dt, 3);

      // sync car mesh
      const cp = chassisBody.position;
      const cq = chassisBody.quaternion;
      carMesh.position.set(cp.x, cp.y, cp.z);
      carMesh.quaternion.set(cq.x, cq.y, cq.z, cq.w);

      // sync wheels
      vehicle.wheelInfos.forEach((wi, i) => {
        vehicle.updateWheelTransform(i);
        const t2 = wi.worldTransform;
        wheelMeshes[i].position.set(t2.position.x, t2.position.y, t2.position.z);
        wheelMeshes[i].quaternion.set(t2.quaternion.x, t2.quaternion.y, t2.quaternion.z, t2.quaternion.w);
      });

      // camera follow
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
        tmpQ.set(cq.x, cq.y, cq.z, cq.w)
      );
      const behindOffset = forward.clone().multiplyScalar(10).negate();
      camTarget.set(cp.x + behindOffset.x, cp.y + 7, cp.z + behindOffset.z);
      camPos.lerp(camTarget, 0.08);
      camera.position.copy(camPos);
      camera.lookAt(cp.x, cp.y + 0.5, cp.z);

      // speed HUD
      const vel = chassisBody.velocity;
      const speed = Math.round(Math.sqrt(vel.x**2 + vel.z**2) * 3.6);
      setKmh(speed);

      // zone proximity
      const cx = cp.x, cz = cp.z;
      let nearest: Zone | null = null;
      for (const z of ZONES) {
        const dx = cx - z.pos[0], dz = cz - z.pos[1];
        if (Math.sqrt(dx*dx+dz*dz) < z.radius) { nearest = z; break; }
      }
      setZone(nearest);

      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", e => onKey(e, true));
      window.removeEventListener("keyup",   e => onKey(e, false));
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  // mobile press
  const press   = (key: string) => { keysRef.current[key] = true;  setStarted(true); };
  const release = (key: string) => { keysRef.current[key] = false; };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden", background: "#87c8e8" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Back link */}
      <Link
        href="/"
        style={{
          position: "absolute", top: 18, left: 18,
          background: "rgba(255,255,255,0.85)", color: "#1a1a2e",
          padding: "6px 14px", borderRadius: 20, fontFamily: "sans-serif",
          fontSize: 13, fontWeight: 700, textDecoration: "none",
          backdropFilter: "blur(6px)", boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        ← Portfolio
      </Link>

      {/* HUD */}
      <div style={{
        position: "absolute", bottom: 24, left: 24,
        background: "rgba(255,255,255,0.88)", borderRadius: 16,
        padding: "10px 20px", fontFamily: "sans-serif",
        boxShadow: "0 4px 20px rgba(0,0,0,0.18)", backdropFilter: "blur(8px)",
      }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#1a1a2e", lineHeight: 1 }}>
          {kmh} <span style={{ fontSize: 12, fontWeight: 600, color: "#666" }}>km/h</span>
        </div>
        <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>WASD / Arrow keys</div>
      </div>

      {/* Hint */}
      {!started && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255,255,255,0.92)",
          borderRadius: 20, padding: "20px 36px", textAlign: "center",
          fontFamily: "sans-serif", boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)", pointerEvents: "none",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🚗</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1a1a2e" }}>Drive around to explore</div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>
            WASD or Arrow keys &nbsp;·&nbsp; Space to brake<br />
            Find the colored zones to learn more
          </div>
        </div>
      )}

      {/* Zone panel */}
      {zone && (
        <div style={{
          position: "absolute", top: 18, right: 18, width: 280,
          background: "rgba(255,255,255,0.93)", borderRadius: 18,
          padding: "18px 22px", fontFamily: "sans-serif",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)", backdropFilter: "blur(10px)",
          borderTop: `4px solid #${zone.color.toString(16).padStart(6,"0")}`,
          animation: "fadeInRight 0.25s ease",
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a2e", marginBottom: 10 }}>
            {zone.content.title}
          </div>
          {zone.content.lines.map((l, i) => (
            <div key={i} style={{ fontSize: 13, color: "#444", marginBottom: 5, lineHeight: 1.5 }}>
              {l}
            </div>
          ))}
        </div>
      )}

      {/* Mobile D-pad */}
      <div style={{
        position: "absolute", bottom: 24, right: 24,
        display: "grid", gridTemplateColumns: "44px 44px 44px",
        gridTemplateRows: "44px 44px 44px", gap: 4,
      }}>
        {[
          { key: "ArrowUp",    label: "▲", col: 2, row: 1 },
          { key: "ArrowLeft",  label: "◄", col: 1, row: 2 },
          { key: "ArrowDown",  label: "▼", col: 2, row: 3 },
          { key: "ArrowRight", label: "►", col: 3, row: 2 },
          { key: " ",          label: "⏸", col: 2, row: 2 },
        ].map(b => (
          <button
            key={b.key}
            onPointerDown={() => press(b.key)}
            onPointerUp={()   => release(b.key)}
            onPointerLeave={() => release(b.key)}
            style={{
              gridColumn: b.col, gridRow: b.row,
              background: "rgba(255,255,255,0.85)", border: "none",
              borderRadius: 10, fontSize: 16, cursor: "pointer",
              backdropFilter: "blur(6px)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              touchAction: "none",
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
