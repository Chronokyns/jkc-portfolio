/**
 * JHON KYN CABRIGAS (JKC) — PORTFOLIO CONTROLLER
 * Architecture: Modular Vanilla ES6+ with High-Performance RAF & Touch Support
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initial State & Elements
  const htmlEl = document.documentElement;
  const introScreen = document.getElementById('intro-screen');
  const introTimer = document.getElementById('intro-timer');
  const introProgressBar = document.getElementById('intro-progress-bar');
  const skipIntroBtn = document.getElementById('skip-intro-btn');
  const themeToggle = document.getElementById('theme-toggle');
  const themeLabel = document.getElementById('theme-label');
  const cursorGlow = document.getElementById('cursor-glow');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const heroStage = document.getElementById('hero-stage');
  const heroPortrait = document.getElementById('hero-portrait');
  const heroJkcText = document.getElementById('hero-jkc-text');
  
  // Carousel Elements
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  let currentCardIndex = 0;
  const totalCards = cards.length;

  /* ==========================================================================
     1. 5-SECOND INTRO PREVIEW ANIMATION & COUNTDOWN
     ========================================================================== */
  const INTRO_DURATION_MS = 5000;
  const startTime = performance.now();
  let introDismissed = false;

  function dismissIntro() {
    if (introDismissed) return;
    introDismissed = true;
    
    // Add exit transition
    if (introScreen) {
      introScreen.classList.add('hide-intro');
      setTimeout(() => {
        introScreen.style.display = 'none';
      }, 800);
    }

    // Trigger hero subtle entry animation
    if (heroPortrait) {
      heroPortrait.style.transform = 'scale(0.96)';
      heroPortrait.style.opacity = '0';
      requestAnimationFrame(() => {
        heroPortrait.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out';
        heroPortrait.style.transform = 'scale(1)';
        heroPortrait.style.opacity = '1';
      });
    }
  }

  function runIntroTimer(now) {
    if (introDismissed) return;
    
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / INTRO_DURATION_MS, 1);
    const remainingSeconds = Math.max((INTRO_DURATION_MS - elapsed) / 1000, 0);

    // Update UI elements
    if (introProgressBar) {
      introProgressBar.style.width = `${progress * 100}%`;
    }
    if (introTimer) {
      introTimer.textContent = `${remainingSeconds.toFixed(1)}s`;
    }

    if (progress < 1) {
      requestAnimationFrame(runIntroTimer);
    } else {
      dismissIntro();
    }
  }

  requestAnimationFrame(runIntroTimer);

  if (skipIntroBtn) {
    skipIntroBtn.addEventListener('click', (e) => {
      e.preventDefault();
      dismissIntro();
    });
  }

  /* ==========================================================================
     2. THEME SWITCHER: DARK MODE & WHITE MODE
     ========================================================================== */
  const storedTheme = localStorage.getItem('jkc-theme') || 'dark';
  applyTheme(storedTheme);

  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('jkc-theme', theme);
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }

  /* ==========================================================================
     3. 3D CAROUSEL CONTROLLER (Matching Screenshot Functionality)
     ========================================================================== */
  function updateCarousel(newIndex) {
    currentCardIndex = (newIndex + totalCards) % totalCards;
    
    const prevIndex = (currentCardIndex - 1 + totalCards) % totalCards;
    const nextIndex = (currentCardIndex + 1) % totalCards;

    cards.forEach((card, idx) => {
      // Remove all positional classes
      card.classList.remove('active', 'prev', 'next', 'hidden');
      card.setAttribute('aria-selected', 'false');

      if (idx === currentCardIndex) {
        card.classList.add('active');
        card.setAttribute('aria-selected', 'true');
        card.setAttribute('tabindex', '0');
      } else if (idx === prevIndex) {
        card.classList.add('prev');
        card.setAttribute('tabindex', '0');
      } else if (idx === nextIndex) {
        card.classList.add('next');
        card.setAttribute('tabindex', '0');
      } else {
        card.classList.add('hidden');
        card.setAttribute('tabindex', '-1');
      }
    });

    // Update pagination dots
    dots.forEach((dot, idx) => {
      if (idx === currentCardIndex) {
        dot.classList.add('active');
        dot.setAttribute('aria-selected', 'true');
      } else {
        dot.classList.remove('active');
        dot.setAttribute('aria-selected', 'false');
      }
    });
  }

  // Card click event listeners: clicking side card swaps it to the front
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (idx !== currentCardIndex) {
        updateCarousel(idx);
      }
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateCarousel(idx);
      }
    });
  });

  // Prev & Next Buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      updateCarousel(currentCardIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      updateCarousel(currentCardIndex + 1);
    });
  }

  // Pagination Dots Click
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
      updateCarousel(targetIndex);
    });
  });

  // Keyboard navigation for carousel
  const carouselStage = document.getElementById('carousel-stage');
  if (carouselStage) {
    carouselStage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        updateCarousel(currentCardIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        updateCarousel(currentCardIndex + 1);
      }
    });
  }

  // Mobile Touch Swipe support for carousel
  let touchStartX = 0;
  let touchEndX = 0;

  if (carouselStage) {
    carouselStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselStage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    const threshold = 45; // min pixels to count as swipe
    if (swipeDistance > threshold) {
      updateCarousel(currentCardIndex - 1);
    } else if (swipeDistance < -threshold) {
      updateCarousel(currentCardIndex + 1);
    }
  }

  // Initial Carousel setup
  updateCarousel(0);

  /* ==========================================================================
     4. CURSOR GLOW & HERO PARALLAX INTERACTION
     ========================================================================== */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentGlowX = mouseX;
  let currentGlowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Subtle 3D tilt on hero portrait on desktop
    if (heroStage && heroPortrait && window.innerWidth > 992) {
      const rect = heroStage.getBoundingClientRect();
      const stageCenterX = rect.left + rect.width / 2;
      const stageCenterY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - stageCenterX) / (rect.width / 2);
      const deltaY = (e.clientY - stageCenterY) / (rect.height / 2);

      // Gentle parallax values
      const rotateY = deltaX * 4;
      const rotateX = -deltaY * 3;
      const moveX = deltaX * 8;

      heroPortrait.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${moveX}px)`;
      
      if (heroJkcText) {
        heroJkcText.style.transform = `translate(${-deltaX * 12}px, ${-deltaY * 6}px)`;
      }
    }
  }, { passive: true });

  // Reset portrait tilt when mouse leaves
  if (heroStage) {
    heroStage.addEventListener('mouseleave', () => {
      if (heroPortrait) {
        heroPortrait.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateX(0px)';
      }
      if (heroJkcText) {
        heroJkcText.style.transform = 'translate(0px, 0px)';
      }
    });
  }

  // Smooth lerp for ambient glow
  function animateCursorGlow() {
    if (cursorGlow) {
      currentGlowX += (mouseX - currentGlowX) * 0.12;
      currentGlowY += (mouseY - currentGlowY) * 0.12;
      cursorGlow.style.left = `${currentGlowX}px`;
      cursorGlow.style.top = `${currentGlowY}px`;
    }
    requestAnimationFrame(animateCursorGlow);
  }
  requestAnimationFrame(animateCursorGlow);

  /* ==========================================================================
     5. EMAIL COPY TO CLIPBOARD INTERACTION
     ========================================================================== */
  const copyBtn = document.getElementById('copy-email-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const emailAddress = 'jhonkyn.cabrigas@gmail.com';

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emailAddress);
        if (copyBtnText) {
          copyBtnText.textContent = 'Copied to Clipboard! ✓';
        }
        copyBtn.style.borderColor = 'var(--emerald-primary)';
        copyBtn.style.color = 'var(--emerald-primary)';

        setTimeout(() => {
          if (copyBtnText) {
            copyBtnText.textContent = 'Copy Email';
          }
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2500);
      } catch (err) {
        // Fallback for clipboard
        const input = document.createElement('input');
        input.value = emailAddress;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        if (copyBtnText) copyBtnText.textContent = 'Copied! ✓';
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Email';
        }, 2000);
      }
    });
  }

  /* ==========================================================================
     6. MOBILE NAVIGATION MENU
     ========================================================================== */
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      const isOpen = mobileNav.classList.contains('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    const mobileNavLinks = mobileNav.querySelectorAll('.mobile-nav-link');
    mobileNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
      });
    });
  }

  /* ==========================================================================
     7. CONTACT FORM DISPATCH MOCK
     ========================================================================== */
  window.handleContactSubmit = function() {
    const feedback = document.getElementById('form-feedback');
    const submitBtn = document.getElementById('contact-submit-btn');
    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const messageInput = document.getElementById('contact-message');

    if (feedback && submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Transmitting...</span>';

      setTimeout(() => {
        feedback.className = 'form-feedback success';
        feedback.textContent = `✓ Thank you, ${nameInput.value}! Your message has been dispatched. Jhon Kyn Cabrigas will be in touch soon.`;
        
        nameInput.value = '';
        emailInput.value = '';
        messageInput.value = '';

        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Dispatch Message</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>`;
      }, 1000);
    }
  };

});
