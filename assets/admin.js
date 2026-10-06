/* Staff admin prototype — a sketch of what Payload CMS will provide.
 * Nothing saves: it demonstrates collections, statuses, fields and rules.
 */
(function () {
  const D = window.AB;
  const X = window.ABX;
  const { esc, fmtDate, fmtMonth, pillarBy, projectBy, areaLabel } = X;
  const $ = (s, r = document) => r.querySelector(s);
  const param = (k) => new URLSearchParams(location.search).get(k);

  const COLLECTIONS = [
    ["Content", [["stories", "Stories"], ["projects", "Projects"], ["fundraisers", "Fundraisers"], ["resources", "Reports & resources"]]],
    ["Organization", [["pillars", "Advocacy pillars"], ["team", "Team members"], ["impact", "Impact stats"], ["certifications", "Certifications"], ["donation", "Donation channels"], ["orgs", "Volunteer orgs"]]],
    ["System", [["areas", "Areas (PSGC)"], ["redirects", "Redirects"], ["users", "Staff users"]]]
  ];

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
  }

  function side(current) {
    return `<aside class="admin-side">
      <a class="logo" href="index.html"><span class="ph"><span>LOGO</span></span><span>Admin</span></a>
      <nav aria-label="Collections">${COLLECTIONS.map(([g, items]) => `<h4>${g}</h4>` + items.map(([k, l]) =>
        `<a href="index.html?c=${k}"${k === current ? ' aria-current="page"' : ""}>${l}</a>`).join("")).join("")}
        <h4>Site</h4><a href="../index.html">← View public site</a>
      </nav>
      <p class="small muted" style="margin-top:24px">Signed in as <b>Editor</b> (prototype)</p>
    </aside>`;
  }

  const statusPill = (s) => `<span class="status ${s}">${s}</span>`;

  /* ---------------- List view ---------------- */
  function listView() {
    const c = param("c") || "stories";
    const label = COLLECTIONS.flatMap((g) => g[1]).find((x) => x[0] === c)[1];
    let filter = "all";

    const rows = {
      stories: () => D.stories.filter((s) => filter === "all" || s.status === filter).map((s) => `<tr>
        <th scope="row"><a href="edit.html?type=stories&id=${s.slug}">${esc(s.title)}</a></th>
        <td>${statusPill(s.status)}</td>
        <td>${X.FORMAT_LABEL[s.format]}</td>
        <td>${esc(pillarBy(s.pillar)?.name || "—")}</td>
        <td>${esc(projectBy(s.project)?.title || "—")}</td>
        <td>${s.publishedAt ? fmtDate(s.publishedAt) : "—"}</td>
        <td>${X.isListedInFeed(s, X.NOW) ? "Yes" : "<b>No</b>"}</td>
      </tr>`),
      projects: () => D.projects.map((p) => `<tr>
        <th scope="row"><a href="edit.html?type=projects&id=${p.id}">${esc(p.title)}</a></th>
        <td>${statusPill(p.status)}</td>
        <td>${esc(pillarBy(p.pillar).name)}</td>
        <td>${fmtMonth(p.start)} – ${p.end ? fmtMonth(p.end) : "present"}</td>
        <td>${X.projectIsOngoing(p) ? "Ongoing" : "Completed"}</td>
        <td>${D.stories.filter((s) => s.project === p.id).length}</td>
      </tr>`),
      pillars: () => D.pillars.map((p) => `<tr><th scope="row">${esc(p.name)}</th><td>${esc(p.tagline)}</td><td>${D.projects.filter((x) => x.pillar === p.slug).length}</td><td>${D.stories.filter((x) => x.pillar === p.slug).length}</td></tr>`),
      areas: () => D.areas.map((a) => `<tr><th scope="row">${"— ".repeat(X.ancestors(a.id).length - 1)}${esc(a.name)}</th><td>${a.type}</td><td>[PSGC code]</td></tr>`),
      team: () => [...D.team.trustees.map((m) => ({ ...m, group: "Trustee" })), ...D.team.secretariat.map((m) => ({ ...m, group: "Secretariat" }))]
        .map((m) => `<tr><th scope="row"><span style="display:flex;gap:10px;align-items:center"><img src="${esc(D.media.base + m.photo)}" alt="" width="32" height="32" style="border-radius:50%;width:32px;height:32px;object-fit:cover">${esc(m.name)}</span></th><td>${esc(m.role)}</td><td>${m.group}</td><td>${esc(pillarBy(m.pillar)?.name || "—")}</td></tr>`),
      impact: () => D.impactStats.map((s) => `<tr><th scope="row">${esc(s.value)}</th><td>${esc(s.label)}</td><td>${esc(pillarBy(s.pillar).name)}</td><td>${esc(D.impactAsOf)}</td></tr>`),
      certifications: () => D.certifications.map((c) => `<tr><th scope="row">${esc(c.name)}</th><td>${esc(c.issuer)}</td><td>[valid until]</td></tr>`),
      donation: () => D.donationChannels.map((c) => `<tr><th scope="row">${esc(c.name)}</th><td>${c.currency}</td><td>Active</td></tr>`),
      orgs: () => D.volunteerOrgs.map((o) => `<tr><th scope="row">${esc(o.name)}</th><td>${o.areas.map(areaLabel).join("; ")}</td><td>${o.pillars.map((p) => pillarBy(p).name).join(", ")}</td></tr>`),
      fundraisers: () => D.fundraisers.map((f) => `<tr><th scope="row">${esc(f.name)}</th><td>${esc(f.date)}</td><td>${esc(f.location)}</td></tr>`),
      resources: () => D.resources.map((r) => `<tr><th scope="row">${esc(r.title)}</th><td>${r.type}</td><td>${r.year}</td><td>${r.format}, ${r.size}</td></tr>`),
      redirects: () => [["/ab-public-education/", "/advocacies/public-education"], ["/our-stories/", "/stories"], ["/ab-operations/", "/presence"], ["/ab-theteam/", "/about#team"], ["/ab-be-involved/", "/get-involved"]]
        .map(([a, b]) => `<tr><th scope="row"><code>${a}</code></th><td><code>${b}</code></td><td>301</td></tr>`),
      users: () => [["[Comms lead]", "Admin"], ["[Comms officer]", "Editor"], ["[Program staff]", "Contributor"]].map(([n, r]) => `<tr><th scope="row">${n}</th><td>${r}</td><td>[email]</td></tr>`)
    };
    const heads = {
      stories: ["Title", "Status", "Format", "Advocacy", "Project", "Published", "On public site?"],
      projects: ["Title", "Status", "Advocacy", "Implementation", "Progress (derived)", "Stories"],
      pillars: ["Name", "Tagline", "Projects", "Stories"], areas: ["Name", "Type", "Code"],
      team: ["Name", "Role", "Group", "Shown on advocacy"], impact: ["Value", "Label", "Advocacy", "As of"],
      certifications: ["Name", "Issuer", "Valid until"], donation: ["Channel", "Currency", "State"],
      orgs: ["Name", "Areas", "Advocacies"], fundraisers: ["Name", "Date", "Location"],
      resources: ["Title", "Type", "Year", "File"], redirects: ["Old URL", "New URL", "Code"], users: ["Name", "Role", "Email"]
    };
    const notes = {
      stories: "Contributors create drafts; Editors schedule, publish and archive. The 'On public site?' column runs the same visibility rule as the public feed.",
      pillars: "Admins only: editors can change copy but not add or remove pillars.",
      areas: "Seeded from the PSA Philippine Standard Geographic Code. Not editable by editors, which keeps region filters reliable.",
      redirects: "Every legacy WordPress URL maps to its new page, so shared links and search rankings survive the relaunch."
    };

    document.body.innerHTML = `<div class="admin">${side(c)}
      <main class="admin-main" id="main">
        ${c === "stories" ? `<div class="banner" style="font-weight:400;margin-top:0">⚠ The <b>DSWD Public Solicitation Permit</b> expires in <b>[n] days</b>. Update it under Certifications. <span class="sample-tag">SAMPLE</span></div>` : ""}
        <div class="admin-top"><h1>${label}</h1>
          <div style="display:flex;gap:8px"><input type="search" placeholder="Search ${label.toLowerCase()}" style="width:220px" aria-label="Search">
          ${["stories", "projects"].includes(c) ? `<a class="btn solid small" href="edit.html?type=${c}">+ New</a>` : `<button class="btn solid small" id="new">+ New</button>`}</div></div>
        ${c === "stories" ? `<div class="chipbar" role="group" aria-label="Filter by status">${["all", "draft", "scheduled", "published", "archived"].map((s) => `<button type="button" data-f="${s}" aria-pressed="${s === "all"}">${s[0].toUpperCase() + s.slice(1)}</button>`).join("")}</div>` : ""}
        ${notes[c] ? `<p class="small muted">${notes[c]}</p>` : ""}
        <div class="table-wrap"><table class="table"><thead><tr>${heads[c].map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody id="rows"></tbody></table></div>
      </main></div>`;
    document.title = label + " · Admin · Angat Buhay";

    const render = () => { $("#rows").innerHTML = rows[c]().join(""); };
    render();
    document.querySelectorAll(".chipbar button").forEach((b) => b.addEventListener("click", () => {
      filter = b.dataset.f;
      document.querySelectorAll(".chipbar button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    }));
    const n = $("#new"); if (n) n.addEventListener("click", () => toast("Prototype: editor not drawn for this collection"));
  }

  /* ---------------- Edit view ---------------- */
  function editView() {
    const type = param("type") || "stories";
    const isStory = type === "stories";
    const item = isStory ? D.stories.find((s) => s.slug === param("id")) : D.projects.find((p) => p.id === param("id"));
    const v = item || {};
    const title = item ? v.title : `New ${isStory ? "story" : "project"}`;

    const pillarOpts = (sel) => `<option value="">—</option>` + D.pillars.map((p) => `<option value="${p.slug}"${p.slug === sel ? " selected" : ""}>${esc(p.name)}</option>`).join("");
    const areaChips = (ids = []) => ids.map((a) => `<span class="chip">${esc(areaLabel(a))} ✕</span>`).join(" ");
    const toLocal = (iso) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

    const storyFields = `
      <fieldset><legend>Story</legend>
        <div class="field"><label class="req" for="e-title">Title</label><input id="e-title" type="text" value="${esc(v.title)}"></div>
        <div class="field"><label for="e-slug">URL slug</label><input id="e-slug" type="text" value="${esc(v.slug)}"><div class="help">angatbuhay.ph/stories/<b>${esc(v.slug || "…")}</b></div></div>
        <div class="field"><label for="e-sub">Subheading</label><input id="e-sub" type="text" value="${esc(v.subheading)}"></div>
        <div class="field"><label class="req" for="e-format">Format</label>
          <select id="e-format">${Object.entries(X.FORMAT_LABEL).map(([k, l]) => `<option value="${k}"${k === v.format ? " selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="field" data-for="video"><label class="req" for="e-video">Video URL</label><input id="e-video" type="url" placeholder="https://youtube.com/…" value="${esc(v.videoUrl || "")}"><div class="help">Embedded with youtube-nocookie. Captions must be enabled on the video.</div></div>
        <div data-for="infographic">
          <div class="field"><label class="req">Infographic image</label>${'<div class="ph r-16x9" style="max-width:320px"><span>upload</span></div>'}</div>
          <div class="field"><label class="req" for="e-text">Text version</label><textarea id="e-text">${esc(v.textVersion)}</textarea><div class="help">Required so screen-reader and low-bandwidth users get the same information.</div></div>
        </div>
        <div class="field"><label class="req">Hero image</label>${v.image
          ? `<img src="${esc(D.media.base + v.image)}" alt="" style="max-width:320px;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px"><div class="help">Replace · Choose from media library</div>`
          : `<div class="ph r-16x9" style="max-width:320px"><span>upload / choose from media</span></div>`}
          <label for="e-alt" style="margin-top:8px">Alt text</label><input id="e-alt" type="text" placeholder="Describe the image"></div>
        <div class="field"><label for="e-body">Body</label><textarea id="e-body" style="min-height:220px">[Rich text editor: headings, quotes, images, galleries, embeds]</textarea></div>
        <div class="field"><label for="e-author">Author</label><input id="e-author" type="text" value="${esc(v.author)}"></div>
      </fieldset>
      <fieldset><legend>Tags</legend>
        <div class="field"><label for="e-project">Project</label>
          <select id="e-project"><option value="">— none —</option>${D.projects.map((p) => `<option value="${p.id}" data-pillar="${p.pillar}"${p.id === v.project ? " selected" : ""}>${esc(p.title)}</option>`).join("")}</select>
          <div class="help">Choosing a project sets the advocacy automatically.</div></div>
        <div class="field"><label for="e-pillar">Advocacy</label><select id="e-pillar">${pillarOpts(v.pillar)}</select>
          <div class="help" id="pillar-help">Must match the project's advocacy.</div></div>
        <div class="field"><label>Areas</label><div class="chips" style="margin-bottom:8px">${areaChips(v.areas)}</div>
          <input type="search" placeholder="Search region, province, city or municipality" aria-label="Add area"><div class="help">Tag the most specific place. It rolls up to province and region in filters.</div></div>
        <div class="field"><label style="font-weight:400"><input type="checkbox"${v.featured ? " checked" : ""}> Feature on homepage hero</label></div>
      </fieldset>`;

    const projectFields = `
      <fieldset><legend>Project</legend>
        <div class="field"><label class="req" for="e-title">Title</label><input id="e-title" type="text" value="${esc(v.title)}"></div>
        <div class="field"><label class="req" for="e-pillar">Advocacy</label><select id="e-pillar">${pillarOpts(v.pillar)}</select></div>
        <div class="field"><label for="e-sum">Summary</label><textarea id="e-sum">${esc(v.summary)}</textarea></div>
        <div class="field"><label>Cover image</label>${v.image
          ? `<img src="${esc(D.media.base + v.image)}" alt="" style="max-width:320px;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:4px">`
          : `<div class="ph r-16x9" style="max-width:320px"><span>upload</span></div>`}</div>
        <div class="field"><label for="e-body">Description</label><textarea id="e-body">[Rich text]</textarea></div>
      </fieldset>
      <fieldset><legend>Implementation</legend>
        <div class="grid c2" style="gap:0 16px">
          <div class="field"><label class="req" for="e-start">Start date</label><input id="e-start" type="date" value="${esc(v.start)}"></div>
          <div class="field"><label for="e-end">End date</label><input id="e-end" type="date" value="${esc(v.end || "")}"><div class="help">Leave blank if ongoing.</div></div>
        </div>
        <p class="small muted">When the program ran on the ground. This is <b>not</b> the publish date of any story. "Ongoing / Completed" is worked out from these dates.</p>
        <div class="field"><label>Areas</label><div class="chips" style="margin-bottom:8px">${areaChips(v.areas)}</div><input type="search" placeholder="Add area" aria-label="Add area"></div>
      </fieldset>`;

    const status = v.status || "draft";
    document.body.innerHTML = `<div class="admin">${side(type)}
      <main class="admin-main" id="main">
        <a class="back" href="index.html?c=${type}">${isStory ? "Stories" : "Projects"}</a>
        <div class="admin-top"><h1>${esc(title)}</h1>${item && isStory ? `<a class="btn small" href="../story.html?s=${v.slug}" target="_blank">Preview</a>` : ""}</div>
        <div class="editor">
          <form onsubmit="return false">${isStory ? storyFields : projectFields}</form>
          <aside aria-label="Publishing">
            <h3>Publishing</h3>
            <p>Status: ${statusPill(status)}</p>
            ${isStory ? `<div class="field"><label for="e-pub">Publish date</label><input id="e-pub" type="datetime-local" value="${toLocal(v.publishedAt)}">
              <div class="help">Future date = scheduled. Past date allowed for migrated stories.</div></div>` : ""}
            <div style="display:grid;gap:8px">
              <button class="btn" data-act="Saved as draft">Save draft</button>
              <button class="btn solid" data-act="${isStory ? "Published / scheduled" : "Published"}">${status === "published" ? "Update" : isStory ? "Publish or schedule" : "Publish"}</button>
              ${status !== "archived" ? `<button class="btn ghost" data-act="Archived — hidden from public listings">Archive</button>` : `<button class="btn ghost" data-act="Restored">Restore</button>`}
            </div>
            <h4 style="margin-top:20px">Versions</h4>
            <ul class="small muted" style="padding-left:18px;margin:0">
              <li>${fmtDate(v.publishedAt || new Date().toISOString())}: published by [Editor]</li>
              <li>[earlier]: draft saved by [Contributor]</li>
            </ul>
            <p class="small muted" style="margin-top:16px">Prototype: nothing is saved.</p>
          </aside>
        </div>
      </main></div>`;
    document.title = title + " · Admin · Angat Buhay";

    document.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => toast("Prototype: " + b.dataset.act)));

    if (isStory) {
      const fmt = $("#e-format");
      const showFormat = () => document.querySelectorAll("[data-for]").forEach((n) => (n.hidden = n.dataset.for !== fmt.value));
      fmt.addEventListener("change", showFormat); showFormat();

      // Rule: a story's advocacy must equal its project's advocacy.
      const proj = $("#e-project"), pil = $("#e-pillar"), help = $("#pillar-help");
      const check = () => {
        const pp = proj.selectedOptions[0]?.dataset.pillar;
        const bad = pp && pil.value && pp !== pil.value;
        help.innerHTML = bad ? `<b>✕ This project belongs to ${esc(pillarBy(pp).name)}.</b> Saving is blocked until they match.` : "Must match the project's advocacy.";
      };
      proj.addEventListener("change", () => { const pp = proj.selectedOptions[0]?.dataset.pillar; if (pp) pil.value = pp; check(); });
      pil.addEventListener("change", check);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    (document.body.dataset.page === "admin-edit" ? editView : listView)();
  });
})();
