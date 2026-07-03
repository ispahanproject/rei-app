import { useState } from "react";
import { playDing, formatStampDate, formatStampDateLong } from "./lib.js";
import { POTTY_GOAL } from "./data.js";
import { InnerTopBar, BigButton, ConfettiEffect, BF_COLORS, IMG } from "./theme.jsx";

// ─── トイレで うんち スタンプ ───────────────────────────────────────────────
export function PottyScreen({ data, onSuccess, onUndo, onBack }) {
  const { dates, cards, total } = data;
  const progress = dates.length;
  const [justAdded, setJustAdded] = useState(-1);
  const [burst, setBurst] = useState(false);

  const handleSuccess = () => {
    playDing();
    setJustAdded(progress);
    setBurst(true);
    setTimeout(() => setBurst(false), 1500);
    onSuccess();
  };

  const left = POTTY_GOAL - progress;

  return (
    <div>
      <InnerTopBar title="トイレで うんち" onBack={onBack} />
      <ConfettiEffect active={burst} />
      <div style={{ padding: "8px 16px 120px", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ animation: "bounce 3s ease-in-out infinite", display: "inline-block" }}>
            <img src={IMG.daddy} alt="" style={{ width: 90, height: "auto" }} draggable={false} />
          </div>
          <p style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
            トイレで うんち できたかな？ 🚽
          </p>
          <p style={{ fontSize: 15, color: "var(--text-light)", marginTop: 6, fontWeight: 700 }}>
            あと <span style={{ color: "#FF9500", fontSize: 20 }}>{left}</span> こで ごほうび！ 🎁
          </p>
        </div>

        {/* スタンプ カード */}
        <div style={{
          background: "white",
          borderRadius: "var(--radius)",
          padding: "20px 18px",
          boxShadow: "var(--shadow-card)",
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text)" }}>いまの カード</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#FF9500" }}>{progress} / {POTTY_GOAL}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {Array.from({ length: POTTY_GOAL }).map((_, i) => {
              const filled = i < progress;
              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 18,
                    background: filled ? "#FFF3EB" : "#F7F7F7",
                    border: filled
                      ? `2px solid ${BF_COLORS[i % 5]}`
                      : "2px dashed rgba(131,149,167,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    boxShadow: filled ? "var(--shadow-card)" : "none",
                    animation: i === justAdded ? "stampDrop 0.5s ease both" : "none",
                  }}
                >
                  <span style={{ fontSize: filled ? 26 : 18, lineHeight: 1 }}>
                    {filled ? "💩" : "🚽"}
                  </span>
                  {filled && (
                    <span style={{ fontSize: 10, fontWeight: 800, color: BF_COLORS[i % 5] }}>
                      {formatStampDate(dates[i])}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <BigButton
          onClick={handleSuccess}
          bg="linear-gradient(135deg, #4CD964, #38B24A)"
          color="white"
          style={{
            width: "100%",
            fontSize: 26,
            padding: "24px",
            boxShadow: "0 8px 24px rgba(76,217,100,0.4)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        >
          💩 できた！ ✨
        </BigButton>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#4CD964" }}>{total}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)" }}>できた かいすう</div>
          </div>
          <div style={{ width: 1, background: "rgba(131,149,167,0.2)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#FF9500" }}>{cards} 🏆</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-light)" }}>ごほうび カード</div>
          </div>
        </div>

        {data.history && data.history.length > 0 && (
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, fontWeight: 700, color: "var(--text-light)" }}>
            🗓️ さいごに できたのは{" "}
            <span style={{ color: "#4CD964" }}>
              {formatStampDateLong(data.history[data.history.length - 1])}
            </span>
          </p>
        )}

        {progress > 0 && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              onClick={onUndo}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                color: "var(--text-light)", textDecoration: "underline",
                padding: 8,
              }}
            >
              まちがえた？ 1こ もどす
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PottyRewardOverlay({ reward, onDone }) {
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
        <div style={{
          width: 130, height: 130, borderRadius: "50%",
          background: "linear-gradient(135deg, #FFF8D6, #FFF3EB)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <div style={{ fontSize: 78, animation: "celebrateJump 1s ease-in-out infinite" }}>
            {reward}
          </div>
        </div>
        <p style={{ fontSize: 26, fontWeight: 900, color: "var(--text)", margin: "0 0 8px" }}>
          カード かんせい！ 🎉
        </p>
        <p style={{ fontSize: 16, color: "var(--text-light)", fontWeight: 700, margin: 0 }}>
          {POTTY_GOAL}こ たまったね！ ごほうび ゲット！<br />すごいぞ れいくん！
        </p>
      </div>
    </div>
  );
}
