"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import * as CANNON from "cannon-es";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  sky:       0x6ab4d8,
  skyHori:   0x9dd4e8,
  ground:    0x7ab84e,
  groundAlt: 0x6aad3e,
  road:      0xc8b080,
  roadLine:  0xf5e6a0,
  trunk:     0x7a5230,
  leaf:      0x3a8a3a,
  leafMid:   0x2e7a2e,
  leafDark:  0x1e6a1e,
  sign:      0xfef9ef,
  post:      0x9a6830,
  water:     0x3ab4e8,
  waterEdge: 0x2a8abf,
  rock:      0x888888,
  rockDark:  0x606060,
  hill:      0x6aaa38,
  hillDark:  0x5a9a28,
  sand:      0xd4c080,
  fence:     0xb89060,
  // Car colors
  carBody:   0xff3a3a,
  carDark:   0xcc1a1a,
  carTop:    0xff6060,
  carGlass:  0x88d8f8,
  carRim:    0xe0e0e0,
  carTire:   0x1a1a1a,
  carLight:  0xfffaaa,
  carTail:   0xff2244,
  carUnder:  0x880000,
};

function flat(color: number, opts: Partial<THREE.MeshLambertMaterialParameters> = {}) {
  return new THREE.MeshLambertMaterial({ color, flatShading: true, ...opts });
}
function phong(color: number, opts: Partial<THREE.MeshPhongMaterialParameters> = {}) {
  return new THREE.MeshPhongMaterial({ color, flatShading: true, shininess: 60, ...opts });
}

// ─── Low-poly Sports Car ──────────────────────────────────────────────────────
function makeCarMesh() {
  const g = new THREE.Group();

  const part = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0, y = 0, z = 0,
    rx = 0, ry = 0, rz = 0
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    g.add(m);
    return m;
  };

  // ── Chassis / undercarriage ──
  part(new THREE.BoxGeometry(1.72, 0.14, 3.8), flat(C.carUnder));

  // ── Main body — wide low sportscar ──
  part(new THREE.BoxGeometry(1.72, 0.38, 3.8), phong(C.carBody));

  // ── Hood (front slope) ──
  const hoodGeo = new THREE.BufferGeometry();
  const hoodV = new Float32Array([
    -0.86, 0.19, -0.4,   0.86, 0.19, -0.4,   0.86, 0.19,  1.9,  // top face
    -0.86, 0.19,  1.9,  -0.86, 0.04, 1.92,   0.86, 0.04, 1.92,  // front slope edge
    -0.86, 0.19, -0.4,   0.86, 0.19, -0.4,  -0.86,-0.01,-0.4,   // back edge
     0.86,-0.01,-0.4,
  ]);
  // simple approach — use box rotated
  const hood = part(new THREE.BoxGeometry(1.72, 0.22, 1.6), phong(C.carBody), 0, 0.28, 0.9, -0.10, 0, 0);

  // ── Cabin (roof area) ──
  part(new THREE.BoxGeometry(1.44, 0.48, 1.7), phong(C.carBody),    0, 0.6, -0.35);
  // roof panel
  part(new THREE.BoxGeometry(1.38, 0.08, 1.5), phong(C.carTop),     0, 0.88, -0.35);
  // A-pillar slope (front windshield frame)
  part(new THREE.BoxGeometry(1.44, 0.42, 0.10), phong(C.carDark),  0, 0.6,  0.47, -0.38, 0, 0);
  // Rear windshield slope
  part(new THREE.BoxGeometry(1.38, 0.38, 0.10), phong(C.carDark),  0, 0.6, -1.18,  0.30, 0, 0);

  // ── Windshield glass ──
  const glassMat = new THREE.MeshPhongMaterial({
    color: C.carGlass, transparent: true, opacity: 0.55,
    shininess: 120, flatShading: false, side: THREE.DoubleSide,
  });
  part(new THREE.BoxGeometry(1.28, 0.38, 0.06), glassMat,  0, 0.61,  0.46, -0.38, 0, 0);
  part(new THREE.BoxGeometry(1.24, 0.34, 0.06), glassMat,  0, 0.61, -1.16,  0.30, 0, 0);
  // Side windows
  part(new THREE.BoxGeometry(0.04, 0.32, 0.8), glassMat, -0.73, 0.63, -0.35);
  part(new THREE.BoxGeometry(0.04, 0.32, 0.8), glassMat,  0.73, 0.63, -0.35);

  // ── Side skirts ──
  part(new THREE.BoxGeometry(0.08, 0.14, 3.4), flat(C.carDark), -0.88, -0.08, 0);
  part(new THREE.BoxGeometry(0.08, 0.14, 3.4), flat(C.carDark),  0.88, -0.08, 0);

  // ── Front bumper ──
  part(new THREE.BoxGeometry(1.72, 0.22, 0.16), flat(C.carDark),  0, -0.02, 1.98);
  part(new THREE.BoxGeometry(1.60, 0.10, 0.14), flat(0x333333),   0, -0.12, 1.99); // grille

  // ── Rear bumper / diffuser ──
  part(new THREE.BoxGeometry(1.72, 0.22, 0.16), flat(C.carDark),  0, -0.02, -1.98);
  part(new THREE.BoxGeometry(0.60, 0.08, 0.12), flat(0x333333),   0, -0.13, -1.99); // exhaust

  // ── Headlights ──
  const lightMat = phong(C.carLight, { emissive: 0xffffaa, emissiveIntensity: 0.4, shininess: 200 });
  part(new THREE.BoxGeometry(0.32, 0.11, 0.06), lightMat, -0.62, 0.09, 1.98);
  part(new THREE.BoxGeometry(0.32, 0.11, 0.06), lightMat,  0.62, 0.09, 1.98);
  // DRL strip
  part(new THREE.BoxGeometry(1.30, 0.04, 0.04), phong(C.carLight), 0, 0.16, 1.98);

  // ── Tail lights ──
  const tailMat = phong(C.carTail, { emissive: 0xaa0020, emissiveIntensity: 0.5 });
  part(new THREE.BoxGeometry(0.40, 0.10, 0.06), tailMat, -0.60, 0.09, -1.97);
  part(new THREE.BoxGeometry(0.40, 0.10, 0.06), tailMat,  0.60, 0.09, -1.97);
  part(new THREE.BoxGeometry(1.30, 0.03, 0.04), tailMat, 0, 0.15, -1.97);

  // ── Spoiler ──
  part(new THREE.BoxGeometry(1.60, 0.08, 0.30), flat(C.carDark),   0, 0.98, -1.75);
  part(new THREE.BoxGeometry(0.08, 0.22, 0.30), flat(C.carDark), -0.78, 0.85, -1.75);
  part(new THREE.BoxGeometry(0.08, 0.22, 0.30), flat(C.carDark),  0.78, 0.85, -1.75);

  // ── Body stripe ──
  part(new THREE.BoxGeometry(0.18, 0.02, 3.4), phong(0xffffff), 0, 0.2, 0);

  // ── Side mirrors ──
  part(new THREE.BoxGeometry(0.22, 0.09, 0.14), flat(C.carDark), -0.98, 0.38, 0.8);
  part(new THREE.BoxGeometry(0.22, 0.09, 0.14), flat(C.carDark),  0.98, 0.38, 0.8);

  return g;
}

// ─── Detailed Wheel ───────────────────────────────────────────────────────────
function makeWheelMesh() {
  const g = new THREE.Group();
  // Tire
  const tire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.36, 0.28, 14),
    flat(C.carTire)
  );
  tire.rotation.z = Math.PI / 2;
  g.add(tire);
  // Rim outer
  const rimOut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.30, 10),
    phong(C.carRim, { shininess: 150 })
  );
  rimOut.rotation.z = Math.PI / 2;
  g.add(rimOut);
  // Rim center cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.32, 8),
    flat(0xcccccc)
  );
  cap.rotation.z = Math.PI / 2;
  g.add(cap);
  // Spokes
  for (let i = 0; i < 5; i++) {
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.30, 0.05, 0.04),
      phong(C.carRim)
    );
    spoke.rotation.x = (i / 5) * Math.PI * 2;
    spoke.position.y = Math.sin((i/5)*Math.PI*2)*0.13;
    spoke.position.z = Math.cos((i/5)*Math.PI*2)*0.13;
    g.add(spoke);
  }
  g.traverse(m => { if ((m as THREE.Mesh).isMesh) m.castShadow = true; });
  return g;
}

// ─── Tree ─────────────────────────────────────────────────────────────────────
function makeTree(x: number, z: number, scale = 1, type = 0) {
  const g = new THREE.Group();
  const trunkH = (0.7 + Math.random() * 0.4) * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10 * scale, 0.15 * scale, trunkH, 6),
    flat(C.trunk)
  );
  trunk.position.y = trunkH / 2;
  g.add(trunk);

  if (type === 1) {
    // Round tree (oak-like)
    const sphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.7 * scale, 1),
      flat(C.leaf)
    );
    sphere.position.y = trunkH + 0.5 * scale;
    sphere.scale.y = 0.85;
    g.add(sphere);
    const sphere2 = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5 * scale, 1),
      flat(C.leafDark)
    );
    sphere2.position.set(0.3 * scale, trunkH + 0.8 * scale, 0.2 * scale);
    sphere2.scale.y = 0.85;
    g.add(sphere2);
  } else {
    // Pine tree (cone stacks)
    const layers = [
      [0.75, 1.1, trunkH + 0.2],
      [0.60, 0.95, trunkH + 0.9],
      [0.44, 0.80, trunkH + 1.5],
      [0.28, 0.65, trunkH + 2.0],
    ];
    layers.forEach(([r, h, y], i) => {
      const cone = new THREE.Mesh(
        new THREE.ConeGeometry(r * scale, h * scale, 7),
        flat(i % 2 === 0 ? C.leaf : C.leafMid)
      );
      cone.position.y = y * scale;
      g.add(cone);
    });
  }

  g.position.set(x, 0, z);
  g.rotation.y = Math.random() * Math.PI * 2;
  g.traverse(m => { if ((m as THREE.Mesh).isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}

// ─── Rock cluster ─────────────────────────────────────────────────────────────
function makeRocks(x: number, z: number) {
  const g = new THREE.Group();
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    const geo = new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.3, 0);
    geo.rotateY(Math.random() * Math.PI);
    geo.rotateX(Math.random() * 0.5);
    const m = new THREE.Mesh(geo, flat(i % 2 ? C.rock : C.rockDark));
    m.scale.y = 0.55 + Math.random() * 0.3;
    m.position.set((Math.random()-0.5)*1.2, m.scale.y*0.3, (Math.random()-0.5)*1.2);
    m.castShadow = true;
    g.add(m);
  }
  g.position.set(x, 0.1, z);
  return g;
}

// ─── Sign ─────────────────────────────────────────────────────────────────────
function makeSign(color: number, double = false) {
  const g = new THREE.Group();
  const postMat = flat(C.post);
  const postH = 2.6;
  if (double) {
    [-0.9, 0.9].forEach(px => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, postH, 6), postMat);
      p.position.set(px, postH/2, 0); p.castShadow = true; g.add(p);
    });
  } else {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, postH, 6), postMat);
    p.position.y = postH/2; p.castShadow = true; g.add(p);
  }
  const border = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 0.10), flat(C.sign));
  border.position.y = postH + 0.1;
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.82, 0.12), flat(color));
  board.position.y = postH + 0.1;
  board.position.z = 0.02;
  g.add(border, board);
  return g;
}

// ─── House ────────────────────────────────────────────────────────────────────
function makeHouse(x: number, z: number, rot = 0) {
  const g = new THREE.Group();
  const walls = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.8), flat(0xf0d8b0));
  walls.position.y = 0.9; walls.castShadow = true; walls.receiveShadow = true;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.2, 4), flat(0xc0502a));
  roof.position.y = 2.4; roof.rotation.y = Math.PI/4; roof.castShadow = true;
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.9, 0.12), flat(0x7a4a1a));
  door.position.set(0, 0.45, 1.41);
  const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.08), flat(C.carGlass));
  win1.position.set(-0.65, 0.95, 1.41);
  const win2 = win1.clone(); win2.position.x = 0.65;
  g.add(walls, roof, door, win1, win2);
  g.position.set(x, 0, z);
  g.rotation.y = rot;
  return g;
}

// ─── Lamp post ────────────────────────────────────────────────────────────────
function makeLamp(x: number, z: number) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 4.5, 6), flat(0x888888));
  pole.position.y = 2.25; pole.castShadow = true;
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.8), flat(0x888888));
  arm.position.set(0.4, 4.45, 0);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6),
    new THREE.MeshPhongMaterial({ color: 0xffffaa, emissive: 0xffff88, emissiveIntensity: 1 }));
  bulb.position.set(0.4, 4.3, 0);
  g.add(pole, arm, bulb);
  g.position.set(x, 0, z);
  return g;
}

// ─── Fence segment ────────────────────────────────────────────────────────────
function makeFenceLine(x1:number,z1:number,x2:number,z2:number,segments=8) {
  const g = new THREE.Group();
  const dx = (x2-x1)/segments, dz = (z2-z1)/segments;
  const angle = Math.atan2(dz, dx);
  const len = Math.sqrt((x2-x1)**2+(z2-z1)**2)/segments;
  for (let i = 0; i < segments; i++) {
    const mx = x1 + dx*(i+0.5), mz = z1 + dz*(i+0.5);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.8,0.08), flat(C.fence));
    post.position.set(mx, 0.4, mz); g.add(post);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len*0.92,0.06,0.06), flat(C.fence));
    rail.position.set(mx, 0.62, mz); rail.rotation.y = angle; g.add(rail);
    const rail2 = rail.clone(); rail2.position.y = 0.28; g.add(rail2);
  }
  return g;
}

// ─── Zones ────────────────────────────────────────────────────────────────────
type Zone = {
  id: string; label: string; color: number;
  pos: [number,number]; radius: number;
  content: { title: string; role?: string; lines: string[]; emoji: string };
};

const ZONES: Zone[] = [
  {
    id: "home", label: "HD", color: 0x89dceb,
    pos: [0, 0], radius: 10,
    content: {
      emoji: "🏠",
      title: "Harsh Dixit",
      role: "Senior Cloud & DevOps Engineer",
      lines: ["AWS SAA-C03 Certified","5+ years building cloud-native infra","Drive around to discover my world →"],
    },
  },
  {
    id: "about", label: "About Me", color: 0x6acf6a,
    pos: [-32, -30], radius: 10,
    content: {
      emoji: "👨‍💻",
      title: "About Me",
      role: "Currently @ Caylent",
      lines: ["I architect scalable cloud platforms","Terraform + AWS + Kubernetes enthusiast","Love automating everything that moves","Based in India · Open to remote work"],
    },
  },
  {
    id: "experience", label: "Experience", color: 0xcba6f7,
    pos: [34, -24], radius: 10,
    content: {
      emoji: "💼",
      title: "Experience",
      role: "5+ Years in Industry",
      lines: ["Caylent — Sr. DevOps Engineer","Accenture — Cloud Consultant","Platform engineering at scale","CI/CD · GitOps · IaC · Observability"],
    },
  },
  {
    id: "skills", label: "Skills", color: 0xf9e2af,
    pos: [-30, 33], radius: 10,
    content: {
      emoji: "⚡",
      title: "Tech Stack",
      role: "Cloud · DevOps · Automation",
      lines: ["AWS · GCP · Azure","Terraform · Ansible · Helm","Docker · Kubernetes · ArgoCD","Python · Bash · TypeScript · Go"],
    },
  },
  {
    id: "contact", label: "Contact", color: 0xf38ba8,
    pos: [30, 36], radius: 10,
    content: {
      emoji: "📬",
      title: "Say Hello",
      role: "Let's build something great",
      lines: ["harsh.dixit@caylent.com","github.com/harsh785","linkedin.com/in/harshdixit"],
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
  const [gear, setGear]       = useState("N");

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);

    // ── Scene ──
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(C.sky);
    scene.fog = new THREE.FogExp2(C.sky, 0.008);

    // ── Sky gradient (simple quad) ──
    const skyGeo = new THREE.SphereGeometry(120, 16, 8);
    skyGeo.scale(-1, 1, 1);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: { topColor: { value: new THREE.Color(0x5aaad8) }, botColor: { value: new THREE.Color(0xb8dff0) } },
      vertexShader: `varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 topColor,botColor; varying float h; void main(){ gl_FragColor = vec4(mix(botColor,topColor,max(h,0.)),1.); }`,
      side: THREE.BackSide, depthWrite: false,
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xb0d0f0, 0.6));
    const hemi = new THREE.HemisphereLight(0x88c8f0, 0x88aa44, 1.0);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4d0, 2.2);
    sun.position.set(40, 60, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 200;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -90;
    sun.shadow.camera.right = sun.shadow.camera.top = 90;
    sun.shadow.bias = -0.001;
    scene.add(sun);

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(52, el.clientWidth / el.clientHeight, 0.1, 250);
    camera.position.set(0, 10, 22);

    // ── Physics ──
    const world = new CANNON.World();
    world.gravity.set(0, -22, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = false;

    // ── Ground ──
    const groundGeo = new THREE.PlaneGeometry(250, 250, 50, 50);
    // Gentle vertex displacement for terrain feel
    const pos = groundGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const dist = Math.sqrt(x*x + z*z);
      if (dist > 8) {
        pos.setY(i, Math.sin(x*0.12)*0.4 + Math.cos(z*0.15)*0.3 + Math.sin(x*0.07+z*0.08)*0.5);
      }
    }
    groundGeo.computeVertexNormals();
    const groundMesh = new THREE.Mesh(groundGeo, flat(C.ground));
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Ground physics (flat)
    const groundBody = new CANNON.Body({ mass: 0 });
    groundBody.addShape(new CANNON.Plane());
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // ── Roads ──
    const addRoad = (x:number,z:number,w:number,d:number,rot=0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w,0.03,d), flat(C.road));
      m.position.set(x,0.02,z); m.rotation.y=rot; m.receiveShadow=true; scene.add(m);
      // Center line
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.15,0.04,d*0.92), flat(C.roadLine));
      line.position.set(x,0.04,z); line.rotation.y=rot; scene.add(line);
    };
    addRoad(0, 0, 7, 130);
    addRoad(0, 0, 130, 7, Math.PI/2);
    addRoad(-16, -31, 5, 20, 0.15);
    addRoad(17, -24, 5, 22, -0.12);
    addRoad(-15, 33, 5, 20, 0.1);
    addRoad(15, 35, 5, 22, -0.1);

    // ── Road dashes ──
    for (let i = -60; i < 60; i += 6) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.15,0.04,2.5), flat(C.roadLine));
      dash.position.set(3.0, 0.04, i); scene.add(dash);
      const dash2 = dash.clone(); dash2.position.set(-3.0, 0.04, i); scene.add(dash2);
    }

    // ── Zone pads + signs ──
    for (const z of ZONES) {
      const [zx, zz] = z.pos;
      const hexColor = z.color;
      const padMat = new THREE.MeshLambertMaterial({
        color: hexColor, flatShading: true, transparent: true, opacity: 0.4
      });
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(z.radius, z.radius, 0.06, 24), padMat);
      pad.position.set(zx, 0.04, zz);
      scene.add(pad);
      // Ring border
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(z.radius, 0.12, 6, 28),
        flat(hexColor)
      );
      ring.rotation.x = Math.PI/2; ring.position.set(zx, 0.08, zz);
      scene.add(ring);
      const sign = makeSign(hexColor, true);
      sign.position.set(zx, 0, zz - z.radius + 1);
      scene.add(sign);
    }

    // ── Trees ──
    const trees: [number,number,number,number][] = [
      [-9,-9,0.9,0],[-13,4,1.1,1],[-5,16,0.8,0],[9,-11,1.0,1],[15,-5,0.9,0],[11,13,1.1,1],
      [-7,-22,1.0,0],[-20,-11,1.2,1],[-24,6,0.8,0],[-16,22,0.9,1],[22,-16,1.1,0],[26,-6,0.9,1],
      [23,11,1.0,0],[19,23,1.2,1],[-26,26,0.8,0],[-11,29,1.0,1],[11,27,0.9,0],[29,6,1.1,1],
      [-31,11,1.0,0],[-9,36,0.9,1],[9,39,1.1,0],[40,-12,0.9,1],[37,6,1.2,0],[-39,-12,1.0,1],
      [-37,4,0.9,0],[1,-40,1.1,1],[1,40,0.8,0],[41,22,1.0,1],[-41,22,0.9,0],[16,-37,1.1,1],
      [-16,-37,1.0,0],[31,-37,0.9,1],[-31,37,1.1,0],[42,-32,0.8,1],[-42,-32,1.0,0],
      [6,-14,0.8,1],[-6,-14,0.9,0],[18,0,1.0,1],[-18,0,0.9,0],[0,18,1.1,1],[0,-18,1.0,0],
    ];
    for (const [tx,tz,s,t] of trees) scene.add(makeTree(tx, tz, s, t));

    // ── Rocks ──
    for (const [rx,rz] of [[-17,-17],[17,-19],[19,17],[-15,19],[23,-29],[29,23],[-25,29],[35,-20],[-35,-20]] as [number,number][])
      scene.add(makeRocks(rx, rz));

    // ── Houses / structures ──
    scene.add(makeHouse(-8, -32, 0.3));
    scene.add(makeHouse( 8, -32,-0.3));
    scene.add(makeHouse(-38, 14, 0.8));
    scene.add(makeHouse( 38,-14,-0.8));

    // ── Lamp posts along main road ──
    for (let z2 = -50; z2 <= 50; z2 += 12) {
      scene.add(makeLamp( 4.5, z2));
      scene.add(makeLamp(-4.5, z2));
    }

    // ── Fences ──
    scene.add(makeFenceLine(-65, -65, 65, -65));
    scene.add(makeFenceLine( 65, -65, 65,  65));
    scene.add(makeFenceLine( 65,  65,-65,  65));
    scene.add(makeFenceLine(-65,  65,-65, -65));

    // ── Hills (visual only — physics flat) ──
    for (const [hx,hz,hr,hh] of [[-32,-30,8,5],[34,-24,8,5],[-30,33,8,5],[30,36,8,5]] as [number,number,number,number][]) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(hr,hh,9), flat(C.hill));
      hill.position.set(hx, hh/2-0.3, hz);
      hill.castShadow = true; hill.receiveShadow = true;
      scene.add(hill);
      // Hill ring of trees
      for (let a = 0; a < 6; a++) {
        const ang = (a/6)*Math.PI*2;
        scene.add(makeTree(hx+Math.cos(ang)*(hr-1), hz+Math.sin(ang)*(hr-1), 0.7, a%2));
      }
      const hBody = new CANNON.Body({ mass: 0 });
      hBody.addShape(new CANNON.Cylinder(0.1, hr, hh, 9));
      hBody.position.set(hx, hh/2-0.3, hz);
      world.addBody(hBody);
    }

    // ── Ramp ──
    const rampMesh = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.3, 9), flat(C.road));
    rampMesh.position.set(0, 0.85, -20); rampMesh.rotation.x = -0.18;
    rampMesh.castShadow = true; rampMesh.receiveShadow = true;
    scene.add(rampMesh);
    const rampBody = new CANNON.Body({ mass: 0 });
    rampBody.addShape(new CANNON.Box(new CANNON.Vec3(2.75, 0.15, 4.5)));
    rampBody.position.set(0, 0.85, -20);
    rampBody.quaternion.setFromEuler(-0.18, 0, 0);
    world.addBody(rampBody);

    // ── Pond ──
    const pond = new THREE.Mesh(new THREE.CircleGeometry(6, 16), flat(C.water));
    pond.rotation.x = -Math.PI/2; pond.position.set(18, 0.06, 16);
    scene.add(pond);
    const pondEdge = new THREE.Mesh(new THREE.TorusGeometry(6, 0.2, 6, 18), flat(C.waterEdge));
    pondEdge.rotation.x = Math.PI/2; pondEdge.position.set(18, 0.07, 16);
    scene.add(pondEdge);
    for (let a = 0; a < 5; a++) {
      const ang = (a/5)*Math.PI*2;
      scene.add(makeTree(18+Math.cos(ang)*7.5, 16+Math.sin(ang)*7.5, 0.8, 1));
    }

    // ── Car physics ──
    const chassisBody = new CANNON.Body({ mass: 140 });
    chassisBody.addShape(new CANNON.Box(new CANNON.Vec3(0.86, 0.20, 1.88)));
    chassisBody.position.set(0, 2, 12);
    chassisBody.allowSleep = false;
    chassisBody.linearDamping = 0.05;
    chassisBody.angularDamping = 0.35;
    world.addBody(chassisBody);

    const vehicle = new CANNON.RaycastVehicle({
      chassisBody, indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2,
    });

    const wBase = {
      radius: 0.36,
      directionLocal:  new CANNON.Vec3(0, -1, 0),
      suspensionStiffness: 45,
      suspensionRestLength: 0.32,
      frictionSlip: 1.6,
      dampingRelaxation: 2.4,
      dampingCompression: 4.6,
      maxSuspensionForce: 100000,
      rollInfluence: 0.005,
      axleLocal: new CANNON.Vec3(1, 0, 0),
      chassisConnectionPointLocal: new CANNON.Vec3(0,0,0),
      maxSuspensionTravel: 0.28,
      useCustomSlidingRotationalSpeed: true,
      customSlidingRotationalSpeed: -30,
    };

    const wheelDefs: [number,number,number][] = [
      [-0.88, 0.05,  1.38],
      [ 0.88, 0.05,  1.38],
      [-0.88, 0.05, -1.38],
      [ 0.88, 0.05, -1.38],
    ];
    wheelDefs.forEach(([x,y,z2]) => {
      vehicle.addWheel({ ...wBase, chassisConnectionPointLocal: new CANNON.Vec3(x,y,z2) });
    });
    vehicle.addToWorld(world);

    // ── Visual car + wheels ──
    const carMesh = makeCarMesh();
    scene.add(carMesh);
    const wheelMeshes = wheelDefs.map(([x]) => {
      const wm = makeWheelMesh();
      if (x < 0) wm.scale.x = -1; // flip left wheels
      scene.add(wm);
      return wm;
    });

    // ── Input ──
    const onKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true;  setStarted(true); };
    const onKeyUp   = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    // ── Resize ──
    const onResize = () => {
      if (!el) return;
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Game loop ──
    const FIXED = 1 / 60;
    const MAX_FORCE = 1400;
    const MAX_STEER = 0.44;
    const BRAKE_F   = 25;

    const camOffset = new THREE.Vector3(0, 8, 16);
    const camLookAt = new THREE.Vector3();
    const camCurrent = new THREE.Vector3(0, 10, 22);
    let lastTime = -1;
    let frameId: number;

    const loop = (t: number) => {
      frameId = requestAnimationFrame(loop);
      if (lastTime < 0) { lastTime = t; return; }
      const dt = Math.min((t - lastTime) / 1000, 0.05);
      lastTime = t;

      const k = keysRef.current;
      const fwd   = k["w"] || k["W"] || k["ArrowUp"];
      const back  = k["s"] || k["S"] || k["ArrowDown"];
      const left  = k["a"] || k["A"] || k["ArrowLeft"];
      const right = k["d"] || k["D"] || k["ArrowRight"];
      const brake = k[" "] || k["Shift"];

      const vel = chassisBody.velocity;
      const spd = Math.sqrt(vel.x**2 + vel.z**2);
      const speedKmh = Math.round(spd * 3.6);
      setKmh(speedKmh);

      // Speed-dependent steering
      const steerAmt = MAX_STEER * Math.max(0.3, 1 - spd * 0.03);
      const engineForce = fwd ? -MAX_FORCE : back ? MAX_FORCE * 0.55 : 0;
      const steer = left ? steerAmt : right ? -steerAmt : 0;
      const rollResist = (!fwd && !back) ? 8 : 0;

      vehicle.applyEngineForce(engineForce, 2);
      vehicle.applyEngineForce(engineForce, 3);
      vehicle.setSteeringValue(steer, 0);
      vehicle.setSteeringValue(steer, 1);
      for (let i = 0; i < 4; i++) vehicle.setBrake(brake ? BRAKE_F : rollResist, i);

      world.step(FIXED, dt, 3);

      // Sync car mesh
      const cp = chassisBody.position;
      const cq = chassisBody.quaternion;
      carMesh.position.set(cp.x, cp.y, cp.z);
      carMesh.quaternion.set(cq.x, cq.y, cq.z, cq.w);

      // Sync wheels
      vehicle.wheelInfos.forEach((wi, i) => {
        vehicle.updateWheelTransform(i);
        const wt = wi.worldTransform;
        wheelMeshes[i].position.set(wt.position.x, wt.position.y, wt.position.z);
        wheelMeshes[i].quaternion.set(wt.quaternion.x, wt.quaternion.y, wt.quaternion.z, wt.quaternion.w);
      });

      // Camera — smooth follow behind car
      const carQuat = new THREE.Quaternion(cq.x, cq.y, cq.z, cq.w);
      const behind = camOffset.clone().applyQuaternion(carQuat);
      const targetPos = new THREE.Vector3(cp.x + behind.x, cp.y + behind.y, cp.z + behind.z);
      camCurrent.lerp(targetPos, 0.07);
      camera.position.copy(camCurrent);
      camLookAt.set(cp.x, cp.y + 0.8, cp.z);
      camera.lookAt(camLookAt);

      // Gear display
      if (fwd) setGear("D");
      else if (back) setGear("R");
      else setGear(speedKmh > 2 ? "D" : "N");

      // Zone proximity
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  const press   = (key: string) => { keysRef.current[key] = true;  setStarted(true); };
  const release = (key: string) => { keysRef.current[key] = false; };

  const zoneHex = zone ? `#${zone.color.toString(16).padStart(6,"0")}` : "#fff";

  return (
    <div style={{ width:"100vw", height:"100vh", position:"relative", overflow:"hidden", background:`#${C.sky.toString(16)}` }}>
      <div ref={mountRef} style={{ width:"100%", height:"100%" }} />

      {/* ── Back link ── */}
      <Link href="/" style={{
        position:"absolute", top:16, left:16,
        background:"rgba(255,255,255,0.9)", color:"#1a1a2e",
        padding:"7px 16px", borderRadius:24, fontFamily:"sans-serif",
        fontSize:13, fontWeight:700, textDecoration:"none",
        backdropFilter:"blur(8px)", boxShadow:"0 2px 16px rgba(0,0,0,0.18)",
        display:"flex", alignItems:"center", gap:7, letterSpacing:"0.02em",
      }}>← Portfolio</Link>

      {/* ── Speedometer ── */}
      <div style={{
        position:"absolute", bottom:24, left:24,
        background:"rgba(20,20,30,0.82)", borderRadius:20,
        padding:"14px 22px", fontFamily:"'Segoe UI',sans-serif",
        boxShadow:"0 4px 32px rgba(0,0,0,0.35)", backdropFilter:"blur(12px)",
        border:"1px solid rgba(255,255,255,0.12)",
      }}>
        <div style={{ fontSize:38, fontWeight:900, color:"#fff", lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
          {kmh}<span style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.5)", marginLeft:4 }}>km/h</span>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:8, alignItems:"center" }}>
          {["P","R","N","D"].map(g2 => (
            <span key={g2} style={{
              fontSize:12, fontWeight:800, color: gear===g2 ? "#fff" : "rgba(255,255,255,0.25)",
              background: gear===g2 ? "#e63946" : "transparent",
              padding:"1px 6px", borderRadius:4, transition:"all 0.15s",
            }}>{g2}</span>
          ))}
        </div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:6, letterSpacing:"0.05em" }}>
          WASD · SPACE brake
        </div>
      </div>

      {/* ── Zone info panel ── */}
      {zone && (
        <div key={zone.id} style={{
          position:"absolute", top:16, right:16, width:292,
          background:"rgba(255,255,255,0.95)", borderRadius:20,
          padding:"20px 24px", fontFamily:"'Segoe UI',sans-serif",
          boxShadow:"0 8px 40px rgba(0,0,0,0.22)", backdropFilter:"blur(12px)",
          borderLeft:`5px solid ${zoneHex}`,
          animation:"slideIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{ fontSize:28, marginBottom:8 }}>{zone.content.emoji}</div>
          <div style={{ fontSize:18, fontWeight:800, color:"#111", marginBottom:2 }}>
            {zone.content.title}
          </div>
          {zone.content.role && (
            <div style={{ fontSize:12, color:zoneHex, fontWeight:700, marginBottom:12, letterSpacing:"0.04em" }}>
              {zone.content.role}
            </div>
          )}
          <div style={{ width:32, height:2, background:zoneHex, borderRadius:2, marginBottom:12 }} />
          {zone.content.lines.map((l,i) => (
            <div key={i} style={{ fontSize:13, color:"#444", marginBottom:6, lineHeight:1.55, display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ color:zoneHex, fontSize:8 }}>●</span>{l}
            </div>
          ))}
        </div>
      )}

      {/* ── Start hint ── */}
      {!started && (
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          background:"rgba(255,255,255,0.95)", borderRadius:24,
          padding:"28px 44px", textAlign:"center",
          fontFamily:"'Segoe UI',sans-serif",
          boxShadow:"0 12px 50px rgba(0,0,0,0.25)",
          backdropFilter:"blur(12px)", pointerEvents:"none",
          animation:"fadeIn 0.4s ease",
        }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🚗</div>
          <div style={{ fontSize:22, fontWeight:900, color:"#111", marginBottom:6 }}>
            Harsh's World
          </div>
          <div style={{ fontSize:14, color:"#666", lineHeight:1.7 }}>
            Drive around to explore my portfolio<br/>
            <strong style={{ color:"#333" }}>WASD</strong> or <strong style={{ color:"#333" }}>↑↓←→</strong> to drive &nbsp;·&nbsp; <strong style={{ color:"#333" }}>Space</strong> to brake<br/>
            Find the <span style={{ color:"#e63946" }}>colored zones</span> to discover more
          </div>
        </div>
      )}

      {/* ── Mobile D-pad ── */}
      <div style={{
        position:"absolute", bottom:20, right:20,
        display:"grid", gridTemplateColumns:"52px 52px 52px",
        gridTemplateRows:"52px 52px 52px", gap:5,
      }}>
        {[
          { key:"ArrowUp",   label:"▲", col:2, row:1 },
          { key:"ArrowLeft", label:"◄", col:1, row:2 },
          { key:" ",         label:"■", col:2, row:2 },
          { key:"ArrowRight",label:"►", col:3, row:2 },
          { key:"ArrowDown", label:"▼", col:2, row:3 },
        ].map(b => (
          <button key={b.key}
            onPointerDown={() => press(b.key)}
            onPointerUp={() => release(b.key)}
            onPointerLeave={() => release(b.key)}
            style={{
              gridColumn:b.col, gridRow:b.row,
              background:"rgba(255,255,255,0.88)",
              border:"1.5px solid rgba(0,0,0,0.08)",
              borderRadius:12, fontSize:18, cursor:"pointer",
              backdropFilter:"blur(8px)",
              boxShadow:"0 3px 12px rgba(0,0,0,0.18)",
              display:"flex", alignItems:"center", justifyContent:"center",
              touchAction:"none", userSelect:"none",
              color: b.key===" " ? "#e63946" : "#333",
            }}
          >{b.label}</button>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateX(24px) scale(0.96); }
          to   { opacity:1; transform:translateX(0)   scale(1); }
        }
        @keyframes fadeIn {
          from { opacity:0; transform:translate(-50%,-48%); }
          to   { opacity:1; transform:translate(-50%,-50%); }
        }
      `}</style>
    </div>
  );
}
