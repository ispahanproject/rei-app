import { useState, useEffect, useRef, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;
const IMG = {
  family: `${BASE}images/baby-shark-family.png`,
  daddy: `${BASE}images/daddy-shark.png`,
};

// ─── Data ───────────────────────────────────────────────────────────────────
const HIRAGANA = [
  { char: "あ", reading: "a", hint: "🍎 あんぱん" },
  { char: "い", reading: "i", hint: "🐕 いぬ" },
  { char: "う", reading: "u", hint: "🐰 うさぎ" },
  { char: "え", reading: "e", hint: "🖼️ え" },
  { char: "お", reading: "o", hint: "👹 おに" },
  { char: "か", reading: "ka", hint: "🐸 かえる" },
  { char: "き", reading: "ki", hint: "🌳 き" },
  { char: "く", reading: "ku", hint: "🐻 くま" },
  { char: "け", reading: "ke", hint: "🎂 けーき" },
  { char: "こ", reading: "ko", hint: "🐱 こねこ" },
  { char: "さ", reading: "sa", hint: "🐟 さかな" },
  { char: "し", reading: "shi", hint: "🦌 しか" },
  { char: "す", reading: "su", hint: "🍣 すし" },
  { char: "せ", reading: "se", hint: "🦋 せみ" },
  { char: "そ", reading: "so", hint: "🌊 そら" },
];

const KATAKANA = [
  { char: "ア", reading: "a", hint: "🍦 アイス" },
  { char: "イ", reading: "i", hint: "🪑 イス" },
  { char: "ウ", reading: "u", hint: "🎵 ウクレレ" },
  { char: "エ", reading: "e", hint: "🦐 エビ" },
  { char: "オ", reading: "o", hint: "🍊 オレンジ" },
  { char: "カ", reading: "ka", hint: "📷 カメラ" },
  { char: "キ", reading: "ki", hint: "🔑 キー" },
  { char: "ク", reading: "ku", hint: "🚗 クルマ" },
  { char: "ケ", reading: "ke", hint: "🎂 ケーキ" },
  { char: "コ", reading: "ko", hint: "☕ コーヒー" },
];

const NUMBERS_DATA = {
  counting: [
    { num: 1, word: "いち", emoji: "🍎" },
    { num: 2, word: "に", emoji: "🍊" },
    { num: 3, word: "さん", emoji: "🍋" },
    { num: 4, word: "よん", emoji: "🍏" },
    { num: 5, word: "ご", emoji: "🫐" },
    { num: 6, word: "ろく", emoji: "🍇" },
    { num: 7, word: "なな", emoji: "🍓" },
    { num: 8, word: "はち", emoji: "🍑" },
    { num: 9, word: "きゅう", emoji: "🍒" },
    { num: 10, word: "じゅう", emoji: "🥝" },
  ],
};

const ENGLISH_DATA = {
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  words: [
    { word: "Apple", ja: "りんご", emoji: "🍎" },
    { word: "Bear", ja: "くま", emoji: "🐻" },
    { word: "Cat", ja: "ねこ", emoji: "🐱" },
    { word: "Dog", ja: "いぬ", emoji: "🐕" },
    { word: "Egg", ja: "たまご", emoji: "🥚" },
    { word: "Fish", ja: "さかな", emoji: "🐟" },
    { word: "Grape", ja: "ぶどう", emoji: "🍇" },
    { word: "Hat", ja: "ぼうし", emoji: "🎩" },
    { word: "Ice", ja: "こおり", emoji: "🧊" },
    { word: "Juice", ja: "ジュース", emoji: "🧃" },
  ],
};

const COLORS_SHAPES = {
  colors: [
    { name: "あか", en: "Red", hex: "#EF4444", emoji: "🔴" },
    { name: "あお", en: "Blue", hex: "#3B82F6", emoji: "🔵" },
    { name: "きいろ", en: "Yellow", hex: "#EAB308", emoji: "🟡" },
    { name: "みどり", en: "Green", hex: "#22C55E", emoji: "🟢" },
    { name: "オレンジ", en: "Orange", hex: "#F97316", emoji: "🟠" },
    { name: "むらさき", en: "Purple", hex: "#A855F7", emoji: "🟣" },
    { name: "ピンク", en: "Pink", hex: "#EC4899", emoji: "💗" },
    { name: "しろ", en: "White", hex: "#F8FAFC", emoji: "⚪" },
  ],
  shapes: [
    { name: "まる", en: "Circle", emoji: "⭕" },
    { name: "さんかく", en: "Triangle", emoji: "🔺" },
    { name: "しかく", en: "Square", emoji: "🟦" },
    { name: "ほし", en: "Star", emoji: "⭐" },
    { name: "ハート", en: "Heart", emoji: "❤️" },
    { name: "ダイヤ", en: "Diamond", emoji: "🔷" },
  ],
};

const FLAGS_DATA = [
  // アジア
  { code: "jp", name: "にほん", en: "Japan", hint: "わたしたちの くに！" },
  { code: "kr", name: "かんこく", en: "Korea", hint: "たいきょくき" },
  { code: "cn", name: "ちゅうごく", en: "China", hint: "おおきい あかい ほし" },
  { code: "in", name: "インド", en: "India", hint: "まんなかに くるくる" },
  { code: "th", name: "タイ", en: "Thailand", hint: "あか・しろ・あお" },
  { code: "vn", name: "ベトナム", en: "Vietnam", hint: "あかに きいろい ほし" },
  { code: "id", name: "インドネシア", en: "Indonesia", hint: "あかと しろ" },
  { code: "ph", name: "フィリピン", en: "Philippines", hint: "おひさまが いる" },
  { code: "my", name: "マレーシア", en: "Malaysia", hint: "おつきさまと ほし" },
  { code: "sg", name: "シンガポール", en: "Singapore", hint: "マーライオンの くに" },
  { code: "tw", name: "たいわん", en: "Taiwan", hint: "おひさまの マーク" },
  // ちゅうとう
  { code: "tr", name: "トルコ", en: "Turkey", hint: "おつきさまと ほし" },
  { code: "sa", name: "サウジアラビア", en: "Saudi Arabia", hint: "みどりに しろい もじ" },
  { code: "ae", name: "アラブしゅちょうこく", en: "UAE", hint: "ドバイが ある くに" },
  // ヨーロッパ
  { code: "gb", name: "イギリス", en: "UK", hint: "ユニオンジャック" },
  { code: "fr", name: "フランス", en: "France", hint: "あお・しろ・あか" },
  { code: "de", name: "ドイツ", en: "Germany", hint: "くろ・あか・きいろ" },
  { code: "it", name: "イタリア", en: "Italy", hint: "みどり・しろ・あか" },
  { code: "es", name: "スペイン", en: "Spain", hint: "あか と きいろ" },
  { code: "pt", name: "ポルトガル", en: "Portugal", hint: "みどりと あか" },
  { code: "nl", name: "オランダ", en: "Netherlands", hint: "あか・しろ・あお よこしま" },
  { code: "be", name: "ベルギー", en: "Belgium", hint: "チョコレートの くに" },
  { code: "ch", name: "スイス", en: "Switzerland", hint: "あかに しろい じゅうじ" },
  { code: "at", name: "オーストリア", en: "Austria", hint: "あか・しろ・あか" },
  { code: "se", name: "スウェーデン", en: "Sweden", hint: "きいろい じゅうじ" },
  { code: "no", name: "ノルウェー", en: "Norway", hint: "あか・あお・しろ じゅうじ" },
  { code: "fi", name: "フィンランド", en: "Finland", hint: "しろに あおい じゅうじ" },
  { code: "dk", name: "デンマーク", en: "Denmark", hint: "あかに しろい じゅうじ" },
  { code: "gr", name: "ギリシャ", en: "Greece", hint: "あおと しろの しましま" },
  { code: "pl", name: "ポーランド", en: "Poland", hint: "しろと あか" },
  { code: "ua", name: "ウクライナ", en: "Ukraine", hint: "あおと きいろ" },
  { code: "ru", name: "ロシア", en: "Russia", hint: "いちばん おおきい くに" },
  // きたアメリカ
  { code: "us", name: "アメリカ", en: "USA", hint: "ほしと しましま" },
  { code: "ca", name: "カナダ", en: "Canada", hint: "まんなかに はっぱ" },
  { code: "mx", name: "メキシコ", en: "Mexico", hint: "まんなかに わし" },
  { code: "cu", name: "キューバ", en: "Cuba", hint: "あおい しましまと ほし" },
  { code: "jm", name: "ジャマイカ", en: "Jamaica", hint: "みどりと きいろの ×" },
  // みなみアメリカ
  { code: "br", name: "ブラジル", en: "Brazil", hint: "サッカーが つよい！" },
  { code: "ar", name: "アルゼンチン", en: "Argentina", hint: "そらいろに おひさま" },
  { code: "co", name: "コロンビア", en: "Colombia", hint: "きいろが おおきい" },
  { code: "pe", name: "ペルー", en: "Peru", hint: "あか・しろ・あか たてしま" },
  { code: "cl", name: "チリ", en: "Chile", hint: "しろ・あかに ほし" },
  // オセアニア
  { code: "au", name: "オーストラリア", en: "Australia", hint: "コアラの くに" },
  { code: "nz", name: "ニュージーランド", en: "New Zealand", hint: "ひつじが いっぱい" },
  // アフリカ
  { code: "eg", name: "エジプト", en: "Egypt", hint: "ピラミッドの くに" },
  { code: "za", name: "みなみアフリカ", en: "South Africa", hint: "にじいろの はた" },
  { code: "ke", name: "ケニア", en: "Kenya", hint: "ライオンの くに" },
  { code: "ng", name: "ナイジェリア", en: "Nigeria", hint: "みどり・しろ・みどり" },
  { code: "gh", name: "ガーナ", en: "Ghana", hint: "あか・きいろ・みどりに ほし" },
  { code: "ma", name: "モロッコ", en: "Morocco", hint: "あかに みどりの ほし" },
];


function FlagImage({ code, size = "large" }) {
  return (
    <div style={{
      width: size === "large" ? "100%" : "100%",
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
        style={{ width: "100%", height: "auto", display: "block" }}
        draggable={false}
      />
    </div>
  );
}

const SUBJECTS = [
  { id: "hiragana", label: "ひらがな", icon: "あ", color: "#FF4B78", bg: "#FFF5FA" },
  { id: "katakana", label: "カタカナ", icon: "ア", color: "#53CEFF", bg: "#DFF7FF" },
  { id: "numbers", label: "すうじ", icon: "123", color: "#4CD964", bg: "#E0FFE8" },
  { id: "english", label: "えいご", icon: "ABC", color: "#FFCC02", bg: "#FFF8D6" },
  { id: "colors", label: "いろ・かたち", icon: "🎨", color: "#FF9500", bg: "#FFF3EB" },
  { id: "flags", label: "こっき", icon: "🏁", color: "#A659FF", bg: "#F0E0FF" },
];

const GAME_MODES = [
  { id: "quiz", label: "クイズ", icon: "❓", desc: "せいかいをえらぼう！" },
  { id: "trace", label: "なぞりがき", icon: "✏️", desc: "ゆびでなぞろう！" },
  { id: "matching", label: "マッチング", icon: "🃏", desc: "おなじものをみつけよう！" },
];

const STAMPS = [
  "🦈", "🐟", "🐠", "🐡", "🦀", "🐙", "🦑", "🐚",
  "🐬", "🐳", "🐋", "🦭", "🐢", "🦞", "🌊", "⚓",
  "🏖️", "🐠", "🌴", "🐚", "⭐", "🦈", "🐡", "🐬",
  "🏝️", "🧜", "🦐", "🐳", "🌟", "🐟",
];

// ─── Utility ────────────────────────────────────────────────────────────────
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const pick = (arr, n) => shuffle(arr).slice(0, n);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// BebeFin accent colors for rotating borders etc.
const BF_COLORS = ["#53CEFF", "#FF4B78", "#A659FF", "#FFCC02", "#4CD964"];

// ─── Styles (BebeFin) ──────────────────────────────────────────────────────
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;700;800;900&family=Fredoka:wght@400;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

  :root {
    --bg: #EBFDFF;
    --bg-pink: #FFF5FA;
    --card: #FFFFFF;
    --text: #2D3436;
    --text-light: #8395A7;
    --cyan: #53CEFF;
    --cyan-light: #DFF7FF;
    --pink: #FF4B78;
    --pink-light: #FFE0EA;
    --purple: #A659FF;
    --purple-light: #F0E0FF;
    --green: #4CD964;
    --green-light: #E0FFE8;
    --yellow: #FFCC02;
    --yellow-light: #FFF8D6;
    --orange: #FF9500;
    --coral: #FF4B78;
    --ocean: #53CEFF;
    --red: #FF4B78;
    --blue: #53CEFF;
    --shadow: 0 4px 16px rgba(83,206,255,0.12);
    --shadow-lg: 0 8px 32px rgba(83,206,255,0.18);
    --shadow-card: 0 2px 12px rgba(0,0,0,0.06);
    --radius: 28px;
    --radius-sm: 20px;
    --radius-pill: 50px;
  }

  body {
    font-family: 'M PLUS Rounded 1c', 'Fredoka', sans-serif;
    background: #EBFDFF;
    background-attachment: fixed;
    color: var(--text);
    overflow-x: hidden;
    min-height: 100vh;
  }

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
  @keyframes starBurst {
    0% { transform: scale(0) rotate(0deg); opacity: 1; }
    50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
    100% { transform: scale(0) rotate(360deg); opacity: 0; }
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
  @keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 0.08; }
    50% { opacity: 0.12; }
    100% { transform: translateY(-100vh) scale(1.1); opacity: 0; }
  }
`;

// ─── Components ─────────────────────────────────────────────────────────────

function SoftBackground() {
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: randInt(20, 60),
    left: randInt(0, 100),
    top: randInt(0, 100),
    delay: Math.random() * 15,
    dur: randInt(18, 35),
    color: BF_COLORS[i % 5],
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {items.map((b) => (
        <div
          key={b.id}
          style={{
            position: "absolute",
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: b.color,
            opacity: 0.06,
            left: `${b.left}%`,
            top: `${b.top}%`,
            animation: `floatUp ${b.dur}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ConfettiEffect({ active }) {
  if (!active) return null;
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    emoji: ["⭐", "✨", "🌟", "💖", "🎉", "⭐"][i % 6],
    left: randInt(5, 95),
    delay: Math.random() * 0.6,
    size: randInt(18, 32),
  }));
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

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "おはよう";
  if (h >= 12 && h < 17) return "こんにちは";
  return "こんばんは";
}

// ─── BebeFin Navigation ────────────────────────────────────────────────────

function BottomNav({ screen, onHome, onStamps, stars }) {
  const isHome = screen === "home";
  const isStamps = screen === "stamps";

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(16px)",
      borderTop: "1px solid rgba(83,206,255,0.15)",
      padding: "8px 0 env(safe-area-inset-bottom, 8px) 0",
      display: "flex",
      justifyContent: "center",
      gap: 48,
    }}>
      <button onClick={onHome} style={{
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
          transition: "all 0.2s ease",
        }}>
          🏠
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: isHome ? "#53CEFF" : "#8395A7",
        }}>ホーム</span>
      </button>

      <button onClick={onStamps} style={{
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
          transition: "all 0.2s ease",
        }}>
          ⭐
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: isStamps ? "#FFCC02" : "#8395A7",
        }}>{stars} ⭐</span>
      </button>
    </div>
  );
}

function InnerTopBar({ onBack, title }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      padding: "16px 16px 12px",
      gap: 12,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "white",
          border: "2px solid rgba(83,206,255,0.2)",
          fontSize: 20,
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          fontFamily: "inherit",
        }}>
          ←
        </button>
      )}
      <span style={{ fontSize: 22, fontWeight: 800, color: "var(--text)" }}>
        {title}
      </span>
    </div>
  );
}

function BigButton({ children, onClick, color, bg, style: s, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg || "white",
        border: "none",
        borderRadius: "var(--radius-pill)",
        padding: "18px 28px",
        fontSize: 20,
        fontWeight: 800,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.15s ease",
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

// ─── Home Screen ────────────────────────────────────────────────────────────
function HomeScreen({ onSelect }) {
  return (
    <div>
      {/* BebeFin-style Hero */}
      <div style={{
        textAlign: "center",
        padding: "32px 16px 28px",
        background: "linear-gradient(180deg, #DFF7FF 0%, #EBFDFF 100%)",
        borderRadius: "0 0 40px 40px",
        marginBottom: 24,
      }}>
        <div style={{ animation: "bounce 3s ease-in-out infinite", display: "inline-block" }}>
          <img
            src={IMG.family}
            alt="Baby Shark"
            style={{ width: 200, height: "auto", pointerEvents: "none" }}
            draggable={false}
          />
        </div>
        {/* Greeting pill */}
        <div style={{
          marginTop: 16,
          display: "inline-block",
          background: "white",
          borderRadius: "var(--radius-pill)",
          padding: "12px 28px",
          boxShadow: "var(--shadow-card)",
        }}>
          <p style={{
            fontSize: 22,
            fontWeight: 900,
            color: "var(--text)",
            margin: 0,
          }}>
            {getGreeting()}、<span style={{
              color: "#53CEFF",
              background: "#DFF7FF",
              padding: "2px 10px",
              borderRadius: 10,
            }}>れいくん</span>！
          </p>
        </div>
        <p style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--text-light)",
          marginTop: 10,
        }}>
          きょうは なにを べんきょう する？
        </p>
      </div>

      {/* Subject Cards */}
      <div style={{ padding: "0 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
        {SUBJECTS.map((sub, i) => (
          <button
            key={sub.id}
            onClick={() => onSelect(sub.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "22px 24px",
              background: "white",
              border: "none",
              borderLeft: `5px solid ${sub.color}`,
              borderRadius: "var(--radius)",
              cursor: "pointer",
              animation: `scaleIn 0.3s ease ${i * 0.06}s both`,
              boxShadow: "var(--shadow-card)",
              fontFamily: "inherit",
              textAlign: "left",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "var(--shadow-lg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "var(--shadow-card)";
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: sub.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: sub.icon.length > 2 ? 24 : 34,
              fontWeight: 900,
              color: sub.color,
              flexShrink: 0,
            }}>
              {sub.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)" }}>
                {sub.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-light)", marginTop: 4, fontWeight: 600 }}>
                タップして はじめよう！
              </div>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: sub.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: sub.color,
              fontWeight: 700,
            }}>
              →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Subject Home ───────────────────────────────────────────────────────────
function SubjectHome({ subject, onBack, onSelectMode }) {
  const sub = SUBJECTS.find((s) => s.id === subject);
  const modes = (subject === "colors" || subject === "flags")
    ? GAME_MODES.filter((m) => m.id !== "trace")
    : GAME_MODES;

  return (
    <div>
      <InnerTopBar title={sub.label} onBack={onBack} />
      <div style={{ padding: "16px 16px 100px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 36,
            background: sub.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: sub.icon.length > 2 ? 42 : 56,
            fontWeight: 900,
            color: sub.color,
            margin: "0 auto 24px",
            animation: "wiggle 2s ease-in-out infinite",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {sub.icon}
        </div>

        <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 32, color: "var(--text-light)" }}>
          あそびかた を えらんでね！
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {modes.map((mode, i) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 24px",
                background: "white",
                border: "none",
                borderRadius: "var(--radius)",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                boxShadow: "var(--shadow-card)",
                animation: `scaleIn 0.3s ease ${i * 0.08}s both`,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "var(--shadow-card)";
              }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: `${sub.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32,
              }}>
                {mode.icon}
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text)" }}>{mode.label}</div>
                <div style={{ fontSize: 14, color: "var(--text-light)", fontWeight: 600 }}>{mode.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Mode ──────────────────────────────────────────────────────────────
function QuizGame({ subject, onBack, onEarnStar }) {
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const TOTAL = 5;

  useEffect(() => {
    const qs = generateQuiz(subject, TOTAL);
    setQuestions(qs);
  }, [subject]);

  const q = questions[qIndex];

  const handleAnswer = (ans) => {
    if (selected !== null) return;
    setSelected(ans);
    const correct = ans === q.answer;
    if (correct) {
      setScore((s) => s + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    setTimeout(() => {
      if (qIndex + 1 >= TOTAL) {
        const earned = score + (correct ? 1 : 0);
        onEarnStar(earned);
        setFinished(true);
      } else {
        setQIndex((i) => i + 1);
        setSelected(null);
      }
    }, 1200);
  };

  if (!q) return null;

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={TOTAL}
        onBack={onBack}
        onRetry={() => {
          setQuestions(generateQuiz(subject, TOTAL));
          setQIndex(0);
          setScore(0);
          setSelected(null);
          setFinished(false);
        }}
      />
    );
  }

  const sub = SUBJECTS.find((s) => s.id === subject);

  return (
    <div>
      <InnerTopBar title={`${sub.label} クイズ`} onBack={onBack} />
      <ConfettiEffect active={showConfetti} />
      <div style={{ padding: "8px 16px 100px", maxWidth: 500, margin: "0 auto" }}>
        {/* BebeFin Progress Bar */}
        <div style={{
          background: "#F0F0F0",
          borderRadius: "var(--radius-pill)",
          height: 12,
          marginBottom: 8,
          overflow: "hidden",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
        }}>
          <div style={{
            width: `${(qIndex / TOTAL) * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${sub.color}, ${sub.color}CC)`,
            borderRadius: "var(--radius-pill)",
            transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-light)", fontWeight: 700, marginBottom: 16 }}>
          {qIndex + 1} / {TOTAL}
        </div>

        {/* Question Card */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--radius)",
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "var(--shadow-card)",
            marginBottom: 20,
            animation: "popIn 0.3s ease",
          }}
          key={qIndex}
        >
          {q.flagCode && (
            <div style={{ marginBottom: 16, animation: "popIn 0.4s ease" }}>
              <FlagImage code={q.flagCode} size="large" />
            </div>
          )}
          {q.display && !q.flagCode && (
            <div style={{ fontSize: 72, marginBottom: 12, animation: "float 2s ease-in-out infinite" }}>
              {q.display}
            </div>
          )}
          <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.6 }}>{q.question}</div>
          {q.hint && selected !== null && (
            <div style={{ fontSize: 14, color: "var(--text-light)", marginTop: 8 }}>
              💡 {q.hint}
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.answer;
            const isSelected = selected === opt;
            let bg = "white";
            if (selected !== null) {
              if (isCorrect) bg = "#E0FFE8";
              else if (isSelected) bg = "#FFE0EA";
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                style={{
                  padding: "22px 16px",
                  background: bg,
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  fontSize: opt.length <= 2 ? 40 : 22,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  cursor: selected !== null ? "default" : "pointer",
                  boxShadow: selected !== null && isCorrect
                    ? "0 4px 16px rgba(76,217,100,0.3)"
                    : "var(--shadow-card)",
                  transition: "all 0.2s ease",
                  animation: selected !== null && isSelected && !isCorrect ? "shake 0.4s ease" :
                             selected !== null && isCorrect ? "pulse 0.4s ease" : "none",
                  minHeight: 72,
                }}
              >
                {opt}
                {selected !== null && isCorrect && <span style={{ marginLeft: 8 }}>✅</span>}
                {selected !== null && isSelected && !isCorrect && <span style={{ marginLeft: 8 }}>❌</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateQuiz(subject, count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    switch (subject) {
      case "hiragana": {
        const item = HIRAGANA[randInt(0, HIRAGANA.length - 1)];
        const others = pick(HIRAGANA.filter((h) => h.char !== item.char), 3);
        const type = randInt(0, 1);
        if (type === 0) {
          const emoji = item.hint.split(" ")[0];
          const word = item.hint.split(" ")[1];
          qs.push({
            display: emoji,
            question: `「${word}」の さいしょの もじは？`,
            options: shuffle([item.char, ...others.map((h) => h.char)]),
            answer: item.char,
          });
        } else {
          qs.push({
            display: item.char,
            question: `「${item.char}」から はじまるのは？`,
            options: shuffle([item.hint, ...others.map((h) => h.hint)]),
            answer: item.hint,
          });
        }
        break;
      }
      case "katakana": {
        const item = KATAKANA[randInt(0, KATAKANA.length - 1)];
        const others = pick(KATAKANA.filter((k) => k.char !== item.char), 3);
        const type = randInt(0, 1);
        if (type === 0) {
          const emoji = item.hint.split(" ")[0];
          const word = item.hint.split(" ")[1];
          qs.push({
            display: emoji,
            question: `「${word}」の さいしょの もじは？`,
            options: shuffle([item.char, ...others.map((k) => k.char)]),
            answer: item.char,
          });
        } else {
          qs.push({
            display: item.char,
            question: `「${item.char}」から はじまるのは？`,
            options: shuffle([item.hint, ...others.map((k) => k.hint)]),
            answer: item.hint,
          });
        }
        break;
      }
      case "numbers": {
        const type = randInt(0, 2);
        if (type === 0) {
          const num = randInt(1, 10);
          const item = NUMBERS_DATA.counting[num - 1];
          qs.push({
            display: item.emoji.repeat(num > 5 ? 5 : num) + (num > 5 ? `+${num - 5}` : ""),
            question: `${item.emoji} は いくつ？`,
            options: shuffle([String(num), ...pick(NUMBERS_DATA.counting.filter((n) => n.num !== num), 3).map((n) => String(n.num))]),
            answer: String(num),
          });
        } else if (type === 1) {
          const a = randInt(1, 5), b = randInt(1, 5);
          const ans = a + b;
          const opts = new Set([ans]);
          while (opts.size < 4) opts.add(randInt(2, 10));
          qs.push({
            display: `${a} + ${b}`,
            question: `${a} たす ${b} は？`,
            options: shuffle([...opts].map(String)),
            answer: String(ans),
          });
        } else {
          const b = randInt(1, 5), a = b + randInt(1, 4);
          const ans = a - b;
          const opts = new Set([ans]);
          while (opts.size < 4) opts.add(randInt(0, 9));
          qs.push({
            display: `${a} − ${b}`,
            question: `${a} ひく ${b} は？`,
            options: shuffle([...opts].map(String)),
            answer: String(ans),
          });
        }
        break;
      }
      case "english": {
        const type = randInt(0, 1);
        if (type === 0) {
          const item = ENGLISH_DATA.words[randInt(0, ENGLISH_DATA.words.length - 1)];
          const others = pick(ENGLISH_DATA.words.filter((w) => w.word !== item.word), 3).map((w) => w.word);
          qs.push({
            display: item.emoji,
            question: `「${item.ja}」を えいご で いうと？`,
            options: shuffle([item.word, ...others]),
            answer: item.word,
          });
        } else {
          const letter = ENGLISH_DATA.alphabet[randInt(0, 25)];
          const others = pick(ENGLISH_DATA.alphabet.filter((l) => l !== letter), 3);
          qs.push({
            display: letter,
            question: `この もじ は？`,
            options: shuffle([letter, ...others]),
            answer: letter,
          });
        }
        break;
      }
      case "colors": {
        const type = randInt(0, 1);
        if (type === 0) {
          const item = COLORS_SHAPES.colors[randInt(0, COLORS_SHAPES.colors.length - 1)];
          const others = pick(COLORS_SHAPES.colors.filter((c) => c.name !== item.name), 3).map((c) => c.name);
          qs.push({
            display: (
              <div style={{ width: 80, height: 80, borderRadius: 24, background: item.hex, margin: "0 auto", boxShadow: "var(--shadow-card)" }} />
            ),
            question: "この いろ は なに？",
            options: shuffle([item.name, ...others]),
            answer: item.name,
          });
        } else {
          const item = COLORS_SHAPES.shapes[randInt(0, COLORS_SHAPES.shapes.length - 1)];
          const others = pick(COLORS_SHAPES.shapes.filter((s) => s.name !== item.name), 3).map((s) => s.name);
          qs.push({
            display: item.emoji,
            question: "この かたち は なに？",
            options: shuffle([item.name, ...others]),
            answer: item.name,
          });
        }
        break;
      }
      case "flags": {
        const item = FLAGS_DATA[randInt(0, FLAGS_DATA.length - 1)];
        const others = pick(FLAGS_DATA.filter((f) => f.name !== item.name), 3).map((f) => f.name);
        qs.push({
          flagCode: item.code,
          question: "この こっき は どこの くに？",
          options: shuffle([item.name, ...others]),
          answer: item.name,
          hint: item.hint,
        });
        break;
      }
    }
  }
  return qs;
}

// ─── Trace Mode ─────────────────────────────────────────────────────────────
function TraceGame({ subject, onBack, onEarnStar }) {
  const [items, setItems] = useState([]);
  const [itemIndex, setItemIndex] = useState(0);
  const [drawing, setDrawing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const TOTAL = 5;

  useEffect(() => {
    let pool;
    switch (subject) {
      case "hiragana": pool = HIRAGANA; break;
      case "katakana": pool = KATAKANA; break;
      case "numbers": pool = NUMBERS_DATA.counting.map((n) => ({ char: String(n.num), reading: n.word, hint: n.emoji })); break;
      case "english": pool = ENGLISH_DATA.alphabet.slice(0, 15).map((l) => ({ char: l, reading: l, hint: "" })); break;
      default: pool = HIRAGANA;
    }
    setItems(pick(pool, TOTAL));
  }, [subject]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    resetCanvas(ctx, canvas, items[itemIndex]?.char);
  }, [itemIndex, items]);

  const resetCanvas = (ctx, canvas, char) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Grid
    ctx.strokeStyle = "rgba(83,206,255,0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(rect.width / 2, 0);
    ctx.lineTo(rect.width / 2, rect.height);
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Guide character
    if (char) {
      ctx.fillStyle = "rgba(83, 206, 255, 0.12)";
      ctx.font = `bold ${Math.min(rect.width, rect.height) * 0.65}px 'M PLUS Rounded 1c', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, rect.width / 2, rect.height / 2);
    }

    // Drawing settings
    ctx.strokeStyle = "#53CEFF";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setDrawing(true);
    const { x, y } = getPos(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };
  const draw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const { x, y } = getPos(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };
  const endDraw = (e) => {
    e.preventDefault();
    setDrawing(false);
  };

  const handleNext = () => {
    setScore((s) => s + 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1200);
    setTimeout(() => {
      if (itemIndex + 1 >= TOTAL) {
        onEarnStar(TOTAL);
        setFinished(true);
      } else {
        setItemIndex((i) => i + 1);
      }
    }, 800);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    resetCanvas(ctxRef.current, canvas, items[itemIndex]?.char);
  };

  if (finished) {
    return (
      <ResultScreen
        score={score}
        total={TOTAL}
        onBack={onBack}
        onRetry={() => {
          let pool;
          switch (subject) {
            case "hiragana": pool = HIRAGANA; break;
            case "katakana": pool = KATAKANA; break;
            case "numbers": pool = NUMBERS_DATA.counting.map((n) => ({ char: String(n.num), reading: n.word, hint: n.emoji })); break;
            case "english": pool = ENGLISH_DATA.alphabet.slice(0, 15).map((l) => ({ char: l, reading: l, hint: "" })); break;
            default: pool = HIRAGANA;
          }
          setItems(pick(pool, TOTAL));
          setItemIndex(0);
          setScore(0);
          setFinished(false);
        }}
      />
    );
  }

  const item = items[itemIndex];
  if (!item) return null;
  const sub = SUBJECTS.find((s) => s.id === subject);

  return (
    <div>
      <InnerTopBar title={`${sub.label} なぞりがき`} onBack={onBack} />
      <ConfettiEffect active={showConfetti} />
      <div style={{ padding: "8px 16px 100px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        {/* Progress */}
        <div style={{
          background: "#F0F0F0",
          borderRadius: "var(--radius-pill)",
          height: 12,
          marginBottom: 16,
          overflow: "hidden",
        }}>
          <div style={{
            width: `${(itemIndex / TOTAL) * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${sub.color}, ${sub.color}CC)`,
            borderRadius: "var(--radius-pill)",
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: sub.color }}>{item.char}</span>
          <span style={{ fontSize: 18, color: "var(--text-light)", marginLeft: 12 }}>
            {item.hint || item.reading}
          </span>
        </div>
        <p style={{ fontSize: 16, color: "var(--text-light)", marginBottom: 12, fontWeight: 600 }}>
          ゆびで なぞって みよう！
        </p>

        {/* Canvas */}
        <div
          style={{
            borderRadius: "var(--radius)",
            overflow: "hidden",
            boxShadow: "var(--shadow-card)",
            border: "2px solid rgba(83,206,255,0.2)",
            touchAction: "none",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: 300, display: "block", cursor: "crosshair" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: "16px",
              background: "#F5F5F5",
              border: "none",
              borderRadius: "var(--radius-pill)",
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            🔄 けす
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 1,
              padding: "16px",
              background: `linear-gradient(135deg, ${sub.color}, ${sub.color}DD)`,
              border: "none",
              borderRadius: "var(--radius-pill)",
              fontSize: 18,
              fontWeight: 800,
              fontFamily: "inherit",
              color: "white",
              cursor: "pointer",
              boxShadow: `0 4px 16px ${sub.color}40`,
            }}
          >
            ✅ つぎへ
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Matching Game ──────────────────────────────────────────────────────────
function MatchingGame({ subject, onBack, onEarnStar }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const pairs = generateMatchPairs(subject, 6);
    setCards(shuffle(pairs));
  }, [subject]);

  const handleFlip = (index) => {
    if (flipped.length === 2) return;
    if (flipped.includes(index)) return;
    if (matched.includes(cards[index]?.pairId)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].pairId === cards[b].pairId) {
        setMatched((m) => [...m, cards[a].pairId]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1000);
        setTimeout(() => setFlipped([]), 400);

        if (matched.length + 1 === cards.length / 2) {
          setTimeout(() => {
            onEarnStar(3);
            setFinished(true);
          }, 800);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  if (finished) {
    return (
      <ResultScreen
        score={cards.length / 2}
        total={cards.length / 2}
        onBack={onBack}
        subtitle={`${moves} かいで クリア！`}
        onRetry={() => {
          const pairs = generateMatchPairs(subject, 6);
          setCards(shuffle(pairs));
          setFlipped([]);
          setMatched([]);
          setMoves(0);
          setFinished(false);
        }}
      />
    );
  }

  const sub = SUBJECTS.find((s) => s.id === subject);

  return (
    <div>
      <InnerTopBar title={`${sub.label} マッチング`} onBack={onBack} />
      <ConfettiEffect active={showConfetti} />
      <div style={{ padding: "8px 16px 100px", maxWidth: 500, margin: "0 auto" }}>
        {/* Status pill */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            display: "inline-flex",
            gap: 16,
            background: "white",
            borderRadius: "var(--radius-pill)",
            padding: "10px 24px",
            boxShadow: "var(--shadow-card)",
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#53CEFF" }}>
              のこり {cards.length / 2 - matched.length} ペア
            </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#FF4B78" }}>
              {moves} かい
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {cards.map((card, i) => {
            const isFlipped = flipped.includes(i);
            const isMatched = matched.includes(card.pairId);
            return (
              <button
                key={i}
                onClick={() => handleFlip(i)}
                style={{
                  aspectRatio: "1",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: isMatched
                    ? "#E0FFE8"
                    : isFlipped
                    ? "white"
                    : `linear-gradient(135deg, ${sub.color}25, ${sub.color}45)`,
                  fontSize: isFlipped || isMatched ? (typeof card.face === "string" && !card.isFlag && card.face.length <= 2 ? 36 : 18) : 28,
                  fontWeight: 800,
                  fontFamily: "inherit",
                  cursor: isMatched ? "default" : "pointer",
                  boxShadow: "var(--shadow-card)",
                  transition: "all 0.3s ease",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: card.isFlag && (isFlipped || isMatched) ? 6 : 0,
                  overflow: "hidden",
                  opacity: isMatched ? 0.5 : 1,
                }}
              >
                {isFlipped || isMatched
                  ? card.isFlag
                    ? <FlagImage code={card.face} size="small" />
                    : card.face
                  : "🦈"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function generateMatchPairs(subject, pairCount) {
  let items;
  switch (subject) {
    case "hiragana":
      items = pick(HIRAGANA, pairCount).map((h) => ({
        a: { face: h.char, pairId: h.char },
        b: { face: h.reading, pairId: h.char },
      }));
      break;
    case "katakana":
      items = pick(KATAKANA, pairCount).map((k) => ({
        a: { face: k.char, pairId: k.char },
        b: { face: k.reading, pairId: k.char },
      }));
      break;
    case "numbers":
      items = pick(NUMBERS_DATA.counting, pairCount).map((n) => ({
        a: { face: String(n.num), pairId: String(n.num) },
        b: { face: n.emoji, pairId: String(n.num) },
      }));
      break;
    case "english":
      items = pick(ENGLISH_DATA.words, pairCount).map((w) => ({
        a: { face: w.emoji, pairId: w.word },
        b: { face: w.word, pairId: w.word },
      }));
      break;
    case "colors": {
      const cItems = pick(COLORS_SHAPES.colors, Math.min(pairCount, 4)).map((c) => ({
        a: { face: c.emoji, pairId: c.name },
        b: { face: c.name, pairId: c.name },
      }));
      const sItems = pick(COLORS_SHAPES.shapes, pairCount - cItems.length).map((s) => ({
        a: { face: s.emoji, pairId: s.name },
        b: { face: s.name, pairId: s.name },
      }));
      items = [...cItems, ...sItems];
      break;
    }
    case "flags":
      items = pick(FLAGS_DATA, pairCount).map((f) => ({
        a: { face: f.code, pairId: f.name, isFlag: true },
        b: { face: f.name, pairId: f.name },
      }));
      break;
    default:
      items = [];
  }
  return items.flatMap((i) => [i.a, i.b]);
}

// ─── Result Screen ──────────────────────────────────────────────────────────
function ResultScreen({ score, total, onBack, onRetry, subtitle }) {
  const pct = score / total;
  const msg = pct >= 1 ? "カンペキ！" : pct >= 0.6 ? "すごい！" : "がんばったね！";
  const emoji = pct >= 1 ? "🎉" : pct >= 0.6 ? "⭐" : "💪";

  return (
    <div>
      <InnerTopBar title="けっか" onBack={onBack} />
      <div style={{
        padding: "40px 16px 120px",
        maxWidth: 500,
        margin: "0 auto",
        textAlign: "center",
      }}>
        {/* Character */}
        <div style={{
          animation: pct >= 1 ? "celebrateJump 1.5s ease-in-out infinite" : "bounce 3s ease-in-out infinite",
          display: "inline-block",
        }}>
          <img
            src={pct >= 1 ? IMG.family : IMG.daddy}
            alt="result"
            style={{ width: pct >= 1 ? 160 : 120, height: "auto" }}
            draggable={false}
          />
        </div>

        {/* Emoji */}
        <div style={{ fontSize: 48, marginTop: 12 }}>{emoji}</div>

        {/* Message pill */}
        <div style={{
          display: "inline-block",
          background: pct >= 1 ? "#DFF7FF" : pct >= 0.6 ? "#FFF8D6" : "#FFF5FA",
          borderRadius: "var(--radius-pill)",
          padding: "8px 28px",
          marginTop: 16,
        }}>
          <h2 style={{ fontSize: 32, fontWeight: 900, margin: 0, color: "var(--text)" }}>{msg}</h2>
        </div>

        {subtitle && <p style={{ fontSize: 18, color: "var(--text-light)", marginTop: 12, fontWeight: 600 }}>{subtitle}</p>}

        {/* Score */}
        <div style={{
          display: "inline-flex",
          alignItems: "baseline",
          gap: 4,
          margin: "24px 0",
          padding: "16px 40px",
          background: "white",
          borderRadius: "var(--radius-pill)",
          boxShadow: "var(--shadow-card)",
        }}>
          <span style={{ fontSize: 52, fontWeight: 900, color: "#53CEFF" }}>{score}</span>
          <span style={{ fontSize: 22, color: "var(--text-light)", fontWeight: 700 }}> / {total}</span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          <button onClick={onBack} style={{
            flex: 1, padding: "18px",
            background: "#F5F5F5", border: "none",
            borderRadius: "var(--radius-pill)",
            fontSize: 18, fontWeight: 800, fontFamily: "inherit", cursor: "pointer",
          }}>
            🏠 もどる
          </button>
          <button onClick={onRetry} style={{
            flex: 1, padding: "18px",
            background: "linear-gradient(135deg, #53CEFF, #4FB8E8)",
            border: "none",
            borderRadius: "var(--radius-pill)",
            fontSize: 18, fontWeight: 800, fontFamily: "inherit", color: "white", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(83,206,255,0.35)",
          }}>
            🔄 もういちど
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stamps Screen ──────────────────────────────────────────────────────────
function StampsScreen({ onBack, totalStars, stamps }) {
  return (
    <div>
      <InnerTopBar title="スタンプちょう" onBack={onBack} />
      <div style={{ padding: "16px 16px 100px", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ animation: "bounce 3s ease-in-out infinite", display: "inline-block" }}>
            <img src={IMG.daddy} alt="stamps" style={{ width: 80, height: "auto" }} draggable={false} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>
            あつめた スタンプ: <span style={{ color: "#53CEFF" }}>{stamps.length}</span> / {STAMPS.length}
          </p>
          <p style={{ fontSize: 14, color: "var(--text-light)", marginTop: 4, fontWeight: 600 }}>
            ⭐ {Math.max(0, 5 - (totalStars % 5))} こ で つぎの スタンプ！
          </p>
          {/* Progress bar */}
          <div
            style={{
              width: "80%",
              height: 14,
              background: "#F0F0F0",
              borderRadius: "var(--radius-pill)",
              margin: "16px auto 0",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(totalStars % 5) * 20}%`,
                height: "100%",
                background: "linear-gradient(90deg, #53CEFF, #FF4B78)",
                borderRadius: "var(--radius-pill)",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {STAMPS.map((stamp, i) => {
            const unlocked = i < stamps.length;
            return (
              <div
                key={i}
                style={{
                  aspectRatio: "1",
                  borderRadius: 20,
                  background: unlocked ? "white" : "#F5F5F5",
                  border: unlocked ? `2px solid ${BF_COLORS[i % 5]}` : "2px dashed rgba(83,206,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: unlocked ? 32 : 20,
                  boxShadow: unlocked ? "var(--shadow-card)" : "none",
                  animation: unlocked ? `popIn 0.3s ease ${i * 0.03}s both` : "none",
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                {unlocked ? stamp : "🐚"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── New Stamp Animation ────────────────────────────────────────────────────
function NewStampOverlay({ stamp, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
      }}
      onClick={onDone}
    >
      <div style={{
        background: "white",
        borderRadius: 32,
        padding: "40px 48px",
        textAlign: "center",
        boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
        animation: "scaleIn 0.3s ease",
      }}>
        <div style={{
          width: 120, height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #DFF7FF, #FFF5FA)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <div style={{ fontSize: 72, animation: "celebrateJump 1s ease-in-out infinite" }}>
            {stamp}
          </div>
        </div>
        <p style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>
          あたらしい スタンプ！
        </p>
        <p style={{ fontSize: 16, color: "var(--text-light)", fontWeight: 600, margin: 0 }}>
          スタンプちょう に ついかされたよ！
        </p>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [subject, setSubject] = useState(null);
  const [totalStars, setTotalStars] = useState(0);
  const [stamps, setStamps] = useState([]);
  const [newStamp, setNewStamp] = useState(null);

  const earnStar = useCallback(
    (count) => {
      const newTotal = totalStars + count;
      setTotalStars(newTotal);
      const prevStampCount = Math.floor(totalStars / 5);
      const newStampCount = Math.floor(newTotal / 5);
      if (newStampCount > prevStampCount && stamps.length < STAMPS.length) {
        const nextStamp = STAMPS[stamps.length];
        setStamps((s) => [...s, nextStamp]);
        setTimeout(() => setNewStamp(nextStamp), 500);
      }
    },
    [totalStars, stamps]
  );

  const goHome = () => { setSubject(null); setScreen("home"); };
  const goStamps = () => setScreen("stamps");

  let content;
  switch (screen) {
    case "home":
      content = (
        <HomeScreen
          onSelect={(s) => {
            setSubject(s);
            setScreen("subject");
          }}
        />
      );
      break;
    case "subject":
      content = (
        <SubjectHome
          subject={subject}
          onBack={() => setScreen("home")}
          onSelectMode={(mode) => setScreen(mode)}
        />
      );
      break;
    case "quiz":
      content = (
        <QuizGame
          subject={subject}
          onBack={() => setScreen("subject")}
          onEarnStar={earnStar}
        />
      );
      break;
    case "trace":
      content = (
        <TraceGame
          subject={subject}
          onBack={() => setScreen("subject")}
          onEarnStar={earnStar}
        />
      );
      break;
    case "matching":
      content = (
        <MatchingGame
          subject={subject}
          onBack={() => setScreen("subject")}
          onEarnStar={earnStar}
        />
      );
      break;
    case "stamps":
      content = (
        <StampsScreen
          onBack={() => setScreen(subject ? "subject" : "home")}
          totalStars={totalStars}
          stamps={stamps}
        />
      );
      break;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <style>{globalCSS}</style>
      <SoftBackground />
      <div style={{
        position: "relative",
        zIndex: 1,
        maxWidth: 520,
        margin: "0 auto",
        paddingBottom: 90,
      }}>
        {content}
      </div>
      <BottomNav
        screen={screen}
        onHome={goHome}
        onStamps={goStamps}
        stars={totalStars}
      />
      {newStamp && <NewStampOverlay stamp={newStamp} onDone={() => setNewStamp(null)} />}
    </div>
  );
}
