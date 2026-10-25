/* PYQ Finder – core: data model, persistent state, search engine */
(function () {
  'use strict';
  const PF = (window.PF = {});
  const D = window.DATA;

  /* ---------- helpers ---------- */
  PF.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  PF.fmtMin = (m) => {
    const h = Math.floor(m / 60), mm = m % 60;
    return h ? (mm ? h + 'h ' + String(mm).padStart(2, '0') + 'm' : h + 'h') : mm + 'm';
  };
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
  const yearNum = (y) => { const m = /^(\d{4})/.exec(y || ''); return m ? +m[1] : 0; };
  PF.yearNum = yearNum;

  /* ---------- subjects ---------- */
  PF.VERSION = 'v7';
  PF.SM = {
    MED: { n: 'General Medicine', s: 'Medicine', c: '#ef4444', al: 'medicine internal medicine gen med physician' },
    SUR: { n: 'General Surgery', s: 'Surgery', c: '#0ea5e9', al: 'surgery' },
    OBG: { n: 'Obstetrics & Gynaecology', s: 'OBG', c: '#ec4899', al: 'obg obgy obstetrics gynaecology gynecology gynae obs' },
    PED: { n: 'Pediatrics', s: 'Paeds', c: '#f59e0b', al: 'pediatrics paediatrics paeds peds child' },
    ENT: { n: 'ENT', s: 'ENT', c: '#8b5cf6', al: 'ent ear nose throat otorhinolaryngology' },
    EYE: { n: 'Ophthalmology', s: 'Eye', c: '#14b8a6', al: 'ophthalmology ophthal eye' },
    DER: { n: 'Dermatology', s: 'Derm', c: '#f97316', al: 'dermatology derm skin' },
    PSY: { n: 'Psychiatry', s: 'Psych', c: '#6366f1', al: 'psychiatry psych' },
    ORT: { n: 'Orthopaedics', s: 'Ortho', c: '#84cc16', al: 'orthopaedics orthopedics ortho bone' },
    ANA: { n: 'Anaesthesiology', s: 'Anaes', c: '#06b6d4', al: 'anaesthesiology anesthesiology anaesthesia anesthesia' },
    RAD: { n: 'Radiology', s: 'Radio', c: '#64748b', al: 'radiology radio imaging' },
    PHA: { n: 'Pharmacology (no lecture)', s: 'Pharma', c: '#a855f7', al: 'pharmacology pharma' },
  };
  PF.SUBJ = D.subjects.map((s) => s.c);

  /* ---------- index the data ---------- */
  const lecs = D.lectures;
  const lecById = {};
  lecs.forEach((l, i) => { l.i = i; l.q = []; lecById[l.id] = l; });
  const papers = D.papers;
  const paperById = {};
  papers.forEach((p) => { paperById[p.id] = p; p.qs = []; p.subj = new Set(); p.yn = yearNum(p.y); });
  const qByKey = {};
  D.questions.forEach((q) => {
    q.occ = q.o.map(([p, ref]) => ({ p, ref, y: paperById[p].y, yn: paperById[p].yn }));
    q.n = q.occ.length;
    q.ymax = Math.max(...q.occ.map((o) => o.yn));
    q.L = q.l.map(([li, rel]) => ({ l: lecs[li], rel }));
    q.allRel = q.L.length > 0 && q.L.every((x) => x.rel);
    let k = hash(q.t.toLowerCase().replace(/\W/g, '') + '|' + q.o[q.o.length - 1].join(':')); /* stable when newer papers are added */
    while (qByKey[k]) k += 'x';
    q.k = k; qByKey[k] = q;
    q.L.forEach((x) => x.l.q.push({ q, rel: x.rel }));
    q.occ.forEach((o) => { const p = paperById[o.p]; p.qs.push({ q, ref: o.ref }); q.L.forEach((x) => p.subj.add(x.l.s)); if (!q.L.length && q.u) p.subj.add(q.u); });
  });
  lecs.forEach((l) => {
    l.pq = l.q.length;
    l.asks = l.q.reduce((a, x) => a + x.q.n, 0);
    l.exact = l.q.filter((x) => !x.rel).length;
    l.yield = l.pq / (l.m / 60);
  });
  PF.lecs = lecs; PF.lecById = lecById; PF.papers = papers; PF.paperById = paperById; PF.qs = D.questions; PF.qByKey = qByKey;
  PF.unmapped = D.questions.filter((q) => !q.L.length);
  PF.subjStats = {};
  PF.SUBJ.forEach((c) => {
    const L = lecs.filter((l) => l.s === c);
    PF.subjStats[c] = { n: L.length, m: L.reduce((a, l) => a + l.m, 0), wp: L.filter((l) => l.pq).length, pq: L.reduce((a, l) => a + l.pq, 0), L };
  });
  PF.totalMin = lecs.reduce((a, l) => a + l.m, 0);
  const natKey = (ref) => {
    const m = /^Q?(\d+)?\(?([A-Za-z]+|\d+)?\)?/.exec(ref) || [];
    const rom = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8 };
    const sub = (m[2] || '').toLowerCase();
    return (+m[1] || 0) * 1000 + (rom[sub] && /^[ivx]+$/.test(sub) && sub.length > 1 ? rom[sub] : sub ? sub.charCodeAt(0) - 96 : 0);
  };
  papers.forEach((p) => p.qs.sort((a, b) => natKey(a.ref) - natKey(b.ref)));
  papers.sort((a, b) => b.yn - a.yn || (a.id < b.id ? -1 : 1));
  PF.natKey = natKey;

  /* ---------- persistent state ---------- */
  const KEY = 'pyqfinder.v1';
  const def = () => ({
    rev: {}, exam: '', pins: [],
    watched: {}, starL: {}, starQ: {}, doneQ: {}, noteL: {}, noteQ: {},
    recent: [], recentS: [],
    settings: { theme: 'system', size: 'm' },
    filters: { subj: [], src: '', yFrom: 0, yTo: 0, type: '', minN: 1, hideRel: false, status: '' },
    plan: { hours: 4, days: 0, order: 'yield', onlyPYQ: true, subj: [], mode: 'mix', seed: 0 },
  });
  let st = def();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    Object.keys(st).forEach((k) => { if (saved[k] !== undefined) st[k] = typeof st[k] === 'object' && !Array.isArray(st[k]) ? Object.assign(st[k], saved[k]) : saved[k]; });
  } catch (e) { /* ignore */ }
  PF.st = st;
  /* ---------- spaced revision + exam countdown ---------- */
  PF.INT = [1, 3, 7, 21];
  PF.examDays = () => { if (!st.exam) return 0; const d = new Date(st.exam + 'T00:00:00'); return Math.ceil((d - new Date().setHours(0, 0, 0, 0)) / 864e5); };
  PF.dueTs = (days) => {
    let t = Date.now() + days * 864e5;
    if (PF.examDays() > 1) { const cap = new Date(st.exam + 'T00:00:00').getTime() - 864e5; t = Math.min(t, Math.max(cap, Date.now())); }
    return t;
  };
  PF.revDone = (k) => { st.doneQ[k] = Date.now(); st.rev[k] = { s: 0, due: PF.dueTs(PF.INT[0]) }; };
  PF.revUndo = (k) => { delete st.doneQ[k]; delete st.rev[k]; };
  PF.revGrade = (k, ok) => {
    const r = st.rev[k] || { s: 0 };
    if (!ok) { st.rev[k] = { s: 0, due: PF.dueTs(1) }; return; }
    const s = r.s + 1;
    st.rev[k] = s >= PF.INT.length ? { s, due: 0, mastered: 1 } : { s, due: PF.dueTs(PF.INT[s]) };
  };
  PF.dueList = () => { const end = new Date().setHours(23, 59, 59, 999); return PF.qs.filter((q) => { const r = st.rev[q.k]; return r && r.due && r.due <= end; }); };
  PF.revStats = () => {
    const end = new Date().setHours(23, 59, 59, 999); let due = 0, week = 0, mastered = 0, learning = 0;
    Object.values(st.rev).forEach((r) => { if (r.mastered) mastered++; else if (r.due) { learning++; if (r.due <= end) due++; else if (r.due <= end + 7 * 864e5) week++; } });
    return { due, week, mastered, learning };
  };
  PF.save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignore */ } };
  PF.resetState = () => { const d = def(); Object.keys(d).forEach((k) => (st[k] = d[k])); PF.save(); };
  PF.exportState = () => JSON.stringify({ app: 'pyqfinder', v: 1, data: st });
  PF.importState = (txt) => {
    const o = JSON.parse(txt);
    if (!o || o.app !== 'pyqfinder' || !o.data) throw new Error('Not a PYQ Finder backup');
    const d = def();
    Object.keys(d).forEach((k) => { st[k] = o.data[k] !== undefined ? o.data[k] : d[k]; });
    PF.save();
  };

  /* ---------- study queue: connected lectures (same section, in course order) ---------- */
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  PF.buildQueue = (P) => {
    const sel = P.subj.length ? P.subj : PF.SUBJ;
    const daily = Math.max(30, P.hours * 60);
    const day = Math.floor(Date.now() / 864e5);
    const seqOf = (c) => {
      const L = PF.subjStats[c].L.filter((l) => !st.watched[l.id] && (!P.onlyPYQ || l.pq));
      const secs = new Map(); L.forEach((l) => { if (!secs.has(l.sec)) secs.set(l.sec, []); secs.get(l.sec).push(l); });
      const arr = [...secs.values()];
      if (P.mode === 'rand') {
        const rnd = mulberry(parseInt(hash(c + '|' + day + '|' + P.seed), 36) || 1);
        for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      } else if (P.order === 'yield') {
        const tot = (a) => a.reduce((x, l) => x + l.pq, 0);
        arr.sort((a, b) => tot(b) - tot(a) || a[0].i - b[0].i);
      }
      return arr.flat();   /* when a section runs out, the next section continues */
    };
    let seqs = sel.map((c) => ({ c, q: seqOf(c), pos: 0, taken: [] }));
    if (P.mode !== 'seq' && seqs.length > 1) { const r = day % seqs.length; seqs = seqs.slice(r).concat(seqs.slice(0, r)); }
    let acc = 0;
    const take = (s, budget) => {
      let used = 0;
      while (s.pos < s.q.length) {
        const l = s.q[s.pos];
        if (used > 0 && used + l.m > budget * 1.25) break;
        if (acc + used + l.m > daily * 1.2 && acc + used > 0) break;
        s.taken.push(l); s.pos++; used += l.m;
        if (used >= budget) break;
      }
      return used;
    };
    if (P.mode === 'seq') { seqs.forEach((s) => { if (acc < daily * 0.95) acc += take(s, daily - acc); }); }
    else {
      const quota = daily / seqs.length;
      seqs.forEach((s) => { acc += take(s, quota); });
      let added = true;
      while (added && acc < daily * 0.9) {
        added = false;
        for (const s of seqs) { const l = s.q[s.pos]; if (l && acc + l.m <= daily * 1.15) { s.taken.push(l); s.pos++; acc += l.m; added = true; } if (acc >= daily * 0.9) break; }
      }
    }
    if (P.mode !== 'seq') seqs.sort((a, b) => sel.indexOf(a.c) - sel.indexOf(b.c));
    return { list: seqs.flatMap((s) => s.taken), acc };
  };
  /* ---------- filters ---------- */
  PF.activeFilterCount = (F) => (F.subj.length ? 1 : 0) + (F.src ? 1 : 0) + (F.yFrom || F.yTo ? 1 : 0) + (F.type ? 1 : 0) + (F.minN > 1 ? 1 : 0) + (F.hideRel ? 1 : 0) + (F.status ? 1 : 0);
  const qLevel = (F) => !!(F.src || F.yFrom || F.yTo || F.type || F.minN > 1 || F.hideRel);
  PF.passQ = (q, F) => {
    if (F.subj.length && !(q.L.length ? q.L.some((x) => F.subj.includes(x.l.s)) : F.subj.includes(q.u))) return false;
    if (F.src && !q.occ.some((o) => paperById[o.p].g === F.src)) return false;
    if (F.yFrom || F.yTo) { if (!q.occ.some((o) => o.yn && o.yn >= (F.yFrom || 0) && o.yn <= (F.yTo || 9999))) return false; }
    if (F.type && q.ty !== F.type) return false;
    if (F.minN > 1 && q.n < F.minN) return false;
    if (F.hideRel && q.allRel) return false;
    if (F.status === 'unwatched' && q.L.length && q.L.every((x) => st.watched[x.l.id])) return false;
    if (F.status === 'starred' && !st.starQ[q.k]) return false;
    return true;
  };
  PF.passL = (l, F) => {
    if (F.subj.length && !F.subj.includes(l.s)) return false;
    if (F.status === 'unwatched' && st.watched[l.id]) return false;
    if (F.status === 'starred' && !st.starL[l.id]) return false;
    if (qLevel(F) && !l.q.some((x) => PF.passQ(x.q, Object.assign({}, F, { status: '', subj: [] })))) return false;
    return true;
  };
  PF.passP = (p, F) => {
    if (F.src && p.g !== F.src) return false;
    if (F.subj.length && !F.subj.some((s) => p.subj.has(s))) return false;
    if ((F.yFrom || F.yTo) && !(p.yn && p.yn >= (F.yFrom || 0) && p.yn <= (F.yTo || 9999))) return false;
    return true;
  };

  /* ---------- search engine ---------- */
  const ABBR = {
    mi: ['myocardial infarction'], ami: ['acute myocardial infarction'], dm: ['diabetes mellitus'], dka: ['diabetic ketoacidosis'], gdm: ['gestational diabetes mellitus'],
    tb: ['tuberculosis'], mdr: ['multidrug resistant'], ptb: ['pulmonary tuberculosis'], ccf: ['congestive cardiac failure'], chf: ['congestive heart failure'], htn: ['hypertension'],
    pih: ['pregnancy induced hypertension'], pph: ['postpartum hemorrhage'], aph: ['antepartum hemorrhage'], aub: ['abnormal uterine bleeding'],
    ckd: ['chronic kidney disease'], aki: ['acute kidney injury'], crf: ['chronic renal failure'], arf: ['acute renal failure', 'acute rheumatic fever'],
    copd: ['chronic obstructive pulmonary disease'], gerd: ['gastroesophageal reflux disease'], pud: ['peptic ulcer disease'], ards: ['acute respiratory distress syndrome'],
    sle: ['systemic lupus erythematosus'], ra: ['rheumatoid arthritis'], oa: ['osteoarthritis'], ibd: ['inflammatory bowel disease'], ibs: ['irritable bowel syndrome'],
    uti: ['urinary tract infection'], hiv: ['human immunodeficiency virus'], dvt: ['deep vein thrombosis'], pte: ['pulmonary thromboembolism'], pe: ['pulmonary embolism'],
    ihd: ['ischemic heart disease'], acs: ['acute coronary syndrome'], ecg: ['electrocardiogram'], usg: ['ultrasonography'], ct: ['computed tomography'], mri: ['magnetic resonance imaging'],
    ercp: ['endoscopic retrograde cholangiopancreatography'], pcnl: ['percutaneous nephrolithotomy'], urs: ['ureteroscopy'], turp: ['transurethral resection prostate'],
    bph: ['benign prostatic hyperplasia'], pcos: ['polycystic ovarian syndrome'], pcod: ['polycystic ovarian disease'], iucd: ['intrauterine contraceptive device'], ocp: ['oral contraceptive pills'],
    mtp: ['medical termination pregnancy'], gtn: ['gestational trophoblastic neoplasia'], iugr: ['intrauterine growth restriction'], fgr: ['fetal growth restriction'],
    prom: ['premature rupture membranes'], pprom: ['preterm premature rupture membranes'], rds: ['respiratory distress syndrome'], nec: ['necrotising enterocolitis'],
    hie: ['hypoxic ischemic encephalopathy'], pda: ['patent ductus arteriosus'], vsd: ['ventricular septal defect'], asd: ['atrial septal defect'], tof: ['tetralogy of fallot'],
    rhd: ['rheumatic heart disease'], ie: ['infective endocarditis'], tia: ['transient ischemic attack'], cva: ['cerebrovascular accident'], sah: ['subarachnoid hemorrhage'],
    csf: ['cerebrospinal fluid'], icp: ['intracranial pressure'], mnd: ['motor neuron disease'], als: ['amyotrophic lateral sclerosis'], gbs: ['guillain barre syndrome'],
    ocd: ['obsessive compulsive disorder'], ptsd: ['post traumatic stress disorder'], ect: ['electroconvulsive therapy'], cll: ['chronic lymphocytic leukemia'],
    cml: ['chronic myeloid leukemia'], aml: ['acute myeloid leukemia'], itp: ['idiopathic thrombocytopenic purpura'], ttp: ['thrombotic thrombocytopenic purpura'],
    hus: ['hemolytic uremic syndrome'], dic: ['disseminated intravascular coagulation'], sdh: ['subdural hematoma'], edh: ['extradural hematoma'], fnac: ['fine needle aspiration cytology'],
    af: ['atrial fibrillation'], svt: ['supraventricular tachycardia'], lvf: ['left ventricular failure'], mvp: ['mitral valve prolapse'], mr: ['mitral regurgitation'], ar: ['aortic regurgitation'],
    ivf: ['in vitro fertilization'], ohss: ['ovarian hyperstimulation syndrome'], cin: ['cervical intraepithelial neoplasia'], amtsl: ['active management third stage labour'],
    lscs: ['lower segment caesarean section'], vbac: ['vaginal birth after caesarean'], dpt: ['diphtheria pertussis tetanus'], ors: ['oral rehydration solution'],
    sam: ['severe acute malnutrition'], pem: ['protein energy malnutrition'], dmd: ['duchenne muscular dystrophy'], cp: ['cerebral palsy'], ddh: ['developmental dysplasia hip'],
    ctev: ['congenital talipes equinovarus club foot'], poag: ['primary open angle glaucoma'], pacg: ['primary angle closure glaucoma'], hrt: ['hormone replacement therapy'],
    nsaid: ['nonsteroidal anti inflammatory drugs'], hsv: ['herpes simplex virus'], cmv: ['cytomegalovirus'], pcv: ['pneumococcal conjugate vaccine'], bcg: ['bacillus calmette guerin'],
    tkr: ['total knee replacement'], thr: ['total hip replacement'], wpw: ['wolff parkinson white'], pft: ['pulmonary function test'], abg: ['arterial blood gas'],
    peg: ['percutaneous endoscopic gastrostomy'], lap: ['laparoscopic'], cabg: ['coronary artery bypass graft'], tpn: ['total parenteral nutrition'], ca: ['carcinoma cancer'],
    gallstone: ['gallbladder', 'cholelithiasis'], gallstones: ['gallbladder', 'cholelithiasis'], cholelithiasis: ['gallstone', 'gallbladder'], cholecystitis: ['gallbladder'], choledocholithiasis: ['bile duct'],
    urolithiasis: ['kidney stone', 'renal calculi'], calculi: ['stone'], calculus: ['stone'], hepatitis: ['liver'], jaundice: ['hyperbilirubinemia'], goitre: ['thyroid'], goiter: ['thyroid'],
    ulcer: ['peptic ulcer'], cataract: ['lens'], squint: ['strabismus'], strabismus: ['squint'],
    'ob': ['obstetrics'], 'gyn': ['gynaecology'], 'gyne': ['gynaecology'], 'peds': ['pediatrics paediatrics'], 'paeds': ['pediatrics paediatrics'],
  };
  const STOP = new Set('the of and in for to a an with on its is are or by at from as be how what write short notes note about'.split(' '));
  /* UK/US spelling variants (anaemia/anemia, oedema/edema, paediatric/pediatric, labour/labor, necrotising/necrotizing...) */
  const spell = (t) => t.replace(/ae/g, 'e').replace(/oe/g, 'e').replace(/(isation|ising|ised)\b/g, (m) => 'iz' + m.slice(2)).replace(/(\w)our\b/g, '$1or').replace(/tre\b/g, 'ter').replace(/sulph/g, 'sulf');
  PF.spell = spell;
  const norm = (s) => spell(s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')).replace(/p-(\d{3})\b/g, 'p$1').replace(/[^a-z0-9]+/g, ' ').trim();
  PF.norm = norm;
  const stem = (t) => {
    if (t.length > 4) {
      if (t.endsWith('ies')) return t.slice(0, -3) + 'y';
      if (/(ch|sh|x|ss)es$/.test(t)) return t.slice(0, -2);
      if (t.endsWith('s') && !/(ss|us|is)$/.test(t)) return t.slice(0, -1);
    }
    return t;
  };
  PF.stem = stem;
  const rawTokens = (text) => {
    const out = norm(text).split(' ').filter(Boolean);
    const j = spell(text.toLowerCase()).match(/[a-z]+-[a-z]+/g);
    if (j) j.forEach((w) => out.push(w.replace('-', '')));
    return out;
  };
  const vocab = new Set();
  const tokSet = (text, extra) => {
    const s = new Set();
    const rt = rawTokens(text);
    for (let i = 0; i + 1 < rt.length; i++) { if (rt[i].length + rt[i + 1].length <= 16) s.add(stem(rt[i] + rt[i + 1])); }
    rt.forEach((t) => {
      s.add(stem(t));
      if (ABBR[t]) ABBR[t].forEach((e) => norm(e).split(' ').forEach((x) => s.add(stem(x))));
    });
    if (extra) extra.forEach((t) => s.add(t));
    s.forEach((t) => vocab.add(t));
    return s;
  };
  const docs = { lec: [], q: [], p: [] };
  lecs.forEach((l) => {
    const sm = PF.SM[l.s];
    docs.lec.push({
      o: l, text: norm(l.t),
      f: [
        { w: 6, set: tokSet(l.t) },
        { w: 3, set: tokSet(l.sec) },
        { w: 1.5, set: tokSet(sm.n + ' ' + sm.s + ' ' + sm.al + ' lecture video prepladder', ['l' + l.n]) },
        { w: 1, set: tokSet(l.q.map((x) => x.q.t).join(' ')) },
      ],
    });
  });
  PF.qs.forEach((q) => {
    const lt = q.L.map((x) => x.l.t).join(' ');
    const sec = q.L.map((x) => x.l.sec + ' ' + PF.SM[x.l.s].n + ' ' + PF.SM[x.l.s].al).join(' ') + (q.u ? ' unmapped no lecture ' + PF.SM[q.u].n : '');
    const meta = q.occ.map((o) => o.y + ' ' + o.p + ' ' + o.ref).join(' ') + (q.ty === 'L' ? ' essay long' : ' short note');
    docs.q.push({ o: q, text: norm(q.t), f: [{ w: 6, set: tokSet(q.t) }, { w: 3, set: tokSet(lt) }, { w: 2, set: tokSet(sec) }, { w: 1, set: tokSet(meta) }] });
  });
  papers.forEach((p) => {
    docs.p.push({
      o: p, text: norm(p.title + ' ' + p.exam),
      f: [
        { w: 8, set: tokSet(p.id, [p.id.toLowerCase().replace('-', ''), p.id.slice(2)]) },
        { w: 6, set: tokSet(p.y + ' paper year') },
        { w: 3, set: tokSet(p.title + ' ' + p.exam + ' ' + p.g + ' ' + p.note) },
        { w: 1, set: tokSet(p.qs.map((x) => x.q.t).join(' ')) },
      ],
    });
  });
  const vocabArr = Array.from(vocab);
  const lev = (a, b, max) => {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i]; let mn = i;
      for (let j = 1; j <= b.length; j++) {
        const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        cur.push(v); if (v < mn) mn = v;
      }
      if (mn > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  };
  const resolve = (t) => {
    const out = new Set();
    if (vocab.has(t)) out.add(t);
    if (t.length >= 3) for (const v of vocabArr) if (v.length > t.length && v.startsWith(t)) out.add(v);
    if (!out.size && t.length >= 4) {
      const max = t.length <= 5 ? 1 : 2;
      for (const v of vocabArr) if (lev(t, v, max) <= max) out.add(v);
    }
    return out;
  };
  const hasAny = (set, rs) => { for (const x of rs) if (set.has(x)) return true; return false; };

  PF.parseQuery = (qs) => {
    let toks = rawTokens(qs);
    const nonStop = toks.filter((t) => !STOP.has(t));
    if (nonStop.length) toks = nonStop;
    toks = Array.from(new Set(toks));
    const joinedAlt = toks.map((t, i) => (toks[i + 1] && vocab.has(stem(t + toks[i + 1])) ? stem(t + toks[i + 1]) : null));
    const groups = toks.map((t, gi) => {
      const alts = [[resolve(stem(t))]];
      if (ABBR[t]) ABBR[t].forEach((e) => alts.push(norm(e).split(' ').filter((x) => x && !STOP.has(x)).map((x) => resolve(stem(x)))));
      const j = joinedAlt[gi] || (gi > 0 ? joinedAlt[gi - 1] : null);
      if (j) alts.push([new Set([j])]);
      const jr = toks[gi + 1] ? toks[gi] + toks[gi + 1] : null, jr2 = gi > 0 ? toks[gi - 1] + toks[gi] : null;
      [jr, jr2].forEach((x) => { if (x && ABBR[x]) ABBR[x].forEach((e) => alts.push(norm(e).split(' ').filter((w) => w && !STOP.has(w)).map((w) => resolve(stem(w))))); });
      return { t, alts: alts.filter((a) => a.every((s) => s.size)) };
    });
    return groups;
  };
  const scoreDoc = (doc, groups) => {
    let total = 0, matched = 0, best = 0;
    for (const g of groups) {
      let gb = 0;
      for (const f of doc.f) {
        if (f.w <= gb) continue;
        for (const alt of g.alts) if (alt.every((rs) => hasAny(f.set, rs))) { gb = f.w; break; }
      }
      if (gb) { matched++; total += gb; if (gb > best) best = gb; }
    }
    return { total, matched, best };
  };
  const SUBJ_ALIAS = Object.keys(PF.SM).map((c) => ({ c, al: norm(PF.SM[c].al + ' ' + PF.SM[c].n + ' ' + PF.SM[c].s).split(' ') }));

  PF.search = (query, F) => {
    const groups = PF.parseQuery(query).filter((g) => g.alts.length || true);
    if (!groups.length) return null;
    const live = groups.filter((g) => g.alts.length);
    const res = { lec: [], q: [], p: [], relaxed: false, hl: new Set(), subj: [], missing: groups.filter((g) => !g.alts.length).map((g) => g.t) };
    live.forEach((g) => g.alts.forEach((a) => a.forEach((rs) => rs.forEach((x) => res.hl.add(x)))));
    const nq = norm(query);
    const nqs = nq.replace(/\s+/g, ' ');
    const run = (kind, pass, bonus) => {
      const strict = [], loose = [];
      for (const d of docs[kind]) {
        if (!pass(d.o)) continue;
        const s = scoreDoc(d, live);
        if (!s.matched) continue;
        let sc = s.total + (nqs.length > 2 && d.text.includes(nqs) ? 5 : 0) + bonus(d.o);
        const r = { o: d.o, score: sc, via: s.best < 3, m: s.matched };
        (s.matched === live.length ? strict : loose).push(r);
      }
      return { strict, loose };
    };
    const lr = run('lec', (l) => PF.passL(l, F), (l) => Math.min(l.pq, 20) * 0.08);
    const qr = run('q', (q) => PF.passQ(q, F), (q) => Math.min(q.n, 6) * 0.25);
    const pr = run('p', (p) => PF.passP(p, F), () => 0);
    if (!live.length) return res;
    if (lr.strict.length + qr.strict.length + pr.strict.length === 0 && live.length > 1) {
      res.relaxed = true;
      const f = (r) => r.loose.sort((a, b) => b.m - a.m || b.score - a.score);
      res.lec = f(lr); res.q = f(qr); res.p = f(pr);
    } else {
      const f = (r) => r.strict.sort((a, b) => b.score - a.score);
      res.lec = f(lr); res.q = f(qr); res.p = f(pr);
    }
    const nt = nq.split(' ').filter(Boolean);
    if (nt.length && nt.length <= 3) {
      SUBJ_ALIAS.forEach((s) => { if (nt.every((t) => t.length >= 3 && s.al.some((a) => a.startsWith(t)))) res.subj.push(s.c); });
      if (nt.length === 1 && nt[0].length >= 3) { /* single-token alias already handled */ }
    }
    return res;
  };
  /* browse with filters only (no query) */
  PF.browseAll = (F) => ({
    lec: lecs.filter((l) => l.pq && PF.passL(l, F)).sort((a, b) => b.pq - a.pq || b.yield - a.yield).map((o) => ({ o, score: 0 })),
    q: PF.qs.filter((q) => PF.passQ(q, F)).sort((a, b) => b.n - a.n || b.ymax - a.ymax).map((o) => ({ o, score: 0 })),
    p: papers.filter((p) => PF.passP(p, F)).map((o) => ({ o, score: 0 })),
    relaxed: false, hl: new Set(), subj: [], missing: [],
  });
})();
