/**
 * ==========================================================================
 * PORTFOLIO PROFESIONAL — GEMA ESPADA
 * Desarrolladora Full Stack en formación
 * Lógica e interactividad: script.js
 * (Las traducciones están en i18n.js)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // Inicialización de todas las funcionalidades
  initI18n();
  initTheme();
  initMobileMenu();
  initHeaderScroll();
  initActiveNavOnScroll();
  initHeroAnimations();
  initCertificationsGallery();
  initScrollReveal();
  initContactForm();
  initWhatsAppFloat();
  initDynamicYear();
});

/* --------------------------------------------------------------------------
   Utilidades de almacenamiento (el almacenamiento local puede no estar
   disponible, por ejemplo en navegación privada: se ignora el error)
   -------------------------------------------------------------------------- */
const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* sin persistencia */ } }
};

/* --------------------------------------------------------------------------
   Idioma (ES / EN)
   -------------------------------------------------------------------------- */
const langState = { current: 'es', listeners: [] };

/** Devuelve el texto traducido a partir de su clave, sustituyendo {variables}. */
function t(key, vars) {
  const dict = window.I18N || { es: {}, en: {} };
  let text = (dict[langState.current] && dict[langState.current][key]);
  if (text === undefined) text = dict.es[key];
  if (text === undefined) return key;
  if (vars) Object.keys(vars).forEach((name) => { text = text.split(`{${name}}`).join(vars[name]); });
  return text;
}

/**
 * 0. Selector de idioma: el texto en español se toma del propio HTML y las
 * traducciones al inglés de i18n.js. Se recuerda la preferencia del visitante.
 */
function initI18n() {
  const dict = window.I18N;
  if (!dict) return;

  // Captura del español original (el HTML se carga siempre en español)
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (!(key in dict.es)) dict.es[key] = el.textContent.trim();
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    parseAttrMap(el).forEach(({ attr, key }) => {
      if (!(key in dict.es)) dict.es[key] = el.getAttribute(attr) || '';
    });
  });

  const buttons = document.querySelectorAll('.lang-btn');
  buttons.forEach((btn) => btn.addEventListener('click', () => setLanguage(btn.dataset.lang, true)));

  const saved = store.get('portfolio-lang');
  setLanguage(saved === 'en' ? 'en' : 'es', false);
}

function parseAttrMap(el) {
  return el.getAttribute('data-i18n-attr').split(';').filter(Boolean).map((pair) => {
    const idx = pair.indexOf(':');
    return { attr: pair.slice(0, idx), key: pair.slice(idx + 1) };
  });
}

function setLanguage(lang, persist) {
  langState.current = lang === 'en' ? 'en' : 'es';
  document.documentElement.setAttribute('lang', langState.current);
  if (persist) store.set('portfolio-lang', langState.current);

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    parseAttrMap(el).forEach(({ attr, key }) => el.setAttribute(attr, t(key)));
  });

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.lang === langState.current));
  });

  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute('content', langState.current === 'en' ? 'en_US' : 'es_ES');

  updateThemeLabel();
  updateWhatsAppLink();
  langState.listeners.forEach((fn) => fn());
}

function onLanguageChange(fn) { langState.listeners.push(fn); }

/* --------------------------------------------------------------------------
   Tema claro / oscuro
   -------------------------------------------------------------------------- */
function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function updateThemeLabel() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const label = t(currentTheme() === 'dark' ? 'theme.toLight' : 'theme.toDark');
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
}

/**
 * 0b. Selector de tema (claro por defecto). La preferencia se guarda en
 * localStorage y se aplica antes del primer pintado desde el <head>.
 */
function syncFavicon(theme) {
  const isDark = theme ? theme === 'dark' : currentTheme() === 'dark';
  const targetSvg = isDark ? '/favicon-dark.svg' : '/favicon-light.svg';
  const svgFavicon = document.getElementById('favicon-svg') || document.querySelector('link[type="image/svg+xml"]');
  if (svgFavicon) {
    // Si ya tiene el href correcto, no tocar
    if (svgFavicon.getAttribute('href') !== targetSvg) {
      svgFavicon.setAttribute('href', targetSvg);
    }
  }
}

function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const metaColor = document.getElementById('meta-theme-color');
  const syncMeta = () => { if (metaColor) metaColor.setAttribute('content', currentTheme() === 'dark' ? '#0a0f24' : '#ffffff'); };
  syncMeta();
  syncFavicon();
  updateThemeLabel();
  if (!btn) return;

  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    // La clase de transición solo existe durante el cambio para no penalizar el rendimiento
    root.classList.add('theme-transition');
    root.setAttribute('data-theme', next);
    store.set('portfolio-theme', next);
    syncMeta();
    syncFavicon(next);
    updateThemeLabel();
    window.setTimeout(() => root.classList.remove('theme-transition'), 450);
  });
}

/**
 * 1. Control del menú de navegación en dispositivos móviles
 */
function initMobileMenu() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const BREAKPOINT = 1080; // debe coincidir con el @media del CSS

  if (!navToggle || !navMenu) return;

  // Alternar apertura y cierre del menú
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('is-active');
  });

  // Cerrar menú automáticamente al pulsar sobre cualquier enlace de navegación
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('is-active')) {
        navMenu.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-active')) {
      navMenu.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.focus();
    }
  });

  // Cerrar si se redimensiona a pantalla de escritorio
  window.addEventListener('resize', () => {
    if (window.innerWidth > BREAKPOINT && navMenu.classList.contains('is-active')) {
      navMenu.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * 2. Efecto visual en la barra de navegación superior al desplazarse (scroll).
 */
function initHeaderScroll() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    header.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  const handleScroll = () => {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  update(); // Verificación inicial
}

/**
 * 3. Detección y resaltado de la sección activa en el menú de navegación
 */
function initActiveNavOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');

        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/**
 * 4. Animaciones suaves de aparición de tarjetas y contenidos al hacer scroll
 */
/**
 * 3b. Animaciones editoriales de entrada y scroll para la portada (Hero) con GSAP
 */
function initHeroAnimations() {
  if (!window.gsap) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  const tl = window.gsap.timeline({
    defaults: { ease: 'power3.out', duration: 0.85 }
  });

  tl.from('.hero-kicker-line', {
    scaleX: 0,
    duration: 0.65,
    clearProps: 'transform'
  })
    .from('.hero-role', {
      y: 12,
      opacity: 0,
      duration: 0.6,
      clearProps: 'all'
    }, '-=0.45')
    .from('.hero-name-first, .hero-name-last', {
      y: 32,
      opacity: 0,
      stagger: 0.12,
      duration: 0.85,
      clearProps: 'all'
    }, '-=0.4')
    .from('.hero-quote', {
      y: 18,
      opacity: 0,
      duration: 0.7,
      clearProps: 'all'
    }, '-=0.55')
    .from('.hero-bio', {
      y: 16,
      opacity: 0,
      duration: 0.7,
      clearProps: 'all'
    }, '-=0.55')
    .from('.hero-actions .btn', {
      y: 14,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6,
      clearProps: 'all'
    }, '-=0.5')
    .from('.hero-portrait', {
      y: 26,
      opacity: 0,
      scale: 0.98,
      duration: 0.95,
      clearProps: 'all'
    }, 0.18)
    .from('.portrait-img', {
      scale: 1.06,
      duration: 1.25,
      ease: 'power2.out',
      clearProps: 'transform'
    }, 0.18);

  // Transición discreta al hacer scroll
  if (window.ScrollTrigger) {
    window.gsap.to('.portrait-frame', {
      yPercent: -4,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6
      }
    });
  }
}

/**
 * 3c. Línea temporal vertical animada de módulos del máster y visor Liquid Glass (PDF.js + Canvas)
 */
function initCertificationsGallery() {
  const masterTimeline = document.getElementById('master-timeline');
  const timelineRail = document.getElementById('timeline-rail');
  const timelineRailFill = document.getElementById('timeline-rail-fill');
  const timeline = document.getElementById('modules-timeline');
  const modal = document.getElementById('cert-modal');
  const data = Array.isArray(window.CERTIFICATIONS_DATA) ? window.CERTIFICATIONS_DATA : [];
  if (!timeline || !data.length) return;

  const modalTitle = document.getElementById('cert-modal-title');
  const modalViewport = document.getElementById('cert-modal-viewport');
  const modalCanvasWrap = document.getElementById('cert-modal-canvas-wrap');
  const modalCanvas = document.getElementById('cert-modal-canvas');
  const zoomOutBtn = document.getElementById('cert-zoom-out');
  const zoomInBtn = document.getElementById('cert-zoom-in');
  const zoomResetBtn = document.getElementById('cert-zoom-reset');
  const modalCloseBtn = document.getElementById('cert-modal-close');

  if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
  }

  let activeCert = null;
  let lastTriggerEl = null;
  let zoomScale = 1;
  let baseWidthPx = 780;
  let renderToken = 0;

  const ZOOM_MIN = 0.75;
  const ZOOM_MAX = 2.25;
  const ZOOM_STEP = 0.25;

  const getTitle = (item) => {
    if (item.title && typeof item.title === 'object') {
      return item.title[langState.current] || item.title.es || '';
    }
    return String(item.title || '');
  };

  // Mapa plano de todos los certificados (incluidos los hijos de Python) para búsqueda rápida
  const certById = new Map();
  data.forEach((item) => {
    certById.set(item.id, item);
    if (Array.isArray(item.children)) {
      item.children.forEach((child) => certById.set(child.id, child));
    }
  });

  function createCertButton(certItem, isSub = false) {
    const titleText = getTitle(certItem);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `timeline-btn${isSub ? ' timeline-btn--sub' : ''}`;
    btn.dataset.certId = certItem.id;
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-label', t('cert.consultAria', { title: titleText }));
    btn.innerHTML = `
      <span class="timeline-btn-text">${t('cert.consult')}</span>
      <span class="timeline-btn-arrow" aria-hidden="true">↗</span>
    `;
    btn.addEventListener('click', () => openCertModal(certItem, btn));
    return btn;
  }

  // Construcción de los 7 nodos principales y la ramificación secundaria de Python
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const li = document.createElement('li');
    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
    const hasCert = Boolean(item.hasCertificate && item.fileUrl);
    li.className = `timeline-item${hasChildren ? ' timeline-item--branch' : ''}`;
    li.dataset.moduleId = item.id;

    // 1. Nodo circular integrado en la línea vertical
    const node = document.createElement('div');
    node.className = 'timeline-node';
    node.setAttribute('aria-hidden', 'true');
    node.innerHTML = '<span class="timeline-node-core"></span>';

    // 2. Cuerpo del módulo
    const body = document.createElement('div');
    body.className = 'timeline-body';

    const header = document.createElement('div');
    header.className = 'timeline-header';

    const identity = document.createElement('div');
    identity.className = 'timeline-identity';

    if (Array.isArray(item.icons) && item.icons.length) {
      const logosWrap = document.createElement('div');
      logosWrap.className = 'timeline-logos';
      logosWrap.setAttribute('aria-hidden', 'true');
      item.icons.forEach((iconHref) => {
        const badge = document.createElement('span');
        badge.className = 'timeline-logo';
        badge.innerHTML = `<svg><use href="${iconHref}"></use></svg>`;
        logosWrap.appendChild(badge);
      });
      identity.appendChild(logosWrap);
    }

    const titleEl = document.createElement('h4');
    titleEl.className = 'timeline-title';
    titleEl.textContent = getTitle(item);
    identity.appendChild(titleEl);
    header.appendChild(identity);

    if (hasCert) {
      header.appendChild(createCertButton(item, false));
    }

    body.appendChild(header);

    // 3. Ramificación secundaria (Python -> 4 certificados)
    if (hasChildren) {
      const branchList = document.createElement('ul');
      branchList.className = 'timeline-branch';
      item.children.forEach((child) => {
        const subLi = document.createElement('li');
        subLi.className = 'timeline-branch-item';
        subLi.dataset.certId = child.id;

        const subIdentity = document.createElement('div');
        subIdentity.className = 'timeline-subidentity';

        const subNode = document.createElement('span');
        subNode.className = 'timeline-subnode';
        subNode.setAttribute('aria-hidden', 'true');

        const subTitle = document.createElement('span');
        subTitle.className = 'timeline-subtitle';
        subTitle.textContent = getTitle(child);

        subIdentity.appendChild(subNode);
        subIdentity.appendChild(subTitle);
        subLi.appendChild(subIdentity);

        if (child.hasCertificate && child.fileUrl) {
          subLi.appendChild(createCertButton(child, true));
        }

        branchList.appendChild(subLi);
      });
      body.appendChild(branchList);
    }

    li.appendChild(node);
    li.appendChild(body);
    fragment.appendChild(li);
  });

  timeline.innerHTML = '';
  timeline.appendChild(fragment);

  // Geometría exacta y dibujo real de la línea vertical según el avance del scroll
  const timelineItems = Array.from(timeline.querySelectorAll('.timeline-item'));
  const branchContainer = timeline.querySelector('.timeline-branch');
  const branchItems = Array.from(timeline.querySelectorAll('.timeline-branch-item'));

  function layoutAndSyncTimelineScroll() {
    if (!masterTimeline || !timelineRail || !timelineRailFill || !timelineItems.length) return;

    const containerRect = masterTimeline.getBoundingClientRect();
    const firstNode = timelineItems[0].querySelector('.timeline-node');
    const lastNode = timelineItems[timelineItems.length - 1].querySelector('.timeline-node');
    if (!firstNode || !lastNode) return;

    const firstRect = firstNode.getBoundingClientRect();
    const lastRect = lastNode.getBoundingClientRect();

    const startOffset = (firstRect.top - containerRect.top) + (firstRect.height / 2);
    const endOffset = (lastRect.top - containerRect.top) + (lastRect.height / 2);
    const totalLength = Math.max(1, endOffset - startOffset);

    timelineRail.style.top = `${Math.round(startOffset)}px`;
    timelineRail.style.height = `${Math.round(totalLength)}px`;

    // Punto de lectura del viewport (68% de la altura de la ventana)
    const triggerViewportY = window.innerHeight * 0.68;
    const distanceScrolled = triggerViewportY - firstRect.top - (firstRect.height / 2);
    const progress = Math.max(0, Math.min(1, distanceScrolled / totalLength));

    timelineRailFill.style.setProperty('--rail-progress', progress.toFixed(4));

    // Iluminar cada nodo principal cuando el trazo de la línea lo alcanza
    const drawnY = startOffset + (totalLength * progress);
    timelineItems.forEach((itemEl) => {
      const nodeEl = itemEl.querySelector('.timeline-node');
      if (!nodeEl) return;
      const nRect = nodeEl.getBoundingClientRect();
      const nodeCenterOffset = (nRect.top - containerRect.top) + (nRect.height / 2);
      itemEl.classList.toggle('is-reached', drawnY >= nodeCenterOffset - 6);
    });

    // Progreso de la ramificación secundaria de Python e iluminación de sus subnodos
    if (branchContainer && branchItems.length) {
      const bRect = branchContainer.getBoundingClientRect();
      const lastSubRect = branchItems[branchItems.length - 1].getBoundingClientRect();
      const branchLineHeight = Math.max(1, (lastSubRect.top - bRect.top) + (lastSubRect.height / 2));
      branchContainer.style.setProperty('--branch-line-height', `${Math.round(branchLineHeight)}px`);

      const bDist = triggerViewportY - bRect.top;
      const bProgress = Math.max(0, Math.min(1, bDist / branchLineHeight));
      branchContainer.style.setProperty('--branch-progress', bProgress.toFixed(4));

      branchItems.forEach((subEl) => {
        const sRect = subEl.getBoundingClientRect();
        const sCenter = sRect.top + (sRect.height / 2);
        subEl.classList.toggle('is-reached', triggerViewportY >= sCenter);
      });
    }
  }

  let scrollTicking = false;
  const onTimelineScrollOrResize = () => {
    if (!scrollTicking) {
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        scrollTicking = false;
        layoutAndSyncTimelineScroll();
      });
    }
  };

  window.addEventListener('scroll', onTimelineScrollOrResize, { passive: true });
  window.addEventListener('resize', onTimelineScrollOrResize, { passive: true });
  layoutAndSyncTimelineScroll();

  // Microinteracciones de entrada suave para los nodos, logotipos y ramificación
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (window.gsap && !reduceMotion) {
    if (window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    // Entrada escalonada de cada nodo y su tarjeta
    window.gsap.from('#modules-timeline .timeline-item', {
      y: 16,
      opacity: 0,
      duration: 0.48,
      stagger: 0.06,
      ease: 'power2.out',
      clearProps: 'all',
      onComplete: layoutAndSyncTimelineScroll,
      scrollTrigger: window.ScrollTrigger ? {
        trigger: '#master-timeline',
        start: 'top 86%',
        once: true
      } : undefined
    });

    // Aparición suave de los logotipos oficiales junto a cada nodo
    window.gsap.from('#modules-timeline .timeline-logo', {
      scale: 0.82,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'back.out(1.5)',
      clearProps: 'all',
      scrollTrigger: window.ScrollTrigger ? {
        trigger: '#master-timeline',
        start: 'top 86%',
        once: true
      } : undefined
    });

    // Aparición escalonada de la ramificación secundaria de Python
    if (branchItems.length) {
      window.gsap.from('#modules-timeline .timeline-branch-item', {
        x: -10,
        opacity: 0,
        duration: 0.38,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: window.ScrollTrigger ? {
          trigger: '#modules-timeline .timeline-branch',
          start: 'top 88%',
          once: true
        } : undefined
      });
    }

    // Entrada escalonada de las tecnologías y elementos subordinados dentro de cada bloque de Conocimientos
    document.querySelectorAll('#conocimientos .skill-group').forEach((group) => {
      const items = group.querySelectorAll('.tech-item, .tech-subitem, .tech-ledger-row');
      if (!items.length) return;
      window.gsap.from(items, {
        y: 10,
        opacity: 0,
        duration: 0.42,
        stagger: 0.04,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: window.ScrollTrigger ? {
          trigger: group,
          start: 'top 86%',
          once: true
        } : undefined
      });
    });
  }

  function computeBaseWidth() {
    if (!modalViewport) return 760;
    const style = window.getComputedStyle(modalViewport);
    const padX = (parseFloat(style.paddingLeft) || 24) + (parseFloat(style.paddingRight) || 24);
    const availW = Math.max(260, modalViewport.clientWidth - padX);
    return Math.min(820, availW);
  }

  function applyZoomUI() {
    if (zoomResetBtn) {
      zoomResetBtn.textContent = `${Math.round(zoomScale * 100)}%`;
    }
    if (zoomOutBtn) {
      zoomOutBtn.disabled = zoomScale <= ZOOM_MIN + 0.001;
    }
    if (zoomInBtn) {
      zoomInBtn.disabled = zoomScale >= ZOOM_MAX - 0.001;
    }
    if (modalCanvasWrap) {
      const targetWidth = Math.round(baseWidthPx * zoomScale);
      modalCanvasWrap.style.width = `${targetWidth}px`;
    }
  }

  function setZoom(nextScale) {
    zoomScale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(nextScale * 100) / 100));
    applyZoomUI();
  }

  function drawPreviewOnCanvas(previewUrl, token) {
    return new Promise((resolve, reject) => {
      if (!previewUrl || !modalCanvas) {
        reject(new Error('No preview available'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        if (token !== renderToken) {
          resolve();
          return;
        }
        const ctx = modalCanvas.getContext('2d');
        modalCanvas.width = img.naturalWidth || 2049;
        modalCanvas.height = img.naturalHeight || 1447;
        ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
        ctx.drawImage(img, 0, 0, modalCanvas.width, modalCanvas.height);
        modalCanvas.dataset.renderedCert = activeCert ? activeCert.id : '';
        modalCanvas.dataset.renderEngine = 'canvas-image';
        resolve();
      };
      img.onerror = (err) => reject(err);
      img.src = previewUrl;
    });
  }

  async function renderCertToCanvas(cert, token) {
    if (!modalCanvas || !cert) return;
    if (modalViewport) modalViewport.classList.add('is-loading');

    try {
      // Intentar primero renderizado vectorial directo del PDF mediante PDF.js en <canvas>
      if (window.pdfjsLib && typeof window.pdfjsLib.getDocument === 'function' && cert.fileUrl) {
        try {
          const loadingTask = window.pdfjsLib.getDocument(cert.fileUrl);
          const pdfDoc = await loadingTask.promise;
          if (token !== renderToken) return;
          const page = await pdfDoc.getPage(1);
          if (token !== renderToken) return;

          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const unscaledViewport = page.getViewport({ scale: 1 });
          const desiredPixelWidth = Math.max(1200, Math.round(baseWidthPx * 1.8 * dpr));
          const scale = desiredPixelWidth / unscaledViewport.width;
          const viewport = page.getViewport({ scale });

          const ctx = modalCanvas.getContext('2d');
          modalCanvas.width = Math.floor(viewport.width);
          modalCanvas.height = Math.floor(viewport.height);
          ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);

          await page.render({ canvasContext: ctx, viewport }).promise;
          if (token !== renderToken) return;
          modalCanvas.dataset.renderedCert = cert.id;
          modalCanvas.dataset.renderEngine = 'pdfjs-canvas';
          return;
        } catch (err) {
          // Si PDF.js falla por cualquier motivo de red/worker, dibujar el stream original en el mismo <canvas>
        }
      }

      await drawPreviewOnCanvas(cert.previewImage, token);
    } finally {
      if (token === renderToken && modalViewport) {
        modalViewport.classList.remove('is-loading');
      }
    }
  }

  function syncModalTexts(cert) {
    if (!cert || !modal) return;
    const titleText = getTitle(cert);

    if (modalTitle) modalTitle.textContent = titleText;
    if (modalCanvas) {
      modalCanvas.setAttribute('aria-label', t('cert.canvasAria', { title: titleText }));
    }
  }

  let isClosingModal = false;
  let closeTimer = null;

  function openCertModal(cert, triggerEl) {
    if (!modal || !cert) return;
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    isClosingModal = false;
    activeCert = cert;
    lastTriggerEl = triggerEl || document.activeElement;
    renderToken += 1;
    const currentToken = renderToken;

    syncModalTexts(cert);

    modal.classList.remove('is-closing');
    document.body.classList.add('is-modal-open');
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }

    baseWidthPx = computeBaseWidth();
    zoomScale = 1;
    applyZoomUI();

    // Activación progresiva del cristal translúcido Liquid Glass en el siguiente frame
    window.requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });

    renderCertToCanvas(cert, currentToken);

    if (modalCloseBtn) {
      modalCloseBtn.focus();
    }
  }

  function closeCertModal() {
    if (!modal || !modal.open || isClosingModal) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      modal.classList.remove('is-open', 'is-closing');
      modal.close();
      return;
    }

    isClosingModal = true;
    modal.classList.remove('is-open');
    modal.classList.add('is-closing');
    closeTimer = window.setTimeout(() => {
      closeTimer = null;
      isClosingModal = false;
      modal.classList.remove('is-closing');
      if (modal.open) modal.close();
    }, 180);
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => setZoom(zoomScale - ZOOM_STEP));
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => setZoom(zoomScale + ZOOM_STEP));
  }
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => setZoom(1));
  }

  window.addEventListener('resize', () => {
    if (modal && modal.open) {
      baseWidthPx = computeBaseWidth();
      applyZoomUI();
    }
  }, { passive: true });

  if (modal) {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeCertModal);

    // Interceptar el cierre con ESC para ejecutar también la transición suave de salida
    modal.addEventListener('cancel', (e) => {
      e.preventDefault();
      closeCertModal();
    });

    // Cerrar al hacer clic fuera de la superficie Liquid Glass
    modal.addEventListener('click', (e) => {
      const shell = document.getElementById('cert-modal-shell');
      if (shell && !shell.contains(e.target)) {
        closeCertModal();
      }
    });

    // Atajos de teclado discretos para zoom y cierre suave mientras el modal está abierto
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeCertModal();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(zoomScale + ZOOM_STEP);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(zoomScale - ZOOM_STEP);
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    });

    modal.addEventListener('close', () => {
      modal.classList.remove('is-open', 'is-closing');
      document.body.classList.remove('is-modal-open');
      renderToken += 1;
      activeCert = null;
      if (lastTriggerEl && typeof lastTriggerEl.focus === 'function') {
        lastTriggerEl.focus();
      }
    });
  }

  // Actualización reactiva al cambiar entre ES y EN
  onLanguageChange(() => {
    timelineItems.forEach((itemEl) => {
      const item = certById.get(itemEl.dataset.moduleId);
      if (!item) return;
      const titleText = getTitle(item);
      const titleEl = itemEl.querySelector('.timeline-title');
      if (titleEl) titleEl.textContent = titleText;

      const mainBtn = itemEl.querySelector(':scope > .timeline-body > .timeline-header .timeline-btn');
      if (mainBtn) {
        const btnText = mainBtn.querySelector('.timeline-btn-text');
        if (btnText) btnText.textContent = t('cert.consult');
        mainBtn.setAttribute('aria-label', t('cert.consultAria', { title: titleText }));
      }
    });

    branchItems.forEach((subEl) => {
      const child = certById.get(subEl.dataset.certId);
      if (!child) return;
      const childTitle = getTitle(child);
      const subTitleEl = subEl.querySelector('.timeline-subtitle');
      if (subTitleEl) subTitleEl.textContent = childTitle;

      const subBtn = subEl.querySelector('.timeline-btn');
      if (subBtn) {
        const btnText = subBtn.querySelector('.timeline-btn-text');
        if (btnText) btnText.textContent = t('cert.consult');
        subBtn.setAttribute('aria-label', t('cert.consultAria', { title: childTitle }));
      }
    });

    if (activeCert && modal && modal.open) {
      syncModalTexts(activeCert);
    }

    layoutAndSyncTimelineScroll();
  });
}

function initScrollReveal() {
  // Elementos a los que aplicamos la animación de entrada suave
  const elementsToReveal = document.querySelectorAll(
    '.section-header, .about-intro, .trait, .idea-panel, .edu-entry, .edu-modules-head, .skill-group, .contact-channels, .contact-form-card'
  );

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  elementsToReveal.forEach((el) => el.classList.add('reveal-item'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    elementsToReveal.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      let order = 0;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Pequeño escalonado entre elementos que aparecen a la vez
          entry.target.style.setProperty('--reveal-delay', `${Math.min(order * 70, 280)}ms`);
          order += 1;
          entry.target.classList.add('is-visible');
          // Una vez revelado, dejamos de observarlo para un rendimiento óptimo
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  elementsToReveal.forEach((el) => observer.observe(el));
}

/**
 * 5. Formulario de contacto
 * No hay servicio de envío configurado: tras validar los campos se abre el
 * cliente de correo del usuario (mailto) con el mensaje ya redactado, usando
 * la dirección de correo que ya figura en la página.
 * Los mensajes se traducen y se vuelven a pintar al cambiar de idioma.
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const notification = document.getElementById('form-notification');
  const submitBtn = document.getElementById('btn-submit-contact');
  if (!form || !notification) return;

  const mailLink = document.querySelector('a[href^="mailto:"]');
  const recipient = mailLink ? mailLink.getAttribute('href').replace('mailto:', '') : 'gema.espada94@gmail.com';
  // Texto@dominio.tld: sin espacios, sin puntos consecutivos en el dominio y con extensión de 2+ letras
  const emailPattern = /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/;

  // Inicializar SDK de EmailJS con la clave pública
  const cfg = window.EMAILJS_CONFIG || {};
  if (window.emailjs && cfg.PUBLIC_KEY) {
    try {
      window.emailjs.init({ publicKey: cfg.PUBLIC_KEY });
    } catch (err) {
      console.warn('EmailJS init warning:', err);
    }
  }

  // Cada validador devuelve la clave de traducción del error ('' si es válido)
  const fields = {
    name: (v) => (v ? '' : 'err.name'),
    email: (v) => (!v ? 'err.email.empty' : emailPattern.test(v) ? '' : 'err.email.invalid'),
    subject: (v) => (v ? '' : 'err.subject'),
    message: (v) => (v ? '' : 'err.message')
  };

  const errorKeys = {};
  let lastNotice = null; // { key, vars, type }
  let isSending = false;
  let lastSendTimestamp = 0;
  const RATE_LIMIT_MS = 6000; // 6 segundos entre envíos para prevenir spam

  function setError(name, key) {
    const input = form.elements[name];
    const out = document.getElementById(`error-${name}`);
    errorKeys[name] = key;
    if (out) out.textContent = key ? t(key) : '';
    if (input) input.setAttribute('aria-invalid', key ? 'true' : 'false');
  }

  // Limpia el error de un campo al corregirlo
  Object.keys(fields).forEach((name) => {
    const input = form.elements[name];
    if (input) {
      input.addEventListener('input', () => setError(name, ''));
    }
  });

  function setSubmittingState(submitting) {
    isSending = submitting;
    if (submitBtn) {
      submitBtn.disabled = submitting;
      const span = submitBtn.querySelector('span');
      if (span) {
        if (submitting) {
          submitBtn.classList.add('is-loading');
          span.textContent = t('form.sending');
        } else {
          submitBtn.classList.remove('is-loading');
          span.textContent = t('form.submit');
        }
      }
    }
    // Deshabilitar temporalmente los inputs durante el envío
    ['name', 'email', 'subject', 'message'].forEach((name) => {
      const field = form.elements[name];
      if (field) field.disabled = submitting;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    notification.className = 'form-notification';

    // Protección anti-abuso: tasa de frecuencia (rate limit)
    const now = Date.now();
    if (now - lastSendTimestamp < RATE_LIMIT_MS) {
      showNotification('form.rateLimit', 'error');
      return;
    }

    const values = {};
    let firstInvalid = null;
    Object.keys(fields).forEach((name) => {
      const field = form.elements[name];
      values[name] = field ? field.value.trim() : '';
      const error = fields[name](values[name]);
      setError(name, error);
      if (error && !firstInvalid && field) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      showNotification('form.review', 'error');
      return;
    }

    // Verificar que EmailJS está disponible y configurado
    const hasConfig = window.emailjs && cfg.PUBLIC_KEY && cfg.SERVICE_ID && cfg.TEMPLATE_ID_CONTACT;
    if (!hasConfig) {
      showNotification('form.errorEmailJS', 'error', { email: recipient });
      return;
    }

    setSubmittingState(true);

    try {
      // 1. PRIMER ENVÍO: Notificación para Gema (template_6ephtod)
      // Parámetros: name, email, subject, message (con alias habituales para compatibilidad)
      const contactParams = {
        name: values.name,
        from_name: values.name,
        email: values.email,
        from_email: values.email,
        reply_to: values.email,
        subject: values.subject,
        message: values.message,
        to_email: recipient
      };

      await window.emailjs.send(cfg.SERVICE_ID, cfg.TEMPLATE_ID_CONTACT, contactParams, cfg.PUBLIC_KEY);

      // Si el primer envío tuvo éxito, intentamos la respuesta automática al visitante
      let autoReplyOk = true;
      if (cfg.TEMPLATE_ID_AUTOREPLY) {
        try {
          // 2. SEGUNDO ENVÍO: Respuesta automática al visitante (template_63me2ww)
          // Parámetros: from_name, from_email, name, email, to_email, subject, message
          const autoReplyParams = {
            from_name: values.name,
            from_email: values.email,
            name: values.name,
            email: values.email,
            to_email: values.email,
            to_name: values.name,
            subject: values.subject,
            message: values.message
          };
          await window.emailjs.send(cfg.SERVICE_ID, cfg.TEMPLATE_ID_AUTOREPLY, autoReplyParams, cfg.PUBLIC_KEY);
        } catch (autoErr) {
          console.warn('Auto-reply warning:', autoErr);
          autoReplyOk = false;
        }
      }

      lastSendTimestamp = Date.now();
      form.reset();
      Object.keys(fields).forEach((name) => setError(name, ''));

      if (autoReplyOk) {
        showNotification('form.successEmailJS', 'success');
      } else {
        showNotification('form.successPartial', 'success');
      }

    } catch (err) {
      console.error('EmailJS notification send error:', err);
      showNotification('form.errorEmailJS', 'error', { email: recipient });
    } finally {
      setSubmittingState(false);
    }
  });

  function showNotification(key, type, vars) {
    lastNotice = { key, type, vars };
    notification.textContent = t(key, vars);
    notification.className = `form-notification is-${type}`;
  }

  // Al cambiar de idioma se vuelven a traducir errores y avisos visibles
  onLanguageChange(() => {
    Object.keys(errorKeys).forEach((name) => {
      const out = document.getElementById(`error-${name}`);
      if (out) out.textContent = errorKeys[name] ? t(errorKeys[name]) : '';
    });
    if (lastNotice && notification.classList.contains(`is-${lastNotice.type}`)) {
      notification.textContent = t(lastNotice.key, lastNotice.vars);
    }
    if (submitBtn && !isSending) {
      const span = submitBtn.querySelector('span');
      if (span) span.textContent = t('form.submit');
    }
  });
}

function updateWhatsAppLink() {
  const float = document.getElementById('wa-float');
  if (!float) return;
  const base = float.getAttribute('href').split('?')[0];
  float.setAttribute('href', `${base}?text=${encodeURIComponent(t('wa.text'))}`);
}

function initWhatsAppFloat() {
  const float = document.getElementById('wa-float');
  const formCard = document.querySelector('.contact-form-card');
  if (!float || !formCard || !('IntersectionObserver' in window)) return;

  const narrow = window.matchMedia('(max-width: 1100px)');
  let formVisible = false;
  const apply = () => float.classList.toggle('is-dimmed', formVisible && narrow.matches);

  new IntersectionObserver((entries) => {
    formVisible = entries[0].isIntersecting;
    apply();
  }, { threshold: 0.05 }).observe(formCard);

  narrow.addEventListener('change', apply);
}

/**
 * 6. Actualización dinámica del año actual en el copyright del footer
 */
function initDynamicYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
