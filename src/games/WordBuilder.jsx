import { useEffect, useState } from "react";
import { pick, splitMora, speak } from "../lib.js";
import { WORDS_L1, WORDS_L2, WORDS_L3, HIRA_BANK, KATA_BANK, ROUND_SIZE } from "../data.js";
import { useRoundQueue, ResultScreen, TileBoard } from "../engine.jsx";
import { InnerTopBar, RoundProgress, SpeakButton, ConfettiEffect } from "../theme.jsx";

const POOLS = { 1: WORDS_L1, 2: WORDS_L2, 3: WORDS_L3 };

// えを みて、かなタイルを ならべて ことばを つくる
export default function WordBuilder({ level, color, onFinish, onBack }) {
  const round = useRoundQueue(() => {
    const bank = level === 3 ? KATA_BANK : HIRA_BANK;
    return pick(POOLS[level] || WORDS_L1, ROUND_SIZE).map((w) => {
      const tiles = splitMora(w.ja);
      const decoys = pick(bank.filter((k) => !tiles.includes(k)), 2);
      return { ...w, tiles, decoys };
    });
  }, onFinish);

  const [confetti, setConfetti] = useState(false);
  const q = round.cur;
  const qKey = `${round.roundId}-${round.phase}-${round.pos}`;

  // もんだいが かわったら よみあげ
  useEffect(() => {
    if (q && round.phase !== "done") speak(q.ja);
  }, [qKey]);

  if (round.phase === "done") {
    return (
      <div>
        <InnerTopBar title="ことばづくり けっか" onBack={onBack} />
        <ResultScreen outcome={round.outcome} onRetry={round.retry} onBack={onBack} />
      </div>
    );
  }
  if (!q) return null;

  return (
    <div>
      <InnerTopBar title="ことばづくり" onBack={onBack} />
      <ConfettiEffect active={confetti} />
      <div style={{ padding: "8px 16px 120px", maxWidth: 500, margin: "0 auto" }}>
        <RoundProgress pos={round.pos} total={round.queueLength} color={color} review={round.isReview} />

        {/* おだい カード */}
        <div style={{
          background: "white",
          borderRadius: "var(--radius)",
          padding: "24px",
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
          marginBottom: 20,
          animation: "popIn 0.3s ease",
        }} key={qKey}>
          <div style={{ fontSize: 84, lineHeight: 1.1, animation: "float 2.5s ease-in-out infinite" }}>
            {q.emoji}
          </div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-light)" }}>
              なまえを つくってね！
            </span>
            <SpeakButton onSpeak={() => speak(q.ja)} size={40} />
          </div>
        </div>

        <TileBoard
          answer={q.tiles}
          decoys={q.decoys}
          resetKey={qKey}
          tileFontSize={26}
          onCorrect={() => {
            setConfetti(true);
            setTimeout(() => setConfetti(false), 1400);
            round.submit(true, false);
          }}
          onWrong={() => round.submit(false, false)}
        />
      </div>
    </div>
  );
}
