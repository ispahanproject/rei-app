import { useCallback, useEffect, useRef, useState } from "react";
import { playDing, playBuzz, shuffle } from "./lib.js";
import { ConfettiEffect, RoundProgress, IMG } from "./theme.jsx";

// ─── ラウンド管理フック ──────────────────────────────────────────────────────
// 7もん → まちがえた もんだいだけ さいごに もういちど (ふくしゅう) → けっか
export function useRoundQueue(genQuestions, onFinish) {
  const genRef = useRef(genQuestions);
  genRef.current = genQuestions;
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const fresh = () => {
    const qs = genRef.current();
    return {
      queue: qs,
      total: qs.length,
      pos: 0,
      phase: "play", // play | review | done
      firstTry: 0,
      missed: [],
      curMissed: false,
      outcome: null,
      roundId: Math.random(), // リセット検知よう
    };
  };

  const [st, setSt] = useState(fresh);
  const stRef = useRef(st);
  stRef.current = st;

  // こたえの はんてい を ほうこくする
  // correct: せいかい か / advanceOnWrong: まちがえたら つぎへ すすむか (4たくは true, タイルは false)
  const submit = useCallback((correct, advanceOnWrong = true) => {
    const s = stRef.current;
    if (s.phase === "done") return;

    let { queue, pos, phase, firstTry, missed, curMissed, total } = s;

    if (correct) {
      if (phase === "play" && !curMissed) firstTry += 1;
      // つぎへ
      if (pos + 1 < queue.length) {
        pos += 1;
        curMissed = false;
      } else if (phase === "play" && missed.length > 0) {
        queue = missed;
        missed = [];
        pos = 0;
        curMissed = false;
        phase = "review";
      } else {
        phase = "done";
      }
    } else {
      if (!curMissed) {
        curMissed = true;
        if (phase === "play") missed = [...missed, queue[pos]];
      }
      if (advanceOnWrong) {
        if (pos + 1 < queue.length) {
          pos += 1;
          curMissed = false;
        } else if (phase === "play" && missed.length > 0) {
          queue = missed;
          missed = [];
          pos = 0;
          curMissed = false;
          phase = "review";
        } else {
          phase = "done";
        }
      }
    }

    const next = { ...s, queue, pos, phase, firstTry, missed, curMissed };
    if (phase === "done" && s.phase !== "done") {
      next.outcome = onFinishRef.current(firstTry, total);
    }
    setSt(next);
  }, []);

  const retry = useCallback(() => setSt(fresh()), []);

  return {
    cur: st.queue[st.pos],
    pos: st.pos,
    queueLength: st.queue.length,
    total: st.total,
    phase: st.phase,
    isReview: st.phase === "review",
    outcome: st.outcome,
    roundId: st.roundId,
    curMissed: st.curMissed,
    submit,
    retry,
  };
}

// ─── けっか がめん ──────────────────────────────────────────────────────────
const STAR_MSG = ["れんしゅう しよう！", "よくできたね！", "すごい！", "カンペキ！"];

export function ResultScreen({ outcome, onRetry, onBack }) {
  const { firstTry, total, stars, level, sp, spNeed, leveledUp, newLevel } = outcome;
  return (
    <div style={{ padding: "24px 16px 120px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
      <div style={{
        animation: stars >= 3 ? "celebrateJump 1.5s ease-in-out infinite" : "bounce 3s ease-in-out infinite",
        display: "inline-block",
      }}>
        <img
          src={stars >= 2 ? IMG.family : IMG.daddy}
          alt="result"
          style={{ width: stars >= 2 ? 160 : 120, height: "auto" }}
          draggable={false}
        />
      </div>

      {/* ほし 0-3 */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 16 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              fontSize: 52,
              filter: i < stars ? "none" : "grayscale(1) opacity(0.35)",
              animation: i < stars ? `starPop 0.5s ease ${0.2 + i * 0.25}s both` : "none",
            }}
          >
            ⭐
          </span>
        ))}
      </div>

      <div style={{
        display: "inline-block",
        background: stars >= 3 ? "#DFF7FF" : stars >= 1 ? "#FFF8D6" : "#FFF5FA",
        borderRadius: "var(--radius-pill)",
        padding: "8px 28px",
        marginTop: 14,
      }}>
        <h2 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>{STAR_MSG[stars]}</h2>
      </div>

      <div style={{
        display: "flex", alignItems: "baseline", gap: 4,
        margin: "18px auto 0", padding: "12px 36px",
        background: "white", borderRadius: "var(--radius-pill)",
        boxShadow: "var(--shadow-card)",
        width: "fit-content",
      }}>
        <span style={{ fontSize: 44, fontWeight: 900, color: "#53CEFF" }}>{firstTry}</span>
        <span style={{ fontSize: 20, color: "var(--text-light)", fontWeight: 700 }}> / {total}</span>
      </div>

      {/* レベルの すすみぐあい */}
      <div style={{
        marginTop: 20, padding: "16px 20px",
        background: "white", borderRadius: "var(--radius-sm)",
        boxShadow: "var(--shadow-card)",
      }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-light)", marginBottom: 8 }}>
          {leveledUp
            ? <>🎖️ <span style={{ color: "#FF9500" }}>レベル{newLevel}</span> に あがったよ！</>
            : <>レベル{level} — つぎの レベルまで ⭐ あと {Math.max(0, spNeed - sp)}</>}
        </div>
        <div style={{ background: "#F0F0F0", borderRadius: "var(--radius-pill)", height: 12, overflow: "hidden" }}>
          <div style={{
            width: `${Math.min(100, (sp / spNeed) * 100)}%`,
            height: "100%",
            background: "linear-gradient(90deg, #53CEFF, #A659FF)",
            borderRadius: "var(--radius-pill)",
            transition: "width 0.6s ease",
          }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
        <button onClick={onBack} className="pressable" style={{
          flex: 1, padding: "18px", background: "#F5F5F5", border: "none",
          borderRadius: "var(--radius-pill)", fontSize: 18, fontWeight: 800,
          fontFamily: "inherit", cursor: "pointer",
        }}>
          🏠 もどる
        </button>
        <button onClick={onRetry} className="pressable" style={{
          flex: 1, padding: "18px",
          background: "linear-gradient(135deg, #53CEFF, #4FB8E8)",
          border: "none", borderRadius: "var(--radius-pill)",
          fontSize: 18, fontWeight: 800, fontFamily: "inherit",
          color: "white", cursor: "pointer",
          boxShadow: "0 4px 16px rgba(83,206,255,0.35)",
        }}>
          🔄 もういちど
        </button>
      </div>
    </div>
  );
}

// ─── 4たく クイズエンジン ───────────────────────────────────────────────────
// q: { display?, question, options[], answer, hint?, speakText?, optionRender?, optionFontSize? }
export function ChoiceRound({ round, color, onSpeak }) {
  const { cur: q, pos, queueLength, isReview, submit } = round;
  const [selected, setSelected] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // もんだいが かわったら よみあげ
  useEffect(() => {
    setSelected(null);
    if (onSpeak && q) onSpeak(q);
  }, [q]);

  if (!q) return null;

  const handleAnswer = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === q.answer;
    if (correct) {
      playDing();
      setConfetti(true);
      timers.current.push(setTimeout(() => setConfetti(false), 1400));
    } else {
      playBuzz();
    }
    if (q.onAnswered) q.onAnswered(correct);
    timers.current.push(setTimeout(() => {
      submit(correct, true);
      setSelected(null);
    }, correct ? 1100 : 1600));
  };

  return (
    <div>
      <ConfettiEffect active={confetti} />
      <RoundProgress pos={pos} total={queueLength} color={color} review={isReview} />

      {/* もんだい カード */}
      <div
        key={`${round.roundId}-${round.phase}-${pos}`}
        style={{
          background: "white",
          borderRadius: "var(--radius)",
          padding: "28px 24px",
          textAlign: "center",
          boxShadow: "var(--shadow-card)",
          marginBottom: 20,
          animation: "popIn 0.3s ease",
        }}
      >
        {q.display}
        <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.6, marginTop: q.display ? 10 : 0 }}>
          {q.question}
        </div>
        {q.hint && selected !== null && (
          <div style={{ fontSize: 14, color: "var(--text-light)", marginTop: 8 }}>💡 {q.hint}</div>
        )}
      </div>

      {/* せんたくし */}
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
              className="pressable"
              style={{
                padding: "18px 12px",
                background: bg,
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: q.optionFontSize || (String(opt).length <= 2 ? 36 : 20),
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
                color: "var(--text)",
                lineHeight: 1.3,
              }}
            >
              {q.optionRender ? q.optionRender(opt) : opt}
              {selected !== null && isCorrect && <span style={{ marginLeft: 6 }}>✅</span>}
              {selected !== null && isSelected && !isCorrect && <span style={{ marginLeft: 6 }}>❌</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── タイルならべ ボード (ことばづくり・えいごの つづり) ────────────────────
export function TileBoard({ answer, decoys, resetKey, onCorrect, onWrong, tileFontSize = 26 }) {
  const [placed, setPlaced] = useState([]); // [{id, t}]
  const [pool, setPool] = useState([]);     // [{id, t, used}]
  const [flash, setFlash] = useState(null); // 'ok' | 'ng' | null
  const timers = useRef([]);
  const judging = useRef(false);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    judging.current = false;
    setPlaced([]);
    setFlash(null);
    setPool(shuffle([...answer, ...decoys]).map((t, i) => ({ id: i, t, used: false })));
  }, [resetKey]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapPool = (tile) => {
    if (tile.used || flash !== null || judging.current) return;
    const nextPlaced = [...placed, tile];
    setPool((p) => p.map((x) => (x.id === tile.id ? { ...x, used: true } : x)));
    setPlaced(nextPlaced);

    if (nextPlaced.length === answer.length) {
      judging.current = true;
      const word = nextPlaced.map((x) => x.t).join("");
      const ok = word === answer.join("");
      timers.current.push(setTimeout(() => {
        setFlash(ok ? "ok" : "ng");
        if (ok) {
          playDing();
          timers.current.push(setTimeout(() => onCorrect(), 900));
        } else {
          playBuzz();
          onWrong();
          timers.current.push(setTimeout(() => {
            setPlaced([]);
            setPool((p) => p.map((x) => ({ ...x, used: false })));
            setFlash(null);
            judging.current = false;
          }, 900));
        }
      }, 250));
    }
  };

  const backspace = () => {
    if (flash !== null || judging.current || placed.length === 0) return;
    const last = placed[placed.length - 1];
    setPlaced((p) => p.slice(0, -1));
    setPool((p) => p.map((x) => (x.id === last.id ? { ...x, used: false } : x)));
  };

  const slotSize = answer.length >= 6 ? 48 : answer.length >= 5 ? 56 : 64;

  return (
    <div>
      {/* こたえの わく */}
      <div
        style={{
          display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap",
          marginBottom: 20,
          animation: flash === "ng" ? "shake 0.4s ease" : "none",
        }}
      >
        {answer.map((_, i) => {
          const tile = placed[i];
          return (
            <div
              key={i}
              onClick={backspace}
              style={{
                width: slotSize, height: slotSize,
                borderRadius: 14,
                background: tile
                  ? flash === "ok" ? "#E0FFE8" : flash === "ng" ? "#FFE0EA" : "white"
                  : "rgba(255,255,255,0.6)",
                border: tile ? "2px solid rgba(83,206,255,0.4)" : "2px dashed rgba(131,149,167,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: tileFontSize,
                fontWeight: 900,
                boxShadow: tile ? "var(--shadow-card)" : "none",
                cursor: tile ? "pointer" : "default",
                transition: "all 0.15s ease",
              }}
            >
              {tile ? tile.t : ""}
            </div>
          );
        })}
      </div>

      {/* タイル おきば */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        {pool.map((tile) => (
          <button
            key={tile.id}
            onClick={() => tapPool(tile)}
            className="pressable"
            style={{
              width: 60, height: 60,
              borderRadius: 16,
              background: tile.used ? "#F0F0F0" : "white",
              border: "none",
              fontSize: tileFontSize,
              fontWeight: 900,
              fontFamily: "inherit",
              color: tile.used ? "transparent" : "var(--text)",
              cursor: tile.used ? "default" : "pointer",
              boxShadow: tile.used ? "inset 0 1px 4px rgba(0,0,0,0.08)" : "0 3px 10px rgba(83,206,255,0.25)",
              transition: "all 0.15s ease",
            }}
          >
            {tile.t}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <button onClick={backspace} className="pressable" style={{
          padding: "10px 28px", background: "#F5F5F5", border: "none",
          borderRadius: "var(--radius-pill)", fontSize: 16, fontWeight: 800,
          fontFamily: "inherit", cursor: "pointer", color: "var(--text-light)",
        }}>
          ⌫ ひとつ けす
        </button>
      </div>
    </div>
  );
}

// ─── すうじ キーパッド ──────────────────────────────────────────────────────
export function Keypad({ onDigit, onDelete, onSubmit, disabled }) {
  const keyStyle = {
    padding: "16px 0",
    fontSize: 26,
    fontWeight: 900,
    fontFamily: "inherit",
    border: "none",
    borderRadius: 18,
    background: "white",
    boxShadow: "var(--shadow-card)",
    cursor: "pointer",
    color: "var(--text)",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, maxWidth: 320, margin: "0 auto" }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
        <button key={d} disabled={disabled} className="pressable" style={keyStyle} onClick={() => onDigit(String(d))}>
          {d}
        </button>
      ))}
      <button disabled={disabled} className="pressable" style={{ ...keyStyle, background: "#F5F5F5", fontSize: 22 }} onClick={onDelete}>
        ⌫
      </button>
      <button disabled={disabled} className="pressable" style={keyStyle} onClick={() => onDigit("0")}>
        0
      </button>
      <button
        disabled={disabled}
        className="pressable"
        style={{
          ...keyStyle,
          background: "linear-gradient(135deg, #4CD964, #38B24A)",
          color: "white",
          boxShadow: "0 4px 14px rgba(76,217,100,0.35)",
        }}
        onClick={onSubmit}
      >
        ✓
      </button>
    </div>
  );
}
