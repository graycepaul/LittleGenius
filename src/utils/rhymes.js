const RHYME_GROUPS = [
  ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'fat', 'pat', 'flat', 'that'],
  ['dog', 'log', 'fog', 'hog', 'frog', 'blog'],
  ['sun', 'fun', 'run', 'bun', 'gun', 'nun', 'one', 'done', 'son'],
  ['day', 'say', 'play', 'way', 'stay', 'pay', 'hay', 'ray', 'clay', 'gray'],
  ['night', 'light', 'right', 'bright', 'tight', 'might', 'fight', 'sight', 'white'],
  ['book', 'look', 'cook', 'took', 'hook', 'brook', 'shook'],
  ['tree', 'free', 'see', 'bee', 'key', 'tea', 'me', 'we', 'he', 'she'],
  ['cake', 'make', 'take', 'bake', 'lake', 'snake', 'shake', 'wake'],
  ['ball', 'call', 'fall', 'tall', 'wall', 'hall', 'small', 'all'],
  ['sing', 'ring', 'king', 'wing', 'spring', 'swing', 'bring', 'thing'],
  ['big', 'dig', 'fig', 'pig', 'wig', 'rig', 'twig'],
  ['hop', 'top', 'pop', 'stop', 'drop', 'shop', 'cop', 'mop'],
  ['bed', 'red', 'fed', 'led', 'said', 'head', 'bread', 'dead'],
  ['bug', 'hug', 'mug', 'rug', 'tug', 'slug', 'shrug', 'drug'],
  ['hot', 'dot', 'got', 'lot', 'not', 'pot', 'rot', 'spot', 'shot'],
  ['fly', 'high', 'sky', 'cry', 'dry', 'try', 'my', 'bye', 'pie', 'tie'],
  ['rain', 'train', 'brain', 'chain', 'gain', 'main', 'pain', 'plain'],
  ['smile', 'mile', 'pile', 'tile', 'while', 'file', 'style'],
  ['fish', 'dish', 'wish', 'swish'],
  ['cake', 'make', 'take', 'lake', 'snake'],
  ['moon', 'soon', 'spoon', 'balloon', 'tune', 'June'],
  ['star', 'car', 'far', 'jar', 'bar', 'guitar'],
  ['flower', 'power', 'tower', 'shower', 'hour'],
  ['blue', 'clue', 'glue', 'true', 'zoo', 'too', 'you', 'new'],
  ['red', 'bed', 'fed', 'head', 'bread', 'said'],
  ['green', 'seen', 'been', 'clean', 'mean', 'bean', 'queen'],
]

export function findRhymes(word) {
  const clean = word.toLowerCase().trim()
  const group = RHYME_GROUPS.find(g => g.includes(clean))
  if (!group) return []
  return group.filter(w => w !== clean).slice(0, 6)
}
