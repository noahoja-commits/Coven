// All texts are public domain.

export const TEXTS = [
  {
    id: 'kjv', title: 'The Authorized King James Bible', shortTitle: 'King James Bible',
    author: 'Translated A.D. 1611', era: '1611', category: 'scripture', glyph: '✟',
    cover: 'oxblood', sigil: 'cross',
    description: 'The 1611 Authorized Version. Old and New Testament.',
    chapters: [
      {
        id: 'gen-1', title: 'Genesis · Chapter I',
        verses: [
          { n: 1, text: 'In the beginning God created the heaven and the earth.' },
          { n: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.' },
          { n: 3, text: 'And God said, Let there be light: and there was light.' },
          { n: 4, text: 'And God saw the light, that it was good: and God divided the light from the darkness.' },
          { n: 5, text: 'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.' },
          { n: 6, text: 'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.' },
          { n: 7, text: 'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.' },
        ],
      },
      {
        id: 'psalm-23', title: 'The Book of Psalms · Psalm XXIII',
        verses: [
          { n: 1, text: 'The LORD is my shepherd; I shall not want.' },
          { n: 2, text: 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.' },
          { n: 3, text: 'He restoreth my soul: he leadeth me in the paths of righteousness for his name\u2019s sake.' },
          { n: 4, text: 'Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.' },
          { n: 5, text: 'Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.' },
          { n: 6, text: 'Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the LORD for ever.' },
        ],
      },
      {
        id: 'john-1', title: 'The Gospel of John · Chapter I',
        verses: [
          { n: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
          { n: 2, text: 'The same was in the beginning with God.' },
          { n: 3, text: 'All things were made by him; and without him was not any thing made that was made.' },
          { n: 4, text: 'In him was life; and the life was the light of men.' },
          { n: 5, text: 'And the light shineth in darkness; and the darkness comprehended it not.' },
        ],
      },
      { id: 'rev-1', title: 'The Revelation · Chapter I', verses: [{ n: 1, text: 'The Revelation of Jesus Christ, which God gave unto him, to shew unto his servants things which must shortly come to pass\u2026' }, { n: 0, text: '[ Paste the rest of the chapter from your PDF here. ]' }] },
    ],
  },
  {
    id: 'solomon-key', title: 'The Key of Solomon the King', shortTitle: 'Clavicula Salomonis',
    author: 'attr. Solomon · trans. S. L. MacGregor Mathers', era: 'XV c.',
    category: 'grimoire', glyph: '✶', cover: 'darkleather', sigil: 'pentacle',
    description: 'The principal grimoire of ceremonial magic. Conjurations, pentacles, and the art of the magical circle.',
    chapters: [
      {
        id: 'preface', title: 'Preface · Of the Key',
        verses: [
          { n: 1, text: 'Solomon, the Son of David, King of Israel, hath said that the beginning of our Key is to fear God, to adore Him, to honour Him with contrition of heart, to invoke Him in all matters which we wish to undertake, and to operate with very great devotion, for thus God will lead us in the right way.' },
          { n: 2, text: 'When, therefore, thou shalt have a desire to acquire the knowledge of magical arts and sciences, it is necessary to have prepared the order of hours, days, and of the position of the Moon, without the observation of which thou canst reap no fruit.' },
        ],
      },
      {
        id: 'book1-ch1', title: 'Book the First · Chapter I',
        verses: [
          { n: 1, text: 'Concerning the divine love which ought to precede the acquisition of this knowledge.' },
          { n: 2, text: 'When any one wisheth to acquire the knowledge and practice of this our holy Art, he must, before all things, take heed unto himself that he be in good health, of good moral character, and free from all impediment of sin.' },
          { n: 0, text: '[ Continue from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'grimorium-verum', title: 'Grimorium Verum', shortTitle: 'The True Grimoire',
    author: 'attr. Alibeck the Egyptian, Memphis, 1517', era: 'XVIII c.',
    category: 'grimoire', glyph: '◬', cover: 'midnight', sigil: 'triangle',
    description: 'The True Grimoire. Hierarchy of spirits, characters, and operations of practical magic.',
    chapters: [
      {
        id: 'intro', title: 'Approbation',
        verses: [
          { n: 1, text: 'There are without doubt many Grimoires, but none of them give true and certain knowledge save this, which contains the secrets of the True Magick.' },
          { n: 2, text: 'In the spirit hierarchy that follows, the three superior spirits are Lucifer, Beelzebuth, and Astaroth. Beneath them stand their lieutenants, and beneath them, those who serve.' },
          { n: 0, text: '[ Paste the listings of spirits and characters from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'picatrix', title: 'Picatrix', shortTitle: 'Gh\u0101yat al-\u1e24ak\u012bm',
    author: 'attr. al-Majr\u012b\u1e6d\u012b · X\u2013XI c.', era: 'XI c.',
    category: 'grimoire', glyph: '☉', cover: 'fadedgreen', sigil: 'sun',
    description: 'The Aim of the Sage. The most influential treatise on astrological magic in the medieval West.',
    chapters: [
      {
        id: 'b1-ch1', title: 'Book the First · Of Wisdom',
        verses: [
          { n: 1, text: 'The Sages have said: Wisdom is a sacred mountain, and he who would ascend it must first wash himself of all that is unclean, and bind his soul to the rhythm of the heavens.' },
          { n: 2, text: 'Know therefore that all things below partake of the influence of things above, and the wise man is he who reads in the stars the language of God.' },
          { n: 0, text: '[ Paste subsequent passages from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'honorius', title: 'The Sworn Book of Honorius', shortTitle: 'Liber Iuratus Honorii',
    author: 'attr. Honorius of Thebes', era: 'XIII c.',
    category: 'grimoire', glyph: '✠', cover: 'oxblood', sigil: 'crossfleury',
    description: 'The sworn book. One of the foundational texts of Christian magic.',
    chapters: [
      {
        id: 'oath', title: 'The Sworn Oath',
        verses: [
          { n: 1, text: 'I swear by the living God, by the Father, by the Son, and by the Holy Spirit, by the four-and-twenty Elders standing before the throne, that I shall not reveal the contents of this book to any save those whom I have proven to be of pure heart and holy purpose.' },
          { n: 0, text: '[ Paste the rest from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'goetia', title: 'The Lesser Key of Solomon', shortTitle: 'Goetia',
    author: 'compiled c. 1641 · trans. Mathers / Crowley', era: 'XVII c.',
    category: 'grimoire', glyph: '⛧', cover: 'black', sigil: 'goetic',
    description: 'The Goetia — the seventy-two spirits which Solomon bound, with their names, offices, and seals.',
    chapters: [
      {
        id: 'spirits-1-3', title: 'Of the Spirits · I — III',
        verses: [
          { n: 1, text: 'The first principal spirit is a King ruling in the East, called Bael. He maketh thee to go invisible. He ruleth over 66 Legions of Infernal Spirits. He appeareth in divers shapes, sometimes like a Cat, sometimes like a Toad, and sometimes like a Man, and sometimes all these forms at once.' },
          { n: 2, text: 'The second spirit is a Duke called Agares. He is under the power of the East, and cometh up in the form of an old fair Man, riding upon a crocodile, carrying a goshawk upon his fist. He maketh them to run that stand still, and bringeth back runaways.' },
          { n: 3, text: 'The third spirit is a mighty and strong Prince, ruling in the part of the North, by name Vassago. He is of good nature, and his office is to declare things past and to come, and to discover all things hid or lost.' },
          { n: 0, text: '[ Paste the remaining 69 spirits from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'grand-grimoire', title: 'The Grand Grimoire', shortTitle: 'Le Grand Grimoire',
    author: 'attr. Antonio Venitiana del Rabina', era: 'XVIII c.',
    category: 'grimoire', glyph: '☿', cover: 'darkleather', sigil: 'caduceus',
    description: 'The Red Dragon. Containing the dread art of the Pact, and the means of compelling the spirits.',
    chapters: [
      {
        id: 'pact', title: 'Of the Great Pact',
        verses: [
          { n: 1, text: 'Whosoever wisheth to make compact with the spirit Lucifuge Rofocale must first prepare himself with three days of fasting, that his body and soul may be made subtle and apt for the work that follows.' },
          { n: 0, text: '[ Paste the rest of the working from your PDF here. ]' },
        ],
      },
    ],
  },
  {
    id: 'abramelin', title: 'The Sacred Magic of Abra-Melin the Mage', shortTitle: 'Abramelin',
    author: 'Abraham of Worms · trans. Mathers, 1898', era: 'XV c.',
    category: 'grimoire', glyph: '✡', cover: 'fadedgreen', sigil: 'hexagram',
    description: 'A grimoire of the fifteenth century, as delivered by Abraham the Jew unto his son Lamech.',
    chapters: [
      {
        id: 'b1-ch1', title: 'Book the First · Chapter I',
        verses: [
          { n: 1, text: 'I, Abraham, the Son of Simon, do leave unto thee, my son Lamech, this our Sacred Magic, the which I have received from my forefathers, and which I have proved by long experience, that thou mayest after my death use it for thy good and for the good of thy fellow men.' },
          { n: 2, text: 'The end of this Holy Magic is the obtaining of the Knowledge and Conversation of thy Holy Guardian Angel, which is the foundation of all true wisdom and of all true power.' },
          { n: 0, text: '[ Paste the rest of the operation from your PDF here. ]' },
        ],
      },
    ],
  },
];

export const HIGHLIGHTS = {
  'kjv-gen-1-2': [
    { user: 'cryptic.rose', avatar: '🌹', comment: 'the silence before. everything begins in darkness.', likes: 47, time: '2d' },
    { user: 'vesper.exe', avatar: '✟', comment: '"without form, and void" — the most goth opening in literature', likes: 89, time: '5d' },
  ],
  'kjv-psalm-23-4': [
    { user: 'ash.in.october', avatar: '🕯', comment: 'i read this every winter. it always lands different.', likes: 34, time: '1w' },
  ],
  'kjv-john-1-5': [
    { user: 'lilith_xiv', avatar: '🦇', comment: 'the entire thesis of the album i\u2019m writing tbh', likes: 156, time: '3d' },
    { user: 'mortuary.dj', avatar: '⚰', comment: 'comprehended ≠ overcame. the dark just doesn\u2019t get it.', likes: 72, time: '4d' },
  ],
  'goetia-spirits-1-3-1': [
    { user: 'mortis.kvlt', avatar: '☠', comment: 'bael appearing as a cat, a toad, and a man simultaneously is the most fucked up flex', likes: 203, time: '6h' },
  ],
  'solomon-key-preface-1': [
    { user: 'cryptic.rose', avatar: '🌹', comment: 'fear → adore → honour → invoke. the order matters.', likes: 28, time: '1d' },
  ],
};

// Cross-references between texts
export const CROSS_REFS = {
  'kjv-gen-1-1': [{ book: 'john-1', chapter: 'john-1', verse: 1, note: 'echoed in the Logos' }],
  'kjv-john-1-1': [{ book: 'kjv', chapter: 'gen-1', verse: 1, note: 'mirrors Genesis' }],
};
