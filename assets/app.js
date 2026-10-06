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
  const sampleTag = (o) => (o && o.sample ? ` <span class="sample-tag" title="Illustrative content">SAMPLE</span>` : "");

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
      <p class="small muted" style="margin-top:8px">As of ${esc(D.impactAsOf)} · Source: ${esc(D.impactSource)}</p>`;
  }

  /* ------------------------------------------------------------------
   * Chrome: header, footer, prototype toolbar
   * ------------------------------------------------------------------ */
  const NAV_CURRENT = { stories: "stories.html", story: "stories.html", presence: "presence.html", about: "about.html", donate: "donate.html" };

  function header(page) {
    const cur = NAV_CURRENT[page];
    const a = (href, label, extra = "") => `<a href="${href}"${href === cur ? ' aria-current="page"' : ""} ${extra}>${label}</a>`;
    return `<a class="skip" href="#main">Skip to content</a>
    <header class="site-header"><div class="wrap">
      <a class="logo" href="index.html" aria-label="Angat Buhay home"><span class="ph"><span>LOGO</span></span><span>Angat Buhay</span></a>
      <button class="btn small menu-toggle" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav id="nav" class="nav" aria-label="Main">
        ${a("stories.html", "Stories")}
        <details><summary>Advocacies</summary><div class="menu">
          ${D.pillars.map((p) => `<a href="advocacy.html?p=${p.slug}">${esc(p.name)}</a>`).join("")}
        </div></details>
        ${a("presence.html", "Presence")}
        ${a("about.html", "About")}
        <details><summary>Get involved</summary><div class="menu">
          <a href="involved.html">Ways to help</a>
          <a href="donate.html">Donate</a>
          <a href="volunteer.html">Volunteer</a>
          <a href="fundraisers.html">Fundraisers</a>
          <a href="involved.html#partner">Partner with us</a>
          <a href="resources.html">Reports &amp; resources</a>
        </div></details>
        <a class="btn solid small" href="donate.html">Donate</a>
      </nav>
    </div></header>`;
  }

  function footer() {
    const o = D.org;
    return `<footer class="site-footer"><div class="wrap">
      <div class="cols">
        <div><h4>Angat Buhay</h4><p class="muted">${esc(o.intro)}</p></div>
        <div><h4>Explore</h4><ul>
          <li><a href="stories.html">Stories</a></li>
          ${D.pillars.map((p) => `<li><a href="advocacy.html?p=${p.slug}">${esc(p.name)}</a></li>`).join("")}
          <li><a href="presence.html">Presence</a></li>
        </ul></div>
        <div><h4>Get involved</h4><ul>
          <li><a href="donate.html">Donate</a></li>
          <li><a href="volunteer.html">Volunteer</a></li>
          <li><a href="fundraisers.html">Fundraisers</a></li>
          <li><a href="involved.html#partner">Partner with us</a></li>
          <li><a href="about.html">About us</a></li>
          <li><a href="resources.html">Reports &amp; resources</a></li>
        </ul></div>
        <div><h4>Contact</h4><ul>
          <li><a href="mailto:${o.email}">${o.email}</a></li>
          <li><a href="mailto:${o.partnershipsEmail}">${o.partnershipsEmail}</a></li>
        </ul>
        <div class="socials" style="margin-top:12px">${o.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join("")}</div>
        </div>
      </div>
      <p class="small">${esc(o.accreditation)} Operating with DSWD Solicitation Permit No. ${esc(o.solicitationPermit)}.</p>
      <div class="legal small"><span>© ${NOW.getFullYear()} ${esc(o.legalName)}. All rights reserved.</span>
        <span class="socials"><a href="#">Privacy notice</a><a href="admin/index.html">Staff login</a><a href="sitemap.html">Prototype guide</a></span></div>
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

  /** Hero background video: pause control, and no autoplay for reduced-motion users. */
  function wireHeroVideo() {
    const v = $(".hero video"), b = $(".hero .video-toggle");
    if (!v || !b) return;
    const sync = () => { b.textContent = v.paused ? "▶ Play video" : "❚❚ Pause video"; b.setAttribute("aria-pressed", String(v.paused)); };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) v.pause();
    b.addEventListener("click", () => { v.paused ? v.play() : v.pause(); });
    v.addEventListener("play", sync); v.addEventListener("pause", sync); sync();
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
  }

  /* ------------------------------------------------------------------
   * Page renderers
   * ------------------------------------------------------------------ */
  const pages = {};

  function featuredHero(linkHref, linkLabel, headingTag) {
    const s = listedStories().find((x) => x.featured) || listedStories()[0];
    if (!s) return "";
    const media = s.videoUrl
      ? `<video class="hero-media" src="${esc(s.videoUrl)}" poster="${esc(M(D.media.heroPoster))}" autoplay muted loop playsinline preload="auto" aria-label="${esc(s.title)} (muted background video)"></video>
         <button class="video-toggle" type="button">❚❚ Pause video</button>`
      : s.image ? `<img class="hero-media" src="${esc(M(s.image))}" alt="">` : ph("featured story image / video", "");
    return `<section class="hero" aria-label="Featured story">
      ${media}
      <div class="caption"><div class="wrap">
        <div><span class="eyebrow">Featured story</span><${headingTag}>${esc(s.title)}</${headingTag}><p>${esc(s.subheading)}</p></div>
        <a class="btn solid" href="${linkHref || "story.html?s=" + s.slug}">${linkLabel}</a>
      </div></div>
    </section>`;
  }

  pages.home = () => {
    fill("hero", featuredHero("stories.html", "Watch more", "h1"));
    fill("pillars", D.pillars.map((p) => `<a class="tile" href="advocacy.html?p=${p.slug}"><span>${esc(p.name)}<small>${esc(p.tagline)}</small></span></a>`).join(""));
    fill("latest", listedStories().slice(0, 3).map(storyCard).join(""));
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
          ? `<video class="media r-16x9" src="${esc(s.videoUrl)}" controls playsinline preload="metadata" poster="${esc(M(s.image || D.media.heroPoster))}"></video>`
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
        <p class="small muted">Share: [Facebook] [X] [Copy link]</p>
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
        <dt>Partners</dt><dd>[Partner organizations]</dd>
      </dl>
      <div class="note">Status is derived from the implementation end date, never typed in by hand, so it cannot go stale.</div>
      ${img(pr.image, "", "r-16x9", "project photo / gallery")}
      <div class="article" style="margin:32px 0 0;max-width:720px">
        <h2>About the project</h2>
        <p>[Project description: the problem, the approach, who it serves.]</p>
        <h2>Results</h2>
        <p>[Key outcomes with figures and reporting period.]</p>
      </div>
      <section class="section"><div class="section-head"><h2>Stories from this project</h2></div>
        <div class="grid c3">${stories.map(storyCard).join("") || `<p class="muted">No stories yet.</p>`}</div></section>
      <div class="banner" style="font-weight:400"><b>Want to bring this project to your community?</b> LGUs and partners can <a href="involved.html#partner">get in touch</a>.</div>
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
    fill("certs", D.certifications.map((c) => `<div class="card">${ph("certificate / logo", "r-4x3")}<div class="body"><h3>${esc(c.name)}</h3><p class="sub">${esc(c.issuer)}</p><p class="small muted" style="margin:0">${esc(c.detail)}</p></div></div>`).join(""));
  };

  pages.donate = () => {
    const ch = D.donationChannels;
    fill("donate-tabs", ch.map((c, i) => `<button role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${esc(c.name)}</button>`).join(""));
    fill("donate-panels", ch.map((c, i) => `<div class="panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" ${i ? "hidden" : ""}>
      <h3>${esc(c.name)} <span class="chip">${esc(c.currency)}</span></h3>
      ${c.id === "gcash" ? `<div style="max-width:220px">${ph("GCash QR code", "r-1x1")}</div>
        <p class="small"><a href="#">Download QR image</a>. On a phone, save it and choose “Upload QR” in GCash.</p>
        <dl class="kv"><dt>Account name</dt><dd>Angat Pinas, Inc.</dd><dt>GCash number</dt><dd>[managed in CMS]</dd></dl>` : ""}
      ${(c.accounts || []).map(([bank, name]) => `<dl class="kv"><dt>Bank</dt><dd>${esc(bank)}</dd><dt>Account name</dt><dd>${esc(name)}</dd><dt>Account number</dt><dd>[managed in CMS] <button class="btn small" type="button">Copy</button></dd>${c.swift ? `<dt>SWIFT</dt><dd>${c.swift}</dd><dt>Bank address</dt><dd>Makati City, Philippines</dd>` : ""}</dl>`).join("")}
      <h4>How to give</h4>
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
    if (f) f.addEventListener("submit", (e) => { e.preventDefault(); $("#volunteer-done").hidden = false; f.hidden = true; });
  };

  pages.fundraisers = () => {
    fill("fundraiser-list", D.fundraisers.map((f) => `<article class="card">${ph(f.name + " photo", "r-4x3")}<div class="body">
      <h3>${esc(f.name)}${sampleTag(f)}</h3><p class="sub">${esc(f.date)} · ${esc(f.location)}</p>
      <details class="disclosure" style="margin-top:8px"><summary>Details</summary><div><p>${esc(f.description)}</p><a class="btn small" href="#">Register / buy tickets</a></div></details>
    </div></article>`).join(""));
  };

  pages.resources = () => {
    fill("resource-list", `<table class="table"><thead><tr><th>Document</th><th>Type</th><th>Year</th><th>File</th></tr></thead><tbody>${
      D.resources.map((r) => `<tr><th scope="row">${esc(r.title)}${sampleTag(r)}</th><td data-label="Type">${esc(r.type)}</td><td data-label="Year">${r.year}</td>
      <td data-label="File"><a href="#">Download (${esc(r.format)}, ${esc(r.size)})</a></td></tr>`).join("")}</tbody></table>`);
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
    designNotes();
    wireHeroVideo();
  });
})();
