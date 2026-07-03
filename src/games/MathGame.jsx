import { useEffect, useRef, useState } from "react";
import { randInt, speak, playDing, playBuzz } from "../lib.js";
import { ROUND_SIZE } from "../data.js";
import { useRoundQueue, ResultScreen, Keypad } from "../engine.jsx";
import { InnerTopBar, RoundProgress, SpeakButton, ConfettiEffect } from "../theme.jsx";

// ─── もんだい生成 ───────────────────────────────────────────────────────────
// Lv1: 10までの たしざん・ひきざん (ドットの ずが つく)
// Lv2: くりあがり・くりさがり (20まで)
// Lv3: むしくいざん (8 + □ = 13)
function genOne(level) {
  if (level === 1) {
    if (Math.random() < 0.5) {
      const a = randInt(1, 9);
      const b = randInt(1, Math.min(9, 10 - a));
      return { kind: "plain", a, b, op: "+", ans: a + b };
    }
    const a = randInt(2, 10);
    const b = randInt(1, a - 1);
    return { kind: "plain", a, b, op: "-", ans: a - b };
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      // くりあがり: こたえ 11-18
      const a = randInt(4, 9);
      const b = randInt(Math.max(2, 11 - a), 9);
      return { kind: "plain", a, b, op: "+", ans: a + b };
    }
    // くりさがり: 13 - 6 のような もんだい
    const ans = randInt(2, 9);
    const b = randInt(Math.max(2, 11 - ans), 9);
    const a = ans + b; // 11-18, a%10 < b なので くりさがり
    return { kind: "plain", a, b, op: "-", ans };
  }
  // Lv3 むしくい
  const form = randInt(0, 2);
  if (form === 0) {
    const a = randInt(1, 9), x = randInt(1, 9);
    return { kind: "missing", form: "a+x=c", a, c: a + x, op: "+", ans: x };
  }
  if (form === 1) {
    const x = randInt(1, 9), b = randInt(1, 9);
    return { kind: "missing", form: "x+b=c", b, c: x + b, op: "+", ans: x };
  }
  const a = randInt(3, 15);
  const x = randInt(1, a - 1);
  return { kind: "missing", form: "a-x=c", a, c: a - x, op: "-", ans: x };
}

function qKeyOf(q) {
  return `${q.kind}-${q.form || ""}-${q.a || ""}-${q.b || ""}-${q.c || ""}-${q.op}`;
}

function genQuestions(level) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < ROUND_SIZE && guard++ < 200) {
    const q = genOne(level);
    const key = qKeyOf(q);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

function speakQuestion(q) {
  const opWord = q.op === "+" ? "たす" : "ひく";
  if (q.kind === "plain") return speak(`${q.a} ${opWord} ${q.b} は？`);
  if (q.form === "a+x=c") return speak(`${q.a} たす いくつで ${q.c} に なるかな？`);
  if (q.form === "x+b=c") return speak(`いくつ たす ${q.b} で ${q.c} に なるかな？`);
  return speak(`${q.a} ひく いくつで ${q.c} に なるかな？`);
}

// ドットの ず (5こずつ ならべる)
function Dots({ n, color, crossedFrom }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 4, verticalAlign: "middle" }}>
      {Array.from({ length: Math.ceil(n / 5) }, (_, row) => (
        <div key={row} style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: Math.min(5, n - row * 5) }, (_, i) => {
            const idx = row * 5 + i;
            const crossed = crossedFrom != null && idx >= crossedFrom;
            return (
              <span key={i} style={{
                width: 18, height: 18, borderRadius: "50%",
                background: crossed ? "#E5E5E5" : color,
                position: "relative",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "#FF4B78", fontWeight: 900,
              }}>
                {crossed ? "✕" : ""}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// しきの ひょうじ (□ に にゅうりょくちゅうの すうじ)
function Equation({ q, typed, flash }) {
  const box = (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      minWidth: 72, height: 72, padding: "0 8px",
      borderRadius: 18,
      background: flash === "ok" ? "#E0FFE8" : flash === "ng" ? "#FFE0EA" : "#F0F8FF",
      border: "3px dashed rgba(83,206,255,0.5)",
      fontSize: 40, fontWeight: 900,
      color: typed ? "var(--text)" : "rgba(131,149,167,0.4)",
      margin: "0 6px",
    }}>
      {typed || "?"}
    </span>
  );
  const num = (v) => <span style={{ margin: "0 6px" }}>{v}</span>;
  const opSpan = <span style={{ margin: "0 6px", color: "#FF9500" }}>{q.op === "+" ? "＋" : "−"}</span>;
  const eq = <span style={{ margin: "0 6px", color: "#8395A7" }}>＝</span>;

  let parts;
  if (q.kind === "plain") parts = <>{num(q.a)}{opSpan}{num(q.b)}{eq}{box}</>;
  else if (q.form === "a+x=c") parts = <>{num(q.a)}{opSpan}{box}{eq}{num(q.c)}</>;
  else if (q.form === "x+b=c") parts = <>{box}{opSpan}{num(q.b)}{eq}{num(q.c)}</>;
  else parts = <>{num(q.a)}{opSpan}{box}{eq}{num(q.c)}</>;

  return (
    <div style={{
      fontSize: 44, fontWeight: 900,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexWrap: "wrap",
      animation: flash === "ng" ? "shake 0.4s ease" : "none",
    }}>
      {parts}
    </div>
  );
}

export default function MathGame({ level, color, onFinish, onBack }) {
  const round = useRoundQueue(() => genQuestions(level), onFinish);
  const [typed, setTyped] = useState("");
  const [flash, setFlash] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const timers = useRef([]);
  const judging = useRef(false);

  const q = round.cur;
  const qKey = `${round.roundId}-${round.phase}-${round.pos}`;

  useEffect(() => {
    setTyped("");
    setFlash(null);
    judging.current = false;
    if (q && round.phase !== "done") speakQuestion(q);
    return () => timers.current.forEach(clearTimeout);
  }, [qKey]);

  if (round.phase === "done") {
    return (
      <div>
        <InnerTopBar title="けいさん けっか" onBack={onBack} />
        <ResultScreen outcome={round.outcome} onRetry={round.retry} onBack={onBack} />
      </div>
    );
  }
  if (!q) return null;

  const check = () => {
    if (judging.current || typed === "") return;
    judging.current = true;
    const ok = Number(typed) === q.ans;
    setFlash(ok ? "ok" : "ng");
    if (ok) {
      playDing();
      setConfetti(true);
      timers.current.push(setTimeout(() => setConfetti(false), 1400));
      timers.current.push(setTimeout(() => round.submit(true, false), 900));
    } else {
      playBuzz();
      round.submit(false, false);
      timers.current.push(setTimeout(() => {
        setTyped("");
        setFlash(null);
        judging.current = false;
      }, 900));
    }
  };

  return (
    <div>
      <InnerTopBar title="けいさん" onBack={onBack} />
      <ConfettiEffect active={confetti} />
      <div style={{ padding: "8px 16px 120px", maxWidth: 500, margin: "0 auto" }}>
        <RoundProgress pos={round.pos} total={round.queueLength} color={color} review={round.isReview} />

        {/* しき カード */}
        <div style={{
          background: "white",
          borderRadius: "var(--radius)",
          padding: "24px 16px",
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
          marginBottom: 16,
          animation: "popIn 0.3s ease",
        }} key={qKey}>
          <Equation q={q} typed={typed} flash={flash} />

          {/* Lv1 は ドットの ずで たすけ */}
          {level === 1 && q.kind === "plain" && (
            <div style={{ marginTop: 18, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
              {q.op === "+" ? (
                <>
                  <Dots n={q.a} color="#53CEFF" />
                  <span style={{ fontSize: 24, fontWeight: 900, color: "#FF9500" }}>＋</span>
                  <Dots n={q.b} color="#FF4B78" />
                </>
              ) : (
                <Dots n={q.a} color="#53CEFF" crossedFrom={q.a - q.b} />
              )}
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <SpeakButton onSpeak={() => speakQuestion(q)} size={40} />
          </div>
        </div>

        <Keypad
          disabled={flash !== null}
          onDigit={(d) => setTyped((t) => (t.length >= 2 ? t : t === "0" ? d : t + d))}
          onDelete={() => setTyped((t) => t.slice(0, -1))}
          onSubmit={check}
        />
      </div>
    </div>
  );
}
