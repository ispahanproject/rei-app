import { pick, shuffle, speak } from "../lib.js";
import { flagPool, ROUND_SIZE } from "../data.js";
import { useRoundQueue, ResultScreen, ChoiceRound } from "../engine.jsx";
import { InnerTopBar, FlagImage } from "../theme.jsx";

function genQuestions(level) {
  const pool = flagPool(level);
  return pick(pool, ROUND_SIZE).map((f) => ({
    display: (
      <div style={{ marginBottom: 4, animation: "popIn 0.4s ease" }}>
        <FlagImage code={f.code} size="large" />
      </div>
    ),
    question: "この こっきは どこの くに？",
    options: shuffle([f.name, ...pick(pool.filter((o) => o.name !== f.name), 3).map((o) => o.name)]),
    answer: f.name,
    hint: f.hint,
    optionFontSize: 18,
    onAnswered: (ok) => speak(ok ? f.name : `せいかいは、${f.name}`),
  }));
}

export default function FlagsGame({ level, color, onFinish, onBack }) {
  const round = useRoundQueue(() => genQuestions(level), onFinish);

  if (round.phase === "done") {
    return (
      <div>
        <InnerTopBar title="こっき けっか" onBack={onBack} />
        <ResultScreen outcome={round.outcome} onRetry={round.retry} onBack={onBack} />
      </div>
    );
  }

  return (
    <div>
      <InnerTopBar title="こっき" onBack={onBack} />
      <div style={{ padding: "8px 16px 120px", maxWidth: 500, margin: "0 auto" }}>
        <ChoiceRound round={round} color={color} />
      </div>
    </div>
  );
}
