"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import * as THREE from "three";
import * as CANNON from "cannon-es";

const BUILD = "v2.0.0 · 2026.04.26";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  ground:    0x7ab84e, groundAlt: 0x6aad3e, hill: 0x6aaa38,
  road: 0xc8b080, roadLine: 0xf5e680,
  trunk: 0x7a5230, leaf: 0x3a8a3a, leafMid: 0x2e7a2e, leafDark: 0x1e6a1e,
  rock: 0x888888, rockDark: 0x606060,
  water: 0x3ab4e8, waterEdge: 0x2a8abf, sand: 0xd4c080,
  fence: 0xb89060, post: 0x9a6830, sign: 0xfef9ef,
  // Car (Thar burnt orange)
  carPrimary: 0xcc4a12, carDark: 0x8c2a08, carBlack: 0x111111,
  carChrome: 0xdddddd, carGlass: 0x88ccee, carRim: 0xe8e8e8,
  carLight: 0xfffacc, carTail: 0xff1133,
  // DevOps
  k8sBlue: 0x326ce5, tfPurple: 0x7b42bc, mergeRed: 0xff3b3b, downtime: 0xff8800,
};

const flat  = (c:number, o:Partial<THREE.MeshLambertMaterialParameters>={}) =>
  new THREE.MeshLambertMaterial({color:c,flatShading:true,...o});
const phong = (c:number, o:Partial<THREE.MeshPhongMaterialParameters>={}) =>
  new THREE.MeshPhongMaterial({color:c,flatShading:true,shininess:80,...o});

// ─── Mahindra Thar-style SUV ──────────────────────────────────────────────────
// Car faces +Z. All y positions are relative to chassis center (y=0 in local space).
function makeCarMesh() {
  const root = new THREE.Group();
  const add = (geo:THREE.BufferGeometry, mat:THREE.Material, x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
    const m = new THREE.Mesh(geo,mat);
    m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=true; root.add(m); return m;
  };

  const ORANGE  = phong(0xcc4a12, { shininess: 110 });
  const SILVER  = phong(0xb0b0b0, { shininess: 140 });
  const DGRAY   = flat(0x2a2a2a);
  const MGRAY   = flat(0x555555);
  const LGRAY   = flat(0x888888);
  const BLACK   = flat(0x0a0a0a);
  const EMITW   = phong(0xfffacc, { emissive:0xffffaa, emissiveIntensity:0.7, shininess:200 });
  const EMITR   = phong(0xff1133, { emissive:0xaa0020, emissiveIntensity:0.8 });
  const GLASS   = new THREE.MeshPhongMaterial({ color:0x88ccee, transparent:true, opacity:0.48, shininess:180, side:THREE.DoubleSide });

  // ── Undercarriage / frame ──
  add(new THREE.BoxGeometry(1.80, 0.12, 3.60), BLACK,       0, -0.26, 0);
  // Frame rails
  add(new THREE.BoxGeometry(0.12, 0.10, 3.50), flat(0x333333), -0.75, -0.22, 0);
  add(new THREE.BoxGeometry(0.12, 0.10, 3.50), flat(0x333333),  0.75, -0.22, 0);

  // ── Lower body (boxy, wide) ──
  add(new THREE.BoxGeometry(1.90, 0.68, 3.60), ORANGE,      0, 0.10, 0);

  // ── Fender wells (slight arch above wheels) ──
  for (const sx of [-1, 1]) {
    // Front fender arch
    add(new THREE.CylinderGeometry(0.52, 0.52, 0.26, 10), ORANGE, sx*0.94, 0.18, 1.30, 0, 0, Math.PI/2);
    // Rear fender arch
    add(new THREE.CylinderGeometry(0.52, 0.52, 0.26, 10), ORANGE, sx*0.94, 0.18,-1.25, 0, 0, Math.PI/2);
    // Fender flare trim (dark plastic)
    add(new THREE.CylinderGeometry(0.54, 0.54, 0.08, 10), DGRAY, sx*0.97, 0.18, 1.30, 0, 0, Math.PI/2);
    add(new THREE.CylinderGeometry(0.54, 0.54, 0.08, 10), DGRAY, sx*0.97, 0.18,-1.25, 0, 0, Math.PI/2);
  }

  // ── Cabin (upright, boxy — Thar has tall vertical sides) ──
  add(new THREE.BoxGeometry(1.88, 0.90, 2.20), ORANGE,      0, 0.79, -0.22);

  // ── Flat roof ──
  add(new THREE.BoxGeometry(1.86, 0.09, 2.14), flat(0x333333), 0, 1.25, -0.22);
  // Roof rack rails
  add(new THREE.BoxGeometry(0.06, 0.06, 1.90), LGRAY,      -0.82, 1.31, -0.22);
  add(new THREE.BoxGeometry(0.06, 0.06, 1.90), LGRAY,       0.82, 1.31, -0.22);
  add(new THREE.BoxGeometry(1.70, 0.06, 0.06), LGRAY,       0, 1.31, 0.72);
  add(new THREE.BoxGeometry(1.70, 0.06, 0.06), LGRAY,       0, 1.31,-1.12);

  // ── Hood (flat with slight rise in center) ──
  add(new THREE.BoxGeometry(1.90, 0.08, 1.28), ORANGE,      0, 0.48, 1.08);
  // Hood power bulge
  add(new THREE.BoxGeometry(0.42, 0.06, 1.10), ORANGE,      0, 0.52, 1.10);
  // Hood hinge line
  add(new THREE.BoxGeometry(1.90, 0.04, 0.06), DGRAY,       0, 0.46, 0.47);

  // ── Windshield (tall, nearly vertical — Thar characteristic) ──
  add(new THREE.BoxGeometry(1.76, 0.78, 0.08), GLASS,       0, 0.80, 0.48, -0.08, 0, 0);
  // Windshield frame
  add(new THREE.BoxGeometry(1.88, 0.84, 0.06), DGRAY,       0, 0.80, 0.48, -0.08, 0, 0);
  // Wiper (horizontal bar)
  add(new THREE.BoxGeometry(1.40, 0.04, 0.04), MGRAY,       0, 0.47, 0.52);

  // ── Rear window ──
  add(new THREE.BoxGeometry(1.72, 0.60, 0.08), GLASS,       0, 0.80,-1.34, 0.06, 0, 0);
  add(new THREE.BoxGeometry(1.84, 0.66, 0.06), DGRAY,       0, 0.80,-1.34, 0.06, 0, 0);

  // ── Side windows ──
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.07, 0.64, 1.44), GLASS,  sx*0.95, 0.82, -0.22);
    add(new THREE.BoxGeometry(0.04, 0.70, 1.50), DGRAY,  sx*0.96, 0.82, -0.22);
  }

  // ── A-pillar ──
  add(new THREE.BoxGeometry(0.10, 0.84, 0.10), DGRAY,  -0.92, 0.80, 0.48);
  add(new THREE.BoxGeometry(0.10, 0.84, 0.10), DGRAY,   0.92, 0.80, 0.48);

  // ── Front face — Thar's signature grille area ──
  // Outer grille frame (body color band)
  add(new THREE.BoxGeometry(1.90, 0.56, 0.10), ORANGE,    0, 0.20, 1.82);
  // Inner grille opening (dark recess)
  add(new THREE.BoxGeometry(1.10, 0.44, 0.08), DGRAY,     0, 0.22, 1.85);
  // 7 vertical grille bars (Thar signature)
  for (let i = -3; i <= 3; i++) {
    add(new THREE.BoxGeometry(0.09, 0.42, 0.10), BLACK,   i * 0.168, 0.22, 1.87);
  }
  // Grille surround trim (chrome)
  add(new THREE.BoxGeometry(1.14, 0.48, 0.06), SILVER,    0, 0.22, 1.83);

  // ── "MAHINDRA" hood text bar ──
  add(new THREE.BoxGeometry(0.85, 0.07, 0.06), DGRAY,     0, 0.50, 1.80);

  // ── Round headlights (Thar's circular headlamps) ──
  for (const sx of [-0.68, 0.68]) {
    // Outer bezel ring (orange fender, already covered)
    // Dark surround
    add(new THREE.CylinderGeometry(0.195, 0.195, 0.14, 16), DGRAY, sx, 0.28, 1.82, Math.PI/2, 0, 0);
    // Chrome ring
    add(new THREE.CylinderGeometry(0.210, 0.210, 0.06, 16), SILVER, sx, 0.28, 1.80, Math.PI/2, 0, 0);
    // Light lens
    add(new THREE.CylinderGeometry(0.168, 0.168, 0.10, 16), EMITW,  sx, 0.28, 1.87, Math.PI/2, 0, 0);
    // DRL ring
    add(new THREE.TorusGeometry(0.19, 0.025, 6, 16), EMITW, sx, 0.28, 1.84);
  }

  // ── Turn signal (small orange rectangle beside headlights) ──
  add(new THREE.BoxGeometry(0.12, 0.08, 0.06), phong(0xffaa00, { emissive:0xff8800, emissiveIntensity:0.5 }), -0.85, 0.28, 1.82);
  add(new THREE.BoxGeometry(0.12, 0.08, 0.06), phong(0xffaa00, { emissive:0xff8800, emissiveIntensity:0.5 }),  0.85, 0.28, 1.82);

  // ── Front bumper (silver, chunky) ──
  add(new THREE.BoxGeometry(1.92, 0.26, 0.22), SILVER,    0, -0.10, 1.84);
  // Bumper bash plate
  add(new THREE.BoxGeometry(1.92, 0.12, 0.28), DGRAY,     0, -0.22, 1.82);
  // Skid plate
  add(new THREE.BoxGeometry(1.60, 0.08, 0.24), flat(0x444444), 0, -0.30, 1.80);
  // Tow hook
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), SILVER, -0.60, -0.26, 1.90, 0, 0, Math.PI/2);
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), SILVER,  0.60, -0.26, 1.90, 0, 0, Math.PI/2);

  // ── "THAR" license plate ──
  add(new THREE.BoxGeometry(0.54, 0.16, 0.06), flat(0xeeeeee), 0, -0.06, 1.91);
  add(new THREE.BoxGeometry(0.50, 0.12, 0.08), BLACK,          0, -0.06, 1.93); // text area

  // ── Running boards / side steps ──
  add(new THREE.BoxGeometry(0.18, 0.08, 2.80), DGRAY,  -0.98, -0.24, 0.02);
  add(new THREE.BoxGeometry(0.18, 0.08, 2.80), DGRAY,   0.98, -0.24, 0.02);
  // Step grip lines
  for (const sz of [-0.8, -0.2, 0.4]) {
    add(new THREE.BoxGeometry(0.16, 0.04, 0.06), flat(0x333333), -0.98, -0.20, sz);
    add(new THREE.BoxGeometry(0.16, 0.04, 0.06), flat(0x333333),  0.98, -0.20, sz);
  }

  // ── Door hinges (A-pillar side) ──
  for (const sx of [-0.96, 0.96]) {
    for (const hz of [0.36, 0.58]) {
      add(new THREE.BoxGeometry(0.10, 0.09, 0.08), SILVER, sx, hz, 0.47);
    }
    // Rear door hinges (Thar 4-door hint, decorative)
    for (const hz of [0.36, 0.58]) {
      add(new THREE.BoxGeometry(0.10, 0.09, 0.08), SILVER, sx, hz, -0.35);
    }
  }

  // ── Door handles ──
  add(new THREE.BoxGeometry(0.22, 0.06, 0.08), SILVER, -0.97, 0.36, 0.05);
  add(new THREE.BoxGeometry(0.22, 0.06, 0.08), SILVER,  0.97, 0.36, 0.05);

  // ── Side mirrors (A-pillar mounted, large) ──
  add(new THREE.BoxGeometry(0.06, 0.10, 0.08), DGRAY, -0.96, 0.76, 0.50); // stalk
  add(new THREE.BoxGeometry(0.06, 0.10, 0.08), DGRAY,  0.96, 0.76, 0.50);
  add(new THREE.BoxGeometry(0.30, 0.16, 0.18), DGRAY, -1.06, 0.76, 0.44); // mirror
  add(new THREE.BoxGeometry(0.30, 0.16, 0.18), DGRAY,  1.06, 0.76, 0.44);
  // Mirror glass
  add(new THREE.BoxGeometry(0.26, 0.13, 0.05), phong(0x6688aa,{shininess:200}), -1.06, 0.76, 0.38);
  add(new THREE.BoxGeometry(0.26, 0.13, 0.05), phong(0x6688aa,{shininess:200}),  1.06, 0.76, 0.38);

  // ── Tail lights (rectangular, Thar-style) ──
  for (const sx of [-0.78, 0.78]) {
    add(new THREE.BoxGeometry(0.32, 0.22, 0.08), EMITR,  sx, 0.26,-1.82);
    // White reverse light
    add(new THREE.BoxGeometry(0.14, 0.10, 0.06), EMITW,  sx, 0.10,-1.82);
  }
  // Rear reflector strip
  add(new THREE.BoxGeometry(1.70, 0.05, 0.06), phong(0xff4444,{emissive:0xaa0000,emissiveIntensity:0.4}), 0, 0.40,-1.82);

  // ── Rear bumper ──
  add(new THREE.BoxGeometry(1.90, 0.26, 0.22), SILVER,  0,-0.10,-1.84);
  add(new THREE.BoxGeometry(1.90, 0.12, 0.28), DGRAY,   0,-0.22,-1.82);
  // Dual exhausts
  add(new THREE.CylinderGeometry(0.055, 0.055, 0.20, 8), SILVER, -0.44,-0.24,-1.92, Math.PI/2, 0, 0);
  add(new THREE.CylinderGeometry(0.055, 0.055, 0.20, 8), SILVER,  0.44,-0.24,-1.92, Math.PI/2, 0, 0);

  // ── Spare tire on rear door (Thar's signature) ──
  // Tire
  add(new THREE.CylinderGeometry(0.43, 0.43, 0.26, 14), flat(0x111111), 0, 0.55,-1.95, 0, 0, Math.PI/2);
  // Rim
  add(new THREE.CylinderGeometry(0.24, 0.24, 0.28, 8),  LGRAY,          0, 0.55,-1.95, 0, 0, Math.PI/2);
  // Spare tire carrier frame
  add(new THREE.BoxGeometry(0.08, 1.10, 0.08), DGRAY,    0, 0.55,-1.88);
  add(new THREE.BoxGeometry(1.0,  0.08, 0.08), DGRAY,    0, 0.12,-1.88);
  add(new THREE.BoxGeometry(1.0,  0.08, 0.08), DGRAY,    0, 0.98,-1.88);

  // ── Antenna ──
  add(new THREE.CylinderGeometry(0.016, 0.016, 0.55, 4), flat(0x555555), -0.88, 1.33, -0.80);

  root.traverse(m => {
    const mm = m as THREE.Mesh;
    if (mm.isMesh) { mm.castShadow = true; mm.receiveShadow = true; }
  });
  return root;
}

// ─── Off-road Wheel (chunky, knobby) ─────────────────────────────────────────
function makeWheel(mirrorX = false) {
  const root = new THREE.Group();
  if (mirrorX) root.scale.x = -1;
  const add = (geo:THREE.BufferGeometry, mat:THREE.Material, x=0,y=0,z=0,rx=0,ry=0,rz=0) => {
    const m = new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.rotation.set(rx,ry,rz); m.castShadow=true; root.add(m);
  };

  // Chunky off-road tire — wider profile
  add(new THREE.CylinderGeometry(0.42, 0.42, 0.34, 14), flat(0x111111), 0,0,0, 0,0,Math.PI/2);
  // Tire shoulder (slightly wider ridge)
  add(new THREE.CylinderGeometry(0.43, 0.43, 0.06, 14), flat(0x1a1a1a), 0,0, 0.165, 0,0,Math.PI/2);
  add(new THREE.CylinderGeometry(0.43, 0.43, 0.06, 14), flat(0x1a1a1a), 0,0,-0.165, 0,0,Math.PI/2);

  // Tread knobs (radial pattern around tire)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const knob = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.10, 0.26),
      flat(0x222222)
    );
    knob.position.set(Math.sin(a)*0.41, Math.cos(a)*0.41, 0);
    knob.rotation.z = a;
    root.add(knob);
  }
  // Second row of knobs (offset)
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.31;
    const knob = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.08, 0.14),
      flat(0x1e1e1e)
    );
    knob.position.set(Math.sin(a)*0.41, Math.cos(a)*0.41, 0.10);
    knob.rotation.z = a;
    root.add(knob);
  }

  // Sidewall ring detail
  add(new THREE.TorusGeometry(0.38, 0.025, 6, 18), flat(0x2a2a2a), 0,0, 0.15);
  add(new THREE.TorusGeometry(0.38, 0.025, 6, 18), flat(0x2a2a2a), 0,0,-0.15);

  // 5-spoke SUV rim (silver)
  add(new THREE.CylinderGeometry(0.30, 0.30, 0.32, 12), phong(0xc0c0c0, { shininess:160 }), 0,0,0, 0,0,Math.PI/2);
  // Rim lip
  add(new THREE.TorusGeometry(0.295, 0.03, 6, 16), phong(0xd8d8d8, { shininess:200 }), 0,0, 0.15);
  // Rim recessed face
  add(new THREE.CylinderGeometry(0.26, 0.26, 0.22, 12), flat(0x888888), 0,0,0, 0,0,Math.PI/2);

  // 5 thick spokes
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.26, 0.08),
      phong(0xc8c8c8, { shininess:140 })
    );
    spoke.position.set(Math.sin(a)*0.13, Math.cos(a)*0.13, 0.08);
    spoke.rotation.z = a;
    root.add(spoke);
    // Spoke shadow/depth
    const sp2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.22, 0.06),
      flat(0x666666)
    );
    sp2.position.set(Math.sin(a)*0.14, Math.cos(a)*0.14, 0.06);
    sp2.rotation.z = a;
    root.add(sp2);
  }

  // Center hub cap
  add(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), phong(0xdddddd, { shininess:200 }), 0,0,0.12, 0,0,Math.PI/2);
  // Lug nut detail
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    add(new THREE.CylinderGeometry(0.018, 0.018, 0.06, 6), flat(0xaaaaaa),
      Math.sin(a)*0.09, Math.cos(a)*0.09, 0.14, 0,0,Math.PI/2);
  }

  // Brake disc (visible through spokes)
  add(new THREE.CylinderGeometry(0.21, 0.21, 0.05, 12), flat(0x555555), 0,0,-0.03, 0,0,Math.PI/2);
  // Red brake caliper
  add(new THREE.BoxGeometry(0.10, 0.16, 0.10), flat(0xdd2222), 0, 0.22,-0.04);

  return root;
}

// ─── Trees ────────────────────────────────────────────────────────────────────
function makeTree(x:number,z:number,scale=1.0,type=0) {
  const g=new THREE.Group();
  const trunkH=(0.6+Math.random()*0.5)*scale;
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.09*scale,0.14*scale,trunkH,7),flat(C.trunk));
  trunk.position.y=trunkH/2; trunk.castShadow=true; g.add(trunk);
  if(type===0){
    [[0.78,1.10,trunkH+0.10],[0.64,0.95,trunkH+0.75],[0.48,0.82,trunkH+1.35],[0.30,0.66,trunkH+1.85]].forEach(([r,h,y],i)=>{
      const c=new THREE.Mesh(new THREE.ConeGeometry(r*scale,h*scale,7),flat(i%2===0?C.leaf:C.leafMid));
      c.position.y=y*scale; c.castShadow=true; g.add(c);
    });
  } else {
    [[0,trunkH+0.55,0,0.72],[-0.26,trunkH+0.78,0.18,0.52],[0.28,trunkH+0.72,-0.16,0.55],[0.08,trunkH+1.05,0.08,0.45]].forEach(([bx,by,bz,br],i)=>{
      const b=new THREE.Mesh(new THREE.IcosahedronGeometry(br*scale,1),flat(i%2===0?C.leaf:C.leafDark));
      b.position.set(bx*scale,by*scale,bz*scale); b.scale.y=0.82; b.castShadow=true; g.add(b);
    });
  }
  g.position.set(x,0,z); g.rotation.y=Math.random()*Math.PI*2;
  return g;
}

function makeRocks(x:number,z:number,n=3) {
  const g=new THREE.Group();
  for(let i=0;i<n;i++){
    const geo=new THREE.DodecahedronGeometry(0.22+Math.random()*0.32,0);
    geo.rotateY(Math.random()*Math.PI); geo.rotateX(Math.random()*0.6);
    const m=new THREE.Mesh(geo,flat(i%2?C.rock:C.rockDark));
    m.scale.y=0.5+Math.random()*0.35;
    m.position.set((Math.random()-0.5)*1.4,m.scale.y*0.25,(Math.random()-0.5)*1.4);
    m.castShadow=true; g.add(m);
  }
  g.position.set(x,0.1,z); return g;
}

function makeHouse(x:number,z:number,ry=0) {
  const g=new THREE.Group();
  const walls=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.0,3.0),flat(0xf0d8b0));
  walls.position.y=1.0; walls.castShadow=true; walls.receiveShadow=true; g.add(walls);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(2.2,1.3,4),flat(0xb84820));
  roof.position.y=2.65; roof.rotation.y=Math.PI/4; roof.castShadow=true; g.add(roof);
  const ch=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.80,0.28),flat(0x886655));
  ch.position.set(-0.7,3.0,-0.5); g.add(ch);
  const door=new THREE.Mesh(new THREE.BoxGeometry(0.55,1.0,0.10),flat(0x6a3a18));
  door.position.set(0,0.5,1.51); g.add(door);
  for(const wx of[-0.72,0.72]){
    const win=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.44,0.10),flat(C.carGlass));
    win.position.set(wx,1.1,1.51); g.add(win);
    const b1=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.44,0.12),flat(0xf0d8b0)); b1.position.set(wx,1.1,1.51); g.add(b1);
    const b2=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.05,0.12),flat(0xf0d8b0)); b2.position.set(wx,1.1,1.51); g.add(b2);
  }
  g.position.set(x,0,z); g.rotation.y=ry; return g;
}

function makeLamp(x:number,z:number) {
  const g=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.15,0.25,8),flat(0x707070)); base.position.y=0.12; g.add(base);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.06,4.8,7),flat(0x888888)); pole.position.y=2.65; pole.castShadow=true; g.add(pole);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.90),flat(0x888888)); arm.position.set(0.45,5.1,0); g.add(arm);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.15,0.32),flat(0x666666)); head.position.set(0.45,4.98,0); g.add(head);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.10,8,6),new THREE.MeshPhongMaterial({color:0xffffcc,emissive:0xffff88,emissiveIntensity:1.5}));
  bulb.position.set(0.45,4.90,0); g.add(bulb);
  g.position.set(x,0,z); return g;
}

function makeSign(color:number) {
  const g=new THREE.Group();
  for(const px of[-1.0,1.0]){
    const p=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.065,3.0,6),flat(C.post));
    p.position.set(px,1.5,0); g.add(p);
  }
  const back=new THREE.Mesh(new THREE.BoxGeometry(2.80,1.05,0.09),flat(C.sign)); back.position.y=2.95; g.add(back);
  const board=new THREE.Mesh(new THREE.BoxGeometry(2.60,0.86,0.12),flat(color)); board.position.set(0,2.95,0.04); g.add(board);
  return g;
}

function makeFence(x1:number,z1:number,x2:number,z2:number,n=12) {
  const g=new THREE.Group();
  const dx=(x2-x1)/n, dz=(z2-z1)/n, ang=Math.atan2(dz,dx), sl=Math.sqrt((x2-x1)**2+(z2-z1)**2)/n;
  for(let i=0;i<n;i++){
    const mx=x1+dx*(i+0.5), mz=z1+dz*(i+0.5);
    const post=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.95,0.09),flat(C.fence)); post.position.set(x1+dx*i,0.47,z1+dz*i); g.add(post);
    for(const ry2 of[0.66,0.30]){
      const rail=new THREE.Mesh(new THREE.BoxGeometry(sl*0.98,0.065,0.065),flat(C.fence)); rail.position.set(mx,ry2,mz); rail.rotation.y=ang; g.add(rail);
    }
  }
  return g;
}

function makeCloud(x:number,y:number,z:number) {
  const g=new THREE.Group();
  const mat=flat(0xffffff,{transparent:true,opacity:0.88});
  [[0,0,0,1.2],[1.4,0.2,0,0.9],[-1.3,0.1,0,0.85],[0.6,0.8,0,0.75],[-0.5,0.7,0,0.70]].forEach(([bx,by,bz,br])=>{
    const b=new THREE.Mesh(new THREE.IcosahedronGeometry(br,1),mat); b.position.set(bx,by,bz); b.scale.y=0.62; g.add(b);
  });
  g.position.set(x,y,z); return g;
}

// ─── DevOps collectibles ──────────────────────────────────────────────────────
function makeK8sPod() {
  const g = new THREE.Group();
  // Hexagonal prism body
  const hex = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.38, 6),
    phong(C.k8sBlue, { emissive: 0x1a44aa, emissiveIntensity: 0.5, shininess: 120 })
  );
  hex.rotation.y = Math.PI / 6;
  g.add(hex);
  // Inner white wheel icon
  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.40, 6),
    phong(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.3, shininess: 60 })
  );
  inner.rotation.y = Math.PI / 6;
  g.add(inner);
  // Spokes (K8s wheel)
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.42, 0.04),
      flat(0x326ce5)
    );
    spoke.rotation.y = a;
    spoke.position.set(Math.sin(a) * 0.15, 0, Math.cos(a) * 0.15);
    g.add(spoke);
  }
  // Glow ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.045, 6, 16),
    phong(0x4a90f8, { emissive: 0x2060dd, emissiveIntensity: 0.8 })
  );
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  return g;
}

function makeTerraformModule() {
  const g = new THREE.Group();
  // Main cube
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.75, 0.75),
    phong(C.tfPurple, { emissive: 0x4a1880, emissiveIntensity: 0.45, shininess: 100 })
  );
  g.add(cube);
  // Top face accent
  const top = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.06, 0.62),
    phong(0x9b5de5, { emissive: 0x7a30cc, emissiveIntensity: 0.6 })
  );
  top.position.y = 0.40; g.add(top);
  // "TF" edge strips
  for (const [dx, dz] of [[-0.38, 0], [0.38, 0], [0, -0.38], [0, 0.38]] as [number, number][]) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.75, 0.06),
      phong(0xc084fc, { emissive: 0x9b5de5, emissiveIntensity: 0.5 })
    );
    strip.position.set(dx, 0, dz); g.add(strip);
  }
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.04, 6, 12),
    phong(0xd0a0ff, { emissive: 0x9b5de5, emissiveIntensity: 0.7 })
  );
  ring.rotation.x = Math.PI / 2; g.add(ring);
  return g;
}

// "Merge Conflict" barrier
function makeMergeConflict() {
  const g = new THREE.Group();
  // Main barrier (striped)
  for (let i = 0; i < 5; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.22, 0.22),
      flat(i % 2 === 0 ? 0xff2222 : 0x111111)
    );
    stripe.position.y = 0.22 * i + 0.11;
    g.add(stripe);
  }
  // Legs
  for (const lx of [-1.4, 1.4]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.6, 0.28), flat(0x555555));
    leg.position.set(lx, -0.30, 0); g.add(leg);
  }
  // Warning light
  const light = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 6),
    new THREE.MeshPhongMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 1.2 })
  );
  light.position.y = 1.3; g.add(light);
  return g;
}

// ─── Zones ────────────────────────────────────────────────────────────────────
type Zone = {
  id:string; color:number; pos:[number,number]; radius:number;
  content:{ emoji:string; title:string; role?:string; lines:string[] };
};
const ZONES: Zone[] = [
  { id:"home",       color:0x89dceb, pos:[0,0],      radius:9,
    content:{ emoji:"🏠", title:"Harsh Dixit", role:"Senior Cloud & DevOps Engineer",
      lines:["AWS SAA-C03 Certified","5+ yrs cloud-native infrastructure","Collect K8s Pods 🔵 and TF Modules 🟣"] }},
  { id:"about",      color:0x6acf6a, pos:[-34,-32],  radius:9,
    content:{ emoji:"👨‍💻", title:"About Me", role:"Currently @ Caylent",
      lines:["Architect of scalable cloud platforms","Terraform · AWS · Kubernetes","Love automating everything","Based in India · Open to remote"] }},
  { id:"experience", color:0xcba6f7, pos:[36,-26],   radius:9,
    content:{ emoji:"💼", title:"Experience", role:"5+ Years",
      lines:["Caylent — Sr. DevOps Engineer","Accenture — Cloud Consultant","Platform engineering at scale","CI/CD · GitOps · IaC · Observability"] }},
  { id:"skills",     color:0xf9e2af, pos:[-32,35],   radius:9,
    content:{ emoji:"⚡", title:"Tech Stack", role:"Cloud · DevOps · Automation",
      lines:["AWS · GCP · Azure","Terraform · Ansible · Helm","Docker · Kubernetes · ArgoCD","Python · Bash · TypeScript · Go"] }},
  { id:"contact",    color:0xf38ba8, pos:[32,38],    radius:9,
    content:{ emoji:"📬", title:"Say Hello", role:"Let's build something great",
      lines:["harsh.dixit@caylent.com","github.com/harsh785","linkedin.com/in/harshdixit"] }},
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Collectible = { mesh: THREE.Group; pos: [number, number, number]; collected: boolean; type: "pod" | "tf" };
type Barrier = { mesh: THREE.Group; pos: [number, number]; body: CANNON.Body };

// ─── Component ────────────────────────────────────────────────────────────────
export default function CyberCarGame() {
  const mountRef   = useRef<HTMLDivElement>(null);
  const keysRef    = useRef<Record<string,boolean>>({});
  const [kmh,      setKmh]      = useState(0);
  const [zone,     setZone]     = useState<Zone|null>(null);
  const [started,  setStarted]  = useState(false);
  const [gear,     setGear]     = useState("N");
  const [score,    setScore]    = useState(0);
  const [isDrift,  setIsDrift]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = useCallback((msg:string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

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

    // Sky
    const skyGeo = new THREE.SphereGeometry(150,16,8); skyGeo.scale(-1,1,1);
    scene.add(new THREE.Mesh(skyGeo, new THREE.ShaderMaterial({
      uniforms:{ top:{value:new THREE.Color(0x4a9ad4)}, bot:{value:new THREE.Color(0xb8e4f8)} },
      vertexShader:`varying float h; void main(){ h=normalize(position).y; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader:`uniform vec3 top,bot; varying float h; void main(){ gl_FragColor=vec4(mix(bot,top,max(h,0.)),1.); }`,
      side:THREE.BackSide, depthWrite:false,
    })));

    // Clouds
    [[-40,22,-10],[20,26,30],[-10,24,50],[55,20,-30],[0,28,-60],[-55,25,20]].forEach(([cx,cy,cz])=>scene.add(makeCloud(cx,cy,cz)));

    // Lights
    scene.add(new THREE.AmbientLight(0xaaccea, 0.55));
    scene.add(new THREE.HemisphereLight(0x88c8f0, 0x88aa44, 0.9));
    const sun=new THREE.DirectionalLight(0xfff6d0,2.4); sun.position.set(50,70,40);
    sun.castShadow=true; sun.shadow.mapSize.set(4096,4096);
    sun.shadow.camera.near=1; sun.shadow.camera.far=220;
    sun.shadow.camera.left=sun.shadow.camera.bottom=-100;
    sun.shadow.camera.right=sun.shadow.camera.top=100;
    sun.shadow.bias=-0.0008; scene.add(sun);
    const fill=new THREE.DirectionalLight(0xc8e8ff,0.4); fill.position.set(-30,20,-20); scene.add(fill);

    const camera = new THREE.PerspectiveCamera(52, el.clientWidth/el.clientHeight, 0.1, 260);
    camera.position.set(0,10,-22);

    // ── Physics ──
    const world = new CANNON.World();
    world.gravity.set(0,-22,0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = false;

    // Ground
    const groundGeo = new THREE.PlaneGeometry(260,260,64,64);
    const gPos = groundGeo.attributes.position;
    for(let i=0;i<gPos.count;i++){
      const gx=gPos.getX(i),gz=gPos.getZ(i),d=Math.sqrt(gx*gx+gz*gz);
      if(d>10) gPos.setY(i, Math.sin(gx*0.10)*0.5+Math.cos(gz*0.13)*0.4+Math.sin(gx*0.06+gz*0.07)*0.6+Math.cos(gx*0.18+gz*0.09)*0.25);
    }
    groundGeo.computeVertexNormals();
    const groundMesh=new THREE.Mesh(groundGeo,flat(C.ground)); groundMesh.rotation.x=-Math.PI/2; groundMesh.receiveShadow=true; scene.add(groundMesh);
    const gBody=new CANNON.Body({mass:0}); gBody.addShape(new CANNON.Plane()); gBody.quaternion.setFromEuler(-Math.PI/2,0,0); world.addBody(gBody);

    // Grass patches
    for(let i=0;i<40;i++){
      const patch=new THREE.Mesh(new THREE.CircleGeometry(2+Math.random()*4,7),flat(Math.random()>.5?C.groundAlt:C.hill));
      patch.rotation.x=-Math.PI/2; patch.position.set((Math.random()-.5)*180,0.02,(Math.random()-.5)*180); scene.add(patch);
    }

    // Roads
    const addRoad=(x:number,z:number,w:number,d:number,ry=0)=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.04,d),flat(C.road));
      m.position.set(x,0.02,z); m.rotation.y=ry; m.receiveShadow=true; scene.add(m);
      const cl=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.05,d*0.96),flat(0xfafafa));
      cl.position.set(x,0.05,z); cl.rotation.y=ry; scene.add(cl);
      for(const side of[-1,1]){
        const curb=new THREE.Mesh(new THREE.BoxGeometry(0.20,0.07,d),flat(0xcccccc));
        const off=new THREE.Vector3(side*(w/2+0.10),0.04,0).applyEuler(new THREE.Euler(0,ry,0));
        curb.position.set(x+off.x,0.04,z+off.z); curb.rotation.y=ry; scene.add(curb);
      }
    };
    addRoad(0,0,7,140); addRoad(0,0,140,7,Math.PI/2);
    addRoad(-17,-33,5,22,0.14); addRoad(18,-27,5,22,-0.12);
    addRoad(-16,34,5,22,0.12);  addRoad(16,37,5,22,-0.14);
    for(let ri=-68;ri<68;ri+=7) for(const sx of[-3.2,3.2]){
      const d=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.05,3),flat(C.roadLine)); d.position.set(sx,0.05,ri); scene.add(d);
    }

    // Zones
    for(const z of ZONES){
      const [zx,zz]=z.pos;
      const pad=new THREE.Mesh(new THREE.CylinderGeometry(z.radius,z.radius,0.07,28),new THREE.MeshLambertMaterial({color:z.color,flatShading:true,transparent:true,opacity:0.38}));
      pad.position.set(zx,0.04,zz); scene.add(pad);
      const ring=new THREE.Mesh(new THREE.TorusGeometry(z.radius,0.14,6,30),flat(z.color));
      ring.rotation.x=Math.PI/2; ring.position.set(zx,0.09,zz); scene.add(ring);
      const sign=makeSign(z.color); sign.position.set(zx,0,zz-z.radius+1.2); scene.add(sign);
    }

    // Trees
    const treeData:[number,number,number,number][]=[
      [-9,-9,.9,0],[-13,5,1.1,1],[-5,17,.85,0],[10,-12,1,1],[16,-5,.9,0],[12,14,1.1,1],
      [-7,-24,1,0],[-21,-12,1.2,1],[-25,7,.85,0],[-17,24,1,1],[24,-17,1.1,0],[27,-7,.9,1],
      [24,12,1,0],[20,25,1.15,1],[-28,28,.85,0],[-12,30,1,1],[12,29,.9,0],[30,7,1.1,1],
      [-33,13,1,0],[-10,38,.9,1],[10,40,1.1,0],[42,-14,1,1],[38,7,1.2,0],[-40,-14,1,1],
      [-38,5,.9,0],[2,-42,1.1,1],[2,42,.85,0],[43,24,1,1],[-43,24,.9,0],[17,-39,1.1,1],
      [-17,-39,1,0],[33,-39,.9,1],[-33,39,1.1,0],[44,-34,.85,1],[-44,-34,1,0],
      [7,-15,.85,1],[-7,-15,.9,0],[20,1,1,1],[-20,1,.9,0],[1,20,1.1,1],[1,-20,1,0],
    ];
    for(const [tx,tz,s,t] of treeData) scene.add(makeTree(tx,tz,s,t));
    [[-18,-18],[18,-20],[20,18],[-16,20],[24,-30],[30,24],[-26,30],[36,-22],[-36,-22]].forEach(([rx,rz])=>
      scene.add(makeRocks(rx,rz,2+Math.floor(Math.random()*3)))
    );

    // Houses, lamps
    [[-10,-34,.3],[8,-34,-.3],[-40,16,.8],[40,-16,-.8],[-40,-28,1.4],[44,10,-.5]].forEach(([x,z,r])=>scene.add(makeHouse(x,z,r)));
    for(let lz=-56;lz<=56;lz+=10){ scene.add(makeLamp(4.6,lz)); scene.add(makeLamp(-4.6,lz)); }

    // Hills
    for(const [hx,hz,hr,hh] of[[-34,-32,9,6],[36,-26,9,6],[-32,35,9,6],[32,38,9,6]] as [number,number,number,number][]){
      const hill=new THREE.Mesh(new THREE.ConeGeometry(hr,hh,9),flat(C.hill));
      hill.position.set(hx,hh/2-.4,hz); hill.castShadow=true; hill.receiveShadow=true; scene.add(hill);
      for(let a=0;a<6;a++) scene.add(makeTree(hx+Math.cos(a/6*Math.PI*2)*(hr-1.2),hz+Math.sin(a/6*Math.PI*2)*(hr-1.2),.75,a%2));
      const hb=new CANNON.Body({mass:0}); hb.addShape(new CANNON.Cylinder(0.1,hr,hh,9)); hb.position.set(hx,hh/2-.4,hz); world.addBody(hb);
    }

    // Ramp
    const ramp=new THREE.Mesh(new THREE.BoxGeometry(5.5,.3,9),flat(C.road));
    ramp.position.set(0,.90,-22); ramp.rotation.x=-.17; ramp.castShadow=true; ramp.receiveShadow=true; scene.add(ramp);
    const rampB=new CANNON.Body({mass:0}); rampB.addShape(new CANNON.Box(new CANNON.Vec3(2.75,.15,4.5)));
    rampB.position.set(0,.90,-22); rampB.quaternion.setFromEuler(-.17,0,0); world.addBody(rampB);

    // Pond
    const pond=new THREE.Mesh(new THREE.CircleGeometry(6,18),flat(C.water)); pond.rotation.x=-Math.PI/2; pond.position.set(18,.07,18); scene.add(pond);
    const pr=new THREE.Mesh(new THREE.TorusGeometry(6,.22,6,20),flat(C.waterEdge)); pr.rotation.x=Math.PI/2; pr.position.set(18,.09,18); scene.add(pr);
    const shore=new THREE.Mesh(new THREE.CircleGeometry(7.5,18),flat(C.sand)); shore.rotation.x=-Math.PI/2; shore.position.set(18,.03,18); scene.add(shore);

    // Fences
    scene.add(makeFence(-70,-70,70,-70)); scene.add(makeFence(70,-70,70,70));
    scene.add(makeFence(70,70,-70,70));  scene.add(makeFence(-70,70,-70,-70));

    // ── DevOps Collectibles ──────────────────────────────────────────────────
    const collectibleDefs:[number,number,number,"pod"|"tf"][] = [
      // K8s Pods (blue)
      [ 12, 0.9, -8,"pod"],[-12,0.9, -8,"pod"],[ 0, 0.9,-35,"pod"],[ 18,0.9,  0,"pod"],
      [-18, 0.9,  0,"pod"],[ 8, 0.9, 25,"pod"],[-8, 0.9, 25,"pod"],[ 0, 0.9, 40,"pod"],
      [ 28, 0.9,-10,"pod"],[-28,0.9,-10,"pod"],[ 0, 0.9,-15,"pod"],[ 20,0.9, 20,"pod"],
      // Terraform Modules (purple)
      [ 15, 0.9, 15,"tf"], [-15,0.9, 15,"tf"], [ 0, 0.9,-48,"tf"],
      [ 40, 0.9,  0,"tf"], [-40,0.9,  0,"tf"], [ 0, 0.9, 52,"tf"],
    ];

    const collectibles: Collectible[] = collectibleDefs.map(([cx,cy,cz,type]) => {
      const mesh = type==="pod" ? makeK8sPod() : makeTerraformModule();
      mesh.position.set(cx,cy,cz);
      scene.add(mesh);
      return { mesh, pos:[cx,cy,cz], collected:false, type };
    });

    // ── Merge Conflict Barriers ──────────────────────────────────────────────
    const barrierDefs: [number,number,number][] = [
      [ 0, 0.55,-30, ], [14, 0.55, 14], [-14,0.55, 14],
      [18, 0.55,-12], [-18,0.55,-12],
    ];
    const barriers: Barrier[] = barrierDefs.map(([bx,by,bz]) => {
      const mesh = makeMergeConflict(); mesh.position.set(bx,by,bz); scene.add(mesh);
      const body = new CANNON.Body({mass:0});
      body.addShape(new CANNON.Box(new CANNON.Vec3(1.6,.55,.15)));
      body.position.set(bx,by,bz); world.addBody(body);
      return { mesh, pos:[bx,bz], body };
    });

    // ── Car ──────────────────────────────────────────────────────────────────
    // Thar: heavier, taller chassis, wider track
    const chassisBody=new CANNON.Body({mass:200});
    chassisBody.addShape(new CANNON.Box(new CANNON.Vec3(0.95,.28,1.80)));
    chassisBody.position.set(0,2.4,-12);
    chassisBody.allowSleep=false; chassisBody.linearDamping=0.06; chassisBody.angularDamping=0.42;
    world.addBody(chassisBody);

    const vehicle=new CANNON.RaycastVehicle({chassisBody,indexRightAxis:0,indexUpAxis:1,indexForwardAxis:2});
    const wBase={
      radius:.42,  // bigger off-road tires
      directionLocal:new CANNON.Vec3(0,-1,0),
      suspensionStiffness:38, suspensionRestLength:.36,  // softer = more travel
      frictionSlip:1.80, dampingRelaxation:2.2, dampingCompression:4.2,
      maxSuspensionForce:120000, rollInfluence:.008,
      axleLocal:new CANNON.Vec3(1,0,0), chassisConnectionPointLocal:new CANNON.Vec3(0,0,0),
      maxSuspensionTravel:.35, useCustomSlidingRotationalSpeed:true, customSlidingRotationalSpeed:-30,
    };
    // Wider track, wheels connect lower on chassis
    [[-0.98,-.05,1.40],[.98,-.05,1.40],[-0.98,-.05,-1.40],[.98,-.05,-1.40]].forEach(([x,y,z2])=>
      vehicle.addWheel({...wBase,chassisConnectionPointLocal:new CANNON.Vec3(x,y,z2)})
    );
    vehicle.addToWorld(world);

    const carMesh=makeCarMesh(); scene.add(carMesh);
    const wheelMeshes=[false,true,false,true].map(mir=>{ const w=makeWheel(mir); scene.add(w); return w; });

    // Input
    const onKeyDown=(e:KeyboardEvent)=>{ keysRef.current[e.key]=true; setStarted(true); e.preventDefault(); };
    const onKeyUp  =(e:KeyboardEvent)=>{ keysRef.current[e.key]=false; };
    window.addEventListener("keydown",onKeyDown); window.addEventListener("keyup",onKeyUp);
    const onResize=()=>{ camera.aspect=el.clientWidth/el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth,el.clientHeight); };
    window.addEventListener("resize",onResize);

    // ── Loop ──────────────────────────────────────────────────────────────────
    const FIXED=1/60, MAX_F=1500, MAX_S=0.46, BRAKE=28;
    const NORMAL_FRICTION=1.65, DRIFT_FRICTION=0.22;
    const camPos=new THREE.Vector3(0,10,-22);
    let lastTime=-1, frameId=0, localScore=0;
    let animT = 0;

    setLoading(false);

    const loop=(t:number)=>{
      frameId=requestAnimationFrame(loop);
      if(lastTime<0){lastTime=t;return;}
      const dt=Math.min((t-lastTime)/1000,.05); lastTime=t; animT+=dt;

      const k=keysRef.current;
      const fwd  =!!(k["w"]||k["W"]||k["ArrowUp"]);
      const back =!!(k["s"]||k["S"]||k["ArrowDown"]);
      const left =!!(k["a"]||k["A"]||k["ArrowLeft"]);
      const right=!!(k["d"]||k["D"]||k["ArrowRight"]);
      const brake=!!(k[" "]||k["Shift"]);

      const vel=chassisBody.velocity;
      const spd=Math.sqrt(vel.x**2+vel.z**2);

      // ── Drift: spacebar + moving + steering ──
      const drifting = brake && spd > 4;
      setIsDrift(drifting);

      // Set rear wheel friction
      const rearFriction = drifting ? DRIFT_FRICTION : NORMAL_FRICTION;
      if(vehicle.wheelInfos[2]) vehicle.wheelInfos[2].frictionSlip = rearFriction;
      if(vehicle.wheelInfos[3]) vehicle.wheelInfos[3].frictionSlip = rearFriction;

      const engineF = fwd ? MAX_F : back ? -MAX_F*0.55 : 0;
      const steerAmt = MAX_S * Math.max(0.25, 1.0 - spd*0.028) * (drifting ? 1.35 : 1.0);
      const steer = left ? steerAmt : right ? -steerAmt : 0;
      const rollR = (!fwd && !back && !drifting) ? 6 : 0;

      vehicle.applyEngineForce(engineF, 2);
      vehicle.applyEngineForce(engineF, 3);
      vehicle.setSteeringValue(steer, 0);
      vehicle.setSteeringValue(steer, 1);
      for(let i=0;i<4;i++) vehicle.setBrake(drifting ? 0 : (brake?BRAKE:rollR), i);

      world.step(FIXED, dt, 3);

      // Sync car
      const cp=chassisBody.position, cq=chassisBody.quaternion;
      carMesh.position.set(cp.x,cp.y,cp.z);
      carMesh.quaternion.set(cq.x,cq.y,cq.z,cq.w);
      vehicle.wheelInfos.forEach((wi,i)=>{
        vehicle.updateWheelTransform(i);
        const wt=wi.worldTransform;
        wheelMeshes[i].position.set(wt.position.x,wt.position.y,wt.position.z);
        wheelMeshes[i].quaternion.set(wt.quaternion.x,wt.quaternion.y,wt.quaternion.z,wt.quaternion.w);
      });

      // Animate collectibles (bob + spin)
      collectibles.forEach((col,i)=>{
        if(col.collected) return;
        col.mesh.position.y = col.pos[1] + Math.sin(animT*2.5 + i*0.8)*0.22 + 0.15;
        col.mesh.rotation.y += dt * 1.4;
      });

      // Check collectible proximity
      for(const col of collectibles){
        if(col.collected) continue;
        const dx=cp.x-col.pos[0], dz=cp.z-col.pos[2];
        if(Math.sqrt(dx*dx+dz*dz)<2.0){
          col.collected=true;
          scene.remove(col.mesh);
          const pts=col.type==="pod"?10:25;
          localScore+=pts;
          setScore(localScore);
          showToast(col.type==="pod"
            ? `☸ K8s Pod Collected! +${pts} pts`
            : `🟣 Terraform Module Applied! +${pts} pts`
          );
        }
      }

      // Camera
      const carQuat=new THREE.Quaternion(cq.x,cq.y,cq.z,cq.w);
      const forward=new THREE.Vector3(0,0,1).applyQuaternion(carQuat);
      const pullback=13+spd*0.28;
      camPos.lerp(new THREE.Vector3(cp.x-forward.x*pullback,cp.y+7.5,cp.z-forward.z*pullback),0.065);
      camera.position.copy(camPos);
      camera.lookAt(cp.x+forward.x*2, cp.y+0.9, cp.z+forward.z*2);

      // FOV speed boost
      const targetFov = 52 + Math.min(spd*0.55, 22);
      camera.fov += (targetFov - camera.fov) * 0.06;
      camera.updateProjectionMatrix();

      // HUD
      setKmh(Math.round(spd*3.6));
      setGear(fwd?"D":back?"R":spd>2?"D":"N");

      // Zone
      let nearest:Zone|null=null;
      for(const z of ZONES){
        const dx=cp.x-z.pos[0],dz=cp.z-z.pos[1];
        if(Math.sqrt(dx*dx+dz*dz)<z.radius){nearest=z;break;}
      }
      setZone(nearest);

      renderer.render(scene,camera);
    };
    frameId=requestAnimationFrame(loop);

    return ()=>{
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown",onKeyDown);
      window.removeEventListener("keyup",onKeyUp);
      window.removeEventListener("resize",onResize);
      renderer.dispose();
      if(el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[showToast]);

  const press   =(k:string)=>{ keysRef.current[k]=true;  setStarted(true); };
  const release =(k:string)=>{ keysRef.current[k]=false; };
  const zHex = zone ? `#${zone.color.toString(16).padStart(6,"0")}` : "#fff";

  return (
    <div style={{width:"100vw",height:"100vh",position:"relative",overflow:"hidden",background:"#87c8e8"}}>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position:"absolute",inset:0,zIndex:100,
          background:"#1a1a2e",display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          fontFamily:"system-ui,sans-serif",color:"#fff",
        }}>
          <div style={{fontSize:48,marginBottom:16}}>🚗</div>
          <div style={{fontSize:18,fontWeight:700,marginBottom:10}}>Loading World...</div>
          <div style={{width:220,height:4,background:"rgba(255,255,255,0.12)",borderRadius:4,overflow:"hidden"}}>
            <div style={{width:"75%",height:"100%",background:"#ff2d2d",borderRadius:4,animation:"loadbar 1.2s ease infinite"}} />
          </div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:12}}>Provisioning terrain infrastructure...</div>
          <style>{`@keyframes loadbar{ 0%{width:15%} 50%{width:85%} 100%{width:15%} }`}</style>
        </div>
      )}

      <div ref={mountRef} style={{width:"100%",height:"100%"}} />

      {/* Back */}
      <Link href="/" style={{
        position:"absolute",top:16,left:16,
        background:"rgba(255,255,255,0.92)",color:"#111",
        padding:"8px 18px",borderRadius:28,fontFamily:"system-ui,sans-serif",
        fontSize:13,fontWeight:700,textDecoration:"none",
        boxShadow:"0 2px 20px rgba(0,0,0,0.18)",backdropFilter:"blur(10px)",
        display:"flex",alignItems:"center",gap:7,
      }}>← Portfolio</Link>

      {/* Build info */}
      <div style={{
        position:"absolute",top:16,left:"50%",transform:"translateX(-50%)",
        background:"rgba(0,0,0,0.50)",color:"rgba(255,255,255,0.55)",
        padding:"4px 14px",borderRadius:20,fontFamily:"monospace",fontSize:11,
        backdropFilter:"blur(8px)",letterSpacing:"0.05em",
        border:"1px solid rgba(255,255,255,0.10)",
      }}>{BUILD}</div>

      {/* Speedometer + score */}
      <div style={{
        position:"absolute",bottom:24,left:24,
        background:"rgba(14,14,22,0.88)",borderRadius:22,
        padding:"14px 24px",fontFamily:"system-ui,sans-serif",
        boxShadow:"0 4px 36px rgba(0,0,0,0.4)",backdropFilter:"blur(14px)",
        border:"1px solid rgba(255,255,255,0.10)",minWidth:160,
      }}>
        <div style={{fontSize:44,fontWeight:900,color:"#fff",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>
          {kmh}<span style={{fontSize:14,fontWeight:500,color:"rgba(255,255,255,0.4)",marginLeft:5}}>km/h</span>
        </div>
        {/* Gear */}
        <div style={{display:"flex",gap:8,marginTop:10}}>
          {["P","R","N","D"].map(g2=>(
            <span key={g2} style={{
              fontSize:12,fontWeight:800,letterSpacing:"0.04em",
              color:gear===g2?"#fff":"rgba(255,255,255,0.22)",
              background:gear===g2?"#ff2d2d":"rgba(255,255,255,0.06)",
              padding:"3px 8px",borderRadius:6,transition:"all 0.15s",
            }}>{g2}</span>
          ))}
        </div>
        {/* Drift indicator */}
        <div style={{
          marginTop:10,fontSize:11,fontWeight:800,letterSpacing:"0.08em",
          color: isDrift ? "#f9e2af" : "rgba(255,255,255,0.22)",
          background: isDrift ? "rgba(249,226,175,0.15)" : "transparent",
          padding:"2px 8px",borderRadius:5,transition:"all 0.12s",textAlign:"center",
        }}>
          {isDrift ? "⚡ DRIFT" : "DRIFT: SPACE"}
        </div>
        {/* Score */}
        <div style={{marginTop:10,borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:10}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",letterSpacing:"0.06em",marginBottom:3}}>DEVOPS SCORE</div>
          <div style={{fontSize:22,fontWeight:900,color:"#a6e3a1",fontVariantNumeric:"tabular-nums"}}>{score}</div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:3}}>
            ☸ Pod +10 &nbsp;·&nbsp; 🟣 TF +25
          </div>
        </div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.22)",marginTop:8,letterSpacing:"0.05em"}}>WASD · ARROWS · SPACE drift</div>
      </div>

      {/* Zone panel */}
      {zone && (
        <div key={zone.id} style={{
          position:"absolute",top:16,right:16,width:304,
          background:"rgba(255,255,255,0.97)",borderRadius:22,
          padding:"22px 26px",fontFamily:"system-ui,sans-serif",
          boxShadow:"0 10px 50px rgba(0,0,0,0.22)",backdropFilter:"blur(14px)",
          borderLeft:`5px solid ${zHex}`,
          animation:"slideIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{fontSize:34,marginBottom:10}}>{zone.content.emoji}</div>
          <div style={{fontSize:20,fontWeight:900,color:"#111",marginBottom:3}}>{zone.content.title}</div>
          {zone.content.role&&<div style={{fontSize:12,fontWeight:700,color:zHex,marginBottom:14,letterSpacing:"0.05em",textTransform:"uppercase"}}>{zone.content.role}</div>}
          <div style={{width:36,height:3,background:zHex,borderRadius:3,marginBottom:14}}/>
          {zone.content.lines.map((l,i)=>(
            <div key={i} style={{fontSize:13.5,color:"#444",marginBottom:8,lineHeight:1.5,display:"flex",gap:10,alignItems:"center"}}>
              <span style={{color:zHex,fontSize:9,flexShrink:0}}>◆</span>{l}
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          background:"rgba(14,14,22,0.94)",color:"#fff",
          padding:"14px 28px",borderRadius:16,fontFamily:"system-ui,sans-serif",
          fontSize:15,fontWeight:700,boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
          backdropFilter:"blur(14px)",letterSpacing:"0.02em",
          border:"1px solid rgba(255,255,255,0.12)",
          animation:"toastPop 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents:"none",
        }}>{toast}</div>
      )}

      {/* Hint */}
      {!started && (
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          background:"rgba(255,255,255,0.96)",borderRadius:28,
          padding:"32px 52px",textAlign:"center",
          fontFamily:"system-ui,sans-serif",
          boxShadow:"0 16px 60px rgba(0,0,0,0.28)",backdropFilter:"blur(16px)",pointerEvents:"none",
        }}>
          <div style={{fontSize:52,marginBottom:12}}>🚗</div>
          <div style={{fontSize:24,fontWeight:900,color:"#111",marginBottom:8}}>Harsh's World</div>
          <div style={{fontSize:14,color:"#555",lineHeight:1.9}}>
            Drive around to explore my portfolio<br/>
            <strong>WASD</strong> or <strong>↑↓←→</strong> to drive &nbsp;·&nbsp; <strong>Space</strong> to drift<br/>
            Collect <span style={{color:C.k8sBlue.toString()}}><strong>☸ K8s Pods</strong></span> &amp; <span style={{color:"#7b42bc"}}><strong>🟣 TF Modules</strong></span><br/>
            Watch out for <span style={{color:"#ff2d2d"}}><strong>⚠ Merge Conflicts</strong></span>
          </div>
        </div>
      )}

      {/* Mobile D-pad */}
      <div style={{
        position:"absolute",bottom:20,right:20,
        display:"grid",gridTemplateColumns:"56px 56px 56px",gridTemplateRows:"56px 56px 56px",gap:5,
      }}>
        {[{k:"ArrowUp",l:"▲",c:2,r:1},{k:"ArrowLeft",l:"◄",c:1,r:2},{k:" ",l:"⚡",c:2,r:2},{k:"ArrowRight",l:"►",c:3,r:2},{k:"ArrowDown",l:"▼",c:2,r:3}].map(b=>(
          <button key={b.k}
            onPointerDown={()=>press(b.k)} onPointerUp={()=>release(b.k)} onPointerLeave={()=>release(b.k)}
            style={{
              gridColumn:b.c,gridRow:b.r,
              background: b.k===" " && isDrift ? "rgba(249,226,175,0.9)" : "rgba(255,255,255,0.90)",
              border:"1.5px solid rgba(0,0,0,0.08)",borderRadius:14,fontSize:18,cursor:"pointer",
              boxShadow:"0 3px 14px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",
              touchAction:"none",userSelect:"none",color:b.k===" "?"#cc8800":"#222",
              transition:"background 0.12s",
            }}
          >{b.l}</button>
        ))}
      </div>

      <style>{`
        @keyframes slideIn { from{opacity:0;transform:translateX(28px) scale(0.94)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes toastPop { from{opacity:0;transform:translate(-50%,-45%) scale(0.88)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      `}</style>
    </div>
  );
}
