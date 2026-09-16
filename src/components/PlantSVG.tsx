import type { FlowerType } from "@/lib/flowers";

type Variant = "leaf" | "sun" | "berry" | "sky" | "grape";
type BloomColors = { petal: string; petalDark: string; center: string };

const BLOOM_COLORS: Record<Variant, BloomColors> = {
  leaf: { petal: "#7fdb8f", petalDark: "#4caf6d", center: "#ffc93c" },
  sun: { petal: "#ffd873", petalDark: "#ffc93c", center: "#ff8a3d" },
  berry: { petal: "#ff9fb8", petalDark: "#ff6f91", center: "#ffe066" },
  sky: { petal: "#8ddcf5", petalDark: "#4fc3e8", center: "#fff6b8" },
  grape: { petal: "#c9a6ec", petalDark: "#a06fd6", center: "#ffe066" },
};

const STEM = "#3a8a4e";
const LEAF = "#4caf6d";
const LEAF_DARK = "#2e8b4f";
const SOIL = "#8a5a3b";
const SOIL_DARK = "#6b4229";
const POT = "#e7935c";
const POT_DARK = "#c76f3e";
const INK = "#1f4d2c";

function Pot() {
  return (
    <g>
      <rect x="30" y="98" width="40" height="14" rx="3" fill={POT} stroke={INK} strokeWidth="2.5" />
      <rect x="26" y="94" width="48" height="8" rx="3" fill={POT_DARK} stroke={INK} strokeWidth="2.5" />
      <rect x="34" y="90" width="32" height="8" fill={SOIL} stroke={INK} strokeWidth="2" />
      <rect x="34" y="90" width="32" height="3" fill={SOIL_DARK} />
    </g>
  );
}

function LeafBlock({ x, y, w = 12, h = 8, rotate = 0, dark = false }: { x: number; y: number; w?: number; h?: number; rotate?: number; dark?: boolean }) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={h / 2}
      fill={dark ? LEAF_DARK : LEAF}
      stroke={INK}
      strokeWidth="2"
      transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}
    />
  );
}

/** A bloom's shape is driven by the flower type; its coloring by the chosen palette. */
function Bloom({
  cx,
  cy,
  colors,
  type,
  scale = 1,
}: {
  cx: number;
  cy: number;
  colors: BloomColors;
  type: FlowerType;
  scale?: number;
}) {
  const sw = Math.max(1, 2 * scale);

  if (type === "sunflower") {
    const petals = 14;
    return (
      <g>
        {Array.from({ length: petals }).map((_, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={3 * scale}
            ry={9.5 * scale}
            fill={colors.petal}
            stroke={INK}
            strokeWidth={sw * 0.75}
            transform={`rotate(${(360 / petals) * i} ${cx} ${cy}) translate(0 ${-6 * scale})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={7 * scale} fill="#6b4229" stroke={INK} strokeWidth={sw} />
        {[[-2, -1], [2, 1], [0, 3], [-3, 2], [3, -2]].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * scale} cy={cy + dy * scale} r={0.9 * scale} fill="#3f2413" />
        ))}
      </g>
    );
  }

  if (type === "rose") {
    return (
      <g>
        {[0, 51, 102, 153, 204, 255, 306].map((deg, i) => (
          <ellipse
            key={`o${i}`}
            cx={cx}
            cy={cy}
            rx={5.5 * scale}
            ry={7 * scale}
            fill={colors.petal}
            stroke={INK}
            strokeWidth={sw * 0.65}
            transform={`rotate(${deg} ${cx} ${cy}) translate(0 ${-3.5 * scale})`}
          />
        ))}
        {[25, 85, 145, 205, 265, 325].map((deg, i) => (
          <ellipse
            key={`m${i}`}
            cx={cx}
            cy={cy}
            rx={4 * scale}
            ry={5 * scale}
            fill={colors.petalDark}
            stroke={INK}
            strokeWidth={sw * 0.55}
            transform={`rotate(${deg} ${cx} ${cy}) translate(0 ${-2 * scale})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={3 * scale} fill={colors.petal} stroke={INK} strokeWidth={sw * 0.5} />
        <circle cx={cx} cy={cy} r={1.4 * scale} fill={colors.center} />
      </g>
    );
  }

  if (type === "tulip") {
    const petalPath = (rot: number, fill: string) => (
      <path
        d={`M ${cx} ${cy - 14 * scale} Q ${cx - 9 * scale} ${cy - 4 * scale} ${cx - 3 * scale} ${cy + 9 * scale} L ${cx + 3 * scale} ${cy + 9 * scale} Q ${cx + 9 * scale} ${cy - 4 * scale} ${cx} ${cy - 14 * scale} Z`}
        fill={fill}
        stroke={INK}
        strokeWidth={sw * 0.75}
        transform={`rotate(${rot} ${cx} ${cy})`}
      />
    );
    return (
      <g>
        {petalPath(-18, colors.petalDark)}
        {petalPath(18, colors.petalDark)}
        {petalPath(0, colors.petal)}
      </g>
    );
  }

  if (type === "daisy") {
    const petals = 12;
    return (
      <g>
        {Array.from({ length: petals }).map((_, i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={2.3 * scale}
            ry={10 * scale}
            fill={colors.petal}
            stroke={INK}
            strokeWidth={sw * 0.55}
            transform={`rotate(${(360 / petals) * i} ${cx} ${cy}) translate(0 ${-6 * scale})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={4.3 * scale} fill={colors.center} stroke={INK} strokeWidth={sw * 0.65} />
      </g>
    );
  }

  if (type === "lotus") {
    const petalPath = (rot: number, fill: string, len: number, wide: number) => (
      <path
        d={`M ${cx} ${cy} Q ${cx - wide * scale} ${cy - len * 0.55 * scale} ${cx} ${cy - len * scale} Q ${cx + wide * scale} ${cy - len * 0.55 * scale} ${cx} ${cy} Z`}
        fill={fill}
        stroke={INK}
        strokeWidth={sw * 0.6}
        transform={`rotate(${rot} ${cx} ${cy})`}
      />
    );
    return (
      <g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <g key={i}>{petalPath(deg, colors.petal, 17, 5.5)}</g>
        ))}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg, i) => (
          <g key={i}>{petalPath(deg, colors.petalDark, 10, 3.6)}</g>
        ))}
        <ellipse cx={cx} cy={cy} rx={4.5 * scale} ry={3.5 * scale} fill="#e8d9a0" stroke={INK} strokeWidth={sw * 0.5} />
        {[[-1.6, -0.8], [1.6, -0.8], [0, 1], [-1.6, 1.6], [1.6, 1.6]].map(([dx, dy], i) => (
          <circle key={i} cx={cx + dx * scale} cy={cy + dy * scale} r={0.7 * scale} fill="#b89654" />
        ))}
      </g>
    );
  }

  // hibiscus
  return (
    <g>
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx={9 * scale}
          ry={13 * scale}
          fill={colors.petal}
          stroke={INK}
          strokeWidth={sw * 0.75}
          transform={`rotate(${deg} ${cx} ${cy}) translate(0 ${-9 * scale})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={2.4 * scale} fill={colors.petalDark} stroke={INK} strokeWidth={sw * 0.45} />
      <line x1={cx} y1={cy} x2={cx} y2={cy - 16 * scale} stroke={colors.petalDark} strokeWidth={sw * 0.45} />
      <circle cx={cx} cy={cy - 16 * scale} r={1.6 * scale} fill={colors.center} stroke={INK} strokeWidth={sw * 0.35} />
    </g>
  );
}

export default function PlantSVG({
  stage,
  variant = "leaf",
  flower = "sunflower",
  className,
}: {
  stage: number;
  variant?: Variant;
  flower?: FlowerType;
  className?: string;
}) {
  const c = BLOOM_COLORS[variant];

  return (
    <svg viewBox="0 0 100 120" className={className} role="img" aria-label={`Plant, growth stage ${stage}`}>
      <Pot />

      {stage === 0 && (
        <ellipse cx="50" cy="88" rx="5" ry="4" fill={SOIL_DARK} stroke={INK} strokeWidth="2" />
      )}

      {stage === 1 && (
        <g>
          <rect x="47" y="76" width="6" height="16" fill={STEM} stroke={INK} strokeWidth="2" />
          <LeafBlock x={30} y={74} w={16} h={8} rotate={-18} />
          <LeafBlock x={54} y={72} w={16} h={8} rotate={18} />
        </g>
      )}

      {stage === 2 && (
        <g>
          <rect x="46" y="62" width="8" height="30" fill={STEM} stroke={INK} strokeWidth="2" />
          <LeafBlock x={26} y={78} w={18} h={9} rotate={-16} />
          <LeafBlock x={56} y={74} w={18} h={9} rotate={16} dark />
          <LeafBlock x={30} y={64} w={16} h={8} rotate={-24} dark />
          <LeafBlock x={54} y={60} w={16} h={8} rotate={24} />
        </g>
      )}

      {stage === 3 && (
        <g>
          <rect x="45" y="50" width="9" height="42" fill={STEM} stroke={INK} strokeWidth="2" />
          <LeafBlock x={22} y={78} w={20} h={10} rotate={-16} />
          <LeafBlock x={58} y={72} w={20} h={10} rotate={16} dark />
          <LeafBlock x={26} y={62} w={18} h={9} rotate={-22} dark />
          <LeafBlock x={56} y={56} w={18} h={9} rotate={22} />
          <circle cx="49.5" cy="46" r="8" fill={c.petalDark} stroke={INK} strokeWidth="2.5" />
        </g>
      )}

      {stage === 4 && (
        <g>
          <rect x="45" y="42" width="9" height="50" fill={STEM} stroke={INK} strokeWidth="2" />
          <LeafBlock x={18} y={76} w={22} h={10} rotate={-18} />
          <LeafBlock x={60} y={70} w={22} h={10} rotate={18} dark />
          <LeafBlock x={22} y={58} w={20} h={10} rotate={-24} dark />
          <LeafBlock x={58} y={52} w={20} h={10} rotate={24} />
          <Bloom cx={49.5} cy={34} colors={c} type={flower} scale={1} />
        </g>
      )}

      {stage >= 5 && (
        <g>
          <rect x="40" y="30" width="20" height="62" rx="3" fill={STEM} stroke={INK} strokeWidth="2.5" />
          <rect x="30" y="46" width="16" height="8" rx="4" fill={STEM} stroke={INK} strokeWidth="2" transform="rotate(-20 38 50)" />
          <rect x="54" y="40" width="16" height="8" rx="4" fill={STEM} stroke={INK} strokeWidth="2" transform="rotate(20 62 44)" />
          <LeafBlock x={10} y={60} w={24} h={12} rotate={-16} />
          <LeafBlock x={66} y={54} w={24} h={12} rotate={16} dark />
          <LeafBlock x={16} y={36} w={20} h={11} rotate={-26} dark />
          <LeafBlock x={64} y={30} w={20} h={11} rotate={26} />
          <LeafBlock x={38} y={18} w={24} h={12} rotate={-4} />
          {[[26, 44], [72, 38], [50, 14], [34, 66], [66, 62]].map(([cx, cy], i) => (
            <Bloom key={i} cx={cx} cy={cy} colors={c} type={flower} scale={0.55} />
          ))}
        </g>
      )}
    </svg>
  );
}
