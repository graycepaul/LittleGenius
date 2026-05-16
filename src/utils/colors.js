export const WORD_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4',
  '#10b981', '#f59e0b', '#6366f1', '#14b8a6',
]

export const PASTEL_COLORS = [
  '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0',
  '#bfdbfe', '#ddd6fe', '#fbcfe8', '#a5f3fc',
  '#6ee7b7', '#fde68a',
]

export const CARD_GRADIENTS = [
  'from-red-400 to-orange-400',
  'from-orange-400 to-yellow-400',
  'from-yellow-400 to-green-400',
  'from-green-400 to-teal-400',
  'from-teal-400 to-blue-400',
  'from-blue-400 to-indigo-400',
  'from-indigo-400 to-purple-400',
  'from-purple-400 to-pink-400',
  'from-pink-400 to-red-400',
]

export function getWordColor(index) {
  return WORD_COLORS[index % WORD_COLORS.length]
}

export function getCardGradient(index) {
  return CARD_GRADIENTS[index % CARD_GRADIENTS.length]
}
