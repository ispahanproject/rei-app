import { useCallback, useEffect, useRef, useState } from "react";
import { loadJSON, saveJSON, playFanfare, playLevelUp } from "./lib.js";
import {
  SUBJECTS, STAMPS, PROGRESS_KEY, STARS_PER_LEVEL, MAX_LEVEL,
  POTTY_KEY, POTTY_GOAL, POTTY_REWARDS,
} from "./data.js";
import {
  globalCSS, SoftBackground, BottomNav, InnerTopBar, getGreeting,
  NewStampOverlay, LevelUpOverlay, BF_COLORS, IMG,
} from "./theme.jsx";
import { PottyScreen, PottyRewardOverlay } from "./Potty.jsx";
import WordBuilder from "./games/WordBuilder.jsx";
import MathGame from "./games/MathGame.jsx";
import ClockGame from "./games/ClockGame.jsx";
import EnglishGame from "./games/EnglishGame.jsx";
import FlagsGame from "./games/FlagsGame.jsx";
import TraceGame from "./games/TraceGame.jsx";

const GAME_COMPONENTS = {
  kotoba: WordBuilder,
  keisan: MathGame,
  tokei: ClockGame,
  eigo: EnglishGame,
  kokki: FlagsGame,
  kakikata: TraceGame,
};

// ─── 進捗の 保存かたち ──────────────────────────────────────────────────────
function defaultProgress() {
  const sub = {};
  SUBJECTS.forEach((s) => { sub[s.id] = { lv: 1, sp: 0 }; });
  return { stars: 0, stamps: 0, sub };
}
function loadProgress() {
  const saved = loadJSON(PROGRESS_KEY, null);
  const def = defaultProgress();
  if (!saved || typeof saved !== "object") return def;
  return {
    stars: Number(saved.stars) || 0,
    stamps: Math.min(Number(saved.stamps) || 0, STAMPS.length),
    sub: { ...def.sub, ...(saved.sub || {}) },
  };
}

// ─── ホーム ─────────────────────────────────────────────────────────────────
function HomeScreen({ prog, onSelect, onPotty, pottyProgress }) {
  return (
    <div>
      {/* ヒーロー */}
      <div style={{
        textAlign: "center",
        padding: "28px 16px 24px",
        background: "linear-gradient(180deg, #DFF7FF 0%, #EBFDFF 100%)",
        borderRadius: "0 0 40px 40px",
        marginBottom: 20,
      }}>
        <div style={{ animation: "bounce 3s ease-in-out infinite", display: "inline-block" }}>
          <img
            src={IMG.family}
            alt="Baby Shark"
            style={{ width: 180, height: "auto", pointerEvents: "none" }}
            draggable={false}
          />
        </div>
        <div style={{
          marginTop: 14,
          display: "inline-block",
          background: "white",
          borderRadius: "var(--radius-pill)",
          padding: "12px 28px",
          boxShadow: "var(--shadow-card)",
        }}>
          <p style={{ fontSize: 20, fontWeight: 900, color: "var(--text)", margin: 0, whiteSpace: "nowrap" }}>
            {getGreeting()}、<span style={{
              color: "#53CEFF", background: "#DFF7FF",
              padding: "2px 8px", borderRadius: 10,
            }}>れいくん</span>！
          </p>
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-light)", marginTop: 10 }}>
          きょうは なにを べんきょう する？
        </p>
      </div>

      {/* トイレ カード */}
      <div style={{ padding: "0 16px 16px" }}>
        <button
          onClick={onPotty}
          className="pressable"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "18px 20px",
            background: "linear-gradient(135deg, #FFF3EB, #FFFBF6)",
            border: "2px solid #FF9500",
            borderRadius: "var(--radius)",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,149,0,0.18)",
            fontFamily: "inherit",
            textAlign: "left",
            animation: "scaleIn 0.3s ease both",
          }}
        >
          <div style={{
            width: 58, height: 58, borderRadius: 18,
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, flexShrink: 0,
            boxShadow: "var(--shadow-card)",
          }}>
            🚽
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 19, fontWeight: 900, color: "var(--text)", whiteSpace: "nowrap" }}>トイレで うんち</div>
            <div style={{ fontSize: 13, color: "#FF9500", marginTop: 3, fontWeight: 800 }}>
              できたら スタンプ ためよう！ {pottyProgress > 0 ? `(いま ${pottyProgress}こ)` : ""}
            </div>
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, color: "#FF9500", fontWeight: 700,
          }}>
            →
          </div>
        </button>
      </div>

      {/* きょうか カード (レベルつき) */}
      <div style={{ padding: "0 16px 100px", display: "flex", flexDirection: "column", gap: 13 }}>
        {SUBJECTS.map((sub, i) => {
          const p = prog.sub[sub.id];
          const isMaster = p.lv >= MAX_LEVEL && p.sp >= STARS_PER_LEVEL;
          return (
            <button
              key={sub.id}
              onClick={() => onSelect(sub.id)}
              className="pressable"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "18px 20px",
                background: "white",
                border: "none",
                borderLeft: `5px solid ${sub.color}`,
                borderRadius: "var(--radius)",
                cursor: "pointer",
                animation: `scaleIn 0.3s ease ${i * 0.05}s both`,
                boxShadow: "var(--shadow-card)",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <div style={{
                width: 58,
                height: 58,
                borderRadius: 18,
                background: sub.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: sub.icon.length > 2 ? 22 : 30,
                fontWeight: 900,
                color: sub.color,
                flexShrink: 0,
              }}>
                {sub.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "var(--text)", whiteSpace: "nowrap" }}>{sub.label}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 900,
                    color: "white",
                    background: isMaster ? "linear-gradient(135deg, #FFCC02, #FF9500)" : sub.color,
                    borderRadius: 8, padding: "2px 8px",
                    flexShrink: 0,
                  }}>
                    {isMaster ? "👑 マスター" : `レベル${p.lv}`}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-light)", marginTop: 3, fontWeight: 600 }}>
                  {sub.desc}
                </div>
                {/* レベルの すすみぐあい */}
                <div style={{
                  marginTop: 7, height: 7,
                  background: "#F0F0F0", borderRadius: 4, overflow: "hidden",
                }}>
                  <div style={{
                    width: `${Math.min(100, (p.sp / STARS_PER_LEVEL) * 100)}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${sub.color}, ${sub.color}99)`,
                    borderRadius: 4,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: sub.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                color: sub.color,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                →
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── スタンプちょう ─────────────────────────────────────────────────────────
function StampsScreen({ onBack, stars, stamps }) {
  const toNext = 5 - (stars % 5);
  return (
    <div>
      <InnerTopBar title="スタンプちょう" onBack={onBack} />
      <div style={{ padding: "16px 16px 100px", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ animation: "bounce 3s ease-in-out infinite", display: "inline-block" }}>
            <img src={IMG.daddy} alt="stamps" style={{ width: 80, height: "auto" }} draggable={false} />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>
            あつめた スタンプ: <span style={{ color: "#53CEFF" }}>{stamps}</span> / {STAMPS.length}
          </p>
          <p style={{ fontSize: 14, color: "var(--text-light)", marginTop: 4, fontWeight: 600 }}>
            {stamps >= STAMPS.length
              ? "ぜんぶ あつめたよ！ すごい！ 🎉"
              : <>⭐ あと {toNext} こで つぎの スタンプ！</>}
          </p>
          <div style={{
            width: "80%", height: 14,
            background: "#F0F0F0",
            borderRadius: "var(--radius-pill)",
            margin: "16px auto 0",
            overflow: "hidden",
          }}>
            <div style={{
              width: `${(stars % 5) * 20}%`,
              height: "100%",
              background: "linear-gradient(90deg, #53CEFF, #FF4B78)",
              borderRadius: "var(--radius-pill)",
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {STAMPS.map((stamp, i) => {
            const unlocked = i < stamps;
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
                {unlocked ? stamp : "❔"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [prog, setProg] = useState(loadProgress);
  const [overlays, setOverlays] = useState([]); // [{type:'stamp'|'level', ...}]
  const progRef = useRef(prog);
  progRef.current = prog;
  const timers = useRef([]);

  useEffect(() => saveJSON(PROGRESS_KEY, prog), [prog]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ── トイレ (きぞん キーを そのまま つかう) ──
  const [potty, setPotty] = useState(() => {
    const saved = loadJSON(POTTY_KEY, null);
    const fresh = { dates: [], cards: 0, total: 0, history: [] };
    if (saved && typeof saved === "object") {
      const dates = Array.isArray(saved.dates)
        ? saved.dates
        : Array.from({ length: saved.progress || 0 }, () => null);
      return {
        dates,
        cards: saved.cards || 0,
        total: saved.total || 0,
        history: Array.isArray(saved.history) ? saved.history : [],
      };
    }
    return fresh;
  });
  const [pottyReward, setPottyReward] = useState(null);
  useEffect(() => saveJSON(POTTY_KEY, potty), [potty]);

  const pottySuccess = () => {
    const now = new Date().toISOString();
    const dates = [...potty.dates, now];
    const history = [...potty.history, now];
    const total = potty.total + 1;
    if (dates.length >= POTTY_GOAL) {
      const reward = POTTY_REWARDS[potty.cards % POTTY_REWARDS.length];
      playFanfare();
      timers.current.push(setTimeout(() => setPottyReward(reward), 400));
      setPotty({ dates: [], cards: potty.cards + 1, total, history });
    } else {
      setPotty({ ...potty, dates, total, history });
    }
  };
  const pottyUndo = () => {
    if (potty.dates.length === 0) return;
    setPotty({
      ...potty,
      dates: potty.dates.slice(0, -1),
      total: Math.max(0, potty.total - 1),
      history: potty.history.slice(0, -1),
    });
  };

  // ── ラウンド しゅうりょう: スター・レベル・スタンプの けいさん ──
  // かえりち は ResultScreen に わたす
  const finishRound = useCallback((sid, firstTry, total) => {
    const p = progRef.current;
    const stars =
      firstTry >= total ? 3 :
      firstTry >= total - 1 ? 2 :
      firstTry >= total - 2 ? 1 : 0;

    const cur = p.sub[sid] || { lv: 1, sp: 0 };
    let lv = cur.lv;
    let sp = cur.sp + stars;
    let leveledUp = false;
    if (lv < MAX_LEVEL && sp >= STARS_PER_LEVEL) {
      lv += 1;
      sp -= STARS_PER_LEVEL;
      leveledUp = true;
    }
    if (lv >= MAX_LEVEL) sp = Math.min(sp, STARS_PER_LEVEL);

    const totalStars = p.stars + stars;
    let stamps = p.stamps;
    let newStamp = null;
    const target = Math.min(Math.floor(totalStars / 5), STAMPS.length);
    if (target > stamps) {
      stamps = target;
      newStamp = STAMPS[stamps - 1];
    }

    setProg({ stars: totalStars, stamps, sub: { ...p.sub, [sid]: { lv, sp } } });

    // えんしゅつは けっかがめんの あとに
    const queue = [];
    if (leveledUp) queue.push({ type: "level", level: lv, sid });
    if (newStamp) queue.push({ type: "stamp", stamp: newStamp });
    if (queue.length) {
      timers.current.push(setTimeout(() => {
        if (queue.some((o) => o.type === "level")) playLevelUp();
        setOverlays((o) => [...o, ...queue]);
      }, 900));
    }

    return {
      firstTry, total, stars,
      level: lv, sp, spNeed: STARS_PER_LEVEL,
      leveledUp, newLevel: lv,
    };
  }, []);

  const dismissOverlay = useCallback(() => setOverlays((o) => o.slice(1)), []);

  const goHome = () => setScreen("home");

  // ── がめん ──
  let content;
  if (screen === "home") {
    content = (
      <HomeScreen
        prog={prog}
        onSelect={(sid) => setScreen(sid)}
        onPotty={() => setScreen("potty")}
        pottyProgress={potty.dates.length}
      />
    );
  } else if (screen === "stamps") {
    content = <StampsScreen onBack={goHome} stars={prog.stars} stamps={prog.stamps} />;
  } else if (screen === "potty") {
    content = (
      <PottyScreen data={potty} onSuccess={pottySuccess} onUndo={pottyUndo} onBack={goHome} />
    );
  } else if (GAME_COMPONENTS[screen]) {
    const Game = GAME_COMPONENTS[screen];
    const meta = SUBJECTS.find((s) => s.id === screen);
    content = (
      <Game
        key={screen}
        level={prog.sub[screen].lv}
        color={meta.color}
        onFinish={(firstTry, total) => finishRound(screen, firstTry, total)}
        onBack={goHome}
      />
    );
  }

  const activeOverlay = overlays[0];
  const meta = activeOverlay?.sid ? SUBJECTS.find((s) => s.id === activeOverlay.sid) : null;

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
        onStamps={() => setScreen("stamps")}
        stars={prog.stars}
      />
      {activeOverlay?.type === "stamp" && (
        <NewStampOverlay stamp={activeOverlay.stamp} onDone={dismissOverlay} />
      )}
      {activeOverlay?.type === "level" && (
        <LevelUpOverlay
          level={activeOverlay.level}
          subjectLabel={meta ? meta.label : ""}
          onDone={dismissOverlay}
        />
      )}
      {pottyReward && <PottyRewardOverlay reward={pottyReward} onDone={() => setPottyReward(null)} />}
    </div>
  );
}
