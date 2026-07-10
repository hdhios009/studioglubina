/* Studio Glubina — cinematic interactions (vanilla, no deps) */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  var nav = document.getElementById('nav');
  var surface = document.querySelector('.surface');
  var items = [].slice.call(document.querySelectorAll('.rv'));
  var wordfield = document.getElementById('wordfield');
  var words = [].slice.call(document.querySelectorAll('#wordfield span'));
  var wordfieldDone = false;
  var depthVal = document.getElementById('depthVal');
  var depthLabel = document.getElementById('depthLabel');
  var depthSections = [].slice.call(document.querySelectorAll('[data-depth]'));
  var steps = [].slice.call(document.querySelectorAll('.pstep'));
  var processTraveler = document.getElementById('processTraveler');
  var processLine = document.getElementById('processLine');
  var lastActiveStep = null;
  var processVisualIndex = -1, processTargetIndex = -1, processHopTimer = null, processHopBusy = false;
  function placeProcessTraveler(idx, doHop) {
    var dot = steps[idx] && steps[idx].querySelector('.pstep__dot');
    if (!dot || !processTraveler || !processLine) return;
    var dotRect = dot.getBoundingClientRect(), lineRect = processLine.getBoundingClientRect();
    processTraveler.style.left = (dotRect.left - lineRect.left + dotRect.width / 2) + 'px';
    processTraveler.style.top = (dotRect.top - lineRect.top + dotRect.height / 2) + 'px';
    processTraveler.classList.add('show');
    if (doHop) {
      processTraveler.classList.remove('hop');
      void processTraveler.offsetWidth;
      processTraveler.classList.add('hop');
    }
  }
  function stepProcessHop() {
    if (processVisualIndex === processTargetIndex) { processHopBusy = false; return; }
    var dir = processTargetIndex > processVisualIndex ? 1 : -1;
    processVisualIndex += dir;
    placeProcessTraveler(processVisualIndex, true);
    if (processVisualIndex === processTargetIndex) { processHopBusy = false; }
    else { processHopTimer = setTimeout(stepProcessHop, 340); }
  }
  function goToProcessIndex(idx, reduceMotion) {
    processTargetIndex = idx;
    if (reduceMotion) {
      processVisualIndex = idx;
      placeProcessTraveler(idx, false);
      return;
    }
    if (processVisualIndex === -1) {
      // first time becoming active: always start the walk from step 0, never teleport in
      processVisualIndex = 0;
      placeProcessTraveler(0, false);
      if (idx === 0) return;
    }
    if (!processHopBusy) { processHopBusy = true; stepProcessHop(); }
  }
  var visual = document.querySelector('.surface__img');

  function revealSurface() { surface.classList.add('in'); }
  requestAnimationFrame(revealSurface);
  setTimeout(revealSurface, 50);

  // ---------- single rAF loop drives every scroll-position effect ----------
  // (scroll/IntersectionObserver events are unreliable in some embed contexts,
  // so position is polled every frame instead of listened for.)
  var lastY = -1;
  function update() {
    var y = window.scrollY;
    if (y === lastY) return;
    lastY = y;
    var vh = window.innerHeight;

    // nav stuck state
    if (y > 20) nav.classList.add('stuck'); else nav.classList.remove('stuck');

    // reveal
    items = items.filter(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add('in'); return false; }
      return true;
    });

    // wordfield
    if (!wordfieldDone && wordfield) {
      var wr = wordfield.getBoundingClientRect();
      if (wr.top < vh * 0.8 && wr.bottom > 0) {
        wordfieldDone = true;
        words.forEach(function (w, i) { setTimeout(function () { w.classList.add('in'); }, i * 120); });
      }
    }

    // depth HUD
    var mid = vh * 0.5, current = depthSections[0];
    depthSections.forEach(function (s) { if (s.getBoundingClientRect().top <= mid) current = s; });
    if (current) {
      var v = current.getAttribute('data-depth'), l = current.getAttribute('data-depth-label');
      if (depthVal.textContent !== v) depthVal.textContent = v;
      if (depthLabel.textContent !== l) depthLabel.textContent = l;
    }

    // process active step
    if (steps.length) {
      var isDesktopProcess = window.matchMedia && window.matchMedia('(min-width:901px)').matches;
      var processSection = document.getElementById('process');
      var closest = null, closestIdx = -1, isActive = false;

      if (isDesktopProcess && processSection) {
        // desktop: steps sit in one horizontal row, so vertical distance can't tell them
        // apart — drive progress from how far the section has scrolled through the viewport.
        var pr = processSection.getBoundingClientRect();
        isActive = pr.top < vh * 0.9 && pr.bottom > vh * 0.1;
        if (isActive) {
          var total = vh * 1.0;
          var traveled = (vh * 0.9) - pr.top;
          var progress = Math.max(0, Math.min(1, traveled / total));
          closestIdx = Math.round(progress * (steps.length - 1));
          closest = steps[closestIdx];
        }
      } else {
        var center = vh / 2, closestDist = Infinity;
        steps.forEach(function (s, i) {
          var r = s.getBoundingClientRect(), smid = r.top + r.height / 2, dist = Math.abs(smid - center);
          if (dist < closestDist) { closestDist = dist; closest = s; closestIdx = i; }
        });
        isActive = closest && closestDist < vh * 0.6;
      }

      steps.forEach(function (s) { s.classList.toggle('active', s === closest && isActive); });
      var stepChanged = isActive && closest !== lastActiveStep;
      if (isActive && isDesktopProcess && processTraveler && processLine) {
        if (closestIdx !== processTargetIndex) goToProcessIndex(closestIdx, !!reduce);
      } else if (processTraveler) {
        processTraveler.classList.remove('show');
        processVisualIndex = -1; processTargetIndex = -1;
        if (processHopTimer) { clearTimeout(processHopTimer); processHopTimer = null; }
        processHopBusy = false;
      }
      if (isActive && !isDesktopProcess && stepChanged && !reduce) {
        var dotM = closest.querySelector('.pstep__dot');
        if (dotM) {
          dotM.classList.remove('flash');
          void dotM.offsetWidth;
          dotM.classList.add('flash');
        }
      }
      if (isActive) lastActiveStep = closest;
    }

    // iceberg parallax
    if (visual && !reduce) visual.style.transform = 'translateY(' + Math.min(y * 0.08, 40) + 'px) scale(1.03)';
  }
  function loop() { update(); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
  // background-tab safety net: rAF throttles heavily when the tab isn't focused
  setInterval(function () { lastY = -1; update(); }, 200);

  // ---------- form: fade out, quiet confirmation ----------
  var form = document.getElementById('leadForm');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Отправляю…'; }
      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        if (res.ok) {
          document.getElementById('formWrap').querySelector('.abyss__form').classList.add('hide');
          document.getElementById('formDone').classList.add('show');
        } else {
          if (btn) { btn.disabled = false; btn.textContent = 'Отправить заявку'; }
          alert('Не удалось отправить. Попробуйте ещё раз или напишите в Telegram @hdhios007');
        }
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = 'Отправить заявку'; }
        alert('Нет соединения. Попробуйте ещё раз или напишите в Telegram @hdhios007');
      });
    });
  }

  // preselect a plan when arriving from a tariff button (?plan=...)
  try {
    var p = new URLSearchParams(location.search).get('plan');
    if (p) {
      var sel = document.querySelector('#leadForm select[name="Тариф"]');
      if (sel) {
        for (var i = 0; i < sel.options.length; i++) {
          if (sel.options[i].value === p) { sel.selectedIndex = i; break; }
        }
      }
    }
  } catch (e) {}

  // ---------- custom cursor: soft blob, stretches toward motion, snaps back at rest ----------
  var dot = document.getElementById('cursorDot');
  var dotInner = dot ? dot.querySelector('.cursor-dot__inner') : null;
  var hasFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (dot && dotInner && hasFinePointer) {
    var lastX = null, lastY = null, lastT = null, idleTimer = null;
    document.addEventListener('mousemove', function (e) {
      document.body.classList.add('cursor-ready');
      dot.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      var now = performance.now();
      if (lastX !== null && !reduce) {
        var dt = Math.max(now - lastT, 8);
        var dx = e.clientX - lastX, dy = e.clientY - lastY;
        var speed = Math.sqrt(dx * dx + dy * dy) / dt * 16; // px per ~frame
        if (speed > 0.8) {
          var angle = Math.atan2(dy, dx) * 180 / Math.PI;
          var e2 = Math.min(speed * 0.011, 0.3); // elongation, capped so ratio stays <=~1.6
          var stretch = 1 + e2;
          var squish = 1 - e2 * 0.62;
          dotInner.style.transform = 'rotate(' + angle + 'deg) scale(' + stretch + ',' + squish + ')';
        }
      }
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { dotInner.style.transform = ''; }, 55);
    });
    document.addEventListener('mouseover', function (e) {
      dot.classList.toggle('hovering', !!e.target.closest('a,button,.cursor-view,.case-full__frame'));
    });
  }

  // ---------- ambient lamp flicker: persistent unstable light, FNAF-style ----------
  if (!reduce) {
    var lamp = document.getElementById('lampOverlay');
    if (lamp) {
      var lampCurrent = 0.02, lampTarget = 0.02;
      function lampLoop() {
        var t = Date.now() / 1000;
        var base = 0.018 + Math.sin(t * 0.55) * 0.007 + Math.sin(t * 1.9 + 1.3) * 0.004;
        var goal = Math.max(base, lampTarget);
        lampCurrent += (goal - lampCurrent) * 0.3;
        lamp.style.opacity = Math.max(0, lampCurrent).toFixed(3);
        if (lampTarget > base) lampTarget = Math.max(base, lampTarget - 0.012);
        requestAnimationFrame(lampLoop);
      }
      requestAnimationFrame(lampLoop);

      function flick(strength, hold) {
        lampTarget = strength;
        setTimeout(function () { if (lampTarget === strength) lampTarget = 0; }, hold);
      }
      function scheduleFlicker() {
        var delay = 2200 + Math.random() * 5200;
        setTimeout(function () {
          var r = Math.random();
          if (r < 0.45) {
            flick(0.05 + Math.random() * 0.035, 90 + Math.random() * 90);
          } else if (r < 0.8) {
            flick(0.1 + Math.random() * 0.05, 130 + Math.random() * 140);
          } else {
            flick(0.15 + Math.random() * 0.05, 70);
            setTimeout(function () { flick(0.12 + Math.random() * 0.05, 80); }, 150);
          }
          scheduleFlicker();
        }, delay);
      }
      scheduleFlicker();
    }
  }

  // ---------- ambient instability: rare flicker, never on a loop ----------
  if (!reduce) {
    var flickerTargets = [].slice.call(document.querySelectorAll('.eyebrow, .depth-hud__val, .surface__atmosphere'));
    function scheduleAmbient() {
      var delay = 6000 + Math.random() * 14000;
      setTimeout(function () {
        if (flickerTargets.length) {
          var t = flickerTargets[Math.floor(Math.random() * flickerTargets.length)];
          t.classList.add('flicker');
          setTimeout(function () { t.classList.remove('flicker'); }, 2500);
        }
        scheduleAmbient();
      }, delay);
    }
    scheduleAmbient();
  }

  // ---------- hero word "\u0413\u041b\u0423\u0411\u0418\u041d\u0410": unstable-sign ambient glitch ----------
  if (!reduce) {
    var heroTitle = document.getElementById('heroTitle');
    if (heroTitle) {
      var heroText = heroTitle.textContent;
      heroTitle.setAttribute('data-text', heroText);
      var heroHtml = '';
      Array.prototype.forEach.call(heroTitle.childNodes, function (node) {
        if (node.nodeType === 3) {
          heroHtml += node.textContent.split('').map(function (ch) {
            return '<span class="lt">' + ch + '</span>';
          }).join('');
        } else if (node.nodeType === 1) {
          heroHtml += node.outerHTML;
        }
      });
      heroTitle.innerHTML = heroHtml;
      var heroLetters = [].slice.call(heroTitle.querySelectorAll('.lt'));
      var heroBusy = false;

      function runHeroEffect(kind) {
        if (heroBusy) return;
        heroBusy = true;
        if (kind === 'letters') {
          var n = 1 + (Math.random() < 0.4 ? 1 : 0);
          var picked = [];
          while (picked.length < n && picked.length < heroLetters.length) {
            var idx = Math.floor(Math.random() * heroLetters.length);
            if (picked.indexOf(idx) === -1) picked.push(idx);
          }
          picked.forEach(function (i) { heroLetters[i].classList.add('lt-dim'); });
          setTimeout(function () {
            picked.forEach(function (i) { heroLetters[i].classList.remove('lt-dim'); });
            heroBusy = false;
          }, 180 + Math.random() * 160);
        } else if (kind === 'shift') {
          heroTitle.classList.add('tf-shift');
          setTimeout(function () { heroTitle.classList.remove('tf-shift'); heroBusy = false; }, 240);
        } else if (kind === 'flash') {
          heroTitle.classList.add('tf-flash');
          setTimeout(function () { heroTitle.classList.remove('tf-flash'); heroBusy = false; }, 440);
        } else {
          heroTitle.classList.add('tf-flicker');
          setTimeout(function () { heroTitle.classList.remove('tf-flicker'); heroBusy = false; }, 360);
        }
      }

      function scheduleHero() {
        var delay = 4500 + Math.random() * 11000;
        setTimeout(function () {
          var r = Math.random();
          var kind = r < 0.5 ? 'flicker' : (r < 0.75 ? 'letters' : (r < 0.9 ? 'shift' : 'flash'));
          runHeroEffect(kind);
          scheduleHero();
        }, delay);
      }
      scheduleHero();

      heroTitle.addEventListener('mouseenter', function () {
        runHeroEffect(Math.random() < 0.5 ? 'shift' : 'flicker');
      });
    }
  }

  // ---------- case cards: subtle tilt toward cursor ----------
  if (!reduce) {
    [].slice.call(document.querySelectorAll('.case-full__frame')).forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY(' + (px * 5) + 'deg) rotateX(' + (py * -5) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  // ---------- mobile menu ----------
  var burger = document.getElementById('burger');
  var mm = document.getElementById('mobileMenu');
  var mmClose = document.getElementById('mmClose');
  if (burger && mm) {
    var openMM = function () { mm.classList.add('open'); document.body.style.overflow = 'hidden'; };
    var closeMM = function () { mm.classList.remove('open'); document.body.style.overflow = ''; };
    burger.addEventListener('click', openMM);
    if (mmClose) mmClose.addEventListener('click', closeMM);
    mm.querySelectorAll('a').forEach(function (el) { el.addEventListener('click', closeMM); });
  }
})();
