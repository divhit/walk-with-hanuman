import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, GradientTexture } from "@react-three/drei";
import * as THREE from "three";

/* Walkable prototype of the Panchavati forest — the same shadow-puppet art,
   rasterized onto billboards inside a dusk-lit 3D diorama. */

const INK = "#150a28";

function svgTexture(svg) {
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const tex = new THREE.TextureLoader().load(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const TREE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="640" viewBox="-130 -300 260 320">
<path d="M-8 0 C -6 -60 -12 -110 -4 -160 L 6 -160 C 10 -110 8 -60 10 0 Z" fill="${INK}"/>
<ellipse cx="0" cy="-185" rx="95" ry="30" fill="${INK}"/>
<ellipse cx="4" cy="-225" rx="70" ry="25" fill="${INK}"/>
<ellipse cx="-2" cy="-258" rx="42" ry="19" fill="${INK}"/></svg>`;

const PALM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-160 -270 320 280">
<path d="M-5 0 C -2 -70 6 -130 22 -190 L 30 -186 C 16 -128 10 -70 7 0 Z" fill="${INK}"/>
<path d="M26 -188 q 26 -66 40 -100" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/>
<path d="M26 -188 q 60 -46 90 -60" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/>
<path d="M26 -188 q 78 -12 118 -8" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/>
<path d="M26 -188 q -60 -46 -90 -60" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/>
<path d="M26 -188 q -78 -12 -118 -2" stroke="${INK}" stroke-width="9" stroke-linecap="round" fill="none"/></svg>`;

const COTTAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-130 -210 260 225">
<rect x="-95" y="-8" width="190" height="14" rx="6" fill="${INK}"/>
<rect x="-72" y="-92" width="144" height="86" fill="${INK}"/>
<path d="M-118 -88 L 0 -170 L 118 -88 Q 60 -102 0 -100 Q -60 -102 -118 -88 Z" fill="${INK}"/>
<path d="M-96 -136 L 0 -196 L 96 -136 Q 0 -156 -96 -136 Z" fill="${INK}"/>
<rect x="-20" y="-64" width="40" height="58" rx="18" fill="#ffd479" opacity="0.95"/>
<circle cx="0" cy="-30" r="4" fill="#ff9a3c"/></svg>`;

const DEER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="-110 -240 240 245">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#ffd479"/><stop offset="100%" stop-color="#d98e2b"/></linearGradient></defs>
<line x1="-52" y1="-64" x2="-56" y2="0" stroke="#c9852a" stroke-width="8" stroke-linecap="round"/>
<line x1="-28" y1="-66" x2="-26" y2="-2" stroke="#c9852a" stroke-width="8" stroke-linecap="round"/>
<line x1="40" y1="-66" x2="42" y2="-2" stroke="#c9852a" stroke-width="8" stroke-linecap="round"/>
<line x1="56" y1="-68" x2="60" y2="-4" stroke="#c9852a" stroke-width="8" stroke-linecap="round"/>
<ellipse cx="0" cy="-88" rx="72" ry="34" fill="url(#g)"/>
<path d="M46 -100 Q 66 -128 76 -152" stroke="#e8a94a" stroke-width="17" fill="none" stroke-linecap="round"/>
<ellipse cx="83" cy="-158" rx="17" ry="10.5" fill="#ffd479" transform="rotate(-24 83 -158)"/>
<path d="M96 -164 l 15 -2 l -12 8 Z" fill="#ffd479"/>
<path d="M84 -170 C 78 -196 66 -206 56 -212 M84 -170 C 92 -198 106 -206 118 -210" stroke="#f2c14e" stroke-width="4.5" fill="none" stroke-linecap="round"/>
<circle cx="88" cy="-161" r="2.8" fill="${INK}"/>
<path d="M-26 -92 l 3 -6 l 3 6 l 6 3 l -6 3 l -3 6 l -3 -6 l -6 -3 Z" fill="#fff3dc"/>
<path d="M18 -78 l 3 -6 l 3 6 l 6 3 l -6 3 l -3 6 l -3 -6 l -6 -3 Z" fill="#fff3dc"/></svg>`;

const glowDot = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

/* deterministic pseudo-random from index */
function rnd(i, salt) {
  const v = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

function Trees({ treeTex, palmTex }) {
  const items = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 46; i++) {
      const a = rnd(i, 1) * Math.PI * 2;
      const r = 10 + rnd(i, 2) * 55;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r - 10;
      if (Math.abs(x) < 4 && z < 0 && z > -40) continue; // keep the path clear
      const h = 5 + rnd(i, 3) * 6;
      arr.push({ x, z, h, palm: rnd(i, 4) > 0.75 });
    }
    return arr;
  }, []);
  return items.map((t, i) => (
    <Billboard key={i} position={[t.x, t.h / 2 - 0.05, t.z]}>
      <mesh>
        <planeGeometry args={[t.h * (t.palm ? 1.1 : 0.85), t.h]} />
        <meshBasicMaterial
          map={t.palm ? palmTex : treeTex}
          transparent
          alphaTest={0.1}
        />
      </mesh>
    </Billboard>
  ));
}

function Fireflies() {
  const ref = useRef();
  const base = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 60; i++) {
      arr.push([
        (rnd(i, 7) - 0.5) * 70,
        0.6 + rnd(i, 8) * 2.4,
        (rnd(i, 9) - 0.7) * 60,
      ]);
    }
    return arr;
  }, []);
  const positions = useMemo(() => new Float32Array(base.flat()), [base]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = ref.current.geometry.attributes.position;
    for (let i = 0; i < base.length; i++) {
      p.array[i * 3] = base[i][0] + Math.sin(t * 0.5 + i) * 0.8;
      p.array[i * 3 + 1] = base[i][1] + Math.sin(t * 0.8 + i * 2.1) * 0.4;
      p.array[i * 3 + 2] = base[i][2] + Math.cos(t * 0.4 + i * 1.3) * 0.8;
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffd479"
        size={0.12}
        sizeAttenuation
        transparent
        opacity={0.9}
        map={glowDot}
        alphaTest={0.05}
        depthWrite={false}
      />
    </points>
  );
}

function Deer({ tex }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    ref.current.position.y = 1.25 + Math.sin(clock.elapsedTime * 1.4) * 0.05;
  });
  return (
    <group ref={ref} position={[7, 1.25, -22]}>
      <Billboard>
        <mesh>
          <planeGeometry args={[2.6, 2.6]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.1} />
        </mesh>
      </Billboard>
      <pointLight color="#ffd479" intensity={4} distance={9} />
    </group>
  );
}

function Walker({ walking }) {
  const { camera, gl } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const keys = useRef({});
  useEffect(() => {
    camera.position.set(0, 1.6, 14);
    const down = (e) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    const el = gl.domElement;
    let dragging = false;
    let last = null;
    const pd = (e) => {
      dragging = true;
      last = [e.clientX, e.clientY];
    };
    const pm = (e) => {
      if (!dragging) return;
      yaw.current -= (e.clientX - last[0]) * 0.004;
      pitch.current = Math.max(
        -0.5,
        Math.min(0.45, pitch.current - (e.clientY - last[1]) * 0.003),
      );
      last = [e.clientX, e.clientY];
    };
    const pu = () => (dragging = false);
    el.addEventListener("pointerdown", pd);
    window.addEventListener("pointermove", pm);
    window.addEventListener("pointerup", pu);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      el.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointermove", pm);
      window.removeEventListener("pointerup", pu);
    };
  }, [camera, gl]);
  useFrame((_, dt) => {
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
    const k = keys.current;
    const fwd =
      k["w"] || k["arrowup"] || walking.current
        ? 1
        : k["s"] || k["arrowdown"]
          ? -1
          : 0;
    const strafe =
      k["d"] || k["arrowright"] ? 1 : k["a"] || k["arrowleft"] ? -1 : 0;
    if (fwd || strafe) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      dir.y = 0;
      dir.normalize();
      const side = new THREE.Vector3().crossVectors(
        dir,
        new THREE.Vector3(0, 1, 0),
      );
      camera.position.addScaledVector(dir, fwd * dt * 6);
      camera.position.addScaledVector(side, strafe * dt * 5);
      const r = Math.hypot(camera.position.x, camera.position.z);
      if (r > 55) {
        camera.position.x *= 55 / r;
        camera.position.z *= 55 / r;
      }
      camera.position.y = 1.6;
    }
  });
  return null;
}

export default function World3D() {
  const walking = useRef(false);
  const [textures] = useState(() => ({
    tree: svgTexture(TREE_SVG),
    palm: svgTexture(PALM_SVG),
    cottage: svgTexture(COTTAGE_SVG),
    deer: svgTexture(DEER_SVG),
  }));
  return (
    <div className="world3d">
      <Canvas dpr={[1, 2]} camera={{ fov: 60, near: 0.1, far: 400 }}>
        <color attach="background" args={["#2e1547"]} />
        <fog attach="fog" args={["#a35563", 14, 75]} />
        {/* dusk sky dome */}
        <mesh>
          <sphereGeometry args={[190, 32, 32]} />
          <meshBasicMaterial side={THREE.BackSide} fog={false}>
            <GradientTexture
              stops={[0, 0.34, 0.46, 0.5, 1]}
              colors={["#2e1547", "#8a3f63", "#e8895a", "#f2b95e", "#f2b95e"]}
              size={1024}
            />
          </meshBasicMaterial>
        </mesh>
        {/* low sun */}
        <mesh position={[-60, 14, -160]}>
          <circleGeometry args={[16, 48]} />
          <meshBasicMaterial color="#ffd479" fog={false} />
        </mesh>
        {/* ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <circleGeometry args={[200, 48]} />
          <meshBasicMaterial color="#1c0f33" />
        </mesh>
        <Trees treeTex={textures.tree} palmTex={textures.palm} />
        <Billboard position={[0, 2.6, -38]}>
          <mesh>
            <planeGeometry args={[6.4, 5.6]} />
            <meshBasicMaterial
              map={textures.cottage}
              transparent
              alphaTest={0.1}
            />
          </mesh>
        </Billboard>
        <pointLight
          position={[0, 2, -36]}
          color="#ff9a3c"
          intensity={6}
          distance={16}
        />
        <Deer tex={textures.deer} />
        <Fireflies />
        <Walker walking={walking} />
      </Canvas>
      <div className="world3d-hud">
        <p className="world3d-hint">
          Drag to look · WASD or arrow keys to walk · or hold the paw
        </p>
        <button
          className="walk-btn"
          onPointerDown={() => (walking.current = true)}
          onPointerUp={() => (walking.current = false)}
          onPointerLeave={() => (walking.current = false)}
          aria-label="Hold to walk forward"
        >
          🐾
        </button>
        <a className="world3d-back" href="/">
          ← Back to the storybook
        </a>
      </div>
    </div>
  );
}
