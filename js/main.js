/* =========================================================
   ELETROFRANÇA — main.js
   GSAP ScrollTrigger + Three.js + interações gerais
========================================================= */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============ PRELOADER ============
     The hero's entrance animation is held back (see playHeroIntro below)
     until the preloader actually finishes hiding — otherwise it plays out
     silently underneath the overlay and the reveal is never seen. */
  let playHeroIntro = null;
  let heroIntroPlayed = false;
  function revealHero() {
    if (heroIntroPlayed) return;
    heroIntroPlayed = true;
    if (playHeroIntro) playHeroIntro();
    else document.querySelectorAll(".hero__title-line").forEach((el) => { el.style.transform = "none"; el.style.opacity = "1"; });
  }

  const preloader = document.getElementById("preloader");
  const preloaderFill = document.getElementById("preloaderFill");
  window.addEventListener("load", () => {
    if (preloaderFill) preloaderFill.style.transition = "width .5s ease-out";
    requestAnimationFrame(() => { if (preloaderFill) preloaderFill.style.width = "100%"; });
    setTimeout(() => {
      preloader && preloader.classList.add("is-done");
      revealHero();
    }, 500);
  });
  // safety fallback in case 'load' fires late
  setTimeout(() => {
    preloader && preloader.classList.add("is-done");
    revealHero();
  }, 3500);

  /* ============ CUSTOM CURSOR ============ */
  const cursorDot = document.getElementById("cursorDot");
  const cursorRing = document.getElementById("cursorRing");
  if (cursorDot && cursorRing && matchMedia("(hover:hover)").matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a, button").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorRing.classList.add("is-active"));
      el.addEventListener("mouseleave", () => cursorRing.classList.remove("is-active"));
    });
  }

  /* ============ NAVBAR SCROLL STATE ============ */
  const navbar = document.getElementById("navbar");
  const onScrollNav = () => {
    if (window.scrollY > 40) navbar.classList.add("is-scrolled");
    else navbar.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ============ MOBILE MENU ============ */
  const burger = document.getElementById("navBurger");
  const mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    document.body.classList.remove("menu-open");
    mobileMenu.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
  burger && burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    mobileMenu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  mobileMenu && mobileMenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu && mobileMenu.classList.contains("is-open")) { closeMenu(); burger.focus(); }
  });

  /* =========================================================
     SERVIÇOS — carrossel simples, autoplay contínuo (marquee)
     A rolagem em si é só CSS (@keyframes servicosScroll); aqui só
     montamos os cards e duplicamos a lista uma vez, para o loop
     fechar exatamente em -50% sem precisar medir nada em JS.
  ========================================================= */
  const SERVICES = [
    { img: "Manutencao_Card.webp", title: "Manutenção Preventiva", desc: "Inspeção completa do sistema elétrico para evitar riscos, curtos e falhas antes que aconteçam." },
    { img: "Emergencias_Card.webp", title: "Emergências 24h", desc: "Curto-circuito, quedas de energia ou disjuntor desarmando? Atendimento rápido quando você mais precisa." },
    { img: "Quadros_Card.webp", title: "Quadros &amp; Disjuntores", desc: "Troca, dimensionamento e organização de quadros de distribuição dentro das normas técnicas." },
    { img: "Automacao_Card.webp", title: "Automação Residencial", desc: "Iluminação inteligente, tomadas e interruptores conectados para uma casa mais prática." },
    { img: "Laudos_Card.webp", title: "Laudos &amp; Vistorias", desc: "Avaliação técnica da instalação elétrica para compra, venda ou locação de imóveis." },
    { img: "Instalacoes_Card.webp", title: "Instalações Elétricas", desc: "Projetos e execução de instalações novas com segurança, capacidade e acabamento impecável." },
  ];

  function initServicosCarousel() {
    const track = document.getElementById("servicosTrack");
    if (!track) return;

    const deck = SERVICES.concat(SERVICES);
    // o 2º conjunto existe só para o loop visual: escondido de leitores de tela
    track.innerHTML = deck.map((s, i) => `
      <article class="service-card"${i >= SERVICES.length ? ' aria-hidden="true"' : ""}>
        <img src="Imgs/Servicos/${s.img}" alt="" class="service-card__bg" loading="lazy">
        <div class="service-card__content">
          <h3>${s.title}</h3>
          <p>${s.desc}</p>
        </div>
      </article>`).join("");

    const carousel = track.parentElement;
    const pauseBtn = document.getElementById("servicosPause");
    if (pauseBtn) {
      const label = pauseBtn.querySelector("span");
      pauseBtn.addEventListener("click", () => {
        const paused = carousel.classList.toggle("is-paused");
        pauseBtn.setAttribute("aria-pressed", String(paused));
        label.textContent = paused ? "Retomar animação" : "Pausar animação";
      });
    }
  }

  // Gera os cards do carrossel de Serviços antes do bloco GSAP abaixo,
  // que já registra uma animação de entrada sobre esses cards.
  initServicosCarousel();

  /* ============ GSAP SETUP ============ */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power3.out" });

    /* --- Hero entrance: held back until the preloader is gone (see
       revealHero above), so the reveal actually plays where it can be
       seen instead of finishing silently underneath the overlay. --- */
    gsap.set(".hero__title-line", { yPercent: 100, opacity: 0 });
    gsap.set(".hero__desc, .hero__actions", { y: 18, opacity: 0 });

    playHeroIntro = function () {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(".hero__title-line", {
          yPercent: 0,
          opacity: 1,
          duration: 1.3,
          stagger: 0.12,
        }, 0)
        .to(".hero__desc", { y: 0, opacity: 1, duration: 0.9 }, 0.7)
        .to(".hero__actions", { y: 0, opacity: 1, duration: 0.9 }, 1.05);
    };

    /* --- Generic reveal-on-scroll for section heads / cards ---
       Note: .sobre__cards is intentionally excluded here — it gets its own
       dedicated stagger animation below. */
    const revealTargets = gsap.utils.toArray(
      ".section-head, .sobre__title, .cta__card, .testi-card"
    );
    revealTargets.forEach((el) => {
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // Serviços: o carrossel inteiro entra com fade + slide ao aparecer na tela
    // (um único elemento, igual ao .section-head acima — staggerar os cards
    // individualmente deixava o transform "preso" em scrolls rápidos).
    gsap.from(".servicos__carousel", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".servicos__carousel",
        start: "top 88%",
        toggleActions: "play none none reverse",
      },
    });

    // Métricas: cabeçalho e cada número entram em sequência ao aparecerem na tela.
    gsap.from(".metrics__head, .metric", {
      y: 36,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".metrics",
        start: "top 80%",
        toggleActions: "play none none none",
      },
    });

    /* --- Sobre artwork: scrubbed entrance (slide up + fade only) + parallax ---
       Tied directly to scroll position (scrub) instead of a timed play-once
       animation — the rays/batteries only finish sliding/fading in once the
       user finishes scrolling through the range, not as soon as it appears.
       Kept slightly oversized (scale 1.08, fixed — not animated) at rest so
       the parallax drift never exposes an edge, since the image covers the
       card at 100% height/width. */
    const sobreArt = document.querySelector(".sobre__art-img");
    if (sobreArt) {
      gsap.set(sobreArt, { scale: 1.08 });
      gsap.fromTo(sobreArt,
        { y: 120, opacity: 0 },
        { y: 0, opacity: 1, ease: "none",
          scrollTrigger: {
            trigger: sobreArt,
            start: "top 100%",
            end: "top 35%",
            scrub: 1,
          } }
      );
      gsap.to(sobreArt, {
        yPercent: -4, ease: "none",
        scrollTrigger: { trigger: ".sobre__card", start: "top bottom", end: "bottom top", scrub: 1 },
      });
    }

    gsap.from(".sobre__mini-card", {
      y: 24, opacity: 0, duration: 0.7, stagger: 0.1,
      scrollTrigger: { trigger: ".sobre__cards", start: "top 88%", toggleActions: "play none none reverse" },
    });

    /* --- Recalculate trigger positions once fonts & assets finish loading --- */
    const refreshST = () => ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshST);
    window.addEventListener("load", refreshST);
    setTimeout(refreshST, 1200);

  } else {
    // fallback: just make sure content is visible if gsap fails to load
    document.querySelectorAll(".hero__title-line").forEach((el) => el.style.transform = "none");
  }

  /* =========================================================
     MÉTRICAS — conta de 0 até o valor (data-count) na 1ª vez que a
     faixa aparece: ~1,2s, requestAnimationFrame, ease-out. Mantém
     casas decimais (data-decimals) e separador de milhar (pt-BR).
     Com prefers-reduced-motion, mostra o valor final sem animar.
  ========================================================= */
  function initMetrics() {
    const section = document.querySelector(".metrics");
    if (!section || prefersReducedMotion || !("IntersectionObserver" in window)) return;

    const figures = Array.from(section.querySelectorAll("[data-count]"));
    const DURATION = 1200;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const format = (value, decimals) =>
      value.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

    figures.forEach((el) => {
      el.textContent = format(0, parseInt(el.dataset.decimals, 10) || 0);
    });

    function run() {
      const start = performance.now();
      function frame(now) {
        const t = Math.min((now - start) / DURATION, 1);
        const eased = easeOut(t);
        figures.forEach((el) => {
          const target = parseFloat(el.dataset.count);
          const decimals = parseInt(el.dataset.decimals, 10) || 0;
          el.textContent = format(target * eased, decimals);
        });
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    }, { threshold: 0.35 });
    io.observe(section);
  }

  /* =========================================================
     PROCESSO — timeline vertical: a linha amarela preenche conforme
     o scroll e cada ponto/card "acende" quando a linha o alcança.
     Usa o evento scroll direto (sem GSAP), com um ponto de leitura
     a 60% da altura da tela.
  ========================================================= */
  function initTimeline() {
    const tl = document.getElementById("timeline");
    const fill = document.getElementById("timelineFill");
    if (!tl || !fill) return;
    const line = tl.querySelector(".timeline__line");
    const items = Array.from(tl.querySelectorAll(".tl-item"));
    const dots = items.map((it) => it.querySelector(".tl-dot"));
    let top = 0, height = 0;

    function measure() {
      const tr = tl.getBoundingClientRect();
      const first = dots[0].getBoundingClientRect();
      const last = dots[dots.length - 1].getBoundingClientRect();
      top = first.top + first.height / 2 - tr.top;
      height = last.top + last.height / 2 - tr.top - top;
      line.style.top = top + "px";
      line.style.height = height + "px";
    }

    function update() {
      const tr = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      // Ponto de leitura a 60% da tela; nos últimos 40% de scroll da página ele
      // desce até o rodapé, para o último ponto sempre conseguir acender
      // (a timeline é o fim da página e não tem como rolar mais).
      const remaining = document.documentElement.scrollHeight - vh - window.scrollY;
      const t = Math.min(Math.max(1 - remaining / (vh * 0.4), 0), 1);
      const mark = vh * 0.6 + t * (vh * 0.4);
      const filled = Math.min(Math.max(mark - (tr.top + top), 0), height);
      fill.style.height = filled + "px";
      items.forEach((it, i) => {
        const r = dots[i].getBoundingClientRect();
        it.classList.toggle("is-active", r.top + r.height / 2 <= mark);
      });
    }

    measure();
    if (prefersReducedMotion) {
      fill.style.height = height + "px";
      items.forEach((it) => it.classList.add("is-active"));
      return;
    }
    tl.classList.add("is-ready");
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", () => { measure(); update(); });
    window.addEventListener("load", () => { measure(); update(); });
  }

  /* =========================================================
     TRABALHOS — galeria em mosaico + lightbox (setas, Esc, swipe).
     Para trocar/adicionar fotos: edite WORK_ITEMS (arquivo em
     /trabalhos, largura/altura em px e a legenda).
  ========================================================= */
  const WORK_ITEMS = [
    { file: "obra-01.webp", w: 960, h: 1280, title: "Ponto de chuveiro" },
    { file: "obra-02.webp", w: 960, h: 1280, title: "Quadro de disjuntores" },
    { file: "obra-03.webp", w: 960, h: 1280, title: "Iluminação em LED" },
    { file: "obra-04.webp", w: 960, h: 1280, title: "Revisão de fiação" },
    { file: "obra-05.webp", w: 960, h: 1280, title: "Passagem de cabos" },
    { file: "obra-06.webp", w: 960, h: 1280, title: "Rede externa" },
    { file: "obra-07.webp", w: 960, h: 1280, title: "Ventilador de teto" },
    { file: "obra-08.webp", w: 1280, h: 960, title: "Instalação externa" },
    { file: "obra-09.webp", w: 960, h: 1280, title: "Caixa de medição" },
    { file: "obra-10.webp", w: 720, h: 1280, title: "Luminária pendente" },
    { file: "obra-11.webp", w: 720, h: 1280, title: "Perfil de LED" },
    { file: "obra-12.webp", w: 720, h: 1280, title: "Iluminação decorativa" },
    { file: "obra-13.webp", w: 720, h: 1280, title: "LED e pendentes" },
    { file: "obra-14.webp", w: 720, h: 1280, title: "Spots e trilho" },
  ];

  function initGallery() {
    const section = document.querySelector(".gallery");
    const grid = document.getElementById("galleryGrid");
    if (!section || !grid) return;

    const BOLT = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" fill="currentColor"/></svg>';
    const src = (it) => "trabalhos/" + it.file;

    grid.innerHTML = WORK_ITEMS.map((it, i) => `
      <button type="button" class="work" data-index="${i}" style="--ar:${it.w} / ${it.h}" aria-label="Ampliar foto: ${it.title}">
        <img src="${src(it)}" width="${it.w}" height="${it.h}" alt="Trabalho da Eletrofrança: ${it.title}" loading="lazy" decoding="async">
        <span class="work__tag">${BOLT}<span>${it.title}</span></span>
        <span class="work__zap" aria-hidden="true">${BOLT}</span>
      </button>`).join("");

    const works = Array.from(grid.querySelectorAll(".work"));

    // ----- entrada no scroll (IntersectionObserver, sem GSAP) -----
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
      section.classList.add("is-ready");
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const col = works.indexOf(el) % 3;
          el.style.transitionDelay = col * 90 + "ms";
          el.classList.add("is-in");
          setTimeout(() => { el.style.transitionDelay = ""; }, 1100);
          io.unobserve(el);
        });
      }, { threshold: 0.12 });
      works.forEach((w) => io.observe(w));
    }

    // ----- lightbox -----
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg");
    const lbCap = document.getElementById("lightboxCaption");
    const lbCount = document.getElementById("lightboxCount");
    const btnClose = document.getElementById("lightboxClose");
    const btnPrev = document.getElementById("lightboxPrev");
    const btnNext = document.getElementById("lightboxNext");
    const figure = document.getElementById("lightboxFigure");
    if (!lb) return;
    const N = WORK_ITEMS.length;
    let current = 0;
    let lastFocus = null;

    function show(i) {
      current = (i + N) % N;
      const it = WORK_ITEMS[current];
      lbImg.src = src(it);
      lbImg.alt = "Trabalho da Eletrofrança: " + it.title;
      lbCap.textContent = it.title;
      lbCount.textContent = (current + 1) + " / " + N;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      btnClose.focus();
    }
    function close() {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    const isOpen = () => lb.classList.contains("is-open");

    works.forEach((w) => w.addEventListener("click", () => open(parseInt(w.dataset.index, 10))));
    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => show(current - 1));
    btnNext.addEventListener("click", () => show(current + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });

    window.addEventListener("keydown", (e) => {
      if (!isOpen()) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(current - 1);
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "Tab") {
        const f = [btnClose, btnPrev, btnNext];
        const idx = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(idx + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });

    // swipe horizontal no celular
    let startX = null;
    figure.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    figure.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    });
    figure.addEventListener("pointercancel", () => { startX = null; });
  }

  /* =========================================================
     THREE.JS — HERO: single glowing lightning bolt
  ========================================================= */
  function initHeroScene() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas || !window.THREE || prefersReducedMotion) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 10;

    // Bolt silhouette — same proportions as the brand mark's lightning icon.
    const boltPoints = [
      [0.15, 1.5], [-1.2, -0.3], [0, -0.3], [-0.15, -1.5], [1.2, 0.3], [0, 0.3],
    ];
    const boltShape = new THREE.Shape();
    boltShape.moveTo(boltPoints[0][0], boltPoints[0][1]);
    for (let i = 1; i < boltPoints.length; i++) boltShape.lineTo(boltPoints[i][0], boltPoints[i][1]);
    boltShape.closePath();

    const boltGeometry = new THREE.ShapeGeometry(boltShape);
    const boltMaterial = new THREE.MeshBasicMaterial({ color: 0xfecd1a, transparent: true, opacity: 0.95 });
    const bolt = new THREE.Mesh(boltGeometry, boltMaterial);
    bolt.scale.setScalar(1.9);

    // Soft radial glow behind the bolt (canvas-generated sprite, additive blend).
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowCanvas.height = 256;
    const gctx = glowCanvas.getContext("2d");
    const grad = gctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(254,205,26,0.95)");
    grad.addColorStop(0.5, "rgba(254,205,26,0.25)");
    grad.addColorStop(1, "rgba(254,205,26,0)");
    gctx.fillStyle = grad;
    gctx.fillRect(0, 0, 256, 256);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture, transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(8, 8, 1);
    glow.position.z = -0.4;

    const boltGroup = new THREE.Group();
    boltGroup.add(glow, bolt);
    scene.add(boltGroup);

    const BOLT_SHAPE_WIDTH = 2.4; // full width of the bolt polygon at scale 1
    const BOLT_SHAPE_HEIGHT = 3.0; // full height of the bolt polygon at scale 1
    const heroContentEl = document.querySelector(".hero__content");
    let baseX = 0, baseY = 0;
    function placeBolt() {
      const isMobile = window.innerWidth < 900;
      if (isMobile) {
        // Mobile layout: bolt moves to the top and spans the full width;
        // text stacks below it. Everything below is computed in pixels so
        // the text's top padding always lands exactly where the bolt ends,
        // regardless of its (taller-than-wide) aspect ratio.
        const h = canvas.clientHeight || window.innerHeight;
        const dist = camera.position.z;
        const vFov = (camera.fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
        const pxPerUnit = h / visibleHeight;

        const desiredWidthPx = canvas.clientWidth * 0.42;
        const scale = desiredWidthPx / (BOLT_SHAPE_WIDTH * pxPerUnit);
        const boltHeightPx = BOLT_SHAPE_HEIGHT * scale * pxPerUnit;

        const navClearancePx = 120; // clears the floating pill navbar + its glow halo
        const gapAfterPx = 28;
        const boltTopPx = navClearancePx;
        const boltCenterPx = boltTopPx + boltHeightPx / 2;
        baseX = 0;
        baseY = (h / 2 - boltCenterPx) / pxPerUnit;
        bolt.scale.setScalar(scale);
        glow.scale.set(scale * 2.4, scale * 2.4, 1);

        if (heroContentEl) heroContentEl.style.paddingTop = `${boltTopPx + boltHeightPx + gapAfterPx}px`;
      } else {
        if (heroContentEl) heroContentEl.style.paddingTop = "";
        baseX = 3.4;
        baseY = -0.6;
        bolt.scale.setScalar(1.9);
        glow.scale.set(1.9 * 4.2, 1.9 * 4.2, 1);
      }
      boltGroup.position.x = baseX;
      boltGroup.position.y = baseY;
    }
    placeBolt();

    let mouseX = 0, mouseY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function resize() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      placeBolt();
    }
    window.addEventListener("resize", resize);
    resize();

    const clock = new THREE.Clock();
    let rafId;
    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // gentle idle drift + mouse parallax (steady glow, no flicker)
      boltGroup.rotation.z = Math.sin(t * 0.6) * 0.05 + mouseX * 0.07;
      boltGroup.rotation.y = mouseX * 0.15;
      boltGroup.position.x = baseX + mouseX * 0.3;
      boltGroup.position.y = baseY + Math.sin(t * 0.8) * 0.12 - mouseY * 0.08;

      renderer.render(scene, camera);
    }
    animate();

    // pause rendering when hero is off-screen (perf)
    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { if (!rafId) animate(); }
          else { cancelAnimationFrame(rafId); rafId = null; }
        });
      }, { threshold: 0.05 });
      io.observe(canvas);
    }
  }

  initHeroScene();
  initMetrics();
  initTimeline();
  initGallery();

})();
