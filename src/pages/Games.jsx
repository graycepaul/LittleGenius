import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { triggerStarBurst } from "../components/ui/StarBurst";
import PageHeader from "../components/ui/PageHeader";
import { useSpeech } from "../hooks/useSpeech";

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─────────────────────────────────────────────
// Game 1: Memory Match
// ─────────────────────────────────────────────
const PAIRS = [
  { letter: "A", emoji: "🍎" },
  { letter: "B", emoji: "⚽" },
  { letter: "C", emoji: "🐱" },
  { letter: "D", emoji: "🐶" },
  { letter: "E", emoji: "🐘" },
  { letter: "F", emoji: "🐠" },
  { letter: "G", emoji: "🍇" },
  { letter: "H", emoji: "🎩" },
];

function buildDeck() {
  const cards = [];
  PAIRS.forEach((pair, pairIdx) => {
    cards.push({ id: pairIdx * 2,     pairId: pairIdx, kind: "letter", content: pair.letter });
    cards.push({ id: pairIdx * 2 + 1, pairId: pairIdx, kind: "emoji",  content: pair.emoji  });
  });
  return shuffle(cards).map((c, i) => ({ ...c, pos: i }));
}

function MemoryMatch({ onBack }) {
  const { addStars, earnBadge } = useApp();
  const { speak } = useSpeech();
  const [deck, setDeck] = useState(() => buildDeck());
  const [flipped, setFlipped] = useState([]); // positions of currently revealed (not-matched) cards
  const [matched, setMatched] = useState([]); // pairIds that are matched
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (won) clearInterval(timerRef.current);
  }, [won]);

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function handleFlip(card) {
    if (locked) return;
    if (flipped.includes(card.pos)) return;
    if (matched.includes(card.pairId)) return;

    const newFlipped = [...flipped, card.pos];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      const [posA, posB] = newFlipped;
      const cardA = deck.find((c) => c.pos === posA);
      const cardB = deck.find((c) => c.pos === posB);

      if (cardA.pairId === cardB.pairId) {
        const newMatched = [...matched, cardA.pairId];
        setMatched(newMatched);
        setFlipped([]);
        setLocked(false);
        const pair = PAIRS[cardA.pairId];
        speak(`${pair.letter} for ${pair.emoji}`);
        if (newMatched.length === PAIRS.length) {
          setTimeout(() => {
            setWon(true);
            addStars(8);
            earnBadge({ id: "memory-master", name: "Memory Master", emoji: "🧠" });
            triggerStarBurst();
          }, 400);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 1000);
      }
    }
  }

  function restart() {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setLocked(false);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  if (won) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="el-card p-8 text-center max-w-sm mx-auto"
      >
        <div className="text-6xl mb-3">🧠</div>
        <h2 className="font-fun text-3xl mb-1" style={{ color: "#8B5CF6" }}>
          Amazing!
        </h2>
        <p className="font-semibold mb-4" style={{ color: "var(--c-muted)" }}>
          You matched all 8 pairs in {moves} moves and {formatTime(seconds)}!
        </p>
        <div
          className="rounded-2xl p-4 mb-5 font-fun text-2xl"
          style={{ background: "var(--c-gold-light)", color: "var(--c-gold)" }}
        >
          ⭐ +8 Stars earned!
        </div>
        <div className="flex gap-3 justify-center">
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="btn-primary"
            onClick={restart}
          >
            Play Again 🔄
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="btn-primary"
            style={{ background: "#6B7280" }}
          >
            Back 🏠
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Stats bar */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="btn-primary text-sm px-4 py-2"
          style={{ background: "#6B7280" }}
        >
          ← Back
        </motion.button>
        <div className="flex gap-3">
          <div
            className="rounded-xl px-4 py-2 font-fun text-lg"
            style={{ background: "var(--c-primary-light)", color: "var(--c-primary)" }}
          >
            🔄 {moves}
          </div>
          <div
            className="rounded-xl px-4 py-2 font-fun text-lg"
            style={{ background: "var(--c-primary-light)", color: "var(--c-primary)" }}
          >
            ⏱ {formatTime(seconds)}
          </div>
          <div
            className="rounded-xl px-4 py-2 font-fun text-lg"
            style={{ background: "var(--c-gold-light)", color: "var(--c-gold)" }}
          >
            ✅ {matched.length}/8
          </div>
        </div>
      </div>

      {/* 4×4 grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.pos) || matched.includes(card.pairId);
          const isMatched = matched.includes(card.pairId);
          return (
            <div
              key={card.id}
              className="card-flip"
              style={{ height: 90, cursor: isMatched ? "default" : "pointer" }}
              onClick={() => !isMatched && handleFlip(card)}
            >
              <div className={`card-flip-inner${isFlipped ? " flipped" : ""}`} style={{ height: "100%" }}>
                {/* Front (face-down) */}
                <div
                  className="card-front rounded-2xl flex items-center justify-center"
                  style={{
                    height: "100%",
                    background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                    border: "2px solid #7C3AED",
                    fontSize: "1.8rem",
                  }}
                >
                  ❓
                </div>
                {/* Back (face-up) */}
                <div
                  className="card-back rounded-2xl flex items-center justify-center"
                  style={{
                    height: "100%",
                    background: isMatched ? "#D1FAE5" : "#EEF2FF",
                    border: isMatched ? "2.5px solid #10B981" : "2px solid #A5B4FC",
                    fontSize: card.kind === "letter" ? "2rem" : "2rem",
                    fontFamily: card.kind === "letter" ? "'Fredoka One', cursive" : "inherit",
                    color: card.kind === "letter" ? "var(--c-primary)" : "inherit",
                    boxShadow: isMatched ? "0 0 12px rgba(16,185,129,0.35)" : "none",
                  }}
                >
                  {card.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Game 2: Balloon Pop
// ─────────────────────────────────────────────
const BALLOON_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

function generateRound() {
  // Pick 5 random unique numbers 1-20
  const nums = [];
  while (nums.length < 5) {
    const n = Math.floor(Math.random() * 20) + 1;
    if (!nums.includes(n)) nums.push(n);
  }

  // Decide question type
  const answerNum = nums[Math.floor(Math.random() * nums.length)];
  const useSum = Math.random() > 0.4 && answerNum > 1;
  let question, answer;
  if (useSum) {
    const a = Math.floor(Math.random() * (answerNum - 1)) + 1;
    const b = answerNum - a;
    question = `Pop: ${a} + ${b}`;
    answer = answerNum;
  } else {
    question = `Pop the number: ${answerNum}`;
    answer = answerNum;
  }

  // Assign horizontal positions
  const balloons = nums.map((num, i) => ({
    id: i,
    num,
    isAnswer: num === answer,
    xPct: 10 + i * 18 + Math.random() * 6,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    delay: Math.random() * 0.5,
  }));

  return { balloons, question, answer };
}

function BalloonPop({ onBack }) {
  const { addStars, earnBadge } = useApp();
  const { speak } = useSpeech();
  const [round, setRound] = useState(1);
  const TOTAL_ROUNDS = 10;
  const [roundData, setRoundData] = useState(() => generateRound());
  const [popped, setPopped] = useState(null);   // balloon id that was tapped
  const [wrong, setWrong] = useState(null);     // balloon id that was wrong
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  function nextRound(newScore) {
    setTransitioning(true);
    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        addStars(newScore);
        if (newScore >= 8) earnBadge({ id: "balloon-ace", name: "Balloon Ace", emoji: "🎈" });
        triggerStarBurst();
        setWon(true);
      } else {
        setRound((r) => r + 1);
        setRoundData(generateRound());
        setPopped(null);
        setWrong(null);
        setTransitioning(false);
      }
    }, 900);
  }

  function handleBalloon(balloon) {
    if (popped !== null || transitioning) return;
    if (balloon.isAnswer) {
      speak("Pop! Great job!");
      setPopped(balloon.id);
      const newScore = score + 1;
      setScore(newScore);
      nextRound(newScore);
    } else {
      setWrong(balloon.id);
      speak("Not that one! Try again!");
      setTimeout(() => setWrong(null), 800);
    }
  }

  function restart() {
    setRound(1);
    setRoundData(generateRound());
    setPopped(null);
    setWrong(null);
    setScore(0);
    setWon(false);
    setTransitioning(false);
  }

  if (won) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="el-card p-8 text-center max-w-sm mx-auto"
      >
        <div className="text-6xl mb-3">🎈</div>
        <h2 className="font-fun text-3xl mb-1" style={{ color: "#EF4444" }}>
          Boom! 🎉
        </h2>
        <p className="font-semibold mb-4" style={{ color: "var(--c-muted)" }}>
          You popped {score} out of {TOTAL_ROUNDS} correct!
        </p>
        <div
          className="rounded-2xl p-4 mb-5 font-fun text-2xl"
          style={{ background: "var(--c-gold-light)", color: "var(--c-gold)" }}
        >
          ⭐ +{score} Stars earned!
        </div>
        <div className="flex gap-3 justify-center">
          <motion.button whileTap={{ scale: 0.96 }} className="btn-primary" onClick={restart}>
            Play Again 🔄
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="btn-primary"
            style={{ background: "#6B7280" }}
          >
            Back 🏠
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="btn-primary text-sm px-4 py-2"
          style={{ background: "#6B7280" }}
        >
          ← Back
        </motion.button>
        <div className="flex gap-3">
          <div
            className="rounded-xl px-4 py-2 font-fun text-lg"
            style={{ background: "#FEE2E2", color: "#EF4444" }}
          >
            Round {round}/{TOTAL_ROUNDS}
          </div>
          <div
            className="rounded-xl px-4 py-2 font-fun text-lg"
            style={{ background: "var(--c-gold-light)", color: "var(--c-gold)" }}
          >
            ⭐ {score}
          </div>
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="el-card p-5 mb-4 text-center"
        >
          <p className="font-fun text-3xl" style={{ color: "var(--c-primary)" }}>
            {roundData.question}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Balloon arena */}
      <div
        style={{
          position: "relative",
          height: 320,
          background: "linear-gradient(180deg, #DBEAFE 0%, #EEF2FF 100%)",
          borderRadius: 24,
          overflow: "hidden",
          border: "1.5px solid var(--c-border)",
        }}
      >
        <AnimatePresence>
          {roundData.balloons.map((balloon) => {
            const isPopped = popped === balloon.id;
            const isWrong = wrong === balloon.id;
            if (isPopped) return null;
            return (
              <motion.button
                key={`${round}-${balloon.id}`}
                initial={{ y: 360, x: 0 }}
                animate={
                  isWrong
                    ? { y: 20, x: [0, -10, 10, -8, 8, 0], backgroundColor: "#FCA5A5" }
                    : { y: [360, 20], transition: { duration: 3 + balloon.delay, ease: "easeOut", repeat: Infinity, repeatType: "reverse" } }
                }
                style={{
                  position: "absolute",
                  left: `${balloon.xPct}%`,
                  bottom: 0,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                onClick={() => handleBalloon(balloon)}
              >
                {/* Balloon body */}
                <div
                  style={{
                    width: 68,
                    height: 80,
                    borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                    background: balloon.color,
                    boxShadow: "inset -8px -8px 16px rgba(0,0,0,0.15), inset 4px 4px 8px rgba(255,255,255,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontFamily: "'Fredoka One', cursive",
                    color: "#fff",
                    fontWeight: "bold",
                    position: "relative",
                    userSelect: "none",
                  }}
                >
                  {balloon.num}
                  {/* Shine */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 14,
                      width: 14,
                      height: 20,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.35)",
                      transform: "rotate(-30deg)",
                    }}
                  />
                </div>
                {/* String */}
                <div style={{ width: 2, height: 28, background: balloon.color, opacity: 0.7 }} />
              </motion.button>
            );
          })}
        </AnimatePresence>
        {/* Clouds */}
        <div style={{ position: "absolute", top: 12, left: 20, opacity: 0.4, fontSize: "2rem", pointerEvents: "none" }}>☁️</div>
        <div style={{ position: "absolute", top: 30, right: 30, opacity: 0.3, fontSize: "1.5rem", pointerEvents: "none" }}>☁️</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Game 3: Spell It
// ─────────────────────────────────────────────
const SPELL_WORDS = [
  { word: "cat", emoji: "🐱" },
  { word: "dog", emoji: "🐶" },
  { word: "sun", emoji: "☀️" },
  { word: "hat", emoji: "🎩" },
  { word: "red", emoji: "🔴" },
  { word: "big", emoji: "🐘" },
  { word: "run", emoji: "🏃" },
  { word: "cup", emoji: "☕" },
  { word: "fox", emoji: "🦊" },
  { word: "ten", emoji: "🔟" },
  { word: "bat", emoji: "🦇" },
  { word: "pen", emoji: "✏️" },
  { word: "pig", emoji: "🐷" },
  { word: "hop", emoji: "🐸" },
  { word: "wet", emoji: "💧" },
  { word: "map", emoji: "🗺️" },
];

function pickWords(count) {
  return shuffle(SPELL_WORDS).slice(0, count);
}

function SpellIt({ onBack }) {
  const { addStars, earnBadge } = useApp();
  const { speak, speakSlow } = useSpeech();
  const TOTAL = 10;
  const [wordList] = useState(() => pickWords(TOTAL));
  const [wordIdx, setWordIdx] = useState(0);
  const [typed, setTyped] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | correct | wrong
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);

  const currentEntry = wordList[wordIdx];
  const { word, emoji } = currentEntry;
  const letters = shuffle(word.split(""));

  useEffect(() => {
    speakSlow(word);
  }, [wordIdx]);

  useEffect(() => {
    if (typed.length === word.length && status === "idle") {
      const attempt = typed.join("");
      if (attempt === word) {
        setStatus("correct");
        speak("Correct! Great spelling!");
        const newScore = score + 1;
        setScore(newScore);
        setTimeout(() => {
          if (wordIdx + 1 >= TOTAL) {
            addStars(newScore);
            if (newScore >= 8) earnBadge({ id: "spell-star", name: "Spell Star", emoji: "🔤" });
            triggerStarBurst();
            setWon(true);
          } else {
            setWordIdx((i) => i + 1);
            setTyped([]);
            setStatus("idle");
          }
        }, 1200);
      } else {
        setStatus("wrong");
        speak("Hmm, try again!");
        setTimeout(() => {
          setTyped([]);
          setStatus("idle");
        }, 900);
      }
    }
  }, [typed]);

  function restart() {
    window.location.reload(); // simplest full restart
  }

  if (won) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="el-card p-8 text-center max-w-sm mx-auto"
      >
        <div className="text-6xl mb-3">🔤</div>
        <h2 className="font-fun text-3xl mb-1" style={{ color: "#10B981" }}>
          Brilliant Speller!
        </h2>
        <p className="font-semibold mb-4" style={{ color: "var(--c-muted)" }}>
          You spelled {score} out of {TOTAL} words correctly!
        </p>
        <div
          className="rounded-2xl p-4 mb-5 font-fun text-2xl"
          style={{ background: "var(--c-gold-light)", color: "var(--c-gold)" }}
        >
          ⭐ +{score} Stars earned!
        </div>
        <div className="flex gap-3 justify-center">
          <motion.button whileTap={{ scale: 0.96 }} className="btn-primary" onClick={restart}>
            Play Again 🔄
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="btn-primary"
            style={{ background: "#6B7280" }}
          >
            Back 🏠
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Track which letter tiles are already used, reset when word changes
  const [usedTileIds, setUsedTileIds] = useState([]);

  // Reset used tiles when word changes
  const prevWordIdx = useRef(wordIdx);
  const [stableTiles, setStableTiles] = useState(() =>
    shuffle(word.split("")).map((l, i) => ({ id: i, letter: l }))
  );

  useEffect(() => {
    if (wordIdx !== prevWordIdx.current) {
      prevWordIdx.current = wordIdx;
      setStableTiles(shuffle(wordList[wordIdx].word.split("")).map((l, i) => ({ id: i, letter: l })));
      setUsedTileIds([]);
    }
  }, [wordIdx]);

  function handleTileTap(tile) {
    if (status !== "idle") return;
    if (usedTileIds.includes(tile.id)) return;
    if (typed.length >= word.length) return;
    setUsedTileIds((prev) => [...prev, tile.id]);
    setTyped((prev) => [...prev, tile.letter]);
  }

  function handleDeleteWithTile() {
    if (status !== "idle") return;
    if (typed.length === 0) return;
    // Un-use the last used tile
    setUsedTileIds((prev) => prev.slice(0, -1));
    setTyped((prev) => prev.slice(0, -1));
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onBack}
          className="btn-primary text-sm px-4 py-2"
          style={{ background: "#6B7280" }}
        >
          ← Back
        </motion.button>
        <div className="flex gap-3">
          <div
            className="rounded-xl px-4 py-2 font-fun text-lg"
            style={{ background: "#D1FAE5", color: "#10B981" }}
          >
            Word {wordIdx + 1}/{TOTAL}
          </div>
          <div
            className="rounded-xl px-4 py-2 font-fun text-lg"
            style={{ background: "var(--c-gold-light)", color: "var(--c-gold)" }}
          >
            ⭐ {score}
          </div>
        </div>
      </div>

      {/* Word card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={wordIdx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="el-card p-6 text-center mb-5"
        >
          {/* Emoji hint */}
          <motion.div
            className="text-7xl mb-3 inline-block"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {emoji}
          </motion.div>

          {/* Speak button */}
          <div className="mb-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => speakSlow(word)}
              className="rounded-full px-4 py-2 font-semibold text-sm"
              style={{ background: "#EEF2FF", color: "var(--c-primary)", border: "1.5px solid var(--c-border)" }}
            >
              🔊 Hear it again
            </motion.button>
          </div>

          {/* Blanks */}
          <div className="flex justify-center gap-3 mb-2">
            {Array.from({ length: word.length }).map((_, i) => {
              const letter = typed[i];
              const isWrong = status === "wrong";
              const isCorrect = status === "correct";
              return (
                <motion.div
                  key={i}
                  animate={
                    isWrong && letter
                      ? { x: [0, -6, 6, -5, 5, 0] }
                      : isCorrect && letter
                      ? { scale: [1, 1.15, 1] }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                  style={{
                    width: 52,
                    height: 60,
                    borderRadius: 12,
                    border: `2.5px solid ${
                      isWrong && letter
                        ? "#EF4444"
                        : isCorrect && letter
                        ? "#10B981"
                        : letter
                        ? "var(--c-primary)"
                        : "var(--c-border)"
                    }`,
                    background: isWrong && letter
                      ? "#FEE2E2"
                      : isCorrect && letter
                      ? "#D1FAE5"
                      : letter
                      ? "var(--c-primary-light)"
                      : "var(--c-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Fredoka One', cursive",
                    fontSize: "1.8rem",
                    color: isWrong ? "#EF4444" : isCorrect ? "#10B981" : "var(--c-primary)",
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  {letter || ""}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Letter tiles */}
      <div className="flex justify-center flex-wrap gap-3 mb-4">
        {stableTiles.map((tile) => {
          const used = usedTileIds.includes(tile.id);
          return (
            <motion.button
              key={tile.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleTileTap(tile)}
              disabled={used || status !== "idle"}
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                border: "2.5px solid",
                borderColor: used ? "var(--c-border)" : "var(--c-primary)",
                background: used ? "var(--c-bg)" : "var(--c-primary-light)",
                fontFamily: "'Fredoka One', cursive",
                fontSize: "1.6rem",
                color: used ? "var(--c-border)" : "var(--c-primary)",
                cursor: used ? "not-allowed" : "pointer",
                opacity: used ? 0.4 : 1,
                transition: "all 0.15s",
              }}
            >
              {tile.letter.toUpperCase()}
            </motion.button>
          );
        })}
      </div>

      {/* Delete button */}
      <div className="flex justify-center">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleDeleteWithTile}
          disabled={typed.length === 0 || status !== "idle"}
          className="btn-primary"
          style={{ background: "#EF4444", minWidth: 120 }}
        >
          ⌫ Delete
        </motion.button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Games home screen
// ─────────────────────────────────────────────
const GAME_CARDS = [
  {
    id: "memory",
    emoji: "🃏",
    label: "Memory Match",
    desc: "Find the matching pairs!",
    accent: "#8B5CF6",
  },
  {
    id: "balloon",
    emoji: "🎈",
    label: "Balloon Pop",
    desc: "Pop the right number!",
    accent: "#EF4444",
  },
  {
    id: "spell",
    emoji: "🔤",
    label: "Spell It",
    desc: "Tap the letters to spell words!",
    accent: "#10B981",
  },
];

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────
export default function Games() {
  const [activeGame, setActiveGame] = useState(null); // null | 'memory' | 'balloon' | 'spell'

  function goBack() {
    setActiveGame(null);
  }

  return (
    <div>
      <PageHeader
        emoji="🎮"
        title="Games"
        subtitle="Play and learn!"
        accentColor="#8B5CF6"
      />

      <AnimatePresence mode="wait">
        {activeGame === null && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GAME_CARDS.map((card, i) => (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveGame(card.id)}
                  className="el-card text-left overflow-hidden group"
                >
                  {/* Accent strip */}
                  <div
                    className="h-24 flex items-center justify-center"
                    style={{ background: `${card.accent}18` }}
                  >
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-transform group-hover:scale-110"
                      style={{ background: card.accent }}
                    >
                      {card.emoji}
                    </div>
                  </div>
                  <div className="p-4 pb-5">
                    <h3
                      className="font-fun text-xl leading-tight"
                      style={{ color: "var(--c-text)" }}
                    >
                      {card.label}
                    </h3>
                    <p
                      className="text-sm font-semibold mt-1"
                      style={{ color: "var(--c-muted)" }}
                    >
                      {card.desc}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {activeGame === "memory" && (
          <motion.div
            key="memory"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <MemoryMatch onBack={goBack} />
          </motion.div>
        )}

        {activeGame === "balloon" && (
          <motion.div
            key="balloon"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <BalloonPop onBack={goBack} />
          </motion.div>
        )}

        {activeGame === "spell" && (
          <motion.div
            key="spell"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <SpellIt onBack={goBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
