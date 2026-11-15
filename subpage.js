/**
 * SUBPAGE CONTROLLER — projects.html & stacks.html
 * Handles: theme toggle, mobile nav, AI panel tap interactions
 */
document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');

  // ── Theme ──
  const storedTheme = localStorage.getItem('jkc-theme') || 'dark';
  applyTheme(storedTheme);

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('jkc-theme', theme);
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = htmlEl.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // ── Mobile Nav (fade ease) ──
  if (mobileMenuBtn && mobileNav) {
    const mobileCloseBtn = document.getElementById('mobile-close-btn');

    function openMobileNav() {
      mobileNav.style.display = 'flex';
      requestAnimationFrame(() => {
        mobileNav.classList.add('open');
        mobileMenuBtn.classList.add('active');
      });
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileNav() {
      mobileNav.classList.remove('open');
      mobileMenuBtn.classList.remove('active');
      setTimeout(() => {
        if (!mobileNav.classList.contains('open')) mobileNav.style.display = 'none';
      }, 280);
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }

    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.contains('open');
      if (!isOpen) openMobileNav();
      else closeMobileNav();
    });

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', closeMobileNav);
    }

    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  // ── Page Fade Ease Transition ──
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    if (link.target === '_blank') return;

    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      document.body.classList.add('page-fading-out');
      setTimeout(() => {
        window.location.href = href;
      }, 240);
    });
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-fading-out');
  });

  // ── AI Panel tap-to-reveal on mobile ──
  const aiPanels = document.querySelectorAll('.ai-panel-card');
  aiPanels.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.ai-external-link')) return;
      const wasActive = card.classList.contains('active');
      aiPanels.forEach(c => c.classList.remove('active'));
      if (!wasActive) card.classList.add('active');
    });
  });

  // ── Sticky header shadow on scroll ──
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (header) {
      header.style.boxShadow = window.scrollY > 20
        ? '0 1px 24px rgba(0,0,0,0.5)'
        : 'none';
    }
  }, { passive: true });
});
