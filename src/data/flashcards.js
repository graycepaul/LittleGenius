export const LETTER_CARDS = Array.from({ length: 26 }, (_, i) => {
  const upper = String.fromCharCode(65 + i)
  const lower = String.fromCharCode(97 + i)
  const words = {
    A: { word: 'Apple', emoji: '🍎' }, B: { word: 'Ball', emoji: '⚽' },
    C: { word: 'Cat', emoji: '🐱' }, D: { word: 'Dog', emoji: '🐶' },
    E: { word: 'Elephant', emoji: '🐘' }, F: { word: 'Fish', emoji: '🐠' },
    G: { word: 'Grapes', emoji: '🍇' }, H: { word: 'Hat', emoji: '🎩' },
    I: { word: 'Ice cream', emoji: '🍦' }, J: { word: 'Jellyfish', emoji: '🪼' },
    K: { word: 'Kite', emoji: '🪁' }, L: { word: 'Lion', emoji: '🦁' },
    M: { word: 'Moon', emoji: '🌙' }, N: { word: 'Nest', emoji: '🪺' },
    O: { word: 'Orange', emoji: '🍊' }, P: { word: 'Penguin', emoji: '🐧' },
    Q: { word: 'Queen', emoji: '👑' }, R: { word: 'Rainbow', emoji: '🌈' },
    S: { word: 'Sun', emoji: '☀️' }, T: { word: 'Tiger', emoji: '🐯' },
    U: { word: 'Umbrella', emoji: '☂️' }, V: { word: 'Violin', emoji: '🎻' },
    W: { word: 'Watermelon', emoji: '🍉' }, X: { word: 'Xylophone', emoji: '🎵' },
    Y: { word: 'Yak', emoji: '🐃' }, Z: { word: 'Zebra', emoji: '🦓' },
  }
  return { id: `letter-${upper}`, upper, lower, ...words[upper] }
})

export const NUMBER_CARDS = Array.from({ length: 20 }, (_, i) => {
  const num = i + 1
  const emojis = ['🍎','🐶','⭐','🌸','🎈','🦋','🍭','🐸','🌙','🎵',
                   '🍕','🦁','🎨','🌈','🐠','⚽','🍦','🌻','🐧','🎯']
  return {
    id: `number-${num}`,
    number: num,
    word: ['one','two','three','four','five','six','seven','eight','nine','ten',
           'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen',
           'eighteen','nineteen','twenty'][i],
    emoji: emojis[i],
    dots: Array(num).fill('●').join(' '),
  }
})

export const SIGHT_WORD_CARDS = [
  { id: 'sw-1', word: 'the', sentence: 'The cat sat.', emoji: '📖' },
  { id: 'sw-2', word: 'and', sentence: 'You and me!', emoji: '🤝' },
  { id: 'sw-3', word: 'is', sentence: 'The sky is blue.', emoji: '🔵' },
  { id: 'sw-4', word: 'are', sentence: 'We are happy.', emoji: '😊' },
  { id: 'sw-5', word: 'was', sentence: 'It was sunny.', emoji: '☀️' },
  { id: 'sw-6', word: 'for', sentence: 'A gift for you.', emoji: '🎁' },
  { id: 'sw-7', word: 'on', sentence: 'The bird is on the tree.', emoji: '🐦' },
  { id: 'sw-8', word: 'you', sentence: 'I like you!', emoji: '❤️' },
  { id: 'sw-9', word: 'he', sentence: 'He runs fast.', emoji: '🏃' },
  { id: 'sw-10', word: 'she', sentence: 'She sings well.', emoji: '🎤' },
  { id: 'sw-11', word: 'they', sentence: 'They play ball.', emoji: '⚽' },
  { id: 'sw-12', word: 'we', sentence: 'We love school!', emoji: '🏫' },
  { id: 'sw-13', word: 'his', sentence: 'His hat is red.', emoji: '🎩' },
  { id: 'sw-14', word: 'her', sentence: 'Her cat is cute.', emoji: '🐱' },
  { id: 'sw-15', word: 'have', sentence: 'I have a dog.', emoji: '🐶' },
  { id: 'sw-16', word: 'this', sentence: 'This is my book.', emoji: '📚' },
  { id: 'sw-17', word: 'that', sentence: 'That star is bright.', emoji: '⭐' },
  { id: 'sw-18', word: 'not', sentence: 'Do not run!', emoji: '🚫' },
  { id: 'sw-19', word: 'with', sentence: 'Come with me.', emoji: '👫' },
  { id: 'sw-20', word: 'said', sentence: 'She said hello.', emoji: '💬' },
]

export const COLOR_CARDS = [
  { id: 'color-red', name: 'Red', emoji: '🔴', bg: 'bg-red-400', hex: '#ef4444' },
  { id: 'color-orange', name: 'Orange', emoji: '🟠', bg: 'bg-orange-400', hex: '#f97316' },
  { id: 'color-yellow', name: 'Yellow', emoji: '🟡', bg: 'bg-yellow-400', hex: '#eab308' },
  { id: 'color-green', name: 'Green', emoji: '🟢', bg: 'bg-green-400', hex: '#22c55e' },
  { id: 'color-blue', name: 'Blue', emoji: '🔵', bg: 'bg-blue-400', hex: '#3b82f6' },
  { id: 'color-purple', name: 'Purple', emoji: '🟣', bg: 'bg-purple-400', hex: '#a855f7' },
  { id: 'color-pink', name: 'Pink', emoji: '🩷', bg: 'bg-pink-400', hex: '#ec4899' },
  { id: 'color-brown', name: 'Brown', emoji: '🟤', bg: 'bg-amber-800', hex: '#92400e' },
  { id: 'color-black', name: 'Black', emoji: '⚫', bg: 'bg-gray-900', hex: '#111827' },
  { id: 'color-white', name: 'White', emoji: '⚪', bg: 'bg-gray-100 border border-gray-300', hex: '#f9fafb' },
]

export const SHAPE_CARDS = [
  { id: 'shape-circle', name: 'Circle', emoji: '⭕', fun: 'Like a pizza!' },
  { id: 'shape-square', name: 'Square', emoji: '🟥', fun: 'Like a window!' },
  { id: 'shape-triangle', name: 'Triangle', emoji: '🔺', fun: 'Like a pizza slice!' },
  { id: 'shape-rectangle', name: 'Rectangle', emoji: '▬', fun: 'Like a door!' },
  { id: 'shape-star', name: 'Star', emoji: '⭐', fun: 'Like in the sky!' },
  { id: 'shape-heart', name: 'Heart', emoji: '❤️', fun: 'Like love!' },
  { id: 'shape-diamond', name: 'Diamond', emoji: '💎', fun: 'Like a gem!' },
  { id: 'shape-oval', name: 'Oval', emoji: '🥚', fun: 'Like an egg!' },
]

export const DECK_TYPES = [
  { id: 'letters', label: 'A B C', emoji: '🔤', desc: 'Letters A to Z', color: 'from-blue-400 to-cyan-400' },
  { id: 'numbers', label: '1 2 3', emoji: '🔢', desc: 'Numbers 1 to 20', color: 'from-green-400 to-teal-400' },
  { id: 'sightwords', label: 'Sight Words', emoji: '👁️', desc: '20 common words', color: 'from-purple-400 to-pink-400' },
  { id: 'colors', label: 'Colors', emoji: '🎨', desc: 'All the colors', color: 'from-red-400 to-orange-400' },
  { id: 'shapes', label: 'Shapes', emoji: '🔷', desc: 'Basic shapes', color: 'from-yellow-400 to-amber-400' },
]
