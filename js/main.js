/* Studio Glubina — интерактив: навигация, появление при скролле, форма */
(function () {
  'use strict';

  // sticky nav shadow
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 20) nav.classList.add('stuck');
    else nav.classList.remove('stuck');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // reveal on scroll
  var items = [].slice.call(document.querySelectorAll('.rv'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // preselect a plan when arriving from a tariff button (?plan=...) — optional
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

  // async form submit → показать «Заявка отправлена» без ухода со страницы
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
          document.getElementById('formWrap').hidden = true;
          document.getElementById('formDone').hidden = false;
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
  // depth rail — плавный счётчик глубины (1 деление = 1 метр)
  var rail = document.getElementById('depthRail');
  if (rail) {
    var dots = [].slice.call(rail.querySelectorAll('.dot'));
    var map = dots.map(function (d) { return { dot: d, el: document.getElementById(d.getAttribute('data-sec')) }; });
    var marker = document.getElementById('depthMarker');
    var cursor = document.getElementById('depthCursor');
    var val = document.getElementById('depthVal');
    var target = 0, cur = 0;
    function calc() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      target = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    }
    window.addEventListener('scroll', calc, { passive: true });
    window.addEventListener('resize', calc);
    calc();
    (function loop() {
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0004) cur = target;
      var topPct = 8 + cur * 84;
      if (marker) marker.style.top = topPct + '%';
      if (cursor) cursor.style.top = topPct + '%';
      if (val) val.textContent = Math.round(cur * 1000);
      var y = window.scrollY + window.innerHeight * 0.4, act = map[0];
      map.forEach(function (m) { if (m.el && m.el.offsetTop <= y) act = m; });
      dots.forEach(function (d) { d.classList.remove('active'); });
      if (act) act.dot.classList.add('active');
      requestAnimationFrame(loop);
    })();
  }
})();
