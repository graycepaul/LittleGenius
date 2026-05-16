export const COUNTING_SETS = [
  { count: 1, emoji: '🍎', name: 'apple' },
  { count: 2, emoji: '⭐', name: 'stars' },
  { count: 3, emoji: '🐱', name: 'cats' },
  { count: 4, emoji: '🌸', name: 'flowers' },
  { count: 5, emoji: '🎈', name: 'balloons' },
  { count: 6, emoji: '🦋', name: 'butterflies' },
  { count: 7, emoji: '🍭', name: 'lollipops' },
  { count: 8, emoji: '🐸', name: 'frogs' },
  { count: 9, emoji: '🌙', name: 'moons' },
  { count: 10, emoji: '🎵', name: 'notes' },
]

export function generateAddition(maxSum = 10) {
  const a = Math.floor(Math.random() * (maxSum - 1)) + 1
  const b = Math.floor(Math.random() * (maxSum - a)) + 1
  return { a, b, answer: a + b, op: '+' }
}

export function generateSubtraction(maxNum = 10) {
  const a = Math.floor(Math.random() * maxNum) + 2
  const b = Math.floor(Math.random() * (a - 1)) + 1
  return { a, b, answer: a - b, op: '-' }
}

export const NUMBER_SEQUENCES = [
  { type: 'count-up', start: 1, end: 10, missing: [4, 7] },
  { type: 'count-up', start: 1, end: 10, missing: [2, 5, 9] },
  { type: 'count-up', start: 5, end: 15, missing: [8, 11, 14] },
  { type: 'count-up', start: 10, end: 20, missing: [13, 16, 19] },
  { type: 'even', start: 2, end: 20, missing: [6, 12, 18] },
  { type: 'odd', start: 1, end: 19, missing: [5, 11, 17] },
]

export const NUMBER_BONDS = [
  { total: 5, pairs: [[1,4],[2,3],[3,2],[4,1]] },
  { total: 6, pairs: [[1,5],[2,4],[3,3],[4,2],[5,1]] },
  { total: 7, pairs: [[1,6],[2,5],[3,4],[4,3],[5,2],[6,1]] },
  { total: 8, pairs: [[1,7],[2,6],[3,5],[4,4],[5,3],[6,2],[7,1]] },
  { total: 9, pairs: [[1,8],[2,7],[3,6],[4,5],[5,4],[6,3],[7,2],[8,1]] },
  { total: 10, pairs: [[1,9],[2,8],[3,7],[4,6],[5,5],[6,4],[7,3],[8,2],[9,1]] },
]

export const MATH_EMOJIS = ['🍎','🐶','⭐','🌸','🎈','🦋','🍭','🐸','🌙','🎵','🍕','🦁']

export function getCountEmojis(n, emoji) {
  return Array(n).fill(emoji)
}
