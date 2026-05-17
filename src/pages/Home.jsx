import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";
import { triggerStarBurst } from "../components/ui/StarBurst";

const NAV_CARDS = [
  {
    path: "/reading",
    emoji: "📖",
    label: "Reading Room",
    desc: "Read & listen to stories",
    accent: "var(--c-reading)",
  },
  {
    path: "/writing",
    emoji: "✏️",
    label: "Writing Pad",
    desc: "Write in colorful letters",
    accent: "var(--c-writing)",
  },
  {
    path: "/flashcards",
    emoji: "🃏",
    label: "Flash Cards",
    desc: "Letters, numbers & more",
    accent: "var(--c-cards)",
  },
  {
    path: "/math",
    emoji: "🔢",
    label: "Math World",
    desc: "Count, add & discover",
    accent: "var(--c-math)",
  },
  {
    path: "/tasks",
    emoji: "⚡",
    label: "Challenges",
    desc: "Fun tasks & earn stars",
    accent: "var(--c-tasks)",
  },
  {
    path: "/french",
    emoji: "🇫🇷",
    label: "French",
    desc: "Learn to speak French",
    accent: "var(--c-french)",
  },
  {
    path: "/bedtime",
    emoji: "🌙",
    label: "Bedtime Stories",
    desc: "Cozy stories to sleep to",
    accent: "var(--c-bedtime)",
  },
  {
    path: "/shelf",
    emoji: "📚",
    label: "My Shelf",
    desc: "Your stories & progress",
    accent: "var(--c-shelf)",
  },
  {
    path: "/games",
    emoji: "🎮",
    label: "Games",
    desc: "Play memory, balloons & spelling",
    accent: "#8B5CF6",
  },
];

function AvatarPicker({ onDone, isChanging = false }) {
  const { AVATARS, setProfile, profile } = useApp();
  const [selected, setSelected] = useState(isChanging ? profile?.avatar : null);
  const [name, setName] = useState(isChanging ? profile?.name : "");

  function handleStart() {
    if (!selected || !name.trim()) return;
    setProfile({ avatar: selected, name: name.trim() });
    triggerStarBurst();
    onDone();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, var(--c-primary) 0%, #7C3AED 100%)",
      }}
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="el-card p-8 max-w-md w-full text-center"
      >
        <div className="text-5xl mb-3 animate-float inline-block">👋</div>
        <h1
          className="font-fun text-3xl mb-1"
          style={{ color: "var(--c-primary)" }}
        >
          {isChanging ? "Change Avatar" : "Welcome!"}
        </h1>
        <p className="font-semibold mb-6" style={{ color: "var(--c-muted)" }}>
          Pick your animal friend and tell us your name!
        </p>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {AVATARS.map((av) => (
            <motion.button
              key={av.id}
              whileTap={{ scale: 0.88 }}
              onClick={() => setSelected(av)}
              className="text-4xl p-2 rounded-2xl transition-all"
              style={
                selected?.id === av.id
                  ? {
                      background: "var(--c-primary-light)",
                      outline: "3px solid var(--c-primary)",
                      transform: "scale(1.1)",
                    }
                  : { background: "#F9FAFB" }
              }
            >
              {av.emoji}
            </motion.button>
          ))}
        </div>

        <input
          type="text"
          placeholder="What is your name? 😊"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleStart()}
          className="w-full rounded-2xl px-4 py-3 text-xl font-semibold text-center outline-none mb-4"
          style={{
            border: "2.5px solid var(--c-border)",
            fontFamily: "Nunito, sans-serif",
          }}
          maxLength={20}
        />

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleStart}
          disabled={!selected || !name.trim()}
          className="btn-primary w-full text-2xl py-3"
        >
          {isChanging ? "Save! ✅" : "Let's Go! 🚀"}
        </motion.button>

        {isChanging && (
          <button
            onClick={onDone}
            className="mt-3 text-sm font-semibold"
            style={{ color: "var(--c-muted)" }}
          >
            Cancel
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { profile, stars, streak, badges } = useApp();
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(!profile);

  if (showPicker && !profile) {
    return <AvatarPicker onDone={() => setShowPicker(false)} />;
  }

  return (
    <div>
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 mb-6 text-white shadow-lg overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, var(--c-primary) 0%, #7C3AED 100%)",
        }}
      >
        {/* decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/10" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPicker(true)}
              className="text-5xl sm:text-6xl animate-float inline-block hover:scale-110 transition-transform"
            >
              {profile?.avatar?.emoji || "⭐"}
            </button>
            <div>
              <p className="text-white/70 font-semibold text-sm">
                Good to see you,
              </p>
              <h1 className="font-fun text-3xl sm:text-4xl">
                {profile?.name || "Learner"}! 👋
              </h1>
              <p className="text-white/80 font-semibold mt-0.5 text-sm">
                Ready to learn something amazing?
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl px-4 py-2 text-center bg-white/20 backdrop-blur-sm">
              <div className="font-fun text-2xl">⭐ {stars}</div>
              <div className="text-xs font-bold text-white/80">Stars</div>
            </div>
            <div className="rounded-2xl px-4 py-2 text-center bg-white/20 backdrop-blur-sm">
              <div className="font-fun text-2xl">🔥 {streak.count}</div>
              <div className="text-xs font-bold text-white/80">Streak</div>
            </div>
            {badges.length > 0 && (
              <div className="rounded-2xl px-4 py-2 text-center bg-white/20 backdrop-blur-sm">
                <div className="font-fun text-2xl">🏅 {badges.length}</div>
                <div className="text-xs font-bold text-white/80">Badges</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Streak nudge */}
      {streak.count >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-3"
          style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA" }}
        >
          <span className="text-2xl">🔥</span>
          <p className="font-semibold text-orange-700 text-sm">
            {streak.count} day streak — you're on fire! Keep it up!
          </p>
        </motion.div>
      )}

      {/* Section cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {NAV_CARDS.map((card, i) => (
          <motion.button
            key={card.path}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(card.path)}
            className="el-card text-left overflow-hidden group"
          >
            {/* Accent strip */}
            <div
              className="h-20 flex items-center justify-center text-4xl"
              style={{ background: `${card.accent}18` }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110"
                style={{ background: card.accent }}
              >
                {card.emoji}
              </div>
            </div>
            <div className="p-3 pb-4">
              <h3
                className="font-fun text-base leading-tight"
                style={{ color: "var(--c-text)" }}
              >
                {card.label}
              </h3>
              <p
                className="text-xs font-semibold mt-0.5"
                style={{ color: "var(--c-muted)" }}
              >
                {card.desc}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="el-card p-5 mt-6"
        >
          <h2
            className="font-fun text-xl mb-3"
            style={{ color: "var(--c-gold)" }}
          >
            🏅 My Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className="flex flex-col items-center rounded-2xl p-3"
                style={{
                  background: "var(--c-gold-light)",
                  border: "1.5px solid #FDE68A",
                }}
              >
                <span className="text-3xl">{b.emoji}</span>
                <span
                  className="text-xs font-bold mt-1"
                  style={{ color: "#92400E" }}
                >
                  {b.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Avatar picker modal */}
      <AnimatePresence>
        {showPicker && profile && (
          <AvatarPicker isChanging onDone={() => setShowPicker(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
