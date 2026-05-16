import React from 'react'
import { motion } from 'framer-motion'

export default function PageHeader({ emoji, title, subtitle, gradient = 'from-yellow-400 to-orange-400' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r ${gradient} rounded-3xl p-6 mb-6 text-white shadow-lg`}
    >
      <div className="flex items-center gap-4">
        <span className="text-5xl animate-float inline-block">{emoji}</span>
        <div>
          <h1 className="font-fun text-3xl sm:text-4xl">{title}</h1>
          {subtitle && <p className="font-body text-white/90 mt-1 font-semibold">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  )
}
