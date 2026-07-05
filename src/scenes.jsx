/* Shadow-puppet scene tableaux — tholpavakoothu-inspired silhouettes on dusk skies. */

const INK = "#150a28";
const GOLD = "#f2c14e";
const EMBER = "#ff9a3c";
const CREAM = "#fff3dc";

/* ————— shared vocabulary ————— */

function Limb({ x1, y1, x2, y2, w = 14, color = INK }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
    />
  );
}

function Sky({ id, top, mid, bottom }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={top} />
          <stop offset="58%" stopColor={mid} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${id})`} />
    </>
  );
}

function Disc({ id, cx, cy, r, color = GOLD, glow = 0.5 }) {
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={glow} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 2.4} fill={`url(#${id})`} />
      <circle cx={cx} cy={cy} r={r} fill={color} />
    </>
  );
}

function Stars({ dim = false }) {
  const pts = [
    [90, 80],
    [230, 150],
    [420, 60],
    [610, 130],
    [820, 70],
    [1010, 160],
    [1180, 90],
    [1350, 170],
    [1500, 60],
    [160, 260],
    [740, 230],
    [1450, 280],
    [520, 210],
    [940, 300],
    [1280, 240],
  ];
  return (
    <g opacity={dim ? 0.35 : 0.7}>
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 2.4 : 1.5}
          fill={CREAM}
        />
      ))}
    </g>
  );
}

function Fireflies({ pts }) {
  return (
    <g>
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3.2"
          fill="#ffd479"
          className={`ff f${(i % 3) + 1}`}
        />
      ))}
    </g>
  );
}

function HillBand({ d, color = INK, opacity = 1 }) {
  return <path d={d} fill={color} opacity={opacity} />;
}

const FAR_HILLS =
  "M0 700 Q 200 640 420 690 T 860 680 T 1300 690 T 1600 670 L1600 900 L0 900 Z";
const NEAR_GROUND =
  "M0 780 Q 300 750 640 775 T 1240 770 T 1600 780 L1600 900 L0 900 Z";

function Tree({ x, y, s = 1, tone = INK, opacity = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
      <path
        d="M-8 0 C -6 -60 -12 -110 -4 -160 L 6 -160 C 10 -110 8 -60 10 0 Z"
        fill={tone}
      />
      <ellipse cx="0" cy="-185" rx="95" ry="30" fill={tone} />
      <ellipse cx="4" cy="-225" rx="70" ry="25" fill={tone} />
      <ellipse cx="-2" cy="-258" rx="42" ry="19" fill={tone} />
    </g>
  );
}

function Palm({ x, y, s = 1, tone = INK, flip = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <path
        d="M-5 0 C -2 -70 6 -130 22 -190 L 30 -186 C 16 -128 10 -70 7 0 Z"
        fill={tone}
      />
      {[-70, -40, -8, 24, 55].map((a, i) => (
        <path
          key={i}
          d={`M26 -188 q ${Math.cos((a * Math.PI) / 180) * 78} ${Math.sin((a * Math.PI) / 180) * 46 - 26} ${Math.cos((a * Math.PI) / 180) * 118} ${Math.sin((a * Math.PI) / 180) * 62}`}
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </g>
  );
}

function Birds({ x, y, s = 1, color = INK }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity="0.85">
      {[
        [0, 0],
        [46, -18],
        [96, 6],
        [140, -26],
      ].map(([bx, by], i) => (
        <path
          key={i}
          d={`M${bx} ${by} q 9 -10 18 0 q 9 -10 18 0`}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function Cottage({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x="-95" y="-8" width="190" height="14" rx="6" fill={INK} />
      <rect x="-72" y="-92" width="144" height="86" fill={INK} />
      <path
        d="M-118 -88 L 0 -170 L 118 -88 Q 60 -102 0 -100 Q -60 -102 -118 -88 Z"
        fill={INK}
      />
      <path d="M-96 -136 L 0 -196 L 96 -136 Q 0 -156 -96 -136 Z" fill={INK} />
      <rect
        x="-20"
        y="-64"
        width="40"
        height="58"
        rx="18"
        fill="#ffd479"
        opacity="0.92"
      />
      <circle cx="0" cy="-30" r="4" fill={EMBER} />
    </g>
  );
}

/* ————— figures (feet at local y=0) ————— */

function RamaArcher({ x, y, s = 1, flip = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <Limb x1={-34} y1={0} x2={0} y2={-90} w={15} />
      <Limb x1={30} y1={0} x2={0} y2={-90} w={15} />
      <Limb x1={0} y1={-90} x2={6} y2={-142} w={24} />
      <Limb x1={-8} y1={-104} x2={-20} y2={-146} w={9} />
      <path d="M-24 -152 l 7 -14 l 7 13 Z" fill={INK} />
      <circle cx="12" cy="-160" r="15.5" fill={INK} />
      <circle cx="8" cy="-180" r="6" fill={INK} />
      <path
        d="M8 -184 l 0 -10"
        stroke={GOLD}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Limb x1={10} y1={-138} x2={66} y2={-142} w={12} />
      <Limb x1={10} y1={-138} x2={28} y2={-150} w={12} />
      <path
        d="M66 -210 Q 118 -142 66 -76"
        stroke={INK}
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="66" y1="-210" x2="66" y2="-76" stroke={INK} strokeWidth="3" />
      <Limb x1={22} y1={-142} x2={82} y2={-142} w={5} color={GOLD} />
    </g>
  );
}

function LakshmanaGuard({ x, y, s = 1, flip = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <Limb x1={-18} y1={0} x2={0} y2={-92} w={15} />
      <Limb x1={20} y1={0} x2={0} y2={-92} w={15} />
      <Limb x1={0} y1={-92} x2={0} y2={-144} w={24} />
      <circle cx="0" cy="-162" r="15.5" fill={INK} />
      <circle cx="-4" cy="-182" r="6" fill={INK} />
      <path
        d="M-4 -186 l 0 -10"
        stroke={GOLD}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <Limb x1={0} y1={-138} x2={38} y2={-114} w={12} />
      <line
        x1="44"
        y1="-200"
        x2="44"
        y2="-6"
        stroke={INK}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M44 -200 Q 60 -160 44 -120"
        stroke={INK}
        strokeWidth="6"
        fill="none"
      />
      <Limb x1={0} y1={-134} x2={-26} y2={-98} w={11} />
    </g>
  );
}

function Sita({ x, y, s = 1, flip = false, pose = "stand" }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <path
        d="M-30 0 Q -18 -62 -10 -98 L 10 -98 Q 18 -62 30 0 Q 0 10 -30 0 Z"
        fill={INK}
      />
      <path
        d="M-27 -4 Q 0 6 27 -4"
        stroke={GOLD}
        strokeWidth="3.5"
        fill="none"
      />
      <Limb x1={0} y1={-96} x2={0} y2={-130} w={17} />
      <path
        d="M-7 -122 L 9 -100"
        stroke={GOLD}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="0" cy="-148" r="14.5" fill={INK} />
      <circle cx="-13" cy="-155" r="7.5" fill={INK} />
      <circle cx="0" cy="-164" r="3.2" fill={GOLD} />
      {pose === "stand" && (
        <>
          <Limb x1={0} y1={-122} x2={-20} y2={-84} w={10} />
          <Limb x1={0} y1={-122} x2={20} y2={-84} w={10} />
        </>
      )}
      {pose === "point" && (
        <>
          <Limb x1={0} y1={-122} x2={46} y2={-148} w={10} />
          <Limb x1={0} y1={-120} x2={-18} y2={-84} w={10} />
          <circle cx="51" cy="-151" r="4.5" fill={GOLD} />
        </>
      )}
      {pose === "worry" && (
        <>
          <Limb x1={0} y1={-120} x2={-13} y2={-141} w={10} />
          <Limb x1={0} y1={-120} x2={13} y2={-141} w={10} />
        </>
      )}
      {pose === "bowl" && (
        <>
          <Limb x1={0} y1={-120} x2={32} y2={-106} w={10} />
          <path d="M24 -103 a 15 10 0 0 0 30 0 Z" fill={INK} />
          <circle cx="34" cy="-108" r="3.6" fill={GOLD} />
          <circle cx="43" cy="-107" r="3.6" fill={EMBER} />
        </>
      )}
    </g>
  );
}

function Sadhu({ x, y, s = 1, flip = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <Limb x1={-14} y1={0} x2={4} y2={-72} w={14} />
      <Limb x1={16} y1={0} x2={4} y2={-72} w={14} />
      <path
        d="M4 -72 Q 6 -112 36 -124"
        stroke={INK}
        strokeWidth="24"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="48" cy="-132" r="13" fill={INK} />
      <path
        d="M50 -122 q 7 12 2 24"
        stroke={INK}
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <Limb x1={32} y1={-116} x2={64} y2={-90} w={10} />
      <path d="M55 -87 a 13 9 0 0 0 26 0 Z" fill={INK} />
      <line
        x1="84"
        y1="-164"
        x2="70"
        y2="-4"
        stroke={INK}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <Limb x1={28} y1={-110} x2={82} y2={-132} w={10} />
    </g>
  );
}

function Ravana({ x, y, s = 1, flip = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <Limb x1={-38} y1={0} x2={0} y2={-105} w={20} />
      <Limb x1={40} y1={0} x2={0} y2={-105} w={20} />
      <Limb x1={0} y1={-105} x2={0} y2={-172} w={38} />
      <Limb x1={-46} y1={-158} x2={46} y2={-158} w={18} />
      <path
        d="M-20 -118 L 22 -110"
        stroke={GOLD}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* three arms each side */}
      <Limb x1={-42} y1={-158} x2={-112} y2={-198} w={12} />
      <Limb x1={-42} y1={-154} x2={-124} y2={-156} w={12} />
      <Limb x1={-40} y1={-148} x2={-108} y2={-114} w={12} />
      <Limb x1={42} y1={-158} x2={112} y2={-198} w={12} />
      <Limb x1={42} y1={-154} x2={124} y2={-156} w={12} />
      <Limb x1={40} y1={-148} x2={108} y2={-114} w={12} />
      {/* curved talwar in top right hand */}
      <path
        d="M112 -198 Q 136 -232 170 -244 Q 148 -218 132 -198 Z"
        fill={GOLD}
      />
      {/* head fan — tight arc */}
      {[
        [-96, -172, 9.5],
        [-78, -180, 11],
        [-56, -188, 13],
        [-30, -194, 15],
        [30, -194, 15],
        [56, -188, 13],
        [78, -180, 11],
        [96, -172, 9.5],
      ].map(([hx, hy, hr], i) => (
        <circle key={i} cx={hx} cy={hy} r={hr} fill={INK} />
      ))}
      <circle cx="0" cy="-198" r="18" fill={INK} />
      {/* crowns */}
      {[
        [-96, -182],
        [-78, -192],
        [-56, -202],
        [-30, -210],
        [0, -217],
        [30, -210],
        [56, -202],
        [78, -192],
        [96, -182],
      ].map(([cx2, cy2], i) => (
        <path key={i} d={`M${cx2 - 5} ${cy2} l 5 -13 l 5 13 Z`} fill={GOLD} />
      ))}
      <circle cx="-6" cy="-200" r="2.6" fill={EMBER} />
      <circle cx="7" cy="-200" r="2.6" fill={EMBER} />
    </g>
  );
}

function Chariot({ x, y, s = 1, flip = false, withSita = false }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {/* cloud swirls beneath */}
      <path
        d="M-150 34 q 44 20 100 8 q -34 24 -82 13 Z"
        fill={CREAM}
        opacity="0.22"
      />
      <path
        d="M40 40 q 54 18 116 4 q -40 26 -104 16 Z"
        fill={CREAM}
        opacity="0.18"
      />
      {/* pavilion roof */}
      <path
        d="M-100 -92 Q 0 -116 100 -92 L 88 -76 Q 0 -96 -88 -76 Z"
        fill={INK}
      />
      <line
        x1="0"
        y1="-104"
        x2="0"
        y2="-124"
        stroke={INK}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M0 -124 q 30 7 0 20" fill={EMBER} />
      {/* pillars */}
      <line x1="-78" y1="-78" x2="-78" y2="-8" stroke={INK} strokeWidth="7" />
      <line x1="78" y1="-78" x2="78" y2="-8" stroke={INK} strokeWidth="7" />
      {withSita && <Sita x={0} y={-12} s={0.74} pose="worry" />}
      {/* deck with upswept prow */}
      <path
        d="M-160 -58 Q -170 -16 -128 -4 L 118 -4 Q 146 -8 158 -30 L 140 -30 Q 130 -18 112 -18 L -118 -18 Q -140 -30 -146 -58 Z"
        fill={INK}
      />
      <path d="M-128 -8 L 118 -8" stroke={GOLD} strokeWidth="3" opacity="0.9" />
      <circle cx="-58" cy="8" r="14" fill={INK} stroke={GOLD} strokeWidth="4" />
      <circle cx="66" cy="8" r="14" fill={INK} stroke={GOLD} strokeWidth="4" />
    </g>
  );
}

function Jatayu({ x, y, s = 1, flip = false }) {
  const feather = (angle, len, i) => (
    <g key={i} transform={`rotate(${angle})`}>
      <path
        d={`M0 0 Q ${len * 0.45} -22 ${len} -8 Q ${len * 0.55} 14 0 16 Z`}
        fill={INK}
      />
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <g transform="translate(26,-6)">
        {[-2, -16, -30, -44, -58].map((a, i) => feather(a, 240 - i * 20, i))}
      </g>
      <g transform="translate(-26,-6) scale(-1,1)">
        {[-6, -20, -34, -48, -62].map((a, i) => feather(a, 230 - i * 18, i))}
      </g>
      <ellipse cx="0" cy="12" rx="44" ry="58" fill={INK} />
      <g transform="translate(0,64)">
        {[-24, 0, 24].map((a, i) => (
          <g key={i} transform={`rotate(${a})`}>
            <path d="M0 0 Q -9 40 0 74 Q 9 40 0 0 Z" fill={INK} />
          </g>
        ))}
      </g>
      <circle cx="0" cy="-42" r="19" fill={INK} />
      <path d="M14 -46 l 30 8 l -28 10 Z" fill={GOLD} />
      <circle cx="-4" cy="-48" r="3" fill={EMBER} />
      <path
        d="M-14 -60 q 12 -14 26 -6"
        stroke={GOLD}
        strokeWidth="3.5"
        fill="none"
      />
    </g>
  );
}

function GoldenDeer({ x, y, s = 1, flip = false, leaping = false }) {
  const grad = `deerGrad${leaping ? "L" : "S"}`;
  return (
    <g
      transform={`translate(${x},${y}) scale(${flip ? -s : s},${s}) ${leaping ? "rotate(-14)" : ""}`}
    >
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd479" />
          <stop offset="100%" stopColor="#d98e2b" />
        </linearGradient>
      </defs>
      {/* legs — slender, alert */}
      <Limb x1={-52} y1={-64} x2={-58} y2={-30} w={8} color="#c9852a" />
      <Limb x1={-58} y1={-30} x2={-54} y2={0} w={6.5} color="#c9852a" />
      <Limb x1={-30} y1={-66} x2={-24} y2={-32} w={8} color="#c9852a" />
      <Limb x1={-24} y1={-32} x2={-28} y2={-2} w={6.5} color="#c9852a" />
      <Limb x1={38} y1={-66} x2={44} y2={-34} w={8} color="#c9852a" />
      <Limb x1={44} y1={-34} x2={40} y2={-2} w={6.5} color="#c9852a" />
      <Limb x1={54} y1={-68} x2={62} y2={-36} w={8} color="#c9852a" />
      <Limb x1={62} y1={-36} x2={58} y2={-4} w={6.5} color="#c9852a" />
      {/* body — slim and graceful */}
      <ellipse cx="0" cy="-88" rx="72" ry="34" fill={`url(#${grad})`} />
      {/* chest and neck sweeping up */}
      <path
        d="M46 -100 Q 66 -128 76 -152"
        stroke={`url(#${grad})`}
        strokeWidth="17"
        fill="none"
        strokeLinecap="round"
      />
      {/* head — small, refined */}
      <ellipse
        cx="83"
        cy="-158"
        rx="17"
        ry="10.5"
        fill="#ffd479"
        transform="rotate(-24 83 -158)"
      />
      <path d="M96 -164 l 15 -2 l -12 8 Z" fill="#ffd479" />
      <path d="M76 -168 l -1 -14 l 9 10 Z" fill="#ffd479" />
      <path d="M72 -172 l -8 -11 l 12 6 Z" fill="#ffd479" />
      {/* antlers — delicate symmetric branches */}
      <path
        d="M84 -170 C 78 -196 66 -206 56 -212 M84 -170 C 92 -198 106 -206 118 -210 M79 -188 L 68 -196 M92 -190 L 104 -198"
        stroke={GOLD}
        strokeWidth="4.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* tail */}
      <path
        d="M-68 -94 q -12 4 -10 16"
        stroke="#d98e2b"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="88" cy="-161" r="2.8" fill={INK} />
      {/* starlight spots */}
      {[
        [-30, -92],
        [2, -80],
        [26, -98],
        [-6, -104],
        [36, -80],
      ].map(([sx, sy], i) => (
        <path
          key={i}
          d={`M${sx} ${sy - 6} L ${sx + 2} ${sy - 2} L ${sx + 6} ${sy} L ${sx + 2} ${sy + 2} L ${sx} ${sy + 6} L ${sx - 2} ${sy + 2} L ${sx - 6} ${sy} L ${sx - 2} ${sy - 2} Z`}
          fill={CREAM}
          opacity="0.95"
        />
      ))}
    </g>
  );
}

function HanumanLeap({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* tail — one grand curl above the back */}
      <path
        d="M-116 20 C -170 8 -194 -34 -162 -70 C -136 -96 -98 -86 -94 -56"
        stroke={INK}
        strokeWidth="13"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="-93" cy="-52" r="7" fill={INK} />
      {/* legs — streaming behind */}
      <Limb x1={-92} y1={16} x2={-172} y2={40} w={14} />
      <Limb x1={-98} y1={26} x2={-178} y2={62} w={13} />
      {/* body — horizontal flight */}
      <path
        d="M-118 22 C -60 -4 18 -18 58 -16 C 78 -15 80 12 58 17 C 12 26 -58 38 -118 22 Z"
        fill={INK}
      />
      {/* dhoti band */}
      <path
        d="M-42 4 L -36 26"
        stroke={GOLD}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* arms — both reaching forward */}
      <Limb x1={50} y1={-8} x2={138} y2={-36} w={13} />
      <Limb x1={48} y1={4} x2={146} y2={-4} w={13} />
      <circle cx="144" cy="-38" r="9" fill={INK} />
      <circle cx="152" cy="-5" r="9" fill={INK} />
      {/* head — crowned monkey profile facing forward */}
      <circle cx="74" cy="-30" r="9" fill={INK} />
      <circle cx="92" cy="-16" r="26" fill={INK} />
      <circle cx="116" cy="-8" r="12" fill={INK} />
      <path
        d="M78 4 Q 98 14 118 2"
        stroke={GOLD}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M72 -34 Q 92 -52 112 -30"
        stroke={GOLD}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M86 -48 l 6 -14 l 7 13 Z" fill={GOLD} />
      <circle cx="99" cy="-20" r="3" fill={EMBER} />
    </g>
  );
}

/* ————— scenes ————— */

function ScenePanchavati() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A peaceful cottage in the Panchavati forest at dawn"
    >
      <Sky id="skyPan" top="#3b1a54" mid="#a34a6a" bottom="#f2a05e" />
      <Disc id="sunPan" cx="480" cy="540" r="96" color="#ffd479" glow="0.55" />
      <Birds x={340} y={280} s={1.1} />
      <Birds x={980} y={190} s={0.8} />
      <HillBand d={FAR_HILLS} color="#3a1c50" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Tree x={170} y={800} s={1.25} />
      <Palm x={1490} y={805} s={1.1} flip />
      <Tree x={1330} y={795} s={0.9} />
      <Cottage x={1060} y={768} s={1.15} />
      <RamaArcher x={540} y={772} s={1.05} />
      <Sita x={700} y={774} s={1.02} pose="stand" />
      <LakshmanaGuard x={856} y={772} s={1.05} flip />
      <Fireflies
        pts={[
          [300, 640],
          [520, 690],
          [900, 640],
          [1240, 660],
          [700, 600],
        ]}
      />
    </svg>
  );
}

function SceneGoldenDeer() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="A golden deer with starlight spots appears at the edge of the forest"
    >
      <Sky id="skyDeer" top="#2e1547" mid="#8a3f63" bottom="#f2b95e" />
      <Disc id="sunDeer" cx="1180" cy="400" r="84" color="#ffd479" glow="0.5" />
      <HillBand d={FAR_HILLS} color="#3a1c50" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Tree x={140} y={800} s={1.3} />
      <Tree x={320} y={790} s={0.85} />
      <Palm x={1480} y={800} s={1.15} flip />
      <Disc id="deerGlow" cx="620" cy="640" r="34" color="#ffd479" glow="0.4" />
      <GoldenDeer x={620} y={762} s={1.25} />
      <Sita x={1060} y={768} s={1.05} pose="point" flip />
      <LakshmanaGuard x={1220} y={766} s={1.05} flip />
      <Fireflies
        pts={[
          [430, 600],
          [820, 560],
          [980, 640],
          [1350, 620],
        ]}
      />
    </svg>
  );
}

function SceneChase() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Rama chases the golden deer deep into the forest"
    >
      <Sky id="skyChase" top="#0f2430" mid="#1d4a42" bottom="#e8a54b" />
      <g opacity="0.3">
        <path
          d="M520 0 L 460 900 L 620 900 L 640 0 Z"
          fill="#ffd479"
          opacity="0.4"
        />
        <path
          d="M980 0 L 940 900 L 1060 900 L 1080 0 Z"
          fill="#ffd479"
          opacity="0.3"
        />
      </g>
      <HillBand d={FAR_HILLS} color="#122c2a" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Tree x={110} y={800} s={1.5} />
      <Tree x={300} y={805} s={1.05} />
      <Tree x={1500} y={800} s={1.5} />
      <Tree x={1340} y={805} s={1.0} />
      <Palm x={220} y={795} s={1.0} />
      <GoldenDeer x={1050} y={716} s={1.1} leaping />
      <RamaArcher x={510} y={770} s={1.12} />
      <Fireflies
        pts={[
          [700, 560],
          [880, 620],
          [1260, 580],
        ]}
      />
    </svg>
  );
}

function SceneSitaWorries() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Sita, frightened by the cry, begs Lakshmana to go"
    >
      <Sky id="skyWorry" top="#241238" mid="#6b3a70" bottom="#c0708a" />
      <path
        d="M180 220 q 90 -44 190 -6 q 84 30 180 -8"
        stroke={CREAM}
        strokeWidth="5"
        fill="none"
        opacity="0.25"
        strokeLinecap="round"
      />
      <path
        d="M1080 160 q 100 -40 210 4 q 70 26 150 -4"
        stroke={CREAM}
        strokeWidth="5"
        fill="none"
        opacity="0.2"
        strokeLinecap="round"
      />
      <HillBand d={FAR_HILLS} color="#38184a" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Cottage x={330} y={766} s={1.1} />
      <Tree x={120} y={800} s={1.2} />
      <Palm x={1500} y={805} s={1.1} flip />
      <Sita x={740} y={770} s={1.12} pose="worry" />
      <LakshmanaGuard x={930} y={768} s={1.12} flip />
      <Fireflies
        pts={[
          [540, 620],
          [1150, 600],
          [1300, 660],
        ]}
      />
    </svg>
  );
}

function SceneRekha() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Lakshmana draws a glowing protective circle around the cottage"
    >
      <Sky id="skyRekha" top="#120a2a" mid="#2c1650" bottom="#5b2d74" />
      <Stars />
      <Disc
        id="moonRekha"
        cx="1240"
        cy="220"
        r="90"
        color="#fff3dc"
        glow="0.35"
      />
      <HillBand d={FAR_HILLS} color="#241040" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Cottage x={660} y={702} s={0.95} />
      <Tree x={150} y={800} s={1.25} />
      <Palm x={1480} y={805} s={1.15} flip />
      <g className="rekha-glow">
        <ellipse
          cx="660"
          cy="742"
          rx="330"
          ry="46"
          fill="none"
          stroke={GOLD}
          strokeWidth="7"
        />
        <ellipse
          cx="660"
          cy="742"
          rx="330"
          ry="46"
          fill="none"
          stroke="#ffd479"
          strokeWidth="18"
          opacity="0.25"
        />
      </g>
      <Sita x={760} y={724} s={0.95} pose="stand" flip />
      {/* Lakshmana bends to touch the line with his glowing bow-tip */}
      <g transform="translate(292,760) scale(1.05)">
        <Limb x1={-26} y1={0} x2={0} y2={-84} w={15} />
        <Limb x1={22} y1={0} x2={0} y2={-84} w={15} />
        <path
          d="M0 -84 Q 10 -122 30 -132"
          stroke={INK}
          strokeWidth="23"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="40" cy="-146" r="15" fill={INK} />
        <circle cx="36" cy="-165" r="6" fill={INK} />
        <path
          d="M36 -169 l 0 -9"
          stroke={GOLD}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <Limb x1={26} y1={-124} x2={64} y2={-64} w={11} />
        <line
          x1="64"
          y1="-64"
          x2="76"
          y2="-16"
          stroke={GOLD}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Disc
          id="rekhaSpark"
          cx={78}
          cy={-10}
          r={7}
          color="#ffd479"
          glow="0.8"
        />
        <Limb x1={22} y1={-118} x2={-8} y2={-108} w={11} />
      </g>
      <Fireflies
        pts={[
          [420, 560],
          [900, 540],
          [1100, 620],
          [240, 640],
        ]}
      />
    </svg>
  );
}

function SceneSadhu() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="An old holy man waits at the edge of the glowing circle"
    >
      <Sky id="skySadhu" top="#100826" mid="#26124a" bottom="#4a2358" />
      <Stars dim />
      <Disc
        id="moonSadhu"
        cx="300"
        cy="190"
        r="74"
        color="#fff3dc"
        glow="0.3"
      />
      <HillBand d={FAR_HILLS} color="#200e3a" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Cottage x={360} y={700} s={0.95} />
      <Tree x={130} y={800} s={1.2} />
      <Tree x={1470} y={800} s={1.35} />
      <g className="rekha-glow">
        <ellipse
          cx="410"
          cy="742"
          rx="310"
          ry="44"
          fill="none"
          stroke={GOLD}
          strokeWidth="7"
        />
        <ellipse
          cx="410"
          cy="742"
          rx="310"
          ry="44"
          fill="none"
          stroke="#ffd479"
          strokeWidth="16"
          opacity="0.22"
        />
      </g>
      <Sita x={600} y={746} s={1.05} pose="bowl" />
      <g
        opacity="0.14"
        transform="translate(1100,760) scale(1.6,0.5) rotate(6)"
      >
        <Ravana x={0} y={0} s={1} flip />
      </g>
      <Sadhu x={1000} y={756} s={1.12} flip />
      <Fireflies
        pts={[
          [760, 600],
          [1240, 580],
          [520, 560],
        ]}
      />
    </svg>
  );
}

function SceneRavana() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Ravana reveals his true ten-headed form and carries Sita into the sky"
    >
      <Sky id="skyRav" top="#1c0b2e" mid="#58163f" bottom="#a3242f" />
      <path
        d="M420 40 L 388 190 L 428 180 L 380 330"
        stroke="#ffd479"
        strokeWidth="6"
        fill="none"
        opacity="0.8"
        strokeLinecap="round"
      />
      <path
        d="M1300 80 L 1276 200 L 1310 192 L 1272 320"
        stroke="#ffd479"
        strokeWidth="5"
        fill="none"
        opacity="0.6"
        strokeLinecap="round"
      />
      <HillBand d={FAR_HILLS} color="#340f2e" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Tree x={150} y={805} s={1.3} />
      <Tree x={1480} y={805} s={1.2} />
      <Chariot x={1020} y={340} s={1.25} withSita />
      {[
        [930, 450],
        [875, 540],
        [830, 630],
        [792, 710],
      ].map(([jx, jy], i) => (
        <circle key={i} cx={jx} cy={jy} r={5 - i * 0.7} fill={GOLD} />
      ))}
      <Ravana x={420} y={772} s={1.25} />
      <Fireflies
        pts={[
          [620, 620],
          [1200, 640],
        ]}
      />
    </svg>
  );
}

function SceneJatayu() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Jatayu the great eagle battles Ravana's flying chariot"
    >
      <Sky id="skyJat" top="#33102e" mid="#8a2436" bottom="#f2683c" />
      <Disc id="sunJat" cx="800" cy="500" r="180" color="#ffb45e" glow="0.45" />
      <HillBand d={FAR_HILLS} color="#3a1428" />
      <HillBand d={NEAR_GROUND} color={INK} />
      <Tree x={140} y={805} s={1.25} />
      <Palm x={1490} y={805} s={1.2} flip />
      <Chariot x={1190} y={320} s={1.05} withSita flip />
      <Jatayu x={690} y={380} s={1.5} />
      {[
        [970, 420],
        [1010, 490],
        [930, 510],
      ].map(([fx, fy], i) => (
        <path
          key={i}
          d={`M${fx} ${fy} q 10 8 4 22 q -12 -6 -4 -22`}
          fill={INK}
          opacity="0.85"
        />
      ))}
      <Fireflies
        pts={[
          [400, 640],
          [1240, 660],
        ]}
      />
    </svg>
  );
}

function ScenePromise() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Rama and Lakshmana look to the horizon and vow to find Sita"
    >
      <Sky id="skyProm" top="#16203c" mid="#2f4a68" bottom="#f2c14e" />
      <Stars dim />
      <Disc id="starProm" cx="1150" cy="210" r="9" color="#fff3dc" glow="0.9" />
      <path
        d="M1150 180 L 1150 240 M1120 210 L 1180 210"
        stroke={CREAM}
        strokeWidth="3"
        opacity="0.8"
      />
      <HillBand
        d="M0 640 Q 300 560 640 610 T 1600 600 L1600 900 L0 900 Z"
        color="#1d2c48"
      />
      <HillBand
        d="M0 760 Q 400 690 900 740 T 1600 730 L1600 900 L0 900 Z"
        color={INK}
      />
      <Tree x={1460} y={780} s={1.3} />
      {/* wounded Jatayu resting */}
      <g transform="translate(360,742)">
        <path
          d="M-44 -32 Q 0 -56 48 -36 Q 70 -24 64 0 L -60 0 Q -64 -20 -44 -32 Z"
          fill={INK}
        />
        <path d="M8 -36 l 26 -10 l 4 9 l -25 11 Z" fill={GOLD} opacity="0.9" />
        <circle cx="50" cy="-42" r="10" fill={INK} />
        <path d="M57 -46 l 15 4 l -14 6 Z" fill={GOLD} />
      </g>
      <RamaArcher x={620} y={744} s={1.05} />
      <LakshmanaGuard x={746} y={742} s={1.05} />
      <Fireflies
        pts={[
          [300, 600],
          [900, 560],
          [1300, 620],
          [520, 660],
        ]}
      />
    </svg>
  );
}

export function HeroScene() {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Hanuman leaps across a giant golden moon over the ocean"
    >
      <Sky id="skyHero" top="#0d0a2e" mid="#2a1454" bottom="#4a1e63" />
      <Stars />
      <Disc id="moonHero" cx="800" cy="360" r="270" color={GOLD} glow="0.4" />
      <HanumanLeap x={780} y={340} s={1.1} />
      <path
        d="M0 780 Q 200 756 400 780 T 800 780 T 1200 780 T 1600 780 L 1600 900 L 0 900 Z"
        fill={INK}
      />
      <path
        d="M0 820 Q 160 800 320 820 T 640 820 T 960 820 T 1280 820 T 1600 820"
        stroke="#54256b"
        strokeWidth="5"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M120 800 q 30 -10 60 0 M480 806 q 30 -10 60 0 M980 802 q 30 -10 60 0 M1380 806 q 30 -10 60 0"
        stroke={GOLD}
        strokeWidth="3.5"
        fill="none"
        opacity="0.5"
      />
      <Fireflies
        pts={[
          [200, 640],
          [1400, 620],
          [300, 300],
          [1250, 500],
        ]}
      />
    </svg>
  );
}

export const SCENES = {
  panchavati: ScenePanchavati,
  golden_deer: SceneGoldenDeer,
  chase: SceneChase,
  sita_worries: SceneSitaWorries,
  rekha: SceneRekha,
  sadhu: SceneSadhu,
  ravana: SceneRavana,
  jatayu: SceneJatayu,
  promise: ScenePromise,
};

export const SCENE_TITLES = {
  panchavati: "The cottage at Panchavati",
  golden_deer: "The golden deer",
  chase: "The chase",
  sita_worries: "The cry in the forest",
  rekha: "Lakshmana's circle",
  sadhu: "The stranger at the line",
  ravana: "The demon king revealed",
  jatayu: "Jatayu the brave",
  promise: "Rama's promise",
};
