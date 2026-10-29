/* 20 SECONDS — review layer
   C = comment mode: hover highlights an element, click selects it and attaches a note.
   With SITE.config.comments.repo set, notes are stored as GitHub Issues of that
   (public) repo and read back through the GitHub API; otherwise they stay in this browser. */
(function () {
  'use strict';
  const S = window.SITE;
  const REPO = ((S.config && S.config.comments && S.config.comments.repo) || '').trim();
  const GH = !!REPO;
  const KEY = '20s-comments', PKEY = '20s-comments-pending', NKEY = '20s-comment-name', VKEY = '20s-comments-show';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } }
  };
  const mk = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const route = () => location.hash.replace(/^#/, '') || '/';
  const fmt = iso => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const docW = () => document.documentElement.clientWidth;

  let remote = [];
  let local = ls.get(KEY, []);
  let pending = ls.get(PKEY, []).filter(c => Date.now() - new Date(c.date) < 864e5);
  let active = false, showPins = ls.get(VKEY, true), showResolved = false, openId = null, hoverId = null, draft = null, status = '';

  /* ------------------------------- UI shell ------------------------------ */
  const layer = mk('div', 'cm-ui cm-layer');
  const fixedLayer = mk('div', 'cm-ui cm-layer cm-layer--fixed');
  const hoverBox = mk('div', 'cm-ui cm-hoverbox');
  const bar = mk('div', 'cm-ui cm-bar', 'Modalità commento · passa sopra un elemento e cliccalo · Esc per uscire');
  const chip = mk('div', 'cm-ui cm-chip');
  const panel = mk('aside', 'cm-ui cm-panel');
  document.body.append(layer, fixedLayer, hoverBox, bar, chip, panel);

  const all = () => {
    const base = GH ? remote : local;
    const ids = new Set(base.map(c => c.id));
    return [...base, ...pending.filter(p => !ids.has(p.id))].sort((a, b) => new Date(a.date) - new Date(b.date));
  };
  const visible = () => all().filter(c => showResolved || !c.resolved);

  /* --------------------------- element helpers --------------------------- */
  function pathOf(el) {
    const parts = [];
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.id) { parts.unshift('#' + CSS.escape(el.id)); break; }
      let i = 1, s = el;
      while ((s = s.previousElementSibling)) if (s.tagName === el.tagName) i++;
      parts.unshift(el.tagName.toLowerCase() + ':nth-of-type(' + i + ')');
      el = el.parentElement;
    }
    return parts.join('>');
  }
  const elOf = c => { try { return c.path ? document.querySelector(c.path) : null; } catch (e) { return null; } };
  const isFixed = el => !!el.closest('#hd, #player');
  // what the reviewer clicked on, in plain words
  function describe(el) {
    const tag = el.tagName.toLowerCase(), cls = String(el.className && el.className.baseVal != null ? el.className.baseVal : el.className);
    const bg = getComputedStyle(el).backgroundImage;
    let kind = 'elemento';
    if (/cover/.test(cls)) kind = 'copertina';
    else if (tag === 'img' || tag === 'video' || tag === 'svg' || (bg && bg !== 'none' && !el.textContent.trim())) kind = tag === 'video' ? 'video' : 'immagine';
    else if (/^h[1-6]$/.test(tag) || /title|lines|ptitle/.test(cls)) kind = 'titolo';
    else if (tag === 'button' || /btn/.test(cls)) kind = 'pulsante';
    else if (tag === 'a') kind = 'link';
    else if (tag === 'p' || tag === 'span' || tag === 'small' || tag === 'b' || tag === 'li') kind = 'testo';
    else if (tag === 'nav' || /nav/.test(cls)) kind = 'navigazione';
    else if (tag === 'header' || /^hd/.test(cls)) kind = 'header';
    else if (/ticker/.test(cls)) kind = 'ticker';
    else if (/player/.test(cls)) kind = 'player';
    else if (tag === 'section' || tag === 'aside' || tag === 'main' || tag === 'footer') kind = 'sezione';
    else if (el.children.length > 1) kind = 'blocco';
    const txt = (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
    return { kind, txt: txt.length > 38 ? txt.slice(0, 38) + '…' : txt };
  }
  const label = d => d ? d.kind + (d.txt ? ` · “${d.txt}”` : '') : '';
  function rectOf(c) {
    const el = elOf(c);
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width || r.height) return c.fixed ? { x: r.left, y: r.top, w: r.width, h: r.height } : { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
    }
    return null;
  }
  // pin sits on the top-left corner of the element (fallback: stored page position)
  function posOf(c) {
    const r = rectOf(c);
    if (r) return { x: r.x, y: r.y, rect: r };
    return { x: (c.px || 0.5) * docW(), y: c.py || 200, rect: null };
  }

  /* ------------------------------- render -------------------------------- */
  function cardHTML(c, n) {
    const who = esc(c.author || 'anonimo');
    const st = c.pending ? 'in attesa su GitHub' : c.resolved ? 'risolto' : '';
    const acts = [];
    if (c.url) acts.push(`<a href="${esc(c.url)}" target="_blank" rel="noopener">Rispondi su GitHub${c.replies ? ` (${c.replies})` : ''}</a>`);
    if (!GH && !c.pending) acts.push(`<button data-cm-res="${c.id}">${c.resolved ? 'Riapri' : 'Risolvi'}</button><button data-cm-del="${c.id}">Elimina</button>`);
    if (c.pending) acts.push(`<button data-cm-del="${c.id}">Rimuovi</button>`);
    return `<div class="cm-card__meta"><span>#${n} · ${who}</span><span>${esc(fmt(c.date))}${st ? ' · ' + st : ''}</span></div>
      <p>${esc(c.text)}</p>${acts.length ? `<div class="cm-card__acts">${acts.join('')}</div>` : ''}`;
  }
  function place(node, p, fixed) {
    const w = fixed ? innerWidth : docW();
    node.style.top = (p.y + 6) + 'px';
    node.style.left = (p.x + 310 > w ? Math.max(8, w - 312) : Math.max(8, p.x)) + 'px';
  }
  function boxEl(r, cls) {
    const b = mk('div', 'cm-box ' + cls);
    b.style.left = r.x + 'px'; b.style.top = r.y + 'px'; b.style.width = r.w + 'px'; b.style.height = r.h + 'px';
    return b;
  }
  function render() {
    layer.innerHTML = ''; fixedLayer.innerHTML = '';
    const here = visible().filter(c => c.route === route());
    if (showPins) here.forEach((c, i) => {
      const p = posOf(c), L = c.fixed ? fixedLayer : layer, on = openId === c.id || hoverId === c.id;
      if (p.rect) L.append(boxEl(p.rect, (on ? 'is-on' : '') + (c.resolved ? ' is-res' : '')));
      const pin = mk('button', 'cm-pin' + (c.resolved ? ' is-res' : '') + (c.pending ? ' is-pend' : '') + (on ? ' is-open' : ''), String(i + 1));
      pin.dataset.cmPin = c.id; pin.title = c.text;
      pin.style.left = p.x + 'px'; pin.style.top = p.y + 'px';
      L.append(pin);
      if (openId === c.id) { const card = mk('div', 'cm-card', cardHTML(c, i + 1)); place(card, p, c.fixed); L.append(card); }
    });
    placeForm();
    renderChip();
    if (panel.classList.contains('open')) renderPanel();
  }

  /* --------------------------------- form -------------------------------- */
  let formEl = null, draftBox = null, draftPin = null;
  function openForm() {
    closeForm(true);
    draftBox = mk('div', 'cm-ui cm-box is-draft');
    draftPin = mk('span', 'cm-ui cm-pin is-draft', '+');
    formEl = mk('form', 'cm-ui cm-card cm-form', `
      <div class="cm-card__meta"><span>Nuovo commento</span><span>${esc(draft.route)}</span></div>
      <div class="cm-sel"><button type="button" data-cm-up title="Seleziona il contenitore">↑ più grande</button><button type="button" data-cm-down title="Torna all'elemento più piccolo" hidden>↓ più piccolo</button></div>
      <textarea required placeholder="Scrivi qui il tuo commento…"></textarea>
      <input placeholder="Il tuo nome" value="${esc(ls.get(NKEY, ''))}" ${GH ? 'hidden' : ''}>
      <div class="cm-card__acts"><button type="button" data-cm-cancel>Annulla</button><button class="cm-btn">${GH ? 'Continua su GitHub →' : 'Salva'}</button></div>
      ${GH ? '<small>Si apre GitHub con il commento già pronto: premi “Submit new issue”.</small>' : ''}`);
    document.body.append(draftBox, draftPin, formEl);
    placeForm();
    setTimeout(() => formEl && formEl.querySelector('textarea').focus({ preventScroll: true }), 0);
  }
  function closeForm(keepDraft) {
    [formEl, draftBox, draftPin].forEach(n => n && n.remove());
    formEl = draftBox = draftPin = null; if (!keepDraft) draft = null;
  }
  function placeForm() {
    if (!formEl || !draft) return;
    const p = posOf(draft), pos = draft.fixed ? 'fixed' : 'absolute';
    [draftBox, draftPin, formEl].forEach(n => { n.style.position = pos; });
    if (p.rect) { Object.assign(draftBox.style, { display: 'block', left: p.rect.x + 'px', top: p.rect.y + 'px', width: p.rect.w + 'px', height: p.rect.h + 'px' }); }
    else draftBox.style.display = 'none';
    draftPin.style.left = p.x + 'px'; draftPin.style.top = p.y + 'px';
    const r = p.rect;
    // the form goes under the element when there is room, otherwise next to its top
    const below = r && r.h < 260 ? { x: r.x, y: r.y + r.h } : p;
    place(formEl, below, draft.fixed);
    formEl.querySelector('[data-cm-down]').hidden = !(draft.stack && draft.stack.length);
    const el = elOf(draft);
    formEl.querySelector('[data-cm-up]').hidden = !(el && el.parentElement && el.parentElement !== document.body && el.parentElement !== document.documentElement);
  }
  function setDraftEl(el) {
    const fixed = isFixed(el);
    Object.assign(draft, { path: pathOf(el), what: describe(el), fixed, rx: 0, ry: 0 });
    const r = el.getBoundingClientRect();
    draft.px = (r.left + scrollX) / docW(); draft.py = r.top + (fixed ? 0 : scrollY);
  }

  /* ------------------------------ chip/panel ----------------------------- */
  function renderChip() {
    const open = all().filter(c => !c.resolved), here = open.filter(c => c.route === route()).length;
    chip.innerHTML = `<button data-cm-panel title="Elenco commenti"><i></i>${open.length}${here ? ` · ${here} qui` : ''}</button>` +
      `<button class="cm-add" data-cm-toggle title="Scorciatoia: C">${active ? 'Annulla <kbd>Esc</kbd>' : 'Commenta <kbd>C</kbd>'}</button>`;
  }
  function renderPanel() {
    const groups = {};
    visible().forEach(c => { (groups[c.route] = groups[c.route] || []).push(c); });
    const list = Object.keys(groups).map(r => `<h5>${esc(r)}</h5>` + groups[r].map((c, i) => `
      <button class="cm-item ${c.resolved ? 'is-res' : ''}" data-cm-go="${c.id}">
        <span class="cm-pin cm-pin--static ${c.resolved ? 'is-res' : ''} ${c.pending ? 'is-pend' : ''}">${i + 1}</span>
        <span><b>${esc(c.author || 'anonimo')}</b> <small>${esc(fmt(c.date))}</small><br>${esc(c.text.length > 140 ? c.text.slice(0, 140) + '…' : c.text)}</span>
      </button>`).join('')).join('') || '<p class="cm-empty">Ancora nessun commento. Premi C, passa sopra un elemento e cliccalo.</p>';
    panel.innerHTML = `
      <div class="cm-panel__hd"><span>Commenti di revisione</span><button data-cm-panel aria-label="Chiudi">×</button></div>
      <div class="cm-panel__opts">
        <label><input type="checkbox" data-cm-opt="pins" ${showPins ? 'checked' : ''}> mostra commenti sulla pagina</label>
        <label><input type="checkbox" data-cm-opt="res" ${showResolved ? 'checked' : ''}> mostra risolti</label>
        ${GH ? '<button data-cm-refresh>aggiorna</button>' : ''}
      </div>
      <div class="cm-panel__list">${list}</div>
      <div class="cm-panel__ft">${GH
        ? `Salvati come Issues su <a href="https://github.com/${esc(REPO)}/issues" target="_blank" rel="noopener">${esc(REPO)}</a>. Chiudi una issue per segnarla risolta.${status ? '<br>' + esc(status) : ''}`
        : 'Modalità locale: i commenti restano solo in questo browser. Imposta <code>config.comments.repo</code> in data.js per condividerli via GitHub.'}</div>`;
  }

  /* ------------------------------- GitHub -------------------------------- */
  function parseIssue(i) {
    const body = i.body || '';
    const m = body.match(/<!--\s*20s-comment:(\{[\s\S]*?\})\s*-->/);
    if (!m || i.pull_request) return null;
    let meta; try { meta = JSON.parse(m[1]); } catch (e) { return null; }
    return { ...meta, text: body.split(/\r?\n-{3,}\r?\n/)[0].trim(), author: i.user && i.user.login, date: i.created_at, resolved: i.state === 'closed', url: i.html_url, replies: i.comments };
  }
  let lastFetch = 0;
  async function fetchRemote(force) {
    if (!GH || (!force && Date.now() - lastFetch < 30000)) return;
    lastFetch = Date.now();
    try {
      let page = 1, out = [];
      while (page < 6) {
        const res = await fetch(`https://api.github.com/repos/${REPO}/issues?state=all&per_page=100&page=${page}`, { headers: { Accept: 'application/vnd.github+json' } });
        if (!res.ok) throw new Error(res.status === 403 ? 'limite API GitHub raggiunto, riprova tra poco' : 'repo non trovato o privato (' + res.status + ')');
        const data = await res.json();
        out = out.concat(data.map(parseIssue).filter(Boolean));
        if (data.length < 100) break;
        page++;
      }
      remote = out; status = '';
      const ids = new Set(remote.map(c => c.id));
      pending = pending.filter(p => !ids.has(p.id)); ls.set(PKEY, pending);
    } catch (e) { status = 'Impossibile leggere i commenti: ' + e.message; }
    render();
  }
  function sendToGitHub(c) {
    const meta = { id: c.id, route: c.route, path: c.path, what: c.what, rx: 0, ry: 0, px: +c.px.toFixed(4), py: Math.round(c.py), fixed: c.fixed, vw: c.vw };
    const title = `[commento] ${c.route} — ${c.text.replace(/\s+/g, ' ').slice(0, 60)}`;
    const body = `${c.text}\n\n---\nSu: ${label(c.what)}\nPagina: ${location.origin}${location.pathname}#${c.route}\n<!-- 20s-comment:${JSON.stringify(meta).replace(/--/g, '- -')} -->`;
    window.open(`https://github.com/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`, '_blank', 'noopener');
  }

  /* -------------------------------- events ------------------------------- */
  const isUI = el => !!(el && el.closest && el.closest('.cm-ui'));
  let hoverEl = null;
  function setActive(on) {
    active = on; document.body.classList.toggle('cm-mode', on);
    if (!on) { hoverEl = null; hoverBox.style.display = 'none'; }
    renderChip();
  }
  function showHover(el) {
    hoverEl = el;
    const r = el.getBoundingClientRect();
    Object.assign(hoverBox.style, { display: 'block', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  }
  document.addEventListener('mousemove', e => {
    if (!active) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el || isUI(el) || el === document.documentElement || el === document.body) { hoverBox.style.display = 'none'; hoverEl = null; return; }
    if (el !== hoverEl) showHover(el);
  });
  window.addEventListener('scroll', () => { if (active && hoverEl) showHover(hoverEl); }, { passive: true });

  document.addEventListener('keydown', e => {
    const typing = e.target.matches && e.target.matches('input,textarea,select,[contenteditable]');
    if (e.key === 'Escape') {
      if (draft) { closeForm(); render(); }
      else if (active) setActive(false);
      else if (openId) { openId = null; render(); }
      return;
    }
    if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'c' || e.key === 'C') { e.preventDefault(); setActive(!active); }
  });
  // capture phase: in comment mode a click selects the element instead of following links
  document.addEventListener('click', e => {
    if (!active || isUI(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    const el = hoverEl || e.target;
    draft = { id: uid(), route: route(), vw: innerWidth, stack: [], text: '' };
    setDraftEl(el);
    openId = null; setActive(false); openForm(); render();
  }, true);

  document.addEventListener('submit', e => {
    if (!e.target.matches('.cm-form')) return;
    e.preventDefault();
    const text = e.target.querySelector('textarea').value.trim(); if (!text) return;
    const name = e.target.querySelector('input').value.trim(); if (name) ls.set(NKEY, name);
    const c = { ...draft, text, author: GH ? 'tu' : (name || 'anonimo'), date: new Date().toISOString(), resolved: false };
    delete c.stack;
    if (GH) { c.pending = true; pending.push(c); ls.set(PKEY, pending); sendToGitHub(c); }
    else { local.push(c); ls.set(KEY, local); }
    closeForm(); openId = c.id; render();
  }, true);

  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-cm-cancel]')) { closeForm(); render(); return; }
    if (t.closest('[data-cm-up]') && draft) {
      const el = elOf(draft);
      if (el && el.parentElement && el.parentElement !== document.body) {
        const r0 = el.getBoundingClientRect(), same = q => { const r = q.getBoundingClientRect(); return Math.abs(r.width - r0.width) < 4 && Math.abs(r.height - r0.height) < 4; };
        let up = el.parentElement;
        while (same(up) && up.parentElement && up.parentElement !== document.body) up = up.parentElement;
        draft.stack.push(draft.path); setDraftEl(up); placeForm();
      }
      return;
    }
    if (t.closest('[data-cm-down]') && draft && draft.stack.length) {
      const prev = draft.stack.pop(); const el = document.querySelector(prev);
      if (el) { setDraftEl(el); placeForm(); }
      return;
    }
    const pin = t.closest('[data-cm-pin]');
    if (pin) { openId = openId === pin.dataset.cmPin ? null : pin.dataset.cmPin; render(); return; }
    if (t.closest('[data-cm-toggle]')) { closeForm(); setActive(!active); render(); return; }
    if (t.closest('[data-cm-panel]')) { panel.classList.toggle('open'); if (panel.classList.contains('open')) { fetchRemote(); renderPanel(); } return; }
    if (t.closest('[data-cm-refresh]')) { fetchRemote(true); return; }
    const res = t.closest('[data-cm-res]');
    if (res) { const c = local.find(x => x.id === res.dataset.cmRes); if (c) { c.resolved = !c.resolved; ls.set(KEY, local); render(); } return; }
    const del = t.closest('[data-cm-del]');
    if (del) {
      const id = del.dataset.cmDel;
      local = local.filter(x => x.id !== id); pending = pending.filter(x => x.id !== id);
      ls.set(KEY, local); ls.set(PKEY, pending); openId = null; render(); return;
    }
    const go = t.closest('[data-cm-go]');
    if (go) {
      const c = all().find(x => x.id === go.dataset.cmGo); if (!c) return;
      openId = c.id;
      if (window.innerWidth < 900) panel.classList.remove('open');
      const jump = () => { render(); const p = posOf(c); if (!c.fixed) window.scrollTo({ top: Math.max(0, p.y - innerHeight / 3), behavior: 'smooth' }); };
      if (route() !== c.route) { location.hash = '#' + c.route; setTimeout(jump, 400); } else jump();
      return;
    }
    if (openId && !isUI(t)) { openId = null; render(); }
  });
  // hovering a pin or a list item outlines its element
  document.addEventListener('mouseover', e => {
    const p = e.target.closest && e.target.closest('[data-cm-pin],[data-cm-go]');
    const id = p ? (p.dataset.cmPin || p.dataset.cmGo) : null;
    if (id !== hoverId) { hoverId = id; render(); }
  });
  panel.addEventListener('change', e => {
    const o = e.target.dataset.cmOpt;
    if (o === 'pins') { showPins = e.target.checked; ls.set(VKEY, showPins); }
    if (o === 'res') showResolved = e.target.checked;
    render();
  });

  // keep pins and boxes glued to the layout
  let raf = 0;
  const soon = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(render); };
  window.addEventListener('hashchange', () => { closeForm(); openId = null; setTimeout(render, 30); setTimeout(render, 700); });
  window.addEventListener('resize', soon);
  window.addEventListener('load', soon);
  window.addEventListener('focus', () => fetchRemote());
  if ('ResizeObserver' in window) new ResizeObserver(soon).observe(document.body);
  document.addEventListener('transitionend', e => { if (!isUI(e.target)) soon(); });

  render();
  fetchRemote(true);
})();
