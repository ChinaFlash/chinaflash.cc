/*
 * ChinaFlash · chinaflash.cc
 * - Temas como en la app: «Automático» (papel de día, tinta de noche) o uno fijo, guardado en este navegador.
 * - Adorno de cabecera propio de cada tema (sello, montañas, luna, farolillos, olas).
 * - Tarjeta de prueba de la portada: se gira, suena y se desliza como en la app.
 */
(() => {
  const root = document.documentElement;
  const EN = root.lang === 'en';
  const t = (es, en) => (EN ? en : es);

  // ---------- Temas ----------
  const THEMES = [
    { id: 'papel', seal: '纸', name: t('Papel de arroz', 'Rice paper'), desc: t('Claro y sereno, con rojo cinabrio.', 'Light and calm, with cinnabar red.') },
    { id: 'tinta', seal: '墨', name: t('Tinta', 'Ink'), desc: t('Modo oscuro: tinta china y montañas.', 'Dark mode: Chinese ink and mountains.') },
    { id: 'otono', seal: '月', name: t('Medio Otoño', 'Mid-Autumn'), desc: t('中秋节: luna llena, farolillos y pasteles de luna.', '中秋节: full moon, lanterns and mooncakes.') },
    { id: 'chunjie', seal: '福', name: t('Año Nuevo', 'Lunar New Year'), desc: t('春节: rojo y oro, farolillos y buena suerte.', '春节: red and gold, lanterns and good luck.') },
    { id: 'porcelana', seal: '瓷', name: t('Porcelana', 'Porcelain'), desc: t('青花瓷: azul cobalto sobre porcelana blanca.', '青花瓷: cobalt blue on white porcelain.') },
  ];
  const AUTO = { id: 'auto', name: t('Automático', 'Automatic'), desc: t('Papel de día, tinta de noche (según tu dispositivo).', 'Rice paper by day, ink at night (follows your device).') };
  const KEY = 'cf-theme';
  const darkMq = matchMedia('(prefers-color-scheme: dark)');

  const readPref = () => {
    try {
      const v = localStorage.getItem(KEY);
      return v === 'auto' || THEMES.some((th) => th.id === v) ? v : 'auto';
    } catch {
      return 'auto';
    }
  };

  function apply(pref) {
    const id = pref === 'auto' ? (darkMq.matches ? 'tinta' : 'papel') : pref;
    root.dataset.pref = pref;
    root.dataset.theme = id;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim();
    document.querySelectorAll('[data-pick]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.pick === pref)));
    const cur = document.querySelector('.theme-btn .theme-cur');
    if (cur) cur.textContent = (THEMES.find((th) => th.id === id) || THEMES[0]).seal;
  }

  function choose(pref) {
    try {
      localStorage.setItem(KEY, pref);
    } catch {}
    root.classList.add('theming');
    apply(pref);
    setTimeout(() => root.classList.remove('theming'), 450);
  }

  darkMq.addEventListener('change', () => readPref() === 'auto' && apply('auto'));

  const swatch = (th) =>
    th.id === 'auto'
      ? `<span class="sw sw-auto" aria-hidden="true"><span data-theme="papel"></span><span data-theme="tinta"></span></span>`
      : `<span class="sw" data-theme="${th.id}" aria-hidden="true"><span class="sw-seal brush">${th.seal}</span></span>`;

  // Menú de temas de la cabecera
  const slot = document.querySelector('[data-theme-menu]');
  if (slot) {
    const label = t('Tema', 'Theme');
    slot.innerHTML = `
      <button class="theme-btn" type="button" aria-haspopup="true" aria-expanded="false" aria-label="${label}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.4-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8h2.1A4.3 4.3 0 0 0 21 10.7C21 6.4 17 3 12 3Z"/><circle cx="7.5" cy="11.5" r="1.3"/><circle cx="10" cy="7.5" r="1.3"/><circle cx="14.5" cy="7.5" r="1.3"/></svg>
        <span class="theme-cur brush" aria-hidden="true"></span>
      </button>
      <div class="theme-pop" role="menu" aria-label="${label}" hidden>
        <p class="pop-title">${label}</p>
        ${[AUTO, ...THEMES]
          .map(
            (th) => `<button type="button" role="menuitemradio" data-pick="${th.id}" aria-checked="false">
              ${swatch(th)}<span class="pop-txt"><b>${th.name}</b><small>${th.desc}</small></span>
              <svg class="tick" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
            </button>`,
          )
          .join('')}
      </div>`;
    const btn = slot.querySelector('.theme-btn');
    const pop = slot.querySelector('.theme-pop');
    const open = (v) => {
      pop.hidden = !v;
      btn.setAttribute('aria-expanded', String(v));
      if (v) pop.querySelector('[aria-checked="true"]')?.focus();
    };
    btn.addEventListener('click', () => open(pop.hidden));
    pop.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (b) {
        choose(b.dataset.pick);
        open(false);
        btn.focus();
      }
    });
    document.addEventListener('click', (e) => !slot.contains(e.target) && open(false));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !pop.hidden) {
        open(false);
        btn.focus();
      }
    });
  }

  // Muestrario de temas de la portada
  const tiles = document.querySelector('[data-theme-tiles]');
  if (tiles) {
    tiles.innerHTML = [AUTO, ...THEMES]
      .map((th) => {
        const prev =
          th.id === 'auto'
            ? `<span class="tile-prev tile-auto" aria-hidden="true"><span data-theme="papel"><span class="mini-card"><span class="zh">日</span></span></span><span data-theme="tinta"><span class="mini-card"><span class="zh">夜</span></span></span></span>`
            : `<span class="tile-prev" data-theme="${th.id}" aria-hidden="true"><span class="mini-card"><span class="zh">${th.seal}</span></span><span class="sw-seal brush">${th.seal}</span></span>`;
        return `<button type="button" class="tile" data-pick="${th.id}" role="radio" aria-checked="false">${prev}<b>${th.name}</b><small>${th.desc}</small></button>`;
      })
      .join('');
    tiles.setAttribute('role', 'radiogroup');
    tiles.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]');
      if (b) choose(b.dataset.pick);
    });
  }

  // ---------- Adornos de cada tema (versión web de src/components/art/Ornaments.tsx) ----------
  const lantern = (x, y, r, cord) => {
    const h = r * 1.5;
    const top = y - h / 2;
    const bot = y + h / 2;
    const ribs = [-0.5, 0, 0.5]
      .map((k) => `<path class="o-gold-line" d="M${x + k * r * 0.9} ${top} Q${x + k * r * 1.9} ${y} ${x + k * r * 0.9} ${bot}"/>`)
      .join('');
    return `<g>
      <line class="o-cord" x1="${x}" y1="0" x2="${x}" y2="${top - 4}"/>
      <rect class="o-gold" x="${x - r * 0.45}" y="${top - 5}" width="${r * 0.9}" height="${r * 0.5}" rx="2"/>
      <path class="o-accent" d="M${x - r * 0.45} ${top} C${x - r * 1.25} ${top} ${x - r * 1.25} ${bot} ${x - r * 0.45} ${bot} H${x + r * 0.45} C${x + r * 1.25} ${bot} ${x + r * 1.25} ${top} ${x + r * 0.45} ${top} Z"/>
      ${ribs}
      <rect class="o-gold" x="${x - r * 0.45}" y="${bot - 1}" width="${r * 0.9}" height="${r * 0.5}" rx="2"/>
      <line class="o-tassel" x1="${x}" y1="${bot + 5}" x2="${x}" y2="${bot + cord}"/>
      <path class="o-accent" d="M${x - r * 0.3} ${bot + cord} L${x} ${bot + cord - r * 0.3} L${x + r * 0.3} ${bot + cord} L${x + r * 0.15} ${bot + cord + r} H${x - r * 0.15} Z"/>
    </g>`;
  };
  const cloud = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path class="o-cloud" d="M0 20 C0 10 12 6 18 12 C20 2 36 0 40 10 C46 4 60 8 58 18 C66 18 68 28 60 30 H4 C-2 30 -3 22 0 20 Z"/><path class="o-cloud-line" d="M18 12 C16 18 24 20 25 15 C26 11 21 10 20 13"/><path class="o-cloud-line" d="M40 10 C38 17 47 19 48 14"/></g>`;

  const W = 640;
  const H = 360;
  const waves = [];
  for (let row = 0; row < 4; row++)
    for (let i = 0; i < W / 56 + 2; i++) {
      const cx = i * 56 - (row % 2) * 28;
      const cy = 60 + row * 28;
      for (const r of [26, 18, 10]) waves.push(`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`);
    }
  const stars = [[40, 60], [110, 30], [190, 80], [260, 40], [80, 130], [230, 20], [330, 70]];

  const ORNAMENTS = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMin slice" aria-hidden="true" focusable="false">
      <defs><radialGradient id="o-glow"><stop offset="0" class="o-glow-in"/><stop offset="1" class="o-glow-out"/></radialGradient></defs>
      <g class="orn orn-seal"><text class="o-big brush" x="${W - 150}" y="300" text-anchor="middle">学</text></g>
      <g class="orn orn-mountains">
        <circle class="o-sun" cx="${W - 70}" cy="86" r="30"/>
        <path class="o-m1" d="M0 ${H} L0 210 C70 170 120 140 190 170 C240 110 300 100 360 150 C430 120 520 80 ${W} 160 V${H} Z"/>
        <path class="o-m2" d="M0 ${H} L0 250 C85 200 150 210 220 235 C290 170 370 165 440 210 C510 185 580 195 ${W} 225 V${H} Z"/>
        <path class="o-m3" d="M0 ${H} L0 290 C100 262 190 278 270 284 C370 245 470 262 ${W} 282 V${H} Z"/>
      </g>
      <g class="orn orn-moon">
        <circle cx="${W - 120}" cy="100" r="170" fill="url(#o-glow)"/>
        <circle class="o-moon" cx="${W - 120}" cy="100" r="70"/>
        <circle class="o-crater" cx="${W - 142}" cy="80" r="11"/><circle class="o-crater" cx="${W - 100}" cy="122" r="16"/><circle class="o-crater" cx="${W - 94}" cy="72" r="6"/>
        ${cloud(W - 300, 118, 1.6)}${cloud(W - 110, 150, 1)}
        ${stars.map(([x, y], i) => `<circle class="o-star" cx="${x}" cy="${y}" r="${i % 2 ? 1.6 : 2.4}"/>`).join('')}
        ${lantern(150, 70, 18, 16)}
      </g>
      <g class="orn orn-lanterns">
        <text class="o-big brush" x="${W - 110}" y="290" text-anchor="middle">福</text>
        ${lantern(W - 84, 70, 20, 18)}${lantern(W - 32, 104, 15, 14)}
      </g>
      <g class="orn orn-waves"><path class="o-wave" d="${waves.join(' ')}"/></g>
    </svg>`;
  document.querySelectorAll('[data-ornament]').forEach((el) => (el.innerHTML = ORNAMENTS));

  apply(readPref());

  // ---------- Tarjeta de prueba ----------
  const demo = document.querySelector('[data-demo]');
  if (!demo) return;
  const WORDS = [
    { h: '谢谢', p: 'xièxie', m: t('gracias', 'thank you'), a: '8c22-8c22' },
    { h: '吃', p: 'chī', m: t('comer', 'to eat'), a: '5403' },
    { h: '茶', p: 'chá', m: t('té', 'tea'), a: '8336' },
    { h: '猫', p: 'māo', m: t('gato', 'cat'), a: '732b' },
    { h: '学生', p: 'xuésheng', m: t('estudiante', 'student'), a: '5b66-751f' },
  ];
  const $ = (s) => demo.querySelector(s);
  const card = $('.flash');
  const bar = $('.bar i');
  const left = $('.left b');
  const again = $('.again b');
  const ok = $('.ok b');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let i = 0;
  let nAgain = 0;
  let nOk = 0;
  let flipped = false;
  let busy = false;
  let audio;

  const say = () => {
    try {
      audio?.pause();
      audio = new Audio(`/audio/${WORDS[i].a}.mp3`);
      audio.play().catch(() => {});
    } catch {}
  };

  function render() {
    const w = WORDS[i];
    demo.classList.toggle('done', i >= WORDS.length);
    bar.style.width = `${(i / WORDS.length) * 100}%`;
    left.textContent = String(WORDS.length - i);
    again.textContent = String(nAgain);
    ok.textContent = String(nOk);
    if (!w) return;
    $('.front .py').textContent = w.p;
    $('.front .hz').textContent = w.h;
    $('.front .hz').classList.toggle('two', w.h.length > 1);
    $('.back .hz').textContent = w.h;
    $('.back .py').textContent = w.p;
    $('.back .mean').textContent = w.m;
    flipped = false;
    demo.classList.remove('flipped');
    card.setAttribute('aria-label', t(`Tarjeta: ${w.h}. Toca para girar`, `Card: ${w.h}. Tap to flip`));
  }

  function flip() {
    if (busy || i >= WORDS.length) return;
    flipped = !flipped;
    demo.classList.toggle('flipped', flipped);
    if (flipped) {
      say();
      card.setAttribute('aria-label', `${WORDS[i].h}, ${WORDS[i].p}: ${WORDS[i].m}`);
    }
  }

  function answer(knew) {
    if (busy || !flipped) return;
    busy = true;
    knew ? nOk++ : nAgain++;
    card.style.transition = '';
    card.style.setProperty('--dx', knew ? '140%' : '-140%');
    card.classList.add('leaving');
    setTimeout(
      () => {
        card.classList.remove('leaving');
        card.style.removeProperty('--dx');
        card.style.removeProperty('--drag');
        i++;
        render();
        busy = false;
      },
      reduce.matches ? 0 : 320,
    );
  }

  card.addEventListener('click', () => !dragged && flip());
  card.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flip();
    } else if (e.key === 'ArrowRight') answer(true);
    else if (e.key === 'ArrowLeft') answer(false);
  });
  $('[data-act="flip"]').addEventListener('click', flip);
  $('[data-act="again"]').addEventListener('click', () => answer(false));
  $('[data-act="ok"]').addEventListener('click', () => answer(true));
  $('[data-act="say"]').addEventListener('click', say);
  $('[data-act="restart"]').addEventListener('click', () => {
    i = nAgain = nOk = 0;
    render();
    card.focus();
  });

  // Deslizar con el dedo o el ratón (solo con la tarjeta girada, como en la app)
  let x0 = null;
  let dragged = false;
  card.addEventListener('pointerdown', (e) => {
    if (!flipped || busy) return;
    x0 = e.clientX;
    dragged = false;
    card.setPointerCapture(e.pointerId);
  });
  card.addEventListener('pointermove', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 6) dragged = true;
    card.style.transition = 'none';
    card.style.setProperty('--drag', `${dx}px`);
    demo.dataset.lean = dx > 40 ? 'ok' : dx < -40 ? 'again' : '';
  });
  const release = (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    demo.dataset.lean = '';
    card.style.transition = '';
    if (Math.abs(dx) > 80) answer(dx > 0);
    else card.style.removeProperty('--drag');
    setTimeout(() => (dragged = false), 0);
  };
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);

  render();
})();
