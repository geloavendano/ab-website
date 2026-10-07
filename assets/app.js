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
  const M = (p) => (!p ? null : /^https?:/.test(p) ? p : D.media.base + p);
  /** Real photo if we have one, otherwise the wireframe placeholder. */
  const img = (path, alt, cls = "r-16x9", fallback = "photo") =>
    path ? `<img class="media ${cls}" src="${esc(M(path))}" alt="${esc(alt)}" loading="lazy" decoding="async">` : ph(fallback, cls);
  /** Muted, paused video showing a single frame: used as a card thumbnail. */
  const videoFrame = (url, cls = "r-16x9") =>
    `<div class="video-thumb ${cls}"><video class="media ${cls}" src="${esc(url)}#t=20" preload="metadata" muted playsinline aria-hidden="true" tabindex="-1"></video></div>`;
  const PH_TAG = ` <span class="sample-tag" title="Placeholder content, to be replaced with Angat Buhay's real copy">PLACEHOLDER</span>`;
  const sampleTag = (o) => (o && o.placeholder ? PH_TAG : o && o.sample ? ` <span class="sample-tag" title="Illustrative content">SAMPLE</span>` : "");

  /* ------------------------------------------------------------------
   * Language (English / Filipino). The Filipino strings are a PLACEHOLDER
   * translation of menus and headings only; final copy needs a reviewed
   * translation. In production each CMS field is localised (en, fil).
   * ------------------------------------------------------------------ */
  const FIL = {
    "Skip to content": "Lumaktaw sa nilalaman", "Stories": "Mga Kuwento", "Advocacies": "Mga Adbokasiya",
    "Presence": "Saan Kami Naroroon", "About": "Tungkol sa Amin", "Get involved": "Makilahok", "Ways to help": "Mga paraan para tumulong",
    "Donate": "Mag-donate", "Volunteer": "Mag-volunteer", "Fundraisers": "Mga Fundraiser", "Partner with us": "Makipag-partner sa amin",
    "Reports & resources": "Mga ulat at resources", "Explore": "Tuklasin", "Contact": "Makipag-ugnayan", "About us": "Tungkol sa amin",
    "Privacy notice": "Abiso sa privacy", "Staff login": "Login ng staff", "Prototype guide": "Gabay sa prototype",
    "Featured story": "Tampok na kuwento", "Watch more": "Manood pa", "About Angat Buhay": "Tungkol sa Angat Buhay",
    "See where we work": "Tingnan kung saan kami naroroon", "Stories of impact": "Mga kuwento ng pagbabago", "All stories": "Lahat ng kuwento",
    "Be involved": "Makilahok", "More impact": "Higit pang pagbabago", "Advocacy": "Adbokasiya", "Region": "Rehiyon",
    "Sort by": "Ayusin ayon sa", "Search": "Maghanap", "Clear": "I-clear", "Load more": "Magpakita pa", "Projects": "Mga Proyekto",
    "Impact": "Epekto", "The team": "Ang aming team", "Meet the rest of the team": "Kilalanin ang buong team",
    "Support this advocacy": "Suportahan ang adbokasiyang ito", "Other advocacies": "Iba pang adbokasiya", "See other stories": "Iba pang kuwento",
    "Mission": "Misyon", "Vision": "Bisyon", "Core values": "Mga pangunahing pagpapahalaga", "Certifications": "Mga sertipikasyon",
    "Where we work": "Saan kami naroroon", "Regions and provinces": "Mga rehiyon at probinsya", "Choose how to give": "Piliin kung paano magbigay",
    "How to give": "Paano magbigay", "After you donate": "Pagkatapos mong mag-donate", "Other ways to give": "Iba pang paraan ng pagbibigay",
    "How it works": "Paano ito gumagana", "Sign up": "Mag-sign up", "Send": "Ipadala", "Share the bayanihan spirit": "Ibahagi ang diwa ng bayanihan",
    "Bring this project to your community": "Dalhin ang proyektong ito sa inyong komunidad", "Stories from this project": "Mga kuwento mula sa proyektong ito",
    "We empower Filipinos to become communities of active citizens by mobilizing the largest volunteer network in implementing Bayanihan programs.":
      "Tinutulungan namin ang mga Pilipino na maging mga komunidad ng aktibong mamamayan sa pamamagitan ng pagpapakilos sa pinakamalaking volunteer network sa pagpapatupad ng mga programang Bayanihan."
  };
  let LANG = param("lang") === "fil" ? "fil" : param("lang") === "en" ? "en" : null;
  try { LANG = LANG || localStorage.getItem("ab-lang") || "en"; if (LANG) localStorage.setItem("ab-lang", LANG); } catch (e) { LANG = LANG || "en"; }
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

  function storyCard(s) {
    const p = pillarBy(s.pillar);
    const media = s.format === "video"
      ? (s.videoUrl ? videoFrame(s.videoUrl) : s.image ? `<div class="video-thumb r-16x9">${img(s.image, "")}</div>`
        : ph(s.embedUrl ? "Instagram reel" : "video thumbnail", "r-16x9 play"))
      : s.format === "infographic" ? img(s.image, "", "r-16x9", "infographic preview") : img(s.image, "");
    return `<article class="card">
      <span class="chip fmt">${FORMAT_LABEL[s.format]}</span>
      ${media}
      <div class="body">
        <h3><a class="stretched" href="story.html?s=${esc(s.slug)}">${esc(s.title)}</a>${sampleTag(s)}</h3>
        <p class="sub">${esc(s.subheading)}</p>
        <div class="meta">${p ? esc(p.name) + " · " : ""}${esc(s.areas.map(areaLabel).slice(0, 2).join("; "))} · ${fmtDate(s.publishedAt)}</div>
      </div>
    </article>`;
  }

  function projectCard(p) {
    return `<article class="card">
      ${img(p.image, "", "r-4x3", "project photo")}
      <div class="body">
        <h3><a class="stretched" href="project.html?id=${esc(p.id)}">${esc(p.title)}</a></h3>
        <p class="sub">${esc(p.summary)}</p>
        <div class="meta">${projectIsOngoing(p) ? "Ongoing" : "Completed"} · ${fmtMonth(p.start)} – ${p.end ? fmtMonth(p.end) : "present"}</div>
      </div>
    </article>`;
  }

  const person = (m) => `<div class="person">${img(m.photo, "", "round")}<b>${esc(m.name)}</b><span>${esc(m.role)}</span></div>`;

  function statsBlock(stats) {
    if (!stats.length) return "";
    return `<div class="stats">${stats.map((s) => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}</div>
      <p class="small muted" style="margin-top:8px">As of ${esc(D.impactAsOf)} · Source: <a href="resources.html">${esc(D.impactSource)}</a>${D.impactAsOfPlaceholder ? PH_TAG : ""}</p>`;
  }

  /* ------------------------------------------------------------------
   * Chrome: header, footer, prototype toolbar
   * ------------------------------------------------------------------ */
  const NAV_CURRENT = { stories: "stories.html", story: "stories.html", presence: "presence.html", about: "about.html", donate: "donate.html" };

  function header(page) {
    const cur = NAV_CURRENT[page];
    const a = (href, label, extra = "") => `<a href="${href}"${href === cur ? ' aria-current="page"' : ""} ${extra}>${esc(t(label))}</a>`;
    const langBtn = (code, label, name) => `<button type="button" data-lang="${code}" aria-pressed="${LANG === code}" lang="${code}" aria-label="${name}">${label}</button>`;
    return `<a class="skip" href="#main">${t("Skip to content")}</a>
    <header class="site-header"><div class="wrap">
      <a class="logo" href="index.html" aria-label="Angat Buhay home"><img class="brand-logo" src="assets/media/angat-buhay-logo.png" alt="Angat Buhay"></a>
      <div class="header-tools">
        <div class="lang-switch" role="group" aria-label="Language / Wika">${langBtn("en", "EN", "English")}${langBtn("fil", "FIL", "Filipino")}</div>
        <button class="btn small menu-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
      </div>
      <nav id="nav" class="nav" aria-label="Main">
        ${a("stories.html", "Stories")}
        <details><summary>${t("Advocacies")}</summary><div class="menu">
          ${D.pillars.map((p) => `<a href="advocacy.html?p=${p.slug}">${esc(p.name)}</a>`).join("")}
        </div></details>
        ${a("presence.html", "Presence")}
        ${a("about.html", "About")}
        <details class="menu-end"><summary>${t("Get involved")}</summary><div class="menu">
          ${a("involved.html", "Ways to help")}
          ${a("donate.html", "Donate")}
          ${a("volunteer.html", "Volunteer")}
          ${a("fundraisers.html", "Fundraisers")}
          ${a("involved.html#partner", "Partner with us")}
          ${a("resources.html", "Reports & resources")}
        </div></details>
        <a class="btn solid small" href="donate.html">${t("Donate")}</a>
      </nav>
    </div></header>
    ${LANG === "fil" ? `<div class="lang-banner small"><div class="wrap">Filipino${PH_TAG} Menus and headings only. The final Filipino copy will be translated and reviewed by Angat Buhay. <button type="button" class="btn small" data-lang="en">Switch to English</button></div></div>` : ""}`;
  }

  function footer() {
    const o = D.org;
    return `<footer class="site-footer"><div class="wrap">
      <div class="cols">
        <div><h4>Angat Buhay</h4><p class="muted">${esc(o.intro)}</p></div>
        <div><h4>${t("Explore")}</h4><ul>
          <li><a href="stories.html">${t("Stories")}</a></li>
          ${D.pillars.map((p) => `<li><a href="advocacy.html?p=${p.slug}">${esc(p.name)}</a></li>`).join("")}
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
        <div class="socials" style="margin-top:12px">${o.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join("")}</div>
        </div>
      </div>
      <p class="small">${esc(o.accreditation)} Operating with DSWD Solicitation Permit No. ${esc(o.solicitationPermit)}.</p>
      <div class="legal small"><span>© ${NOW.getFullYear()} ${esc(o.legalName)}. All rights reserved.</span>
        <span class="socials"><a href="privacy.html">${t("Privacy notice")}</a><a href="admin/index.html">${t("Staff login")}</a><a href="sitemap.html">${t("Prototype guide")}</a></span></div>
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

  function featuredHero(linkHref, linkLabel, headingTag) {
    const s = listedStories().find((x) => x.featured) || listedStories()[0];
    if (!s) return "";
    const media = s.videoUrl
      ? `<video class="hero-media" data-src="${esc(s.videoUrl)}" poster="${esc(M(s.image || D.media.heroPoster))}" muted playsinline preload="none" aria-label="${esc(s.title)} (muted background video)"></video>
         <button class="video-toggle" type="button">▶ Play video</button>`
      : s.image ? `<img class="hero-media" src="${esc(M(s.image))}" alt="">` : ph("featured story image / video", "");
    return `<section class="hero" aria-label="Featured story">
      ${media}
      <div class="caption"><div class="wrap">
        <div><span class="eyebrow">Featured story</span><${headingTag}>${esc(s.title)}</${headingTag}><p>${esc(s.subheading)}</p></div>
        <a class="btn solid" href="${linkHref || "story.html?s=" + s.slug}">${linkLabel}</a>
      </div></div>
    </section>`;
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
    return `<a class="pillar-card pillar-card-${index + 1}" href="advocacy.html?p=${esc(p.slug)}" style="--pillar-image:url('${esc(M(p.image))}')">
      <span class="pillar-number">0${index + 1}</span>
      <span class="pillar-card-copy"><strong>${esc(p.name)}</strong><small>${esc(p.tagline)}</small><b>Explore advocacy</b></span>
    </a>`;
  }

  pages.home = () => {
    fill("hero", homeHero());
    fill("pillars", D.pillars.map(homePillarCard).join(""));
    fill("latest", listedStories().filter((s) => s.image).slice(0, 3).map(storyCard).join(""));
  };

  pages.stories = () => {
    fill("hero", featuredHero(null, "Watch more", "h2"));
    const PAGE = 6;
    const st = {
      pillar: param("pillar") || "", region: param("region") || "",
      format: param("format") || "", sort: param("sort") || "newest", q: param("q") || "", shown: PAGE
    };

    // Filter controls
    $("#f-pillar").innerHTML = `<option value="">All advocacies</option>` + D.pillars.map((p) => `<option value="${p.slug}">${esc(p.name)}</option>`).join("");
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
    const body = s.body
      ? s.body.map((para) => `<p>${esc(para)}</p>`).join("")
      : `<p>[Story body, migrated from angatbuhay.ph. Rich text: paragraphs, sub-headings, pull quotes, photo galleries.]</p><p>[Paragraph]</p>`;

    const related = listedStories().filter((x) => x.slug !== s.slug && x.pillar === s.pillar).slice(0, 3);

    fill("story", `
      <a class="back" href="stories.html">All stories</a>
      ${isListedInFeed(s, NOW) ? "" : `<div class="banner">Status: ${esc(s.status)}. This story is hidden from public listings. In production, a direct link would follow the archived/draft URL rule.</div>`}
      <div class="article">
        <span class="eyebrow">${FORMAT_LABEL[s.format]}${p ? " · " + esc(p.name) : ""}</span>
        <h1>${esc(s.title)}${sampleTag(s)}</h1>
        <p class="lede">${esc(s.subheading)}</p>
      </div>
      <div style="max-width:960px;margin:24px auto">${media}</div>
      <div class="article">
        <div class="meta-row">
          <span>Published <b>${fmtDate(s.publishedAt)}</b></span>
          <span>By <b>${esc(s.author)}</b></span>
          ${p ? `<span>Advocacy <a href="advocacy.html?p=${p.slug}"><b>${esc(p.name)}</b></a></span>` : ""}
          ${pr ? `<span>Project <a href="project.html?id=${pr.id}"><b>${esc(pr.title)}</b></a></span>` : ""}
          <span>Where <b>${esc(s.areas.map(areaLabel).join("; "))}</b></span>
        </div>
        <div class="note">"Published" is when the story went live. The project's implementation period is shown on the project page. The two dates are kept separate in the CMS.</div>
        ${body}
        <figure>${img(g[0], "", "r-16x9", "In-story photo")}<figcaption>[Caption — required alt text in CMS]</figcaption></figure>
        <blockquote style="margin:24px 0;padding-left:16px;border-left:3px solid var(--ink);font-size:20px;font-weight:600">“[Pull quote from a community member]”<div class="small muted" style="font-weight:400">— [Name, role]</div></blockquote>
        ${g[1] ? `<figure>${img(g[1], "")}<figcaption>[Caption]</figcaption></figure>` : "<p>[Paragraph]</p>"}
        <div class="chips" style="margin:24px 0">${s.areas.map((a) => `<a class="chip" href="stories.html?region=${a}">${esc(areaLabel(a))}</a>`).join("")}</div>
        <div class="banner" style="font-weight:400"><b>Support this work.</b> <a href="donate.html">Donate</a> · <a href="volunteer.html">Volunteer</a>${p ? ` · <a href="advocacy.html?p=${p.slug}">More on ${esc(p.name)}</a>` : ""}</div>
        <p class="small muted">Share:
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" target="_blank" rel="noopener">Facebook</a> ·
          <a href="https://x.com/intent/post?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(s.title)}" target="_blank" rel="noopener">X</a> ·
          <button type="button" class="btn ghost small copy-link" style="padding:0">Copy link</button></p>
      </div>
      ${related.length ? `<section class="section"><div class="section-head"><h2>More from ${esc(p ? p.name : "Angat Buhay")}</h2><a class="link-arrow" href="stories.html${p ? "?pillar=" + p.slug : ""}">See all</a></div>
        <div class="grid c3">${related.map(storyCard).join("")}</div></section>` : ""}
    `);
  };

  pages.advocacy = () => {
    const p = pillarBy(param("p")) || D.pillars[0];
    document.title = p.name + " · Angat Buhay";
    fill("pillar-hero", `<span class="eyebrow">Advocacy</span><h1>${esc(p.name)}</h1><p class="lede">${esc(p.description)}</p>${img(p.image, "", "r-16x9 wide", "pillar hero photo / short video loop")}`);
    fill("pillar-stats", statsBlock(D.impactStats.filter((s) => s.pillar === p.slug)));
    const projs = D.projects.filter((x) => x.pillar === p.slug && x.status === "published");
    fill("pillar-projects", projs.map(projectCard).join("") || `<p class="muted">No projects yet.</p>`);
    const stories = listedStories().filter((s) => s.pillar === p.slug);
    fill("pillar-stories", stories.slice(0, 3).map(storyCard).join("") || `<p class="muted">No stories yet.</p>`);
    $("#see-other").href = "stories.html?pillar=" + p.slug;
    $("#see-other").textContent = `See all ${stories.length} ${p.name} stories`;
    const leads = D.team.secretariat.filter((m) => m.pillar === p.slug);
    const team = [...leads, ...D.team.secretariat.filter((m) => !m.pillar)].slice(0, 4);
    fill("pillar-team", team.map(person).join(""));
    fill("pillar-others", D.pillars.filter((x) => x.slug !== p.slug).map((x) => `<a class="tile" href="advocacy.html?p=${x.slug}">${esc(x.name)}</a>`).join(""));
  };

  /** Community / LGU journey: can we take part, what's needed, who do we talk to. */
  function participateSection(pr, p) {
    const part = pr.participation;
    if (!part) return "";
    const STATUS = { open: "Accepting", waitlist: "Waitlist / upcoming call", closed: "Not accepting now" };
    const lead = D.team.secretariat.find((m) => m.pillar === p.slug) || D.team.secretariat.find((m) => /Partnerships/.test(m.role));
    const subject = `Partnership inquiry: ${pr.title}`;
    const body = `Project: ${pr.title}\nOrganization / LGU:\nProvince and city/municipality:\nContact person, role and mobile number:\nWhat you would like to achieve:\nPreferred start (month/year):\n`;
    const mail = `mailto:${D.org.partnershipsEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return `<section class="section" id="participate">
      <span class="eyebrow">For LGUs, schools and community groups</span>
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
          <li>Memorandum of agreement, then implementation and reporting.</li></ol></div>
      </div>
      <div class="card contact-card">
        ${lead ? `<div style="width:64px;flex:none">${img(lead.photo, "", "round")}</div>` : ""}
        <div><span class="eyebrow">Responsible contact</span>
          <b>${lead ? esc(lead.name) : "Partnerships team"}</b><div class="small muted">${lead ? esc(lead.role) : ""} · <a href="mailto:${D.org.partnershipsEmail}">${D.org.partnershipsEmail}</a></div></div>
        <a class="btn solid" href="${mail}">${part.status === "closed" ? "Ask about similar programs" : "Inquire about this project"}</a>
      </div>
      <div class="note">Availability, eligibility and contact are CMS fields on each project, so LGUs can see whether they can join before writing in. The contact is the advocacy's program lead from the Team collection; the assignment is a placeholder.</div>
    </section>`;
  }

  pages.project = () => {
    const pr = projectBy(param("id")) || D.projects[0];
    const p = pillarBy(pr.pillar);
    document.title = pr.title + " · Angat Buhay";
    const stories = listedStories().filter((s) => s.project === pr.id);
    fill("project", `
      <a class="back" href="advocacy.html?p=${p.slug}">${esc(p.name)}</a>
      <span class="eyebrow">Project · ${esc(p.name)}</span>
      <h1>${esc(pr.title)}</h1>
      <p class="lede">${esc(pr.summary)}</p>
      <dl class="kv">
        <dt>Status</dt><dd>${projectIsOngoing(pr) ? "Ongoing" : "Completed"}</dd>
        <dt>Implementation</dt><dd>${fmtMonth(pr.start)} – ${pr.end ? fmtMonth(pr.end) : "present"} <span class="sample-tag">SAMPLE DATES</span></dd>
        <dt>Where</dt><dd>${pr.areas.map((a) => `<a href="stories.html?region=${a}">${esc(areaLabel(a))}</a>`).join("; ")}</dd>
        <dt>Partners</dt><dd>Partner LGUs, schools and local organizations${PH_TAG}</dd>
        ${pr.participation ? `<dt>Taking part</dt><dd><a href="#participate">${esc(pr.participation.label)}</a></dd>` : ""}
      </dl>
      <div class="note">Status is derived from the implementation end date, never typed in by hand, so it cannot go stale.</div>
      ${img(pr.image, "", "r-16x9", "project photo / gallery")}
      <div class="article" style="margin:32px 0 0;max-width:720px">
        <h2>About the project</h2>
        <p>This section explains the need the project responds to, how Angat Buhay and its partners deliver it, and who benefits. It will be written with the program team.${PH_TAG}</p>
        <h2>Results</h2>
        <p>Key outcomes with figures, each with its reporting period and source.${PH_TAG}</p>
      </div>
      ${participateSection(pr, p)}
      <section class="section"><div class="section-head"><h2>Stories from this project</h2></div>
        <div class="grid c3">${stories.map(storyCard).join("") || `<p class="muted">No stories yet.</p>`}</div></section>
    `);
  };

  pages.presence = () => {
    // Bucket every tagged area to a "row": its province; NCR cities directly; else region-wide.
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

    const sel = $("#presence-pillar");
    sel.innerHTML = `<option value="">All advocacies</option>` + D.pillars.map((p) => `<option value="${p.slug}">${esc(p.name)}</option>`).join("");

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
          <td data-label="Advocacies"><div class="chips">${[...r.pillars].map((p) => `<a class="chip" href="advocacy.html?p=${p}">${esc(pillarBy(p).name)}</a>`).join("")}</div></td>
          <td data-label="Projects">${[...r.projects].map((id) => `<a href="project.html?id=${id}">${esc(projectBy(id).title)}</a>`).join("<br>") || "—"}</td>
          <td data-label="Volunteer organizations">${[...r.orgs].map(esc).join("<br>") || "—"}</td>
        </tr>`).join("");
      }).join("");
      $("#presence-table tbody").innerHTML = body || `<tr><td colspan="4">No areas for this advocacy yet.</td></tr>`;
      $("#presence-count").textContent = `${provinces} provinces and cities listed`;
    }
    sel.addEventListener("change", render);
    render();
  };

  pages.about = () => {
    fill("mission", esc(D.org.mission));
    fill("vision", esc(D.org.vision));
    fill("values", D.org.values.map((v) => `<div class="card"><div class="body"><h3>${esc(v.en)}</h3><p class="sub"><i>${esc(v.fil)}</i></p></div></div>`).join(""));
    fill("trustees", D.team.trustees.map(person).join(""));
    fill("secretariat", D.team.secretariat.map(person).join(""));
    fill("certs", D.certifications.map((c) => `<div class="card">${ph("certificate / logo", "r-4x3")}<div class="body"><h3>${esc(c.name)}</h3><p class="sub">${esc(c.issuer)}</p><p class="small muted" style="margin:0">${esc(c.detail)}${c.placeholder ? PH_TAG : ""}</p></div></div>`).join(""));
  };

const ACCOUNT_PLACEHOLDER = { "BDO": "0000 000 0000", "BPI": "0000-0000-00", "BPI (USD)": "0000 0000 00" };
  const copyable = (v) => `<span class="mono">${esc(v)}</span> <button class="btn small" type="button" data-copy="${esc(v)}">Copy</button>${PH_TAG}`;

  pages.donate = () => {
    const ch = D.donationChannels;
    fill("donate-tabs", ch.map((c, i) => `<button role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.name)}</button>`).join(""));
    fill("donate-panels", ch.map((c, i) => `<div class="panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" ${i ? "hidden" : ""}>
      <h3>${esc(c.name)} <span class="chip">${esc(c.currency)}</span></h3>
      ${c.id === "gcash" ? `<img src="assets/media/gcash-qr-placeholder.svg" alt="GCash QR code (placeholder)" width="220" height="220" style="border:1px solid var(--line)">
        <p class="small"><a href="assets/media/gcash-qr-placeholder.svg" download="angat-buhay-gcash-qr.svg">Download QR image</a> (SVG, 1 KB). On a phone, save it, then choose “Upload QR” in GCash. Or send to the number below.${PH_TAG}</p>
        <dl class="kv"><dt>Account name</dt><dd>Angat Pinas, Inc.</dd><dt>GCash number</dt><dd>${copyable("0917 000 0000")}</dd></dl>` : ""}
      ${(c.accounts || []).map(([bank, name]) => `<dl class="kv"><dt>Bank</dt><dd>${esc(bank)}</dd><dt>Account name</dt><dd>${esc(name)}</dd><dt>Account number</dt><dd>${copyable(ACCOUNT_PLACEHOLDER[bank] || "0000 0000 00")}</dd>${c.swift ? `<dt>SWIFT</dt><dd>${c.swift}</dd><dt>Bank address</dt><dd>Makati City, Philippines</dd>` : ""}</dl>`).join("")}
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

  pages.fundraisers = () => {
    fill("fundraiser-list", D.fundraisers.map((f) => `<article class="card">${img(f.image, "", "r-4x3", f.name + " photo")}<div class="body">
      <h3>${esc(f.name)}${sampleTag(f)}</h3><p class="sub">${esc(f.date)} · ${esc(f.location)}</p>
      <details class="disclosure" style="margin-top:8px"><summary>Details</summary><div><p>${esc(f.description)}</p><a class="btn small" href="placeholder.html?what=${encodeURIComponent(f.name + " registration")}">Register / buy tickets</a></div></details>
    </div></article>`).join(""));
  };

  pages.resources = () => {
    fill("resource-list", `<table class="table"><thead><tr><th>Document</th><th>Type</th><th>Year</th><th>File</th></tr></thead><tbody>${
      D.resources.map((r) => `<tr><th scope="row">${esc(r.title)}${sampleTag(r)}</th><td data-label="Type">${esc(r.type)}</td><td data-label="Year">${r.year}</td>
      <td data-label="File"><a href="assets/docs/${esc(r.file)}" download>Download ${esc(r.title)} (${esc(r.format)}, ${esc(r.size)})</a>${PH_TAG}</td></tr>`).join("")}</tbody></table>`);
  };

  pages.sitemap = () => {
    fill("sitemap-pillars", D.pillars.map((p) => `<li><a href="advocacy.html?p=${p.slug}">${esc(p.name)}</a></li>`).join(""));
    fill("sitemap-projects", D.projects.map((p) => `<li><a href="project.html?id=${p.id}">${esc(p.title)}</a> <span class="muted small">(${esc(pillarBy(p.pillar).name)})</span></li>`).join(""));
  };

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
    if (pages[page]) pages[page]();
    translateStatic();
    designNotes();
    wireHeroVideo();
  });
})();
