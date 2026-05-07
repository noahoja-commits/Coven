// The Codex — a dictionary of goth, alt, occult, scene, and religious terms.
// 150+ entries to start. User-submitted definitions can be added later.

export const CODEX_CATEGORIES = [
  { id: 'all', label: 'all entries' },
  { id: 'goth', label: 'goth · alt' },
  { id: 'occult', label: 'occult' },
  { id: 'scene', label: 'scene · slang' },
  { id: 'religious', label: 'religious' },
  { id: 'fashion', label: 'fashion' },
  { id: 'music', label: 'music' },
];

export const CODEX = [
  // === GOTH / ALT ===
  { term: 'Trad Goth', cat: 'goth', def: 'The original goth subculture as it emerged from late-70s/early-80s post-punk in the UK. Defined by bands like Bauhaus, Siouxsie, the Sisters of Mercy. Black clothing, teased hair, deathrock crossover.' },
  { term: 'Romantic Goth', cat: 'goth', def: 'A subset emphasizing Victorian, Edwardian, and Romantic-era aesthetics. Lace, velvet, corsets, mourning dress. Cathedrals, candles, poetry.' },
  { term: 'Cyber Goth', cat: 'goth', def: 'Late-90s/2000s offshoot blending goth with rave and industrial. Neon dreadfalls, PVC, gas masks, EBM and aggrotech soundtrack.' },
  { term: 'Pastel Goth', cat: 'goth', def: 'Internet-era hybrid pairing goth motifs (skulls, crosses, pentagrams) with pastel pinks, lavenders, and mint. Often kawaii-adjacent.' },
  { term: 'Health Goth', cat: 'goth', def: 'Mid-2010s aesthetic of all-black athletic and technical wear. Functional, futuristic, monochrome. More fashion than music.' },
  { term: 'Mall Goth', cat: 'goth', def: 'Late-90s/early-2000s teenage goth-adjacent style sourced from Hot Topic — band tees, fishnets, JNCO-adjacent silhouettes. Often dismissive but increasingly reclaimed.' },
  { term: 'Nu Goth', cat: 'goth', def: 'Tumblr-era minimalist goth: occult symbols, all-black, clean lines, witchy. Less club, more aesthetic.' },
  { term: 'Whitby Goth', cat: 'goth', def: 'Refers to the biannual Whitby Goth Weekend in England — a major gathering and the romantic-trad goth aesthetic associated with it.' },
  { term: 'Deathrock', cat: 'goth', def: 'American goth-adjacent subgenre from early-80s LA. Faster, more punk, horror-themed. Christian Death, 45 Grave.' },
  { term: 'Post-punk', cat: 'goth', def: 'The late-70s genre that birthed goth — angular, atmospheric, often political. Joy Division, Wire, Public Image Ltd.' },
  { term: 'Darkwave', cat: 'goth', def: 'Synth-driven, atmospheric offshoot of post-punk. Cold textures, minor-key melodies. Clan of Xymox, Drab Majesty.' },
  { term: 'Coldwave', cat: 'goth', def: 'French and Belgian post-punk variant. Stark, minimal, often spoken-word. Trisomie 21, Asylum Party.' },
  { term: 'Witch House', cat: 'goth', def: 'Late-2000s electronic genre using occult imagery, pitched vocals, slow tempos. Salem, Crystal Castles-adjacent.' },
  { term: 'Industrial', cat: 'goth', def: 'Mechanical, abrasive electronic music with goth crossover. Throbbing Gristle, Skinny Puppy, Front 242.' },
  { term: 'EBM', cat: 'goth', def: 'Electronic Body Music. Industrial-derived dance music, repetitive beats, militant vocals. Nitzer Ebb, Front 242.' },

  // === OCCULT ===
  { term: 'Goetia', cat: 'occult', def: 'The first book of the Lesser Key of Solomon, listing 72 demons or spirits with their seals and offices. Most-cited grimoire in modern occultism.' },
  { term: 'Grimoire', cat: 'occult', def: 'A textbook of magic, typically containing instructions for invocations, talismans, and rituals. Most are medieval to early modern.' },
  { term: 'Sigil', cat: 'occult', def: 'A pictorial symbol representing a desired outcome or spirit. Modern chaos magic uses charged personal sigils; classical grimoires include named seals.' },
  { term: 'Pentacle', cat: 'occult', def: 'A five-pointed star, often within a circle. In Wicca and ceremonial magic, represents the four elements plus spirit.' },
  { term: 'Hexagram', cat: 'occult', def: 'A six-pointed star formed by two interlocking triangles. The Seal of Solomon. In Western occultism, represents the union of opposites.' },
  { term: 'Tetragrammaton', cat: 'occult', def: 'The four-letter Hebrew name of God: YHWH. Considered ineffable; central to ceremonial magic.' },
  { term: 'Ouroboros', cat: 'occult', def: 'The serpent or dragon eating its own tail. Symbolizes infinity, cyclic time, alchemical transformation.' },
  { term: 'Hermeticism', cat: 'occult', def: 'A philosophical-religious tradition based on writings attributed to Hermes Trismegistus. "As above, so below."' },
  { term: 'Kabbalah', cat: 'occult', def: 'Jewish mystical tradition centering on the Tree of Life and the sephirot. Also a major influence on Western ceremonial magic.' },
  { term: 'Sephiroth', cat: 'occult', def: 'The ten emanations of the divine in Kabbalah. Visualized as the Tree of Life.' },
  { term: 'Thelema', cat: 'occult', def: 'The religious-philosophical system founded by Aleister Crowley. "Do what thou wilt shall be the whole of the Law."' },
  { term: 'Wicca', cat: 'occult', def: 'A modern pagan religion founded mid-20th century by Gerald Gardner. Worship of a god and goddess, ritual cycles tied to the seasons.' },
  { term: 'Sabbat', cat: 'occult', def: 'In Wicca and modern witchcraft, one of the eight festivals of the Wheel of the Year. Originally referred to alleged witches\u2019 gatherings in folklore.' },
  { term: 'Esbat', cat: 'occult', def: 'A coven gathering, traditionally held at the full moon.' },
  { term: 'Athame', cat: 'occult', def: 'A ritual knife, traditionally black-handled, used in Wicca and ceremonial magic. Symbolic, not for cutting physical things.' },
  { term: 'Pendulum', cat: 'occult', def: 'A weighted object on a chain, used for divination by interpreting its swing patterns.' },
  { term: 'Scrying', cat: 'occult', def: 'Divination by gazing into a reflective surface — mirror, water, crystal ball, smoke. Receiving images or impressions.' },
  { term: 'Tarot', cat: 'occult', def: 'A 78-card divination deck composed of 22 Major Arcana and 56 Minor Arcana across four suits. Originated as a card game in 15th-century Italy.' },
  { term: 'Major Arcana', cat: 'occult', def: 'The 22 trump cards of the tarot, from the Fool (0) to the World (21). Represent archetypal life forces.' },
  { term: 'Minor Arcana', cat: 'occult', def: 'The four suits of the tarot — Wands, Cups, Swords, Pentacles — totaling 56 cards. Represent everyday life situations.' },
  { term: 'Necromancy', cat: 'occult', def: 'Communication with the dead for divinatory or spiritual purposes. One of the oldest and most condemned forms of magic.' },
  { term: 'Theurgy', cat: 'occult', def: 'Magic intended to invoke divine or angelic forces. Distinct from goetia, which deals with lower spirits.' },
  { term: 'Memento Mori', cat: 'occult', def: 'Latin: "remember you must die." A symbolic reminder of mortality — the skull, the hourglass, the wilting flower. Central to gothic and baroque art.' },
  { term: 'Magick', cat: 'occult', def: 'Spelled with a "k" by Aleister Crowley to distinguish ceremonial / spiritual practice from stage illusion.' },
  { term: 'Ceremonial Magic', cat: 'occult', def: 'A formal tradition emphasizing precise ritual, invocations, sacred geometry, and grimoire-derived techniques. Hermetic Order of the Golden Dawn its most famous example.' },

  // === SCENE / SLANG ===
  { term: 'Coven', cat: 'scene', def: 'Originally: a gathering of witches, traditionally 13. Modern usage: a tight friend group, a chosen family, especially in alt and queer scenes.' },
  { term: 'Crew', cat: 'scene', def: 'A friend group that goes out together regularly. Often coordinates rides, plans, party-hopping.' },
  { term: 'The Scene', cat: 'scene', def: 'An informal name for the local goth/alt/underground community. "Are you in the scene?" "Do you know anyone in the scene?"' },
  { term: 'Pulled Up', cat: 'scene', def: 'Arrived. "We pulled up to the warehouse around 11."' },
  { term: 'The Spot', cat: 'scene', def: 'The party / venue / location everyone is going to that night. Also a recurring meetup location.' },
  { term: 'Smoke Sesh', cat: 'scene', def: 'A gathering for the specific purpose of smoking together. Can last minutes or hours.' },
  { term: 'Rotation', cat: 'scene', def: 'Passing a joint or pipe in a group. Etiquette varies but the order is generally fixed once started.' },
  { term: 'Day-of', cat: 'scene', def: 'Same-day plans. "Day-of tickets at the door." "Day-of vibes are different."' },
  { term: 'Rolling', cat: 'scene', def: 'Either: actively going somewhere ("we\u2019re rolling"), or on MDMA. Context-dependent.' },
  { term: 'Pre', cat: 'scene', def: 'Pre-game; gathering at someone\u2019s place before going out. "Pre at my place at 9?"' },
  { term: 'After', cat: 'scene', def: 'After-party. Often unplanned, usually at someone\u2019s apartment, lasts until sunrise or later.' },
  { term: 'Headed', cat: 'scene', def: 'On the way. "I\u2019m headed."' },
  { term: 'Slay', cat: 'scene', def: 'To do something exceptionally well, often visually. "Slay the look." Origin: Black queer ballroom culture.' },
  { term: 'Serving', cat: 'scene', def: 'Presenting; performing aesthetically. "She\u2019s serving Victorian widow tonight." Origin: Black queer ballroom culture.' },
  { term: 'Mother', cat: 'scene', def: 'A figure of leadership, style, or care within a community. From ballroom houses; widely adopted in queer and alt scenes.' },
  { term: 'Lurking', cat: 'scene', def: 'At a party but not engaging much. Usually neutral, sometimes affectionate.' },
  { term: 'The Cut', cat: 'scene', def: 'A small spot known mostly to insiders. "I know a cut on the LES."' },
  { term: 'The Door', cat: 'scene', def: 'The bouncer or entry process at a venue. "The door was rough tonight."' },
  { term: 'Ghost', cat: 'scene', def: 'To leave without saying goodbye. "I\u2019m ghosting." (verb) Or to disappear from contact entirely.' },
  { term: 'Dipping', cat: 'scene', def: 'Leaving. "I\u2019m dipping in 5."' },
  { term: 'Read', cat: 'scene', def: 'To call someone out, often cuttingly and accurately. "She read him for filth." Origin: Black queer ballroom culture.' },
  { term: 'IRL', cat: 'scene', def: '"In real life." Distinguishing offline interaction from online.' },
  { term: 'Mutual', cat: 'scene', def: 'Someone who follows you and whom you follow back. A digital scene member.' },

  // === RELIGIOUS ===
  { term: 'Vespers', cat: 'religious', def: 'Evening prayer service in Christian liturgy, traditionally at sunset. The literal "evening star."' },
  { term: 'Matins', cat: 'religious', def: 'The first canonical hour of the day, traditionally before dawn. Night prayer.' },
  { term: 'Compline', cat: 'religious', def: 'The final prayer of the day, before sleep. The most quiet and contemplative office.' },
  { term: 'Liturgy', cat: 'religious', def: 'The structured public worship of a religious community. Includes prayers, readings, hymns.' },
  { term: 'Eucharist', cat: 'religious', def: 'The Christian sacrament of communion — bread and wine as the body and blood of Christ.' },
  { term: 'Sacrament', cat: 'religious', def: 'A sacred ritual believed to convey grace. Catholic tradition recognizes seven.' },
  { term: 'Penance', cat: 'religious', def: 'Acts of contrition and reparation for sin. Confession, fasting, almsgiving.' },
  { term: 'Confession', cat: 'religious', def: 'The Catholic sacrament of acknowledging sin to a priest and receiving absolution. Also: any unburdening.' },
  { term: 'Apocrypha', cat: 'religious', def: 'Religious texts of disputed authenticity, often included in some biblical canons but not others.' },
  { term: 'Gnosticism', cat: 'religious', def: 'Early Christian movement (and later revivals) emphasizing direct mystical knowledge over institutional authority.' },
  { term: 'Ascetic', cat: 'religious', def: 'Practicing severe self-discipline, often involving abstention from pleasure. Monks, hermits, certain mystics.' },
  { term: 'Reliquary', cat: 'religious', def: 'A container for holy relics — bones, hair, fragments of saints. Often elaborate, gold, jewel-encrusted.' },
  { term: 'Crucifix', cat: 'religious', def: 'A cross bearing the figure of the crucified Christ. Distinguished from a plain cross.' },
  { term: 'Rosary', cat: 'religious', def: 'A Catholic devotional string of beads used to count prayers. Also the prayer cycle itself.' },
  { term: 'Madonna', cat: 'religious', def: 'A representation of the Virgin Mary, particularly in art. Italian for "my lady."' },
  { term: 'Pieta', cat: 'religious', def: 'Italian for "pity"; depicts Mary cradling the dead Christ. Most famously Michelangelo\u2019s sculpture.' },
  { term: 'Ex Voto', cat: 'religious', def: 'Latin for "from a vow"; a votive offering left at a shrine in thanks or petition. Often small, anatomical, deeply personal.' },

  // === FASHION ===
  { term: 'Crinoline', cat: 'fashion', def: 'A stiff or structured petticoat, worn under skirts to give them shape. Originally Victorian; revived in goth and lolita fashion.' },
  { term: 'Bustle', cat: 'fashion', def: 'A frame or padding worn under the back of a skirt to add fullness. Late-Victorian silhouette staple.' },
  { term: 'Cravat', cat: 'fashion', def: 'A wide neckcloth, predecessor to the necktie. Romantic-goth and Victorian dandy aesthetic.' },
  { term: 'Frock Coat', cat: 'fashion', def: 'A knee-length men\u2019s coat from the 19th century. The vampire\u2019s uniform.' },
  { term: 'Doc Martens', cat: 'fashion', def: 'British boot brand, originally workwear. Adopted by punks, goths, skinheads, and many others. The 1460 is the canonical model.' },
  { term: 'Creepers', cat: 'fashion', def: 'Thick crepe-soled shoes, originally worn by British servicemen. Adopted by Teddy Boys, then goths and psychobillies.' },
  { term: 'Fishnets', cat: 'fashion', def: 'Open-mesh hosiery. From burlesque to punk to goth — a constant.' },
  { term: 'Velvet', cat: 'fashion', def: 'Plush woven fabric with a distinctive pile. Crushed velvet was foundational to 90s goth.' },
  { term: 'Lace', cat: 'fashion', def: 'Openwork fabric. Romantic, Victorian, mourning aesthetics. Black lace is a goth essential.' },
  { term: 'Brocade', cat: 'fashion', def: 'Heavy fabric with raised patterns, often metallic threads. Used in baroque and romantic goth pieces.' },
  { term: 'Drop', cat: 'fashion', def: 'A new release from a brand, especially a limited one. "The duster drops Saturday."' },

  // === MUSIC ===
  { term: 'Cold Wave', cat: 'music', def: 'See: Coldwave. French/Belgian post-punk variant.' },
  { term: 'No Wave', cat: 'music', def: 'Late-70s NYC underground movement reacting against new wave\u2019s commercial slickness. Atonal, abrasive, art-damaged.' },
  { term: 'Shoegaze', cat: 'music', def: 'Late-80s UK genre defined by walls of distorted guitar, ethereal vocals, downward-tilted gaze. My Bloody Valentine, Slowdive.' },
  { term: 'Dream Pop', cat: 'music', def: 'Atmospheric, washed-out vocal pop. Cocteau Twins, Mazzy Star. Often goth-adjacent.' },
  { term: 'Ethereal Wave', cat: 'music', def: 'Subgenre blending darkwave with dream pop. 4AD label sound. Cocteau Twins, Dead Can Dance.' },
  { term: 'Ritual', cat: 'music', def: 'In music: ambient/dark ambient with overt occult or ceremonial themes. Coil, Current 93.' },
  { term: 'Neofolk', cat: 'music', def: 'Acoustic genre fusing folk traditions with industrial/dark sensibilities. Death in June, Sol Invictus.' },
  { term: 'Drone', cat: 'music', def: 'Sustained tones, minimal harmonic motion. Sunn O))), early Earth.' },
  { term: 'Black Metal', cat: 'music', def: 'Extreme metal subgenre originating in Norway in the early 90s. Tremolo guitars, blast beats, shrieked vocals, atmospheric.' },
  { term: 'Doom Metal', cat: 'music', def: 'Slow, heavy, often gothic-influenced metal. Black Sabbath as godfather. My Dying Bride, Type O Negative.' },

  // === MISC / SCENE FIGURES ===
  { term: 'The Dancefloor', cat: 'scene', def: 'The shared space at a club. Has its own etiquette, its own rules, its own intimacy.' },
  { term: 'Last Call', cat: 'scene', def: 'When the bar stops serving — usually 30-60 min before close. The hour when decisions get made.' },
  { term: 'Guestlist', cat: 'scene', def: 'A list of names who get free or discounted entry, set by the host or DJ. "Put me on the list?"' },
  { term: 'The List', cat: 'scene', def: 'See: Guestlist.' },
  { term: 'Door Person', cat: 'scene', def: 'Whoever is checking IDs and the list at the entrance. Knowing them changes everything.' },
];

// Helper: search the codex
export function searchCodex(query) {
  if (!query) return CODEX;
  const q = query.toLowerCase();
  return CODEX.filter(e =>
    e.term.toLowerCase().includes(q) ||
    e.def.toLowerCase().includes(q) ||
    e.cat.toLowerCase().includes(q)
  );
}
