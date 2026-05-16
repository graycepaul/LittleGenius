// Simple syllable splitting for common English words
// Falls back to a vowel-group heuristic for unknown words
const SYLLABLE_MAP = {
  apple: ['ap', 'ple'], animal: ['an', 'i', 'mal'], banana: ['ba', 'na', 'na'],
  butterfly: ['but', 'ter', 'fly'], elephant: ['el', 'e', 'phant'],
  umbrella: ['um', 'brel', 'la'], orange: ['or', 'ange'], together: ['to', 'geth', 'er'],
  beautiful: ['beau', 'ti', 'ful'], children: ['chil', 'dren'], family: ['fam', 'i', 'ly'],
  garden: ['gar', 'den'], happy: ['hap', 'py'], jungle: ['jun', 'gle'],
  kitten: ['kit', 'ten'], library: ['li', 'brar', 'y'], mountain: ['moun', 'tain'],
  number: ['num', 'ber'], ocean: ['o', 'cean'], penguin: ['pen', 'guin'],
  rabbit: ['rab', 'bit'], rainbow: ['rain', 'bow'], river: ['riv', 'er'],
  sandwich: ['sand', 'wich'], sunshine: ['sun', 'shine'], teacher: ['teach', 'er'],
  tiger: ['ti', 'ger'], turtle: ['tur', 'tle'], under: ['un', 'der'],
  violet: ['vi', 'o', 'let'], window: ['win', 'dow'], yellow: ['yel', 'low'],
  zebra: ['ze', 'bra'], flower: ['flow', 'er'], dragon: ['drag', 'on'],
  princess: ['prin', 'cess'], castle: ['cas', 'tle'], water: ['wa', 'ter'],
  mother: ['moth', 'er'], father: ['fa', 'ther'], sister: ['sis', 'ter'],
  brother: ['broth', 'er'], children: ['chil', 'dren'], people: ['peo', 'ple'],
  little: ['lit', 'tle'], before: ['be', 'fore'], between: ['be', 'tween'],
  every: ['ev', 'ery'], never: ['nev', 'er'], over: ['o', 'ver'],
  other: ['oth', 'er'], open: ['o', 'pen'], even: ['e', 'ven'],
  after: ['af', 'ter'], again: ['a', 'gain'], about: ['a', 'bout'],
  above: ['a', 'bove'], around: ['a', 'round'], because: ['be', 'cause'],
  something: ['some', 'thing'], everything: ['ev', 'ery', 'thing'],
  nothing: ['noth', 'ing'], something: ['some', 'thing'],
}

function heuristicSyllables(word) {
  // Group consonants and vowels
  const vowels = 'aeiouy'
  const syllables = []
  let current = ''
  let prevWasVowel = false

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i].toLowerCase())
    current += word[i]
    if (prevWasVowel && !isVowel && i < word.length - 1) {
      syllables.push(current.slice(0, -1))
      current = word[i]
    }
    prevWasVowel = isVowel
  }
  if (current) syllables.push(current)
  return syllables.length > 0 ? syllables : [word]
}

export function splitSyllables(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '')
  return SYLLABLE_MAP[clean] || heuristicSyllables(clean)
}

export function getSyllableDisplay(word) {
  return splitSyllables(word).join(' · ')
}
