# Angat Buhay website redesign: prototype

Clickable prototype of the redesigned Angat Buhay website (public site + staff admin). The public
pages carry the visual design (UI v3, from the 2025 brand guide); the staff admin is still a plain
structural mock-up.

**Preview:** https://geloavendano.github.io/ab-website/
Start at the [Prototype guide](https://geloavendano.github.io/ab-website/sitemap.html) for how to review it.

- Plain HTML/CSS/JS. No build step. Open `index.html` locally or serve the folder.
- All content lives in `assets/data.js`, shaped like the planned CMS collections. `assets/app.js` renders
  every public page from it.
- Design: `ui/ab-ui-v3.css` (tokens, components and the site layer) and `ui/ab-doodles-v3.js` (doodle
  sprite, crayon filters, hero video). Versions and the component sheet are in `ui/` (see `ui/VERSIONS.md`).
- `assets/style.css` now only styles the staff admin and the archived v0.x homepage explorations.
- Copy and photos come from angatbuhay.ph (photos are linked, not copied). Items marked SAMPLE or in
  [brackets] are illustrative or still to be supplied.
- Pages carry `noindex` so search engines don't list this preview alongside the real site.
