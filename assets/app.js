/* 20 SECONDS — single-page app (hash router, no build step) */
(function () {
  'use strict';
  const S = window.SITE, A = window.Art;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => S.config.currency + Number(n).toFixed(2);
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const jl = line => `<span class="jl">${String(line).split(' ').map(w => `<span>${esc(w)}</span>`).join('')}</span>`;
  const fmtDate = iso => { const [y, m, d] = iso.split('-'); return `${d}.${m}.${y.slice(2)}`; };
  const today = () => new Date().toISOString().slice(0, 10);

  /* ------------------------------ i18n ------------------------------ */
  const I18N = {
    en: {
      store: 'store', events: 'events', sounds: 'sounds', about: 'about', stockist: 'stockist',
      all: 'all', magazines: 'magazines', posters: 'posters', 't-shirts': 't-shirts', caps: 'caps', others: 'others',
      berlin: 'berlin', milan: 'milan', toronto: 'toronto', podcast: 'podcast', playlist: 'playlist',
      aboutSub: 'about', manifesto: 'manifesto', team: 'team', contact: 'contact',
      germany: 'germany', italy: 'italy', france: 'france', spain: 'spain', greece: 'greece', canada: 'canada',
      cart: 'CART', add: 'ADD TO CART', added: 'ADDED', soldout: 'SOLD OUT', preorder: 'PRE-ORDER', outnow: 'OUT NOW',
      featuring: 'FEATURING', shipping: 'Shipping & Terms', credits: 'Credits & Contact',
      search: 'search..', suggestion: 'SUGGESTION', products: 'PRODUCTS', noresults: 'No results.',
      subtotal: 'SUBTOTAL', checkout: 'CHECKOUT', close: 'CLOSE', empty: 'Your cart is empty.',
      shipnote: 'Shipping is calculated at checkout.', upcoming: 'upcoming', past: 'past',
      rsvp: 'RSVP', addcal: 'ADD TO CALENDAR', chooseSize: 'Choose a size first', soon: 'Description coming soon.',
      subscribe: 'SUBSCRIBE', youremail: 'your email', newsletter: 'Newsletter', notfound: 'Nothing here.', home: 'Back home',
      scroll: 'scroll', noevents: 'No events here yet.', stockistsIn: 'stockists', write: 'Write to us'
    },
    it: {
      store: 'negozio', events: 'eventi', sounds: 'suoni', about: 'info', stockist: 'rivenditori',
      all: 'tutto', magazines: 'riviste', posters: 'poster', 't-shirts': 't-shirt', caps: 'cappelli', others: 'altro',
      berlin: 'berlino', milan: 'milano', toronto: 'toronto', podcast: 'podcast', playlist: 'playlist',
      aboutSub: 'chi siamo', manifesto: 'manifesto', team: 'team', contact: 'contatti',
      germany: 'germania', italy: 'italia', france: 'francia', spain: 'spagna', greece: 'grecia', canada: 'canada',
      cart: 'CARRELLO', add: 'AGGIUNGI', added: 'AGGIUNTO', soldout: 'ESAURITO', preorder: 'PREORDINA', outnow: 'OUT NOW',
      featuring: 'CON', shipping: 'Spedizioni & Termini', credits: 'Crediti & Contatti',
      search: 'cerca..', suggestion: 'SUGGERIMENTI', products: 'PRODOTTI', noresults: 'Nessun risultato.',
      subtotal: 'SUBTOTALE', checkout: 'CHECKOUT', close: 'CHIUDI', empty: 'Il carrello è vuoto.',
      shipnote: 'La spedizione è calcolata al checkout.', upcoming: 'in arrivo', past: 'passati',
      rsvp: 'RSVP', addcal: 'AGGIUNGI AL CALENDARIO', chooseSize: 'Scegli prima una taglia', soon: 'Descrizione in arrivo.',
      subscribe: 'ISCRIVITI', youremail: 'la tua email', newsletter: 'Newsletter', notfound: 'Qui non c\'è niente.', home: 'Torna alla home',
      scroll: 'scorri', noevents: 'Ancora nessun evento.', stockistsIn: 'rivenditori', write: 'Scrivici'
    },
    de: {
      store: 'shop', events: 'events', sounds: 'sounds', about: 'über', stockist: 'händler',
      all: 'alle', magazines: 'magazine', posters: 'poster', 't-shirts': 't-shirts', caps: 'caps', others: 'andere',
      berlin: 'berlin', milan: 'mailand', toronto: 'toronto', podcast: 'podcast', playlist: 'playlist',
      aboutSub: 'über uns', manifesto: 'manifest', team: 'team', contact: 'kontakt',
      germany: 'deutschland', italy: 'italien', france: 'frankreich', spain: 'spanien', greece: 'griechenland', canada: 'kanada',
      cart: 'WARENKORB', add: 'IN DEN WARENKORB', added: 'HINZUGEFÜGT', soldout: 'AUSVERKAUFT', preorder: 'VORBESTELLEN', outnow: 'OUT NOW',
      featuring: 'MIT', shipping: 'Versand & AGB', credits: 'Impressum & Kontakt',
      search: 'suchen..', suggestion: 'VORSCHLÄGE', products: 'PRODUKTE', noresults: 'Keine Ergebnisse.',
      subtotal: 'ZWISCHENSUMME', checkout: 'KASSE', close: 'SCHLIESSEN', empty: 'Dein Warenkorb ist leer.',
      shipnote: 'Versandkosten werden an der Kasse berechnet.', upcoming: 'kommend', past: 'vergangen',
      rsvp: 'RSVP', addcal: 'ZUM KALENDER', chooseSize: 'Bitte Größe wählen', soon: 'Beschreibung folgt.',
      subscribe: 'ABONNIEREN', youremail: 'deine email', newsletter: 'Newsletter', notfound: 'Hier ist nichts.', home: 'Zur Startseite',
      scroll: 'scrollen', noevents: 'Noch keine Events.', stockistsIn: 'händler', write: 'Schreib uns'
    }
  };
  let lang = ls.get('20s-lang', 'en'); if (!I18N[lang]) lang = 'en';
  const t = k => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;

  const NAV = [
    { key: 'store', href: '#/store', items: ['all', 'magazines', 'posters', 't-shirts', 'caps', 'others'] },
    { key: 'events', href: '#/events', items: ['all', 'berlin', 'milan', 'toronto', 'others'] },
    { key: 'sounds', href: '#/sounds', items: ['podcast', 'playlist'] },
    { key: 'about', href: '#/about', items: ['about', 'manifesto', 'team', 'contact'] },
    { key: 'stockist', href: '#/stockist', items: ['all', ...Object.keys(S.stockists)] }
  ];
  const subHref = (n, k) => (k === 'all' || (n.key === 'about' && k === 'about')) ? n.href : `${n.href}/${k}`;
  const subLabel = (n, k) => t(n.key === 'about' && k === 'about' ? 'aboutSub' : k);

  /* ------------------------------ lookups ---------------------------- */
  const byId = id => S.products.find(p => p.id === id);
  const isMag = p => p.type === 'magazines';
  const pName = p => isMag(p) ? `Issue ${p.issue}` : p.name;
  const pFull = p => isMag(p) ? `20Seconds Mag Issue ${p.issue}` : p.name;
  const mags = () => S.products.filter(isMag).sort((a, b) => a.issue - b.issue);
  const priceLabel = p => p.status === 'soldout' ? t('soldout') : money(p.price);

  /* ------------------------------ visuals ---------------------------- */
  function barcode(seed) {
    const r = A.rng(seed * 97 + 3); let x = 0, bars = '';
    while (x < 98) {
      const w = r() < 0.5 ? 0.8 : r() < 0.6 ? 1.6 : 2.6;
      bars += `<rect x="${x.toFixed(1)}" width="${w}" height="${r() < 0.15 ? 30 : 27}"/>`;
      x += w + (r() < 0.5 ? 0.7 : 1.4);
    }
    return `<svg class="barcode" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
  }
  function coverInner(p) {
    if (p.image) return `<div class="cover__in cover__in--photo"><img src="${esc(p.image)}" alt="" loading="lazy"></div>`;
    const img = A.url(p.art, 360, 480);
    if (p.layout === 'para') {
      return `<div class="cover__in cover__in--para" style="background-image:url(${img})">
        <div class="para__top"><b>${esc((p.title || '').toUpperCase())}</b><span>Issue ${p.issue}</span></div>
        <div class="para__mid"><small>MAGAZINE FOR EXPERIMENTAL MUSIC<br>AND ART</small>
        <div class="para__row"><span class="para__logo">:20<br>(para)seconds</span>${barcode(p.issue)}</div></div></div>`;
    }
    return `<div class="cover__in"><div class="cover__img" style="background-image:url(${img})"><div class="cover__mast">20<b>SECONDS</b><small>Issue ${p.issue}</small></div></div><div class="cover__foot"><span>magazine for<br>experimental music and art</span>${barcode(p.issue)}</div></div>`;
  }
  function coverHTML(p, { link = true, cls = '' } = {}) {
    const c = `cover ${p.ink === 'dark' ? 'cover--dark' : ''} ${cls}`;
    return link
      ? `<a class="${c}" href="#/product/${p.id}" aria-label="${esc(pFull(p))}">${coverInner(p)}</a>`
      : `<div class="${c}">${coverInner(p)}</div>`;
  }
  function thingSVG(p) {
    const c = p.color || '#111', light = /^#(f|e|d)/i.test(c), ink = light ? '#111' : '#fff';
    const logo = (x, y, s, fill = ink) => `<text x="${x}" y="${y}" font-family="Inter Tight,Helvetica,Arial" font-size="${s}" fill="${fill}" text-anchor="middle" letter-spacing="-1.5"><tspan font-weight="300">20</tspan><tspan font-weight="800">S</tspan></text>`;
    let body = '';
    if (p.shape === 'tee') body = `<path d="M100 78 L135 62 Q150 82 165 62 L200 78 L250 118 L226 156 L202 142 L202 340 L98 340 L98 142 L74 156 L50 118 Z" fill="${c}" stroke="#0002"/>${logo(150, 150, 30)}`;
    else if (p.shape === 'cap') body = `<path d="M70 236 Q74 150 150 144 Q226 150 230 236 Z" fill="${c}" stroke="#0002"/><path d="M62 236 Q150 220 250 236 Q262 254 240 260 Q150 246 72 262 Q48 256 62 236 Z" fill="${c}" stroke="#0003"/>${logo(150, 205, 32, light ? '#111' : (c === '#fdff35' ? '#111' : '#fdff35'))}`;
    else if (p.shape === 'tote') body = `<path d="M118 150 Q118 80 150 80 Q182 80 182 150" fill="none" stroke="${c}" stroke-width="9" filter="brightness(.9)"/><rect x="80" y="145" width="140" height="180" fill="${c}" stroke="#0002"/>${logo(150, 250, 40, '#111')}`;
    else body = [[110, 150, 46, '#111'], [190, 140, 34, '#fdff35'], [150, 230, 52, '#fff'], [100, 290, 30, '#d9d9d9'], [205, 270, 40, '#111']]
      .map(([x, y, r, f]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="#0002"/>${logo(x, y + r * 0.22, r * 0.62, f === '#111' ? '#fff' : '#111')}`).join('');
    return `<svg viewBox="0 0 300 400" aria-hidden="true">${body}</svg>`;
  }
  function visual(p, { link = false } = {}) {
    if (isMag(p)) return coverHTML(p, { link });
    let inner;
    if (p.image) inner = `<img src="${esc(p.image)}" alt="" loading="lazy">`;
    else if (p.type === 'posters') inner = `<div class="poster" style="background-image:url(${A.url(p.art, 360, 540)})"><span class="poster__logo">20<b>S</b></span><span class="poster__t">${esc(p.posterText || p.name)}</span></div>`;
    else inner = `<div class="thing">${thingSVG(p)}</div>`;
    return link ? `<a class="vis" href="#/product/${p.id}" aria-label="${esc(p.name)}">${inner}</a>` : `<div class="vis">${inner}</div>`;
  }
  function spreadA(p) {
    const ph = pool(), a = A.url('plant', 360, 480), b = A.url('pixel', 360, 480);
    const tiles = seed => {
      const r = A.rng(seed); let s = '';
      for (let i = 0; i < 12; i++) {
        const src = ph ? esc(ph[(r() * ph.length) | 0]) : (r() < 0.6 ? a : b);
        s += `<i class="${r() < 0.4 ? 'red' : ''}" style="background-image:url(${src});${ph ? 'background-size:cover;background-position:center' : `background-position:${(r() * 100) | 0}% ${(r() * 100) | 0}%`}"></i>`;
      }
      return s;
    };
    return `<div class="spread spread--a"><div class="spread__in"><div class="pg pg--dark"><div class="tiles">${tiles(p.issue * 7 + 1)}</div></div><div class="pg pg--dark"><div class="tiles">${tiles(p.issue * 13 + 5)}</div></div></div></div>`;
  }
  function spreadB(p) {
    const base = [p.lead, ...(p.desc || [])].filter(Boolean).join(' ') || S.about.intro;
    const filler = (base + ' ').repeat(6).slice(0, 1700);
    return `<div class="spread spread--b"><div class="spread__in"><div class="pg pg--txt"><span class="vtitle">20 SECONDS MAGAZINE</span><p>${esc(filler)}</p></div><div class="pg pg--img" style="background-image:url(${p.spreadPhoto ? esc(p.spreadPhoto) : pool() ? esc(pool()[(p.issue * 5) % pool().length]) : A.url(p.art === 'grass' ? 'clouds' : 'grass', 360, 480)})"><p>${esc(filler.slice(0, 700))}</p></div></div></div>`;
  }
  const bgDiv = p => p.image
    ? `<div class="bgimg bgimg--photo" style="background-image:url(${esc(p.image)})"></div>`
    : `<div class="bgimg" style="background-image:url(${A.url(p.art, 360, 480)})"></div>`;
  const pool = () => (S.archive && S.archive.length ? S.archive : null);
  const ptitle = (a, b) => `<h1 class="ptitle">${esc(a)}/<b>${esc(b)}</b></h1>`;
  const imgOf = o => o.photo ? esc(o.photo) : A.url(o.art || 'haze', 360, 480);

  /* ------------------------------- pages ----------------------------- */
  function home() {
    const h = S.home, p = byId(h.product) || mags().slice(-1)[0];
    const html = `
      <section class="hero">
        <div class="hero__txt">
          <div class="hero__lines">${h.lines.map(jl).join('')}</div>
          <p class="hero__about">${esc(h.about)}</p>
        </div>
        <div class="hero__vis grain">${bgDiv(p)}${coverHTML(p, { cls: 'hero__cover' })}</div>
      </section>
      <section class="news">${S.news.map(n => `
        <a class="news__item" href="${esc(n.href || '#/')}">
          <div class="news__meta"><span>${esc(n.date)}</span><span>${esc(n.source || '')}</span></div>
          <h3 class="news__title">${esc(n.title)}</h3>
          <div class="news__img" style="background-image:url(${imgOf(n)})"></div>
          <p class="news__cap">${esc(n.caption || '')}</p>
        </a>`).join('')}
      </section>
      <section class="strip" data-drag>${mags().map(m => coverHTML(m)).join('')}</section>`;
    return { html, after: initStrips };
  }

  function storePage(cat) {
    const cats = NAV[0].items;
    if (!cats.includes(cat)) return notFound();
    const list = S.products.filter(p => cat === 'all' || p.type === cat);
    const sorted = [...list.filter(isMag).sort((a, b) => a.issue - b.issue), ...list.filter(p => !isMag(p))];
    let feat = '';
    const f = byId(S.store.featured);
    if (f && (cat === 'all' || cat === 'magazines')) {
      feat = `<section class="feat grain ${f.ink === 'dark' ? 'is-dark' : ''}">
        ${bgDiv(f)}
        <div class="feat__label"><b class="jl"><span>ISSUE</span><span>${f.issue}</span></b><b>${t('outnow')}</b><span>${f.year}</span></div>
        <a class="feat__cover" href="#/product/${f.id}" aria-label="${esc(pFull(f))}">${coverHTML(f, { link: false })}</a>
        <div class="feat__spread">${spreadB(f)}</div>
      </section>`;
    }
    const grid = sorted.length
      ? `<section class="sgrid">${sorted.map(p => `<a class="card" href="#/product/${p.id}"><div class="card__vis">${visual(p)}</div><div class="card__info"><span>${esc(pName(p))}</span><span>${priceLabel(p)}</span></div></a>`).join('')}</section>`
      : `<p class="empty">${t('noresults')}</p>`;
    return { html: ptitle(t('store'), t(cat)) + feat + grid, title: t('store') };
  }

  function productPage(id) {
    const p = byId(id); if (!p) return notFound();
    const mag = isMag(p), dark = p.ink === 'dark';
    const name = mag ? `<b>ISSUE ${p.issue}</b><span>${p.year}</span>` : `<b>${esc(p.name)}</b><span>${esc(p.sub || '')}</span>`;
    const hasBg = mag || p.art;
    const bg = hasBg ? bgDiv(p) : '';
    const buy = p.status === 'soldout'
      ? `<span class="btn btn--off">${t('soldout')}</span>`
      : `<button class="btn" data-add="${p.id}">${p.status === 'preorder' ? t('preorder') : t('add')}</button>`;
    const sizes = p.sizes ? `<div class="sizes">${p.sizes.map(s => `<button class="size" data-size="${s}">${s}</button>`).join('')}</div>` : '';
    const desc = (p.desc && p.desc.length ? p.desc : [t('soon')]).map((d, i) => `<p>${i === 0 && p.lead ? `<b>${esc(p.lead)}</b> ` : ''}${esc(d)}</p>`).join('');
    const specs = (p.specs || (mag ? ['165x235 mm', 'Softcover', 'English'] : [])).map(s => `<li>${esc(s)}</li>`).join('');
    const feat = p.featuring ? `<div class="pdp__feat"><h4>${t('featuring')}</h4><ul>${p.featuring.map(([a, b]) => `<li><span>${esc(a)}</span><span>${esc(b || '')}</span></li>`).join('')}</ul></div>` : '';
    const others = [...mags(), ...S.products.filter(x => !isMag(x))].filter(x => x.id !== p.id);
    const html = `
      <section class="pdp" id="pdp">
        <div class="pdp__main">
          <div class="pdp__hero ${hasBg ? 'grain' : 'pdp__hero--plain'} ${dark ? 'is-dark' : ''}">
            ${bg}
            <div class="pdp__label">${name}</div>
            <div class="pdp__vis">${visual(p)}</div>
            <span class="pdp__hint">↓ ${t('scroll')}</span>
          </div>
          ${mag ? `<div class="pdp__spreads">${spreadA(p)}${spreadB(p)}</div>` : ''}
        </div>
        <aside class="pdp__side"><div class="pdp__sidein">
          <div class="pdp__head"><div class="pdp__name">${name}</div><div class="pdp__buy"><span class="pdp__price">${money(p.price)}</span>${buy}</div></div>
          ${sizes}
          <div class="pdp__desc">${desc}</div>
          <ul class="pdp__specs">${specs}</ul>
          ${feat}
          <div class="pdp__links"><a href="#/info/shipping">${t('shipping')}</a><a href="#/info/credits">${t('credits')}</a></div>
        </div></aside>
      </section>
      <section class="strip" data-drag>${others.map(o => visual(o, { link: true })).join('')}</section>`;
    return {
      html, title: pFull(p),
      after() {
        const pdp = $('#pdp'), mq = matchMedia('(min-width: 901px)');
        const on = () => pdp.classList.toggle('open', !mq.matches || window.scrollY > 30);
        on();
        window.addEventListener('scroll', on, { passive: true });
        cleanups.push(() => window.removeEventListener('scroll', on));
        pdp.addEventListener('click', e => {
          const b = e.target.closest('.size'); if (!b) return;
          $$('.size', pdp).forEach(x => x.classList.toggle('on', x === b));
          pdp.dataset.size = b.dataset.size;
        });
        initStrips();
      }
    };
  }

  function evCard(e) {
    const past = e.date < today();
    return `<a class="ev ${past ? 'ev--past' : 'ev--up'}" href="#/event/${e.id}">
      <div class="ev__meta"><span>${fmtDate(e.date)}${past ? ' — ' + t('past') : ''}</span><span>${esc(e.cityLabel || e.city)}</span></div>
      <h3 class="ev__title">${esc(e.title)}</h3>
      <div class="ev__img" style="background-image:url(${imgOf(e)})"></div>
      <p class="ev__tags">${esc((e.tags || []).join(', '))}</p>
    </a>`;
  }
  function eventsPage(city) {
    if (!NAV[1].items.includes(city)) return notFound();
    const list = S.events.filter(e => city === 'all' || e.city === city);
    const now = today();
    const up = list.filter(e => e.date >= now).sort((a, b) => a.date.localeCompare(b.date));
    const past = list.filter(e => e.date < now).sort((a, b) => b.date.localeCompare(a.date));
    const body = list.length ? `<div class="evs" id="evs" data-f="all">${[...up, ...past].map(evCard).join('')}</div>` : `<p class="empty">${t('noevents')}</p>`;
    const html = ptitle(t('events'), t(city)) + `<section class="evwrap"><div class="pills" id="pills">${['all', 'upcoming', 'past'].map((f, i) => `<button class="pill ${i ? '' : 'on'}" data-f="${f}">${t(f)}</button>`).join('')}</div>${body}</section>`;
    return {
      html, title: t('events'),
      after() {
        const pills = $('#pills'), evs = $('#evs');
        pills.addEventListener('click', e => {
          const b = e.target.closest('.pill'); if (!b || !evs) return;
          $$('.pill', pills).forEach(x => x.classList.toggle('on', x === b));
          evs.dataset.f = b.dataset.f;
        });
      }
    };
  }
  function ics(e) {
    const d = e.date.replace(/-/g, ''), tm = (e.time || '19:00').replace(':', '') + '00';
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//20 Seconds//EN', 'BEGIN:VEVENT', `UID:${e.id}@20secondsmag.com`,
      `DTSTAMP:${d}T000000Z`, `DTSTART:${d}T${tm}`, `SUMMARY:${e.title}`, `LOCATION:${[e.venue, e.address].filter(Boolean).join(', ')}`,
      `DESCRIPTION:${e.desc || ''}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(body);
  }
  function eventPage(id) {
    const e = S.events.find(x => x.id === id); if (!e) return notFound();
    const mail = `mailto:${S.config.email}?subject=${encodeURIComponent('RSVP — ' + e.title)}`;
    const html = ptitle(t('events'), e.cityLabel || e.city) + `
      <section class="evd">
        <div class="evd__img grain" style="background-image:url(${imgOf(e)})"></div>
        <div class="evd__info">
          <div class="evd__date">${fmtDate(e.date)}${e.time ? ' — ' + esc(e.time) : ''}</div>
          <h2 class="evd__title">${esc(e.title)}</h2>
          <p class="evd__where">${esc(e.venue || '')}<br>${esc(e.address || '')}</p>
          <p class="evd__desc">${esc(e.desc || '')}</p>
          <p class="ev__tags">${esc((e.tags || []).join(', '))}</p>
          <div class="evd__btns">${e.date >= today() ? `<a class="btn" href="${mail}">${t('rsvp')}</a><a class="btn btn--ghost" href="${ics(e)}" download="${e.id}.ics">${t('addcal')}</a>` : ''}<a class="btn btn--ghost" href="#/events/${e.city}">← ${t(e.city)}</a></div>
        </div>
      </section>`;
    return { html, title: e.title };
  }

  const playIcon = '<svg viewBox="0 0 24 24"><path d="M4 2l18 10L4 22z"/></svg>';
  const scopeBand = () => S.scopeVideo ? `<div class="scope"><video src="${esc(S.scopeVideo)}" autoplay muted loop playsinline preload="auto"></video><span>${esc(S.radioInfo || '')}</span></div>` : '';
  function soundsPage(sub) {
    if (sub === 'podcast') {
      const html = ptitle(t('sounds'), t('podcast')) + scopeBand() + `<ul class="eps">${S.episodes.map(e => `
        <li class="ep" data-play="${e.id}" tabindex="0" role="button" aria-label="Play ${esc(e.title)}">
          <span class="ep__n">${e.n}</span>
          <span class="ep__t">${esc(e.title)}<small>${esc(e.desc || '')}</small></span>
          <span class="ep__d">${esc(e.date)}</span><span class="ep__len">${e.src ? '' : '0:20'}</span>
          <span class="ep__play">${playIcon}</span>
        </li>`).join('')}</ul>`;
      return { html, title: t('podcast') };
    }
    if (sub === 'playlist') {
      const html = ptitle(t('sounds'), t('playlist')) + scopeBand() + `<section class="pls">${S.playlists.map(p => `
        <article class="pl" data-pl="${p.id}">
          <div class="pl__img grain" data-play="${p.id}" style="background-image:url(${imgOf(p)})" role="button" tabindex="0" aria-label="Play ${esc(p.title)}"><span class="sq">${playIcon}</span></div>
          <h3><span>${esc(p.title)}</span><span>${esc(p.date || '')}</span></h3>
          <ol>${p.tracks.map(x => `<li>${esc(x)}</li>`).join('')}</ol>
        </article>`).join('')}</section>`;
      return { html, title: t('playlist') };
    }
    return notFound();
  }

  function aboutPage(sub) {
    const ab = S.about;
    if (sub === 'about') return { title: t('aboutSub'), html: `<h1 class="ptitle"><b>${esc(t('aboutSub'))}</b></h1><section class="ab"><p class="ab__intro">${esc(ab.intro)}</p><div class="ab__cols">${ab.paragraphs.map(x => `<p>${esc(x)}</p>`).join('')}</div></section>` };
    if (sub === 'manifesto') return { title: t('manifesto'), html: ptitle(t('about'), t('manifesto')) + `<section class="ab"><ol class="mani">${ab.manifesto.map((x, i) => `<li><span>${String(i + 1).padStart(2, '0')}</span>${esc(x)}</li>`).join('')}</ol>${ab.manifestoSign ? `<p class="mani__sign">— ${esc(ab.manifestoSign)}</p>` : ''}</section>` };
    if (sub === 'team') return { title: t('team'), html: ptitle(t('about'), t('team')) + `<section class="ab"><ul class="team">${ab.team.map(m => `<li><span>${esc(m.name)}</span><span>${esc(m.role)}</span><span>${m.email ? `<a href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : ''}</span></li>`).join('')}</ul></section>` };
    if (sub === 'contact') return {
      title: t('contact'),
      html: ptitle(t('about'), t('contact')) + `<section class="ab contact">
        <a class="contact__mail" href="mailto:${esc(S.config.email)}">${esc(S.config.email)}</a>
        <div class="contact__links"><a class="btn" href="${esc(S.config.instagram)}" target="_blank" rel="noopener">INSTAGRAM</a><a class="btn" href="${esc(S.config.substack)}" target="_blank" rel="noopener">SUBSTACK</a></div>
        <div><p style="font-size:15px;color:var(--grey);margin-bottom:8px">${t('newsletter')}</p>${newsletterForm()}</div>
      </section>`
    };
    return notFound();
  }
  const newsletterForm = () => `<form class="nl" data-nl><input type="email" required placeholder="${t('youremail')}" aria-label="${t('youremail')}"><button>${t('subscribe')}</button></form>`;

  function infoPage(key) {
    const p = S.info[key]; if (!p) return notFound();
    return { title: p.title, html: `<h1 class="ptitle"><b>${esc(p.title)}</b></h1><section class="info">${p.body.map(x => `<p>${esc(x)}</p>`).join('')}</section>` };
  }

  function stockistPage(country) {
    const keys = Object.keys(S.stockists);
    if (country !== 'all' && !keys.includes(country)) return notFound();
    const groups = country === 'all' ? keys : [country];
    const shops = [];
    const list = groups.map(k => {
      const g = S.stockists[k];
      return (country === 'all' ? `<h3>${esc(t(k))}</h3>` : '') + g.shops.map(s => {
        const i = shops.push(s) - 1;
        const label = s.url ? s.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';
        return `<div class="shop" data-i="${i}" tabindex="0"><b>${esc(s.name)}</b><span>${esc(s.address)}</span>${label ? `<a class="shop__url" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(label)}</a>` : ''}</div>`;
      }).join('');
    }).join('');
    const html = `<section class="stk"><div class="stk__map" id="map"></div><aside class="stk__side"><h2>${esc(country === 'all' ? t('stockist') : t(country))}</h2>${list}</aside></section>`;
    return { html, title: t('stockist'), after: () => initMap(shops) };
  }

  function notFound() {
    return { title: '404', html: `<p class="notfound">${t('notfound')} <a href="#/">${t('home')}</a></p>` };
  }

  /* ------------------------------- map ------------------------------- */
  let map = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
  }
  function initMap(shops) {
    const el = $('#map'), side = $('.stk__side');
    const setActive = (i, fly) => {
      $$('.shop', side).forEach(x => x.classList.toggle('active', +x.dataset.i === i));
      markers.forEach((m, j) => m && m.getElement() && m.getElement().classList.toggle('active', j === i));
      if (fly && map) map.flyTo([shops[i].lat, shops[i].lng], 13, { duration: 1.2 });
    };
    const markers = [];
    side.addEventListener('click', e => {
      const s = e.target.closest('.shop'); if (!s || e.target.closest('a')) return;
      setActive(+s.dataset.i, true);
    });
    side.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.shop')) setActive(+e.target.dataset.i, true); });
    loadLeaflet().then(() => {
      if (!document.body.contains(el)) return;
      map = L.map(el, { zoomControl: false, attributionControl: true, scrollWheelZoom: true });
      L.control.zoom({ position: 'bottomleft' }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Tiles © Esri' }).addTo(map);
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18 }).addTo(map);
      const icon = L.divIcon({ className: 'pin', html: '<span></span>', iconSize: [14, 14] });
      shops.forEach((s, i) => {
        if (s.lat == null) return;
        markers[i] = L.marker([s.lat, s.lng], { icon, title: s.name }).addTo(map).on('click', () => {
          setActive(i, false);
          const card = $(`.shop[data-i="${i}"]`, side); card && card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
      const pts = shops.filter(s => s.lat != null).map(s => [s.lat, s.lng]);
      if (pts.length === 1) map.setView(pts[0], 13);
      else if (pts.length) map.fitBounds(pts, { padding: [60, 60], maxZoom: 6 });
      else map.setView([50, 10], 4);
    }).catch(() => { el.innerHTML = '<div class="fallback">Map unavailable offline.</div>'; });
    cleanups.push(() => { if (map) { map.remove(); map = null; } });
  }

  /* ----------------------------- strips ------------------------------ */
  function initStrips() {
    $$('[data-drag]').forEach(el => {
      let down = false, sx = 0, sl = 0, moved = false;
      el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; });
      el.addEventListener('pointermove', e => {
        if (!down) return;
        const dx = e.clientX - sx;
        if (!moved && Math.abs(dx) > 5) { moved = true; el.classList.add('dragging'); el.setPointerCapture(e.pointerId); }
        if (moved) el.scrollLeft = sl - dx;
      });
      const up = () => { down = false; el.classList.remove('dragging'); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      el.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
      el.addEventListener('dragstart', e => e.preventDefault());
    });
  }

  /* ------------------------------ router ----------------------------- */
  const app = $('#app'), hd = $('#hd'), nav = $('#nav');
  let cleanups = [];
  const routes = {
    '': home,
    store: c => storePage(c || 'all'),
    product: productPage,
    events: c => eventsPage(c || 'all'),
    event: eventPage,
    sounds: c => soundsPage(c || 'podcast'),
    about: c => aboutPage(c || 'about'),
    stockist: c => stockistPage(c || 'all'),
    info: infoPage
  };
  function router() {
    cleanups.forEach(f => { try { f(); } catch (e) { /* ignore */ } });
    cleanups = [];
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const fn = routes[parts[0] || ''];
    const out = (fn ? fn(parts[1]) : null) || notFound();
    document.body.dataset.page = parts[0] || 'home';
    app.innerHTML = out.html;
    document.title = (out.title ? out.title.charAt(0).toUpperCase() + out.title.slice(1) + ' — ' : '') + '20 Seconds';
    window.scrollTo(0, 0);
    if (out.after) out.after();
    markNav(parts);
    closeSearch(); closeCart();
    syncPlaying();
  }
  function markNav(parts) {
    const h = '#/' + parts.join('/');
    $$('.nav__item', nav).forEach(it => { it.classList.toggle('cur', it.dataset.k === parts[0]); it.classList.remove('open'); });
    $$('.nav__drop a', nav).forEach(a => a.classList.toggle('active', a.getAttribute('href') === h || (parts.length === 1 && a.getAttribute('href') === '#/' + parts[0] && a === a.parentElement.firstElementChild)));
  }

  /* ------------------------------ chrome ----------------------------- */
  function buildNav() {
    nav.innerHTML = NAV.map(n => `<div class="nav__item" data-k="${n.key}"><a class="nav__label" href="${n.href}">${t(n.key)}</a><div class="nav__drop">${n.items.map(k => `<a href="${subHref(n, k)}">${subLabel(n, k)}</a>`).join('')}</div></div>`).join('');
  }
  function renderFooter() {
    $('#ft').innerHTML = `<div class="ft__grid">
      <div class="ft__brand"><a class="logo" href="#/">20<b>S</b></a><p>magazine for<br>experimental music and art</p></div>
      ${NAV.map(n => `<ul><li><a class="ft__h" href="${n.href}">${t(n.key)}</a></li>${n.items.filter(k => k !== 'all').map(k => `<li><a href="${subHref(n, k)}">${subLabel(n, k)}</a></li>`).join('')}</ul>`).join('')}
    </div>
    <div class="ft__bottom"><a href="#/info/shipping">${t('shipping')}</a><a href="#/info/credits">${t('credits')}</a><a href="mailto:${esc(S.config.email)}">${esc(S.config.email)}</a><a href="${esc(S.config.instagram)}" target="_blank" rel="noopener">Instagram</a><span>© ${new Date().getFullYear()} 20 Seconds</span></div>`;
  }
  function renderChrome() {
    document.documentElement.lang = lang;
    buildNav(); renderFooter();
    $('#ticker').href = S.ticker.href || '#/events';
    $('.ticker__track').innerHTML = Array(4).fill(`<span>${esc(S.ticker.text)}</span>`).join('');
    $('#q').placeholder = t('search');
    $('#sBar').innerHTML = `<span>${t('suggestion')}</span><span>${t('products')}</span>`;
    $('#langMenu').innerHTML = Object.keys(I18N).map(l => `<li><button data-lang="${l}" class="${l === lang ? 'on' : ''}">${l.toUpperCase()}</button></li>`).join('');
    $('#cartX').textContent = t('close');
    $('#cartSubL').textContent = t('subtotal');
    $('#cartNote').textContent = t('shipnote');
    $('#checkout').textContent = t('checkout');
    renderCart();
  }
  function setHH() { document.documentElement.style.setProperty('--hh', hd.offsetHeight + 'px'); }

  nav.addEventListener('click', e => {
    const lab = e.target.closest('.nav__label');
    if (lab && matchMedia('(hover: none)').matches) {
      const it = lab.parentElement;
      if (!it.classList.contains('open')) {
        e.preventDefault();
        $$('.nav__item.open', nav).forEach(x => x.classList.remove('open'));
        it.classList.add('open');
        return;
      }
    }
    const a = e.target.closest('a');
    if (a) { const it = a.closest('.nav__item'); it.classList.remove('open'); if (matchMedia('(hover: hover)').matches) it.classList.add('hold'); }
  });
  nav.addEventListener('mouseout', e => {
    const it = e.target.closest('.nav__item');
    if (it && !it.contains(e.relatedTarget)) it.classList.remove('hold');
  });

  /* ------------------------------- cart ------------------------------ */
  let cart = ls.get('20s-cart', []).filter(l => byId(l.id));
  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const cartSub = () => cart.reduce((n, l) => n + byId(l.id).price * l.qty, 0);
  function renderCart() {
    const n = cartCount();
    $('#btnCart').textContent = `${t('cart')} (${n})`;
    $('#cartTitle').textContent = `${t('cart')} (${n})`;
    $('#cartLines').innerHTML = cart.length ? cart.map(l => {
      const p = byId(l.id);
      return `<li class="cl"><div>${visual(p)}</div><div class="cl__info"><b>${esc(pName(p))}</b><span>${l.size ? esc(l.size) : esc(isMag(p) ? p.year : p.sub || '')}</span>
        <div class="qty"><button data-q="-1" data-k="${esc(l.key)}" aria-label="-">−</button><span>${l.qty}</span><button data-q="1" data-k="${esc(l.key)}" aria-label="+">+</button></div></div>
        <div class="cl__r"><span>${money(p.price * l.qty)}</span><button data-rm="${esc(l.key)}" aria-label="Remove">×</button></div></li>`;
    }).join('') : `<li class="empty">${t('empty')}</li>`;
    $('#cartSub').textContent = money(cartSub());
    $('#checkout').disabled = !cart.length;
  }
  function saveCart() { ls.set('20s-cart', cart); renderCart(); }
  function addToCart(id, size, btn) {
    const p = byId(id); if (!p) return;
    if (p.sizes && !size) { toast(t('chooseSize')); return; }
    const key = id + (size ? ':' + size : '');
    const l = cart.find(x => x.key === key);
    if (l) l.qty++; else cart.push({ key, id, size: size || null, qty: 1 });
    saveCart();
    const cb = $('#btnCart'); cb.classList.add('flash'); setTimeout(() => cb.classList.remove('flash'), 900);
    if (btn) { const o = btn.textContent; btn.textContent = t('added') + ' ✓'; setTimeout(() => { btn.textContent = o; }, 1200); }
  }
  function openCart() { $('#cart').classList.add('open'); $('#scrim').classList.add('on'); document.body.classList.add('lock'); }
  function closeCart() { $('#cart').classList.remove('open'); $('#scrim').classList.remove('on'); if (!$('#search').classList.contains('open')) document.body.classList.remove('lock'); }
  function checkout() {
    if (!cart.length) return;
    if (S.config.checkoutUrl) { location.href = S.config.checkoutUrl; return; }
    const lines = cart.map(l => { const p = byId(l.id); return `${l.qty} × ${pFull(p)}${l.size ? ' (' + l.size + ')' : ''} — ${money(p.price * l.qty)}`; }).join('\n');
    const body = `Hello,\n\nI would like to order:\n\n${lines}\n\nSubtotal: ${money(cartSub())}\n\nName:\nShipping address:\n`;
    location.href = `mailto:${S.config.email}?subject=${encodeURIComponent('Order — 20 Seconds')}&body=${encodeURIComponent(body)}`;
  }
  let toastT;
  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 1800); }

  /* ------------------------------ search ----------------------------- */
  const hay = p => [pFull(p), p.title, p.name, p.type, p.year, p.lead, ...(p.featuring || []).flat()].filter(Boolean).join(' ').toLowerCase();
  function doSearch(q) {
    q = q.trim().toLowerCase();
    const prods = S.products.filter(p => !q || hay(p).includes(q));
    let sugs;
    if (!q) sugs = S.searchSuggestions.map(s => ({ label: s, fill: true }));
    else {
      sugs = [
        ...S.events.filter(e => [e.title, e.city, e.cityLabel, ...(e.tags || [])].join(' ').toLowerCase().includes(q)).map(e => ({ label: e.title, href: '#/event/' + e.id })),
        ...S.episodes.filter(e => e.title.toLowerCase().includes(q)).map(e => ({ label: e.title, href: '#/sounds/podcast' })),
        ...NAV.flatMap(n => n.items.map(k => ({ label: `${t(n.key)} / ${subLabel(n, k)}`, href: subHref(n, k), k: k + ' ' + n.key + ' ' + subLabel(n, k) + ' ' + t(n.key) })))
          .filter(x => x.k.toLowerCase().includes(q))
      ];
    }
    $('#sug').innerHTML = sugs.length ? sugs.slice(0, 20).map(s => s.href ? `<li><a href="${s.href}">${esc(s.label)}</a></li>` : `<li><a href="#" data-fill="${esc(s.label)}">${esc(s.label)}</a></li>`).join('') : `<li class="muted">${t('noresults')}</li>`;
    $('#res').innerHTML = prods.length ? prods.map(p => `<a class="sr" href="#/product/${p.id}"><b>${esc(pFull(p))}</b>${visual(p)}</a>`).join('') : `<p class="muted" style="font-size:20px">${t('noresults')}</p>`;
  }
  function openSearch() { const s = $('#search'); s.classList.add('open'); document.body.classList.add('lock'); $('#q').value = ''; doSearch(''); setTimeout(() => $('#q').focus(), 20); }
  function closeSearch() { $('#search').classList.remove('open'); if (!$('#cart').classList.contains('open')) document.body.classList.remove('lock'); }
  $('#q').addEventListener('input', e => doSearch(e.target.value));
  $('#search').addEventListener('click', e => {
    const f = e.target.closest('[data-fill]');
    if (f) { e.preventDefault(); $('#q').value = f.dataset.fill; doSearch(f.dataset.fill); $('#q').focus(); return; }
    if (e.target.closest('a[href^="#/"]')) closeSearch();
  });

  /* ------------------------------ player ----------------------------- */
  const TRACKS = {};
  (S.tracks || []).forEach(x => { TRACKS[x.id] = x; });
  S.episodes.forEach(e => { TRACKS[e.id] = { id: e.id, lines: ['RADIO', `EP. ${e.n}`], date: e.date, src: e.src, seed: e.n * 31 }; });
  S.playlists.forEach((p, i) => { TRACKS[p.id] = { id: p.id, lines: ['PLAYLIST', p.short || p.title], date: p.date, src: p.src, seed: 500 + i * 17 }; });

  let Player = null;
  Player = (() => {
    const DUR = 20, el = $('#player');
    let track = TRACKS[(S.tracks && S.tracks[0] && S.tracks[0].id) || Object.keys(TRACKS)[0]];
    let ctx = null, master = null, nodes = [], playing = false, startAt = 0, offset = 0, audio = null, raf = 0;

    function plan(seed) {
      const r = A.rng(seed || 1);
      const base = [43.65, 49, 55, 61.74, 65.41][(r() * 5) | 0];
      const blips = []; let tt = 0.6 + r();
      while (tt < DUR - 0.8) { blips.push({ t: tt, f: base * [4, 6, 8, 9, 12, 16][(r() * 6) | 0], d: 0.3 + r() * 1.6, g: 0.04 + r() * 0.07 }); tt += 0.35 + r() * 2.2; }
      return { base, blips, lfo: 0.05 + r() * 0.15 };
    }
    function startSynth(off) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume();
      const ev = plan(track.seed), now = ctx.currentTime + 0.05, rem = DUR - off;
      master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination);
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 5;
      const dg = ctx.createGain();
      dg.gain.setValueAtTime(0, now); dg.gain.linearRampToValueAtTime(0.16, now + Math.min(1.5, rem));
      dg.gain.setValueAtTime(0.16, now + Math.max(0, rem - 2)); dg.gain.linearRampToValueAtTime(0.0001, now + rem);
      lp.connect(dg); dg.connect(master);
      [1, 1.006, 1.5, 2.003].forEach((m, i) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = i % 2 ? 'sawtooth' : 'triangle'; o.frequency.value = ev.base * m; g.gain.value = i === 3 ? 0.12 : 0.32;
        o.connect(g); g.connect(lp); o.start(now); o.stop(now + rem + 0.1); nodes.push(o);
      });
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = ev.lfo; lg.gain.value = 450; lfo.connect(lg); lg.connect(lp.frequency);
      lfo.start(now); lfo.stop(now + rem + 0.1); nodes.push(lfo);
      ev.blips.filter(b => b.t >= off).forEach(b => {
        const o = ctx.createOscillator(), g = ctx.createGain(), st = now + (b.t - off);
        o.type = 'sine'; o.frequency.value = b.f;
        g.gain.setValueAtTime(0, st); g.gain.linearRampToValueAtTime(b.g, st + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, st + b.d);
        o.connect(g); g.connect(master); o.start(st); o.stop(st + b.d + 0.05); nodes.push(o);
      });
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const ns = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), ng = ctx.createGain();
      ns.buffer = buf; ns.loop = true; bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.8; ng.gain.value = 0.025;
      ns.connect(bp); bp.connect(ng); ng.connect(master); ns.start(now); ns.stop(now + rem); nodes.push(ns);
      startAt = now - off;
    }
    function stopSynth() {
      nodes.forEach(n => { try { n.stop(); } catch (e) { /* ignore */ } });
      nodes = [];
      if (master) { try { master.disconnect(); } catch (e) { /* ignore */ } master = null; }
    }
    function pos() {
      if (track.src && audio) return audio.duration ? audio.currentTime / audio.duration : 0;
      if (playing && ctx) return Math.min(1, (ctx.currentTime - startAt) / DUR);
      return offset / DUR;
    }
    function tick() {
      $('#plFill').style.width = (pos() * 100).toFixed(2) + '%';
      if (playing && !track.src && pos() >= 1) { stopSynth(); playing = false; offset = 0; ui(); }
      if (playing) raf = requestAnimationFrame(tick);
    }
    function ui() {
      el.classList.toggle('playing', playing);
      $('#plBtn').setAttribute('aria-label', playing ? 'Pause' : 'Play');
      $('#plFill').style.width = (pos() * 100).toFixed(2) + '%';
      syncPlaying();
    }
    function render() {
      $('#plTitle').innerHTML = track.lines.map((l, i) => i === 0 ? jl(l) : `<span>${esc(l)}</span>`).join('');
      $('#plDate').textContent = track.date || '';
    }
    function play() {
      if (track.src) {
        if (!audio) { audio = new Audio(); audio.addEventListener('ended', () => { playing = false; ui(); }); }
        if (audio.dataset.id !== track.id) { audio.src = track.src; audio.dataset.id = track.id; }
        audio.play().catch(() => { playing = false; ui(); });
      } else startSynth(offset);
      playing = true; ui(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    }
    function pause() {
      if (track.src && audio) audio.pause();
      else if (ctx) { offset = Math.min(DUR, Math.max(0, ctx.currentTime - startAt)); stopSynth(); }
      playing = false; ui();
    }
    function seek(fr) {
      fr = Math.min(0.999, Math.max(0, fr));
      if (track.src && audio) { if (audio.duration) audio.currentTime = fr * audio.duration; }
      else { offset = fr * DUR; if (playing) { stopSynth(); startSynth(offset); } }
      ui();
    }
    function load(id) {
      if (!TRACKS[id]) return;
      if (playing) pause();
      track = TRACKS[id]; offset = 0;
      if (audio) { audio.pause(); audio.dataset.id = ''; }
      render(); ui();
    }
    function toggle(id) {
      if (id && id !== track.id) { load(id); play(); return; }
      playing ? pause() : play();
    }
    $('#plBtn').addEventListener('click', () => toggle());
    const bar = $('#plBar');
    bar.addEventListener('click', e => { const r = bar.getBoundingClientRect(); seek((e.clientX - r.left) / r.width); });
    bar.addEventListener('keydown', e => { if (e.key === 'ArrowRight') seek(pos() + 0.05); if (e.key === 'ArrowLeft') seek(pos() - 0.05); });
    render(); ui();
    return { toggle, get id() { return track.id; }, get playing() { return playing; } };
  })();
  function syncPlaying() {
    if (!Player) return;
    $$('[data-play]').forEach(x => {
      const on = Player.playing && x.dataset.play === Player.id;
      (x.closest('.pl') || x).classList.toggle('is-playing', on);
    });
  }

  /* ----------------------------- global UI --------------------------- */
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); const pdp = add.closest('.pdp'); addToCart(add.dataset.add, pdp && pdp.dataset.size, add); return; }
    const pl = e.target.closest('[data-play]');
    if (pl) { e.preventDefault(); Player.toggle(pl.dataset.play); return; }
    const q = e.target.closest('[data-q]');
    if (q) { const l = cart.find(x => x.key === q.dataset.k); if (l) { l.qty += +q.dataset.q; if (l.qty < 1) cart = cart.filter(x => x !== l); saveCart(); } return; }
    const rm = e.target.closest('[data-rm]');
    if (rm) { cart = cart.filter(x => x.key !== rm.dataset.rm); saveCart(); return; }
    const lb = e.target.closest('[data-lang]');
    if (lb) { lang = lb.dataset.lang; ls.set('20s-lang', lang); $('.lang').classList.remove('open'); renderChrome(); router(); return; }
    if (!e.target.closest('.lang')) $('.lang').classList.remove('open');
    if (!e.target.closest('.nav')) $$('.nav__item.open', nav).forEach(x => x.classList.remove('open'));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSearch(); closeCart(); $('.lang').classList.remove('open'); }
    if (e.key === 'Enter' && e.target.matches('[data-play]')) Player.toggle(e.target.dataset.play);
    if (e.key === '/' && !e.target.matches('input,textarea')) { e.preventDefault(); openSearch(); }
  });
  document.addEventListener('submit', e => {
    if (!e.target.matches('[data-nl]')) return;
    e.preventDefault();
    const em = e.target.querySelector('input').value;
    location.href = `mailto:${S.config.email}?subject=${encodeURIComponent('Newsletter')}&body=${encodeURIComponent('Please subscribe ' + em + ' to the 20 Seconds newsletter.')}`;
  });
  $('#btnSearch').addEventListener('click', openSearch);
  $('#searchX').addEventListener('click', closeSearch);
  $('#btnLang').addEventListener('click', () => $('.lang').classList.toggle('open'));
  $('#btnCart').addEventListener('click', openCart);
  $('#cartX').addEventListener('click', closeCart);
  $('#scrim').addEventListener('click', closeCart);
  $('#checkout').addEventListener('click', checkout);
  $('#cartLines').addEventListener('click', e => { if (e.target.closest('a')) closeCart(); });

  /* ------------------------------- boot ------------------------------ */
  document.documentElement.style.setProperty('--grain', `url(${A.grain()})`);
  renderChrome();
  setHH();
  window.addEventListener('resize', setHH);
  if (document.fonts) document.fonts.ready.then(setHH);
  window.addEventListener('hashchange', router);
  router();
})();
