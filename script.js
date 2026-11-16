(function () {
  /* 0. Menu and list links open each build as one page with tabs (one-page links) */
  document.querySelectorAll('a[href]').forEach(function (a) {
    var h = a.getAttribute('href');
    var m = h.match(/^build-([13])-([a-z]+)\.html$/);
    if (m) { a.setAttribute('href', 'build-' + m[1] + '.html#' + m[2]); return; }
    m = h.match(/^(?:builds|our-builds|all-builds)\.html#build-([123])$/);
    if (m) a.setAttribute('href', 'build-' + m[1] + '.html');
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
