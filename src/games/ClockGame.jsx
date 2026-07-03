import { randInt, speak, shuffle } from "../lib.js";
import { ROUND_SIZE } from "../data.js";
import { useRoundQueue, ResultScreen, ChoiceRound } from "../engine.jsx";
import { InnerTopBar } from "../theme.jsx";

// ─── とけいの よみかた ──────────────────────────────────────────────────────
const PUN = { 5: "ふん", 10: "ぷん", 15: "ふん", 20: "ぷん", 25: "ふん", 35: "ふん", 40: "ぷん", 45: "ふん", 50: "ぷん", 55: "ふん" };
function readTime(h, m) {
  if (m === 0) return `${h}じ`;
  if (m === 30) return `${h}じはん`;
  return `${h}じ${m}${PUN[m]}`;
}

// Lv1: ちょうど / Lv2: はん も / Lv3: 5ふん きざみ
function randTime(level) {
  const h = randInt(1, 12);
  if (level === 1) return { h, m: 0 };
  if (level === 2) return { h, m: Math.random() < 0.5 ? 0 : 30 };
  return { h, m: randInt(0, 11) * 5 };
}

// ─── アナログとけい (SVG) ───────────────────────────────────────────────────
export function ClockFace({ h, m, size = 210 }) {
  const cx = 100, cy = 100;
  const rad = (deg) => (deg * Math.PI) / 180;
  const minAngle = m * 6 - 90;
  const hourAngle = (h % 12) * 30 + m * 0.5 - 90;
  const hh = { x: cx + 44 * Math.cos(rad(hourAngle)), y: cy + 44 * Math.sin(rad(hourAngle)) };
  const mh = { x: cx + 64 * Math.cos(rad(minAngle)), y: cy + 64 * Math.sin(rad(minAngle)) };
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block", margin: "0 auto" }}>
      <circle cx={cx} cy={cy} r={94} fill="#DFF7FF" />
      <circle cx={cx} cy={cy} r={88} fill="white" stroke="#53CEFF" strokeWidth={5} />
      {/* 5ふんごとの めもり */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = rad(i * 30 - 90);
        return (
          <circle
            key={`t${i}`}
            cx={cx + 80 * Math.cos(a)}
            cy={cy + 80 * Math.sin(a)}
            r={2.5}
            fill="#53CEFF"
          />
        );
      })}
      {/* すうじ */}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i === 0 ? 12 : i;
        const a = rad(i * 30 - 90);
        return (
          <text
            key={`n${i}`}
            x={cx + 68 * Math.cos(a)}
            y={cy + 68 * Math.sin(a)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="16"
            fontWeight="900"
            fill="#2D3436"
          >
            {n}
          </text>
        );
      })}
      {/* はり */}
      <line x1={cx} y1={cy} x2={hh.x} y2={hh.y} stroke="#FF4B78" strokeWidth={9} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mh.x} y2={mh.y} stroke="#53CEFF" strokeWidth={5.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={7} fill="#2D3436" />
    </svg>
  );
}

function genQuestions(level) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < ROUND_SIZE && guard++ < 300) {
    const t = randTime(level);
    const answer = readTime(t.h, t.m);
    if (seen.has(answer)) continue;
    seen.add(answer);

    // まちがい せんたくし 3つ
    const opts = new Set([answer]);
    let g2 = 0;
    while (opts.size < 4 && g2++ < 100) {
      const d = randTime(level);
      opts.add(readTime(d.h, d.m));
    }
    out.push({
      ...t,
      display: <ClockFace h={t.h} m={t.m} />,
      question: "とけいは なんじ かな？",
      options: shuffle([...opts]),
      answer,
      optionFontSize: 24,
      onAnswered: (ok) => speak(ok ? answer : `せいかいは、${answer}`),
    });
  }
  return out;
}

export default function ClockGame({ level, color, onFinish, onBack }) {
  const round = useRoundQueue(() => genQuestions(level), onFinish);

  if (round.phase === "done") {
    return (
      <div>
        <InnerTopBar title="とけい けっか" onBack={onBack} />
        <ResultScreen outcome={round.outcome} onRetry={round.retry} onBack={onBack} />
      </div>
    );
  }

  return (
    <div>
      <InnerTopBar title="とけい" onBack={onBack} />
      <div style={{ padding: "8px 16px 120px", maxWidth: 500, margin: "0 auto" }}>
        <ChoiceRound round={round} color={color} onSpeak={() => speak("とけいは なんじかな？")} />
      </div>
    </div>
  );
}
