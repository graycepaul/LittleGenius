import React from "react";
import { motion } from "framer-motion";

// accentColor is a CSS var name like 'var(--c-reading)' or a hex
export default function PageHeader({
  emoji,
  title,
  subtitle,
  accentColor = "var(--c-primary)",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-6 mb-6 text-white shadow-lg"
      style={{ backgroundColor: accentColor }}
    >
      <div className="flex items-center gap-4 ">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shrink-0 animate-float">
          {emoji}
        </div>
        <div>
          <h1 className="font-fun text-3xl sm:text-4xl leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/80 font-semibold mt-1 text-sm sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
