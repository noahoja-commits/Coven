Major Arcana card art goes here.

- portrait, 5:8 ratio (~832×1216 px), JPG
- filename = card name kebab-cased: "THE HIGH PRIESTESS" -> the-high-priestess.jpg
- the 22 cards:
    the-fool, the-magician, the-high-priestess, the-empress, the-emperor,
    the-hierophant, the-lovers, the-chariot, strength, the-hermit,
    wheel-of-fortune, justice, the-hanged-man, death, temperance,
    the-devil, the-tower, the-star, the-moon, the-sun, judgement, the-world

Then add the card's UPPERCASE name to ARCANA_ART_READY in src/lib/arcana.js, e.g.:
  export const ARCANA_ART_READY = new Set(['DEATH', 'THE MOON'])

That card's profile emblem + flip card render your illustration; the rest keep the
engraved-symbol look. Ship them one at a time.
