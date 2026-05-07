// Full 78-card tarot deck. Meanings are concise and gothic-leaning.
// Visual style: alchemystic woodcut — gold/red/black palette, ornate borders.

export const TAROT_DECK = [
  // === MAJOR ARCANA ===
  { id: 0, type: 'major', name: 'The Fool', symbol: '☉', upright: 'beginnings, innocence, free spirit, leap of faith', reversed: 'recklessness, naivety, foolish risks', element: 'air' },
  { id: 1, type: 'major', name: 'The Magician', symbol: '∞', upright: 'manifestation, willpower, the four elements at command', reversed: 'manipulation, illusion, untapped potential', element: 'mercury' },
  { id: 2, type: 'major', name: 'The High Priestess', symbol: '☽', upright: 'intuition, the unconscious, sacred knowledge, the veil', reversed: 'secrets revealed, disconnection from intuition', element: 'moon' },
  { id: 3, type: 'major', name: 'The Empress', symbol: '♀', upright: 'fertility, abundance, the mother, the body', reversed: 'creative block, dependence, neglect', element: 'venus' },
  { id: 4, type: 'major', name: 'The Emperor', symbol: '♈', upright: 'authority, structure, the father, dominion', reversed: 'tyranny, rigidity, lack of discipline', element: 'aries' },
  { id: 5, type: 'major', name: 'The Hierophant', symbol: '♉', upright: 'tradition, dogma, spiritual wisdom, the institution', reversed: 'rebellion, unconventional paths, breaking with tradition', element: 'taurus' },
  { id: 6, type: 'major', name: 'The Lovers', symbol: '♊', upright: 'union, choice, harmony, sacred contract', reversed: 'misalignment, infidelity, indecision', element: 'gemini' },
  { id: 7, type: 'major', name: 'The Chariot', symbol: '♋', upright: 'willpower, victory, control, forward motion', reversed: 'lack of direction, opposition, defeat', element: 'cancer' },
  { id: 8, type: 'major', name: 'Strength', symbol: '♌', upright: 'inner strength, courage, gentle mastery, the tamed beast', reversed: 'self-doubt, weakness, untamed impulse', element: 'leo' },
  { id: 9, type: 'major', name: 'The Hermit', symbol: '♍', upright: 'solitude, soul-searching, inner guidance, the lantern', reversed: 'isolation, withdrawal, lost inner light', element: 'virgo' },
  { id: 10, type: 'major', name: 'The Wheel of Fortune', symbol: '☉', upright: 'fate, cycles, turning points, what comes around', reversed: 'bad luck, resistance to change, broken cycles', element: 'jupiter' },
  { id: 11, type: 'major', name: 'Justice', symbol: '♎', upright: 'truth, fairness, cause & effect, the verdict', reversed: 'injustice, dishonesty, accountability avoided', element: 'libra' },
  { id: 12, type: 'major', name: 'The Hanged Man', symbol: '♆', upright: 'surrender, suspension, new perspective, sacrifice', reversed: 'stalling, indecision, sacrifice without purpose', element: 'water' },
  { id: 13, type: 'major', name: 'Death', symbol: '♏', upright: 'endings, transformation, the necessary cut, rebirth', reversed: 'resistance to change, stagnation, fear of letting go', element: 'scorpio' },
  { id: 14, type: 'major', name: 'Temperance', symbol: '♐', upright: 'balance, blending, patience, the alchemist', reversed: 'imbalance, excess, impatience, untempered', element: 'sagittarius' },
  { id: 15, type: 'major', name: 'The Devil', symbol: '♑', upright: 'bondage, addiction, materialism, the chosen chain', reversed: 'release, breaking free, reclaimed power', element: 'capricorn' },
  { id: 16, type: 'major', name: 'The Tower', symbol: '♂', upright: 'sudden upheaval, revelation, the false structure falls', reversed: 'narrowly avoided disaster, fear of change', element: 'mars' },
  { id: 17, type: 'major', name: 'The Star', symbol: '♒', upright: 'hope, healing, inspiration, the small light', reversed: 'despair, lost faith, disconnection', element: 'aquarius' },
  { id: 18, type: 'major', name: 'The Moon', symbol: '☾', upright: 'illusion, dreams, the unconscious, the hidden truth', reversed: 'truth revealed, confusion lifting', element: 'pisces' },
  { id: 19, type: 'major', name: 'The Sun', symbol: '☀', upright: 'joy, vitality, success, radiance', reversed: 'temporary clouds, delayed joy', element: 'sun' },
  { id: 20, type: 'major', name: 'Judgement', symbol: '♅', upright: 'awakening, reckoning, calling, rebirth', reversed: 'self-doubt, ignored calling, lack of self-awareness', element: 'fire' },
  { id: 21, type: 'major', name: 'The World', symbol: '♄', upright: 'completion, integration, fulfillment, the closed circle', reversed: 'unfinished business, lack of closure', element: 'saturn' },

  // === MINOR ARCANA: WANDS (fire) ===
  { id: 22, type: 'minor', suit: 'wands', rank: 'ace', name: 'Ace of Wands', upright: 'inspiration, new fire, the spark', reversed: 'delays, lack of direction, smothered flame' },
  { id: 23, type: 'minor', suit: 'wands', rank: 'two', name: 'Two of Wands', upright: 'planning, the long view, dominion', reversed: 'fear of unknown, playing it safe' },
  { id: 24, type: 'minor', suit: 'wands', rank: 'three', name: 'Three of Wands', upright: 'expansion, foresight, ships coming in', reversed: 'delays, lack of foresight' },
  { id: 25, type: 'minor', suit: 'wands', rank: 'four', name: 'Four of Wands', upright: 'celebration, homecoming, harmony', reversed: 'transition, instability at home' },
  { id: 26, type: 'minor', suit: 'wands', rank: 'five', name: 'Five of Wands', upright: 'conflict, competition, scuffle', reversed: 'avoiding conflict, inner tension' },
  { id: 27, type: 'minor', suit: 'wands', rank: 'six', name: 'Six of Wands', upright: 'victory, public recognition, the laurel', reversed: 'fall from grace, private doubt' },
  { id: 28, type: 'minor', suit: 'wands', rank: 'seven', name: 'Seven of Wands', upright: 'defense, holding ground, the underdog', reversed: 'overwhelmed, giving up' },
  { id: 29, type: 'minor', suit: 'wands', rank: 'eight', name: 'Eight of Wands', upright: 'speed, swift movement, news arriving', reversed: 'delays, frustration, scattered energy' },
  { id: 30, type: 'minor', suit: 'wands', rank: 'nine', name: 'Nine of Wands', upright: 'resilience, last stand, near the end', reversed: 'exhaustion, paranoia, depleted reserves' },
  { id: 31, type: 'minor', suit: 'wands', rank: 'ten', name: 'Ten of Wands', upright: 'burden, responsibility, the heavy load', reversed: 'release, delegation, dropping weight' },
  { id: 32, type: 'minor', suit: 'wands', rank: 'page', name: 'Page of Wands', upright: 'spark of inspiration, free spirit, new passion', reversed: 'immaturity, delays in action' },
  { id: 33, type: 'minor', suit: 'wands', rank: 'knight', name: 'Knight of Wands', upright: 'action, adventure, impulsive energy', reversed: 'recklessness, anger, frustration' },
  { id: 34, type: 'minor', suit: 'wands', rank: 'queen', name: 'Queen of Wands', upright: 'confidence, warmth, magnetic presence', reversed: 'jealousy, insecurity, demanding' },
  { id: 35, type: 'minor', suit: 'wands', rank: 'king', name: 'King of Wands', upright: 'natural leader, vision, charisma', reversed: 'impulsive, domineering, overbearing' },

  // === MINOR ARCANA: CUPS (water) ===
  { id: 36, type: 'minor', suit: 'cups', rank: 'ace', name: 'Ace of Cups', upright: 'new feeling, love, emotional opening', reversed: 'blocked emotion, repression' },
  { id: 37, type: 'minor', suit: 'cups', rank: 'two', name: 'Two of Cups', upright: 'union, mutual love, partnership', reversed: 'imbalance, broken communication' },
  { id: 38, type: 'minor', suit: 'cups', rank: 'three', name: 'Three of Cups', upright: 'celebration, friendship, the coven', reversed: 'overindulgence, gossip, isolation' },
  { id: 39, type: 'minor', suit: 'cups', rank: 'four', name: 'Four of Cups', upright: 'apathy, contemplation, the offered cup', reversed: 'awakening, accepting the gift' },
  { id: 40, type: 'minor', suit: 'cups', rank: 'five', name: 'Five of Cups', upright: 'grief, regret, the spilled cups', reversed: 'acceptance, moving on' },
  { id: 41, type: 'minor', suit: 'cups', rank: 'six', name: 'Six of Cups', upright: 'nostalgia, childhood, sweet memory', reversed: 'living in the past, stuck' },
  { id: 42, type: 'minor', suit: 'cups', rank: 'seven', name: 'Seven of Cups', upright: 'choices, illusions, too many options', reversed: 'clarity, decisive choice' },
  { id: 43, type: 'minor', suit: 'cups', rank: 'eight', name: 'Eight of Cups', upright: 'walking away, the long road, abandonment of what no longer serves', reversed: 'fear of leaving, going in circles' },
  { id: 44, type: 'minor', suit: 'cups', rank: 'nine', name: 'Nine of Cups', upright: 'satisfaction, wishes granted, contentment', reversed: 'dissatisfaction, smug greed' },
  { id: 45, type: 'minor', suit: 'cups', rank: 'ten', name: 'Ten of Cups', upright: 'emotional fulfillment, family, home', reversed: 'broken home, disharmony' },
  { id: 46, type: 'minor', suit: 'cups', rank: 'page', name: 'Page of Cups', upright: 'creative messages, intuition, the dreamer', reversed: 'emotional immaturity, escapism' },
  { id: 47, type: 'minor', suit: 'cups', rank: 'knight', name: 'Knight of Cups', upright: 'romance, charm, the offering', reversed: 'moodiness, unrealistic ideals' },
  { id: 48, type: 'minor', suit: 'cups', rank: 'queen', name: 'Queen of Cups', upright: 'compassion, emotional depth, the empath', reversed: 'codependence, emotional flooding' },
  { id: 49, type: 'minor', suit: 'cups', rank: 'king', name: 'King of Cups', upright: 'emotional balance, generosity, wisdom', reversed: 'manipulation, emotional volatility' },

  // === MINOR ARCANA: SWORDS (air) ===
  { id: 50, type: 'minor', suit: 'swords', rank: 'ace', name: 'Ace of Swords', upright: 'breakthrough, clarity, sharp truth', reversed: 'confusion, misuse of power' },
  { id: 51, type: 'minor', suit: 'swords', rank: 'two', name: 'Two of Swords', upright: 'stalemate, blindfold, hard choice', reversed: 'indecision lifting, information emerging' },
  { id: 52, type: 'minor', suit: 'swords', rank: 'three', name: 'Three of Swords', upright: 'heartbreak, sorrow, the cut', reversed: 'recovery, releasing pain' },
  { id: 53, type: 'minor', suit: 'swords', rank: 'four', name: 'Four of Swords', upright: 'rest, recuperation, the tomb of stillness', reversed: 'restlessness, burnout' },
  { id: 54, type: 'minor', suit: 'swords', rank: 'five', name: 'Five of Swords', upright: 'conflict, hollow victory, the cost of winning', reversed: 'reconciliation, walking away' },
  { id: 55, type: 'minor', suit: 'swords', rank: 'six', name: 'Six of Swords', upright: 'transition, leaving behind, calmer waters', reversed: 'unable to leave, baggage' },
  { id: 56, type: 'minor', suit: 'swords', rank: 'seven', name: 'Seven of Swords', upright: 'deception, stealth, strategy', reversed: 'confession, returning what was taken' },
  { id: 57, type: 'minor', suit: 'swords', rank: 'eight', name: 'Eight of Swords', upright: 'restriction, the self-imposed cage', reversed: 'self-acceptance, freedom found within' },
  { id: 58, type: 'minor', suit: 'swords', rank: 'nine', name: 'Nine of Swords', upright: 'anxiety, nightmares, the dark hours', reversed: 'hope returning, light at dawn' },
  { id: 59, type: 'minor', suit: 'swords', rank: 'ten', name: 'Ten of Swords', upright: 'rock bottom, betrayal, the end of a pattern', reversed: 'recovery, regeneration, the only way is up' },
  { id: 60, type: 'minor', suit: 'swords', rank: 'page', name: 'Page of Swords', upright: 'curiosity, sharp mind, the questioner', reversed: 'gossip, scattered thinking' },
  { id: 61, type: 'minor', suit: 'swords', rank: 'knight', name: 'Knight of Swords', upright: 'action, ambition, swift truth', reversed: 'aggression, impatience, recklessness' },
  { id: 62, type: 'minor', suit: 'swords', rank: 'queen', name: 'Queen of Swords', upright: 'clear thought, independence, the cutting truth', reversed: 'cold-hearted, bitter, harsh' },
  { id: 63, type: 'minor', suit: 'swords', rank: 'king', name: 'King of Swords', upright: 'intellectual power, authority, the just ruling', reversed: 'manipulation, abuse of power' },

  // === MINOR ARCANA: PENTACLES (earth) ===
  { id: 64, type: 'minor', suit: 'pentacles', rank: 'ace', name: 'Ace of Pentacles', upright: 'opportunity, prosperity, the seed', reversed: 'missed opportunity, scarcity mindset' },
  { id: 65, type: 'minor', suit: 'pentacles', rank: 'two', name: 'Two of Pentacles', upright: 'balance, juggling, adaptability', reversed: 'overwhelm, dropped balls' },
  { id: 66, type: 'minor', suit: 'pentacles', rank: 'three', name: 'Three of Pentacles', upright: 'collaboration, craftsmanship, the apprentice', reversed: 'lack of teamwork, mediocrity' },
  { id: 67, type: 'minor', suit: 'pentacles', rank: 'four', name: 'Four of Pentacles', upright: 'control, security, holding tight', reversed: 'generosity, letting go, loosened grip' },
  { id: 68, type: 'minor', suit: 'pentacles', rank: 'five', name: 'Five of Pentacles', upright: 'hardship, exclusion, the cold outside', reversed: 'recovery, finding shelter, asking for help' },
  { id: 69, type: 'minor', suit: 'pentacles', rank: 'six', name: 'Six of Pentacles', upright: 'generosity, charity, balance of giving', reversed: 'strings attached, debt, imbalance' },
  { id: 70, type: 'minor', suit: 'pentacles', rank: 'seven', name: 'Seven of Pentacles', upright: 'patience, long-term view, the harvest', reversed: 'impatience, lack of growth' },
  { id: 71, type: 'minor', suit: 'pentacles', rank: 'eight', name: 'Eight of Pentacles', upright: 'craftsmanship, devotion to the work, mastery', reversed: 'lack of focus, perfectionism' },
  { id: 72, type: 'minor', suit: 'pentacles', rank: 'nine', name: 'Nine of Pentacles', upright: 'luxury, self-sufficiency, the cultivated garden', reversed: 'over-investment in work, hollow comfort' },
  { id: 73, type: 'minor', suit: 'pentacles', rank: 'ten', name: 'Ten of Pentacles', upright: 'legacy, family wealth, the ancestral chain', reversed: 'broken legacy, financial strain' },
  { id: 74, type: 'minor', suit: 'pentacles', rank: 'page', name: 'Page of Pentacles', upright: 'manifestation, study, the new venture', reversed: 'lack of progress, distraction' },
  { id: 75, type: 'minor', suit: 'pentacles', rank: 'knight', name: 'Knight of Pentacles', upright: 'reliability, hard work, the steady hand', reversed: 'stagnation, boredom, perfectionism' },
  { id: 76, type: 'minor', suit: 'pentacles', rank: 'queen', name: 'Queen of Pentacles', upright: 'nurturing, practical, the steward of resources', reversed: 'self-care neglect, work-life imbalance' },
  { id: 77, type: 'minor', suit: 'pentacles', rank: 'king', name: 'King of Pentacles', upright: 'wealth, business success, the patriarch of stability', reversed: 'corruption, materialism, financial ego' },
];

// Helper to get a deterministic "card of the day" based on date
export function getDailyCard(seed = '') {
  const today = new Date();
  const dateStr = seed + today.toDateString();
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const cardIdx = Math.abs(hash) % TAROT_DECK.length;
  const reversed = (Math.abs(hash) >> 8) % 3 === 0; // 1/3 chance of reversed
  return { card: TAROT_DECK[cardIdx], reversed };
}
