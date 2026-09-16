type Variant = "leaf" | "sun" | "berry" | "sky" | "grape";

const BLOOM_COLORS: Record<Variant, { petal: string; petalDark: string; center: string }> = {
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

function Pot() {
  return (
    <g>
      <rect x="30" y="98" width="40" height="14" rx="3" fill={POT} stroke="#1f4d2c" strokeWidth="2.5" />
      <rect x="26" y="94" width="48" height="8" rx="3" fill={POT_DARK} stroke="#1f4d2c" strokeWidth="2.5" />
      <rect x="34" y="90" width="32" height="8" fill={SOIL} stroke="#1f4d2c" strokeWidth="2" />
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
      stroke="#1f4d2c"
      strokeWidth="2"
      transform={`rotate(${rotate} ${x + w / 2} ${y + h / 2})`}
    />
  );
}

export default function PlantSVG({ stage, variant = "leaf", className }: { stage: number; variant?: Variant; className?: string }) {
  const c = BLOOM_COLORS[variant];

  return (
    <svg viewBox="0 0 100 120" className={className} role="img" aria-label={`Plant, growth stage ${stage}`}>
      <Pot />

      {stage === 0 && (
        <ellipse cx="50" cy="88" rx="5" ry="4" fill={SOIL_DARK} stroke="#1f4d2c" strokeWidth="2" />
      )}

      {stage === 1 && (
        <g>
          <rect x="47" y="76" width="6" height="16" fill={STEM} stroke="#1f4d2c" strokeWidth="2" />
          <LeafBlock x={30} y={74} w={16} h={8} rotate={-18} />
          <LeafBlock x={54} y={72} w={16} h={8} rotate={18} />
        </g>
      )}

      {stage === 2 && (
        <g>
          <rect x="46" y="62" width="8" height="30" fill={STEM} stroke="#1f4d2c" strokeWidth="2" />
          <LeafBlock x={26} y={78} w={18} h={9} rotate={-16} />
          <LeafBlock x={56} y={74} w={18} h={9} rotate={16} dark />
          <LeafBlock x={30} y={64} w={16} h={8} rotate={-24} dark />
          <LeafBlock x={54} y={60} w={16} h={8} rotate={24} />
        </g>
      )}

      {stage === 3 && (
        <g>
          <rect x="45" y="50" width="9" height="42" fill={STEM} stroke="#1f4d2c" strokeWidth="2" />
          <LeafBlock x={22} y={78} w={20} h={10} rotate={-16} />
          <LeafBlock x={58} y={72} w={20} h={10} rotate={16} dark />
          <LeafBlock x={26} y={62} w={18} h={9} rotate={-22} dark />
          <LeafBlock x={56} y={56} w={18} h={9} rotate={22} />
          <circle cx="49.5" cy="46" r="8" fill={c.petalDark} stroke="#1f4d2c" strokeWidth="2.5" />
        </g>
      )}

      {stage === 4 && (
        <g>
          <rect x="45" y="42" width="9" height="50" fill={STEM} stroke="#1f4d2c" strokeWidth="2" />
          <LeafBlock x={18} y={76} w={22} h={10} rotate={-18} />
          <LeafBlock x={60} y={70} w={22} h={10} rotate={18} dark />
          <LeafBlock x={22} y={58} w={20} h={10} rotate={-24} dark />
          <LeafBlock x={58} y={52} w={20} h={10} rotate={24} />
          {/* bloom */}
          <g>
            {[0, 72, 144, 216, 288].map((deg) => (
              <ellipse
                key={deg}
                cx="49.5"
                cy="34"
                rx="8"
                ry="12"
                fill={c.petal}
                stroke="#1f4d2c"
                strokeWidth="2"
                transform={`rotate(${deg} 49.5 34) translate(0 -10)`}
              />
            ))}
            <circle cx="49.5" cy="34" r="7" fill={c.center} stroke="#1f4d2c" strokeWidth="2.5" />
          </g>
        </g>
      )}

      {stage >= 5 && (
        <g>
          <rect x="40" y="30" width="20" height="62" rx="3" fill={STEM} stroke="#1f4d2c" strokeWidth="2.5" />
          <rect x="30" y="46" width="16" height="8" rx="4" fill={STEM} stroke="#1f4d2c" strokeWidth="2" transform="rotate(-20 38 50)" />
          <rect x="54" y="40" width="16" height="8" rx="4" fill={STEM} stroke="#1f4d2c" strokeWidth="2" transform="rotate(20 62 44)" />
          <LeafBlock x={10} y={60} w={24} h={12} rotate={-16} />
          <LeafBlock x={66} y={54} w={24} h={12} rotate={16} dark />
          <LeafBlock x={16} y={36} w={20} h={11} rotate={-26} dark />
          <LeafBlock x={64} y={30} w={20} h={11} rotate={26} />
          <LeafBlock x={38} y={18} w={24} h={12} rotate={-4} />
          {[[26, 44], [72, 38], [50, 14], [34, 66], [66, 62]].map(([cx, cy], i) => (
            <g key={i}>
              {[0, 90, 180, 270].map((deg) => (
                <ellipse
                  key={deg}
                  cx={cx}
                  cy={cy}
                  rx="5"
                  ry="7"
                  fill={c.petal}
                  stroke="#1f4d2c"
                  strokeWidth="1.5"
                  transform={`rotate(${deg} ${cx} ${cy}) translate(0 -6)`}
                />
              ))}
              <circle cx={cx} cy={cy} r="4" fill={c.center} stroke="#1f4d2c" strokeWidth="1.5" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
