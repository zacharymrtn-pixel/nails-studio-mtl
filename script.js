/* =============================================
   NAILS STUDIO MTL — JavaScript
   ============================================= */

'use strict';

/* =============================================
   1. NAVBAR — scroll state & mobile menu
   ============================================= */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

// Scrolled state
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Mobile menu toggle
hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close menu on nav link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* =============================================
   2. SCROLL REVEAL
   ============================================= */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children inside sections
        const delay = entry.target.dataset.delay
          ? parseFloat(entry.target.dataset.delay)
          : 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Stagger siblings within the same parent
document.querySelectorAll('.reveal').forEach((el, idx) => {
  // Find siblings with .reveal in the same parent
  const siblings = Array.from(el.parentElement.querySelectorAll(':scope > .reveal'));
  const posInParent = siblings.indexOf(el);
  if (posInParent > 0) {
    el.dataset.delay = posInParent * 100;
  }
  revealObserver.observe(el);
});

/* =============================================
   3. ACTIVE NAV LINK on scroll
   ============================================= */
const sections = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link:not(.btn-nav)');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.style.opacity = link.getAttribute('href') === `#${entry.target.id}`
            ? '1'
            : '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.fontWeight = '500';
          } else {
            link.style.fontWeight = '';
          }
        });
      }
    });
  },
  { threshold: 0.35 }
);
sections.forEach(s => sectionObserver.observe(s));

/* =============================================
   4. GALLERY — lightbox effect
   ============================================= */
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `Voir ${item.dataset.label || 'photo'}`);

  const openLightbox = () => {
    const label = item.dataset.label || '';
    const placeholder = item.querySelector('.gallery-placeholder');
    const bgColor = placeholder
      ? getComputedStyle(placeholder).background
      : 'linear-gradient(135deg, #e8b4b8, #d4878e)';

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <div class="lightbox-box">
        <div class="lightbox-img" style="background:${bgColor}"></div>
        <p class="lightbox-label">${label}</p>
        <button class="lightbox-close" aria-label="Fermer">✕</button>
      </div>`;

    // Inline styles for lightbox (avoids CSS conflicts)
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: '999',
      background: 'rgba(44,35,32,.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)',
      animation: 'lightboxFadeIn .3s ease',
    });
    const box = overlay.querySelector('.lightbox-box');
    Object.assign(box.style, {
      position: 'relative', borderRadius: '16px', overflow: 'hidden',
      maxWidth: '640px', width: '90vw',
      boxShadow: '0 32px 80px rgba(0,0,0,.4)',
    });
    const img = overlay.querySelector('.lightbox-img');
    Object.assign(img.style, {
      width: '100%', paddingBottom: '70%',
    });
    const lbl = overlay.querySelector('.lightbox-label');
    Object.assign(lbl.style, {
      position: 'absolute', bottom: '0', left: '0', right: '0',
      padding: '16px 20px',
      background: 'linear-gradient(to top, rgba(44,35,32,.8), transparent)',
      color: '#fff', fontFamily: "'Cormorant Garamond', serif",
      fontSize: '1.1rem', fontStyle: 'italic',
    });
    const closeBtn = overlay.querySelector('.lightbox-close');
    Object.assign(closeBtn.style, {
      position: 'absolute', top: '12px', right: '12px',
      width: '36px', height: '36px', borderRadius: '50%',
      background: 'rgba(255,255,255,.15)', border: 'none',
      color: '#fff', fontSize: '1rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const close = () => {
      overlay.style.animation = 'lightboxFadeOut .25s ease forwards';
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 250);
    };

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });
  };

  item.addEventListener('click', openLightbox);
  item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openLightbox(); });
});

// Inject lightbox keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes lightboxFadeIn  { from { opacity:0; } to { opacity:1; } }
  @keyframes lightboxFadeOut { from { opacity:1; } to { opacity:0; } }
`;
document.head.appendChild(styleSheet);

/* =============================================
   5. BOOKING FORM — validation & submission
   ============================================= */
const form        = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');

// Set min date to today
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// Inline error messages
function showError(input, msg) {
  clearError(input);
  input.style.borderColor = '#e05a6a';
  const err = document.createElement('span');
  err.className = 'field-error';
  err.style.cssText = 'font-size:.78rem;color:#e05a6a;margin-top:4px;display:block;';
  err.textContent = msg;
  input.parentElement.appendChild(err);
}
function clearError(input) {
  input.style.borderColor = '';
  const prev = input.parentElement.querySelector('.field-error');
  if (prev) prev.remove();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  const fields = [
    { el: form.firstName, msg: 'Veuillez entrer votre prénom.' },
    { el: form.lastName,  msg: 'Veuillez entrer votre nom.' },
    { el: form.email,     msg: 'Veuillez entrer votre courriel.', extra: () => validateEmail(form.email.value) ? null : 'Courriel invalide.' },
    { el: form.service,   msg: 'Veuillez choisir un service.' },
    { el: form.date,      msg: 'Veuillez choisir une date.' },
  ];

  fields.forEach(({ el, msg, extra }) => {
    clearError(el);
    if (!el.value.trim()) {
      showError(el, msg); valid = false;
    } else if (extra) {
      const extraMsg = extra();
      if (extraMsg) { showError(el, extraMsg); valid = false; }
    }
  });

  if (!valid) return;

  // Simulate async submission
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="btn-text">Envoi en cours…</span>';

  setTimeout(() => {
    form.hidden = true;
    formSuccess.hidden = false;
  }, 1200);
});

// Real-time validation clear
form.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => clearError(el));
  el.addEventListener('change', () => clearError(el));
});

/* =============================================
   6. SMOOTH PARALLAX for hero bg
   ============================================= */
const heroBg = document.querySelector('.hero-bg');
if (heroBg) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        heroBg.style.transform = `translateY(${y * 0.35}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* =============================================
   7. COUNTER ANIMATION for about strip
   ============================================= */
const counterEls = document.querySelectorAll('.strip-number');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    // Extract the numeric part (before em tag)
    const text = el.childNodes[0].textContent.trim();
    const target = parseFloat(text);
    const isDecimal = text.includes('.');
    const suffix = el.querySelector('em')?.textContent || '';
    const duration = 1200;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal
        ? (eased * target).toFixed(1)
        : Math.floor(eased * target);
      el.childNodes[0].textContent = current;
      if (progress < 1) requestAnimationFrame(update);
      else el.childNodes[0].textContent = text; // restore original
    }
    requestAnimationFrame(update);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counterEls.forEach(el => counterObserver.observe(el));

/* =============================================
   8. CURSOR GLOW (desktop only)
   ============================================= */
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position: 'fixed',
    width: '400px', height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232,180,184,.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    transform: 'translate(-50%, -50%)',
    zIndex: '0',
    transition: 'opacity .3s',
  });
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, { passive: true });
}
