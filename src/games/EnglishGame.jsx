import { useEffect, useState } from "react";
import { pick, shuffle, speak, speakEn } from "../lib.js";
import { EN_WORDS, EN_SPELL, ALPHA_BANK, ROUND_SIZE } from "../data.js";
import { useRoundQueue, ResultScreen, ChoiceRound, TileBoard } from "../engine.jsx";
import { InnerTopBar, RoundProgress, SpeakButton, ConfettiEffect } from "../theme.jsx";

const BY_EN = Object.fromEntries(EN_WORDS.map((w) => [w.en, w]));

// ─── Lv1: フォニックス (あたまの もじ) ──────────────────────────────────────
function genInitialQ() {
  const w = EN_WORDS[Math.floor(Math.random() * EN_WORDS.length)];
  const letter = w.en[0];
  // あたまの もじが ぜんぶ ちがう ことばを 3つ
  const used = new Set([letter]);
  const others = shuffle(EN_WORDS).filter((o) => {
    if (used.has(o.en[0])) return false;
    used.add(o.en[0]);
    return true;
  }).slice(0, 3);
  return {
    kind: "initial",
    display: (
      <div style={{
        fontSize: 84, fontWeight: 900, color: "#FFCC02",
        textShadow: "0 3px 0 rgba(0,0,0,0.08)",
        animation: "float 2.5s ease-in-out infinite",
      }}>
        {letter}
      </div>
    ),
    question: `「${letter}」から はじまる ことばは？`,
    options: shuffle([w.en, ...others.map((o) => o.en)]),
    answer: w.en,
    optionRender: (opt) => {
      const o = BY_EN[opt];
      return (
        <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 40 }}>{o.emoji}</span>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1 }}>{o.en}</span>
        </span>
      );
    },
    speakText: `${letter} から はじまる ことばは どれかな？`,
    onAnswered: (ok) => { if (ok) speakEn(w.en); },
  };
}

function genBlankQ() {
  const w = EN_WORDS[Math.floor(Math.random() * EN_WORDS.length)];
  const letter = w.en[0];
  const opts = new Set([letter]);
  while (opts.size < 4) opts.add(ALPHA_BANK[Math.floor(Math.random() * 26)]);
  return {
    kind: "blank",
    display: (
      <div>
        <div style={{ fontSize: 72, lineHeight: 1.1 }}>{w.emoji}</div>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 4, marginTop: 8 }}>
          <span style={{
            display: "inline-block", width: 52, borderBottom: "5px dashed #FF9500",
            color: "#FF9500",
          }}>&nbsp;</span>
          <span>{w.en.slice(1)}</span>
        </div>
      </div>
    ),
    question: "はじめの もじは どれ？",
    options: shuffle([...opts]),
    answer: letter,
    optionFontSize: 40,
    speakText: "はじめの もじは どれかな？",
    onAnswered: (ok) => { if (ok) speakEn(w.en); },
  };
}

// ─── Lv2: ことばを よんで えを えらぶ ──────────────────────────────────────
function genReadQ() {
  const w = EN_WORDS[Math.floor(Math.random() * EN_WORDS.length)];
  const others = pick(EN_WORDS.filter((o) => o.en !== w.en), 3);
  return {
    kind: "read",
    display: (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <span style={{ fontSize: 54, fontWeight: 900, letterSpacing: 3 }}>{w.en}</span>
        <SpeakButton onSpeak={() => speakEn(w.en)} size={44} />
      </div>
    ),
    question: "よんでみて どの えか えらぼう！",
    options: shuffle([w.en, ...others.map((o) => o.en)]),
    answer: w.en,
    optionRender: (opt) => <span style={{ fontSize: 48 }}>{BY_EN[opt].emoji}</span>,
    onAnswered: (ok) => speakEn(ok ? w.en : `${w.en}. ${w.en} is this one.`),
  };
}

function genChoiceQuestions(level) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < ROUND_SIZE && guard++ < 200) {
    const q = level === 1
      ? (Math.random() < 0.5 ? genInitialQ() : genBlankQ())
      : genReadQ();
    const key = `${q.kind}-${q.answer}-${q.question}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

// ─── Lv3: つづりを ならべる ─────────────────────────────────────────────────
function genSpellQuestions() {
  return pick(EN_SPELL, ROUND_SIZE).map((w) => {
    const tiles = w.en.split("");
    const decoys = pick(ALPHA_BANK.filter((l) => !tiles.includes(l)), 2);
    return { ...w, tiles, decoys };
  });
}

function SpellRound({ round, color }) {
  const [confetti, setConfetti] = useState(false);
  const q = round.cur;
  const qKey = `${round.roundId}-${round.phase}-${round.pos}`;

  useEffect(() => {
    if (q && round.phase !== "done") speakEn(q.en);
  }, [qKey]);

  if (!q) return null;

  return (
    <div>
      <ConfettiEffect active={confetti} />
      <RoundProgress pos={round.pos} total={round.queueLength} color={color} review={round.isReview} />
      <div style={{
        background: "white",
        borderRadius: "var(--radius)",
        padding: "22px",
        textAlign: "center",
        boxShadow: "var(--shadow-card)",
        marginBottom: 20,
        animation: "popIn 0.3s ease",
      }} key={qKey}>
        <div style={{ fontSize: 76, lineHeight: 1.1, animation: "float 2.5s ease-in-out infinite" }}>
          {q.emoji}
        </div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: "var(--text-light)" }}>
            えいごで かいてみよう！ ({q.ja})
          </span>
          <SpeakButton onSpeak={() => speakEn(q.en)} size={40} />
        </div>
      </div>
      <TileBoard
        answer={q.tiles}
        decoys={q.decoys}
        resetKey={qKey}
        tileFontSize={24}
        onCorrect={() => {
          setConfetti(true);
          setTimeout(() => setConfetti(false), 1400);
          speakEn(q.en);
          round.submit(true, false);
        }}
        onWrong={() => round.submit(false, false)}
      />
    </div>
  );
}

export default function EnglishGame({ level, color, onFinish, onBack }) {
  const round = useRoundQueue(
    () => (level === 3 ? genSpellQuestions() : genChoiceQuestions(level)),
    onFinish
  );

  if (round.phase === "done") {
    return (
      <div>
        <InnerTopBar title="えいご けっか" onBack={onBack} />
        <ResultScreen outcome={round.outcome} onRetry={round.retry} onBack={onBack} />
      </div>
    );
  }

  return (
    <div>
      <InnerTopBar title="えいご" onBack={onBack} />
      <div style={{ padding: "8px 16px 120px", maxWidth: 500, margin: "0 auto" }}>
        {level === 3 ? (
          <SpellRound round={round} color={color} />
        ) : (
          <ChoiceRound
            round={round}
            color={color}
            onSpeak={(q) => { if (q.speakText) speak(q.speakText); }}
          />
        )}
      </div>
    </div>
  );
}
