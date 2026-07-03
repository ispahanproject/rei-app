// ─── ユーティリティ・音・保存 ────────────────────────────────────────────────

// Fisher-Yates シャッフル (偏りなし)
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = (arr, n) => shuffle(arr).slice(0, n);
export const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ことばを モーラ(拍)単位に分割: 「ぎゅうにゅう」→ ぎゅ|う|にゅ|う、「らっぱ」→ ら|っ|ぱ
const SMALL_KANA = "ゃゅょぁぃぅぇぉャュョァィゥェォ";
export function splitMora(word) {
  const out = [];
  for (let i = 0; i < word.length; i++) {
    const c = word[i];
    const next = word[i + 1];
    if (next && SMALL_KANA.includes(next)) {
      out.push(c + next);
      i++;
    } else {
      out.push(c);
    }
  }
  return out;
}

// ─── 効果音 (Web Audio、ファイル不要) ───────────────────────────────────────
let _audioCtx = null;
export function playTune(notes) {
  try {
    _audioCtx = _audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    notes.forEach(([freq, start, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t0 = ctx.currentTime + start;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    });
  } catch (e) { /* おとが でなくても アプリは うごく */ }
}
export const playDing = () => playTune([[784, 0, 0.18], [1047, 0.12, 0.3]]);
export const playBuzz = () => playTune([[330, 0, 0.15], [262, 0.12, 0.28]]);
export const playFanfare = () =>
  playTune([[523, 0, 0.2], [659, 0.18, 0.2], [784, 0.36, 0.2], [1047, 0.54, 0.5]]);
export const playLevelUp = () =>
  playTune([[523, 0, 0.15], [659, 0.12, 0.15], [784, 0.24, 0.15], [1047, 0.36, 0.2], [1319, 0.5, 0.45]]);

// ─── 読み上げ (Web Speech API) ──────────────────────────────────────────────
export function speak(text, lang = "ja-JP", rate = 0.85) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    window.speechSynthesis.speak(u);
  } catch (e) { /* よみあげ できなくても うごく */ }
}
export const speakEn = (text) => speak(text, "en-US", 0.8);

// ─── localStorage 保存 ──────────────────────────────────────────────────────
export function loadJSON(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v == null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* むし */ }
}

// 日付フォーマット
export const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
export function formatStampDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return `${d.getMonth() + 1}/${d.getDate()}`;
}
export function formatStampDateLong(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return `${d.getMonth() + 1}月${d.getDate()}日(${WEEKDAYS_JA[d.getDay()]})`;
}
