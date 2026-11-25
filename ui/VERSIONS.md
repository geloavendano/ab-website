# UI design track: versions

Fresh visual direction built from the 2025 brand guide. Separate from the earlier
`homepage-v0.x` explorations. Each version is a frozen set of files; the next version
copies them forward with a new suffix, so any version can be reopened side by side.

| File | What it is |
|---|---|
| `homepage-vN.html` | The homepage in that version's design language |
| `components-vN.html` | Component sheet: principles, surfaces, colour, type, buttons, tags, cards, doodle library |
| `ab-ui-vN.css` | Tokens + components (shared by both pages) |
| `ab-doodles-vN.js` | Doodle SVG sprite, crayon filters, scroll draw-in, header and menu behaviour |

Preview locally: `http://localhost:8788/ui/homepage-v1.html` (or `-v2`) (launch config `prototype-ui`).

## v1: "Sky on film" (2026-10-07)

- **Hero moments:** pure-CSS blurred sky (drifting radial gradients) + animated SVG film grain + crayon doodles (SVG paths roughened by a displacement + grit filter, drawn in on scroll). Torn-paper edge into the page.
- **Everywhere else:** warm paper (#FBF7EF), white cards with soft navy shadows, Rubik headings, Figtree body (stand-in for Proxima Nova), Kalam for short handwritten eyebrows.
- **Attention budget:** brand pink is reserved for Donate. Ink text on pink (5.1:1) because white on brand pink is only 3.4:1.
- **Doodles as rewards:** on calm surfaces they only appear on hover (underline under card titles, nav and links) or once per section title.
- **Homepage order follows the wireframe:** featured story (in the hero), advocacies, impact numbers, stories, presence, be involved, footer.

Open questions for review:
- Hero: sky + featured-story card (current) vs. full-bleed video with sky only as a frame.
- Is Kalam enough for the handwritten voice, or should we license Modish for display moments?
- Doodle density in the hero: right amount, or pull back further?

## v2: Video hero (2026-10-07)

Same system as v1; only the hero changes. v1 stays as the "sky" alternative.

- **Full-bleed autoplaying video** (muted, inline) with the doodles layered on top. Stack: footage → brand colour grade (soft-light pink/blue/teal) → scrim under the text → film grain → doodles → copy.
- **Text on white over footage.** The scrim is tuned for the brightest frames (open sky); on tablet and phone it runs bottom-up because the copy spans the full width.
- **"Now playing" strip** takes over from the featured-story card: title, subheading, a link to the full story, and a crayon progress line that tracks the loop.
- **Behaviour:** JS starts the video (no `autoplay` attribute), so reduced-motion and Save-Data visitors get the poster and a play button. Pause button (WCAG 2.2.2). The video pauses when scrolled away and resumes on return.
- **Loop window 0:20–1:18** of the montage: b-roll only. Later sections have burned-in subtitles that clash with the headline.
- **Hero video file:** `ui/media/hero-loop-v2.mp4`, a 58 s cut of that window at 960×540 H.264 with no audio, **9.3 MB** (the full montage is 411 MB). Poster is its first frame. Re-encode with:
  `ffmpeg -ss 20 -i <montage>.mp4 -t 58 -an -vf scale=960:-2 -c:v libx264 -preset slow -crf 28 -profile:v high -pix_fmt yuv420p -movflags +faststart hero-loop-v2.mp4`
  (`data-start` / `data-end` on the `<video>` can still set a loop window inside a longer file.)
- Header turns white over the video, then back to navy once it goes solid.
- **Revision (2026-10-07):** removed the pillar-colour dots from advocacy cards and tags. Pillar colour now shows only in the hover underline.

## v3: Applied site-wide (2026-10-22)

The v2 language now styles every public page of the prototype. The neutral wireframe look is retired (it survives in git history at `6e22915`).

- **Files:** `ab-ui-v3.css` = v2 components + a **site layer** that styles the markup `assets/app.js` renders (cards, chips, tiles, stats, kv lists, numbered steps, tables, tabs, forms, filters, design notes, placeholders). `ab-doodles-v3.js` = v2 behaviour, run after `app.js` renders, plus an enhancer for doodles static shells can't carry. `components-v3.html` documents it.
- **Homepage (`index.html`):** the v2 video homepage, now data-driven: advocacies, impact stats, stories, regions and the next fundraiser come from `data.js`; all links are real.
- **Page heroes:** every section page opens on a sky band with a torn-paper bottom edge (a CSS mask, so no extra markup) and one doodle cluster, picked per page so a page always looks the same.
- **Stories:** the featured story is a video hero using the same 9.3 MB loop; the full video stays on the story page.
- **Header/footer:** rendered by `app.js` in the design language: doodle-underlined nav with dropdowns, pink Donate always visible, EN/FIL pill, white over video heroes; navy footer.
- **Cards:** story, project and advocacy cards use the v2 components, with the pillar-coloured underline on hover.
- **Calm vs loud:** Donate stays the one attention element (header button, and the Donate card on Home, Get involved and each advocacy page).
- **Not changed:** the staff admin (`admin/`) and the archived v0.x homepages still use `assets/style.css`.
- **Revision (2026-10-22):** Donate card gets its warm sky (`.sky--pink`: light bloom behind the copy, light pink under the yellow crown, saturated pink under the white sparkles, yellow and teal accents). Team pages show an initials avatar on a small sky for anyone without a photo.
- **Revision (2026-10-28):** top-fold doodles are written stroke by stroke in `data-seq` order (paths copied out of the sprite and timed by on-screen length). Underlines vary site-wide: 7 line shapes and 4 section-title scribbles, cycled per page. Secondary headlines removed site-wide except the Volunteer step numbers and the "Responsible contact" label; story format moved into the meta row. Desktop "Advocacies" links to the homepage fold; the phone menu keeps the list. Homepage headline flagged PLACEHOLDER. Fundraisers carry an ISO `startDate`.
- **Revision (2026-11-21):**
  - "Advocacy/Advocacies" is now "Pillar/Pillars" in all visible copy and the admin (homepage anchor `#pillars`; the `advocacy.html` filename and code identifiers are unchanged).
  - About opens on the "2026 Omnibus" film (`ui/media/about-omnibus.mp4`, 1600 px H.264 + AAC, 13.9 MB, from the 272 MB master, which stays out of git via `.gitignore`); copy sits at the top to clear the film's burned-in subtitles; "Watch with sound" restarts it unmuted in place.
  - Presence has an interactive province map (desktop): `assets/ph-provinces.js`, built by `ui/tools/build-ph-map.py` from faeldon/philippines-json-maps (MIT, PSGC 3Q 2026), joined to places by PSGC code.
  - Selects draw their own chevron on the text's inset.
  - Home: the logo is circled as the current page instead of "together."; the per-word heading scribbles are gone.
  - New promo bottom sheet driven by `promos` in `data.js` (image + text, image only, or free-form HTML; date window, status, pages); preview any promo with `?promo=<id>`.
  - Heroes and sky panels use `overflow: clip` so they can't be scrolled internally.
- **Revision (2026-11-21, round 2):**
  - Home: the logo circle is yellow and roomier, spilling past the header bar (tighter on phones so it stays on screen).
  - Home: the "Across the islands" panel shows the province map instead of region labels.
  - The Donate card floats on hover, with the crown tipping and the sparkles turning.
  - Map, shared by Home and Presence: every province responds; hover previews and click pins; provinces without programs offer "Partner with us"; region names ship with the map data.
  - Presence: the pillar filter and the table's header row stick together while scrolling.
  - About: "Watch the film" opens a lightbox (native `<dialog>`) with full controls and a speed picker; the background loop pauses meanwhile.
  - Footer: staff login and prototype guide links removed (the guide is still at `sitemap.html`).
  - Fixes: rounded sky panels clip with `clip-path` (iOS Safari ignores border-radius clipping over blurred or animated children); mobile story rows wrap instead of clipping; the promo bar has no sticky hover colour on touch and its focus ring is drawn inside.
- **Revision (2026-11-21, round 3):**
  - Videos re-encoded for phones and in-app browsers. Each background loop comes as AV1 WebM (smallest) and H.264 Main-profile MP4 (plays everywhere, including Facebook/Messenger/Instagram in-app browsers), in a wide cut and a 404×720 portrait centre crop for phones in portrait (`<source media>`), all silent and lightly denoised (the site adds its own grain). The browser takes the first it can play; nothing downloads until the video should play.
    - Homepage/Stories loop: 4.2 MB AV1 / 5.9 MB H.264 wide; 2.2 / 3.3 MB portrait (was 9.3 MB for everyone).
    - About loop: 7.6 MB AV1 (1600 px) / 7.0 MB H.264 (1280 px) wide; 3.1 / 3.8 MB portrait (was 13.9 MB with audio).
    - About film (lightbox, with sound): `about-film-1280.mp4`, 13.3 MB, loads only when opened.
    - Encode settings: H.264 `-profile:v main -level 4.0 -crf 32`, AV1 `libsvtav1 -preset 6 -crf 52`, denoise `hqdn3d=4:3:8:6`, portrait `crop=ih*9/16:ih,scale=404:720`.
  - Note: the homepage loop window (0:20–1:18) does contain title cards and Filipino subtitles from the montage; it was never purely b-roll.
  - Every page section has a stable anchor (e.g. `about.html#mission-vision`, `donate.html#after-you-donate`, `project.html?id=…#participate`); after rendering, app.js jumps to the anchor again once fonts and images have loaded.
  - Every page declares the favicon (fixes a /favicon.ico 404 on each load).
- **Content (2026-11-21):** all 33 stories from angatbuhay.ph imported from its WordPress API (title, date, author, summary, featured photo at medium-large size, in-story photos, full text). Pillar, project and place tags are ours, read from each story (the live site files everything under one category), and flagged `tagsToConfirm`. Kept alongside: the Liloan Instagram reel and three samples for the video and infographic formats, plus the hidden status demos. New places: Pasig, Lupi, Camarines Norte, CALABARZON with Rizal (San Mateo) and Quezon (Polillo), Aklan (Malinao). Story pages render the real text with photos spread through it; placeholders remain only on samples.
- **Revision (2026-11-23):**
  - Pillar photos from Angat Buhay: 1600 px page headers (`ui/media/pillars/{slug}.jpg`) and 800 px homepage cards (`{slug}-card.jpg`); originals stay out of git.
  - Pillar pages moved from `advocacy.html` to `pillar.html`; the old address forwards (query and anchor kept) so shared links still work.
  - Pillar team: Executive Director, Deputy Executive Director for Programs and Operations, then the pillar's Program Manager/Officer and Associate.
  - Projects: no Ongoing/Completed status on cards or pages; dates, places and partners show only when given; project pages render their own description and partners when the CMS has them.
  - New projects: Kusina ng Pag-asa (Climate Action), Angat Sining Musika (Arts and Culture); "Disaster relief 2025" renamed Disaster Relief and Preparedness with a new photo.
  - Home: new hero intro, headings "Our five advocacy pillars" and "Stories of Bayanihan"; the impact section is hidden (`hidden` attribute) for now. The Christmas card promo uses the 2026 card art and Angat Buhay's note.
  - About: new hero intro and founding story.
  - The EN/FIL language switch is hidden for now (`LANG_SWITCH` in `assets/app.js`); every page shows English. The Filipino strings stay in place.
- **Revision (2026-11-24):**
  - About: the film lightbox is titled "This is Angat Buhay"; new Mission and Vision text (the two statements swap places, per Angat Buhay); new founding-story photo (`ui/media/about/founding-story.jpg`, 1600 px; the 3072 px original stays out of git).
  - Core values are illustration cards: Filipino first, English under it, each on its own sky (`.sky--teal`, `.sky--yellow`, `.sky--blue`, the Donate card's recipe; pink stays Donate's) with a crayon symbol drawn in on scroll: a light bulb, bayanihan (people carrying a bahay kubo), the flag's sun with a heart. Symbols live in `ab-doodles-v3.js`.
  - Board: a smaller second line under the role for committees (Edward Lim: Investment Management Committee; Atty. Stella Esquivias: Risk Management Committee).
  - Elizabeth Olivan's photo is re-cut from the original Angat Buhay sent, with its blue-grey backdrop lightened to match the other trustees (`ui/tools/whiten-portrait-bg.py`).
  - Get involved: "Current partners" is hidden (`hidden` on `#current-partners`) until there are logos.
  - Stories: archived per Angat Buhay's marks in the content doc: the eight 2023 stories and "Call for Bids on Classroom Projects!" (a procurement notice). They leave the feed, homepage and pillar pages; 24 of the 33 imported stories stay listed.
- **Revision (2026-11-25):**
  - About: Mission and Vision end with a period.
  - Donate: channels can carry a QR code (`qr` in `donationChannels`). GCash shows Angat Buhay's real QR Ph code (`ui/media/donate/gcash-qr.png`, cropped from their channels graphic and checked to decode) and no longer lists an account number. New channels: GBayanihan (steps only) and PalawanPay (QR placeholder until the code is supplied). Steps say "above", since the QR and account details sit above them. "After you donate" uses Angat Buhay's wording (proof with full name, address and TIN; receipt within 5 working days).
  - Fundraisers: split into Upcoming and Past by date. Past: the 2026 Angat Bayanihan Runs in Makati (19 Jul), Naga (16 Aug) and Iloilo (18 Oct) with their photos; upcoming: General Santos (29 Nov, from the Naga film's "Next stop" card, to confirm) and ALAB. Each fundraiser has its own page (`fundraiser.html?f=<slug>`).
  - Fundraisers hero: a silent 0:02–0:31 loop of the Naga run film (AV1 3.2 MB / H.264 4.1 MB wide; 1.3 / 1.6 MB portrait), skipping its title and outdated "Next stop" cards; "Watch the … film" opens the Naga page, which plays the film with sound cut at 0:31 per Angat Buhay, ending on "The Bayanihan spirit lives on" before the outdated "Next stop" card, with a short audio fade (H.264 + AAC, 1280 px, 9.3 MB, from the 70 MB master).
- **Revision (2026-11-25, round 2):**
  - Donate: real BDO and BPI account numbers (from Angat Buhay's channels graphic; Copy puts digits only on the clipboard); PalawanPay shows the same QR Ph code as GCash. BPI USD stays a placeholder.
  - Stories feed heading: "Stories of Bayanihan".
  - Pillar pages: the impact figures are hidden (as on the homepage); the pillar's stories stay, under "Stories of Bayanihan" (section anchor `#impact` unchanged so existing links work).
- **Revision (2026-11-25, round 3, from the content doc 5.3–5.7):**
  - Project pages: the Implementation / Where / Partners / Taking part bar is removed for now; project cards drop their (sample) dates too. Dates, areas and partners stay in the data (the map still uses areas) for a later round.
  - "How to apply" step 4: "Partnership formalization agreement, then implementation and reporting."
