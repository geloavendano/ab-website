/* Angat Buhay UI v3: doodle sprite + small page behaviours.
 *
 * Doodles are SVG <symbol>s drawn with stroke="currentColor", so a doodle takes
 * its colour from CSS (`.c-pink`, `.c-yellow`, ...). Every path has pathLength=1,
 * which lets CSS "draw" any doodle with stroke-dasharray/dashoffset no matter
 * how long the real path is.
 *
 * Use:  <svg class="doodle c-pink" viewBox="0 0 300 120"><use href="#d-encircle"/></svg>
 * The viewBox must match the symbol's (listed below and on components-v3.html).
 */
(function () {
  const SYMBOLS = {
    "arrow-curl": ["0 0 120 120", [
      "M12 104 C 30 60, 70 92, 64 56 C 60 30, 36 34, 44 52 C 52 72, 92 58, 104 22",
      "M86 22 L 105 18 L 104 38"]],
    "sparkle": ["0 0 100 100", [
      "M50 6 C 53 38 62 47 94 50 C 62 53 53 62 50 94 C 47 62 38 53 6 50 C 38 47 47 38 50 6 Z"]],
    "encircle": ["0 0 300 120", [
      "M160 14 C 80 6, 14 28, 14 62 C 14 100, 120 114, 196 106 C 266 98, 292 76, 286 50 C 278 18, 196 4, 116 14 C 86 18, 64 26, 50 36"]],
    "underline": ["0 0 300 40", [
      "M6 24 C 70 12, 150 8, 220 14 C 254 17, 278 22, 294 16",
      "M48 34 C 120 25, 200 24, 262 30"]],
    "underline-single": ["0 0 300 24", [
      "M4 16 C 60 6, 140 4, 210 10 C 244 13, 272 18, 296 12"]],
    // Underline variants. Lines share underline-single's 300×24 box, scribbles
    // share underline's 300×40 box, so any variant drops into the same slot.
    "underline-wave": ["0 0 300 24", [
      "M4 14 C 30 6, 52 21, 80 14 C 108 7, 128 21, 156 14 C 184 7, 204 21, 232 14 C 258 8, 278 17, 296 12"]],
    "underline-hook": ["0 0 300 24", [
      "M4 16 C 70 10, 150 9, 232 12 C 260 13, 280 15, 288 9 C 292 3, 278 3, 278 10 C 278 17, 290 20, 298 17"]],
    "underline-return": ["0 0 300 24", [
      "M6 11 C 90 7, 190 7, 292 10 C 200 14, 110 16, 22 20"]],
    "underline-rise": ["0 0 300 24", [
      "M6 21 C 80 18, 170 13, 294 5"]],
    "underline-dip": ["0 0 300 24", [
      "M4 6 C 70 22, 230 22, 296 7"]],
    "underline-zig": ["0 0 300 24", [
      "M4 14 L 40 7 L 76 18 L 112 7 L 148 18 L 184 7 L 220 18 L 256 7 L 296 13"]],
    "underline-loop": ["0 0 300 40", [
      "M6 26 C 80 19, 160 17, 228 21 C 262 23, 288 19, 282 10 C 276 2, 250 12, 262 25 C 270 35, 290 33, 296 28"]],
    "underline-scrawl": ["0 0 300 40", [
      "M8 16 C 100 11, 200 11, 292 15 C 200 20, 100 22, 16 26 C 100 26, 200 27, 288 31"]],
    "underline-swash": ["0 0 300 40", [
      "M6 32 C 90 28, 200 23, 294 9", "M60 37 C 130 34, 200 31, 262 25"]],
    "rays": ["0 0 100 70", [
      "M14 62 L 4 42", "M34 46 L 28 12", "M58 44 L 66 8", "M80 60 L 96 42"]],
    "crown": ["0 0 120 80", [
      "M10 64 L 16 16 L 40 44 L 60 6 L 80 44 L 104 14 L 110 64",
      "M10 72 C 46 76, 80 74, 112 70"]],
    "squiggle": ["0 0 400 200", [
      "M0 160 C 60 40, 120 40, 140 100 C 160 160, 90 180, 100 120 C 110 60, 220 40, 260 100 C 290 150, 340 160, 400 60"]],
    "spring": ["0 0 300 80", [
      "M5 60 C 25 10, 55 10, 45 45 C 35 75, 15 55, 40 30 C 65 5, 95 10, 85 45 C 75 75, 55 55, 80 30 C 105 5, 135 10, 125 45 C 115 75, 95 55, 120 30 C 145 5, 175 10, 165 45 C 155 75, 135 55, 160 30 C 185 5, 215 10, 205 45 C 195 75, 175 55, 200 30 C 225 5, 265 15, 295 40"]],
    "zigzag": ["0 0 200 40", [
      "M4 30 L 24 10 L 44 30 L 64 10 L 84 30 L 104 10 L 124 30 L 144 10 L 164 30 L 184 10 L 196 22"]],
    "arcs": ["0 0 200 120", [
      "M16 118 C 16 30, 184 30, 184 118",
      "M34 118 C 34 52, 166 52, 166 118",
      "M52 118 C 52 74, 148 74, 148 118"]],
    "swoop": ["0 0 600 300", [
      "M20 40 C 160 10, 300 60, 330 150 C 352 220, 260 260, 250 200 C 240 140, 380 120, 470 170 C 520 198, 560 230, 580 270",
      "M552 264 L 582 274 L 586 244"]],
    "speech": ["0 0 160 120", [
      "M30 20 C 70 8, 130 10, 146 40 C 160 70, 120 92, 80 90 L 46 110 L 54 86 C 24 80, 6 60, 12 42 C 16 30, 22 24, 30 20"]],
    "heart": ["0 0 100 90", [
      "M50 84 C 20 62, 6 44, 10 26 C 14 8, 40 6, 50 28 C 60 6, 88 8, 90 28 C 92 46, 76 64, 50 84"]]
  };

  const NS = "http://www.w3.org/2000/svg";
  const sprite = document.createElementNS(NS, "svg");
  sprite.setAttribute("aria-hidden", "true");
  sprite.setAttribute("width", "0");
  sprite.setAttribute("height", "0");
  sprite.style.position = "absolute";

  /* Two filters:
   *  ab-crayon: wobbles the line (displacement) and eats small holes into it
   *             (high-frequency noise used as an alpha mask) = waxy crayon stroke.
   *  ab-wobble: the wobble only, for small doodles where grit turns to mush. */
  let defs = `
    <filter id="ab-crayon" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="wobbly"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="11" result="grit"/>
      <feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.4 0 0 0 1.95" result="gritAlpha"/>
      <feComposite in="wobbly" in2="gritAlpha" operator="in"/>
    </filter>
    <filter id="ab-wobble" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="7" result="warp"/>
      <feDisplacementMap in="SourceGraphic" in2="warp" scale="3" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;

  for (const [name, [viewBox, paths]] of Object.entries(SYMBOLS)) {
    defs += `<symbol id="d-${name}" viewBox="${viewBox}">` +
      paths.map(d => `<path d="${d}" pathLength="1"/>`).join("") +
      `</symbol>`;
  }
  sprite.innerHTML = `<defs>${defs}</defs>`;
  document.body.prepend(sprite);
  window.AB_DOODLES = SYMBOLS;

  /* Site pages (v3): app.js renders the markup on DOMContentLoaded, and this
   * deferred script runs before that, so everything that touches rendered
   * markup waits for boot(). enhance() adds doodles that static page shells
   * can't carry themselves. */
  const svg = (cls, viewBox, id, style = "") =>
    `<svg class="doodle ${cls}" viewBox="${viewBox}" preserveAspectRatio="none"${style ? ` style="${style}"` : ""} aria-hidden="true"><use href="#d-${id}"/></svg>`;

  function enhance() {
    // Text links with an arrow get the hand-drawn hover underline.
    document.querySelectorAll(".link-arrow:not(:has(.doodle))").forEach(a =>
      a.insertAdjacentHTML("beforeend", svg("draw-on-hover doodle--fine", "0 0 300 24", "underline-single")));

    // Each sky page hero gets one small cluster on the right: arcs + sparkles.
    // Which cluster is picked from the page name, so a page always looks the same.
    const hero = document.querySelector(".page-hero");
    if (hero && !hero.querySelector(".doodle")) {
      const page = document.body.dataset.page || "";
      const pick = [...page].reduce((n, c) => n + c.charCodeAt(0), 0) % 3;
      const clusters = [
        svg("doodle--draw c-pink hide-mobile", "0 0 200 120", "arcs", "--delay:.3s; top:calc(var(--header-h) + 24px); right:6%; width:200px; height:120px; stroke-width:3; transform:rotate(-8deg)") +
        svg("doodle--draw doodle--fine c-yellow hide-mobile", "0 0 100 100", "sparkle", "--delay:.7s; top:calc(var(--header-h) + 150px); right:20%; width:30px; height:30px; stroke-width:9"),
        svg("doodle--draw c-yellow hide-mobile", "0 0 300 80", "spring", "--delay:.3s; top:calc(var(--header-h) + 40px); right:7%; width:200px; height:54px; stroke-width:4") +
        svg("doodle--draw doodle--fine c-pink hide-mobile", "0 0 100 100", "sparkle", "--delay:.7s; top:calc(var(--header-h) + 120px); right:14%; width:28px; height:28px; stroke-width:9"),
        svg("doodle--draw c-blue hide-mobile", "0 0 120 120", "arrow-curl", "--delay:.3s; top:calc(var(--header-h) + 30px); right:9%; width:110px; height:110px; stroke-width:4; transform:rotate(20deg)") +
        svg("doodle--draw doodle--fine c-pink hide-mobile", "0 0 100 70", "rays", "--delay:.6s; top:calc(var(--header-h) + 150px); right:22%; width:44px; height:32px; stroke-width:7")
      ];
      hero.insertAdjacentHTML("afterbegin", clusters[pick]);
    }

    // Mobile menu: app.js toggles .nav.open; the header needs to know too.
    const toggle = document.querySelector(".menu-toggle");
    const head = document.querySelector("[data-header]");
    // White header while it sits over footage (home and Stories heroes).
    if (head && document.querySelector("main .hero--video")) head.classList.add("site-header--on-video");
    if (toggle && head) toggle.addEventListener("click", () =>
      head.classList.toggle("is-menu-open", toggle.getAttribute("aria-expanded") === "true"));
  }

  /* Top-fold doodles are written one at a time, stroke by stroke, like a pen
   * on paper. A <use> keeps its paths in a shadow tree that CSS can't time
   * separately, so each doodle's paths are copied in place, then animated with
   * the Web Animations API: duration follows the stroke's on-screen length,
   * with a short pen lift between strokes and a longer one between doodles.
   * Order: data-seq (lowest first), then document order. */
  const PEN_SPEED = 850;                 // px per second along the stroke
  const STROKE_MS = [160, 950];          // clamp: tiny ticks still visible, long swoops not sluggish
  const LIFT_MS = 70, NEXT_MS = 170, START_MS = 350;

  function writeHeroDoodles(hero) {
    // The homepage logo circle is written first, then the hero's marks by data-seq.
    const order = el => el.closest(".brand") ? -1 : el.dataset.seq ? Number(el.dataset.seq) : 999;
    const marks = [...document.querySelectorAll(".brand .doodle--draw"), ...hero.querySelectorAll(".doodle--draw")]
      .filter(svg => svg.getClientRects().length)          // skip ones hidden at this screen size
      .sort((a, b) => order(a) - order(b));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      marks.forEach(svg => svg.classList.add("is-drawn"));
      return;
    }
    let at = START_MS;
    marks.forEach(svg => {
      const use = svg.querySelector("use");
      const symbol = use && document.getElementById(use.getAttribute("href").split("#")[1]);
      if (!symbol) return;
      const ink = document.createElementNS(NS, "g");
      ink.setAttribute("class", "ink");
      symbol.querySelectorAll("path").forEach(p => ink.appendChild(p.cloneNode()));
      use.replaceWith(ink);
      svg.classList.add("is-written");
      // viewBox units → screen pixels (doodles stretch, so average both axes)
      const box = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal;
      const scale = (box.width / vb.width + box.height / vb.height) / 2;
      [...ink.children].forEach(path => {
        const ms = Math.min(STROKE_MS[1], Math.max(STROKE_MS[0], path.getTotalLength() * scale / PEN_SPEED * 1000));
        path.animate([{ strokeDashoffset: 1.05 }, { strokeDashoffset: 0 }],
          { duration: ms, delay: at, easing: "cubic-bezier(.5, .05, .35, 1)", fill: "both" });
        at += ms + LIFT_MS;
      });
      at += NEXT_MS;
    });
  }

  /* Underlines vary across the site. Markup always says "underline-single"
   * (lines) or "underline" (section-title scribbles); this swaps each one for
   * a variant of the same family, cycling in page order from an offset picked
   * by the page name. Neighbours always differ, and a page looks the same on
   * every visit. The video progress line keeps its shape (track and fill must
   * match). */
  const UNDERLINES = {
    "underline-single": ["underline-single", "underline-wave", "underline-hook", "underline-return", "underline-rise", "underline-dip", "underline-zig"],
    "underline": ["underline", "underline-loop", "underline-scrawl", "underline-swash"]
  };
  const pageSeed = [...(document.body.dataset.page || location.pathname)].reduce((n, c) => n + c.charCodeAt(0), 0);
  const used = { "underline-single": 0, "underline": 0 };

  // Header nav items keep one shape on every page, so the line you hover is
  // the line that marks the page once you're there. Keyed by label, so the
  // desktop "Pillars" link and its phone-menu twin match.
  const navLabels = [];
  const navShape = (link) => {
    const label = link.textContent.trim();
    if (!navLabels.includes(label)) navLabels.push(label);
    return UNDERLINES["underline-single"][navLabels.indexOf(label) % UNDERLINES["underline-single"].length];
  };

  function varyUnderlines(root) {
    root.querySelectorAll("svg.doodle:not(.progress) use").forEach(use => {
      const [path, id] = use.getAttribute("href").split("#d-");
      const family = UNDERLINES[id];
      if (!family || use.dataset.varied) return;
      const navLink = use.closest(".site-header .nav-link");
      const pick = navLink ? navShape(navLink) : family[(pageSeed + used[id]++) % family.length];
      use.setAttribute("href", `${path}#d-${pick}`);
      use.closest("svg").setAttribute("viewBox", SYMBOLS[pick][0]);
      use.dataset.varied = "1";
    });
  }

  function boot() {
    // A <base> element (404.html sets one so its links work at any URL depth)
    // makes "#d-…" resolve against the base URL, i.e. another document.
    // Point every doodle at this document explicitly.
    // (Runs after enhance() and varyUnderlines(), which add and change references.)
    enhance();
    varyUnderlines(document);
    if (document.querySelector("base[href]")) {
      const here = location.pathname + location.search;
      document.querySelectorAll('use[href^="#"]').forEach(u => u.setAttribute("href", here + u.getAttribute("href")));
    }
    const main = document.querySelector("main");
    if (main && "MutationObserver" in window) new MutationObserver(records => records.forEach(r =>
      r.addedNodes.forEach(n => n.nodeType === 1 && varyUnderlines(n)))).observe(main, { childList: true, subtree: true });

    /* Draw doodles in when they scroll into view. Without JS or with reduced
     * motion they are simply shown (see .doodle--draw in the CSS). */
    const hero = document.querySelector("main .hero");
    if (hero) writeHeroDoodles(hero);
    // Everything else draws in as it scrolls into view.
    const drawables = [...document.querySelectorAll(".doodle--draw")]
      .filter(el => !(hero && (hero.contains(el) || el.closest(".brand"))));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) { e.target.classList.add("is-drawn"); io.unobserve(e.target); }
        });
      }, { threshold: 0.35 });
      drawables.forEach(el => io.observe(el));
    } else {
      drawables.forEach(el => el.classList.add("is-drawn"));
    }

    /* Header turns solid once you leave the hero. */
    const header = document.querySelector("[data-header]");
    if (header) {
      const onScroll = () => header.classList.toggle("is-solid", window.scrollY > 24);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* Hero video. The <video> carries data-src instead of src, so nothing
     * downloads until we decide to play: never for reduced-motion or Save-Data
     * visitors (they keep the poster and can press play), and only while the
     * hero is on screen. The pause button is required for autoplaying video
     * (WCAG 2.2.2). */
    const video = document.querySelector("[data-hero-video]");
    if (video) {
      const toggle = document.querySelector("[data-video-toggle]");
      const progress = document.querySelector("[data-video-progress]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const saveData = !!(navigator.connection && navigator.connection.saveData);
      // Loop window in seconds. The montage has b-roll first and subtitled
      // interviews later; the hero only loops the b-roll.
      const start = parseFloat(video.dataset.start || "0");
      const end = parseFloat(video.dataset.end || "0");
      let userPaused = reduceMotion || saveData;

      const setState = playing => {
        if (!toggle) return;
        toggle.dataset.state = playing ? "playing" : "paused";
        toggle.setAttribute("aria-label", playing ? "Pause background video" : "Play background video");
      };
      const play = () => {
        if (!video.src) {
          video.src = video.dataset.src;
          video.addEventListener("loadedmetadata", () => { if (start) video.currentTime = start; }, { once: true });
        }
        video.play().catch(() => setState(false));
      };

      video.addEventListener("play", () => setState(true));
      video.addEventListener("pause", () => setState(false));
      // No `loop` attribute: we loop back to `start`, not to 0:00.
      video.addEventListener("ended", () => { video.currentTime = start; video.play(); });
      video.addEventListener("timeupdate", () => {
        if (end && video.currentTime >= end) video.currentTime = start;
      });
      if (progress) {
        video.addEventListener("timeupdate", () => {
          if (!video.duration) return;
          const t = (video.currentTime - start) / ((end || video.duration) - start);
          progress.style.strokeDashoffset = (1.05 * (1 - Math.min(Math.max(t, 0), 1))).toFixed(4);
        });
      }
      // Lightbox: "Watch the film" opens it with sound and full controls. The muted loop
    // behind it pauses meanwhile, and picks up again on close unless the visitor had paused it.
    document.querySelectorAll("[data-lightbox-open]").forEach(btn => {
      const box = document.getElementById(btn.dataset.lightboxOpen);
      const film = box && box.querySelector("video");
      if (!film || typeof box.showModal !== "function") return;
      const speed = box.querySelector("[data-lightbox-speed]");
      btn.addEventListener("click", () => {
        if (!film.src) film.src = film.dataset.src;
        film.playbackRate = Number(speed ? speed.value : 1);
        box.showModal();
        if (!video.paused) video.pause();
        film.play().catch(() => {});
      });
      speed && speed.addEventListener("change", () => (film.playbackRate = Number(speed.value)));
      box.querySelector("[data-lightbox-close]").addEventListener("click", () => box.close());
      box.addEventListener("click", e => { if (e.target === box) box.close(); }); // click on the backdrop
      box.addEventListener("close", () => { film.pause(); if (!userPaused) play(); btn.focus(); });
    });

    toggle && toggle.addEventListener("click", () => {
        if (video.paused) { userPaused = false; play(); }
        else { userPaused = true; video.pause(); }
      });

      setState(false);
      const hero = video.closest("section") || video;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting && !userPaused) play();
          else if (!entry.isIntersecting && !video.paused) video.pause();
        }, { threshold: 0.2 }).observe(hero);
      } else if (!userPaused) {
        play();
      }
    }
  }

  // Deferred scripts run while readyState is already "interactive", but before
  // DOMContentLoaded, which is when app.js renders the page. Listeners fire in
  // registration order, and app.js registered first, so boot() sees its markup.
  if (document.readyState === "complete") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
