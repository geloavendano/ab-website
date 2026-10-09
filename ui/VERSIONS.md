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
- **Loop window 0:20–1:18** of the montage (`data-start` / `data-end`): b-roll only. Later sections have burned-in subtitles that clash with the headline.
- **Prototype caveat:** this streams the live site's 411 MB montage from the third-party host it uses today. For production, export a 20–60 s, ≤10 MB H.264 + WebM loop of the same window to Angat Buhay storage.
- Header turns white over the video, then back to navy once it goes solid.
- **Revision (2026-10-07):** removed the pillar-colour dots from advocacy cards and tags. Pillar colour now shows only in the hover underline.
