// Studio Glubina — static site logic (no framework)
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Header scroll state */
  const header = document.getElementById('header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile menu */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileCloseBtn = document.getElementById('mobileCloseBtn');
  const openMobileMenu = () => {
    if (!mobileMenu || !burgerBtn) return;
    mobileMenu.classList.add('open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };
  const closeMobileMenu = () => {
    if (!mobileMenu || !burgerBtn) return;
    mobileMenu.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  if (burgerBtn && mobileMenu) {
    burgerBtn.addEventListener('click', () => {
      mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });
    if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', closeMobileMenu);
    mobileMenu.querySelectorAll('.mobile-nav-link').forEach((a) => a.addEventListener('click', closeMobileMenu));
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 900 && mobileMenu.classList.contains('open')) closeMobileMenu();
    });
  }

  /* Hero intro animation */
  document.querySelectorAll('.hero-line, .hero-fade').forEach((el) => {
    if (reduce) {
      el.classList.add('shown');
      return;
    }
    const delay = parseInt(el.getAttribute('data-delay') || '0', 10);
    setTimeout(() => el.classList.add('shown'), 30 + delay);
  });

  /* Scroll reveal for generic elements */
  if (reduce) {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('shown'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('shown');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('[data-reveal]').forEach((el) => revealObserver.observe(el));
  }

  /* Process step scroll-spy */
  const steps = document.querySelectorAll('.process-step');
  if (steps.length) {
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          steps.forEach((s) => s.classList.remove('active'));
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0, rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => stepObserver.observe(s));
  }

  /* Services cards */
  const serviceCards = document.querySelectorAll('.service-card');
  const setOpenService = (card) => {
    serviceCards.forEach((c) => c.classList.toggle('open', c === card));
  };
  serviceCards.forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.contains('open') ? card.classList.remove('open') : setOpenService(card);
    });
    if (!isTouch) {
      card.addEventListener('mouseenter', () => setOpenService(card));
      card.addEventListener('mouseleave', () => card.classList.remove('open'));
    }
  });

  /* Principles dim-on-hover */
  const principles = document.querySelectorAll('.principle');
  principles.forEach((p) => {
    p.addEventListener('mouseenter', () => {
      principles.forEach((o) => o.classList.toggle('dimmed', o !== p));
    });
    p.addEventListener('mouseleave', () => {
      principles.forEach((o) => o.classList.remove('dimmed'));
    });
  });

  /* FAQ */
  const faqItems = document.querySelectorAll('.faq-item');
  const setOpenFaq = (item) => {
    faqItems.forEach((i) => {
      const isOpen = i === item;
      i.classList.toggle('open', isOpen);
      const q = i.querySelector('.faq-question');
      if (q) q.setAttribute('aria-expanded', String(isOpen));
    });
  };
  const closeAllFaq = () => {
    faqItems.forEach((i) => {
      i.classList.remove('open');
      const q = i.querySelector('.faq-question');
      if (q) q.setAttribute('aria-expanded', 'false');
    });
  };
  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      item.classList.contains('open') ? closeAllFaq() : setOpenFaq(item);
    });
    if (!isTouch) {
      item.addEventListener('mouseenter', () => setOpenFaq(item));
      item.addEventListener('mouseleave', () => item.classList.remove('open'));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mobileMenu && mobileMenu.classList.contains('open')) closeMobileMenu();
  });

  /* Back to top */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }
});
