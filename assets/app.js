/* Angat Buhay prototype — shared chrome + page renderers.
 * Each page sets <body data-page="..."> and provides empty slots (id="...")
 * that the matching renderer below fills from window.AB (data.js).
 */
(function () {
  const D = window.AB;
  const NOW = new Date();

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const param = (k) => new URLSearchParams(location.search).get(k);
  const fill = (id, html) => { const n = document.getElementById(id); if (n) n.innerHTML = html; };

  const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" }) : "—";
  const fmtMonth = (iso) => iso ? new Date(iso).toLocaleDateString("en-PH", { month: "short", year: "numeric" }) : "present";

  const pillarBy = (slug) => D.pillars.find((p) => p.slug === slug);
  const projectBy = (id) => D.projects.find((p) => p.id === id);
  const areaBy = (id) => D.areas.find((a) => a.id === id);
  const storyBy = (slug) => D.stories.find((s) => s.slug === slug);

  /** [area, parent, grandparent, ...] — used for region/province roll-up. */
  function ancestors(id) {
    const out = [];
    let a = areaBy(id);
    while (a) { out.push(a); a = a.parent ? areaBy(a.parent) : null; }
    return out;
  }
  const regionOf = (id) => ancestors(id).find((a) => a.type === "region");
  /** "Ajuy, Iloilo" style label. */
  function areaLabel(id) {
    const chain = ancestors(id);
    if (!chain.length) return id;
    const prov = chain.find((a) => a.type === "province");
    return prov && prov.id !== id ? `${chain[0].name}, ${prov.name}` : chain[0].name;
  }
  const inArea = (areaIds, targetId) => (areaIds || []).some((a) => ancestors(a).some((x) => x.id === targetId));

  const FORMAT_LABEL = { article: "Write-up", video: "Video", infographic: "Infographic" };

  /* ------------------------------------------------------------------
   * Visibility rules
   * In production this lives server-side (lib/visibility.ts) and every
   * public query goes through it. The browser never decides.
   * ------------------------------------------------------------------ */

  /**
   * Should this story appear in public listings (home, feed, pillar &
   * project pages, related stories, sitemap)?
   *
   * story.status      "draft" | "scheduled" | "published" | "archived"
   * story.publishedAt ISO string or null
   * now               Date
   */
  function isListedInFeed(story, now) {
    // Scheduled stories go live by themselves once their publish date passes:
    // no background job has to flip the status at the right minute.
    if (story.status !== "published" && story.status !== "scheduled") return false; // drafts, archived
    if (!story.publishedAt) return false;
    return new Date(story.publishedAt) <= now; // also hides a "published" story mistakenly dated in the future
  }

  const listedStories = () =>
    D.stories.filter((s) => isListedInFeed(s, NOW))
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const projectIsOngoing = (p) => !p.end || new Date(p.end) > NOW;

  /* ------------------------------------------------------------------
   * Shared fragments
   * ------------------------------------------------------------------ */
  const ph = (label, cls = "r-16x9") => `<div class="ph ${cls}" role="img" aria-label="${esc(label)}"><span>${esc(label)}</span></div>`;
  /** Resolve a media path (relative to AB.media.base) or pass a full URL through. */
  const M = (p) => (!p ? null : /^(https?:|assets\/|ui\/)/.test(p) ? p : D.media.base + p); // local files pass through
  /** Real photo if we have one, otherwise the wireframe placeholder. */
  const img = (path, alt, cls = "r-16x9", fallback = "photo") =>
    path ? `<img class="media ${cls}" src="${esc(M(path))}" alt="${esc(alt)}" loading="lazy" decoding="async">` : ph(fallback, cls);
  /** Muted, paused video showing a single frame: used as a card thumbnail. */
  const videoFrame = (url, cls = "r-16x9") =>
    `<div class="video-thumb ${cls}"><video class="media ${cls}" src="${esc(url)}#t=20" preload="metadata" muted playsinline aria-hidden="true" tabindex="-1"></video></div>`;
  const PH_TAG = ` <span class="sample-tag" title="Placeholder content, to be replaced with Angat Buhay's real copy">PLACEHOLDER</span>`;
  const sampleTag = (o) => (o && o.placeholder ? PH_TAG : o && o.sample ? ` <span class="sample-tag" title="Illustrative content">SAMPLE</span>` : "");

  /* ---- Design layer (ui/ab-ui-v3.css) ----
   * Doodles are <use> references into the sprite that ui/ab-doodles-v3.js injects. */
  const PILLAR_VAR = {
    "public-education": "--pillar-education", "health-nutrition-food-security": "--pillar-health",
    "climate-action-sustainability": "--pillar-climate", "community-engagement": "--pillar-community", "arts-culture": "--pillar-arts"
  };
  /** Inline style giving a block its pillar colour (used by hover underlines and stat underlines). */
  const pillarStyle = (slug) => PILLAR_VAR[slug] ? `--pillar:var(${PILLAR_VAR[slug]})` : "";
  const doodle = (cls, id, viewBox, style = "") =>
    `<svg class="doodle ${cls}" viewBox="${viewBox}" preserveAspectRatio="none"${style ? ` style="${style}"` : ""} aria-hidden="true"><use href="#d-${id}"/></svg>`;
  /** Crayon underline that draws in when its card or link is hovered. */
  const HOVER_LINE = doodle("draw-on-hover", "underline-single", "0 0 300 24");
  const PLAY_ICON = `<svg viewBox="0 0 10 12" fill="currentColor" aria-hidden="true"><path d="M0 0l10 6-10 6z"/></svg>`;
  const TORN_EDGE = `<svg class="torn" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 L0 22.0 L26.3 18.0 L48.3 21.5 L70.8 24.6 L91.9 22.9 L103.2 19.2 L124.6 14.8 L140.9 26.9 L149.6 21.2 L170.7 23.0 L196.8 26.7 L210.2 25.7 L219.5 18.2 L232.0 27.1 L254.1 29.0 L272.4 21.1 L282.6 30.4 L296.2 23.3 L313.5 16.3 L325.8 19.1 L339.1 21.4 L350.2 26.7 L375.2 22.9 L392.6 21.1 L419.2 19.6 L430.8 22.2 L444.0 19.5 L469.3 15.6 L477.1 19.7 L484.8 27.9 L504.7 16.0 L523.7 15.9 L549.2 26.5 L575.2 24.7 L581.4 17.5 L601.0 17.2 L617.7 23.6 L643.1 17.3 L668.8 15.7 L674.9 26.8 L701.2 14.3 L711.3 27.6 L732.2 17.7 L742.8 29.6 L764.3 24.0 L771.0 15.5 L779.8 23.6 L786.7 26.4 L814.5 27.4 L829.7 17.5 L855.1 19.6 L870.1 26.4 L883.8 22.7 L897.2 24.2 L907.5 18.4 L935.4 22.9 L961.6 16.8 L970.6 21.0 L993.5 27.2 L1003.7 20.3 L1024.2 21.3 L1041.4 24.6 L1063.9 14.4 L1081.8 16.8 L1094.2 17.3 L1109.7 15.1 L1133.8 26.8 L1154.8 35.0 L1174.0 24.1 L1180.8 17.0 L1188.7 14.1 L1215.5 18.7 L1236.3 17.4 L1264.2 19.9 L1287.2 19.6 L1294.6 17.2 L1322.0 16.1 L1339.2 15.7 L1358.4 19.1 L1378.7 21.8 L1406.5 15.1 L1419.4 18.2 L1427.5 17.3 L1440.0 24.7 L1440 60 Z"/></svg>`;

  /* ------------------------------------------------------------------
   * Language (English / Filipino). The Filipino strings are a PLACEHOLDER
   * translation of menus and headings only; final copy needs a reviewed
   * translation. In production each CMS field is localised (en, fil).
   * ------------------------------------------------------------------ */
  const FIL = {
    "Skip to content": "Lumaktaw sa nilalaman", "Stories": "Mga Kuwento", "Pillars": "Mga Haligi",
    "Presence": "Saan Kami Naroroon", "About": "Tungkol sa Amin", "Get involved": "Makilahok", "Ways to help": "Mga paraan para tumulong",
    "Donate": "Mag-donate", "Volunteer": "Mag-volunteer", "Fundraisers": "Mga Fundraiser", "Partner with us": "Makipag-partner sa amin",
    "Reports & resources": "Mga ulat at resources", "Explore": "Tuklasin", "Contact": "Makipag-ugnayan", "About us": "Tungkol sa amin",
    "Privacy notice": "Abiso sa privacy", "Staff login": "Login ng staff", "Prototype guide": "Gabay sa prototype",
    "Featured story": "Tampok na kuwento", "Watch more": "Manood pa", "About Angat Buhay": "Tungkol sa Angat Buhay",
    "See where we work": "Tingnan kung saan kami naroroon", "Stories of impact": "Mga kuwento ng pagbabago", "Our impact so far": "Ang aming nagawa sa ngayon", "All stories": "Lahat ng kuwento",
    "Be involved": "Makilahok", "More impact": "Higit pang pagbabago", "Pillar": "Haligi", "Region": "Rehiyon",
    "Sort by": "Ayusin ayon sa", "Search": "Maghanap", "Clear": "I-clear", "Load more": "Magpakita pa", "Projects": "Mga Proyekto",
    "Impact": "Epekto", "The team": "Ang aming team", "Meet the rest of the team": "Kilalanin ang buong team",
    "Support this pillar": "Suportahan ang haliging ito", "Other pillars": "Iba pang haligi", "See other stories": "Iba pang kuwento",
    "Mission": "Misyon", "Vision": "Bisyon", "Core values": "Mga pangunahing pagpapahalaga", "Certifications": "Mga sertipikasyon",
    "Where we work": "Saan kami naroroon", "Regions and provinces": "Mga rehiyon at probinsya", "Choose how to give": "Piliin kung paano magbigay",
    "How to give": "Paano magbigay", "After you donate": "Pagkatapos mong mag-donate", "Other ways to give": "Iba pang paraan ng pagbibigay",
    "How it works": "Paano ito gumagana", "Sign up": "Mag-sign up", "Send": "Ipadala", "Share the bayanihan spirit": "Ibahagi ang diwa ng bayanihan",
    "Bring this project to your community": "Dalhin ang proyektong ito sa inyong komunidad", "Stories from this project": "Mga kuwento mula sa proyektong ito",
    "We empower Filipinos to become communities of active citizens by mobilizing the largest volunteer network in implementing Bayanihan programs.":
      "Tinutulungan namin ang mga Pilipino na maging mga komunidad ng aktibong mamamayan sa pamamagitan ng pagpapakilos sa pinakamalaking volunteer network sa pagpapatupad ng mga programang Bayanihan."
  };
  // EN/FIL switch hidden for now (Nov 2026); set to true to bring it back. While off, every page
  // is English, even for visitors who chose Filipino earlier (they'd have no way to switch back).
  const LANG_SWITCH = false;
  let LANG = !LANG_SWITCH ? "en" : param("lang") === "fil" ? "fil" : param("lang") === "en" ? "en" : null;
  try { LANG = LANG || localStorage.getItem("ab-lang") || "en"; if (LANG_SWITCH) localStorage.setItem("ab-lang", LANG); } catch (e) { LANG = LANG || "en"; }
  const t = (en) => (LANG === "fil" && FIL[en]) || en;
  /** Translate static headings/buttons already in the page HTML. */
  function translateStatic() {
    if (LANG !== "fil") return;
    document.documentElement.lang = "fil";
    $$("h1, h2, h3, .btn, .link-arrow, .eyebrow, label, .lede, summary, .back").forEach((el) => {
      if (el.children.length) return;
      const key = el.textContent.replace(/\s+/g, " ").trim();
      if (FIL[key]) el.textContent = FIL[key];
    });
  }

  /** variant: "" (grid card), "is-feature" (large, rough-cropped photo) or "is-row" (compact, photo left). */
  function storyCard(s, variant = "") {
    if (typeof variant !== "string") variant = ""; // called via .map(storyCard), which passes the index
    const p = pillarBy(s.pillar);
    const media = s.format === "video"
      ? (s.image ? `<div class="video-thumb">${img(s.image, "")}</div>` : s.videoUrl ? videoFrame(s.videoUrl)
        : ph(s.embedUrl ? "Instagram reel" : "video thumbnail", "r-16x9 play"))
      : s.format === "infographic" ? img(s.image, "", "r-16x9", "infographic preview") : img(s.image, "");
    return `<article class="card card--story${variant ? " " + variant : ""}" style="${pillarStyle(s.pillar)}">
      <div class="card__media${variant === "is-feature" ? " rough-bottom" : ""}">${media}</div>
      <div class="card__body body">
        <div class="tags">${p ? `<span class="tag">${esc(p.name)}</span>` : ""}<span class="tag tag--format">${FORMAT_LABEL[s.format]}</span></div>
        <h3 class="h3 card__title"><a class="stretched" href="story.html?s=${esc(s.slug)}"><span class="title-ink">${esc(s.title)}${HOVER_LINE}</span></a>${sampleTag(s)}</h3>
        <p class="sub">${esc(s.subheading)}</p>
        <div class="meta">${s.areas.length ? esc(s.areas.map(areaLabel).slice(0, 2).join("; ")) + " · " : ""}${fmtDate(s.publishedAt)}</div>
      </div>
    </article>`;
  }


  function projectCard(p) {
    return `<article class="card card--story card--project" style="${pillarStyle(p.pillar)}">
      <div class="card__media">${img(p.image, "", "r-4x3", "project photo")}</div>
      <div class="card__body body">
        <h3 class="h3 card__title"><a class="stretched" href="project.html?id=${esc(p.id)}"><span class="title-ink">${esc(p.title)}${HOVER_LINE}</span></a></h3>
        <p class="sub">${esc(p.summary)}</p>

      </div>
    </article>`;
  }

  /** Pillar card: portrait photo, pillar-coloured underline on hover. */
  const pillarCard = (p) => `<a class="card card--pillar" href="pillar.html?p=${esc(p.slug)}" style="${pillarStyle(p.slug)}">
      <div class="card__media"><img src="${esc(M(p.thumb || p.image))}" alt="" loading="lazy" decoding="async"></div>
      <div class="card__body"><h3 class="h3 card__title">${esc(p.name)}${HOVER_LINE}</h3><p>${esc(p.tagline)}</p></div>
    </a>`;

  /** "Jasper Ruby Vijar, RMT, MD" → "JV": first and last name, credentials after the comma ignored. */
  const initials = (name) => {
    const words = name.split(",")[0].trim().split(/\s+/).filter((w) => !/^[A-Z]\.$/.test(w)); // drop middle initials
    return (words[0][0] + (words.length > 1 ? words[words.length - 1][0] : "")).toUpperCase();
  };
  const person = (m) => `<div class="person">${m.photo ? img(m.photo, "", "round")
      : `<span class="avatar" role="img" aria-label="Photo to follow">${esc(initials(m.name))}</span>`}<b>${esc(m.name)}</b><span>${esc(m.role)}</span>${m.note ? `<small class="person__note">${esc(m.note)}</small>` : ""}</div>`;

  function statsBlock(stats) {
    if (!stats.length) return "";
    return `<div class="stats">${stats.map((s, i) => `<div class="stat" style="${pillarStyle(s.pillar)}">
        <span class="stat__value">${esc(s.value)}${doodle("doodle--draw", "underline-single", "0 0 300 24", `--delay:${(i * 0.12).toFixed(2)}s`)}</span>
        <span class="stat__label">${esc(s.label)}</span></div>`).join("")}</div>
      <p class="stats-note small muted">As of ${esc(D.impactAsOf)} · Source: <a href="resources.html">${esc(D.impactSource)}</a>${D.impactAsOfPlaceholder ? PH_TAG : ""}</p>`;
  }

  /* ------------------------------------------------------------------
   * Chrome: header, footer, prototype toolbar
   * ------------------------------------------------------------------ */
  const NAV_CURRENT = { stories: "stories.html", story: "stories.html", presence: "presence.html", about: "about.html", donate: "donate.html",
    pillar: "index.html#pillars", project: "index.html#pillars" };
  /** Pages that live under the "Get involved" menu (its heading shows as current there). */
  const INVOLVED_PAGES = ["involved", "donate", "volunteer", "fundraisers", "fundraiser", "resources"];

  function header(page) {
    const cur = NAV_CURRENT[page];
    const line = doodle("draw-on-hover doodle--fine", "underline-single", "0 0 300 24");
    const top = (href, label) => `<a class="nav-link" href="${href}"${href === cur ? ' aria-current="page"' : ""}>${esc(t(label))}${line}</a>`;
    const a = (href, label) => `<a href="${href}"${href === cur ? ' aria-current="page"' : ""}>${esc(t(label))}</a>`;
    const langBtn = (code, label, name) => `<button type="button" data-lang="${code}" aria-pressed="${LANG === code}" lang="${code}" aria-label="${name}">${label}</button>`;
    const langs = langBtn("en", "EN", "English") + langBtn("fil", "FIL", "Filipino");
    const langGroup = (cls) => (LANG_SWITCH ? `<div class="${cls}" role="group" aria-label="Language / Wika">${langs}</div>` : "");
    return `<a class="skip" href="#main">${t("Skip to content")}</a>
    <header class="site-header" data-header><div class="wrap site-header__bar">
      <a class="brand logo" href="index.html" aria-label="Angat Buhay home"${page === "home" ? ' aria-current="page"' : ""}><img class="brand-logo" src="assets/media/angat-buhay-logo.png" alt="Angat Buhay" width="82" height="46">${
        // Home has no nav item of its own, so the logo carries the "you are here" mark: a hand-drawn circle.
        page === "home" ? doodle("doodle--draw brand-circle c-yellow", "encircle", "0 0 300 120") : ""}</a>
      <nav id="nav" class="nav site-nav" aria-label="Main">
        ${top("stories.html", "Stories")}
        <a class="nav-link nav-desktop" href="index.html#pillars"${cur === "index.html#pillars" ? ' aria-current="page"' : ""}>${esc(t("Pillars"))}${line}</a>
        <details class="nav-mobile"><summary class="nav-link${cur === "index.html#pillars" ? " is-current" : ""}">${t("Pillars")}${line}</summary><div class="menu">
          ${D.pillars.map((p) => `<a href="pillar.html?p=${p.slug}">${esc(p.name)}</a>`).join("")}
        </div></details>
        ${top("presence.html", "Presence")}
        ${top("about.html", "About")}
        <details class="menu-end"><summary class="nav-link${INVOLVED_PAGES.includes(page) ? " is-current" : ""}">${t("Get involved")}${line}</summary><div class="menu">
          ${a("involved.html", "Ways to help")}
          ${a("donate.html", "Donate")}
          ${a("volunteer.html", "Volunteer")}
          ${a("fundraisers.html", "Fundraisers")}
          ${a("involved.html#partner", "Partner with us")}
          ${a("resources.html", "Reports & resources")}
        </div></details>
        ${langGroup("nav-lang lang-switch")}
      </nav>
      <div class="header-tools site-header__actions">
        ${langGroup("lang-switch")}
        <a class="btn btn--attention btn--sm" href="donate.html">${esc(t("Donate"))}${doodle("btn__spark doodle--fine", "sparkle", "0 0 100 100")}</a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav"><span class="visually-hidden">Menu</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h10"/></svg></button>
      </div>
    </div></header>
    ${LANG === "fil" ? `<div class="lang-banner small"><div class="wrap">Filipino${PH_TAG} Menus and headings only. The final Filipino copy will be translated and reviewed by Angat Buhay. <button type="button" class="btn small" data-lang="en">Switch to English</button></div></div>` : ""}`;
  }

  function footer() {
    const o = D.org;
    return `<footer class="site-footer" id="footer">
      ${doodle("doodle--draw footer-squiggle", "spring", "0 0 300 80", "stroke-width:4")}
      <div class="wrap">
      <div class="footer-grid">
        <div><span class="footer-logo"><img src="assets/media/angat-buhay-logo.png" alt="Angat Buhay" width="82" height="46"></span><p style="margin-top:1.25rem">${esc(o.intro)}</p></div>
        <div><h4>${t("Explore")}</h4><ul>
          <li><a href="stories.html">${t("Stories")}</a></li>
          ${D.pillars.map((p) => `<li><a href="pillar.html?p=${p.slug}">${esc(p.name)}</a></li>`).join("")}
          <li><a href="presence.html">${t("Presence")}</a></li>
        </ul></div>
        <div><h4>${t("Get involved")}</h4><ul>
          <li><a href="donate.html">${t("Donate")}</a></li>
          <li><a href="volunteer.html">${t("Volunteer")}</a></li>
          <li><a href="fundraisers.html">${t("Fundraisers")}</a></li>
          <li><a href="involved.html#partner">${t("Partner with us")}</a></li>
          <li><a href="about.html">${t("About us")}</a></li>
          <li><a href="resources.html">${esc(t("Reports & resources"))}</a></li>
        </ul></div>
        <div><h4>${t("Contact")}</h4><ul>
          <li><a href="mailto:${o.email}">${o.email}</a></li>
          <li><a href="mailto:${o.partnershipsEmail}">${o.partnershipsEmail}</a></li>
        </ul>
        <div class="socials" style="margin-top:1rem">${o.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join("")}</div>
        </div>
      </div>
      <p class="footer-accred">${esc(o.accreditation)} Operating with DSWD Solicitation Permit No. ${esc(o.solicitationPermit)}.</p>
      <div class="footer-legal"><span>© ${NOW.getFullYear()} ${esc(o.legalName)}. All rights reserved.</span>
        <span class="socials"><a href="privacy.html">${t("Privacy notice")}</a></span></div>
    </div></footer>`;
  }

  /** Design notes are off by default; turned on from the Prototype guide page (or ?notes=1). */
  function designNotes() {
    let on = param("notes") === "1";
    try { on = on || localStorage.getItem("ab-notes") === "1"; } catch (e) {}
    const set = (v) => {
      on = v; document.body.classList.toggle("show-notes", v);
      const btn = $("#notes-toggle"); if (btn) { btn.setAttribute("aria-pressed", String(v)); btn.textContent = v ? "Hide design notes" : "Show design notes"; }
      try { localStorage.setItem("ab-notes", v ? "1" : "0"); } catch (e) {}
    };
    set(on);
    const btn = $("#notes-toggle");
    if (btn) btn.addEventListener("click", () => set(!on));
  }

  /* Hero background video.
   * The only source file today is the live site's 411 MB, ~14 Mbps montage, so the
   * prototype never preloads it. Large screens on a fast connection stream a short
   * muted segment on loop. Phones, Save-Data, slow networks and reduced-motion get
   * the poster and a Play button. Production swaps in a ≤10 MB encoded loop. */
  const HERO_SEGMENT_S = 15;
  function heroShouldAutoplay() {
    const c = navigator.connection || {};
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (c.saveData) return false;
    if (c.effectiveType && /2g|3g/.test(c.effectiveType)) return false;
    return matchMedia("(min-width: 1024px)").matches;
  }
  function wireHeroVideo() {
    const v = $(".hero video, .home-hero video"), b = $(".hero .video-toggle, .home-hero .video-toggle");
    if (!v || !b) return;
    const load = () => { if (!v.getAttribute("src")) v.src = `${v.dataset.src}#t=0,${HERO_SEGMENT_S}`; };
    const sync = () => { b.textContent = v.paused ? "▶ Play video" : "❚❚ Pause video"; b.setAttribute("aria-pressed", String(v.paused)); };
    // Loop only the opening segment so the browser never streams the full file.
    v.addEventListener("timeupdate", () => { if (v.currentTime >= HERO_SEGMENT_S) { v.currentTime = 0; v.play(); } });
    b.addEventListener("click", () => { load(); v.paused ? v.play() : v.pause(); });
    v.addEventListener("play", sync); v.addEventListener("pause", sync);
    if (heroShouldAutoplay()) { load(); v.play().catch(() => {}); }
    sync();
  }

  function wireNav() {
    const t = $(".menu-toggle"), nav = $("#nav");
    if (t) t.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      t.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      $$(".nav details[open]").forEach((d) => { if (!d.contains(e.target)) d.removeAttribute("open"); });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") $$(".nav details[open]").forEach((d) => { d.removeAttribute("open"); d.querySelector("summary").focus(); });
    });
    document.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-copy], .copy-link");
      if (!b) return;
      const text = b.dataset.copy || location.href, label = b.textContent;
      try { await navigator.clipboard.writeText(text); b.textContent = "Copied"; } catch (err) { b.textContent = "Copy failed"; }
      setTimeout(() => (b.textContent = label), 1600);
    });
    // Collapse to the Menu button when the full nav would not fit on one row.
    const hdr = $(".site-header"), row = $(".site-header .wrap");
    const fit = () => {
      if (!hdr || nav.classList.contains("open")) return;
      hdr.classList.remove("compact");
      if (row.scrollWidth > row.clientWidth + 1) hdr.classList.add("compact");
    };
    fit(); addEventListener("resize", fit);
    // Only one menu open at a time.
    $$(".nav details").forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) $$(".nav details[open]").forEach((o) => o !== d && o.removeAttribute("open"));
    }));
    $$("[data-lang]").forEach((btn) => btn.addEventListener("click", () => {
      try { localStorage.setItem("ab-lang", btn.dataset.lang); } catch (e) {}
      const u = new URL(location.href); u.searchParams.set("lang", btn.dataset.lang); location.href = u.toString();
    }));
  }

  /* ------------------------------------------------------------------
   * Page renderers
   * ------------------------------------------------------------------ */
  const pages = {};

  /** Stories page hero: the silent montage loop (D.media.heroLoop) behind the page intro.
   * "Watch the video" opens the full montage with sound (D.media.heroVideo, the video the live
   * homepage plays) in a lightbox; "Our stories" scrolls to the feed. */
  function storiesHero() {
    const loop = D.media.heroLoop;
    return `<section class="hero hero--video hero--story film" aria-labelledby="stories-hero-title">
      <div class="hero__media"><video data-hero-video poster="${esc(D.media.heroLoopPoster)}" muted playsinline preload="none" aria-hidden="true" tabindex="-1">${
        loop.map((v) => `<source data-src="${esc(v.src)}" type="${esc(v.type)}"${v.media ? ` media="${esc(v.media)}"` : ""}>`).join("")}</video></div>
      <div class="hero__grade" aria-hidden="true"></div><div class="hero__scrim" aria-hidden="true"></div>
      ${doodle("doodle--draw c-yellow hide-tablet", "swoop", "0 0 600 300", "--delay:.6s; top:110px; right:8%; width:min(360px,28vw); height:auto; aspect-ratio:2/1; stroke-width:6")}
      ${doodle("doodle--draw doodle--fine c-white hide-tablet", "sparkle", "0 0 100 100", "--delay:1s; top:40%; right:14%; width:30px; height:30px; stroke-width:9")}
      <div class="wrap hero__inner">
        <div class="hero__copy">
          <h2 class="display" id="stories-hero-title">Bayanihan in action</h2>
          <p class="lede">Volunteers, partners and communities across the Philippines, in their own words.${PH_TAG}</p>
          <div class="hero__ctas">
            <button class="btn btn--white btn--lg" type="button" data-lightbox-open="montage"><span class="play">${PLAY_ICON}</span>Watch the video</button>
            <a class="btn btn--glass-dark btn--lg" href="#feed">Our stories</a>
          </div>
        </div>
        <div class="hero__now" style="justify-content:flex-end">
          <button class="video-btn" type="button" data-video-toggle data-state="paused" aria-label="Play background video">
            <svg class="icon-pause" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3.6" height="12" rx="1.2"/><rect x="9.4" y="2" width="3.6" height="12" rx="1.2"/></svg>
            <svg class="icon-play" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.2v11.6c0 .8.9 1.3 1.6.8l8.6-5.8c.6-.4.6-1.2 0-1.6L5.6 1.4C4.9.9 4 1.4 4 2.2z"/></svg>
          </button></div>
      </div>
      ${TORN_EDGE}
    </section>
    <dialog class="lightbox" id="montage" aria-labelledby="montage-title">
      <div class="lightbox__bar">
        <h2 class="lightbox__title" id="montage-title">Bayanihan in action</h2>
        <label class="lightbox__speed">Speed
          <select data-lightbox-speed>
            <option value="0.5">0.5×</option><option value="0.75">0.75×</option><option value="1" selected>1×</option>
            <option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option>
          </select>
        </label>
        <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close video">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <video controls playsinline preload="none" data-src="${esc(D.media.heroVideo)}" poster="${esc(D.media.heroLoopPoster)}"></video>
    </dialog>`;
  }

  function homeHero() {
    const s = listedStories().find((x) => x.featured) || listedStories()[0];
    const version = document.body.dataset.version || "v0.3";
    const media = version === "v0.3" && s && s.videoUrl ? `<video class="home-hero-media" data-src="${esc(s.videoUrl)}" poster="${esc(M(s.image || D.media.heroPoster))}" muted playsinline preload="none" aria-label="${esc(s.title)} (muted background video)"></video>
      <button class="video-toggle" type="button">▶ Play video</button>` : "";
    const story = s ? `<a class="home-featured-story" href="story.html?s=${esc(s.slug)}">
      <span>Featured story</span>
      <strong>${esc(s.title)}</strong>
      <b>Watch the story</b>
    </a>` : "";
    return `<section class="home-hero" aria-labelledby="home-hero-title">
      ${media}
      <div class="wrap home-hero-inner">
        <div class="home-hero-paper">
          <p class="eyebrow">Bayanihan in action</p>
          <h1 id="home-hero-title">Bayanihan is how we rise.</h1>
          <p>When communities lead and people show up for one another, hope becomes something we can build together.</p>
          <div class="button-row">
            <a class="btn solid" href="involved.html">Join the movement</a>
            <a class="btn light" href="#advocacies">Explore our work</a>
          </div>
        </div>
        ${story}
      </div>
    </section>`;
  }

  function homePillarCard(p, index) {
    return `<a class="pillar-card pillar-card-${index + 1}" href="pillar.html?p=${esc(p.slug)}" style="--pillar-image:url('${esc(M(p.image))}')">
      <span class="pillar-number">0${index + 1}</span>
      <span class="pillar-card-copy"><strong>${esc(p.name)}</strong><small>${esc(p.tagline)}</small><b>Explore advocacy</b></span>
    </a>`;
  }

  /**
   * Which fundraiser the homepage "Join a fundraiser" card promotes as "Next up".
   *
   * list   D.fundraisers: { name, date (display text), startDate ("YYYY-MM-DD"), … }
   * today  Date (NOW)
   * Return one fundraiser object, or null to hide the "Next up" box.
   */
  function nextFundraiser(list, today) {
    // TODO(human)
  }

  pages.home = () => {
    const version = document.body.dataset.version;
    if (!version) {
      // Hero copy is static in index.html; the "Now playing" strip follows the featured story.
      const f = listedStories().find((x) => x.featured) || listedStories()[0];
      const now = $("#now-playing");
      if (f && now) { now.href = "story.html?s=" + f.slug; fill("now-title", esc(f.title)); fill("now-sub", esc(f.subheading)); }
      fill("pillar-cards", D.pillars.map(pillarCard).join(""));
      // Headline figure per pillar: the first impact stat listed for each, in pillar order.
      fill("home-stats", statsBlock(D.pillars.map((p) => D.impactStats.find((s) => s.pillar === p.slug)).filter(Boolean)));
      // The hero already plays the featured story, so "More impact" starts after it.
      const latest = listedStories().filter((s) => s.image && s !== f).slice(0, 4);
      fill("latest", latest.length ? storyCard(latest[0], "is-feature") + `<div class="story-stack">${latest.slice(1).map((s) => storyCard(s, "is-row")).join("")}</div>` : "");
      const homeMap = presenceMap({ host: $("#home-map"), card: $("#home-map-card"), rows: presenceRows() });
      if (homeMap) homeMap.update("");
      const next = nextFundraiser(D.fundraisers, NOW);
      if (next) fill("next-fundraiser", `<span class="small muted">Next up · ${esc(next.date)}</span><b>${esc(next.name)}</b>`);
      return;
    }
    fill("hero", homeHero());
    fill("pillars", D.pillars.map(homePillarCard).join(""));
    fill("latest", listedStories().filter((s) => s.image).slice(0, 3).map(storyCard).join(""));
  };

  pages.stories = () => {
    fill("hero", storiesHero());
    const PAGE = 6;
    const st = {
      pillar: param("pillar") || "", region: param("region") || "",
      format: param("format") || "", sort: param("sort") || "newest", q: param("q") || "", shown: PAGE
    };

    // Filter controls (they filter live; Enter in the search box must not submit the form)
    $(".filters").addEventListener("submit", (e) => e.preventDefault());
    $("#f-pillar").innerHTML = `<option value="">All pillars</option>` + D.pillars.map((p) => `<option value="${p.slug}">${esc(p.name)}</option>`).join("");
    const regions = D.areas.filter((a) => a.type === "region");
    $("#f-region").innerHTML = `<option value="">All regions</option>` + regions.map((r) =>
      `<optgroup label="${esc(r.name)}"><option value="${r.id}">All of ${esc(r.name)}</option>${
        D.areas.filter((a) => a.parent === r.id).map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</optgroup>`).join("");
    $("#f-format").innerHTML = `<option value="">All formats</option>` + Object.entries(FORMAT_LABEL).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
    $("#f-pillar").value = st.pillar; $("#f-region").value = st.region; $("#f-format").value = st.format;
    $("#f-sort").value = st.sort; $("#f-q").value = st.q;

    const list = $("#story-list"), loader = $("#loader"), count = $("#result-count");

    function results() {
      const q = st.q.trim().toLowerCase();
      const r = listedStories().filter((s) =>
        (!st.pillar || s.pillar === st.pillar) &&
        (!st.region || inArea(s.areas, st.region)) &&
        (!st.format || s.format === st.format) &&
        (!q || (s.title + " " + s.subheading).toLowerCase().includes(q)));
      return st.sort === "oldest" ? r.reverse() : r;
    }

    function syncUrl() {
      const u = new URLSearchParams();
      ["pillar", "region", "format", "q"].forEach((k) => st[k] && u.set(k, st[k]));
      if (st.sort !== "newest") u.set("sort", st.sort);
      try { history.replaceState(null, "", "?" + u.toString()); } catch (e) { /* file:// in some browsers */ }
    }

    function render() {
      const r = results();
      count.textContent = `${r.length} ${r.length === 1 ? "story" : "stories"}`;
      list.innerHTML = r.length ? r.slice(0, st.shown).map(storyCard).join("")
        : `<p class="muted">No stories match these filters. <button class="btn small" id="clear2">Clear filters</button></p>`;
      loader.hidden = st.shown >= r.length;
      const c2 = $("#clear2"); if (c2) c2.onclick = clear;
    }

    function onChange() {
      st.pillar = $("#f-pillar").value; st.region = $("#f-region").value; st.format = $("#f-format").value;
      st.sort = $("#f-sort").value; st.q = $("#f-q").value; st.shown = PAGE;
      syncUrl(); render();
    }
    function clear() {
      ["#f-pillar", "#f-region", "#f-format"].forEach((s) => ($(s).value = "")); $("#f-sort").value = "newest"; $("#f-q").value = "";
      onChange();
    }

    ["#f-pillar", "#f-region", "#f-format", "#f-sort"].forEach((s) => $(s).addEventListener("change", onChange));
    $("#f-q").addEventListener("input", onChange);
    $("#clear").addEventListener("click", clear);

    // "Infinite" scroll with a visible button fallback
    let busy = false;
    function more() {
      if (busy || loader.hidden) return;
      busy = true; loader.classList.add("loading");
      setTimeout(() => { st.shown += PAGE; render(); busy = false; }, 450);
    }
    $("#load-more").addEventListener("click", more);
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => e[0].isIntersecting && more(), { rootMargin: "200px" }).observe(loader);

    render();
  };

  pages.story = () => {
    const s = storyBy(param("s"));
    if (!s) { fill("story", `<h1>Story not found</h1><p><a href="stories.html">Browse all stories</a></p>`); return; }
    document.title = s.title + " · Angat Buhay";
    const p = pillarBy(s.pillar), pr = projectBy(s.project);

    const media = s.format === "video"
      ? (s.videoUrl
          ? `<video class="media r-16x9" src="${esc(s.videoUrl)}" controls playsinline preload="none" poster="${esc(M(s.image || D.media.heroPoster))}"></video>`
          : s.embedUrl
            ? `<iframe class="embed-vertical" src="${esc(s.embedUrl)}" title="${esc(s.title)} (video)" loading="lazy" allowfullscreen scrolling="no"></iframe>`
            : ph("Video embed (YouTube, privacy-enhanced) · captions on", "r-16x9 play")) +
        `<p class="small muted">${(s.alsoOn || []).map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">Watch on ${esc(n)}</a> · `).join("")}Transcript available below the video.</p>`
      : s.format === "infographic"
        ? `${img(s.image, "", "r-3x4", "Infographic (full width, tap to zoom)")}
           <details class="disclosure"><summary>Read this infographic as text</summary><div>${esc(s.textVersion || "[Text version — required field for infographics]")}</div></details>`
        : img(s.image, "", "r-16x9", "Hero photo");
    const g = s.gallery || [];
    // Imported stories carry their text ("## " marks a sub-heading) and in-story photos, which are
    // spread through the text, one after every few paragraphs. Samples keep the placeholders.
    let body;
    if (s.body) {
      const every = Math.max(2, Math.ceil(s.body.length / (g.length + 1)));
      body = s.body.map((para, i) => (para.startsWith("## ") ? `<h2>${esc(para.slice(3))}</h2>` : `<p>${esc(para)}</p>`) +
        ((i + 1) % every === 0 && g[(i + 1) / every - 1] ? `<figure>${img(g[(i + 1) / every - 1], "")}</figure>` : "")).join("");
      const shown = Math.floor(s.body.length / every);
      body += g.slice(shown).map((x) => `<figure>${img(x, "")}</figure>`).join("");
    } else {
      body = `<p>[Story body, migrated from angatbuhay.ph. Rich text: paragraphs, sub-headings, pull quotes, photo galleries.]</p><p>[Paragraph]</p>
        <figure>${img(g[0], "", "r-16x9", "In-story photo")}<figcaption>[Caption — required alt text in CMS]</figcaption></figure>
        <blockquote style="margin:24px 0;padding-left:16px;border-left:3px solid var(--ink);font-size:20px;font-weight:600">“[Pull quote from a community member]”<div class="small muted" style="font-weight:400">— [Name, role]</div></blockquote>
        ${g[1] ? `<figure>${img(g[1], "")}<figcaption>[Caption]</figcaption></figure>` : "<p>[Paragraph]</p>"}`;
    }

    const related = listedStories().filter((x) => x.slug !== s.slug && x.pillar === s.pillar).slice(0, 3);

    fill("story", `
      <a class="back" href="stories.html">All stories</a>
      ${isListedInFeed(s, NOW) ? "" : `<div class="banner">Status: ${esc(s.status)}. This story is hidden from public listings. In production, a direct link would follow the archived/draft URL rule.</div>`}
      <div class="article">
        <h1>${esc(s.title)}${sampleTag(s)}</h1>
        <p class="lede">${esc(s.subheading)}</p>
      </div>
      <div style="max-width:960px;margin:24px auto">${media}</div>
      <div class="article">
        <div class="meta-row">
          <span>Published <b>${fmtDate(s.publishedAt)}</b></span>
          <span>Format <b>${FORMAT_LABEL[s.format]}</b></span>
          <span>By <b>${esc(s.author)}</b></span>
          ${p ? `<span>Pillar <a href="pillar.html?p=${p.slug}"><b>${esc(p.name)}</b></a></span>` : ""}
          ${pr ? `<span>Project <a href="project.html?id=${pr.id}"><b>${esc(pr.title)}</b></a></span>` : ""}
          ${s.areas.length ? `<span>Where <b>${esc(s.areas.map(areaLabel).join("; "))}</b></span>` : ""}
        </div>
        <div class="note">"Published" is when the story went live. The project's implementation period is shown on the project page. The two dates are kept separate in the CMS.</div>
        ${body}
        <div class="chips" style="margin:24px 0">${s.areas.map((a) => `<a class="chip" href="stories.html?region=${a}">${esc(areaLabel(a))}</a>`).join("")}</div>
        <div class="banner" style="font-weight:400"><b>Support this work.</b> <a href="donate.html">Donate</a> · <a href="volunteer.html">Volunteer</a>${p ? ` · <a href="pillar.html?p=${p.slug}">More on ${esc(p.name)}</a>` : ""}</div>
        <p class="small muted">Share:
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">Facebook</a> ·
          <a href="https://x.com/intent/post?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(s.title)}" target="_blank" rel="noopener">X</a> ·
          <button type="button" class="btn ghost small copy-link" style="padding:0">Copy link</button></p>
      </div>
      ${related.length ? `<section class="section"><div class="section-head"><h2>More from ${esc(p ? p.name : "Angat Buhay")}</h2><a class="link-arrow" href="stories.html${p ? "?pillar=" + p.slug : ""}">See all</a></div>
        <div class="grid c3">${related.map(storyCard).join("")}</div></section>` : ""}
    `);
  };

  pages.pillar = () => {
    const p = pillarBy(param("p")) || D.pillars[0];
    document.title = p.name + " · Angat Buhay";
    fill("pillar-hero", `<h1>${esc(p.name)}</h1><p class="lede">${esc(p.description)}</p>${img(p.image, "", "r-16x9 wide", "pillar hero photo / short video loop")}`);
    fill("pillar-stats", statsBlock(D.impactStats.filter((s) => s.pillar === p.slug)));
    const projs = D.projects.filter((x) => x.pillar === p.slug && x.status === "published");
    fill("pillar-projects", projs.map(projectCard).join("") || `<p class="muted">No projects yet.</p>`);
    const stories = listedStories().filter((s) => s.pillar === p.slug);
    fill("pillar-stories", stories.slice(0, 3).map(storyCard).join("") || `<p class="muted">No stories yet.</p>`);
    $("#see-other").href = "stories.html?pillar=" + p.slug;
    $("#see-other").textContent = `See all ${stories.length} ${p.name} stories`;
    // Executive Director, Deputy Executive Director for Programs, then this pillar's Program Manager/Officer/Associate.
    const byRole = (re) => D.team.secretariat.find((m) => re.test(m.role));
    const team = [byRole(/^Executive Director$/), byRole(/Deputy Executive Director for Programs/),
      ...D.team.secretariat.filter((m) => m.pillar === p.slug && /Program (Manager|Officer|Associate)/.test(m.role))].filter(Boolean);
    fill("pillar-team", team.map(person).join(""));
    fill("pillar-others", D.pillars.filter((x) => x.slug !== p.slug).map(pillarCard).join(""));
  };

  /** Community / LGU journey: can we take part, what's needed, who do we talk to. */
  function participateSection(pr, p) {
    const part = pr.participation;
    if (!part) return "";
    const STATUS = { open: "Accepting", waitlist: "Waitlist / upcoming call", closed: "Not accepting now" };
    // Contact for every project: the Deputy Executive Director for Programs and Operations (Rhyn), per Angat Buhay.
    const lead = D.team.secretariat.find((m) => /Deputy Executive Director for Programs/.test(m.role));
    const subject = `Partnership inquiry: ${pr.title}`;
    const body = `Project: ${pr.title}\nOrganization / LGU:\nProvince and city/municipality:\nContact person, role and mobile number:\nWhat you would like to achieve:\nPreferred start (month/year):\n`;
    const mail = `mailto:${D.org.partnershipsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return `<section class="section" id="participate">
      <h2>Bring this project to your community${PH_TAG}</h2>
      <dl class="kv">
        <dt>Availability</dt><dd><span class="status ${part.status === "open" ? "published" : part.status === "waitlist" ? "scheduled" : "draft"}">${STATUS[part.status]}</span> ${esc(part.label)}</dd>
        <dt>Who can apply</dt><dd>${esc(part.who)}</dd>
      </dl>
      <div class="grid c2" style="margin-top:24px">
        <div><h3>What partners provide</h3><ul>
          <li>A letter of intent from the LGU, school head or organization lead</li>
          <li>A local coordinator who meets with our team monthly</li>
          <li>Counterpart support: venue, volunteers, transport or materials</li>
          <li>Agreement to share progress data for impact reporting</li></ul></div>
        <div><h3>How to apply</h3><ol class="steps">
          <li>Email us using the button below. The template lists what we need.</li>
          <li>Our partnerships team replies within <b>5 working days</b>.</li>
          <li>Scoping call and, if needed, a site visit.</li>
          <li>Partnership formalization agreement, then implementation and reporting.</li></ol></div>
      </div>
      <div class="card contact-card">
        ${lead ? `<div style="width:64px;flex:none">${lead.photo ? img(lead.photo, "", "round")
          : `<span class="avatar" role="img" aria-label="Photo to follow">${esc(initials(lead.name))}</span>`}</div>` : ""}
        <div><span class="contact-card__label">Responsible contact</span>
          <b class="contact-card__name">${lead ? esc(lead.name) : "Partnerships team"}</b><div class="small muted">${lead ? esc(lead.role) : ""} · <a href="mailto:${D.org.partnershipsEmail}">${D.org.partnershipsEmail}</a></div></div>
        <a class="btn solid" href="${mail}">${part.status === "closed" ? "Ask about similar programs" : "Inquire about this project"}</a>
      </div>
      <div class="note">Availability, eligibility and contact are CMS fields on each project, so LGUs can see whether they can join before writing in. The contact for every project is Rhyn Esolana, Deputy Executive Director for Programs and Operations, from the Team collection.</div>
    </section>`;
  }

  pages.project = () => {
    const pr = projectBy(param("id")) || D.projects[0];
    const p = pillarBy(pr.pillar);
    document.title = pr.title + " · Angat Buhay";
    const stories = listedStories().filter((s) => s.project === pr.id);
    fill("project", `
      <a class="back" href="pillar.html?p=${p.slug}">${esc(p.name)}</a>
      <h1>${esc(pr.title)}</h1>
      <p class="lede">${esc(pr.summary)}</p>
      <!-- The Implementation / Where / Partners / Taking part bar is off for now (Angat Buhay, doc 5.3–5.5);
           dates, areas and partners stay in the data for the map and a later round. -->
      ${img(pr.image, "", "r-16x9", "project photo / gallery")}
      <div class="article" style="margin:32px 0 0;max-width:720px">
        <h2 id="about-project">About the project</h2>
        ${pr.description ? pr.description.map((para) => `<p>${esc(para)}</p>`).join("")
          : `<p>This section explains the need the project responds to, how Angat Buhay and its partners deliver it, and who benefits. It will be written with the program team.${PH_TAG}</p>`}
        <!-- No Results section: a project's results are told through its stories (below). -->
      </div>
      ${participateSection(pr, p)}
      <section class="section" id="project-stories"><div class="section-head"><h2>Stories from this project</h2></div>
        <div class="grid c3">${stories.map(storyCard).join("") || `<p class="muted">No stories yet.</p>`}</div></section>
    `);
  };

  /** Bucket every tagged area into a "row": its province; NCR cities directly; else region-wide.
   *  Shared by the Presence table, the Presence map and the homepage map. */
  function presenceRows() {
    function rowKey(areaId) {
      const chain = ancestors(areaId);
      const prov = chain.find((a) => a.type === "province");
      if (prov) return prov.id;
      if (chain[0] && chain[0].type !== "region") return chain[0].id;
      return (chain[0] || {}).id;
    }
    const rows = {};
    const row = (k) => (rows[k] ||= { area: areaBy(k), pillars: new Set(), projects: new Set(), orgs: new Set() });
    D.projects.filter((p) => p.status === "published").forEach((p) => p.areas.forEach((a) => { const r = row(rowKey(a)); r.pillars.add(p.pillar); r.projects.add(p.id); }));
    listedStories().forEach((s) => s.areas.forEach((a) => row(rowKey(a)).pillars.add(s.pillar)));
    D.volunteerOrgs.forEach((o) => o.areas.forEach((a) => { const r = row(rowKey(a)); r.orgs.add(o.name); o.pillars.forEach((p) => r.pillars.add(p)); }));
    return rows;
  }

  pages.presence = () => {
    const rows = presenceRows();
    const sel = $("#presence-pillar");
    sel.innerHTML = `<option value="">All pillars</option>` + D.pillars.map((p) => `<option value="${p.slug}">${esc(p.name)}</option>`).join("");

    function render() {
      const f = sel.value;
      const regions = D.areas.filter((a) => a.type === "region");
      let provinces = 0;
      const body = regions.map((reg) => {
        const rs = Object.values(rows).filter((r) => r.area && regionOf(r.area.id).id === reg.id && (!f || r.pillars.has(f)))
          .sort((a, b) => (a.area.type === "region") - (b.area.type === "region") || a.area.name.localeCompare(b.area.name));
        if (!rs.length) return "";
        provinces += rs.filter((r) => r.area.type !== "region").length;
        return `<tr class="region-row"><th colspan="4" scope="colgroup">${esc(reg.name)}</th></tr>` + rs.map((r) => `<tr id="${r.area.id}">
          <th scope="row">${r.area.type === "region" ? "Region-wide" : esc(r.area.name)}</th>
          <td data-label="Pillars"><div class="chips">${[...r.pillars].map((p) => `<a class="chip" href="pillar.html?p=${p}">${esc(pillarBy(p).name)}</a>`).join("")}</div></td>
          <td data-label="Projects">${[...r.projects].map((id) => `<a href="project.html?id=${id}">${esc(projectBy(id).title)}</a>`).join("<br>") || "—"}</td>
          <td data-label="Volunteer organizations">${[...r.orgs].map(esc).join("<br>") || "—"}</td>
        </tr>`).join("");
      }).join("");
      $("#presence-table tbody").innerHTML = body || `<tr><td colspan="4">No areas for this pillar yet.</td></tr>`;
      $("#presence-count").textContent = `${provinces} provinces and cities listed`;
      map && map.update(f);
    }
    const map = presenceMap({ host: $("#ph-map"), card: $("#map-card"), rows, onPresencePage: true });
    // The table's header row sticks just below the sticky filter bar, so it needs the bar's height.
    const bar = $("#presence-bar");
    const barHeight = () => document.documentElement.style.setProperty("--table-bar-h", bar.offsetHeight + "px");
    barHeight(); addEventListener("resize", barHeight);
    sel.addEventListener("change", render);
    render();

    // Arriving from the homepage map (presence.html#cebu): flash that province's row.
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target && target.matches("#presence-table tr")) flashRow(target);
  };

  function flashRow(tr) {
    tr.scrollIntoView({ behavior: "smooth", block: "center" });
    tr.classList.add("is-flash");
    setTimeout(() => tr.classList.toggle("is-flash", false), 1600);
  }

  /* Province map (Presence hero and homepage panel). Shapes come from
   * assets/ph-provinces.js (window.AB_MAP, PSGC-coded) and join our data by
   * PSGC code: a province's own row, plus its region's "region-wide" row.
   * Metro Manila's four districts act as one shape, matching the table's NCR rows.
   * Hover previews a province; click (or Enter) pins it, so the card holds still
   * while the pointer travels to its links. Leaving the map returns to the pin. */
  function presenceMap({ host, card, rows, onPresencePage }) {
    if (!host || !card || !window.AB_MAP) return null;
    const NCR = 1300000000;
    const regionArea = (code) => D.areas.find((a) => a.type === "region" && a.psgc === code);
    const groups = {};
    window.AB_MAP.provinces.forEach((f) => {
      const key = f.region === NCR ? "ncr" : String(f.psgc);
      if (groups[key]) return;
      const reg = regionArea(f.region);
      const regionName = reg ? reg.name : window.AB_MAP.regions[f.region] || "";
      if (key === "ncr") {
        const own = Object.values(rows).filter((r) => r.area && regionOf(r.area.id).id === "ncr");
        groups[key] = { name: "Metro Manila", region: regionName, own, wide: null };
      } else {
        const prov = D.areas.find((a) => a.type === "province" && a.psgc === f.psgc);
        groups[key] = { name: f.name, region: regionName, own: prov && rows[prov.id] ? [rows[prov.id]] : [], wide: reg ? rows[reg.id] || null : null };
      }
    });

    let filter = "", pinned = null;
    const ownFor = (g) => g.own.filter((r) => !filter || r.pillars.has(filter));
    const wideFor = (g) => (g.wide && (!filter || g.wide.pillars.has(filter)) ? g.wide : null);
    const stateOf = (g) => (ownFor(g).length ? "has" : wideFor(g) ? "region" : "none");
    const chips = (set) => `<div class="chips">${[...set].map((p) => `<a class="chip" href="pillar.html?p=${p}">${esc(pillarBy(p).name)}</a>`).join("")}</div>`;

    host.innerHTML = `<svg class="ph-map__svg" viewBox="${window.AB_MAP.viewBox}" role="group" aria-label="Map of the Philippines by province">${
      window.AB_MAP.provinces.map((f) => `<path d="${f.d}" data-key="${f.region === NCR ? "ncr" : f.psgc}"></path>`).join("")}</svg>`;
    const paths = $$("path", host);

    function intro() {
      paths.forEach((p) => p.classList.toggle("is-hot", false));
      const n = Object.values(groups).filter((g) => stateOf(g) === "has").length;
      card.innerHTML = `<p class="map-card__hint">Point to a province to see the pillars, projects and volunteer organizations there. Click to keep it open.</p>
        <p class="small muted" style="margin:0">${n} ${n === 1 ? "province has" : "provinces have"} programs${filter ? " in " + esc(pillarBy(filter).name) : ""}. Lighter areas have region-wide work.</p>`;
    }

    function show(key) {
      const g = groups[key];
      if (!g) return;
      paths.forEach((p) => { p.classList.toggle("is-hot", p.dataset.key === key); p.classList.toggle("is-pinned", p.dataset.key === pinned); });
      const own = ownFor(g), wide = wideFor(g);
      const pillars = new Set(), projects = new Set(), orgs = new Set();
      own.forEach((r) => { r.pillars.forEach((x) => pillars.add(x)); r.projects.forEach((x) => projects.add(x)); r.orgs.forEach((x) => orgs.add(x)); });
      const rowId = own[0] && own[0].area.id;
      const more = !own.length ? ""
        : onPresencePage ? `<button class="link-arrow map-card__more" type="button" data-jump="${esc(key)}">See it in the table</button>`
        : `<a class="link-arrow map-card__more" href="presence.html#${esc(rowId)}">See it on the Presence page</a>`;
      card.innerHTML = `<h3 class="map-card__name">${esc(g.name)}</h3>${g.region ? `<p class="map-card__region">${esc(g.region)}</p>` : ""}
        ${own.length ? `<dl class="map-card__facts">
            <dt>Pillars</dt><dd>${chips(pillars)}</dd>
            <dt>Projects</dt><dd>${[...projects].map((id) => `<a href="project.html?id=${id}">${esc(projectBy(id).title)}</a>`).join("<br>") || "—"}</dd>
            <dt>Volunteer organizations</dt><dd>${[...orgs].map(esc).join("<br>") || "—"}</dd></dl>${more}`
          : `${wide ? `<p class="small" style="margin:0 0 .35rem">Region-wide work across ${esc(g.region)}:</p>${chips(wide.pillars)}` : ""}
             <p class="map-card__cta-text">No projects or volunteer organizations here yet. Help bring a program to ${esc(g.name)}.</p>
             <a class="btn btn--primary btn--sm" href="involved.html#partner">Partner with us <span aria-hidden="true">→</span></a>`}`;
    }

    const pin = (key) => { pinned = pinned === key ? null : key; pinned ? show(pinned) : intro(); };
    const jump = (key) => {
      const r = groups[key] && ownFor(groups[key])[0];
      const tr = r && document.getElementById(r.area.id);
      if (tr) flashRow(tr);
    };

    host.addEventListener("mouseover", (e) => { const p = e.target.closest("path"); if (p) show(p.dataset.key); });
    host.addEventListener("mouseleave", () => (pinned ? show(pinned) : intro()));
    host.addEventListener("focusin", (e) => { const p = e.target.closest("path"); if (p) show(p.dataset.key); });
    host.addEventListener("click", (e) => { const p = e.target.closest("path"); if (p) pin(p.dataset.key); });
    host.addEventListener("keydown", (e) => {
      const p = e.target.closest("path");
      if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pin(p.dataset.key); }
    });
    card.addEventListener("click", (e) => { const b = e.target.closest("[data-jump]"); if (b) jump(b.dataset.jump); });

    const setAttrs = (el, on, attrs) => Object.entries(attrs).forEach(([k, v]) => (on ? el.setAttribute(k, v) : el.removeAttribute(k)));
    const api = {
      update(f) {
        filter = f;
        pinned = null;
        const seen = new Set();
        paths.forEach((p) => {
          const g = groups[p.dataset.key], state = stateOf(g);
          p.dataset.state = state;
          // Keyboard: one tab stop per shape group that has work (Metro Manila is four paths).
          // Every province still answers to the pointer.
          const focusable = state !== "none" && !seen.has(p.dataset.key);
          seen.add(p.dataset.key);
          setAttrs(p, focusable, { tabindex: "0", role: "button", "aria-label": `${g.name}: show details` });
        });
        intro();
      }
    };
    return api;
  }

  pages.about = () => {
    fill("mission", esc(D.org.mission));
    fill("vision", esc(D.org.vision));
    // Illustration cards: a sky in the value's colour, its symbol drawn in crayon, Filipino first.
    const VALUE_ICON_BOX = { bulb: "0 0 120 120", bayanihan: "0 0 160 120", sun: "0 0 120 120" };
    fill("values", D.org.values.map((v, i) => `<div class="card value-card sky sky--panel sky--${esc(v.sky)}">
      <svg class="doodle doodle--draw value-card__icon" style="--delay:${(0.2 + i * 0.25).toFixed(2)}s" viewBox="${VALUE_ICON_BOX[v.icon]}" aria-hidden="true"><use href="#d-${esc(v.icon)}"/></svg>
      <svg class="doodle doodle--draw doodle--fine value-card__spark c-white" style="--delay:${(0.6 + i * 0.25).toFixed(2)}s" viewBox="0 0 100 100" aria-hidden="true"><use href="#d-sparkle"/></svg>
      <div class="card__body"><h3 class="h3" lang="fil">${esc(v.fil)}</h3><p>${esc(v.en)}</p></div>
    </div>`).join(""));
    fill("trustees", D.team.trustees.map(person).join(""));
    fill("secretariat", D.team.secretariat.map(person).join(""));
    fill("certs", D.certifications.map((c) => `<div class="card">${ph("certificate / logo", "r-4x3")}<div class="body"><h3>${esc(c.name)}</h3><p class="sub">${esc(c.issuer)}</p><p class="small muted" style="margin:0">${esc(c.detail)}${c.placeholder ? PH_TAG : ""}</p></div></div>`).join(""));
  };

const ACCOUNT_PLACEHOLDER = { "BDO": "0000 000 0000", "BPI": "0000-0000-00", "BPI (USD)": "0000 0000 00" };
  /** Account number with a Copy button (digits only go to the clipboard, which bank apps accept). */
  const copyable = (v, placeholder) => `<span class="mono">${esc(v)}</span> <button class="btn small" type="button" data-copy="${esc(v.replace(/\D/g, ""))}">Copy</button>${placeholder ? PH_TAG : ""}`;

  pages.donate = () => {
    const ch = D.donationChannels;
    fill("donate-tabs", ch.map((c, i) => `<button role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.name)}</button>`).join(""));
    fill("donate-panels", ch.map((c, i) => `<div class="panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" ${i ? "hidden" : ""}>
      <h3>${esc(c.name)} <span class="chip">${esc(c.currency)}</span></h3>
      ${!c.qr ? "" : c.qr.src
        ? `<img class="qr" src="${esc(c.qr.src)}" alt="${esc(c.qr.alt)}" width="220" height="220">
          <p class="small"><a href="${esc(c.qr.src)}" download="angat-buhay-${esc(c.id)}-qr.png">Download QR image</a> (${esc(c.qr.size)}). On a phone, save it, then choose “Upload QR” in the ${esc(c.name)} app.</p>`
        : `<img class="qr" src="assets/media/gcash-qr-placeholder.svg" alt="${esc(c.qr.alt)}" width="220" height="220"><p class="small">QR code to follow.${PH_TAG}</p>`}
      ${(c.accounts || []).map(([bank, name, number]) => `<dl class="kv"><dt>Bank</dt><dd>${esc(bank)}</dd><dt>Account name</dt><dd>${esc(name)}</dd><dt>Account number</dt><dd>${number ? copyable(number) : copyable(ACCOUNT_PLACEHOLDER[bank] || "0000 0000 00", true)}</dd>${c.swift ? `<dt>SWIFT</dt><dd>${c.swift}</dd><dt>Bank address</dt><dd>Makati City, Philippines</dd>` : ""}</dl>`).join("")}
      <h4>How to give${c.placeholder ? PH_TAG : ""}</h4>
      <ol class="steps">${c.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
    </div>`).join(""));
    const tabs = $$("#donate-tabs [role=tab]");
    function select(t) {
      tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; });
      t.focus();
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") select(tabs[(i + 1) % tabs.length]);
        if (e.key === "ArrowLeft") select(tabs[(i - 1 + tabs.length) % tabs.length]);
      });
    });
  };

  pages.volunteer = () => {
    fill("volunteer-stats", statsBlock(D.impactStats.filter((s) => s.pillar === "community-engagement")));
    fill("volunteer-pillars", D.pillars.map((p) => `<label style="font-weight:400"><input type="checkbox"> ${esc(p.name)}</label>`).join(""));
    fill("volunteer-region", `<option value="">Select</option>` + D.areas.filter((a) => a.type === "region").map((r) => `<option>${esc(r.name)}</option>`).join("") + `<option>Outside the Philippines</option>`);
    const f = $("#volunteer-form");
    if (f) f.addEventListener("submit", (e) => {
      e.preventDefault();
      const picked = $$("#volunteer-pillars input:checked").length;
      const err = $("#v-pillars-error");
      if (!picked) { err.hidden = false; $("#volunteer-pillars input").focus(); return; }
      err.hidden = true;
      const done = $("#volunteer-done");
      $("#v-done-name").textContent = $("#v-name").value.trim().split(" ")[0];
      $("#v-done-email").textContent = $("#v-email").value.trim();
      f.hidden = true; done.hidden = false; done.focus();
    });
  };

  /* Fundraisers split by date: upcoming (today or later, soonest first) and past (latest first). */
  const isUpcoming = (f) => f.startDate >= NOW.toLocaleDateString("en-CA"); // local YYYY-MM-DD
  const fundraiserCard = (f) => `<article class="card">${img(f.image, f.imageAlt || "", "r-4x3", f.name + " photo")}<div class="body">
      <h3 class="card__title"><a class="stretched" href="fundraiser.html?f=${esc(f.slug)}">${esc(f.name)}</a>${sampleTag(f)}</h3>
      <p class="sub">${esc(f.date)} · ${esc(f.location)}</p>
      ${f.video ? `<p class="small" style="margin:0">With the run film</p>` : ""}
    </div></article>`;

  pages.fundraisers = () => {
    const up = D.fundraisers.filter(isUpcoming).sort((x, y) => x.startDate.localeCompare(y.startDate));
    const past = D.fundraisers.filter((f) => !isUpcoming(f)).sort((x, y) => y.startDate.localeCompare(x.startDate));
    fill("fundraiser-list", up.map(fundraiserCard).join("") || `<p class="muted">New fundraisers will be announced here.</p>`);
    fill("past-fundraiser-list", past.map(fundraiserCard).join(""));
    // Hero: the newest past event with a run film loops in the background; the button opens its page.
    const filmed = past.find((f) => f.video);
    if (filmed) fill("hero", fundraiserHero(filmed));
  };

  function fundraiserHero(f) {
    const v = f.video;
    return `<section class="hero hero--video hero--about film" id="intro" aria-labelledby="fundraisers-title">
      <div class="hero__media"><video data-hero-video poster="${esc(v.poster)}" muted playsinline preload="none" aria-hidden="true" tabindex="-1">${
        v.loop.map((x) => `<source data-src="${esc(x.src)}" type="${esc(x.type)}"${x.media ? ` media="${esc(x.media)}"` : ""}>`).join("")}</video></div>
      <div class="hero__grade" aria-hidden="true"></div><div class="hero__scrim" aria-hidden="true"></div>
      ${doodle("doodle--draw c-yellow hide-tablet", "swoop", "0 0 600 300", "--delay:.6s; top:120px; right:7%; width:min(320px,24vw); height:auto; aspect-ratio:2/1; stroke-width:6")}
      ${doodle("doodle--draw doodle--fine c-white hide-tablet", "sparkle", "0 0 100 100", "--delay:1s; top:calc(120px + 12vw); right:20%; width:30px; height:30px; stroke-width:9")}
      <div class="wrap hero__inner">
        <div class="hero__copy">
          <h1 class="display" id="fundraisers-title">Fundraisers</h1>
          <p class="lede">Runs, events and campaigns that fund our programs. Join one, bring your friends, or sponsor.</p>
          <div class="hero__ctas"><a class="btn btn--white btn--lg" href="fundraiser.html?f=${esc(f.slug)}#video"><span class="play">${PLAY_ICON}</span>Watch the ${esc(f.name)} film</a></div>
        </div>
        <div class="hero__now" style="justify-content:flex-end">
          <button class="video-btn" type="button" data-video-toggle data-state="paused" aria-label="Play background video">
            <svg class="icon-pause" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3.6" height="12" rx="1.2"/><rect x="9.4" y="2" width="3.6" height="12" rx="1.2"/></svg>
            <svg class="icon-play" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M4 2.2v11.6c0 .8.9 1.3 1.6.8l8.6-5.8c.6-.4.6-1.2 0-1.6L5.6 1.4C4.9.9 4 1.4 4 2.2z"/></svg>
          </button></div>
      </div>
      ${TORN_EDGE}
    </section>`;
  }

  pages.fundraiser = () => {
    const f = D.fundraisers.find((x) => x.slug === param("f")) || D.fundraisers[0];
    document.title = f.name + " · Angat Buhay";
    const upcoming = isUpcoming(f);
    fill("fundraiser", `
      <a class="back" href="fundraisers.html#${upcoming ? "events" : "past-events"}">Fundraisers</a>
      <h1>${esc(f.name)}${sampleTag(f)}</h1>
      <dl class="kv"><dt>Date</dt><dd>${esc(f.date)}</dd><dt>Where</dt><dd>${esc(f.location)}</dd></dl>
      ${f.description ? `<p class="lede">${esc(f.description)}</p>` : ""}
      ${f.video ? `<section id="video" aria-labelledby="video-title" style="margin-top:32px">
          <h2 id="video-title">${esc(f.video.title)}</h2>
          <video class="media r-16x9 run-film" controls playsinline preload="none" poster="${esc(f.video.poster)}" src="${esc(f.video.film)}"></video>
        </section>` : ""}
      ${f.image ? `<section id="photos" style="margin-top:32px">${img(f.image, f.imageAlt || "", "r-16x9")}</section>` : ""}
      <section id="take-part" style="margin-top:32px">
        ${upcoming
          ? `<a class="btn btn--primary" href="${esc(f.link || "placeholder.html?what=" + encodeURIComponent(f.name + " registration"))}">Register / buy tickets</a>`
          : `<p class="muted">This event has ended. Thank you to every runner, volunteer and partner who joined. <a href="fundraisers.html#events">See upcoming fundraisers</a>.</p>`}
      </section>`);
  };

  pages.resources = () => {
    fill("resource-list", `<table class="table"><thead><tr><th>Document</th><th>Type</th><th>Year</th><th>File</th></tr></thead><tbody>${
      D.resources.map((r) => `<tr><th scope="row">${esc(r.title)}${sampleTag(r)}</th><td data-label="Type">${esc(r.type)}</td><td data-label="Year">${r.year}</td>
      <td data-label="File"><a href="assets/docs/${esc(r.file)}" download>Download ${esc(r.title)} (${esc(r.format)}, ${esc(r.size)})</a>${PH_TAG}</td></tr>`).join("")}</tbody></table>`);
  };

  pages.sitemap = () => {
    fill("sitemap-pillars", D.pillars.map((p) => `<li><a href="pillar.html?p=${p.slug}">${esc(p.name)}</a></li>`).join(""));
    fill("sitemap-projects", D.projects.map((p) => `<li><a href="project.html?id=${p.id}">${esc(p.title)}</a> <span class="muted small">(${esc(pillarBy(p.pillar).name)})</span></li>`).join(""));
  };

  pages.placeholder = () => {
    const what = param("what");
    if (what) { $("#ph-what").textContent = what; document.title = what + " · Placeholder · Angat Buhay"; }
    $("#ph-back").addEventListener("click", () => (history.length > 1 ? history.back() : (location.href = "index.html")));
  };

  pages.notfound = () => {
    // Links resolve against the <base> the 404 page pins to the site root, so this works at any missing depth.
    const form = $("#search404");
    form.addEventListener("submit", (e) => { e.preventDefault(); location.href = "stories.html?q=" + encodeURIComponent(form.q.value); });
  };

  /* ------------------------------------------------------------------
   * Promo bottom sheet (D.promos). Expanded the first time a promo is
   * seen; once minimised it stays as a bar peeking at the bottom. The
   * choice is remembered per promo in this browser only.
   * ------------------------------------------------------------------ */
  const isoDay = (d) => d.toLocaleDateString("en-CA"); // local YYYY-MM-DD (toISOString would give the UTC day)

  function currentPromo(page) {
    const forced = param("promo");
    if (forced) return D.promos.find((p) => p.id === forced) || null;
    const today = isoDay(NOW);
    return D.promos.find((p) => p.status === "published" && p.start <= today && today <= p.end &&
      (p.pages.includes("all") || p.pages.includes(page))) || null;
  }

  function promoSheet(p) {
    const external = /^https?:/.test(p.link.href) ? ' target="_blank" rel="noopener"' : "";
    const thumb = p.image ? `<img class="promo__thumb" src="${esc(M(p.image))}" alt="" width="40" height="40">` : "";
    const content =
      p.layout === "image" ? `<a class="promo__image-link" href="${esc(p.link.href)}"${external}><img src="${esc(M(p.image))}" alt="${esc(p.imageAlt)}"></a>`
      : p.layout === "html" ? `<div class="promo__html">${p.html}</div>
          <a class="btn btn--primary btn--sm" href="${esc(p.link.href)}"${external}>${esc(p.link.label)} <span aria-hidden="true">→</span></a>`
      : `<div class="promo__media"><img src="${esc(M(p.image))}" alt="${esc(p.imageAlt || "")}"></div>
          <div class="promo__text"><h2 class="promo__title">${esc(p.title)}</h2><p>${esc(p.body)}</p>
          <a class="btn btn--primary btn--sm" href="${esc(p.link.href)}"${external}>${esc(p.link.label)} <span aria-hidden="true">→</span></a></div>`;
    return `<aside class="promo promo--${p.layout}" id="promo" aria-label="${esc(p.title)}" data-promo="${esc(p.id)}">
      <button class="promo__peek" type="button" aria-expanded="true" aria-controls="promo-body">
        ${thumb}<span class="promo__peek-text">${esc(p.peek || p.title)}${sampleTag(p)}</span>
        <svg class="promo__chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1.5 6.5 6 2l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="visually-hidden" data-promo-state>Minimise</span>
      </button>
      <div class="promo__body" id="promo-body">${content}</div>
    </aside>`;
  }

  function wirePromo(page) {
    const p = currentPromo(page);
    if (!p) return;
    document.body.insertAdjacentHTML("beforeend", promoSheet(p));
    document.body.classList.add("has-promo");
    const sheet = $("#promo"), btn = $(".promo__peek", sheet), state = $("[data-promo-state]", sheet);
    const key = "ab-promo-" + p.id;
    const set = (open, remember) => {
      sheet.classList.toggle("is-min", !open);
      btn.setAttribute("aria-expanded", String(open));
      state.textContent = open ? "Minimise" : "Show";
      if (remember) try { localStorage.setItem(key, open ? "open" : "min"); } catch (e) {}
    };
    let saved = null;
    try { saved = localStorage.getItem(key); } catch (e) {}
    set(saved !== "min", false);
    btn.addEventListener("click", () => set(sheet.classList.contains("is-min"), true));
    sheet.addEventListener("keydown", (e) => { if (e.key === "Escape" && !sheet.classList.contains("is-min")) { set(false, true); btn.focus(); } });
  }

  /* ------------------------------------------------------------------
   * Boot
   * ------------------------------------------------------------------ */
  window.ABX = { isListedInFeed, listedStories, pillarBy, projectBy, areaBy, areaLabel, ancestors, fmtDate, fmtMonth, esc, projectIsOngoing, FORMAT_LABEL, NOW };

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (document.body.dataset.surface === "admin") return; // admin.js handles its own chrome
    document.body.insertAdjacentHTML("afterbegin", header(page));
    document.body.insertAdjacentHTML("beforeend", footer());
    wireNav();
    wirePromo(page);
    if (pages[page]) pages[page]();
    // Section links (page.html#section) arrive before app.js has drawn the page, so the
    // browser's own jump can miss. Jump again once rendered. (Presence handles its rows.)
    const target = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target && !target.closest("#presence-table")) {
      // Fonts and images arriving later can push the section down, so jump again when they
      // land, unless the visitor has started scrolling by then.
      let moved = false;
      ["wheel", "touchstart", "keydown"].forEach((e) => addEventListener(e, () => (moved = true), { once: true, passive: true }));
      const jump = () => { if (!moved) target.scrollIntoView(); };
      jump();
      if (document.fonts) document.fonts.ready.then(jump);
      addEventListener("load", jump, { once: true });
    }
    translateStatic();
    designNotes();
    wireHeroVideo();
  });
})();
