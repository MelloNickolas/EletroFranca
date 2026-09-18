/* =========================================================
   ELETRO FRANÇA — main.js
   GSAP ScrollTrigger + Three.js + interações gerais
========================================================= */
(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =======================================================
     WORK_ITEMS — feed de trabalhos (estilo Instagram)
     Coloque a foto em /trabalhos/<arquivo> e adicione uma
     linha aqui. Enquanto não houver fotos reais, o grid
     mostra cards "Em breve" para manter o layout completo.
  ======================================================= */
  const WORK_ITEMS = [
    // { file: "servico-01.jpg", title: "Troca de quadro", tag: "Instalação" },
    // { file: "servico-02.jpg", title: "Automação de sala", tag: "Automação" },
  ];
  const FEED_SLOTS = 8; // total de espaços exibidos no grid

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

  /* ============ YEAR ============ */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

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
    document.querySelectorAll("a, button, .feed-card").forEach((el) => {
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

  /* ============ BUILD FEED GRID ============ */
  const feedGrid = document.getElementById("feedGrid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = caption || "";
    lightboxCaption.textContent = caption || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  lightboxClose && lightboxClose.addEventListener("click", closeLightbox);
  lightbox && lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

  if (feedGrid) {
    const total = Math.max(FEED_SLOTS, WORK_ITEMS.length);
    for (let i = 0; i < total; i++) {
      const item = WORK_ITEMS[i];
      const card = document.createElement(item ? "button" : "div");
      card.className = "feed-card" + (item ? "" : " feed-card--placeholder");

      if (item) {
        card.innerHTML = `
          <img src="trabalhos/${item.file}" alt="${item.title}" loading="lazy">
          <div class="feed-card__overlay">
            <strong>${item.title}</strong>
            <span>${item.tag || ""}</span>
          </div>
          <div class="feed-card__stats">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4 9.6 4C11.1 4 12.5 4.8 13 6C13.5 4.8 14.9 4 16.4 4C19.5 4 22 6.6 22 9.8C22 15.5 12 21 12 21Z" stroke="currentColor" stroke-width="1.8"/></svg>
          </div>`;
        card.addEventListener("click", () => openLightbox(`trabalhos/${item.file}`, item.title));
      } else {
        card.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none"><path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
          <span>Em breve</span>`;
      }
      feedGrid.appendChild(card);
    }
  }

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
       Note: .service-card and .sobre__cards are intentionally excluded here —
       they get their own dedicated stagger animations below. Having both fight
       over the same y/opacity transform on the same elements was causing the
       visible jitter/"bug" seen on the service cards during scroll. */
    const revealTargets = gsap.utils.toArray(
      ".section-head, .sobre__title, .depoimento-card, .stats__item, .footer__col, .footer__brand"
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

    // stagger service cards a bit
    gsap.from(".service-card", {
      y: 50, opacity: 0, duration: 0.7, stagger: 0.08,
      scrollTrigger: { trigger: ".servicos__grid", start: "top 85%", toggleActions: "play none none reverse" },
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

    /* --- Stats count-up --- */
    document.querySelectorAll(".stats__number").forEach((el) => {
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;
      const counter = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () => {
          gsap.to(counter, {
            val: target,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => { el.textContent = Math.round(counter.val); },
          });
        },
      });
    });

    /* --- PROCESSO: horizontal pinned scroll (scroll travado) --- */
    const processoTrack = document.getElementById("processoTrack");
    if (processoTrack) {
      const firstStep = processoTrack.querySelector(".processo__step");

      // Pad both ends of the track so every card (including the first/last)
      // passes through the exact center of the screen while scrolling.
      function setTrackCenterPadding() {
        const cardWidth = firstStep ? firstStep.getBoundingClientRect().width : 0;
        const pad = Math.max((window.innerWidth - cardWidth) / 2, 24);
        processoTrack.style.paddingLeft = pad + "px";
        processoTrack.style.paddingRight = pad + "px";
      }
      setTrackCenterPadding();

      const getScrollAmount = () => processoTrack.scrollWidth - window.innerWidth;

      let horizontalTween = gsap.to(processoTrack, {
        x: () => -getScrollAmount(),
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: ".processo",
        start: "top top",
        end: () => `+=${getScrollAmount() + window.innerHeight * 0.4}`,
        pin: true,
        animation: horizontalTween,
        scrub: 1,
        invalidateOnRefresh: true,
      });

      window.addEventListener("resize", () => {
        setTrackCenterPadding();
        ScrollTrigger.refresh();
      });

      // step fade-in as they cross center
      gsap.utils.toArray(".processo__step").forEach((step) => {
        gsap.from(step, {
          opacity: 0.25,
          scale: 0.94,
          scrollTrigger: {
            trigger: step,
            containerAnimation: horizontalTween,
            start: "left 85%",
            end: "left 40%",
            scrub: true,
          },
        });
      });
    }

    /* --- Feed cards stagger reveal --- */
    gsap.from(".feed-card", {
      y: 30, opacity: 0, duration: 0.6, stagger: 0.06,
      scrollTrigger: { trigger: ".feed__grid", start: "top 88%" },
    });

    /* --- CTA final reveal --- */
    gsap.from(".cta-final__title, .cta-final__desc, .cta-final .btn", {
      y: 30, opacity: 0, duration: 0.8, stagger: 0.1,
      scrollTrigger: { trigger: ".cta-final", start: "top 75%" },
    });

    /* --- Recalculate pin/scroll widths once fonts & assets finish loading ---
       Barlow Condensed loading late shifts text width, which throws off the
       horizontal-scroll math in .processo if measured too early. */
    const refreshST = () => ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshST);
    window.addEventListener("load", refreshST);
    setTimeout(refreshST, 1200);

  } else {
    // fallback: just make sure content is visible if gsap fails to load
    document.querySelectorAll(".hero__title-line").forEach((el) => el.style.transform = "none");
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

  /* =========================================================
     THREE.JS — CTA FINAL: campo de linhas sutil (textura)
  ========================================================= */
  function initCtaScene() {
    const canvas = document.getElementById("ctaCanvas");
    if (!canvas || !window.THREE || prefersReducedMotion) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: { u_time: { value: 0 } },
      vertexShader: `void main(){ gl_Position = vec4(position,1.0); }`,
      fragmentShader: `
        uniform float u_time;
        void main(){
          vec2 uv = gl_FragCoord.xy / 400.0;
          float line = sin((uv.x + uv.y) * 12.0 + u_time * 0.6);
          float alpha = smoothstep(0.96, 1.0, line) * 0.12;
          gl_FragColor = vec4(0.02, 0.02, 0.02, alpha);
        }
      `,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    function resize() {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    }
    window.addEventListener("resize", resize);
    resize();

    let rafId;
    const clock = new THREE.Clock();
    function animate() {
      rafId = requestAnimationFrame(animate);
      material.uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    }

    if (window.IntersectionObserver) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { if (!rafId) animate(); }
          else { cancelAnimationFrame(rafId); rafId = null; }
        });
      }, { threshold: 0.05 });
      io.observe(canvas);
    } else {
      animate();
    }
  }

  /* =========================================================
     SECTION TIMELINE — fixed right-side dots that track scroll
  ========================================================= */
  function initSectionNav() {
    const nav = document.getElementById("sectionNav");
    const track = document.getElementById("sectionNavTrack");
    const labelEl = document.getElementById("sectionNavLabel");
    if (!nav || !track || !labelEl) return;

    const SECTIONS = [
      { id: "hero", label: "Início" },
      { id: "sobre", label: "Sobre" },
      { id: "servicos", label: "Serviços" },
      { id: "processo", label: "Processo" },
      { id: "trabalhos", label: "Trabalhos" },
      { id: "depoimentos", label: "Depoimentos" },
      { id: "contato", label: "Contato" },
    ].filter((s) => document.getElementById(s.id));

    const SPACING = 30;
    track.style.height = `${(SECTIONS.length - 1) * SPACING}px`;

    const dots = SECTIONS.map((s, i) => {
      const dot = document.createElement("button");
      dot.className = "section-nav__dot";
      dot.style.top = `${i * SPACING}px`;
      dot.type = "button";
      dot.setAttribute("aria-label", s.label);
      dot.addEventListener("click", () => {
        document.getElementById(s.id).scrollIntoView({ behavior: "smooth" });
      });
      track.appendChild(dot);
      return dot;
    });

    function setActive(index) {
      dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
      labelEl.textContent = SECTIONS[index].label;
    }

    const els = SECTIONS.map((s) => document.getElementById(s.id));

    // Whichever section's midline is closest to the viewport's vertical
    // center wins — plain getBoundingClientRect checks driven straight off
    // scroll, so it can't be dropped by an unrelated ScrollTrigger.refresh().
    // Called directly on scroll (no rAF throttle): rAF callbacks are paused
    // by the browser while the tab/pane isn't actively compositing, which
    // would otherwise leave the indicator stuck.
    function updateActive() {
      const centerY = window.innerHeight / 2;
      let activeIndex = 0;
      let bestDist = Infinity;
      els.forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        const dist = Math.abs((rect.top + rect.bottom) / 2 - centerY);
        if (dist < bestDist) { bestDist = dist; activeIndex = i; }
      });
      setActive(activeIndex);
    }

    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    updateActive();
  }

  initHeroScene();
  initCtaScene();
  initSectionNav();

})();
