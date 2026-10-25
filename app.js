/* PYQ Finder – UI, router and actions */
(function () {
  'use strict';
  const PF = window.PF, st = PF.st, esc = PF.esc, fmt = PF.fmtMin, SM = PF.SM;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- icons ---------- */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    bookmark: '<path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    chevR: '<polyline points="9 18 15 12 9 6"/>',
    chevL: '<polyline points="15 18 9 12 15 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    play: '<polygon points="5 3 19 12 5 21 5 3"/>',
  };
  const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;
  const col = (c) => `style="--c:${SM[c].c}"`;

  /* ---------- tiny utils ---------- */
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 1800); };
  const copyText = async (txt) => {
    try { await navigator.clipboard.writeText(txt); toast('Copied'); return; } catch (e) { /* fallback */ }
    const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copied'); } catch (e) { toast('Copy failed'); } ta.remove();
  };
  const debounce = (f, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const hl = (t, set) => {
    if (!set || !set.size) return esc(t);
    let out = '', last = 0, m; const re = /[A-Za-z0-9]+/g;
    while ((m = re.exec(t))) { if (set.has(PF.stem(PF.spell(m[0].toLowerCase())))) { out += esc(t.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>'; last = m.index + m[0].length; } }
    return out + esc(t.slice(last));
  };

  /* ---------- theme ---------- */
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  const applyTheme = () => {
    const t = st.settings.theme;
    const dark = t === 'dark' || (t === 'system' && mq && mq.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = $('meta[name=theme-color]'); if (m) m.content = dark ? '#0b1020' : '#4f46e5';
    document.documentElement.style.setProperty('--fs', { s: '15px', m: '16px', l: '18px' }[st.settings.size] || '16px');
  };
  if (mq && mq.addEventListener) mq.addEventListener('change', applyTheme);

  const GS = { Medicine: 'Med', Surgery: 'Surg', 'Obstetrics & Gynaecology': 'OBG', Paediatrics: 'Paeds', ENT: 'ENT', Ophthalmology: 'Eye', Pharmacology: 'Pharma' };
  const GROUPS_ALL = Object.keys(GS);
  /* ---------- components ---------- */
  const lecRow = (l, o = {}) => {
    const w = !!st.watched[l.id];
    return `<div class="lec ${w ? 'done' : ''}" data-go="#/lecture/${l.id}" ${col(l.s)}>
      <div class="num">${l.n}</div>
      <div class="mn"><h4>${hl(l.t, o.hl)}</h4>
        <p>${o.showSubj ? esc(SM[l.s].s) + ' · ' : ''}${esc(l.sec)} · ${fmt(l.m)}${o.via ? ' · <span class="via">via PYQs</span>' : ''}${st.starL[l.id] ? ' · ★' : ''}</p></div>
      <div class="sd"><span class="pq ${l.pq ? '' : 'z'}">${l.pq ? l.pq + ' PYQ' + (l.pq > 1 ? 's' : '') : 'No PYQ'}</span>
      <button class="chk ${w ? 'on' : ''}" data-act="watch" data-id="${l.id}" aria-label="Mark watched">${ic('check')}</button></div></div>`;
  };

  const qCard = (q, o = {}) => {
    const occ = [...q.occ].sort((a, b) => b.yn - a.yn || (a.p < b.p ? -1 : 1));
    const cur = o.lec ? q.L.find((x) => x.l.id === o.lec.id) : null;
    const lecs = q.L.length
      ? q.L.map((x) => {
        const l = x.l;
        return `<a class="lc ${cur && cur.l.id === l.id ? 'cur' : ''}" ${col(l.s)} href="#/lecture/${l.id}"><i class="dt"></i><span class="t">${esc(SM[l.s].s)} · L${l.n} · ${esc(l.t)}</span><span class="m">${st.watched[l.id] ? '✓ ' : ''}${fmt(l.m)}${x.rel ? ' · ≈' : ''}</span></a>`;
      }).join('')
      : `<div class="lc"><span class="t">No PrepLadder lecture covers this – use a textbook${q.u ? ' (' + esc(SM[q.u].n) + ' PYQ)' : ''}</span></div>`;
    const note = st.noteQ[q.k];
    return `<article class="q fade" data-qk="${q.k}" data-refs="${esc(q.occ.map((x) => x.p + '|' + x.ref).join(','))}">
      <div class="top"><span class="badge ${q.ty}">${q.ty === 'L' ? 'Essay' : 'Short note'}</span>
        ${q.n > 1 ? `<span class="badge a">asked ${q.n}×</span>` : ''}
        ${cur && cur.rel ? '<span class="badge rel" title="Nearest available lecture, not an exact topic">≈ related</span>' : ''}
        ${!q.L.length ? '<span class="badge un">No lecture</span>' : ''}<span class="sp"></span></div>
      <p class="tx">${hl(q.t, o.hl)}</p>
      <div class="occ">${occ.map((c) => `<a class="oc" href="#/paper/${c.p}?hl=${encodeURIComponent(c.ref)}"><b>${esc(c.y)}</b> ${GS[PF.paperById[c.p].g]} · ${c.p} · ${esc(c.ref)}</a>`).join('')}</div>
      <div class="lecs">${lecs}</div>
      ${note ? `<div class="note" data-note-q="${q.k}">${esc(note)}</div>` : ''}
      <div class="qa">
        <button class="qb ${st.starQ[q.k] ? 'on' : ''}" data-act="star-q" data-id="${q.k}">${ic('star', 'fill')}Save</button>
        <button class="qb ok ${st.doneQ[q.k] ? 'on' : ''}" data-act="done-q" data-id="${q.k}">${ic('check')}Revised</button>
        <button class="qb nt ${note ? 'on' : ''}" data-act="note-q" data-id="${q.k}">${ic('edit')}Note</button>
        <button class="qb" data-act="copy-q" data-id="${q.k}">${ic('copy')}</button></div>
    </article>`;
  };

  const paperRow = (p, o = {}) => {
    const first = [...p.subj][0];
    const c = first ? SM[first].c : '#4f46e5';
    return `<div class="paperrow" data-go="#/paper/${p.id}" style="--c:${c}">
      <div class="yr">${esc(p.y.length > 4 ? p.y.slice(0, 4) : p.y === 'Undated' ? 'n/a' : p.y)}<small>${esc(p.y.length > 4 && p.y !== 'Undated' ? p.y.slice(4) : p.id)}</small></div>
      <div style="flex:1;min-width:0"><h4>${hl(p.title, o.hl)}${p.note ? ' · ' + esc(p.note) : ''}</h4><p>${esc(p.g)} · ${p.id} · ${p.qs.length} questions${p.marks ? ' · ' + esc(p.marks) : ''}</p></div>
      ${ic('chevR')}</div>`;
  };

  const seg = (items, cur, act, extra = '') => `<div class="seg" ${extra}>${items.map(([v, label, n]) => `<button class="${String(cur) === String(v) ? 'on' : ''}" data-act="${act}" data-v="${v}">${label}${n !== undefined ? `<span class="n">${n}</span>` : ''}</button>`).join('')}</div>`;
  const tog = (on, act, label, v = '') => `<button class="tog ${on ? 'on' : ''}" data-act="${act}" data-v="${v}"><span class="sw"></span>${label}</button>`;

  /* ---------- header / tabs ---------- */
  const TABS = [['search', 'Search', '#/', 'search'], ['browse', 'Browse', '#/browse', 'layers'], ['papers', 'Papers', '#/papers', 'file'], ['study', 'Study', '#/study', 'target'], ['saved', 'Saved', '#/saved', 'bookmark']];
  const drawTabs = (cur) => { $('#tabs .tbar').innerHTML = TABS.map(([k, l, h, i]) => `<button class="${k === cur ? 'on' : ''}" data-go="${h}">${ic(i)}<span>${l}</span></button>`).join(''); };
  const setTop = (title, back) => {
    $('#top').innerHTML = back
      ? `<button class="iconbtn" data-act="back" aria-label="Back">${ic('chevL')}</button><div class="ttl">${esc(title)}</div><button class="iconbtn" data-act="open-settings" aria-label="Settings">${ic('gear')}</button>`
      : `<div class="logo">${ic('cap')}</div><div class="ttl">${esc(title)}</div><button class="iconbtn" data-act="open-settings" aria-label="Settings">${ic('gear')}</button>`;
  };

  /* ---------- sheet ---------- */
  const openSheet = (html) => { $('#sheet-root .sheet').innerHTML = '<div class="grab"></div>' + html; $('#sheet-root').classList.add('open'); };
  const closeSheet = () => { $('#sheet-root').classList.remove('open'); };
  $('#sheet-root .backdrop').addEventListener('click', () => { closeSheet(); if (closeSheet.cb) { const f = closeSheet.cb; closeSheet.cb = null; f(); } });

  /* ---------- state: search ---------- */
  const S = { q: '', tab: 'all', lim: { lec: 25, q: 20, p: 15 } };
  const filtersActive = () => PF.activeFilterCount(st.filters) > 0;

  /* ---------- HOME ---------- */
  const viewHome = (v) => {
    setTop('PYQ Finder'); drawTabs('search');
    const n = PF.activeFilterCount(st.filters);
    v.innerHTML = `<div class="searchwrap"><div class="search">${ic('search')}
      <input id="q" type="text" placeholder="Search topic, lecture, subject or PYQ…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="${esc(S.q)}">
      <button class="xbtn" id="qx" data-act="clear-q" style="${S.q ? '' : 'display:none'}" aria-label="Clear">${ic('x')}</button>
      <button class="fbtn" data-act="open-filters" aria-label="Filters">${ic('sliders')}<span class="dot" id="fdot" style="${n ? '' : 'display:none'}">${n}</span></button></div></div>
      <div id="hb"></div>`;
    const inp = $('#q');
    inp.addEventListener('input', debounce(() => { S.q = inp.value; S.tab = 'all'; S.lim = { lec: 25, q: 20, p: 15 }; $('#qx').style.display = S.q ? '' : 'none'; updateHome(); }, 130));
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { inp.blur(); pushRecent(S.q); } });
    updateHome();
  };
  const pushRecent = (q) => { q = q.trim(); if (q.length < 2) return; st.recentS = [q, ...st.recentS.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8); PF.save(); };

  const updateHome = () => {
    const hb = $('#hb'); if (!hb) return;
    const n = PF.activeFilterCount(st.filters); const fd = $('#fdot'); if (fd) { fd.textContent = n; fd.style.display = n ? '' : 'none'; }
    const q = S.q.trim();
    if (!q && !filtersActive()) { hb.innerHTML = dashHTML(); return; }
    const res = q ? PF.search(q, st.filters) : PF.browseAll(st.filters);
    if (q) clearTimeout(updateHome.t), updateHome.t = setTimeout(() => { if (S.q.trim() === q && res && (res.lec.length || res.q.length)) pushRecent(q); }, 1800);
    hb.innerHTML = resultsHTML(res, q);
  };

  const dashHTML = () => {
    const done = Object.keys(st.watched).filter((id) => PF.lecById[id]);
    const doneMin = done.reduce((a, id) => a + PF.lecById[id].m, 0);
    const pct = Math.round((doneMin / PF.totalMin) * 100);
    const recent = st.recent.map((id) => PF.lecById[id]).filter(Boolean);
    const top = [...PF.lecs].sort((a, b) => b.pq - a.pq || b.yield - a.yield).slice(0, 12);
    const rep = [...PF.qs].filter((q) => q.L.length).sort((a, b) => b.n - a.n || b.ymax - a.ymax).slice(0, 8);
    const ex = PF.examDays(); const rs = PF.revStats();
    return `<div class="hero homehero fade" style="display:flex;gap:1rem;align-items:center">
        <div style="flex:1;position:relative;z-index:1"><div class="k">Final MBBS · Part II</div><h1>Find PYQs & the lectures that cover them</h1>
        <p>${PF.qs.length.toLocaleString()} questions · ${PF.papers.length} papers · ${PF.lecs.length} lectures</p>${ex > 0 ? `<p style="font-weight:800;margin-top:.5rem">📅 ${ex} day${ex === 1 ? '' : 's'} to exam</p>` : ''}</div>
        <div class="ring" style="--p:${pct}"><b>${pct}%</b></div></div>
      <div class="chips" style="margin-top:.8rem">${PF.SUBJ.map((c) => `<button class="chip" ${col(c)} data-go="#/subject/${c}"><i class="d"></i>${esc(SM[c].s)}</button>`).join('')}</div>
      ${rs.due ? `<div class="card" style="margin-top:.8rem;display:flex;align-items:center;gap:.8rem" data-go="#/quiz?due=1"><div style="font-size:1.6rem">🔔</div><div style="flex:1"><b>${rs.due} PYQ${rs.due > 1 ? 's' : ''} due for revision</b><p class="sub">Spaced review keeps them in memory</p></div><span class="btn" style="padding:.5rem .9rem">Review</span></div>` : ''}
      ${st.pins.length ? `<h2 class="sec">${ic('bookmark')} Pinned topics</h2><div class="chips">${st.pins.map((r) => `<button class="chip" data-act="chip-search" data-v="${esc(r)}">${esc(r)}</button>`).join('')}</div>` : ''}
      ${st.recentS.length ? `<h2 class="sec">Recent searches</h2><div class="chips">${st.recentS.map((r) => `<button class="chip x" data-act="chip-search" data-v="${esc(r)}">${ic('clock', 'sm')}${esc(r)}</button>`).join('')}<button class="chip" data-act="clear-recent">Clear</button></div>` : `<h2 class="sec">Try searching</h2><div class="chips">${['cirrhosis', 'DKA', 'breast', 'fracture', 'hypertension', 'PPH', 'cataract', 'tubal patency', '2019'].map((r) => `<button class="chip x" data-act="chip-search" data-v="${r}">${esc(r)}</button>`).join('')}</div>`}
      ${recent.length ? `<h2 class="sec">Continue</h2><div class="hscroll">${recent.slice(0, 8).map(hcard).join('')}</div>` : ''}
      <h2 class="sec">${ic('flame')} High-yield lectures<span class="more" data-go="#/study">Plan →</span></h2>
      <div class="hscroll">${top.map(hcard).join('')}</div>
      <h2 class="sec">Most repeated PYQs</h2><div class="stack">${rep.map((q) => qCard(q)).join('')}</div>`;
  };
  const hcard = (l) => `<div class="hcard" ${col(l.s)} data-go="#/lecture/${l.id}"><span class="k">${esc(SM[l.s].s)} · L${l.n}</span><h4>${esc(l.t)}</h4><span class="sub">${fmt(l.m)} · <b>${l.pq}</b> PYQs</span>${st.watched[l.id] ? '<span class="via">✓ watched</span>' : ''}</div>`;

  const filterSummary = () => {
    const F = st.filters, bits = [];
    if (F.subj.length) bits.push(F.subj.map((c) => SM[c].s).join(', '));
    if (F.src) bits.push(GS[F.src] + ' papers');
    if (F.yFrom || F.yTo) bits.push((F.yFrom || '…') + '–' + (F.yTo || '…'));
    if (F.type) bits.push(F.type === 'L' ? 'Essay' : 'Short');
    if (F.minN > 1) bits.push(F.minN + '×+');
    if (F.hideRel) bits.push('exact only');
    if (F.status) bits.push(F.status);
    return bits;
  };

  const resultsHTML = (res, q) => {
    const bits = filterSummary();
    const c = { lec: res.lec.length, q: res.q.length, p: res.p.length };
    const hlset = res.hl;
    let h = '';
    if (bits.length) h += `<div class="chips"><button class="chip x" data-act="open-filters">${ic('sliders', 'sm')}${esc(bits.join(' · '))}</button><button class="chip" data-act="clear-filters">Clear ${ic('x', 'sm')}</button></div>`;
    if (q) { const pinned = st.pins.some((p) => p.toLowerCase() === q.toLowerCase()); h += `<div class="chips"><button class="chip ${pinned ? 'on' : ''}" data-act="pin-q" data-v="${esc(q)}">${ic('bookmark', 'sm')}${pinned ? 'Pinned to home' : 'Pin “' + esc(q.length > 24 ? q.slice(0, 24) + '…' : q) + '”'}</button></div>`; }
    if (q) {
      const base = PF.search(q, Object.assign({}, st.filters, { src: '' }));
      if (base) { const cnt = {}; base.q.forEach((r) => { new Set(r.o.occ.map((o) => PF.paperById[o.p].g)).forEach((g) => { cnt[g] = (cnt[g] || 0) + 1; }); });
        const gs = GROUPS_ALL.filter((g) => cnt[g]);
        if (gs.length > 1 || st.filters.src) h += `<div class="chips"><span class="sub" style="align-self:center;flex:none">Asked in:</span><button class="chip ${st.filters.src ? '' : 'on'}" data-act="f-src-q" data-v="">All</button>${gs.map((g) => `<button class="chip ${st.filters.src === g ? 'on' : ''}" data-act="f-src-q" data-v="${esc(g)}">${GS[g]} <span class="sub">${cnt[g]}</span></button>`).join('')}</div>`; }
    }
    if (res.subj.length) h += `<div class="chips">${res.subj.map((s) => `<button class="chip" ${col(s)} data-go="#/subject/${s}"><i class="d"></i>Open ${esc(SM[s].n)} →</button>`).join('')}</div>`;
    if (res.missing.length) h += `<p class="sub" style="margin:.2rem 0 .5rem">No match for “${esc(res.missing.join(' '))}” – showing the rest.</p>`;
    if (res.relaxed) h += `<div class="card" style="padding:.7rem .9rem;margin-bottom:.7rem;font-size:.85rem">No exact match for all words – showing <b>partial matches</b>.</div>`;
    h += seg([['all', 'All'], ['lec', 'Lectures', c.lec], ['q', 'PYQs', c.q], ['p', 'Papers', c.p]], S.tab, 'rtab');
    if (!c.lec && !c.q && !c.p) {
      return h + `<div class="empty"><div class="big">🔎</div><b>No results</b><p class="sub" style="margin-top:.3rem">Try fewer words or an abbreviation (DKA, PPH, MI…).${filtersActive() ? '<br>Active filters may be hiding results.' : ''}</p>${filtersActive() ? '<button class="btn ghost" style="margin-top:1rem" data-act="clear-filters">Clear filters</button>' : ''}</div>`;
    }
    const lecMin = res.lec.reduce((a, r) => a + r.o.m, 0);
    const lecList = (n) => res.lec.slice(0, n).map((r) => lecRow(r.o, { hl: hlset, via: r.via, showSubj: true })).join('');
    const withL = res.q.filter((r) => r.o.L.length), noL = res.q.filter((r) => !r.o.L.length);
    const qAll = [...withL, ...noL];
    const qList = (n) => qAll.slice(0, n).map((r, i) => (i === withL.length && noL.length && withL.length ? `<div class="card" style="padding:.7rem .9rem;background:var(--warn-soft)"><b style="font-size:.85rem">No PrepLadder lecture for the next ${noL.length} PYQ${noL.length > 1 ? 's' : ''}</b><p class="sub" style="font-size:.78rem">Asked in the papers but not covered by any lecture – use a textbook.</p></div>` : '') + qCard(r.o, { hl: hlset })).join('');
    const pList = (n) => res.p.slice(0, n).map((r) => paperRow(r.o, { hl: hlset })).join('');
    const more = (k, n, tot) => (tot > n ? `<button class="btn ghost more-btn" data-act="more" data-v="${k}">Show more (${tot - n} left)</button>` : '');
    if (S.tab === 'all') {
      if (c.lec) h += `<h2 class="sec">Lectures<span class="sub">${plural(c.lec, 'lecture')} · ${fmt(lecMin)}</span>${c.lec > 5 ? '<span class="more" data-act="rtab" data-v="lec">See all →</span>' : ''}</h2><div class="stack">${lecList(5)}</div>`;
      if (c.q) h += `<h2 class="sec">PYQs<span class="sub">${plural(c.q, 'question')}</span>${c.q > 8 ? '<span class="more" data-act="rtab" data-v="q">See all →</span>' : ''}</h2><div class="stack">${qList(8)}</div>`;
      if (c.p) h += `<h2 class="sec">Papers<span class="sub">${plural(c.p, 'paper')}</span>${c.p > 3 ? '<span class="more" data-act="rtab" data-v="p">See all →</span>' : ''}</h2><div class="stack">${pList(3)}</div>`;
    } else if (S.tab === 'lec') {
      h += `<p class="sub" style="margin:.8rem 0 .5rem">${plural(c.lec, 'lecture')} · ${fmt(lecMin)} total</p><div class="stack">${lecList(S.lim.lec)}</div>${more('lec', S.lim.lec, c.lec)}`;
    } else if (S.tab === 'q') {
      h += `<p class="sub" style="margin:.8rem 0 .5rem">${plural(c.q, 'question')}</p><div class="stack">${qList(S.lim.q)}</div>${more('q', S.lim.q, c.q)}`;
    } else {
      h += `<div class="stack" style="margin-top:.8rem">${pList(S.lim.p)}</div>${more('p', S.lim.p, c.p)}`;
    }
    return h;
  };

  /* ---------- BROWSE ---------- */
  const viewBrowse = (v) => {
    setTop('Browse subjects'); drawTabs('browse');
    v.innerHTML = `<p class="sub" style="margin:.2rem 0 .8rem">${PF.lecs.length} lectures · ${fmt(PF.totalMin)} of PrepLadder video</p>
      <div class="grid">${PF.SUBJ.map((c) => {
        const s = PF.subjStats[c]; const w = s.L.filter((l) => st.watched[l.id]);
        const wm = w.reduce((a, l) => a + l.m, 0);
        return `<div class="sj fade" ${col(c)} data-go="#/subject/${c}"><h3>${esc(SM[c].n)}</h3>
          <div class="st">${s.n} lectures · ${fmt(s.m)}</div><div class="st"><b>${s.pq}</b> PYQs · ${s.wp} lectures asked</div>
          <div class="bar"><i style="width:${Math.round((wm / s.m) * 100)}%"></i></div><div class="st">${w.length}/${s.n} watched</div></div>`;
      }).join('')}</div>
      <div class="card" style="margin-top:.9rem" data-go="#/unmapped"><b>PYQs without a lecture</b><p class="sub" style="margin-top:.2rem">${PF.unmapped.length} questions (Medicine, Surgery, Pharmacology) are not covered by any PrepLadder lecture. Open →</p></div>`;
  };

  const SV = { sort: 'course', only: false, q: '', s: '' };
  const viewSubject = (v, c) => {
    if (!SM[c] || c === 'PHA') return viewBrowse(v);
    const s = PF.subjStats[c];
    setTop(SM[c].s); drawTabs('browse');
    if (SV.s !== c) Object.assign(SV, { sort: 'course', only: false, q: '', s: c });
    const w = s.L.filter((l) => st.watched[l.id]);
    v.innerHTML = `<div class="hero fade" ${col(c)}><div class="k">Subject</div><h1>${esc(SM[c].n)}</h1>
      <div class="meta"><span>${s.n} lectures</span><span>${fmt(s.m)}</span><span>${s.pq} PYQs</span><span>${w.length} watched</span></div></div>
      <div class="searchwrap" style="top:calc(var(--sat) + 3.4rem);margin-top:.4rem"><div class="search">${ic('search')}<input id="sq" placeholder="Filter lectures in ${esc(SM[c].s)}…" value="${esc(SV.q)}" autocomplete="off"></div></div>
      <div class="ctrl" style="margin-bottom:.7rem">${seg([['course', 'Course order'], ['pq', 'Most PYQs'], ['yield', 'High yield']], SV.sort, 'sv-sort', 'style="flex:1"')}</div>
      <div class="ctrl" style="margin-bottom:.7rem">${tog(SV.only, 'sv-only', 'Only lectures with PYQs')}
        <a class="qb nt on" style="margin-left:auto" href="#/trends?s=${c}">${ic('flame')}Trends</a><a class="qb nt on" href="#/quiz?s=${c}">${ic('shuffle')}Quiz</a></div>
      <div id="sl"></div>`;
    $('#sq').addEventListener('input', debounce((e) => { SV.q = e.target.value; drawSubjectList(c); }, 120));
    drawSubjectList(c);
  };
  const drawSubjectList = (c) => {
    const el = $('#sl'); if (!el) return;
    const s = PF.subjStats[c]; const qn = PF.norm(SV.q);
    let L = s.L.filter((l) => (!SV.only || l.pq) && (!qn || PF.norm(l.t + ' ' + l.sec).includes(qn)));
    if (!L.length) { el.innerHTML = '<div class="empty">No lectures match.</div>'; return; }
    if (SV.sort === 'course') {
      const groups = new Map(); L.forEach((l) => { if (!groups.has(l.sec)) groups.set(l.sec, []); groups.get(l.sec).push(l); });
      el.innerHTML = `<div class="stack">${[...groups].map(([sec, ls]) => {
        const wd = ls.filter((l) => st.watched[l.id]).length; const pq = ls.reduce((a, l) => a + l.pq, 0);
        return `<details class="acc" ${qn || groups.size === 1 ? 'open' : ''} ${col(c)}><summary>${ic('chevR', 'sm ch')}<span>${esc(sec)}</span><span class="cnt">${wd}/${ls.length} · ${pq} PYQs</span></summary><div class="in">${ls.map((l) => lecRow(l)).join('')}</div></details>`;
      }).join('')}</div>`;
    } else {
      L = [...L].sort(SV.sort === 'pq' ? (a, b) => b.pq - a.pq || b.yield - a.yield : (a, b) => b.yield - a.yield || b.pq - a.pq);
      el.innerHTML = `<div class="stack">${L.map((l) => lecRow(l)).join('')}</div>`;
    }
  };

  const viewUnmapped = (v) => {
    setTop('PYQs without a lecture', true); drawTabs('browse');
    v.innerHTML = `<p class="sub" style="margin:.2rem 0 .8rem">${PF.unmapped.length} questions not covered by any PrepLadder lecture – study these from a textbook.</p><div class="stack">${PF.unmapped.map((q) => qCard(q)).join('')}</div>`;
  };

  /* ---------- LECTURE ---------- */
  const LV = { sort: 'asked', ty: '', hideRel: false, id: '' };
  const viewLecture = (v, id) => {
    const l = PF.lecById[id]; if (!l) return viewBrowse(v);
    setTop(SM[l.s].s + ' · Lecture ' + l.n, true); drawTabs('browse');
    if (LV.id !== id) Object.assign(LV, { sort: 'asked', ty: '', hideRel: false, id });
    st.recent = [id, ...st.recent.filter((x) => x !== id)].slice(0, 10); PF.save();
    const lst = PF.subjStats[l.s].L; const idx = lst.indexOf(l); const prev = lst[idx - 1], next = lst[idx + 1];
    const yc = {}; l.q.forEach((x) => x.q.occ.forEach((o) => { if (o.yn) yc[o.yn] = (yc[o.yn] || 0) + 1; }));
    const ys = Object.keys(yc).sort(); const mx = Math.max(1, ...Object.values(yc));
    const w = !!st.watched[id];
    v.innerHTML = `<div class="hero fade" ${col(l.s)}><div class="k">${esc(l.sec)}</div><h1>${esc(l.t)}</h1>
      <div class="meta"><span>${ic('clock', 'sm')} ${fmt(l.m)}</span><span>${l.pq} PYQs</span><span>asked ${l.asks}×</span>${l.pq ? `<span>${l.yield.toFixed(1)} PYQ/hr</span>` : ''}</div>
      <div class="acts"><button class="hbtn ${w ? 'on' : ''}" data-act="watch" data-id="${id}">${ic('check', 'sm')}<span class="lbl">${w ? 'Watched' : 'Mark watched'}</span></button>
      <button class="hbtn ${st.starL[id] ? 'on' : ''}" data-act="star-l" data-id="${id}">${ic('star', 'sm')}Save</button>
      <button class="hbtn ${st.noteL[id] ? 'on' : ''}" data-act="note-l" data-id="${id}">${ic('edit', 'sm')}Note</button>
      <button class="hbtn" data-act="copy-l" data-id="${id}">${ic('copy', 'sm')}</button></div></div>
      ${st.noteL[id] ? `<div class="note" style="margin-top:.7rem">${esc(st.noteL[id])}</div>` : ''}
      ${ys.length ? `<div class="card" style="margin-top:.8rem"><b style="font-size:.88rem">When it was asked</b><div class="hist">${ys.map((y) => `<div style="height:${Math.max(12, (yc[y] / mx) * 100)}%" title="${y}: ${yc[y]}"></div>`).join('')}</div><div class="hist-l">${ys.map((y) => `<span>${y.slice(2)}</span>`).join('')}</div></div>` : ''}
      ${l.pq ? `<h2 class="sec">PYQs on this lecture</h2><p class="sub" style="margin:-.3rem 0 .6rem;font-size:.78rem">Tip: long-press any word in a question to search it.</p>
      <div class="ctrl" style="margin-bottom:.6rem">${seg([['', 'All'], ['L', 'Essay'], ['S', 'Short']], LV.ty, 'lv-ty', 'style="flex:1"')}
      <select class="sel" id="lvs"><option value="asked" ${LV.sort === 'asked' ? 'selected' : ''}>Most asked</option><option value="new" ${LV.sort === 'new' ? 'selected' : ''}>Newest</option><option value="old" ${LV.sort === 'old' ? 'selected' : ''}>Oldest</option></select>
      ${tog(LV.hideRel, 'lv-rel', 'Hide ≈ related')}</div><div id="ql" class="stack"></div>` : `<div class="empty"><div class="big">🎯</div><b>No PYQ mapped to this lecture yet</b><p class="sub">Lower priority for university exams.</p></div>`}
      <div class="nav2">${prev ? `<a href="#/lecture/${prev.id}"><small>← Previous</small><span>${esc(prev.t)}</span></a>` : '<span style="flex:1"></span>'}${next ? `<a class="r" href="#/lecture/${next.id}"><small>Next →</small><span>${esc(next.t)}</span></a>` : '<span style="flex:1"></span>'}</div>`;
    const sel = $('#lvs'); if (sel) sel.addEventListener('change', () => { LV.sort = sel.value; drawLectureQs(l); });
    drawLectureQs(l);
  };
  const drawLectureQs = (l) => {
    const el = $('#ql'); if (!el) return;
    let a = l.q.filter((x) => (!LV.ty || x.q.ty === LV.ty) && (!LV.hideRel || !x.rel)).map((x) => x.q);
    a.sort(LV.sort === 'asked' ? (p, q) => q.n - p.n || q.ymax - p.ymax : LV.sort === 'new' ? (p, q) => q.ymax - p.ymax : (p, q) => p.ymax - q.ymax);
    el.innerHTML = a.length ? a.map((q) => qCard(q, { lec: l })).join('') : '<div class="empty">No questions with these filters.</div>';
  };

  /* ---------- PAPERS ---------- */
  const PV = { g: '' };
  const GROUPS = ['Medicine', 'Surgery', 'Obstetrics & Gynaecology', 'Paediatrics', 'ENT', 'Ophthalmology', 'Pharmacology'];
  const viewPapers = (v) => {
    setTop('Question papers'); drawTabs('papers');
    v.innerHTML = `<p class="sub" style="margin:.2rem 0 .6rem">${PF.papers.length} university papers (2003–2024) – every question mapped to lectures.</p>
      <div class="chips"><button class="chip ${PV.g ? '' : 'on'}" data-act="pv-g" data-v="">All</button>${GROUPS.map((g) => `<button class="chip ${PV.g === g ? 'on' : ''}" data-act="pv-g" data-v="${esc(g)}">${esc(g.replace('Obstetrics & Gynaecology', 'OBG'))} <span class="sub">${PF.papers.filter((p) => p.g === g).length}</span></button>`).join('')}</div>
      <div class="stack" style="margin-top:.4rem">${PF.papers.filter((p) => !PV.g || p.g === PV.g).sort((a, b) => (PV.g ? 0 : GROUPS.indexOf(a.g) - GROUPS.indexOf(b.g)) || b.yn - a.yn || (a.id < b.id ? -1 : 1)).map((p) => paperRow(p)).join('')}</div>`;
  };
  const PPV = { mode: 'q', id: '' };
  const viewPaper = (v, id, params) => {
    const p = PF.paperById[id]; if (!p) return viewPapers(v);
    setTop(p.id + ' · ' + p.y, true); drawTabs('papers');
    if (PPV.id !== id) { PPV.id = id; PPV.mode = 'q'; }
    const first = [...p.subj][0]; const c = first ? SM[first].c : '#4f46e5';
    v.innerHTML = `<div class="hero fade" style="--c:${c}"><div class="k">${esc(p.g)} · ${esc(p.y)}</div><h1>${esc(p.title)}${p.note ? ' – ' + esc(p.note) : ''}</h1>
      <div class="meta"><span>${p.id}</span><span>${p.qs.length} questions</span>${p.marks ? `<span>${esc(p.marks)}</span>` : ''}</div>${p.exam ? `<p style="margin-top:.7rem;font-size:.82rem;opacity:.9;position:relative;z-index:1">${esc(p.exam)}</p>` : ''}</div>
      <div style="margin:.8rem 0">${seg([['q', 'Questions + lectures'], ['o', 'Original layout']], PPV.mode, 'pp-mode')}</div><div id="pb"></div>`;
    drawPaperBody(p, params && params.hl);
  };
  const drawPaperBody = (p, hlref) => {
    const el = $('#pb'); if (!el) return;
    if (PPV.mode === 'o') { el.innerHTML = `<pre class="orig">${esc((window.PAPER_TEXT && window.PAPER_TEXT[p.id]) || 'Not available')}</pre>`; return; }
    const groups = new Map();
    p.qs.forEach((x) => { const m = /^Q(\d+)/.exec(x.ref); const g = m ? 'Question ' + m[1] : 'Questions'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); });
    el.innerHTML = [...groups].map(([g, items]) => `<div class="qgroup"><h3>${g}</h3><div class="stack">${items.map((x) => `<div data-ref="${esc(x.ref)}"><div style="margin:0 0 .25rem .2rem"><span class="qref">${esc(x.ref)}</span></div>${qCard(x.q)}</div>`).join('')}</div></div>`).join('');
    if (hlref) setTimeout(() => { const t = $$('#pb [data-ref]').filter((d) => d.dataset.ref === hlref); if (t[0]) { t[0].scrollIntoView({ block: 'center' }); t.forEach((d) => { const a = $('.q', d); a.classList.remove('flash'); void a.offsetWidth; a.classList.add('flash'); }); } }, 60);
  };

  /* ---------- STUDY ---------- */
  const viewStudy = (v) => {
    setTop('Study', false); drawTabs('study');
    const P = st.plan;
    const watched = PF.lecs.filter((l) => st.watched[l.id]);
    const wm = watched.reduce((a, l) => a + l.m, 0);
    const pct = Math.round((wm / PF.totalMin) * 100);
    const sel = P.subj.length ? P.subj : PF.SUBJ;
    let pool = PF.lecs.filter((l) => sel.includes(l.s) && !st.watched[l.id] && (!P.onlyPYQ || l.pq));
    const rem = pool.reduce((a, l) => a + l.m, 0);
    const daily = Math.max(30, P.hours * 60);
    const order = P.order === 'yield' ? (a, b) => b.yield - a.yield || b.pq - a.pq : (a, b) => a.i - b.i;
    pool = [...pool].sort(order);
    const today = []; let acc = 0; for (const l of pool) { if (acc + l.m > daily && today.length) { if (acc >= daily * 0.8) break; else continue; } today.push(l); acc += l.m; if (acc >= daily) break; }
    const ex = PF.examDays(); const days = ex > 0 ? ex : P.days; const need = days ? rem / 60 / days : 0; const rs = PF.revStats();
    v.innerHTML = `<div class="hero homehero fade" style="display:flex;gap:1rem;align-items:center"><div style="flex:1;position:relative;z-index:1"><div class="k">Your progress</div><h1>${watched.length} / ${PF.lecs.length} lectures</h1><p>${fmt(wm)} of ${fmt(PF.totalMin)} watched</p></div><div class="ring" style="--p:${pct}"><b>${pct}%</b></div></div>
      <h2 class="sec">${ic('clock')} Spaced revision</h2>
      <div class="card"><div style="display:flex;gap:.5rem;text-align:center">${[['Due today', rs.due, 'var(--bad)'], ['Next 7 days', rs.week, 'var(--warn)'], ['Learning', rs.learning, 'var(--brand)'], ['Mastered', rs.mastered, 'var(--ok)']].map(([l, n, c]) => `<div style="flex:1"><div style="font-size:1.4rem;font-weight:800;color:${c}">${n}</div><div class="sub" style="font-size:.7rem">${l}</div></div>`).join('')}</div>
        <button class="btn block" style="margin-top:.9rem" data-go="#/quiz?due=1">${rs.due ? 'Review ' + rs.due + ' due now' : 'Nothing due – open review'}</button>
        <p class="sub" style="margin-top:.6rem;font-size:.78rem">Tap “Revised” on any PYQ. It comes back after 1, 3, 7 and 21 days${ex > 1 ? ' (always before your exam)' : ''}.</p></div>
      <h2 class="sec">📅 Exam countdown</h2>
      <div class="card"><label class="sub" style="font-weight:800;display:block;margin-bottom:.3rem">Exam date</label><input class="fld" id="ex-d" type="date" value="${esc(st.exam)}">
        ${ex > 0 ? `<p style="margin-top:.6rem;font-weight:800;font-size:1.05rem">${ex} day${ex === 1 ? '' : 's'} to go</p>` : st.exam ? '<p class="sub" style="margin-top:.5rem">That date has passed.</p>' : ''}</div>
      <h2 class="sec">${ic('flame')} Topic trends</h2><div class="card" data-go="#/trends"><b>What’s hot vs fading</b><p class="sub" style="margin-top:.2rem">Heat-map of how often each lecture topic was asked over the years. Open →</p></div>
      <h2 class="sec">By subject</h2><div class="stack">${PF.SUBJ.map((c) => { const s = PF.subjStats[c]; const w = s.L.filter((l) => st.watched[l.id]); const m = w.reduce((a, l) => a + l.m, 0); return `<div class="card" ${col(c)} data-go="#/subject/${c}" style="padding:.7rem .9rem"><div style="display:flex;justify-content:space-between;font-weight:750;font-size:.88rem"><span>${esc(SM[c].n)}</span><span class="sub">${w.length}/${s.n}</span></div><div class="bar" style="margin:.45rem 0 .25rem"><i style="width:${Math.round((m / s.m) * 100)}%"></i></div><div class="sub" style="font-size:.74rem">${fmt(s.m - m)} left</div></div>`; }).join('')}</div>
      <h2 class="sec">${ic('target')} Study planner</h2>
      <div class="card">
        <label class="sub" style="font-weight:800">Daily study time: <b style="color:var(--ink)">${P.hours} h</b></label>
        <input type="range" id="p-h" min="1" max="12" step="0.5" value="${P.hours}">
        ${ex > 0 ? `<p class="sub" style="margin-top:.7rem">Using your exam date: <b>${ex} days</b> left.</p>` : `<label class="sub" style="font-weight:800;display:block;margin-top:.7rem">Days left to exam (or set a date above)</label>
        <input class="fld" id="p-d" type="number" min="0" inputmode="numeric" placeholder="e.g. 45" value="${P.days || ''}">`}
        <div class="chips" style="margin-top:.8rem">${PF.SUBJ.map((c) => `<button class="chip ${P.subj.includes(c) ? 'on' : ''}" data-act="p-subj" data-v="${c}">${esc(SM[c].s)}</button>`).join('')}</div>
        <div class="ctrl" style="margin-top:.4rem">${seg([['yield', 'High-yield first'], ['course', 'Course order']], P.order, 'p-order', 'style="flex:1"')}</div>
        <div style="margin-top:.7rem">${tog(P.onlyPYQ, 'p-only', 'Skip lectures with no PYQ')}</div>
        <div style="margin-top:.8rem;border-top:1px solid var(--line);padding-top:.6rem">
          <div class="kv"><span>Remaining</span><b>${pool.length} lectures · ${fmt(rem)}</b></div>
          <div class="kv"><span>At ${P.hours} h/day you finish in</span><b>${Math.ceil(rem / daily)} days</b></div>
          ${days ? `<div class="kv"><span>To finish in ${days} days you need</span><b style="color:${need > P.hours ? 'var(--bad)' : 'var(--ok)'}">${need.toFixed(1)} h/day</b></div>` : ''}</div></div>
      <h2 class="sec">Today's queue<span class="sub">${fmt(acc)}</span></h2>
      <div class="stack">${today.length ? today.map((l) => lecRow(l, { showSubj: true })).join('') : '<div class="empty">Nothing left – great job! 🎉</div>'}</div>
      <h2 class="sec">${ic('shuffle')} Quick revision</h2>
      <div class="card" data-go="#/quiz"><b>PYQ flash-cards</b><p class="sub" style="margin-top:.2rem">Practise random PYQs, then reveal which lecture covers them. Open →</p></div>`;
    $('#p-h').addEventListener('change', (e) => { P.hours = +e.target.value; PF.save(); rerender(); });
    $('#p-h').addEventListener('input', (e) => { $('#p-h').previousElementSibling.innerHTML = 'Daily study time: <b style="color:var(--ink)">' + e.target.value + ' h</b>'; });
    const pd = $('#p-d'); if (pd) pd.addEventListener('change', (e) => { P.days = Math.max(0, +e.target.value || 0); PF.save(); rerender(); });
    $('#ex-d').addEventListener('change', (e) => { st.exam = e.target.value; PF.save(); rerender(); });
  };

  /* ---------- QUIZ ---------- */
  const QZ = { subj: 'ALL', ty: '', pool: 'todo', order: 'shuffle', deck: [], i: 0, show: false, started: false };
  const buildDeck = () => {
    let a = QZ.pool === 'due' ? PF.dueList().filter((q) => QZ.subj === 'ALL' || q.L.some((x) => x.l.s === QZ.subj)) : PF.qs.filter((q) => (QZ.subj === 'ALL' || q.L.some((x) => x.l.s === QZ.subj)) && (!QZ.ty || q.ty === QZ.ty) && (QZ.pool === 'all' || (QZ.pool === 'todo' ? !st.doneQ[q.k] : st.starQ[q.k])));
    if (QZ.pool === 'due') a.sort((x, y) => (st.rev[x.k].due - st.rev[y.k].due)); else if (QZ.order === 'shuffle') for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } else if (QZ.pool !== 'due') a.sort((x, y) => y.n - x.n || y.ymax - x.ymax);
    QZ.deck = a; QZ.i = 0; QZ.show = false; QZ.started = true;
  };
  const viewQuiz = (v, params) => {
    setTop('PYQ flash-cards', true); drawTabs('study');
    if (params && params.due) { if (QZ.pool !== 'due' || !QZ.started) { QZ.pool = 'due'; QZ.subj = 'ALL'; buildDeck(); } }
    else if (QZ.pool === 'due' && !QZ.started) QZ.pool = 'todo';
    if (params && params.s && SM[params.s] && QZ.subj !== params.s) { QZ.subj = params.s; QZ.started = false; }
    if (!QZ.started) {
      v.innerHTML = `<div class="card fade"><h3 style="font-weight:800">Set up your session</h3>
        <label class="sub" style="font-weight:800;display:block;margin:.8rem 0 .3rem">Subject</label>
        <select class="sel" id="qz-s" style="width:100%"><option value="ALL">All subjects</option>${PF.SUBJ.filter((c) => c !== 'PHA').map((c) => `<option value="${c}" ${QZ.subj === c ? 'selected' : ''}>${esc(SM[c].n)}</option>`).join('')}</select>
        <label class="sub" style="font-weight:800;display:block;margin:.8rem 0 .3rem">Question type</label>${seg([['', 'Any'], ['L', 'Essay'], ['S', 'Short']], QZ.ty, 'qz-ty')}
        <label class="sub" style="font-weight:800;display:block;margin:.8rem 0 .3rem">Which questions</label>${seg([['todo', 'Not revised'], ['due', 'Due today'], ['star', 'Saved'], ['all', 'All']], QZ.pool, 'qz-pool')}
        <label class="sub" style="font-weight:800;display:block;margin:.8rem 0 .3rem">Order</label>${seg([['shuffle', 'Shuffle'], ['top', 'Most asked first']], QZ.order, 'qz-order')}
        <button class="btn block" style="margin-top:1.2rem" data-act="qz-start">Start</button></div>`;
      const s = $('#qz-s'); s.addEventListener('change', () => { QZ.subj = s.value; });
      return;
    }
    const q = QZ.deck[QZ.i];
    if (!q) { v.innerHTML = `<div class="empty"><div class="big">🎉</div><b>${QZ.deck.length ? 'Deck finished!' : (QZ.pool === 'due' ? 'Nothing due today 🎉' : 'No questions match')}</b><p class="sub" style="margin:.4rem 0 1rem">${QZ.deck.length ? 'You went through ' + QZ.deck.length + ' PYQs.' : 'Try another subject or “All”.'}</p><button class="btn" data-act="qz-reset">New session</button></div>`; return; }
    const occ = [...q.occ].sort((a, b) => b.yn - a.yn);
    v.innerHTML = `<div class="sub" style="margin:.2rem 0 .5rem;display:flex;justify-content:space-between"><span>Card ${QZ.i + 1} / ${QZ.deck.length}</span><span data-act="qz-reset" style="color:var(--brand);font-weight:700">Change</span></div>
      <div class="bar" style="margin-bottom:.8rem"><i style="width:${(QZ.i / QZ.deck.length) * 100}%"></i></div>
      <div class="card flash-card fade"><div class="top" style="display:flex;gap:.4rem"><span class="badge ${q.ty}">${q.ty === 'L' ? 'Essay' : 'Short note'}</span>${q.n > 1 ? `<span class="badge a">asked ${q.n}×</span>` : ''}</div>
      <p style="font-size:1.1rem;font-weight:650;line-height:1.5">${esc(q.t)}</p>
      ${QZ.show ? `<div class="occ">${occ.map((c) => `<a class="oc" href="#/paper/${c.p}?hl=${encodeURIComponent(c.ref)}"><b>${esc(c.y)}</b> ${GS[PF.paperById[c.p].g]} · ${c.p} · ${esc(c.ref)}</a>`).join('')}</div>
      <div class="lecs">${q.L.length ? q.L.map((x) => `<a class="lc" ${col(x.l.s)} href="#/lecture/${x.l.id}"><i class="dt"></i><span class="t">${esc(SM[x.l.s].s)} · L${x.l.n} · ${esc(x.l.t)}</span><span class="m">${fmt(x.l.m)}${x.rel ? ' · ≈' : ''}</span></a>`).join('') : '<div class="lc"><span class="t">No lecture – use a textbook</span></div>'}</div>` : ''}</div>
      <div style="display:flex;gap:.6rem;margin-top:1rem">${QZ.show ? `<button class="btn ghost" style="flex:1" data-act="qz-next" data-v="revise">${QZ.pool === 'due' ? '✗ Forgot' : '↻ Revise later'}</button><button class="btn" style="flex:1" data-act="qz-next" data-v="know">${QZ.pool === 'due' ? '✓ Remembered' : '✓ Got it'}</button>` : `<button class="btn block" data-act="qz-show">Show lectures & years</button>`}</div>
      <button class="btn ghost block" style="margin-top:.6rem" data-act="qz-next" data-v="skip">Skip →</button>`;
  };

  /* ---------- TRENDS ---------- */
  const TR = { s: 'MED', by: 'lec', sort: 'total' };
  const maxYear = Math.max(...PF.papers.map((p) => p.yn));
  const BK = [0, 1, 2, 3, 4, 5].map((i) => { const hi = maxYear - 3 * (5 - i); return { lo: i === 0 ? 1 : hi - 2, hi }; });
  const bucketOf = (y) => { for (let i = 0; i < BK.length; i++) if (y >= BK[i].lo && y <= BK[i].hi) return i; return -1; };
  const bLabel = (b, i) => (i === 0 ? '≤' + String(b.hi).slice(2) : String(b.lo).slice(2) + '–' + String(b.hi).slice(2));
  const viewTrends = (v, params) => {
    setTop('Topic trends', true); drawTabs('study');
    if (params && params.s && SM[params.s]) TR.s = params.s;
    v.innerHTML = `<p class="sub" style="margin:.2rem 0 .6rem">How often each topic was asked, by 3-year block. Darker = more questions. Dates are the university exam years; undated papers are ignored.</p>
      <div class="chips">${PF.SUBJ.filter((c) => c !== 'PHA').map((c) => `<button class="chip ${TR.s === c ? 'on' : ''}" data-act="tr-s" data-v="${c}">${esc(SM[c].s)}</button>`).join('')}</div>
      <div class="ctrl" style="margin:.3rem 0 .7rem">${seg([['lec', 'Lectures'], ['sec', 'Sections']], TR.by, 'tr-by', 'style="flex:1"')}<select class="sel" id="trs"><option value="total" ${TR.sort === 'total' ? 'selected' : ''}>Most asked</option><option value="recent" ${TR.sort === 'recent' ? 'selected' : ''}>Trending now</option><option value="fading" ${TR.sort === 'fading' ? 'selected' : ''}>Fading</option></select></div><div id="trb"></div>`;
    $('#trs').addEventListener('change', (e) => { TR.sort = e.target.value; drawTrends(); });
    drawTrends();
  };
  const drawTrends = () => {
    const el = $('#trb'); if (!el) return; const c = TR.s;
    const rows = []; const sec = new Map();
    PF.subjStats[c].L.forEach((l) => {
      if (!l.pq) return;
      const cnt = BK.map(() => 0); l.q.forEach((x) => x.q.occ.forEach((o) => { const b = o.yn ? bucketOf(o.yn) : -1; if (b >= 0) cnt[b]++; }));
      if (TR.by === 'lec') rows.push({ name: l.t, id: l.id, cnt });
      else { let r = sec.get(l.sec); if (!r) { r = { name: l.sec, seen: new Set(), cnt: BK.map(() => 0) }; sec.set(l.sec, r); } l.q.forEach((x) => { if (r.seen.has(x.q.k)) return; r.seen.add(x.q.k); x.q.occ.forEach((o) => { const b = o.yn ? bucketOf(o.yn) : -1; if (b >= 0) r.cnt[b]++; }); }); }
    });
    if (TR.by === 'sec') sec.forEach((r) => rows.push(r));
    rows.forEach((r) => { r.total = r.cnt.reduce((a, b) => a + b, 0); r.recent = r.cnt[BK.length - 1] + r.cnt[BK.length - 2]; r.tag = r.recent >= 4 ? 'hot' : r.total >= 3 && r.recent / r.total >= 0.6 ? 'up' : r.total >= 3 && r.recent === 0 ? 'down' : ''; });
    const use = rows.filter((r) => r.total > 0);
    use.sort(TR.sort === 'recent' ? (a, b) => b.recent - a.recent || b.total - a.total : TR.sort === 'fading' ? (a, b) => (b.total - b.recent) - (a.total - a.recent) || a.recent - b.recent : (a, b) => b.total - a.total);
    const list = TR.sort === 'fading' ? use.filter((r) => r.total - r.recent > 0) : use;
    const mx = Math.max(1, ...list.flatMap((r) => r.cnt));
    const TAG = { hot: '🔥 Hot', up: '↑ Rising', down: '↓ Fading' };
    el.style.setProperty('--c', SM[c].c);
    el.innerHTML = list.length ? `<div class="hm"><div class="hm-h"><span></span>${BK.map((b, i) => `<span>${bLabel(b, i)}</span>`).join('')}</div>${list.slice(0, 60).map((r) => `<div class="hm-r" ${r.id ? `data-go="#/lecture/${r.id}"` : ''}><div class="hm-n"><b>${esc(r.name)}</b>${r.tag ? `<small class="tg ${r.tag}">${TAG[r.tag]}</small>` : ''}</div>${r.cnt.map((n) => `<span class="hc" style="${n ? `background:color-mix(in srgb,var(--c) ${Math.round(18 + (n / mx) * 82)}%,transparent);color:${n / mx > 0.45 ? '#fff' : 'var(--ink)'}` : ''}">${n || ''}</span>`).join('')}</div>`).join('')}</div>` : '<div class="empty">No data for this subject.</div>';
  };

  /* ---------- SAVED ---------- */
  const SAV = { t: 'lec' };
  const viewSaved = (v) => {
    setTop('Saved', false); drawTabs('saved');
    const L = PF.lecs.filter((l) => st.starL[l.id]);
    const Q = PF.qs.filter((q) => st.starQ[q.k]);
    const NL = PF.lecs.filter((l) => st.noteL[l.id]); const NQ = PF.qs.filter((q) => st.noteQ[q.k]);
    let body = '';
    if (SAV.t === 'lec') body = L.length ? `<div class="stack">${L.map((l) => lecRow(l, { showSubj: true })).join('')}</div>` : emptyMsg('Tap “Save” on a lecture to keep it here.');
    else if (SAV.t === 'q') body = Q.length ? `<div class="stack">${Q.map((q) => qCard(q)).join('')}</div>` : emptyMsg('Tap “Save” on any PYQ to revise it later.');
    else body = NL.length + NQ.length ? `<div class="stack">${NL.map((l) => lecRow(l, { showSubj: true }) + `<div class="note" style="margin-top:-.3rem">${esc(st.noteL[l.id])}</div>`).join('')}${NQ.map((q) => qCard(q)).join('')}</div>` : emptyMsg('Your notes on lectures and PYQs appear here.');
    v.innerHTML = seg([['lec', 'Lectures', L.length], ['q', 'PYQs', Q.length], ['n', 'Notes', NL.length + NQ.length]], SAV.t, 'sav-t') + '<div style="margin-top:.8rem">' + body + '</div>';
  };
  const emptyMsg = (m) => `<div class="empty"><div class="big">🔖</div>${m}</div>`;

  /* ---------- sheets ---------- */
  const yearsList = [...new Set(PF.papers.map((p) => p.yn).filter(Boolean))].sort((a, b) => b - a);
  const filterSheet = () => {
    const F = st.filters;
    const yo = (cur) => `<option value="0">Any</option>${yearsList.map((y) => `<option value="${y}" ${cur === y ? 'selected' : ''}>${y}</option>`).join('')}`;
    openSheet(`<h3>Filters</h3>
      <label class="lb">Subject</label><div class="wrapchips">${PF.SUBJ.map((c) => `<button class="chip ${F.subj.includes(c) ? 'on' : ''}" data-act="f-subj" data-v="${c}">${esc(SM[c].s)}</button>`).join('')}</div>
      <label class="lb">Asked in which papers</label><div class="wrapchips"><button class="chip ${F.src ? '' : 'on'}" data-act="f-src" data-v="">All papers</button>${GROUPS_ALL.map((g) => `<button class="chip ${F.src === g ? 'on' : ''}" data-act="f-src" data-v="${esc(g)}">${GS[g]}</button>`).join('')}</div>
      <label class="lb">Years asked</label><div class="row" style="margin-top:0"><select class="sel" id="fy1">${yo(F.yFrom)}</select><select class="sel" id="fy2">${yo(F.yTo)}</select></div>
      <label class="lb">Question type</label>${seg([['', 'Any'], ['L', 'Essay'], ['S', 'Short note']], F.type, 'f-type')}
      <label class="lb">Repeated</label>${seg([[1, 'Any'], [2, '2×+'], [3, '3×+'], [5, '5×+']], F.minN, 'f-min')}
      <label class="lb">Lecture status</label>${seg([['', 'All'], ['unwatched', 'Not watched'], ['starred', 'Saved']], F.status, 'f-status')}
      <div style="margin-top:1rem">${tog(F.hideRel, 'f-rel', 'Hide “≈ related” matches (exact lectures only)')}</div>
      <div class="row"><button class="btn ghost" data-act="clear-filters">Reset</button><button class="btn" data-act="close-sheet">Show results</button></div>`);
    $('#fy1').addEventListener('change', (e) => { F.yFrom = +e.target.value; PF.save(); updateHome(); });
    $('#fy2').addEventListener('change', (e) => { F.yTo = +e.target.value; PF.save(); updateHome(); });
  };
  const settingsSheet = () => {
    const s = st.settings; const done = Object.keys(st.watched).length;
    openSheet(`<h3>Settings</h3>
      <label class="lb">Theme</label>${seg([['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], s.theme, 's-theme')}
      <label class="lb">Text size</label>${seg([['s', 'Small'], ['m', 'Medium'], ['l', 'Large']], s.size, 's-size')}
      <label class="lb">Backup & restore progress</label>
      <p class="sub" style="margin-bottom:.5rem">Watched lectures, saved items, notes, revision schedule, pinned topics, search history and planner settings live on this device. Copy a backup to move them to another phone.</p>
      <div class="row" style="margin-top:.4rem"><button class="btn ghost" data-act="s-backup">Copy backup</button><button class="btn ghost" data-act="s-restore">Restore…</button></div>
      <div id="rs"></div>
      <label class="lb">About this data</label>
      <div class="card" style="padding:.7rem .9rem"><div class="kv"><span>App version</span><b>${PF.VERSION}</b></div><div class="kv"><span>PrepLadder lectures</span><b>${PF.lecs.length}</b></div><div class="kv"><span>Lectures with PYQs</span><b>${PF.lecs.filter((l) => l.pq).length}</b></div><div class="kv"><span>Unique PYQs</span><b>${PF.qs.length}</b></div><div class="kv"><span>Question slots (paper × no.)</span><b>${PF.qs.reduce((a, q) => a + q.n, 0)}</b></div><div class="kv"><span>University papers</span><b>${PF.papers.length}</b></div><div class="kv"><span>Lectures watched</span><b>${done}</b></div></div>
      <div class="row"><button class="btn danger" data-act="s-reset">Reset my progress</button></div>`);
  };
  const noteSheet = (kind, id) => {
    const isL = kind === 'l'; const key = isL ? 'noteL' : 'noteQ';
    const title = isL ? PF.lecById[id].t : PF.qByKey[id].t;
    openSheet(`<h3>Note</h3><p class="sub" style="margin-bottom:.6rem">${esc(title.length > 120 ? title.slice(0, 120) + '…' : title)}</p><textarea id="nt" placeholder="Mnemonics, page numbers, what to revise…">${esc(st[key][id] || '')}</textarea><div class="row"><button class="btn" data-act="close-sheet">Done</button></div>`);
    const ta = $('#nt'); ta.addEventListener('input', () => { const t = ta.value.trim(); if (t) st[key][id] = ta.value; else delete st[key][id]; PF.save(); });
    closeSheet.cb = () => rerender();
    setTimeout(() => ta.focus(), 350);
  };

  /* ---------- actions ---------- */
  const syncBtns = (act, id, on, labelOn, labelOff) => {
    $$(`[data-act="${act}"][data-id="${id}"]`).forEach((b) => { b.classList.toggle('on', on); const lb = $('.lbl', b); if (lb && labelOn) lb.textContent = on ? labelOn : labelOff; });
  };
  const ACT = {
    back() { if (history.length > 1) history.back(); else location.hash = '#/'; },
    'open-settings': settingsSheet,
    'open-filters': filterSheet,
    'close-sheet'() { closeSheet(); if (closeSheet.cb) { const f = closeSheet.cb; closeSheet.cb = null; f(); } },
    'clear-q'() { S.q = ''; const i = $('#q'); if (i) { i.value = ''; i.focus(); } $('#qx').style.display = 'none'; updateHome(); },
    'pin-q'(a) { const q = a.dataset.v; const i = st.pins.findIndex((p) => p.toLowerCase() === q.toLowerCase()); if (i >= 0) st.pins.splice(i, 1); else st.pins.unshift(q); PF.save(); toast(i >= 0 ? 'Unpinned' : 'Pinned to home'); updateHome(); },
    'clear-recent'() { st.recentS = []; PF.save(); updateHome(); },
    'chip-search'(a) { S.q = a.dataset.v; S.tab = 'all'; const i = $('#q'); if (i) i.value = S.q; $('#qx').style.display = ''; updateHome(); window.scrollTo(0, 0); },
    rtab(a) { S.tab = a.dataset.v; updateHome(); },
    more(a) { S.lim[a.dataset.v] += a.dataset.v === 'lec' ? 25 : 20; updateHome(); },
    'clear-filters'() { Object.assign(st.filters, { subj: [], src: '', yFrom: 0, yTo: 0, type: '', minN: 1, hideRel: false, status: '' }); PF.save(); if ($('#sheet-root').classList.contains('open') && $('#fy1')) filterSheet(); updateHome(); },
    'f-subj'(a) { const F = st.filters, c = a.dataset.v; F.subj = F.subj.includes(c) ? F.subj.filter((x) => x !== c) : [...F.subj, c]; PF.save(); a.classList.toggle('on'); updateHome(); },
    'f-src'(a) { st.filters.src = a.dataset.v; PF.save(); filterSheet(); updateHome(); },
    'f-src-q'(a) { st.filters.src = a.dataset.v; PF.save(); updateHome(); },
    'f-type'(a) { st.filters.type = a.dataset.v; PF.save(); filterSheet(); updateHome(); },
    'f-min'(a) { st.filters.minN = +a.dataset.v; PF.save(); filterSheet(); updateHome(); },
    'f-status'(a) { st.filters.status = a.dataset.v; PF.save(); filterSheet(); updateHome(); },
    'f-rel'() { st.filters.hideRel = !st.filters.hideRel; PF.save(); filterSheet(); updateHome(); },
    watch(a) {
      const id = a.dataset.id; const on = !st.watched[id]; if (on) st.watched[id] = Date.now(); else delete st.watched[id]; PF.save();
      syncBtns('watch', id, on, 'Watched', 'Mark watched'); $$(`[data-go="#/lecture/${id}"]`).forEach((r) => r.classList.toggle('done', on && r.classList.contains('lec')));
      if (on) toast('Marked as watched');
    },
    'star-l'(a) { const id = a.dataset.id; const on = !st.starL[id]; if (on) st.starL[id] = 1; else delete st.starL[id]; PF.save(); syncBtns('star-l', id, on); toast(on ? 'Lecture saved' : 'Removed'); },
    'star-q'(a) { const id = a.dataset.id; const on = !st.starQ[id]; if (on) st.starQ[id] = 1; else delete st.starQ[id]; PF.save(); syncBtns('star-q', id, on); toast(on ? 'PYQ saved' : 'Removed'); },
    'done-q'(a) { const id = a.dataset.id; const on = !st.doneQ[id]; if (on) PF.revDone(id); else PF.revUndo(id); PF.save(); syncBtns('done-q', id, on); if (on) toast('Revised ✓ – we’ll remind you in 1 day'); },
    'note-q'(a) { noteSheet('q', a.dataset.id); },
    'note-l'(a) { noteSheet('l', a.dataset.id); },
    'copy-q'(a) {
      const q = PF.qByKey[a.dataset.id];
      copyText(q.t + '\n— ' + q.occ.map((o) => o.y + ' ' + o.p + ' ' + o.ref).join('; ') + (q.L.length ? '\nLecture: ' + q.L.map((x) => SM[x.l.s].s + ' L' + x.l.n + ' ' + x.l.t).join(' | ') : ''));
    },
    'copy-l'(a) { const l = PF.lecById[a.dataset.id]; copyText(SM[l.s].n + ' · Lecture ' + l.n + ' · ' + l.t + ' (' + fmt(l.m) + ')'); },
    'tr-s'(a) { TR.s = a.dataset.v; rerender(); },
    'tr-by'(a) { TR.by = a.dataset.v; rerender(); },
    'sv-sort'(a) { SV.sort = a.dataset.v; rerender(); },
    'sv-only'() { SV.only = !SV.only; rerender(); },
    'lv-ty'(a) { LV.ty = a.dataset.v; rerender(); },
    'lv-rel'() { LV.hideRel = !LV.hideRel; rerender(); },
    'pv-g'(a) { PV.g = a.dataset.v; rerender(); },
    'pp-mode'(a) { PPV.mode = a.dataset.v; const p = PF.paperById[PPV.id]; $$('.seg button').forEach((b) => b.classList.toggle('on', b.dataset.v === PPV.mode)); drawPaperBody(p); },
    'sav-t'(a) { SAV.t = a.dataset.v; rerender(); },
    's-theme'(a) { st.settings.theme = a.dataset.v; PF.save(); applyTheme(); settingsSheet(); },
    's-size'(a) { st.settings.size = a.dataset.v; PF.save(); applyTheme(); settingsSheet(); },
    ws(a) { closeSheet(); S.q = a.dataset.v; S.tab = 'all'; S.lim = { lec: 25, q: 20, p: 15 }; pushRecent(S.q); fwd = true; if (!location.hash || location.hash === '#/') route(); else location.hash = '#/'; window.scrollTo(0, 0); },
    's-backup'() { copyText(PF.exportState()); },
    's-restore'() { $('#rs').innerHTML = '<textarea id="rt" placeholder="Paste backup text here…" style="margin-top:.6rem"></textarea><div class="row"><button class="btn" data-act="s-restore-go">Restore now</button></div>'; },
    's-restore-go'() { try { PF.importState($('#rt').value.trim()); applyTheme(); toast('Progress restored'); closeSheet(); rerender(); } catch (e) { toast('Invalid backup text'); } },
    's-reset'() { if (confirm('Erase all watched marks, saved items and notes on this device?')) { PF.resetState(); applyTheme(); closeSheet(); toast('Progress reset'); rerender(); } },
    'p-subj'(a) { const P = st.plan, c = a.dataset.v; P.subj = P.subj.includes(c) ? P.subj.filter((x) => x !== c) : [...P.subj, c]; PF.save(); rerender(); },
    'p-order'(a) { st.plan.order = a.dataset.v; PF.save(); rerender(); },
    'p-only'() { st.plan.onlyPYQ = !st.plan.onlyPYQ; PF.save(); rerender(); },
    'qz-ty'(a) { QZ.ty = a.dataset.v; $$('.seg button[data-act="qz-ty"]').forEach((b) => b.classList.toggle('on', b === a)); },
    'qz-pool'(a) { QZ.pool = a.dataset.v; $$('.seg button[data-act="qz-pool"]').forEach((b) => b.classList.toggle('on', b === a)); },
    'qz-order'(a) { QZ.order = a.dataset.v; $$('.seg button[data-act="qz-order"]').forEach((b) => b.classList.toggle('on', b === a)); },
    'qz-start'() { buildDeck(); rerender(); },
    'qz-reset'() { QZ.started = false; rerender(); },
    'qz-show'() { QZ.show = true; rerender(); },
    'qz-next'(a) {
      const q = QZ.deck[QZ.i];
      if (QZ.pool === 'due') { if (a.dataset.v === 'know') PF.revGrade(q.k, true); else if (a.dataset.v === 'revise') PF.revGrade(q.k, false); }
      else if (a.dataset.v === 'know') { if (!st.doneQ[q.k]) PF.revDone(q.k); } else if (a.dataset.v === 'revise') { st.starQ[q.k] = 1; }
      PF.save(); QZ.i++; QZ.show = false; rerender(); window.scrollTo(0, 0);
    },
  };

  /* long-press (or double-click) a word in a question to search it */
  const wordAt = (t, x, y) => {
    let node, off;
    if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (r) { node = r.startContainer; off = r.startOffset; } }
    else if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (p) { node = p.offsetNode; off = p.offset; } }
    if (!node || !t.contains(node)) return null;
    const pre = document.createRange(); pre.setStart(t, 0); pre.setEnd(node, off);
    const txt = t.textContent; let i = Math.min(pre.toString().length, txt.length - 1);
    const isW = (ch) => /[A-Za-z0-9]/.test(ch || '');
    if (!isW(txt[i]) && isW(txt[i - 1])) i--;
    if (!isW(txt[i])) return null;
    let a = i, b = i; while (isW(txt[a - 1])) a--; while (isW(txt[b + 1])) b++;
    const words = txt.match(/[A-Za-z0-9]+/g) || []; const before = txt.slice(0, a).match(/[A-Za-z0-9]+/g) || []; const k = before.length;
    return { w: words[k], prev: words[k - 1], next: words[k + 1], all: txt };
  };
  const wordSheet = (t, x, y) => {
    const r = wordAt(t, x, y); if (!r || !r.w) return;
    const opts = [r.w]; if (r.prev) opts.push(r.prev + ' ' + r.w); if (r.next) opts.push(r.w + ' ' + r.next);
    if (r.prev && r.next) opts.push(r.prev + ' ' + r.w + ' ' + r.next);
    openSheet(`<h3>Search from this question</h3><div class="wrapchips">${opts.map((o) => `<button class="chip x" data-act="ws" data-v="${esc(o)}">${ic('search', 'sm')}${esc(o)}</button>`).join('')}</div><div class="row"><button class="btn ghost" data-act="close-sheet">Cancel</button></div>`);
  };
  let lp = null, lpx = 0, lpy = 0, lpFired = false;
  document.addEventListener('pointerdown', (e) => { const t = e.target.closest('.tx'); if (!t) return; lpx = e.clientX; lpy = e.clientY; lpFired = false; clearTimeout(lp); lp = setTimeout(() => { lpFired = true; wordSheet(t, lpx, lpy); }, 480); });
  document.addEventListener('pointermove', (e) => { if (lp && Math.hypot(e.clientX - lpx, e.clientY - lpy) > 10) { clearTimeout(lp); lp = null; } });
  ['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, () => { clearTimeout(lp); lp = null; }));
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('.tx')) e.preventDefault(); });
  document.addEventListener('dblclick', (e) => { const t = e.target.closest('.tx'); if (t) wordSheet(t, e.clientX, e.clientY); });

  let fwd = false;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    if (a) { e.preventDefault(); e.stopPropagation(); const f = ACT[a.dataset.act]; if (f) f(a, e); return; }
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); fwd = true; if (location.hash === g.dataset.go) route(); else location.hash = g.dataset.go; return; }
    const lnk = e.target.closest('a[href^="#/"]'); if (lnk) fwd = true;
  });

  /* ---------- router ---------- */
  const scrolls = {}; let curHash = null;
  const parseHash = () => {
    const h = location.hash.replace(/^#/, '') || '/'; const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean); const params = {};
    (qs || '').split('&').forEach((kv) => { if (!kv) return; const i = kv.indexOf('='); try { params[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* ignore */ } });
    return { parts, params };
  };
  const route = (keepScroll) => {
    const { parts, params } = parseHash(); const v = $('#view'); const y = window.scrollY;
    const r = parts[0] || '';
    v.scrollTop = 0;
    if (r === '') viewHome(v);
    else if (r === 'browse') viewBrowse(v);
    else if (r === 'subject') viewSubject(v, parts[1]);
    else if (r === 'lecture') viewLecture(v, parts[1]);
    else if (r === 'unmapped') viewUnmapped(v);
    else if (r === 'papers') viewPapers(v);
    else if (r === 'paper') viewPaper(v, parts[1], params);
    else if (r === 'study') viewStudy(v);
    else if (r === 'quiz') viewQuiz(v, params);
    else if (r === 'saved') viewSaved(v);
    else if (r === 'trends') viewTrends(v, params);
    else viewHome(v);
    const key = location.hash || '#/';
    if (keepScroll) window.scrollTo(0, y); else if (!fwd && scrolls[key] !== undefined) window.scrollTo(0, scrolls[key]); else if (r !== 'paper' || !params.hl) window.scrollTo(0, 0);
    fwd = false; curHash = key;
  };
  const rerender = () => route(true);
  window.addEventListener('hashchange', () => { if (curHash) scrolls[curHash] = window.__lastY || 0; route(); });
  window.addEventListener('scroll', () => { window.__lastY = window.scrollY; }, { passive: true });

  /* ---------- boot ---------- */
  applyTheme();
  PF.go = (h) => { fwd = true; location.hash = h; };
  route();
})();
