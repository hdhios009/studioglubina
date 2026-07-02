/* =========================================================
   ГЛУБИНА — веб-студия
   script.js — vanilla JS, без зависимостей
   ========================================================= */
(function () {
  'use strict';

  var MAX_DEPTH = 1000;              // максимальная глубина на счётчике, м
  var FORMSPREE = 'https://formspree.io/f/mbdvzpdp';

  /* ---------- 1. Пузырьки воздуха (генерируем из JS) ---------- */
  (function buildBubbles() {
    var host = document.getElementById('bubbles');
    if (!host) return;
    var conf = [
      [8, 6, 15, 0, 10], [18, 9, 12, 4, -8], [27, 4, 18, 2, 6],
      [35, 7, 13, 7, -12], [44, 10, 16, 1, 8], [52, 5, 11, 5, -6],
      [60, 8, 19, 9, 12], [67, 6, 14, 3, -10], [74, 11, 17, 6, 7],
      [81, 4, 12, 8, -5], [88, 7, 20, 2, 9], [92, 5, 13, 10, -8]
    ];
    conf.forEach(function (c) {
      var s = document.createElement('span');
      s.style.left = c[0] + '%';
      s.style.width = c[1] + 'px';
      s.style.height = c[1] + 'px';
      s.style.animationDuration = c[2] + 's';
      s.style.animationDelay = c[3] + 's';
      s.style.setProperty('--dx', c[4] + 'px');
      host.appendChild(s);
    });
  })();

  /* ---------- 2. Погружение (parallax + счётчик глубины) ---------- */
  var journey   = document.getElementById('journey');
  var img       = document.getElementById('icebergImg');
  var overlay   = document.getElementById('journeyOverlay');
  var depthVal  = document.getElementById('depthVal');
  var marker    = document.getElementById('depthMarker');
  var bottomFade= document.getElementById('bottomFade');
  var hint      = document.getElementById('scrollHint');
  var nav       = document.getElementById('nav');
  var stations  = Array.prototype.slice.call(document.querySelectorAll('.station'));

  // диапазоны прокрутки (0..1), на которых видна каждая «остановка»
  var bands = [
    [0, 0.085], [0.115, 0.205], [0.235, 0.325], [0.355, 0.445],
    [0.475, 0.565], [0.595, 0.685], [0.715, 0.805], [0.84, 1.01]
  ];

  var vh = window.innerHeight;
  var jTop = 0, jH = 0, imgH = 0;
  var curP = 0, targetP = 0;

  function measure() {
    vh = window.innerHeight;
    jTop = journey.offsetTop;
    jH = journey.offsetHeight;
    imgH = img ? img.offsetHeight : vh;
  }

  // считаем целевой прогресс и переключаем дискретные состояния
  function update() {
    var sy = window.scrollY || window.pageYOffset || 0;
    var total = jH - vh;
    var p = total > 0 ? (sy - jTop) / total : 0;
    p = Math.max(0, Math.min(1, p));
    targetP = p;

    for (var i = 0; i < bands.length; i++) {
      if (stations[i]) {
        var on = p >= bands[i][0] && p <= bands[i][1];
        stations[i].classList.toggle('is-on', on);
      }
    }
    if (nav) nav.classList.toggle('is-solid', sy > vh * 0.55);
    if (hint) hint.style.opacity = p < 0.04 ? '1' : '0';
  }

  // плавно применяем визуал каждый кадр
  function applyVisuals() {
    var p = curP;
    if (img) {
      var range = Math.max(0, imgH - vh);
      img.style.transform = 'translate(-50%, ' + (-(range * p)).toFixed(2) + 'px)';
    }
    if (overlay) overlay.style.opacity = (0.14 + 0.5 * p + 0.32 * Math.pow(p, 4)).toFixed(3);
    if (bottomFade) bottomFade.style.opacity = Math.max(0, Math.min(1, (p - 0.5) / 0.32)).toFixed(3);
    if (depthVal) depthVal.textContent = Math.round(p * MAX_DEPTH);
    if (marker) marker.style.top = (8 + p * 84).toFixed(2) + '%';
  }

  function loop() {
    curP += (targetP - curP) * 0.085;
    if (Math.abs(targetP - curP) < 0.0002) curP = targetP;
    applyVisuals();
    requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', function () { measure(); update(); });
  window.addEventListener('load', function () { measure(); update(); });

  measure();
  update();
  requestAnimationFrame(loop);

  /* ---------- 3. Появление блоков при прокрутке ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- 4. Форма заявки (Formspree) ---------- */
  var form      = document.getElementById('contactForm');
  var formWrap  = document.getElementById('formWrap');
  var thanks    = document.getElementById('thanksWrap');
  var errBox    = document.getElementById('formError');
  var submitBtn = document.getElementById('submitBtn');

  function showError(msg) {
    if (!errBox) return;
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errBox.hidden = true;

      var name    = document.getElementById('fName').value.trim();
      var contact = document.getElementById('fContact').value.trim();
      var msg     = document.getElementById('fMsg').value.trim();

      if (!name || !contact) {
        showError('Пожалуйста, заполните имя и контакт.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправляю…';

      var data = new FormData();
      data.append('Имя', name);
      data.append('Контакт', contact);
      data.append('Сообщение', msg);

      fetch(FORMSPREE, { method: 'POST', headers: { Accept: 'application/json' }, body: data })
        .then(function (res) {
          if (res.ok) {
            formWrap.hidden = true;
            thanks.hidden = false;
          } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Отправить заявку →';
            showError('Не удалось отправить. Попробуйте ещё раз или напишите на почту.');
          }
        })
        .catch(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Отправить заявку →';
          showError('Нет соединения. Попробуйте ещё раз или напишите на почту.');
        });
    });
  }
})();
