"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import * as CANNON from "cannon-es";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  sky:       0x6ab4d8,
  ground:    0x7ab84e,
  groundAlt: 0x6aad3e,
  road:      0xc8b080,
  roadLine:  0xf5e680,
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
  sand:      0xd4c080,
  fence:     0xb89060,
  // Car
  carPrimary: 0xff2d2d,
  carDark:    0xb81818,
  carBlack:   0x111111,
  carChrome:  0xdddddd,
  carGlass:   0x88ccee,
  carRim:     0xe8e8e8,
  carLight:   0xfffacc,
  carTail:    0xff1133,
};

const flat  = (c: number, o: Partial<THREE.MeshLambertMaterialParameters> = {}) =>
  new THREE.MeshLambertMaterial({ color: c, flatShading: true, ...o });
const phong = (c: number, o: Partial<THREE.MeshPhongMaterialParameters> = {}) =>
  new THREE.MeshPhongMaterial({ color: c, flatShading: true, shininess: 80, ...o });
const glass = (c: number, op = 0.55) =>
  new THREE.MeshPhongMaterial({ color: c, transparent: true, opacity: op, shininess: 180, flatShading: false, side: THREE.DoubleSide });

// ─── Car ──────────────────────────────────────────────────────────────────────
// Car faces +Z (forward). Engine pushes in +Z.
function makeCarMesh() {
  const root = new THREE.Group();

  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x = 0, y = 0, z = 0,
    rx = 0, ry = 0, rz = 0,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    root.add(m);
    return m;
  };

  const body  = phong(C.carPrimary, { shininess: 120 });
  const dark  = flat(C.carDark);
  const blk   = flat(C.carBlack);
  const chr   = phong(C.carChrome, { shininess: 200 });
  const emitW = phong(C.carLight,  { emissive: 0xffffaa, emissiveIntensity: 0.6, shininess: 200 });
  const emitR = phong(C.carTail,   { emissive: 0xaa0020, emissiveIntensity: 0.7 });

  // ── Undercarriage ──
  add(new THREE.BoxGeometry(1.60, 0.12, 3.90), flat(0x0a0a0a), 0, -0.06, 0);

  // ── Main lower body ──
  add(new THREE.BoxGeometry(1.72, 0.42, 3.90), body, 0, 0.21, 0);

  // ── Hood (slopes up from front) ──
  add(new THREE.BoxGeometry(1.68, 0.30, 1.40), body, 0, 0.50,  1.12, -0.14, 0, 0);

  // ── Cabin box ──
  add(new THREE.BoxGeometry(1.50, 0.50, 1.82), body, 0, 0.67, -0.28);

  // ── Roof ──
  add(new THREE.BoxGeometry(1.44, 0.09, 1.60), phong(C.carDark, { shininess: 60 }), 0, 0.96, -0.28);

  // ── Windshield frame (A-pillar) ──
  add(new THREE.BoxGeometry(1.50, 0.40, 0.09), dark, 0, 0.64,  0.61, -0.44, 0, 0);
  // Rear window frame
  add(new THREE.BoxGeometry(1.44, 0.36, 0.09), dark, 0, 0.64, -1.18,  0.38, 0, 0);

  // ── Glass ──
  add(new THREE.BoxGeometry(1.30, 0.37, 0.06), glass(C.carGlass), 0, 0.65,  0.61, -0.44, 0, 0);
  add(new THREE.BoxGeometry(1.26, 0.32, 0.06), glass(C.carGlass), 0, 0.64, -1.18,  0.38, 0, 0);
  add(new THREE.BoxGeometry(0.05, 0.38, 0.88), glass(C.carGlass, 0.45), -0.77, 0.65, -0.28);
  add(new THREE.BoxGeometry(0.05, 0.38, 0.88), glass(C.carGlass, 0.45),  0.77, 0.65, -0.28);

  // ── C-pillar ──
  add(new THREE.BoxGeometry(0.08, 0.48, 0.09), dark, -0.74, 0.65, -1.15);
  add(new THREE.BoxGeometry(0.08, 0.48, 0.09), dark,  0.74, 0.65, -1.15);

  // ── Side skirts ──
  add(new THREE.BoxGeometry(0.09, 0.18, 3.60), dark, -0.88, 0.09, 0);
  add(new THREE.BoxGeometry(0.09, 0.18, 3.60), dark,  0.88, 0.09, 0);

  // ── Wheel arches (visual cutout hint) ──
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.10, 0.09, 1.10), flat(C.carDark), sx*0.87, 0.30,  1.30);
    add(new THREE.BoxGeometry(0.10, 0.09, 1.10), flat(C.carDark), sx*0.87, 0.30, -1.30);
  }

  // ── Front bumper ──
  add(new THREE.BoxGeometry(1.72, 0.26, 0.14), dark, 0,  0.04, 1.97);
  // Lower splitter
  add(new THREE.BoxGeometry(1.62, 0.06, 0.30), blk,  0, -0.09, 2.0);
  // Grille opening
  add(new THREE.BoxGeometry(0.82, 0.14, 0.12), blk,  0,  0.14, 1.99);
  // Grille bars
  for (let i = -2; i <= 2; i++)
    add(new THREE.BoxGeometry(0.03, 0.14, 0.06), flat(0x333333), i*0.18, 0.14, 2.02);
  // Fog lights
  add(new THREE.BoxGeometry(0.22, 0.10, 0.08), emitW, -0.62, 0.04, 1.97);
  add(new THREE.BoxGeometry(0.22, 0.10, 0.08), emitW,  0.62, 0.04, 1.97);

  // ── Headlights ──
  add(new THREE.BoxGeometry(0.36, 0.12, 0.08), emitW, -0.58, 0.20, 1.97);
  add(new THREE.BoxGeometry(0.36, 0.12, 0.08), emitW,  0.58, 0.20, 1.97);
  // DRL strip
  add(new THREE.BoxGeometry(1.36, 0.04, 0.06), emitW, 0, 0.30, 1.97);

  // ── Rear bumper ──
  add(new THREE.BoxGeometry(1.72, 0.26, 0.14), dark, 0, 0.04, -1.97);
  add(new THREE.BoxGeometry(0.90, 0.06, 0.26), blk,  0,-0.09, -2.0);

  // ── Tail lights ──
  add(new THREE.BoxGeometry(0.46, 0.12, 0.08), emitR, -0.58, 0.20, -1.97);
  add(new THREE.BoxGeometry(0.46, 0.12, 0.08), emitR,  0.58, 0.20, -1.97);
  add(new THREE.BoxGeometry(1.36, 0.04, 0.06), emitR, 0, 0.30, -1.97);

  // ── Dual exhausts ──
  add(new THREE.CylinderGeometry(0.065, 0.065, 0.18, 8), chr, -0.34, -0.09, -1.97, Math.PI/2, 0, 0);
  add(new THREE.CylinderGeometry(0.065, 0.065, 0.18, 8), chr,  0.34, -0.09, -1.97, Math.PI/2, 0, 0);

  // ── Spoiler ──
  add(new THREE.BoxGeometry(1.62, 0.09, 0.36), dark,  0, 1.04, -1.80);
  add(new THREE.BoxGeometry(0.08, 0.26, 0.30), dark, -0.80, 0.88, -1.80);
  add(new THREE.BoxGeometry(0.08, 0.26, 0.30), dark,  0.80, 0.88, -1.80);

  // ── Side mirrors ──
  add(new THREE.BoxGeometry(0.24, 0.10, 0.16), dark, -0.96, 0.44,  0.92);
  add(new THREE.BoxGeometry(0.24, 0.10, 0.16), dark,  0.96, 0.44,  0.92);
  // Mirror stalk
  add(new THREE.BoxGeometry(0.06, 0.09, 0.06), blk, -0.90, 0.39, 0.90);
  add(new THREE.BoxGeometry(0.06, 0.09, 0.06), blk,  0.90, 0.39, 0.90);

  // ── Roof antenna ──
  add(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 4), flat(0x555555), 0.50, 1.02, -0.60);

  // ── Accent stripe ──
  add(new THREE.BoxGeometry(0.20, 0.025, 3.70), phong(0xffffff, { shininess: 40 }), 0, 0.425, 0);

  // ── Door handles ──
  add(new THREE.BoxGeometry(0.18, 0.05, 0.04), chr, -0.89, 0.40, -0.10);
  add(new THREE.BoxGeometry(0.18, 0.05, 0.04), chr,  0.89, 0.40, -0.10);

  root.traverse(m => {
    if ((m as THREE.Mesh).isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return root;
}

// ─── Detailed Wheel ───────────────────────────────────────────────────────────
function makeWheel(mirrorX = false) {
  const root = new THREE.Group();
  if (mirrorX) root.scale.x = -1;

  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow = true; root.add(m); return m;
  };

  // Tire (wide, slightly crowned)
  add(new THREE.CylinderGeometry(0.36, 0.36, 0.30, 16), flat(0x111111), 0,0,0, 0,0,Math.PI/2);
  // Tire sidewall detail
  add(new THREE.TorusGeometry(0.34, 0.02, 6, 16), flat(0x222222), 0,0, 0.13);
  add(new THREE.TorusGeometry(0.34, 0.02, 6, 16), flat(0x222222), 0,0,-0.13);

  // Rim dish
  add(new THREE.CylinderGeometry(0.27, 0.27, 0.28, 12), phong(C.carRim, { shininess: 180 }), 0,0,0, 0,0,Math.PI/2);
  // Rim lip
  add(new THREE.TorusGeometry(0.265, 0.025, 6, 16), phong(C.carChrome, { shininess: 220 }), 0,0, 0.14);

  // 5 spokes
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const sx = Math.cos(a) * 0.14, sy = Math.sin(a) * 0.14;
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.260, 0.05),
      phong(C.carRim, { shininess: 160 })
    );
    spoke.position.set(sy, sx, 0.06);
    spoke.rotation.z = a;
    root.add(spoke);
  }

  // Center cap
  add(new THREE.CylinderGeometry(0.065, 0.065, 0.10, 8), phong(0xcccccc, { shininess: 200 }), 0,0,0.10, 0,0,Math.PI/2);
  // Brake disc (visible through spokes)
  add(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 12), flat(0x555555), 0,0,-0.02, 0,0,Math.PI/2);
  // Brake caliper
  add(new THREE.BoxGeometry(0.08, 0.14, 0.08), flat(0xee4444), 0, 0.19, -0.02);

  return root;
}

// ─── Tree ─────────────────────────────────────────────────────────────────────
function makeTree(x: number, z: number, scale = 1.0, type = 0) {
  const g = new THREE.Group();
  const trunkH = (0.6 + Math.random() * 0.5) * scale;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09*scale, 0.14*scale, trunkH, 7),
    flat(C.trunk)
  );
  trunk.position.y = trunkH / 2;
  g.add(trunk);

  if (type === 0) {
    // Pine — 4-layer cones
    const layers: [number,number,number][] = [
      [0.78, 1.10, trunkH + 0.10],
      [0.64, 0.95, trunkH + 0.75],
      [0.48, 0.82, trunkH + 1.35],
      [0.30, 0.66, trunkH + 1.85],
    ];
    layers.forEach(([r,h,y], i) => {
      const c = new THREE.Mesh(
        new THREE.ConeGeometry(r*scale, h*scale, 7),
        flat(i%2===0 ? C.leaf : C.leafMid)
      );
      c.position.y = y*scale; g.add(c);
    });
  } else {
    // Oak — multi-blob
    const blobs: [number,number,number,number][] = [
      [0, trunkH+0.55, 0, 0.72],
      [-0.26, trunkH+0.78, 0.18, 0.52],
      [ 0.28, trunkH+0.72,-0.16, 0.55],
      [ 0.08, trunkH+1.05, 0.08, 0.45],
    ];
    blobs.forEach(([bx,by,bz,br], i) => {
      const b = new THREE.Mesh(
        new THREE.IcosahedronGeometry(br*scale, 1),
        flat(i%2===0 ? C.leaf : C.leafDark)
      );
      b.position.set(bx*scale, by*scale, bz*scale);
      b.scale.y = 0.82; g.add(b);
    });
  }

  g.position.set(x, 0, z);
  g.rotation.y = Math.random() * Math.PI * 2;
  g.traverse(m => { const mm = m as THREE.Mesh; if (mm.isMesh) { mm.castShadow = true; mm.receiveShadow = true; } });
  return g;
}

// ─── Rocks ────────────────────────────────────────────────────────────────────
function makeRocks(x: number, z: number, n = 3) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const geo = new THREE.DodecahedronGeometry(0.22 + Math.random()*0.32, 0);
    geo.rotateY(Math.random()*Math.PI); geo.rotateX(Math.random()*0.6);
    const m = new THREE.Mesh(geo, flat(i%2 ? C.rock : C.rockDark));
    m.scale.y = 0.5 + Math.random()*0.35;
    m.position.set((Math.random()-0.5)*1.4, m.scale.y*0.25, (Math.random()-0.5)*1.4);
    m.castShadow = true;
    g.add(m);
  }
  g.position.set(x, 0.1, z);
  return g;
}

// ─── House ────────────────────────────────────────────────────────────────────
function makeHouse(x: number, z: number, ry = 0) {
  const g = new THREE.Group();
  // Walls
  const walls = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.0, 3.0), flat(0xf0d8b0));
  walls.position.y = 1.0; walls.castShadow = true; walls.receiveShadow = true; g.add(walls);
  // Roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.3, 4), flat(0xb84820));
  roof.position.y = 2.65; roof.rotation.y = Math.PI/4; roof.castShadow = true; g.add(roof);
  // Chimney
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.80, 0.28), flat(0x886655));
  ch.position.set(-0.7, 3.0, -0.5); ch.castShadow = true; g.add(ch);
  // Door
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.55, 1.0, 0.10), flat(0x6a3a18));
  door.position.set(0, 0.5, 1.51); g.add(door);
  const doorTop = new THREE.Mesh(new THREE.CylinderGeometry(0.275, 0.275, 0.10, 8, 1, false, 0, Math.PI), flat(0x6a3a18));
  doorTop.position.set(0, 1.0, 1.51); doorTop.rotation.z = Math.PI/2; g.add(doorTop);
  // Windows
  for (const wx of [-0.72, 0.72]) {
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.44, 0.10), flat(C.carGlass));
    win.position.set(wx, 1.1, 1.51); g.add(win);
    // Window cross
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.44, 0.12), flat(0xf0d8b0));
    bar1.position.set(wx, 1.1, 1.51); g.add(bar1);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.05, 0.12), flat(0xf0d8b0));
    bar2.position.set(wx, 1.1, 1.51); g.add(bar2);
  }
  // Side window
  const sideWin = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.50, 0.60), flat(C.carGlass));
  sideWin.position.set(1.31, 1.1, 0); g.add(sideWin);
  // Steps
  const step = new THREE.Mesh(new THREE.BoxGeometry(0.80, 0.12, 0.28), flat(0xccaa88));
  step.position.set(0, 0.06, 1.65); g.add(step);

  g.position.set(x, 0, z);
  g.rotation.y = ry;
  return g;
}

// ─── Lamp post ────────────────────────────────────────────────────────────────
function makeLamp(x: number, z: number) {
  const g = new THREE.Group();
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.25, 8), flat(0x707070));
  base.position.y = 0.12; g.add(base);
  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 4.8, 7), flat(0x888888));
  pole.position.y = 2.65; pole.castShadow = true; g.add(pole);
  // Curve arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.90), flat(0x888888));
  arm.position.set(0.45, 5.1, 0); g.add(arm);
  // Lamp head
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.32), flat(0x666666));
  head.position.set(0.45, 4.98, 0); g.add(head);
  // Bulb glow
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.10, 8, 6),
    new THREE.MeshPhongMaterial({ color: 0xffffcc, emissive: 0xffff88, emissiveIntensity: 1.5 })
  );
  bulb.position.set(0.45, 4.90, 0); g.add(bulb);
  g.position.set(x, 0, z);
  return g;
}

// ─── Sign post ────────────────────────────────────────────────────────────────
function makeSign(color: number) {
  const g = new THREE.Group();
  for (const px of [-1.0, 1.0]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 3.0, 6), flat(C.post));
    p.position.set(px, 1.5, 0); g.add(p);
  }
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.80, 1.05, 0.09), flat(C.sign));
  back.position.y = 2.95; g.add(back);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.60, 0.86, 0.12), flat(color));
  board.position.set(0, 2.95, 0.04); g.add(board);
  // Border trim
  const trim = new THREE.Mesh(new THREE.BoxGeometry(2.80, 0.10, 0.10), flat(C.post));
  trim.position.y = 3.43; g.add(trim);
  const trim2 = trim.clone(); trim2.position.y = 2.47; g.add(trim2);
  return g;
}

// ─── Fence ────────────────────────────────────────────────────────────────────
function makeFence(x1:number,z1:number,x2:number,z2:number,n=10) {
  const g = new THREE.Group();
  const dx=(x2-x1)/n, dz=(z2-z1)/n;
  const ang = Math.atan2(dz,dx);
  const segLen = Math.sqrt((x2-x1)**2+(z2-z1)**2)/n;
  for (let i=0;i<n;i++) {
    const mx=x1+dx*(i+0.5), mz=z1+dz*(i+0.5);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09,0.95,0.09), flat(C.fence));
    post.position.set(x1+dx*i, 0.47, z1+dz*i); g.add(post);
    for (const ry2 of [0.66, 0.30]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(segLen*0.98,0.065,0.065), flat(C.fence));
      rail.position.set(mx, ry2, mz); rail.rotation.y=ang; g.add(rail);
    }
  }
  return g;
}

// ─── Cloud ────────────────────────────────────────────────────────────────────
function makeCloud(x:number,y:number,z:number) {
  const g = new THREE.Group();
  const mat = flat(0xffffff, { transparent: true, opacity: 0.88 });
  [[0,0,0,1.2],[1.4,0.2,0,0.9],[-1.3,0.1,0,0.85],[0.6,0.8,0,0.75],[-0.5,0.7,0,0.70]].forEach(([bx,by,bz,br]) => {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(br, 1), mat);
    b.position.set(bx,by,bz); b.scale.y=0.62; g.add(b);
  });
  g.position.set(x,y,z);
  return g;
}

// ─── Zones ────────────────────────────────────────────────────────────────────
type Zone = {
  id: string; color: number; pos: [number,number]; radius: number;
  content: { emoji: string; title: string; role?: string; lines: string[] };
};
const ZONES: Zone[] = [
  { id:"home",       color:0x89dceb, pos:[0,0],      radius:9,
    content:{ emoji:"🏠", title:"Harsh Dixit", role:"Senior Cloud & DevOps Engineer",
      lines:["AWS SAA-C03 Certified","5+ yrs building cloud-native platforms","Explore the world to learn more →"] } },
  { id:"about",      color:0x6acf6a, pos:[-34,-32],  radius:9,
    content:{ emoji:"👨‍💻", title:"About Me", role:"Currently @ Caylent",
      lines:["Architect of scalable cloud platforms","Terraform · AWS · Kubernetes fan","Love automating everything","Based in India · Open to remote"] } },
  { id:"experience", color:0xcba6f7, pos:[36,-26],   radius:9,
    content:{ emoji:"💼", title:"Experience", role:"5+ Years",
      lines:["Caylent — Sr. DevOps Engineer","Accenture — Cloud Consultant","Platform engineering at scale","CI/CD · GitOps · IaC · Observability"] } },
  { id:"skills",     color:0xf9e2af, pos:[-32,35],   radius:9,
    content:{ emoji:"⚡", title:"Tech Stack", role:"Cloud · DevOps · Automation",
      lines:["AWS · GCP · Azure","Terraform · Ansible · Helm","Docker · Kubernetes · ArgoCD","Python · Bash · TypeScript · Go"] } },
  { id:"contact",    color:0xf38ba8, pos:[32,38],    radius:9,
    content:{ emoji:"📬", title:"Say Hello", role:"Let's build something great",
      lines:["harsh.dixit@caylent.com","github.com/harsh785","linkedin.com/in/harshdixit"] } },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CyberCarGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const keysRef  = useRef<Record<string, boolean>>({});
  const [kmh,     setKmh]     = useState(0);
  const [zone,    setZone]    = useState<Zone | null>(null);
  const [started, setStarted] = useState(false);
  const [gear,    setGear]    = useState("N");

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
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x9dd4e8, 0.007);

    // ── Sky ──
    const skyGeo = new THREE.SphereGeometry(140, 16, 8);
    skyGeo.scale(-1, 1, 1);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        top: { value: new THREE.Color(0x4a9ad4) },
        bot: { value: new THREE.Color(0xb8e4f8) },
      },
      vertexShader: `varying float h; void main(){ h=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `uniform vec3 top,bot; varying float h; void main(){ gl_FragColor=vec4(mix(bot,top,max(h,0.)),1.); }`,
      side: THREE.BackSide, depthWrite: false,
    });
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // ── Clouds ──
    [[-40,22,-10],[20,26,30],[-10,24,50],[55,20,-30],[0,28,-60],[-55,25,20]].forEach(([cx,cy,cz]) =>
      scene.add(makeCloud(cx,cy,cz))
    );

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xaaccea, 0.55));
    const hemi = new THREE.HemisphereLight(0x88c8f0, 0x88aa44, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff6d0, 2.4);
    sun.position.set(50, 70, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 220;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -100;
    sun.shadow.camera.right = sun.shadow.camera.top = 100;
    sun.shadow.bias = -0.0008;
    scene.add(sun);

    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(0xc8e8ff, 0.4);
    fill.position.set(-30, 20, -20);
    scene.add(fill);

    const camera = new THREE.PerspectiveCamera(52, el.clientWidth / el.clientHeight, 0.1, 260);
    camera.position.set(0, 10, -22);

    // ── Physics ──
    const world = new CANNON.World();
    world.gravity.set(0, -22, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = false;

    // ── Ground ──
    const groundGeo = new THREE.PlaneGeometry(260, 260, 64, 64);
    const gPos = groundGeo.attributes.position;
    for (let i = 0; i < gPos.count; i++) {
      const gx = gPos.getX(i), gz = gPos.getZ(i);
      const d = Math.sqrt(gx*gx + gz*gz);
      if (d > 10) {
        gPos.setY(i,
          Math.sin(gx*0.10)*0.5 + Math.cos(gz*0.13)*0.4 +
          Math.sin(gx*0.06 + gz*0.07)*0.6 +
          Math.cos(gx*0.18 + gz*0.09)*0.25
        );
      }
    }
    groundGeo.computeVertexNormals();
    const groundMesh = new THREE.Mesh(groundGeo, flat(C.ground));
    groundMesh.rotation.x = -Math.PI/2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    const gBody = new CANNON.Body({ mass: 0 });
    gBody.addShape(new CANNON.Plane());
    gBody.quaternion.setFromEuler(-Math.PI/2, 0, 0);
    world.addBody(gBody);

    // ── Grass patches (color variation) ──
    for (let i = 0; i < 40; i++) {
      const px = (Math.random()-0.5)*180, pz = (Math.random()-0.5)*180;
      const patch = new THREE.Mesh(
        new THREE.CircleGeometry(2+Math.random()*4, 7),
        flat(Math.random()>0.5 ? C.groundAlt : C.hill)
      );
      patch.rotation.x = -Math.PI/2;
      patch.position.set(px, 0.02, pz);
      scene.add(patch);
    }

    // ── Roads ──
    const addRoad = (x:number,z:number,w:number,d:number,ry=0) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), flat(C.road));
      m.position.set(x,0.02,z); m.rotation.y=ry; m.receiveShadow=true; scene.add(m);
      // Center white line
      const cl = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, d*0.96), flat(0xfafafa));
      cl.position.set(x,0.05,z); cl.rotation.y=ry; scene.add(cl);
      // Curbs
      for (const side of [-1,1]) {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.07, d), flat(0xcccccc));
        const off = new THREE.Vector3(side*(w/2+0.10), 0.04, 0);
        off.applyEuler(new THREE.Euler(0,ry,0));
        curb.position.set(x+off.x, 0.04, z+off.z); curb.rotation.y=ry; scene.add(curb);
      }
    };
    addRoad(0,   0,   7, 140);
    addRoad(0,   0, 140,   7, Math.PI/2);
    addRoad(-17,-33,  5,  22, 0.14);
    addRoad( 18,-27,  5,  22,-0.12);
    addRoad(-16, 34,  5,  22, 0.12);
    addRoad( 16, 37,  5,  22,-0.14);

    // Road dashes (side lanes)
    for (let ri = -68; ri < 68; ri += 7) {
      for (const sx of [-3.2, 3.2]) {
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 3), flat(C.roadLine));
        d.position.set(sx, 0.05, ri); scene.add(d);
      }
    }

    // ── Zones ──
    for (const z of ZONES) {
      const [zx,zz] = z.pos;
      const hc = z.color;
      // Pad
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(z.radius, z.radius, 0.07, 28),
        new THREE.MeshLambertMaterial({ color: hc, flatShading: true, transparent: true, opacity: 0.38 })
      );
      pad.position.set(zx, 0.04, zz); scene.add(pad);
      // Torus ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(z.radius, 0.14, 6, 30), flat(hc));
      ring.rotation.x = Math.PI/2; ring.position.set(zx, 0.09, zz); scene.add(ring);
      // Sign
      const sign = makeSign(hc);
      sign.position.set(zx, 0, zz - z.radius + 1.2);
      scene.add(sign);
    }

    // ── Trees ──
    const treeData: [number,number,number,number][] = [
      [-9,-9,0.9,0],[-13,5,1.1,1],[-5,17,0.85,0],[10,-12,1.0,1],[16,-5,0.9,0],[12,14,1.1,1],
      [-7,-24,1.0,0],[-21,-12,1.2,1],[-25,7,0.85,0],[-17,24,1.0,1],[24,-17,1.1,0],[27,-7,0.9,1],
      [24,12,1.0,0],[20,25,1.15,1],[-28,28,0.85,0],[-12,30,1.0,1],[12,29,0.9,0],[30,7,1.1,1],
      [-33,13,1.0,0],[-10,38,0.9,1],[10,40,1.1,0],[42,-14,1.0,1],[38,7,1.2,0],[-40,-14,1.0,1],
      [-38,5,0.9,0],[2,-42,1.1,1],[2,42,0.85,0],[43,24,1.0,1],[-43,24,0.9,0],[17,-39,1.1,1],
      [-17,-39,1.0,0],[33,-39,0.9,1],[-33,39,1.1,0],[44,-34,0.85,1],[-44,-34,1.0,0],
      [7,-15,0.85,1],[-7,-15,0.90,0],[20,1,1.0,1],[-20,1,0.9,0],[1,20,1.1,1],[1,-20,1.0,0],
      [46,0,1.2,1],[-46,0,1.1,0],[0,46,1.0,1],[0,-46,0.9,0],[48,14,0.9,1],[-48,14,1.0,0],
    ];
    for (const [tx,tz,s,t] of treeData) scene.add(makeTree(tx, tz, s, t));

    // ── Rocks ──
    [[-18,-18],[18,-20],[20,18],[-16,20],[24,-30],[30,24],[-26,30],[36,-22],[-36,-22],[10,-30],[-10,32]].forEach(([rx,rz]) =>
      scene.add(makeRocks(rx as number, rz as number, 2+Math.floor(Math.random()*3)))
    );

    // ── Houses ──
    scene.add(makeHouse(-10,-34, 0.3));
    scene.add(makeHouse(  8,-34,-0.3));
    scene.add(makeHouse(-40, 16, 0.8));
    scene.add(makeHouse( 40,-16,-0.8));
    scene.add(makeHouse(-40,-28, 1.4));
    scene.add(makeHouse( 44, 10,-0.5));

    // ── Lamp posts ──
    for (let lz = -56; lz <= 56; lz += 10) {
      scene.add(makeLamp( 4.6, lz));
      scene.add(makeLamp(-4.6, lz));
    }

    // ── Hills with physics ──
    for (const [hx,hz,hr,hh] of [[-34,-32,9,6],[36,-26,9,6],[-32,35,9,6],[32,38,9,6]] as [number,number,number,number][]) {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(hr, hh, 9), flat(C.hill));
      hill.position.set(hx, hh/2-0.4, hz); hill.castShadow=true; hill.receiveShadow=true; scene.add(hill);
      // trees ringing the hill
      for (let a=0;a<6;a++) {
        const ang=(a/6)*Math.PI*2;
        scene.add(makeTree(hx+Math.cos(ang)*(hr-1.2), hz+Math.sin(ang)*(hr-1.2), 0.75, a%2));
      }
      const hBody=new CANNON.Body({mass:0});
      hBody.addShape(new CANNON.Cylinder(0.1,hr,hh,9));
      hBody.position.set(hx,hh/2-0.4,hz);
      world.addBody(hBody);
    }

    // ── Ramp ──
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(5.5,0.3,9), flat(C.road));
    ramp.position.set(0,0.90,-22); ramp.rotation.x=-0.17;
    ramp.castShadow=true; ramp.receiveShadow=true; scene.add(ramp);
    const rampB=new CANNON.Body({mass:0});
    rampB.addShape(new CANNON.Box(new CANNON.Vec3(2.75,0.15,4.5)));
    rampB.position.set(0,0.90,-22);
    rampB.quaternion.setFromEuler(-0.17,0,0);
    world.addBody(rampB);

    // ── Pond ──
    const pond = new THREE.Mesh(new THREE.CircleGeometry(6,18), flat(C.water));
    pond.rotation.x=-Math.PI/2; pond.position.set(18,0.07,18); scene.add(pond);
    const pondRing = new THREE.Mesh(new THREE.TorusGeometry(6,0.22,6,20), flat(C.waterEdge));
    pondRing.rotation.x=Math.PI/2; pondRing.position.set(18,0.09,18); scene.add(pondRing);
    // Pond shores — sand
    const shore = new THREE.Mesh(new THREE.CircleGeometry(7.5,18), flat(C.sand));
    shore.rotation.x=-Math.PI/2; shore.position.set(18,0.03,18); scene.add(shore);

    // ── Fences (world border) ──
    scene.add(makeFence(-70,-70, 70,-70));
    scene.add(makeFence( 70,-70, 70, 70));
    scene.add(makeFence( 70, 70,-70, 70));
    scene.add(makeFence(-70, 70,-70,-70));

    // ── Car (physics: forward = +Z, engine force = +MAX for fwd) ──
    const chassisBody = new CANNON.Body({ mass: 145 });
    chassisBody.addShape(new CANNON.Box(new CANNON.Vec3(0.86, 0.20, 1.92)));
    chassisBody.position.set(0, 2.0, -12); // start slightly behind origin, facing +Z
    chassisBody.allowSleep = false;
    chassisBody.linearDamping = 0.05;
    chassisBody.angularDamping = 0.38;
    world.addBody(chassisBody);

    const vehicle = new CANNON.RaycastVehicle({
      chassisBody, indexRightAxis: 0, indexUpAxis: 1, indexForwardAxis: 2,
    });

    const wBase = {
      radius: 0.36,
      directionLocal:   new CANNON.Vec3(0,-1,0),
      suspensionStiffness: 42,
      suspensionRestLength: 0.30,
      frictionSlip: 1.65,
      dampingRelaxation: 2.3,
      dampingCompression: 4.4,
      maxSuspensionForce: 100000,
      rollInfluence: 0.005,
      axleLocal: new CANNON.Vec3(1,0,0),
      chassisConnectionPointLocal: new CANNON.Vec3(0,0,0),
      maxSuspensionTravel: 0.28,
      useCustomSlidingRotationalSpeed: true,
      customSlidingRotationalSpeed: -30,
    };
    // Front wheels at +Z, rear at -Z (car faces +Z)
    [[-0.88,0.05, 1.40],[0.88,0.05, 1.40],[-0.88,0.05,-1.40],[0.88,0.05,-1.40]].forEach(([x,y,z2]) => {
      vehicle.addWheel({ ...wBase, chassisConnectionPointLocal: new CANNON.Vec3(x,y,z2) });
    });
    vehicle.addToWorld(world);

    // ── Car visuals ──
    const carMesh = makeCarMesh();
    scene.add(carMesh);

    // Wheels: front-left, front-right, rear-left, rear-right
    const wheelMeshes = [false, true, false, true].map(mir => makeWheel(mir));
    wheelMeshes.forEach(w => scene.add(w));

    // ── Input ──
    const onKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key]=true;  setStarted(true); e.preventDefault(); };
    const onKeyUp   = (e: KeyboardEvent) => { keysRef.current[e.key]=false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup",   onKeyUp);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Loop ──
    const FIXED = 1/60;
    const MAX_F = 1500;
    const MAX_S = 0.46;
    const BRAKE = 28;

    // Camera state
    const camPos    = new THREE.Vector3(0, 10, -22);
    const camLookAt = new THREE.Vector3();
    let lastTime = -1, frameId = 0;

    const loop = (t: number) => {
      frameId = requestAnimationFrame(loop);
      if (lastTime < 0) { lastTime = t; return; }
      const dt = Math.min((t - lastTime) / 1000, 0.05);
      lastTime = t;

      const k = keysRef.current;
      const fwd   = !!(k["w"]||k["W"]||k["ArrowUp"]);
      const back  = !!(k["s"]||k["S"]||k["ArrowDown"]);
      const left  = !!(k["a"]||k["A"]||k["ArrowLeft"]);
      const right = !!(k["d"]||k["D"]||k["ArrowRight"]);
      const brake = !!(k[" "]||k["Shift"]);

      const vel = chassisBody.velocity;
      const spd = Math.sqrt(vel.x**2 + vel.z**2);

      // Engine: forward = positive force in +Z axis
      const engineF = fwd ? MAX_F : back ? -MAX_F*0.55 : 0;
      // Speed-sensitive steering
      const steerAmt = MAX_S * Math.max(0.25, 1.0 - spd*0.028);
      const steer = left ? steerAmt : right ? -steerAmt : 0;
      const rollR = (!fwd && !back) ? 6 : 0;

      vehicle.applyEngineForce(engineF, 2);
      vehicle.applyEngineForce(engineF, 3);
      vehicle.setSteeringValue(steer, 0);
      vehicle.setSteeringValue(steer, 1);
      for (let i=0;i<4;i++) vehicle.setBrake(brake ? BRAKE : rollR, i);

      world.step(FIXED, dt, 3);

      // Sync car
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

      // ── Camera: follow behind car in its local -Z direction ──
      // Car's forward in world space = quaternion applied to (0,0,1)
      const carQuat  = new THREE.Quaternion(cq.x, cq.y, cq.z, cq.w);
      const forward  = new THREE.Vector3(0, 0, 1).applyQuaternion(carQuat);
      // Camera sits behind (-forward) and above
      const pullback = 13 + spd * 0.28; // pull back more at speed
      const targetCam = new THREE.Vector3(
        cp.x - forward.x * pullback,
        cp.y + 7.5,
        cp.z - forward.z * pullback
      );
      camPos.lerp(targetCam, 0.065);
      camera.position.copy(camPos);
      camLookAt.set(cp.x + forward.x*2, cp.y + 0.9, cp.z + forward.z*2);
      camera.lookAt(camLookAt);

      // HUD
      const kmh2 = Math.round(spd * 3.6);
      setKmh(kmh2);
      setGear(fwd ? "D" : back ? "R" : kmh2 > 2 ? "D" : "N");

      // Zone check
      let nearest: Zone | null = null;
      for (const z of ZONES) {
        const dx = cp.x - z.pos[0], dz = cp.z - z.pos[1];
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

  const press   = (k: string) => { keysRef.current[k]=true;  setStarted(true); };
  const release = (k: string) => { keysRef.current[k]=false; };

  const zHex = zone ? `#${zone.color.toString(16).padStart(6,"0")}` : "#fff";

  return (
    <div style={{ width:"100vw", height:"100vh", position:"relative", overflow:"hidden" }}>
      <div ref={mountRef} style={{ width:"100%", height:"100%" }} />

      {/* Back */}
      <Link href="/" style={{
        position:"absolute", top:16, left:16,
        background:"rgba(255,255,255,0.92)", color:"#111",
        padding:"8px 18px", borderRadius:28, fontFamily:"system-ui,sans-serif",
        fontSize:13, fontWeight:700, textDecoration:"none",
        boxShadow:"0 2px 20px rgba(0,0,0,0.18)", backdropFilter:"blur(10px)",
        display:"flex", alignItems:"center", gap:7,
      }}>← Portfolio</Link>

      {/* Speedometer */}
      <div style={{
        position:"absolute", bottom:24, left:24,
        background:"rgba(14,14,22,0.85)", borderRadius:22,
        padding:"14px 24px", fontFamily:"system-ui,sans-serif",
        boxShadow:"0 4px 36px rgba(0,0,0,0.4)", backdropFilter:"blur(14px)",
        border:"1px solid rgba(255,255,255,0.10)",
      }}>
        <div style={{ fontSize:42, fontWeight:900, color:"#fff", lineHeight:1, fontVariantNumeric:"tabular-nums" }}>
          {kmh}<span style={{ fontSize:14, fontWeight:500, color:"rgba(255,255,255,0.45)", marginLeft:5 }}>km/h</span>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:10 }}>
          {["P","R","N","D"].map(g2 => (
            <span key={g2} style={{
              fontSize:12, fontWeight:800, letterSpacing:"0.04em",
              color: gear===g2 ? "#fff" : "rgba(255,255,255,0.22)",
              background: gear===g2 ? "#ff2d2d" : "rgba(255,255,255,0.06)",
              padding:"3px 8px", borderRadius:6, transition:"all 0.15s ease",
            }}>{g2}</span>
          ))}
        </div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.28)", marginTop:8, letterSpacing:"0.06em" }}>
          WASD · ARROWS · SPACE
        </div>
      </div>

      {/* Zone panel */}
      {zone && (
        <div key={zone.id} style={{
          position:"absolute", top:16, right:16, width:300,
          background:"rgba(255,255,255,0.97)", borderRadius:22,
          padding:"22px 26px", fontFamily:"system-ui,sans-serif",
          boxShadow:"0 10px 50px rgba(0,0,0,0.22)", backdropFilter:"blur(14px)",
          borderLeft:`5px solid ${zHex}`,
          animation:"slideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{ fontSize:34, marginBottom:10 }}>{zone.content.emoji}</div>
          <div style={{ fontSize:20, fontWeight:900, color:"#111", marginBottom:3 }}>
            {zone.content.title}
          </div>
          {zone.content.role && (
            <div style={{ fontSize:12, fontWeight:700, color:zHex, marginBottom:14, letterSpacing:"0.05em", textTransform:"uppercase" }}>
              {zone.content.role}
            </div>
          )}
          <div style={{ width:36, height:3, background:zHex, borderRadius:3, marginBottom:14 }} />
          {zone.content.lines.map((l,i) => (
            <div key={i} style={{ fontSize:13.5, color:"#444", marginBottom:8, lineHeight:1.5, display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ color:zHex, fontSize:9, flexShrink:0 }}>◆</span>{l}
            </div>
          ))}
        </div>
      )}

      {/* Start hint */}
      {!started && (
        <div style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          background:"rgba(255,255,255,0.96)", borderRadius:28,
          padding:"32px 52px", textAlign:"center",
          fontFamily:"system-ui,sans-serif",
          boxShadow:"0 16px 60px rgba(0,0,0,0.28)",
          backdropFilter:"blur(16px)", pointerEvents:"none",
        }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🚗</div>
          <div style={{ fontSize:24, fontWeight:900, color:"#111", marginBottom:8 }}>Harsh's World</div>
          <div style={{ fontSize:14, color:"#555", lineHeight:1.9 }}>
            Drive around to explore my portfolio<br/>
            <strong>WASD</strong> or <strong>↑↓←→</strong> to steer &nbsp;·&nbsp; <strong>Space</strong> to brake<br/>
            Find the <span style={{ color:"#ff2d2d", fontWeight:700 }}>colored zones</span> to learn more
          </div>
        </div>
      )}

      {/* Mobile D-pad */}
      <div style={{
        position:"absolute", bottom:20, right:20,
        display:"grid", gridTemplateColumns:"56px 56px 56px",
        gridTemplateRows:"56px 56px 56px", gap:5,
      }}>
        {[
          { k:"ArrowUp",    l:"▲", c:2, r:1 },
          { k:"ArrowLeft",  l:"◄", c:1, r:2 },
          { k:" ",          l:"■", c:2, r:2 },
          { k:"ArrowRight", l:"►", c:3, r:2 },
          { k:"ArrowDown",  l:"▼", c:2, r:3 },
        ].map(b => (
          <button key={b.k}
            onPointerDown={() => press(b.k)}
            onPointerUp={() => release(b.k)}
            onPointerLeave={() => release(b.k)}
            style={{
              gridColumn:b.c, gridRow:b.r,
              background:"rgba(255,255,255,0.90)",
              border:"1.5px solid rgba(0,0,0,0.08)", borderRadius:14,
              fontSize:18, cursor:"pointer",
              boxShadow:"0 3px 14px rgba(0,0,0,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              touchAction:"none", userSelect:"none",
              color: b.k===" " ? "#ff2d2d" : "#222",
            }}
          >{b.l}</button>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity:0; transform:translateX(28px) scale(0.94); }
          to   { opacity:1; transform:translateX(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
