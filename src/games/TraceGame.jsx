import { useEffect, useRef, useState } from "react";
import { pick, speak, playDing, playBuzz } from "../lib.js";
import { tracePool, ROUND_SIZE } from "../data.js";
import { useRoundQueue, ResultScreen } from "../engine.jsx";
import { InnerTopBar, RoundProgress, SpeakButton, ConfettiEffect } from "../theme.jsx";

const FONT_FAMILY = "'M PLUS Rounded 1c', sans-serif";

// ─── なぞりの じどうはんてい ────────────────────────────────────────────────
// かいた せんと おてほんの もじの かさなりを しらべる
// coverage: もじの どれだけを なぞれたか / precision: せんが もじから はみでていないか
export function evaluateTrace(strokes, char, w, h) {
  const pts = strokes.flat();
  if (pts.length < 8) return { pass: false, coverage: 0, precision: 0 };

  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const c = off.getContext("2d", { willReadFrequently: true });
  c.font = `bold ${Math.min(w, h) * 0.65}px ${FONT_FAMILY}`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(char, w / 2, h / 2);
  const data = c.getImageData(0, 0, w, h).data;
  const alphaAt = (x, y) =>
    x >= 0 && y >= 0 && x < w && y < h ? data[(y * w + x) * 4 + 3] : 0;

  // せんの ポイントを マスに わけて はやく さがせるように
  const CELL = 20;
  const grid = new Map();
  for (const p of pts) {
    const k = `${Math.floor(p.x / CELL)},${Math.floor(p.y / CELL)}`;
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(p);
  }
  const R = 18;
  const nearStroke = (x, y) => {
    const cx = Math.floor(x / CELL);
    const cy = Math.floor(y / CELL);
    for (let gx = cx - 1; gx <= cx + 1; gx++) {
      for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const cell = grid.get(`${gx},${gy}`);
        if (!cell) continue;
        for (const p of cell) {
          const dx = p.x - x;
          const dy = p.y - y;
          if (dx * dx + dy * dy <= R * R) return true;
        }
      }
    }
    return false;
  };

  // もじの ピクセルの うち、せんが ちかくに ある わりあい
  const STEP = 5;
  let glyph = 0;
  let hit = 0;
  for (let y = 0; y < h; y += STEP) {
    for (let x = 0; x < w; x += STEP) {
      if (alphaAt(x, y) > 40) {
        glyph++;
        if (nearStroke(x, y)) hit++;
      }
    }
  }

  // せんの ポイントの うち、もじの ちかくに ある わりあい
  const NEAR = 14;
  let inside = 0;
  let sampled = 0;
  for (let i = 0; i < pts.length; i += 3) {
    const p = pts[i];
    sampled++;
    const x0 = Math.round(p.x);
    const y0 = Math.round(p.y);
    let ok = false;
    for (let dy = -NEAR; dy <= NEAR && !ok; dy += 7) {
      for (let dx = -NEAR; dx <= NEAR && !ok; dx += 7) {
        if (alphaAt(x0 + dx, y0 + dy) > 40) ok = true;
      }
    }
    if (ok) inside++;
  }

  const coverage = glyph ? hit / glyph : 0;
  const precision = sampled ? inside / sampled : 0;
  return { pass: coverage >= 0.5 && precision >= 0.45, coverage, precision };
}

export default function TraceGame({ level, color, onFinish, onBack }) {
  const round = useRoundQueue(
    () => pick(tracePool(level), ROUND_SIZE).map((char) => ({ char })),
    onFinish
  );
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const strokesRef = useRef([]);
  const rectRef = useRef({ width: 0, height: 0 });
  const [drawing, setDrawing] = useState(false);
  const [verdict, setVerdict] = useState(null); // 'ok' | 'ng' | null
  const [confetti, setConfetti] = useState(false);
  const timers = useRef([]);

  const q = round.cur;
  const qKey = `${round.roundId}-${round.phase}-${round.pos}`;

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    rectRef.current = { width: rect.width, height: rect.height };
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // じゅうじの ガイドせん
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

    // おてほんの もじ
    if (q?.char) {
      ctx.fillStyle = "rgba(83, 206, 255, 0.14)";
      ctx.font = `bold ${Math.min(rect.width, rect.height) * 0.65}px ${FONT_FAMILY}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(q.char, rect.width / 2, rect.height / 2);
    }

    ctx.strokeStyle = "#53CEFF";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    strokesRef.current = [];
  };

  useEffect(() => {
    setVerdict(null);
    resetCanvas();
    if (q && round.phase !== "done") speak(`「${q.char}」を かいてみよう`);
    return () => timers.current.forEach(clearTimeout);
  }, [qKey]);

  if (round.phase === "done") {
    return (
      <div>
        <InnerTopBar title="かきかた けっか" onBack={onBack} />
        <ResultScreen outcome={round.outcome} onRetry={round.retry} onBack={onBack} />
      </div>
    );
  }
  if (!q) return null;

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };
  const startDraw = (e) => {
    e.preventDefault();
    if (verdict === "ok") return;
    setDrawing(true);
    const p = getPos(e);
    strokesRef.current.push([p]);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(p.x, p.y);
  };
  const draw = (e) => {
    e.preventDefault();
    if (!drawing || verdict === "ok") return;
    const p = getPos(e);
    strokesRef.current[strokesRef.current.length - 1].push(p);
    ctxRef.current.lineTo(p.x, p.y);
    ctxRef.current.stroke();
  };
  const endDraw = (e) => {
    e.preventDefault();
    setDrawing(false);
  };

  const judge = () => {
    if (verdict === "ok") return;
    const { width, height } = rectRef.current;
    const result = evaluateTrace(strokesRef.current, q.char, Math.round(width), Math.round(height));
    if (result.pass) {
      setVerdict("ok");
      playDing();
      setConfetti(true);
      timers.current.push(setTimeout(() => setConfetti(false), 1400));
      timers.current.push(setTimeout(() => round.submit(true, false), 1000));
    } else {
      setVerdict("ng");
      playBuzz();
      round.submit(false, false);
      timers.current.push(setTimeout(() => setVerdict(null), 1200));
    }
  };

  const skip = () => {
    speak(`「${q.char}」は また こんど れんしゅうしよう`);
    round.submit(false, true);
  };

  return (
    <div>
      <InnerTopBar title="かきかた" onBack={onBack} />
      <ConfettiEffect active={confetti} />
      <div style={{ padding: "8px 16px 120px", maxWidth: 500, margin: "0 auto", textAlign: "center" }}>
        <RoundProgress pos={round.pos} total={round.queueLength} color={color} review={round.isReview} />

        {/* おだい */}
        <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ fontSize: 44, fontWeight: 900, color }}>{q.char}</span>
          <span style={{ fontSize: 16, color: "var(--text-light)", fontWeight: 700 }}>
            うすい もじを なぞってね
          </span>
          <SpeakButton onSpeak={() => speak(`「${q.char}」`)} size={40} />
        </div>

        {/* キャンバス */}
        <div style={{
          position: "relative",
          borderRadius: "var(--radius)",
          overflow: "hidden",
          boxShadow: "var(--shadow-card)",
          border: `2px solid ${verdict === "ok" ? "#4CD964" : verdict === "ng" ? "#FF4B78" : "rgba(83,206,255,0.2)"}`,
          touchAction: "none",
          animation: verdict === "ng" ? "shake 0.4s ease" : "none",
        }}>
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
          {verdict && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              pointerEvents: "none",
              fontSize: 110,
              animation: "popIn 0.3s ease",
            }}>
              {verdict === "ok" ? "⭕" : "❌"}
            </div>
          )}
        </div>

        {/* ボタン */}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={resetCanvas} className="pressable" style={{
            flex: 1, padding: "16px", background: "#F5F5F5", border: "none",
            borderRadius: "var(--radius-pill)", fontSize: 17, fontWeight: 800,
            fontFamily: "inherit", cursor: "pointer",
          }}>
            🔄 けす
          </button>
          <button onClick={judge} className="pressable" style={{
            flex: 1.4, padding: "16px",
            background: `linear-gradient(135deg, ${color}, ${color}DD)`,
            border: "none", borderRadius: "var(--radius-pill)",
            fontSize: 17, fontWeight: 800, fontFamily: "inherit",
            color: "white", cursor: "pointer",
            boxShadow: `0 4px 16px ${color}40`,
          }}>
            ✅ かけた！
          </button>
          <button onClick={skip} className="pressable" style={{
            flex: 0.9, padding: "16px", background: "white", border: "none",
            borderRadius: "var(--radius-pill)", fontSize: 15, fontWeight: 800,
            fontFamily: "inherit", cursor: "pointer", color: "var(--text-light)",
            boxShadow: "var(--shadow-card)",
          }}>
            ⏭️ とばす
          </button>
        </div>
      </div>
    </div>
  );
}
