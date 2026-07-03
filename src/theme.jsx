import { useEffect, useMemo, useState } from "react";
import { randInt } from "./lib.js";
import { flagEmoji } from "./data.js";

const BASE = import.meta.env.BASE_URL;
export const IMG = {
  family: `${BASE}images/baby-shark-family.png`,
  daddy: `${BASE}images/daddy-shark.png`,
};

export const BF_COLORS = ["#53CEFF", "#FF4B78", "#A659FF", "#FFCC02", "#4CD964"];

// ─── Global CSS (BebeFin) ───────────────────────────────────────────────────
export const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800;900&family=Fredoka:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --bg: #EBFDFF;
    --card: #FFFFFF;
    --text: #2D3436;
    --text-light: #8395A7;
    --cyan: #53CEFF;
    --pink: #FF4B78;
    --purple: #A659FF;
    --green: #4CD964;
    --yellow: #FFCC02;
    --orange: #FF9500;
    --shadow-card: 0 2px 12px rgba(0,0,0,0.06);
    --shadow-lg: 0 8px 32px rgba(83,206,255,0.18);
    --radius: 28px;
    --radius-sm: 20px;
    --radius-pill: 50px;
  }

  body {
    font-family: 'M PLUS Rounded 1c', 'Fredoka', sans-serif;
    background: #EBFDFF;
    color: var(--text);
    overflow-x: hidden;
    min-height: 100vh;
  }

  /* タップしたときに ちいさく へこむ (タブレットで hover が のこらない) */
  .pressable { transition: transform 0.12s ease; }
  .pressable:active { transform: scale(0.95); }

  @keyframes popIn {
    0% { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }
  @keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(-120px) rotate(720deg); opacity: 0; }
  }
  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes scaleIn {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  @keyframes stampDrop {
    0% { transform: scale(3) rotate(-30deg); opacity: 0; }
    60% { transform: scale(0.9) rotate(5deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes celebrateJump {
    0% { transform: translateY(0) scale(1); }
    30% { transform: translateY(-20px) scale(1.1); }
    50% { transform: translateY(-25px) scale(1.15); }
    70% { transform: translateY(-20px) scale(1.1); }
    100% { transform: translateY(0) scale(1); }
  }
  @keyframes swimAround {
    0% { transform: translate(0, 0) rotate(0deg) scale(1); }
    25% { transform: translate(15px, -20px) rotate(5deg) scale(1.05); }
    50% { transform: translate(-10px, -35px) rotate(-3deg) scale(1); }
    75% { transform: translate(20px, -15px) rotate(4deg) scale(1.05); }
    100% { transform: translate(0, 0) rotate(0deg) scale(1); }
  }
  @keyframes bubbleFloat {
    0% { transform: translateY(0) scale(1); opacity: 0.15; }
    50% { transform: translateY(-50vh) scale(1.2); opacity: 0.08; }
    100% { transform: translateY(-100vh) scale(0.8); opacity: 0; }
  }
  @keyframes starPop {
    0% { transform: scale(0) rotate(-30deg); opacity: 0; }
    60% { transform: scale(1.4) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
`;

// ─── 背景 (メモ化: さいレンダーで うごきなおさない) ─────────────────────────
const SHARK_CHARS = [
  `${BASE}images/characters/baby-shark.png`,
  `${BASE}images/characters/daddy-shark.png`,
  `${BASE}images/characters/mommy-shark.png`,
  `${BASE}images/characters/grandma-shark.png`,
  `${BASE}images/characters/grandpa-shark.png`,
];

// ページを ひらいたとき 1かいだけ はいちを きめる
const BG_LAYOUT = {
  sharks: Array.from({ length: 14 }, (_, i) => ({
    id: i,
    src: SHARK_CHARS[i % SHARK_CHARS.length],
    size: randInt(50, 110),
    left: randInt(0, 95),
    top: randInt(0, 95),
    delay: Math.random() * 20,
    dur: randInt(12, 28),
    flip: Math.random() > 0.5,
  })),
  bubbles: Array.from({ length: 10 }, (_, i) => ({
    id: i + 100,
    size: randInt(8, 24),
    left: randInt(5, 95),
    top: randInt(60, 100),
    delay: Math.random() * 15,
    dur: randInt(10, 22),
  })),
};

export function SoftBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {BG_LAYOUT.sharks.map((s) => (
        <img
          key={s.id}
          src={s.src}
          alt=""
          style={{
            position: "absolute",
            width: s.size,
            height: "auto",
            left: `${s.left}%`,
            top: `${s.top}%`,
            opacity: 0.18,
            transform: s.flip ? "scaleX(-1)" : "none",
            animation: `swimAround ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      {BG_LAYOUT.bubbles.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            border: "1.5px solid rgba(83,206,255,0.15)",
            background: "rgba(83,206,255,0.05)",
            left: `${b.left}%`,
            top: `${b.top}%`,
            animation: `bubbleFloat ${b.dur}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── かみふぶき ─────────────────────────────────────────────────────────────
export function ConfettiEffect({ active }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        emoji: ["⭐", "✨", "🌟", "💖", "🎉", "⭐"][i % 6],
        left: randInt(5, 95),
        delay: Math.random() * 0.6,
        size: randInt(18, 32),
      })),
    [active]
  );
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999 }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "50%",
            fontSize: p.size,
            animation: `confetti 1.4s ease-out ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "おはよう";
  if (h >= 12 && h < 17) return "こんにちは";
  return "こんばんは";
}

// ─── ナビゲーション ─────────────────────────────────────────────────────────
export function BottomNav({ screen, onHome, onStamps, stars }) {
  const isHome = screen === "home";
  const isStamps = screen === "stamps";
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(83,206,255,0.15)",
      padding: "8px 0 env(safe-area-inset-bottom, 8px) 0",
      display: "flex", justifyContent: "center", gap: 48,
    }}>
      <button onClick={onHome} className="pressable" style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
        padding: "4px 16px",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: isHome ? "linear-gradient(135deg, #53CEFF, #4FB8E8)" : "#F0F0F0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
          boxShadow: isHome ? "0 4px 12px rgba(83,206,255,0.4)" : "none",
        }}>
          🏠
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: isHome ? "#53CEFF" : "#8395A7" }}>ホーム</span>
      </button>

      <button onClick={onStamps} className="pressable" style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
        padding: "4px 16px",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%",
          background: isStamps ? "linear-gradient(135deg, #FFCC02, #F5B800)" : "#F0F0F0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
          boxShadow: isStamps ? "0 4px 12px rgba(255,204,2,0.4)" : "none",
        }}>
          ⭐
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: isStamps ? "#FFCC02" : "#8395A7" }}>{stars} ⭐</span>
      </button>
    </div>
  );
}

export function InnerTopBar({ onBack, title, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 16px 12px", gap: 12 }}>
      {onBack && (
        <button onClick={onBack} className="pressable" style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "white",
          border: "2px solid rgba(83,206,255,0.2)",
          fontSize: 20, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          fontFamily: "inherit",
        }}>
          ←
        </button>
      )}
      <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", flex: 1 }}>{title}</span>
      {right}
    </div>
  );
}

export function BigButton({ children, onClick, color, bg, style: s, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="pressable"
      style={{
        background: bg || "white",
        border: "none",
        borderRadius: "var(--radius-pill)",
        padding: "18px 28px",
        fontSize: 20,
        fontWeight: 800,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: color ? `0 4px 16px ${color}30` : "var(--shadow-card)",
        opacity: disabled ? 0.5 : 1,
        color: color || "var(--text)",
        ...s,
      }}
    >
      {children}
    </button>
  );
}

// よみあげボタン
export function SpeakButton({ onSpeak, size = 44 }) {
  return (
    <button onClick={onSpeak} className="pressable" style={{
      width: size, height: size, borderRadius: "50%",
      background: "#DFF7FF", border: "none", cursor: "pointer",
      fontSize: size * 0.5, fontFamily: "inherit",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      boxShadow: "var(--shadow-card)",
    }}>
      🔊
    </button>
  );
}

// ラウンドの すすみぐあい バー
export function RoundProgress({ pos, total, color, review }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{
        background: "#F0F0F0",
        borderRadius: "var(--radius-pill)",
        height: 12,
        overflow: "hidden",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <div style={{
          width: `${Math.min(100, ((pos + 1) / total) * 100)}%`,
          height: "100%",
          background: review
            ? "linear-gradient(90deg, #FF9500, #FFCC02)"
            : `linear-gradient(90deg, ${color}, ${color}CC)`,
          borderRadius: "var(--radius-pill)",
          transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ textAlign: "center", fontSize: 14, color: review ? "#FF9500" : "var(--text-light)", fontWeight: 700, marginTop: 6 }}>
        {review ? `🔁 ふくしゅう ${pos + 1} / ${total}` : `${pos + 1} / ${total}`}
      </div>
    </div>
  );
}

// ─── 国旗 (よめないときは えもじに きりかえ) ────────────────────────────────
export function FlagImage({ code, size = "large" }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [code]);
  if (failed) {
    return (
      <div style={{
        fontSize: size === "large" ? 110 : 40,
        textAlign: "center",
        lineHeight: 1.2,
      }}>
        {flagEmoji(code)}
      </div>
    );
  }
  return (
    <div style={{
      width: "100%",
      maxWidth: size === "large" ? 300 : "100%",
      margin: size === "large" ? "0 auto" : 0,
      borderRadius: size === "large" ? 20 : 10,
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      border: "2px solid rgba(83,206,255,0.2)",
      lineHeight: 0,
    }}>
      <img
        src={`https://flagcdn.com/w640/${code}.png`}
        alt={code}
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "auto", display: "block" }}
        draggable={false}
      />
    </div>
  );
}

// ─── オーバーレイ (スタンプ・レベルアップ) ──────────────────────────────────
function OverlayShell({ children, onDone }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.5)", zIndex: 1000,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      onClick={onDone}
    >
      <ConfettiEffect active={true} />
      <div style={{
        background: "white", borderRadius: 32,
        padding: "40px 44px", textAlign: "center",
        boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
        animation: "scaleIn 0.3s ease",
        maxWidth: 340,
      }}>
        {children}
      </div>
    </div>
  );
}

export function NewStampOverlay({ stamp, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <OverlayShell onDone={onDone}>
      <div style={{
        width: 120, height: 120, borderRadius: "50%",
        background: "linear-gradient(135deg, #DFF7FF, #FFF5FA)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <div style={{ fontSize: 72, animation: "celebrateJump 1s ease-in-out infinite" }}>{stamp}</div>
      </div>
      <p style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>
        あたらしい スタンプ！
      </p>
      <p style={{ fontSize: 16, color: "var(--text-light)", fontWeight: 600, margin: 0 }}>
        スタンプちょう に ついかされたよ！
      </p>
    </OverlayShell>
  );
}

export function LevelUpOverlay({ level, subjectLabel, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <OverlayShell onDone={onDone}>
      <div style={{
        width: 120, height: 120, borderRadius: "50%",
        background: "linear-gradient(135deg, #FFF8D6, #FFE0EA)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <div style={{ fontSize: 68, animation: "celebrateJump 1s ease-in-out infinite" }}>🎖️</div>
      </div>
      <p style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>
        レベルアップ！
      </p>
      <p style={{ fontSize: 17, color: "var(--text-light)", fontWeight: 700, margin: 0 }}>
        {subjectLabel} が <span style={{ color: "#FF9500", fontSize: 22 }}>レベル{level}</span> に なったよ！
      </p>
    </OverlayShell>
  );
}
