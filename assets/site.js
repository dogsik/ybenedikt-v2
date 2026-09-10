document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.site-header nav');
  var backdrop = document.querySelector('.nav-backdrop');

  function openMenu() {
    nav.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    nav.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle && nav) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      if (nav.classList.contains('open')) { closeMenu(); } else { openMenu(); }
    });
    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); }
    });
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }
});
