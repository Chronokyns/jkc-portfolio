/**
 * JHON KYN CABRIGAS (JKC) — PORTFOLIO CONTROLLER
 * Architecture: Modular Vanilla ES6+ with 2D Elastic Collision Physics & RAF
 */

document.addEventListener('DOMContentLoaded', () => {
  const htmlEl = document.documentElement;
  const introScreen = document.getElementById('intro-screen');
  const pixelCanvas = document.getElementById('pixel-canvas');
  const introLogoContainer = document.getElementById('intro-logo-container');
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
     1. 5-SECOND INTRO PREVIEW ANIMATION: PIXEL PARTICLE ASSEMBLY
     Only "JKC" is shown! Glowing emerald pixels assemble into the letters.
     Runs strictly ONCE per session so navigating back from other screens does NOT reload it.
     ========================================================================== */
  let introDismissed = false;
  const HAS_SEEN_INTRO = sessionStorage.getItem('jkc_intro_seen') === 'true';

  function dismissIntro() {
    if (introDismissed) return;
    introDismissed = true;
    sessionStorage.setItem('jkc_intro_seen', 'true');
    document.documentElement.classList.remove('intro-active');
    
    if (introScreen) {
      introScreen.classList.add('hide-intro');
      setTimeout(() => {
        introScreen.style.display = 'none';
        introScreen.remove();
      }, 850);
    }

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

  // If already visited during this browser session, skip intro immediately
  if (HAS_SEEN_INTRO) {
    introDismissed = true;
    document.documentElement.classList.remove('intro-active');
    if (introScreen) {
      introScreen.style.display = 'none';
      introScreen.remove();
    }
    if (heroPortrait) {
      heroPortrait.style.opacity = '1';
      heroPortrait.style.transform = 'scale(1)';
    }
  }

  function startPixelIntro() {
    if (HAS_SEEN_INTRO) return;
    sessionStorage.setItem('jkc_intro_seen', 'true');

    if (!pixelCanvas) {
      setTimeout(dismissIntro, 5000);
      return;
    }

    const ctx = pixelCanvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    pixelCanvas.width = width * dpr;
    pixelCanvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Create offscreen text canvas to sample points for "JKC"
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    offscreen.width = width;
    offscreen.height = height;

    const fontSize = width < 768 ? Math.min(width * 0.34, 145) : Math.min(width * 0.22, 220);
    offCtx.fillStyle = '#ffffff';
    offCtx.font = `900 ${fontSize}px 'Space Grotesk', -apple-system, sans-serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('JKC', width / 2, height / 2);

    const imgData = offCtx.getImageData(0, 0, width, height).data;
    const particles = [];
    const step = width < 768 ? 4 : 5; // Pixel density grid size

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const index = (y * width + x) * 4;
        if (imgData[index + 3] > 128) {
          // Point belongs to "JKC"
          const angle = Math.random() * Math.PI * 2;
          const dist = (Math.max(width, height) * 0.62) + Math.random() * 220;
          particles.push({
            targetX: x,
            targetY: y,
            x: x + Math.cos(angle) * dist,
            y: y + Math.sin(angle) * dist,
            startX: x + Math.cos(angle) * dist,
            startY: y + Math.sin(angle) * dist,
            size: step - 0.8,
            delay: Math.random() * 0.45,
            speed: 0.85 + Math.random() * 0.45,
            hue: Math.random() > 0.25 ? '#10b981' : '#34d399'
          });
        }
      }
    }

    const startTime = performance.now();
    const ASSEMBLY_DURATION = 1950; // Assembles into "JKC" in ~1.95s
    const TOTAL_INTRO_TIME = 5000;   // Exactly 5.0 seconds total

    function renderPixelIntro(now) {
      if (introDismissed) return;

      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      // Faint ambient background pulse
      const pulse = 0.5 + Math.sin(elapsed * 0.003) * 0.2;
      const grad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width * 0.55);
      grad.addColorStop(0, `rgba(16, 185, 129, ${pulse * 0.18})`);
      grad.addColorStop(1, 'rgba(3, 4, 5, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Determine glow once assembled
      const isAssembled = elapsed > 2000;
      if (isAssembled) {
        ctx.shadowColor = 'rgba(16, 185, 129, 0.75)';
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      // Render assembling pixels
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const localT = Math.max(0, Math.min(1, (elapsed - p.delay * 1000) / (ASSEMBLY_DURATION * p.speed)));
        
        // Snappy exponential easing
        const ease = localT === 1 ? 1 : 1 - Math.pow(2, -10 * localT);

        p.x = p.startX + (p.targetX - p.startX) * ease;
        p.y = p.startY + (p.targetY - p.startY) * ease;

        ctx.fillStyle = p.hue;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      // Reset shadow for next frame
      ctx.shadowBlur = 0;

      if (elapsed < TOTAL_INTRO_TIME) {
        requestAnimationFrame(renderPixelIntro);
      } else {
        dismissIntro();
      }
    }

    requestAnimationFrame(renderPixelIntro);
  }

  if (!HAS_SEEN_INTRO) {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startPixelIntro);
    } else {
      startPixelIntro();
    }
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
     3. 3D CAROUSEL CONTROLLER (Swapping Cards on Side Click)
     ========================================================================== */
  if (cards.length > 0) {
    function updateCarousel(newIndex) {
      currentCardIndex = (newIndex + totalCards) % totalCards;
      
      if (totalCards === 2) {
        cards.forEach((card, idx) => {
          card.classList.remove('active', 'prev', 'next', 'hidden');
          card.setAttribute('aria-selected', 'false');
          if (idx === currentCardIndex) {
            card.classList.add('active');
            card.setAttribute('aria-selected', 'true');
            card.setAttribute('tabindex', '0');
          } else {
            // When card 0 is active, card 1 shows at next (+offset); when card 1 is active, card 0 shows at prev (-offset)
            card.classList.add(currentCardIndex === 0 ? 'next' : 'prev');
            card.setAttribute('tabindex', '0');
          }
        });
      } else {
        const prevIndex = (currentCardIndex - 1 + totalCards) % totalCards;
        const nextIndex = (currentCardIndex + 1) % totalCards;

        cards.forEach((card, idx) => {
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
      }

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

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const targetIndex = parseInt(dot.getAttribute('data-index'), 10);
        updateCarousel(targetIndex);
      });
    });

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

      // Mobile Touch Swipe for carousel
      let touchStartX = 0;
      let touchEndX = 0;

      carouselStage.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      carouselStage.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance > 45) {
          updateCarousel(currentCardIndex - 1);
        } else if (swipeDistance < -45) {
          updateCarousel(currentCardIndex + 1);
        }
      }, { passive: true });
    }

    updateCarousel(0);
  }

  /* ==========================================================================
     4. 2D ELASTIC BOUNCE & COLLISION PHYSICS FOR LANGUAGES
     Badges bounce off walls AND each other so they NEVER overlap!
     Supports direct dragging with mouse & finger.
     ========================================================================== */
  const arena = document.getElementById('draggable-arena');
  const badgeEls = Array.from(document.querySelectorAll('.drag-badge'));

  if (arena && badgeEls.length > 0) {
    const bodies = [];

    // Initialize physical bodies
    badgeEls.forEach((el, i) => {
      bodies.push({
        el: el,
        x: 0,
        y: 0,
        vx: (i % 2 === 0 ? 0.75 : -0.75) * (0.8 + Math.random() * 0.4),
        vy: (i < 2 ? 0.65 : -0.65) * (0.8 + Math.random() * 0.4),
        width: 90,
        height: 80,
        radius: 46,
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0,
        lastDragX: 0,
        lastDragY: 0,
        lastDragTime: 0
      });
    });

    function resetArenaLayout() {
      const arenaW = arena.clientWidth || 320;
      const arenaH = arena.clientHeight || 240;

      // Position in 4 distinct quadrants initially
      const initPositions = [
        { x: arenaW * 0.1, y: arenaH * 0.15 },
        { x: arenaW * 0.65, y: arenaH * 0.12 },
        { x: arenaW * 0.16, y: arenaH * 0.55 },
        { x: arenaW * 0.62, y: arenaH * 0.52 }
      ];

      bodies.forEach((b, i) => {
        const rect = b.el.getBoundingClientRect();
        if (rect.width > 0) {
          b.width = rect.width;
          b.height = rect.height;
          b.radius = Math.max(rect.width, rect.height) / 2;
        }
        b.x = Math.max(5, Math.min(initPositions[i].x, arenaW - b.width - 5));
        b.y = Math.max(5, Math.min(initPositions[i].y, arenaH - b.height - 5));
      });
    }

    // Set initial positions after rendering
    setTimeout(resetArenaLayout, 60);
    window.addEventListener('resize', resetArenaLayout);

    // Pointer Dragging Listeners
    bodies.forEach((b) => {
      b.el.addEventListener('pointerdown', (e) => {
        b.isDragging = true;
        b.el.classList.add('dragging');
        b.el.setPointerCapture(e.pointerId);

        const arenaRect = arena.getBoundingClientRect();
        b.dragOffsetX = (e.clientX - arenaRect.left) - b.x;
        b.dragOffsetY = (e.clientY - arenaRect.top) - b.y;

        b.lastDragX = e.clientX;
        b.lastDragY = e.clientY;
        b.lastDragTime = performance.now();
      });

      b.el.addEventListener('pointermove', (e) => {
        if (!b.isDragging) return;
        const arenaRect = arena.getBoundingClientRect();
        const now = performance.now();
        const dt = Math.max(now - b.lastDragTime, 1);

        b.x = (e.clientX - arenaRect.left) - b.dragOffsetX;
        b.y = (e.clientY - arenaRect.top) - b.dragOffsetY;

        // Calculate toss velocity on drag
        b.vx = ((e.clientX - b.lastDragX) / dt) * 8;
        b.vy = ((e.clientY - b.lastDragY) / dt) * 8;

        // Clamp extreme speeds
        const maxV = 3.5;
        b.vx = Math.max(-maxV, Math.min(maxV, b.vx));
        b.vy = Math.max(-maxV, Math.min(maxV, b.vy));

        b.lastDragX = e.clientX;
        b.lastDragY = e.clientY;
        b.lastDragTime = now;
      });

      function endDrag(e) {
        if (!b.isDragging) return;
        b.isDragging = false;
        b.el.classList.remove('dragging');

        // Ensure minimum speed so it keeps floating
        if (Math.abs(b.vx) < 0.3) b.vx = (Math.random() > 0.5 ? 0.7 : -0.7);
        if (Math.abs(b.vy) < 0.3) b.vy = (Math.random() > 0.5 ? 0.6 : -0.6);

        try {
          b.el.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }

      b.el.addEventListener('pointerup', endDrag);
      b.el.addEventListener('pointercancel', endDrag);
    });

    // Main 2D Physics Animation Loop (60fps)
    function physicsTick() {
      const arenaW = arena.clientWidth;
      const arenaH = arena.clientHeight;

      if (arenaW > 0 && arenaH > 0) {
        // 1. Move and Wall Collisions
        bodies.forEach((b) => {
          if (!b.isDragging) {
            b.x += b.vx;
            b.y += b.vy;

            // Left / Right Wall Bounce
            if (b.x <= 0) {
              b.x = 0;
              b.vx = Math.abs(b.vx);
            } else if (b.x + b.width >= arenaW) {
              b.x = arenaW - b.width;
              b.vx = -Math.abs(b.vx);
            }

            // Top / Bottom Wall Bounce
            if (b.y <= 0) {
              b.y = 0;
              b.vy = Math.abs(b.vy);
            } else if (b.y + b.height >= arenaH) {
              b.y = arenaH - b.height;
              b.vy = -Math.abs(b.vy);
            }
          }
        });

        // 2. Pairwise Collision Check & Elastic Bounce (Never Overlap!)
        for (let i = 0; i < bodies.length; i++) {
          for (let j = i + 1; j < bodies.length; j++) {
            const b1 = bodies[i];
            const b2 = bodies[j];

            const c1x = b1.x + b1.width / 2;
            const c1y = b1.y + b1.height / 2;
            const c2x = b2.x + b2.width / 2;
            const c2y = b2.y + b2.height / 2;

            const dx = c2x - c1x;
            const dy = c2y - c1y;
            const dist = Math.hypot(dx, dy);
            const minDist = (b1.radius + b2.radius) * 0.92;

            if (dist < minDist && dist > 0.001) {
              // Normalized collision vector
              const nx = dx / dist;
              const ny = dy / dist;

              // Overlap separation: push them apart
              const overlap = (minDist - dist) * 0.52;
              if (!b1.isDragging) {
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
              }
              if (!b2.isDragging) {
                b2.x += nx * overlap;
                b2.y += ny * overlap;
              }

              // Elastic bounce: exchange normal velocities
              const kx = b1.vx - b2.vx;
              const ky = b1.vy - b2.vy;
              const p = 2 * (nx * kx + ny * ky) / 2; // equal mass

              if (!b1.isDragging) {
                b1.vx -= p * nx;
                b1.vy -= p * ny;
              }
              if (!b2.isDragging) {
                b2.vx += p * nx;
                b2.vy += p * ny;
              }
            }
          }
        }

        // 3. Render Positions
        bodies.forEach((b) => {
          b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
        });
      }

      requestAnimationFrame(physicsTick);
    }

    requestAnimationFrame(physicsTick);
  }

  /* ==========================================================================
     5. AI WORKBENCH PANELS (Tap / Hover Toggle)
     ========================================================================== */
  const aiPanels = document.querySelectorAll('.ai-panel-card');

  aiPanels.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.ai-external-link')) return;
      // Toggle active color state on mobile tap if not already active
      const wasActive = card.classList.contains('active');
      aiPanels.forEach((c) => c.classList.remove('active'));
      if (!wasActive) {
        card.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     6. CURSOR GLOW & HERO PARALLAX
     ========================================================================== */
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentGlowX = mouseX;
  let currentGlowY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (heroStage && heroPortrait && window.innerWidth > 992) {
      const rect = heroStage.getBoundingClientRect();
      const stageCenterX = rect.left + rect.width / 2;
      const stageCenterY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - stageCenterX) / (rect.width / 2);
      const deltaY = (e.clientY - stageCenterY) / (rect.height / 2);

      const rotateY = deltaX * 3.5;
      const rotateX = -deltaY * 2.5;
      const moveX = deltaX * 6;

      heroPortrait.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${moveX}px)`;
      
      if (heroJkcText) {
        heroJkcText.style.transform = `translate(${-deltaX * 10}px, ${-deltaY * 5}px)`;
      }
    }
  }, { passive: true });

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
     7. EMAIL COPY TO CLIPBOARD INTERACTION
     ========================================================================== */
  const copyBtn = document.getElementById('copy-email-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  const emailAddress = 'jhonkyn.cabrigas@gmail.com';

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emailAddress);
        if (copyBtnText) copyBtnText.textContent = 'Copied to Clipboard! ✓';
        copyBtn.style.borderColor = 'var(--emerald-primary)';
        copyBtn.style.color = 'var(--emerald-primary)';

        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Email';
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2500);
      } catch (err) {
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
     8. MOBILE NAVIGATION MENU (Fade ease animation)
     ========================================================================== */
  if (mobileMenuBtn && mobileNav) {
    const mobileCloseBtn = document.getElementById('mobile-close-btn');

    function openMobileNav() {
      document.body.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
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
      document.body.classList.remove('menu-open');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!mobileNav.classList.contains('open')) {
          mobileNav.style.display = 'none';
        }
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

    // Close on nav link click
    mobileNav.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileNav();
      });
    });
  }

  /* ==========================================================================
     9. SMOOTH PAGE FADE TRANSITION
     Smoothly fades out on page navigation for an effortless transition
     ========================================================================== */
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

  /* ==========================================================================
     10. CONTACT FORM DISPATCH MOCK
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
