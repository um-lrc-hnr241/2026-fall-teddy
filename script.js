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
