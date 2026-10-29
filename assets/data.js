/* =====================================================================
   20 SECONDS — CONTENUTI DEL SITO
   Modifica solo questo file per cambiare testi, prodotti, eventi, ecc.

   Immagini: ogni prodotto/evento ha un campo `art` che genera
   un'immagine "pellicola sgranata" automatica. Per usare una foto vera
   aggiungi `image: 'assets/img/nomefile.jpg'` (per le copertine)
   oppure `photo: '...'` (per eventi / news).
   Audio: aggiungi `src: 'assets/audio/file.mp3'` a una traccia o a un
   episodio; senza `src` il player suona un brano generativo di 20 secondi.

   NB: i contenuti segnati come PLACEHOLDER sono da sostituire.
   ===================================================================== */
window.SITE = {
  config: {
    email: 'info@20secondsmag.com',
    currency: '€',
    instagram: 'https://www.instagram.com/',   // PLACEHOLDER
    substack: 'https://substack.com/',         // PLACEHOLDER
    // Se hai un checkout esterno (Shopify, Stripe Payment Link, Snipcart...)
    // metti qui l'URL. Se vuoto, il checkout prepara un'email d'ordine.
    checkoutUrl: '',
    // COMMENTI DI REVISIONE (tasto C). Metti qui "utente/nome-repo" del repo
    // GitHub PUBBLICO: i commenti diventano Issues di quel repo.
    // Se vuoto, i commenti restano salvati solo nel browser (per provare).
    comments: { repo: 'stellafacconi/20seconds-sito' }
  },

  ticker: {
    text: '[NEXT EVENT] ISSUE 10 LAUNCH SHOW: SILENCE — NOV 20, 2026 — BERLIN — SOUND PERFORMANCES & PHYSICAL PRINTS — RSVP: INFO@20SECONDSMAG.COM',
    href: '#/event/issue-10-launch'
  },

  home: {
    product: 'issue-10',
    lines: ['20 SECONDS', 'ISSUE 10', '"SILENCE"', 'WINTER 2026'],
    about: '20 Seconds is a print-only magazine for experimental music and art.'
  },

  store: { featured: 'issue-9' },

  /* ---------------------------- PRODOTTI ---------------------------- */
  products: [
    {
      id: 'issue-10', type: 'magazines', issue: 10, year: 2026, title: 'Silence',
      price: 24, status: 'preorder', art: 'silence',
      lead: '20 Seconds Issue 10: Silence',
      desc: [
        'An issue about what remains when sound withdraws: rests, pauses, room tone, and the politics of who gets to be quiet and who is made silent.',
        'Launching November 20, 2026 in Berlin with sound performances and physical prints. Pre-orders ship in December.'
      ],
      specs: ['165x235 mm', 'Softcover', 'English'],
      featuring: [['TO BE ANNOUNCED', '']]
    },
    {
      id: 'issue-9', image: 'assets/img/covers/issue-9.jpg', type: 'magazines', issue: 9, year: 2025, title: 'The Archive',
      price: 22, art: 'glow',
      lead: '20 Seconds Issue 9: The Archive',
      desc: [
        'follows the stories of individual archives around the world — places where histories are fought for and reclaimed on behalf of those who no longer have the means to do so, often as a result of colonial violence.',
        'Issue 9 is a reminder that archives are contested places that deserve our attention and our action.'
      ],
      specs: ['165x235 mm', '204 pages', 'Softcover', 'Printed by KOPA', 'English'],
      featuring: [['TO BE ANNOUNCED', '']]
    },
    { id: 'issue-8', image: 'assets/img/covers/issue-8.jpg', type: 'magazines', issue: 8, year: 2024, price: 20, art: 'pink' },
    { id: 'issue-7', image: 'assets/img/covers/issue-7.jpg', type: 'magazines', issue: 7, year: 2023, price: 20, art: 'grass' },
    { id: 'issue-6', image: 'assets/img/covers/issue-6.jpg', type: 'magazines', issue: 6, year: 2022, title: 'Non-Present Tense', price: 20, art: 'para', layout: 'para', ink: 'dark' },
    { id: 'issue-5', image: 'assets/img/covers/issue-5.jpg', type: 'magazines', issue: 5, year: 2021, price: 18, art: 'haze' },
    { id: 'issue-4', image: 'assets/img/covers/issue-4.jpg', type: 'magazines', issue: 4, year: 2021, price: 18, art: 'plant', ink: 'dark' },
    { id: 'issue-3', image: 'assets/img/covers/issue-3.jpg', type: 'magazines', issue: 3, year: 2020, price: 18, art: 'pixel', status: 'soldout' },
    { id: 'issue-2', image: 'assets/img/covers/issue-2.jpg', type: 'magazines', issue: 2, year: 2020, price: 18, art: 'red' },
    { id: 'issue-1', image: 'assets/img/covers/issue-1.jpg', type: 'magazines', issue: 1, year: 2019, price: 18, art: 'clouds', status: 'soldout',
      lead: '20 Seconds Issue 1',
      desc: ['The first issue: a manifestation and a declaration. Writers, readers, photographers, poets and artists of varied disciplines and dispositions, collected in print.'],
      spreadPhoto: 'assets/img/photos/toc-1.jpg',
      featuring: [
        ['TUTU', 'interview'], ['ANDREA BELFI', 'interview'], ['MATT THIBIDEAU', 'interview'],
        ['KATJA HEITMANN', 'interview'], ['TOM CHAPMAN', 'photo essay'],
        ["ANDREW 'ANDYCAPP' HICKS", 'essay'], ['ON THE ORIGIN', 'poetry'],
        ['NADAH EL SHAZLY', 'interview'], ['SOUNDS OF RESISTANCE ATHENS DIY', 'report'],
        ['GRISCHA LICHTENBERGER', 'interview']
      ]
    },

    // PLACEHOLDER — merch
    { id: 'poster-silence', type: 'posters', name: 'Silence Poster', sub: 'Risograph — 50x70 cm', price: 20, art: 'silence', posterText: 'Silence', specs: ['50x70 cm', 'Risograph, 2 colours', 'Edition of 100'] },
    { id: 'poster-archive', type: 'posters', name: 'The Archive Poster', sub: 'Risograph — 50x70 cm', price: 20, art: 'glow', posterText: 'The Archive', specs: ['50x70 cm', 'Risograph, 2 colours', 'Edition of 100'] },
    { id: 'poster-field', type: 'posters', name: 'Field Poster', sub: 'Giclée — 30x40 cm', price: 15, art: 'grass', posterText: 'Field', specs: ['30x40 cm', 'Giclée print'] },
    { id: 'tee-black', type: 't-shirts', name: '20S Tee — Black', sub: 'Organic cotton', price: 30, shape: 'tee', color: '#111111', sizes: ['S', 'M', 'L', 'XL'], specs: ['100% organic cotton', 'Screen printed in Berlin'] },
    { id: 'tee-white', type: 't-shirts', name: '20S Tee — White', sub: 'Organic cotton', price: 30, shape: 'tee', color: '#f3f3f1', sizes: ['S', 'M', 'L', 'XL'], specs: ['100% organic cotton', 'Screen printed in Berlin'] },
    { id: 'cap-black', type: 'caps', name: '20S Cap — Black', sub: 'One size', price: 25, shape: 'cap', color: '#111111', specs: ['Embroidered logo', 'One size, adjustable'] },
    { id: 'cap-yellow', type: 'caps', name: '20S Cap — Yellow', sub: 'One size', price: 25, shape: 'cap', color: '#fdff35', specs: ['Embroidered logo', 'One size, adjustable'] },
    { id: 'tote', type: 'others', name: '20S Tote Bag', sub: 'Canvas', price: 15, shape: 'tote', color: '#e8e2d4', specs: ['Heavy canvas', '38x42 cm'] },
    { id: 'stickers', type: 'others', name: 'Sticker Pack', sub: '6 stickers', price: 5, shape: 'stickers', color: '#111111', specs: ['6 vinyl stickers'] }
  ],

  /* ------------------------------ NEWS ------------------------------ */
  news: [
    { date: '10.10.26', title: 'issue 10 launch & listening session', caption: 'curated by daniel melfi and timothy isherwood', art: 'silence', photo: 'assets/img/photos/artist-10-1.jpg', href: '#/event/issue-10-launch' },
    { date: '10.10.26', title: 'open call for 2027 releases', caption: 'curated by daniel melfi and timothy isherwood', art: 'haze', photo: 'assets/img/photos/artist-5-2.jpg', href: '#/about/contact' },
    { date: '10.10.26', source: 'substack', title: '20 seconds radio: episode 32', caption: 'curated by daniel melfi and timothy isherwood', art: 'grass', photo: 'assets/img/photos/radio-29.jpg', href: '#/sounds/podcast' }
  ],

  /* ----------------------------- EVENTI ----------------------------- */
  // date in formato AAAA-MM-GG. city: berlin | milan | toronto | others
  events: [
    {
      id: 'issue-10-launch', photo: 'assets/img/photos/artist-4.jpg', title: 'Issue 10 Launch Show: Silence', city: 'berlin', cityLabel: 'Berlin',
      date: '2026-11-20', time: '19:00', venue: 'Venue TBA', address: 'Berlin',
      art: 'silence', tags: ['sound performances', 'physical prints', 'launch'],
      desc: 'Launch of Issue 10 "Silence" with sound performances and physical prints. RSVP by email.'
    },
    // PLACEHOLDER
    { id: 'listening-milan', photo: 'assets/img/photos/artist-8-2.jpg', title: 'Issue 10 Listening Session', city: 'milan', cityLabel: 'Milano', date: '2026-12-05', time: '20:00', venue: 'Venue TBA', address: 'Milano', art: 'pink', tags: ['listening', 'issue 10'], desc: 'A listening session around the records and artists in Issue 10.' },
    { id: 'toronto-presentation', photo: 'assets/img/photos/artist-5.jpg', title: 'Issue 9 Presentation', city: 'toronto', cityLabel: 'Toronto', date: '2026-03-14', time: '19:00', venue: 'Venue TBA', address: 'Toronto', art: 'clouds', tags: ['talk', 'issue 9'], desc: 'Presentation of Issue 9 "The Archive".' },
    { id: 'issue-9-launch', photo: 'assets/img/photos/artist-5-1.jpg', title: 'Issue 9 Launch: The Archive', city: 'berlin', cityLabel: 'Berlin', date: '2025-11-08', time: '19:00', venue: 'Venue TBA', address: 'Berlin', art: 'glow', tags: ['launch', 'live sets'], desc: 'Launch of Issue 9 "The Archive".' },
    { id: 'athens-talk', photo: 'assets/img/photos/artist-9-1.jpg', title: 'Sounds of Resistance — Talk', city: 'others', cityLabel: 'Athens', date: '2025-06-12', time: '18:30', venue: 'Venue TBA', address: 'Athens', art: 'red', tags: ['talk', 'diy'], desc: 'A conversation on DIY sound cultures in Athens.' }
  ],

  /* ------------------------------ SUONI ----------------------------- */
  // traccia mostrata di default nel player
  tracks: [
    { id: 'issue-9-out', lines: ['ISSUE 9', 'OUT NOW'], date: '10.10.26', seed: 9 }
  ],
  episodes: [
    { id: 'ep-32', n: 32, title: '20 Seconds Radio: Episode 32', date: '10.10.26', desc: 'curated by daniel melfi and timothy isherwood' },
    { id: 'ep-31', n: 31, title: '20 Seconds Radio: Episode 31', date: '10.09.26', desc: 'curated by daniel melfi and timothy isherwood' },
    { id: 'ep-30', n: 30, title: '20 Seconds Radio: Episode 30', date: '10.08.26', desc: 'curated by daniel melfi and timothy isherwood' },
    { id: 'ep-29', n: 29, title: '20 Seconds Radio: Episode 29', date: '10.07.26', desc: 'on Archipel Stations Community Radio — 88.4 Berlin / 90.7 Potsdam' },
    { id: 'ep-28', n: 28, title: '20 Seconds Radio: Episode 28', date: '10.06.26', desc: 'curated by daniel melfi and timothy isherwood' },
    { id: 'ep-27', n: 27, title: '20 Seconds Radio: Episode 27', date: '10.05.26', desc: 'curated by daniel melfi and timothy isherwood' }
  ],
  // PLACEHOLDER
  playlists: [
    { id: 'pl-oct-26', photo: 'assets/img/photos/artist-1-1.jpg', title: 'October 2026', short: 'OCT 26', date: '01.10.26', art: 'pink', tracks: ['Artist — Track title', 'Artist — Track title', 'Artist — Track title', 'Artist — Track title', 'Artist — Track title'] },
    { id: 'pl-sep-26', photo: 'assets/img/photos/artist-7-2.jpg', title: 'September 2026', short: 'SEP 26', date: '01.09.26', art: 'haze', tracks: ['Artist — Track title', 'Artist — Track title', 'Artist — Track title', 'Artist — Track title'] },
    { id: 'pl-aug-26', photo: 'assets/img/photos/artist-2-1.jpg', title: 'August 2026', short: 'AUG 26', date: '01.08.26', art: 'clouds', tracks: ['Artist — Track title', 'Artist — Track title', 'Artist — Track title', 'Artist — Track title', 'Artist — Track title', 'Artist — Track title'] }
  ],

  /* ------------------------------ ABOUT ----------------------------- */
  about: {
    // testi presi dai post "20S_manifesto" (Daniel Melfi)
    intro: '20 Seconds is a print-only magazine for experimental music and art. Actually, it\'s more than that.',
    paragraphs: [
      'It\'s a manifestation and a declaration. Together, as writers, readers, photographers, poets and artists of varied disciplines and dispositions, we\'ve collected our perspectives. Now, we\'re ready to share them with a growing community.',
      'Independence has always been our means and our goal. Creatively, financially and spiritually, we examine the topics that matter to us.'
    ],
    manifesto: [
      'Actually, it\'s more than that.',
      'It\'s a manifestation and a declaration.',
      'Independence has always been our means and our goal.',
      'We\'re determined to reflect inward as much as outward.',
      'It\'s a process rife with contradictions. For us, that\'s part of what makes it so real — along with our acquiescence to all its ambiguities.'
    ],
    manifestoSign: 'Daniel Melfi',
    team: [
      { name: 'Daniel Melfi', role: 'Curator', email: '' },
      { name: 'Timothy Isherwood', role: 'Curator', email: '' }
    ]
  },

  /* ----------------------------- MEDIA ------------------------------ */
  scopeVideo: 'assets/video/scope.mp4',
  radioInfo: '20 Seconds Radio — Archipel Stations Community Radio — 88.4 Berlin / 90.7 Potsdam',
  // foto d'archivio usate nelle doppie pagine
  archive: [
    'assets/img/photos/artist-1.jpg', 'assets/img/photos/artist-1-1.jpg', 'assets/img/photos/artist-10-1.jpg',
    'assets/img/photos/artist-2-1.jpg', 'assets/img/photos/artist-4.jpg', 'assets/img/photos/artist-4-2.jpg',
    'assets/img/photos/artist-5.jpg', 'assets/img/photos/artist-5-1.jpg', 'assets/img/photos/artist-5-2.jpg',
    'assets/img/photos/artist-6-2.jpg', 'assets/img/photos/artist-7-2.jpg', 'assets/img/photos/artist-8-1.jpg',
    'assets/img/photos/artist-8-2.jpg'
  ],

  /* ---------------------------- STOCKIST ---------------------------- */
  stockists: {
    germany: { label: 'Germany', shops: [
      { name: 'DO YOU READ ME?!', address: 'Auguststraße 28,\n10117 Berlin, Germany', url: 'https://www.doyoureadme.de', lat: 52.5267, lng: 13.3966 },
      { name: 'STOCKIST NAME', address: 'Address,\nHamburg, Germany', url: '', lat: 53.5511, lng: 9.9937 } // PLACEHOLDER
    ]},
    italy: { label: 'Italy', shops: [ // PLACEHOLDER
      { name: 'STOCKIST NAME', address: 'Address,\nMilano, Italy', url: '', lat: 45.4642, lng: 9.19 },
      { name: 'STOCKIST NAME', address: 'Address,\nRoma, Italy', url: '', lat: 41.9028, lng: 12.4964 }
    ]},
    france: { label: 'France', shops: [ { name: 'STOCKIST NAME', address: 'Address,\nParis, France', url: '', lat: 48.8566, lng: 2.3522 } ]},
    spain: { label: 'Spain', shops: [ { name: 'STOCKIST NAME', address: 'Address,\nBarcelona, Spain', url: '', lat: 41.3874, lng: 2.1686 } ]},
    greece: { label: 'Greece', shops: [ { name: 'STOCKIST NAME', address: 'Address,\nAthens, Greece', url: '', lat: 37.9838, lng: 23.7275 } ]},
    canada: { label: 'Canada', shops: [ { name: 'STOCKIST NAME', address: 'Address,\nToronto, Canada', url: '', lat: 43.6532, lng: -79.3832 } ]}
  },

  /* ------------------------------ INFO ------------------------------ */
  info: { // PLACEHOLDER
    shipping: { title: 'Shipping & Terms', body: [
      'Orders are shipped within 3–5 working days from Berlin. Shipping costs are calculated at checkout.',
      'Pre-orders are shipped as soon as the issue is printed.',
      'If something arrives damaged, write to us within 14 days and we will replace it.'
    ]},
    credits: { title: 'Credits & Contact', body: [
      'Editors: Daniel Melfi, Timothy Isherwood.',
      'For press, stockist and submission enquiries write to info@20secondsmag.com.'
    ]}
  },

  searchSuggestions: ['issue 10', 'silence', 'the archive', 'andrea belfi', 'posters', 't-shirts', 'berlin', 'radio']
};
