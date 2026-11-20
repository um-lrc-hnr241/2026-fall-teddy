(function () {
  /* 0. Menu and list links open each build as one page with tabs (one-page links) */
  document.querySelectorAll('a[href]').forEach(function (a) {
    var h = a.getAttribute('href');
    var m = h.match(/^build-([13])-([a-z]+)\.html$/);
    if (m) { a.setAttribute('href', 'build-' + m[1] + '.html#' + m[2]); return; }
    m = h.match(/^(?:builds|our-builds|all-builds)\.html#build-([123])$/);
    if (m) a.setAttribute('href', 'build-' + m[1] + '.html');
  });

  document.querySelectorAll('nav[aria-label="Main"] > ul').forEach(function (ul) { if (ul.querySelector('a[href="word-web.html"]')) return; var li = document.createElement('li'); var a = document.createElement('a'); a.href = 'word-web.html'; a.textContent = 'Word web'; if (location.pathname.indexOf('word-web') > -1) a.setAttribute('aria-current', 'page'); li.appendChild(a); ul.insertBefore(li, ul.lastElementChild); }); var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Cards fade and slide in as you scroll */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.card, .hero').forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 80 + 'ms';
      io.observe(el);
    });
  }

  /* 2. Builds page: drawers act like an accordion and open from menu links */
  var drawers = document.querySelectorAll('details.object-drawer');
  drawers.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) drawers.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
  function openFromHash() {
    var target = location.hash && document.querySelector(location.hash);
    var d = target && target.querySelector('details.object-drawer');
    if (d) d.open = true;
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  /* 3. Back-to-top button */
  var top = document.createElement('button');
  top.type = 'button';
  top.className = 'back-to-top';
  top.setAttribute('aria-label', 'Back to top');
  top.textContent = '\u2191';
  top.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.body.appendChild(top);
  window.addEventListener('scroll', function () {
    top.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  /* 4. Meet the kids: "Guess who?" baby photo game */
  var box = document.getElementById('guess-game');
  if (box) {
    var kids = [
      { name: 'Emily', src: 'images/Emily_Baby_Photo.JPEG' },
      { name: 'Valentina', src: 'images/valentina_--__baby_photo.jpeg' },
      { name: 'Ravneet', src: 'images/Ravneet_Pic.JPEG' },
      { name: 'Owen', src: 'images/Owen_baby_photo.JPG' },
      { name: 'Rebecca', src: 'images/Becca_Baby_Photo.JPG' }
    ];
    var names = kids.map(function (k) { return k.name; }).concat('Amelia');
    var order, round, score, locked;

    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    }
    function shuffle(a) {
      a = a.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    function start() { order = shuffle(kids); round = 0; score = 0; show(); }
    function show() {
      box.textContent = '';
      var kid = order[round];
      locked = false;
      box.appendChild(el('p', 'game-count', 'Photo ' + (round + 1) + ' of ' + order.length + ' \u00b7 Score: ' + score));
      var img = el('img', 'game-photo');
      img.src = kid.src;
      img.alt = 'A baby photo of one of the kids. Who is it?';
      box.appendChild(img);
      var row = el('div', 'game-choices');
      shuffle(names).forEach(function (n) {
        var b = el('button', 'button', n);
        b.type = 'button';
        b.addEventListener('click', function () { guess(n, b, row); });
        row.appendChild(b);
      });
      box.appendChild(row);
      var fb = el('p', 'game-feedback');
      fb.setAttribute('aria-live', 'polite');
      box.appendChild(fb);
    }
    function guess(n, btn, row) {
      if (locked) return;
      locked = true;
      var kid = order[round], ok = n === kid.name, fb = box.querySelector('.game-feedback');
      if (ok) score++;
      btn.classList.add(ok ? 'right' : 'wrong');
      row.querySelectorAll('button').forEach(function (b) {
        b.disabled = true;
        if (b.textContent === kid.name) b.classList.add('right');
      });
      fb.textContent = ok ? 'Yes! That\u2019s ' + kid.name + '!' : 'Not quite \u2014 that\u2019s ' + kid.name + '.';
      var next = el('button', 'button', round + 1 < order.length ? 'Next photo' : 'See my score');
      next.type = 'button';
      next.addEventListener('click', function () {
        round++;
        if (round < order.length) show(); else finish();
      });
      box.appendChild(next);
      next.focus();
    }
    function finish() {
      box.textContent = '';
      box.appendChild(el('h3', null, 'You got ' + score + ' out of ' + order.length + '!'));
      var again = el('button', 'button', 'Play again');
      again.type = 'button';
      again.addEventListener('click', start);
      box.appendChild(again);
      again.focus();
    }
    start();
  }
})();
(function () {
  /* Smooth page fades */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var fade = document.createElement('style');
    fade.textContent = '@keyframes pageIn{from{opacity:0}to{opacity:1}} body{animation:pageIn 0.45s ease backwards;transition:opacity 0.25s ease} body.leaving{opacity:0}';
    document.head.appendChild(fade);
    window.addEventListener('pageshow', function () { document.body.classList.remove('leaving'); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(function () { location.href = a.href; }, 250);
    });
  }

  /* Meet the interior designer: two interactive pieces */
  if (!document.querySelector('.designer-intro')) return;
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  var css = document.createElement('style');
  css.textContent = '.gell-box{border:2px solid #8a5a2b;border-radius:0.75rem;background:#fff;padding:1.25rem 1.5rem;margin:1.5rem 0}.gell-box h2{margin-top:0}.scenes{display:grid;grid-template-columns:repeat(auto-fit,minmax(15rem,1fr));gap:0.75rem}.scene{display:block;width:100%;padding:1rem;border:2px solid #8a5a2b;border-radius:0.75rem;background:#fff8e6;color:inherit;font:inherit;text-align:left;cursor:pointer}.scene[aria-expanded="true"]{background:#fff;box-shadow:0 0.25rem 0 #a84712}.scene:focus-visible{outline:3px solid #1d2a3a;outline-offset:3px}.scene .answer{display:block;margin-top:0.6rem;padding-top:0.6rem;border-top:2px dashed #8a5a2b;font-weight:600}.reach{display:flex;flex-wrap:wrap;align-items:center;gap:1.5rem}.reach svg{width:min(100%,20rem);height:auto}.reach .ring{transition:opacity 0.4s ease}.reach-controls{flex:1;min-width:14rem}.reach-controls input{width:100%}';
  document.head.appendChild(css);

  var scenes = [
    ['A child gets into bed more easily because the sheets have spaceships on them.', 'The designer is long gone, but the pattern still shapes what the child does. The object acts through its relationships (Gell 74).'],
    ['An evil spirit is so fascinated by Celtic knotwork that it forgets its own plan.', 'The pattern interrupts the spirit’s intention without touching it. Gell calls this a “paralysis of the will” (Gell 84).'],
    ['A tin can falls off a horse in Westworld, and a whole new storyline begins.', 'A small object sets a chain of events in motion. This is the heart of our Build 2 essay.'],
    ['A portrait of someone who has died still affects the people who see it.', 'The traces a person leaves in objects keep acting after they are gone, so agency is spread beyond the body.']
  ];
  var a = h('section', 'gell-box');
  a.setAttribute('aria-labelledby', 'scenes-heading');
  var ah = h('h2', null, 'Who is acting here?');
  ah.id = 'scenes-heading';
  a.appendChild(ah);
  a.appendChild(h('p', null, 'Tap a scene to see how Gell would read it.'));
  var grid = h('div', 'scenes');
  scenes.forEach(function (s) {
    var b = h('button', 'scene');
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    b.appendChild(h('span', null, s[0]));
    var ans = h('span', 'answer', s[1]);
    ans.hidden = true;
    b.appendChild(ans);
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      ans.hidden = open;
    });
    grid.appendChild(b);
  });
  a.appendChild(grid);

  var levels = [
    'Just your body. This is the usual idea of a person, someone who ends at the skin.',
    'Add your things. Objects you own or make carry your choices out into the world.',
    'Add your memories. The ones you hold, and the ones other people keep of you.',
    'Add your relationships. The people you affect, and who affect you.',
    'Add what you leave behind. Portraits, writing, and heirlooms keep acting after you are gone. Gell describes a person as a spread of events and memories, not a single point (Gell 222).'
  ];
  var radii = [156, 130, 100, 70];
  var fills = ['#e8d6ec', '#cfe0f1', '#d9e8d2', '#f4e4bf'];
  var tags = ['what you leave behind', 'relationships', 'memories', 'things'];
  var b2 = h('section', 'gell-box');
  b2.setAttribute('aria-labelledby', 'reach-heading');
  var bh = h('h2', null, 'How far does a person reach?');
  bh.id = 'reach-heading';
  b2.appendChild(bh);
  var wrap = h('div', 'reach');
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 320 320');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Rings growing outward from a person: things, memories, relationships, and what they leave behind');
  var ringEls = [];
  radii.forEach(function (r, i) {
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'ring');
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', 160); c.setAttribute('cy', 160); c.setAttribute('r', r);
    c.setAttribute('fill', fills[i]); c.setAttribute('stroke', '#8a5a2b'); c.setAttribute('stroke-width', 2);
    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', 160); t.setAttribute('y', 160 - r + 15); t.setAttribute('text-anchor', 'middle');
    t.setAttribute('font-size', 12); t.setAttribute('font-weight', 700); t.setAttribute('fill', '#4a2c0f');
    t.textContent = tags[i];
    g.appendChild(c); g.appendChild(t);
    svg.appendChild(g);
    ringEls.push(g);
  });
  var you = document.createElementNS(NS, 'circle');
  you.setAttribute('cx', 160); you.setAttribute('cy', 160); you.setAttribute('r', 36); you.setAttribute('fill', '#2b5486');
  var yt = document.createElementNS(NS, 'text');
  yt.setAttribute('x', 160); yt.setAttribute('y', 166); yt.setAttribute('text-anchor', 'middle');
  yt.setAttribute('font-size', 16); yt.setAttribute('font-weight', 800); yt.setAttribute('fill', '#fff');
  yt.textContent = 'you';
  svg.appendChild(you); svg.appendChild(yt);
  wrap.appendChild(svg);
  var ctl = h('div', 'reach-controls');
  var lab = h('label', null, 'Slide to widen the circle');
  lab.setAttribute('for', 'reach-range');
  var range = h('input');
  range.type = 'range'; range.id = 'reach-range'; range.min = 0; range.max = 4; range.step = 1; range.value = 0;
  var out = h('p', null, levels[0]);
  out.setAttribute('aria-live', 'polite');
  function setLevel(n) {
    out.textContent = levels[n];
    ringEls.forEach(function (g, i) { g.style.opacity = (4 - i) <= n ? 1 : 0; });
  }
  range.addEventListener('input', function () { setLevel(Number(range.value)); });
  ctl.appendChild(lab); ctl.appendChild(range); ctl.appendChild(out);
  wrap.appendChild(ctl);
  b2.appendChild(wrap);
  setLevel(0);

  var anchor = document.getElementById('site-building-heading');
  var host = anchor && anchor.parentNode ? anchor.parentNode : document.getElementById('main');
  if (host.id === 'main') { host.appendChild(a); host.appendChild(b2); }
  else { host.parentNode.insertBefore(a, host.nextSibling); host.parentNode.insertBefore(b2, a.nextSibling); }
})();
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Old links to the builds page now open the map */
  document.querySelectorAll('a[href]').forEach(function (a) {
    if (/^(?:all-builds|our-builds)\.html$/.test(a.getAttribute('href'))) a.setAttribute('href', 'park-map.html');
  });

  /* Teddy bear tab icon */
  if (!document.querySelector('link[rel~="icon"]')) {
    var ic = document.createElement('link');
    ic.rel = 'icon';
    ic.href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">\ud83e\uddf8</text></svg>');
    document.head.appendChild(ic);
  }

  /* Polish: sticky header, smooth scroll, button press, roomier essay text */
  var st = document.createElement('style');
  st.textContent = (reduce ? '' : 'html{scroll-behavior:smooth}') +
    '.site-header{position:sticky;top:0;z-index:30;transition:padding 0.25s ease,box-shadow 0.25s ease}' +
    '.site-header.scrolled{padding-top:0.6rem;padding-bottom:0.6rem;box-shadow:0 0.4rem 1rem rgba(24,42,53,0.14)}' +
    '::selection{background:#f7cf59;color:#182a35}' +
    '.button{transition:transform 0.15s ease,box-shadow 0.15s ease}.button:hover{transform:translateY(-2px)}.button:active{transform:translateY(1px)}' +
    '.essay{font-size:1.15rem;line-height:1.8}' +
    '.read-progress{position:fixed;top:0;left:0;height:4px;width:0;z-index:50;background:linear-gradient(90deg,#f7cf59,#f5a06b)}' +
    '.read-time{margin:0 0 1rem;color:#465965;font-weight:700}' +
    '.essay-steps{display:flex;flex-wrap:wrap;justify-content:space-between;gap:0.75rem;margin:1.5rem 0 0}';
  document.head.appendChild(st);

  /* Header shadow on scroll, and a reading progress bar on essay pages */
  var header = document.querySelector('.site-header');
  var bar = null;
  if (document.querySelector('.essay')) {
    bar = document.createElement('div');
    bar.className = 'read-progress';
    document.body.appendChild(bar);
  }
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(100, window.scrollY / max * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Reading time above each essay */
  document.querySelectorAll('.essay').forEach(function (art) {
    var words = 0;
    Array.prototype.forEach.call(art.children, function (n) {
      if (n.tagName === 'P') words += (n.textContent.match(/\S+/g) || []).length;
    });
    var p = document.createElement('p');
    p.className = 'read-time';
    p.textContent = '\u2248 ' + Math.max(1, Math.round(words / 200)) + ' min read';
    art.parentNode.insertBefore(p, art);
  });

  /* Previous / next essay buttons on the tabbed build pages */
  var tabs = document.querySelectorAll('[data-tabs] .tab');
  var panels = document.querySelectorAll('[data-tabs] .tab-panel');
  if (tabs.length > 1) {
    Array.prototype.forEach.call(panels, function (panel, i) {
      var row = document.createElement('div');
      row.className = 'essay-steps';
      function step(label, j) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'button';
        b.textContent = label;
        b.addEventListener('click', function () {
          tabs[j].click();
          window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
        return b;
      }
      row.appendChild(i > 0 ? step('\u2190 ' + tabs[i - 1].textContent, i - 1) : document.createElement('span'));
      if (i < tabs.length - 1) row.appendChild(step(tabs[i + 1].textContent + ' \u2192', i + 1));
      panel.appendChild(row);
    });
  }
})();
document.querySelectorAll('.builds-submenu').forEach(function (ul) {
  var links = Array.prototype.slice.call(ul.querySelectorAll('a'));
  for (var n = 1; n <= 8; n++) {
    var has = links.some(function (a) { return a.textContent.trim() === 'Build ' + n; });
    if (has) continue;
    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = n === 4 ? 'build-4.html' : 'park-map.html';
    a.textContent = 'Build ' + n;
    li.appendChild(a);
    ul.appendChild(li);
  }
});
document.querySelectorAll('.builds-submenu > li').forEach(function (li) {
  var first = li.querySelector('a');
  if (!first || first.textContent.trim() !== 'Build 4' || li.querySelector('.documents-submenu')) return;
  li.classList.add('documents-menu');
  var sub = document.createElement('ul');
  sub.className = 'documents-submenu';
  sub.setAttribute('aria-label', 'Build 4 essays');
  [['valentina', 'Valentina'], ['owen', 'Owen'], ['ravneet', 'Ravneet'], ['emily', 'Emily']].forEach(function (p) {
    var item = document.createElement('li');
    var a = document.createElement('a');
    a.href = 'build-4.html#' + p[0];
    a.textContent = 'Build 4 - ' + p[1];
    item.appendChild(a);
    sub.appendChild(item);
  });
  li.appendChild(sub);
});
document.querySelectorAll('nav[aria-label="Main"] > ul').forEach(function (ul) {
  Array.prototype.slice.call(ul.children).forEach(function (li) {
    var a = li.querySelector('a');
    if (a && /^(?:word-web|knotwork)\.html$/.test(a.getAttribute('href'))) ul.removeChild(li);
  });
  if (ul.querySelector('.play-menu')) return;
  var li = document.createElement('li');
  li.className = 'builds-menu play-menu';
  var top = document.createElement('a');
  top.href = 'play.html';
  top.textContent = 'Play';
  if (/play|knotwork|maze|word-web/.test(location.pathname)) top.setAttribute('aria-current', 'page');
  li.appendChild(top);
  var sub = document.createElement('ul');
  sub.className = 'builds-submenu';
  sub.setAttribute('aria-label', 'Games and activities');
  [['Knotwork trap', 'knotwork.html'], ['The maze', 'maze.html'], ['Word web', 'word-web.html'], ['Guess who?', 'hosts.html#game-heading']].forEach(function (p) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.href = p[1];
    link.textContent = p[0];
    item.appendChild(link);
    sub.appendChild(item);
  });
  li.appendChild(sub);
  ul.insertBefore(li, ul.lastElementChild);
});
(function () {
  var hero = document.querySelector('.playroom-hero');
  if (!hero) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function h(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  var css = document.createElement('style');
  css.textContent =
    '.playroom-hero{position:relative;overflow:hidden}' +
    '.playroom-hero > .hero-blocks{position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;pointer-events:none}' +
    '.hero-wrap{position:absolute;transition:transform 0.25s ease-out}' +
    '.hero-block{display:block;border:3px solid rgba(24,42,53,0.3);border-radius:0.6rem;box-shadow:0 0.3rem 0 rgba(24,42,53,0.18);cursor:pointer;pointer-events:auto;padding:0;transition:background-color 0.3s ease}' +
    '.hero-block.bob{animation:bob 5s ease-in-out infinite}' +
    '.hero-block.pop{animation:pop 0.5s ease}' +
    '@keyframes bob{50%{transform:translateY(-0.8rem) rotate(6deg)}}' +
    '@keyframes pop{50%{transform:scale(1.4) rotate(180deg)}}' +
    '.hero-rotator{font-size:1.3rem;font-weight:700;margin:0.25rem 0}' +
    '.hero-rotator strong{display:inline-block;min-width:7ch;color:#a84712;transition:opacity 0.3s ease}' +
    '.poke{margin:0.75rem 0 0;font-weight:700;color:#465965}' +
    '.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(9rem,1fr));gap:1rem;margin:2rem 0}' +
    '.stat{padding:1rem;border:2px solid #8a5a2b;border-radius:0.9rem;background:#fff;text-align:center;font-weight:700}' +
    '.stat b{display:block;font-size:2.4rem;line-height:1.1;color:#2b5486}' +
    '.jump{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:1rem;margin:0 0 2rem}' +
    '.jump a{display:block;padding:1.1rem;border-radius:1rem;color:#182a35;font-weight:800;font-size:1.15rem;text-decoration:none;box-shadow:0 0.3rem 0 rgba(24,42,53,0.2);transition:transform 0.15s ease,box-shadow 0.15s ease}' +
    '.jump a:hover,.jump a:focus-visible{transform:translateY(-4px) rotate(-1deg);box-shadow:0 0.6rem 0 rgba(24,42,53,0.2)}' +
    '.jump span{display:block;margin-top:0.3rem;font-weight:600;font-size:0.95rem}' +
    '.ponder{margin:2rem 0;padding:1.5rem;border:3px dashed #8a5a2b;border-radius:1rem;background:#fff8e6}' +
    '.ponder h2{margin-top:0}.ponder .q{font-size:1.35rem;font-weight:700;min-height:4.5rem}';
  if (reduce) css.textContent += '.hero-block.bob{animation:none}';
  document.head.appendChild(css);

  /* Floating blocks you can poke */
  var colors = ['#f5a06b', '#f7cf59', '#b9dfb9', '#9cc3e6', '#e6a8c8'];
  var spots = [[74, 10, 46], [88, 34, 60], [66, 58, 38], [90, 68, 50], [54, 78, 42], [80, 84, 34]];
  var layer = h('div', 'hero-blocks');
  var wraps = [];
  var pokes = 0;
  var pokeNote = h('p', 'poke', 'Psst. Those blocks are poke-able.');
  spots.forEach(function (s, i) {
    var wrap = h('div', 'hero-wrap');
    wrap.style.left = s[0] + '%';
    wrap.style.top = s[1] + '%';
    var b = h('button', 'hero-block bob');
    b.type = 'button';
    b.setAttribute('aria-label', 'Poke a block');
    b.style.width = s[2] + 'px';
    b.style.height = s[2] + 'px';
    b.style.backgroundColor = colors[i % colors.length];
    b.style.animationDelay = (i * 0.7) + 's';
    b.addEventListener('click', function () {
      b.classList.remove('pop');
      void b.offsetWidth;
      b.classList.add('pop');
      b.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      pokes++;
      pokeNote.textContent = pokes >= 10 ? 'Blocks poked: ' + pokes + '. You have the touch of a toy designer.' : 'Blocks poked: ' + pokes;
    });
    wrap.appendChild(b);
    layer.appendChild(wrap);
    wraps.push(wrap);
  });
  hero.insertBefore(layer, hero.firstChild);
  hero.appendChild(pokeNote);
  if (!reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5, dy = (e.clientY - r.top) / r.height - 0.5;
      wraps.forEach(function (w, i) {
        var depth = (i % 3 + 1) * 16;
        w.style.transform = 'translate(' + (dx * depth).toFixed(1) + 'px,' + (dy * depth).toFixed(1) + 'px)';
      });
    });
  }

  /* Rotating word under the title */
  var title = hero.querySelector('h1');
  var words = ['patterns', 'objects', 'mazes', 'memories', 'hosts', 'agency'];
  var rot = h('p', 'hero-rotator', 'Come explore ');
  var word = h('strong', null, words[0]);
  rot.appendChild(word);
  if (title && title.parentNode) title.parentNode.insertBefore(rot, title.nextSibling);
  if (!reduce) {
    var wi = 0;
    setInterval(function () {
      word.style.opacity = 0;
      setTimeout(function () { wi = (wi + 1) % words.length; word.textContent = words[wi]; word.style.opacity = 1; }, 300);
    }, 2200);
  }

  /* Counters, quick links, and a question to think about */
  var after = hero.nextSibling;
  var parent = hero.parentNode;
  var stats = h('section', 'stats');
  stats.setAttribute('aria-label', 'Our site in numbers');
  var nums = [[16, 'essays'], [4, 'builds so far'], [6, 'kids'], [4, 'games']];
  var counters = nums.map(function (n) {
    var box = h('div', 'stat');
    var big = h('b', null, '0');
    box.appendChild(big);
    box.appendChild(document.createTextNode(n[1]));
    stats.appendChild(box);
    return { el: big, to: n[0] };
  });
  parent.insertBefore(stats, after);
  function run() {
    counters.forEach(function (c) {
      if (reduce) { c.el.textContent = c.to; return; }
      var start = Date.now();
      (function tick() {
        var t = Math.min(1, (Date.now() - start) / 1000);
        c.el.textContent = Math.round(c.to * t);
        if (t < 1) requestAnimationFrame(tick);
      })();
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(stats);
  } else { run(); }

  var jump = h('section');
  var jh = h('h2', null, 'Jump in');
  jump.appendChild(jh);
  var grid = h('div', 'jump');
  [['Explore the map', 'Follow the trail through every build', 'park-map.html', '#f5a06b'],
   ['Play a game', 'Knotwork, a maze, and more', 'play.html', '#f7cf59'],
   ['Read the essays', 'Start with Build 1', 'build-1.html', '#b9dfb9'],
   ['Meet the kids', 'Who made all this', 'hosts.html', '#9cc3e6']].forEach(function (j) {
    var a = h('a', null, j[0]);
    a.href = j[2];
    a.style.backgroundColor = j[3];
    a.appendChild(h('span', null, j[1]));
    grid.appendChild(a);
  });
  jump.appendChild(grid);
  parent.insertBefore(jump, after);

  var questions = [
    'If a pattern can stop a spirit from carrying out its plan, who is really in control?',
    'Is the self something inside you, or something spread across the things and people around you?',
    'When a tin can starts a whole new storyline, who is acting: the person or the can?',
    'Can an artist’s intention keep going after the artist is gone?',
    'If you know how a pattern is built, can you stop being fooled by it?',
    'Does being aware of something mean you can control it?'
  ];
  var qi = Math.floor(Math.random() * questions.length);
  var box = h('section', 'ponder');
  box.appendChild(h('h2', null, 'Something to think about'));
  var q = h('p', 'q', questions[qi]);
  q.setAttribute('aria-live', 'polite');
  box.appendChild(q);
  var more = h('button', 'button', 'Another question');
  more.type = 'button';
  more.addEventListener('click', function () {
    qi = (qi + 1 + Math.floor(Math.random() * (questions.length - 1))) % questions.length;
    q.textContent = questions[qi];
  });
  box.appendChild(more);
  parent.appendChild(box);
})();
document.querySelectorAll('.builds-submenu > li').forEach(function (li) {
  var first = li.querySelector('a');
  if (!first || first.textContent.trim() !== 'Build 5' || li.querySelector('.documents-submenu')) return;
  first.href = 'build-5.html';
  li.classList.add('documents-menu');
  var sub = document.createElement('ul');
  sub.className = 'documents-submenu';
  sub.setAttribute('aria-label', 'Build 5 essays');
  [['rebecca', 'Rebecca'], ['valentina', 'Valentina'], ['owen', 'Owen'], ['ravneet', 'Ravneet'], ['emily', 'Emily']].forEach(function (p) {
    var item = document.createElement('li');
    var a = document.createElement('a');
    a.href = 'build-5.html#' + p[0];
    a.textContent = 'Build 5 - ' + p[1];
    item.appendChild(a);
    sub.appendChild(item);
  });
  li.appendChild(sub);
});
(function () {
  /* Home page numbers. Change these when new essays or builds are added: essays, builds, kids, games */
  var vals = [21, 5, 6, 4];
  var stats = document.querySelector('.stats');
  if (!stats) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fresh = [];
  Array.prototype.forEach.call(stats.querySelectorAll('.stat b'), function (old) {
    var nb = document.createElement('b');
    nb.textContent = '0';
    old.parentNode.replaceChild(nb, old);
    fresh.push(nb);
  });
  function run() {
    fresh.forEach(function (el, i) {
      if (reduce) { el.textContent = vals[i]; return; }
      var start = Date.now();
      (function tick() {
        var t = Math.min(1, (Date.now() - start) / 1000);
        el.textContent = Math.round(vals[i] * t);
        if (t < 1) requestAnimationFrame(tick);
      })();
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(stats);
  } else { run(); }
})();
(function () {
  var box = document.querySelector('.maze-box, .trap');
  if (!box) return;
  var isMaze = box.classList.contains('maze-box');
  var css = document.createElement('style');
  css.textContent = '.game-layout{display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;margin:0 0 1.5rem}' +
    '.game-layout > .maze-box,.game-layout > .trap{flex:1 1 24rem;max-width:34rem;margin:0}' +
    '.game-side{flex:1 1 16rem;max-width:30rem;padding:1.25rem 1.5rem;border:2px solid #8a5a2b;border-radius:1rem;background:#fff8e6}' +
    '.game-side h2{font-size:1.15rem;margin:1.1rem 0 0.3rem}.game-side h2:first-child{margin-top:0}' +
    '.game-side p{margin:0 0 0.4rem}.game-side ul{margin:0;padding-left:1.2rem}' +
    '.game-side .record{font-size:1.2rem;font-weight:800;color:#2b5486}';
  document.head.appendChild(css);
  function h(tag, text) { var n = document.createElement(tag); if (text) n.textContent = text; return n; }
  function link(text, href) { var a = document.createElement('a'); a.href = href; a.textContent = text; return a; }
  var layout = document.createElement('div');
  layout.className = 'game-layout';
  box.parentNode.insertBefore(layout, box);
  layout.appendChild(box);
  var side = document.createElement('aside');
  side.className = 'game-side';
  side.setAttribute('aria-label', 'About this game');
  layout.appendChild(side);

  side.appendChild(h('h2', 'How to play'));
  side.appendChild(h('p', isMaze
    ? 'Use the arrow keys or W A S D, or the buttons under the maze. Walls block you, so some paths are dead ends. Reach the glowing square in the middle.'
    : 'Press on the rope and drag along it. Each lap uses up some of your plan. If you stop, or wander off the rope, the trap talks back.'));
  side.appendChild(h('h2', isMaze ? 'Why a maze?' : 'What Gell says'));
  side.appendChild(h('p', isMaze
    ? 'In our Build 2 essay, the maze leads Dolores to her own consciousness. Gell would ask a different question: how much of your path did you choose, and how much did the walls choose for you?'
    : 'Gell describes an evil spirit so fascinated by Celtic knotwork that it loses interest in its own plan, a “paralysis of the will” (Gell 84). Nothing holds it in place. Its attention does the work.'));
  var p = h('p');
  p.appendChild(link(isMaze ? 'Read the Build 2 essay' : 'Read Emily’s Build 1 essay', isMaze ? 'build-2.html' : 'build-1.html#emily'));
  side.appendChild(p);

  side.appendChild(h('h2', 'Your record'));
  var rec = h('p');
  rec.className = 'record';
  side.appendChild(rec);
  var reset = h('button', 'Reset record');
  reset.type = 'button';
  reset.className = 'button';
  side.appendChild(reset);

  side.appendChild(h('h2', 'More to play'));
  var ul = h('ul');
  [['Knotwork trap', 'knotwork.html'], ['The maze', 'maze.html'], ['Word web', 'word-web.html'], ['Guess who?', 'hosts.html#game-heading'], ['All games', 'play.html']].forEach(function (g) {
    if (location.pathname.indexOf(g[1].split('.')[0]) > -1 && g[1] !== 'play.html') return;
    var li = h('li');
    li.appendChild(link(g[0], g[1]));
    ul.appendChild(li);
  });
  side.appendChild(ul);

  var key = isMaze ? 'maze-record' : 'trap-record';
  var data = { best: 0, count: 0 };
  try { data = JSON.parse(localStorage.getItem(key)) || data; } catch (e) {}
  function save() { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {} }
  function show() {
    if (isMaze) rec.textContent = data.count ? 'Best: ' + data.best + ' steps. Mazes solved: ' + data.count : 'No mazes solved yet.';
    else rec.textContent = data.count ? 'Times you forgot your plan: ' + data.count : 'You still remember your plan.';
  }
  show();
  reset.addEventListener('click', function () { data = { best: 0, count: 0 }; save(); show(); });

  if (!('MutationObserver' in window)) return;
  if (isMaze) {
    var msg = document.getElementById('msg');
    if (msg) new MutationObserver(function () {
      var m = /^You reached the center in (\d+) steps/.exec(msg.textContent);
      if (!m) return;
      var n = Number(m[1]);
      data.count++;
      if (!data.best || n < data.best) data.best = n;
      save(); show();
    }).observe(msg, { childList: true, characterData: true, subtree: true });
  } else {
    var label = document.getElementById('plan-label');
    var was0 = false;
    if (label) new MutationObserver(function () {
      var zero = label.textContent.indexOf(': 0%') > -1;
      if (zero && !was0) { data.count++; save(); show(); }
      was0 = zero;
    }).observe(label, { childList: true, characterData: true, subtree: true });
  }
})();
(function () {
  /* Build 4: add Rebecca to the menu list */
  document.querySelectorAll('.builds-submenu > li').forEach(function (li) {
    var first = li.querySelector('a');
    if (!first || first.textContent.trim() !== 'Build 4') return;
    var sub = li.querySelector('.documents-submenu');
    if (!sub || sub.querySelector('a[href="build-4.html#rebecca"]')) return;
    var item = document.createElement('li');
    var a = document.createElement('a');
    a.href = 'build-4.html#rebecca';
    a.textContent = 'Build 4 - Rebecca';
    item.appendChild(a);
    sub.insertBefore(item, sub.firstChild);
  });

  /* Map: Build 4 now has five essays */
  var pt = document.getElementById('panel-text');
  if (pt && 'MutationObserver' in window) {
    new MutationObserver(function () {
      if (pt.textContent.indexOf('Four essays that each raise an objection') === 0) pt.textContent = pt.textContent.replace('Four essays', 'Five essays');
    }).observe(pt, { childList: true, characterData: true, subtree: true });
  }

  /* Home page numbers: essays, builds, kids, games */
  var vals = [22, 5, 6, 4];
  var stats = document.querySelector('.stats');
  if (!stats) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fresh = [];
  Array.prototype.forEach.call(stats.querySelectorAll('.stat b'), function (old) {
    var nb = document.createElement('b');
    nb.textContent = '0';
    old.parentNode.replaceChild(nb, old);
    fresh.push(nb);
  });
  function run() {
    fresh.forEach(function (el, i) {
      if (reduce) { el.textContent = vals[i]; return; }
      var start = Date.now();
      (function tick() {
        var t = Math.min(1, (Date.now() - start) / 1000);
        el.textContent = Math.round(vals[i] * t);
        if (t < 1) requestAnimationFrame(tick);
      })();
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(stats);
  } else { run(); }
})();
(function () {
  var box = document.querySelector('[data-tabs]');
  if (!box || document.getElementById('rebecca')) return;
  var list = box.querySelector('.tablist');
  if (!list) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paras = [
    `Gell’s account of art points towards a form of reconsolidation that takes place partly outside the mind: through the “unfinished business” of patterned objects, the past remains open and is carried into the present, where identity continues to evolve through relationships with the material world. But one might object that reconsolidation does not fit Gell's conception of consciousness, as unfinished business seems to create fixity rather than revision. Reconsolidation is an idea dependent on change: the past travels into the present, where it is reshaped and goes on to affect the future. Gell's unfinished business, by contrast, is dependent on nothing ever being completed, and he describes patterns in terms of entanglement or being stuck. This relationship between person and pattern may turn out to be an ongoing loop, where the pattern and human being cannot break free. Be that as it may, I would argue that unfinished business is what keeps that loop open. Because the relationship never closes, the past remains exposed to new encounters, and each encounter can change how earlier ones are understood. Whether it leads to paralysis or revision depends on what the mind brings to it, which suggests that reconsolidation is shared between the person and the object, rather than belonging to either one alone.`,
    `To answer this objection, it helps to clarify what reconsolidation actually requires. It is not that a relationship needs to be completed, but instead, just reopened. Unfinished business keeps the past open, and each return can change it. Take for example, the carpet in Gell’s reading. Gell describes the interaction between the carpet and its owner as "inexhaustible" (80) claiming it continues on for life. Although no owner can claim to have “entirely come to grips with its pattern,” the eye “singles out now this relation, this symmetry, now that” (80). One may wonder if noticing something new is the same as revising what came before. New perceptions can be seen as additions, rather than a change to previous interpretations. However, Gell's account of complex patterns suggests that new perceptions do change what had been seen before. The viewer of a pattern picks out a single shape, but then becomes “dimly aware that this ‘ground’ on which the shape is laid has the same shapes inscribed on it, but in reverse colour" (80). What the viewer first thought they had come to terms with changes, as they look into the pattern further. Each return to the carpet causes the owner to discover something new. Gell describes this exchange as a lag that produces not a frozen balance but “some renewed, residual, imbalance” (81). The relationship never ends, but is continuously reopened and continues to change. Closure produces fixity, while unfinished business sustains continuity.`,
    `The example of apotropaic work meant to ward off a sort of evil demon seems to offer the strongest point for this objection. The demon confronting Celtic knotwork suffers a “paralysis of the will” (84) becoming stuck in the pattern. This may suggest that unfinished business leaves its subject fixed in place. What this point is missing is the goal that paralysis accomplishes. “Losing interest in whatever malevolent plan it had entertained previously” (84), the demon is not simply frozen; its past intention is displaced. What the pattern neutralizes is “the impetus of its malevolence” (86), a purpose the demon carried with it from the past. In this sense, the encounter with the pattern works like reconsolidation: the demon's past purpose is reopened in the present and does not come out the same. The trap, in other words, works by rewriting what it captures. The patterns themselves are not static either. The kolam threshold designs are rubbed out by passing feet and "renewed the next day” (85), suggesting that their protection depends on renewal rather than permanence. Even when Gell’s patterns appear to produce paralysis, they remain part of a continuous process in which the past is reopened and revised.`,
    `This raises a question about the difference between the purposes of the pattern. If the same pattern can trap one mind and change another, what makes the difference? Gell’s discussion of kolam-based tattoos in India offers an answer. He explains that the tattoo serves as both a “map” (90), leading a dead woman to a loved one, and a “puzzle” (90) aiming to protect against punishments in the land of the dead. Therefore, the object's effect depends on who encounters it. The maze tattoo serves as a guide for women towards the land of the dead, where it is put back into use. By contrast, the same design also serves as a trap, for those who meet it that have no prior relationship with the pattern. As a result, unfinished business splits into two directions. The demons are held in place, while the woman uses the pattern to carry her forward. What separates paralysis from revision is not the pattern itself but the history between the pattern and the mind that meets it.`,
    `At first glance, Gell’s unfinished business may seem disconnected from reconsolidation, since his pattern so often holds the mind in place. Yet, unfinished business is not the opposite of reconsolidation but its condition: because the relationship never closes, the past remains available to be reopened. Whether that reopening leads to paralysis or revision depends on what the mind brings to the encounter. The tattooed woman brings a lifetime with her design, so the pattern builds on her past. The demon, however, brings a malevolent plan, which the pattern overwrites. Even paralysis, then, is a kind of revision, one imposed on the mind rather than built from its own history. This suggests that reconsolidation, for Gell, is distributed between person and object, a view consistent with Gell's definition of the distributed person. Fixity, then, may not be the opposite of reconsolidation but one of its forms: when a mind meets a pattern with which it has no past. However, if one considers how Gell uses reconsolidation in order to explain why the same pattern can trap one mind but guide another, one can begin to see how reconsolidation might allow consciousness to intervene in the stream of physical causality to influence its course.`
  ];

  /* Rebecca's tab and essay */
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tab';
  btn.setAttribute('role', 'tab');
  btn.setAttribute('data-for', 'rebecca');
  btn.setAttribute('aria-selected', 'false');
  btn.textContent = 'Rebecca';
  list.insertBefore(btn, list.firstChild);
  var panel = document.createElement('section');
  panel.className = 'tab-panel';
  panel.id = 'rebecca';
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-label', 'Build 4 by Rebecca');
  var h2 = document.createElement('h2');
  h2.textContent = 'Rebecca';
  panel.appendChild(h2);
  var words = 0;
  paras.forEach(function (p) { words += p.split(/\s+/).length; });
  var rt = document.createElement('p');
  rt.className = 'read-time';
  rt.textContent = '\u2248 ' + Math.max(1, Math.round(words / 200)) + ' min read';
  panel.appendChild(rt);
  var art = document.createElement('article');
  art.className = 'essay';
  paras.forEach(function (p) {
    var el = document.createElement('p');
    el.textContent = p;
    art.appendChild(el);
  });
  panel.appendChild(art);
  box.insertBefore(panel, box.querySelector('.tab-panel'));

  /* Fresh tab controller for all five tabs (clones drop the old listeners) */
  var tabs = Array.prototype.slice.call(list.querySelectorAll('.tab')).map(function (t) {
    if (t === btn) return t;
    var c = t.cloneNode(true);
    t.parentNode.replaceChild(c, t);
    return c;
  });
  var panels = Array.prototype.slice.call(box.querySelectorAll('.tab-panel'));
  Array.prototype.forEach.call(box.querySelectorAll('.essay-steps'), function (r) { r.parentNode.removeChild(r); });
  function show(id, focus) {
    if (!panels.some(function (p) { return p.id === id; })) id = panels[0].id;
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-for') === id;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach(function (p) { p.hidden = p.id !== id; });
  }
  function go(id, focus) {
    show(id, focus);
    history.replaceState(null, '', '#' + id);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { go(t.getAttribute('data-for')); });
    t.addEventListener('keydown', function (e) {
      var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : -1;
      if (j < 0) return;
      e.preventDefault();
      go(tabs[(j + tabs.length) % tabs.length].getAttribute('data-for'), true);
    });
  });
  panels.forEach(function (p, i) {
    var row = document.createElement('div');
    row.className = 'essay-steps';
    function step(label, j) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'button';
      b.textContent = label;
      b.addEventListener('click', function () {
        go(panels[j].id);
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
      return b;
    }
    row.appendChild(i > 0 ? step('\u2190 ' + tabs[i - 1].textContent, i - 1) : document.createElement('span'));
    if (i < panels.length - 1) row.appendChild(step(tabs[i + 1].textContent + ' \u2192', i + 1));
    p.appendChild(row);
  });
  window.addEventListener('hashchange', function () { show(location.hash.slice(1)); });
  show(location.hash.slice(1));
})();
(function () {
  /* Build 6: menu link */
  document.querySelectorAll('.builds-submenu > li > a').forEach(function (a) {
    if (a.textContent.trim() === 'Build 6') a.href = 'build-6.html';
  });

  /* Map: Build 6 pin and list */
  var title = document.getElementById('panel-title');
  var text = document.getElementById('panel-text');
  var link = document.getElementById('panel-link');
  if (title && text && link && 'MutationObserver' in window) {
    var st = document.createElement('style');
    st.textContent = '.pin.soon:not(.fog)[aria-label^="Build 6,"] .dot{opacity:1}';
    document.head.appendChild(st);
    new MutationObserver(function () {
      if (title.textContent.indexOf('Build 6') !== 0) return;
      text.textContent = 'The group essay that looks back across Builds 1 to 5 and asks how consciousness develops through art and agency.';
      link.href = 'build-6.html';
      link.textContent = 'Enter Build 6';
      link.classList.remove('off');
    }).observe(title, { childList: true, characterData: true, subtree: true });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.map-list li'), function (li) {
    if (li.textContent.indexOf('Builds 6 to 8') !== 0) return;
    li.textContent = '';
    var a = document.createElement('a');
    a.href = 'build-6.html';
    a.textContent = 'Build 6';
    li.appendChild(a);
    var more = document.createElement('li');
    more.textContent = 'Builds 7 and 8: still unexplored';
    li.parentNode.insertBefore(more, li.nextSibling);
  });

  /* Home page numbers: essays, builds, kids, games */
  var vals = [23, 6, 6, 4];
  var stats = document.querySelector('.stats');
  if (!stats) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fresh = [];
  Array.prototype.forEach.call(stats.querySelectorAll('.stat b'), function (old) {
    var nb = document.createElement('b');
    nb.textContent = '0';
    old.parentNode.replaceChild(nb, old);
    fresh.push(nb);
  });
  function run() {
    fresh.forEach(function (el, i) {
      if (reduce) { el.textContent = vals[i]; return; }
      var start = Date.now();
      (function tick() {
        var t = Math.min(1, (Date.now() - start) / 1000);
        el.textContent = Math.round(vals[i] * t);
        if (t < 1) requestAnimationFrame(tick);
      })();
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(stats);
  } else { run(); }
})();
