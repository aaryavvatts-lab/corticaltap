"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { Electrode } from "@/lib/data";

export type ColorMode = "resp" | "attr" | "subject";

const SUB_COLORS = [
  "#B4530A", "#33637D", "#2F6A4A", "#8A5A2B",
  "#5B4B8A", "#A32C2C", "#3E7C8C", "#7A6A20",
];

/** Warm to cool ramp. Avoids a rainbow, which misleads on ordered data. */
function ramp(t: number) {
  const c = Math.max(0, Math.min(1, t));
  const lo = new THREE.Color("#2C3E4C");
  const mid = new THREE.Color("#C9C4B4");
  const hi = new THREE.Color("#C4560A");
  return c < 0.5
    ? lo.clone().lerp(mid, c * 2)
    : mid.clone().lerp(hi, (c - 0.5) * 2);
}

export default function BrainCanvas({
  electrodes, mode, selected, onSelect, showGlass,
}: {
  electrodes: Electrode[];
  mode: ColorMode;
  selected: number | null;
  onSelect: (i: number | null) => void;
  showGlass: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<any>({});

  // Build the scene once.
  useEffect(() => {
    const el = host.current!;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2000);
    camera.position.set(-300, 14, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "Rotatable three dimensional map of electrode positions on the left side of the brain."
    );

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const key = new THREE.DirectionalLight(0xffffff, 0.75);
    key.position.set(-1, 1, 1);
    scene.add(key);

    // A rough left hemisphere shell, only to give the dots somewhere to sit.
    const glass = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 32),
      new THREE.MeshStandardMaterial({
        color: 0x9aa3a8, transparent: true, opacity: 0.1,
        roughness: 1, metalness: 0, side: THREE.DoubleSide, depthWrite: false,
      })
    );
    // Sized to a whole head so the left side contacts sit on its outer surface.
    glass.scale.set(72, 74, 94);
    glass.position.set(0, 12, 16);
    scene.add(glass);

    const group = new THREE.Group();
    scene.add(group);

    // Instanced spheres: one draw call for all 735 contacts.
    const geo = new THREE.SphereGeometry(1, 12, 10);
    const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 });
    const mesh = new THREE.InstancedMesh(geo, mat, 1);
    group.add(mesh);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(5.2, 6.6, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    ring.visible = false;
    scene.add(ring);

    // Simple orbit control, written here so the page ships no extra library.
    // Start looking at the left side of the head, which is the side that was
    // recorded in every patient.
    let az = Math.PI, pol = Math.PI / 2, dist = 285;
    let drag = false, lx = 0, ly = 0, moved = 0;
    const target = new THREE.Vector3(-30, 14, 16);
    function place() {
      camera.position.set(
        target.x + dist * Math.sin(pol) * Math.cos(az),
        target.y + dist * Math.cos(pol),
        target.z + dist * Math.sin(pol) * Math.sin(az)
      );
      camera.lookAt(target);
    }
    const down = (e: PointerEvent) => {
      drag = true; moved = 0; lx = e.clientX; ly = e.clientY;
      (e.target as Element).setPointerCapture?.(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      az -= dx * 0.006;
      pol = Math.max(0.12, Math.min(Math.PI - 0.12, pol - dy * 0.006));
      lx = e.clientX; ly = e.clientY; place();
    };
    const up = (e: PointerEvent) => {
      if (drag && moved < 5) pick(e);
      drag = false;
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      dist = Math.max(120, Math.min(620, dist * (1 + Math.sign(e.deltaY) * 0.09)));
      place();
    };

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    function pick(e: PointerEvent) {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObject(state.current.mesh, false)[0];
      state.current.onSelect(hit && hit.instanceId != null ? hit.instanceId : null);
    }

    const cv = renderer.domElement;
    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", () => (drag = false));
    cv.addEventListener("wheel", wheel, { passive: false });

    function resize() {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize(); place();

    let spin = true;
    let raf = 0;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (spin && !drag && !reduce) { az += 0.0013; place(); }
      renderer.render(scene, camera);
    };
    tick();
    const stopSpin = () => { spin = false; };
    cv.addEventListener("pointerdown", stopSpin, { once: true });
    cv.addEventListener("wheel", stopSpin, { once: true });

    state.current = { scene, camera, renderer, mesh, ring, glass, place, onSelect };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("wheel", wheel);
      renderer.dispose(); geo.dispose(); mat.dispose();
      el.removeChild(cv);
    };
  }, []);

  useEffect(() => { state.current.onSelect = onSelect; }, [onSelect]);
  useEffect(() => {
    if (state.current.glass) state.current.glass.visible = showGlass;
  }, [showGlass]);

  // Rebuild instances whenever the electrode list or colour rule changes.
  useEffect(() => {
    const s = state.current;
    if (!s.mesh) return;
    const pts = electrodes.filter((e) => e.x != null);
    const old = s.mesh;
    const mesh = new THREE.InstancedMesh(old.geometry, old.material, Math.max(1, pts.length));
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const m = new THREE.Matrix4();
    const respMax = Math.max(...pts.map((p) => Math.abs(p.resp)), 1e-6);
    pts.forEach((p, i) => {
      const r = mode === "subject" ? 3.0 : 2.4 + 3.4 * Math.min(1, Math.abs(p.resp) / respMax);
      m.makeScale(r, r, r);
      m.setPosition(p.x!, p.z!, -p.y!);   // screen up is z, depth is y
      mesh.setMatrixAt(i, m);
      let col: THREE.Color;
      if (mode === "subject") {
        col = new THREE.Color(SUB_COLORS[Number(p.sub.slice(-2)) - 1] ?? "#888");
      } else if (mode === "attr") {
        col = ramp(p.attr);
      } else {
        col = ramp(0.5 + (0.5 * p.resp) / respMax);
      }
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    old.parent?.add(mesh);
    old.parent?.remove(old);
    s.mesh = mesh;
    s.points = pts;
  }, [electrodes, mode]);

  // Move the highlight ring onto the chosen contact.
  useEffect(() => {
    const s = state.current;
    if (!s.ring || !s.points) return;
    if (selected == null || !s.points[selected]) { s.ring.visible = false; return; }
    const p = s.points[selected];
    s.ring.position.set(p.x, p.z, -p.y);
    s.ring.visible = true;
    s.ring.material.color.set(getComputedStyle(document.body).color);
    const face = () => s.ring.lookAt(s.camera.position);
    face();
    s.ring.onBeforeRender = face;
  }, [selected]);

  return <div ref={host} style={{ position: "absolute", inset: 0 }} />;
}
