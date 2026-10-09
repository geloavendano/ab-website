/* Angat Buhay UI v1: doodle sprite + small page behaviours.
 *
 * Doodles are SVG <symbol>s drawn with stroke="currentColor", so a doodle takes
 * its colour from CSS (`.c-pink`, `.c-yellow`, ...). Every path has pathLength=1,
 * which lets CSS "draw" any doodle with stroke-dasharray/dashoffset no matter
 * how long the real path is.
 *
 * Use:  <svg class="doodle c-pink" viewBox="0 0 300 120"><use href="#d-encircle"/></svg>
 * The viewBox must match the symbol's (listed below and on components-v1.html).
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

  /* Draw doodles in when they scroll into view. Without JS or with reduced
   * motion they are simply shown (see .doodle--draw in the CSS). */
  const drawables = document.querySelectorAll(".doodle--draw");
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

  /* Mobile menu. */
  const menuBtn = document.querySelector("[data-menu-btn]");
  const menu = document.querySelector("[data-menu]");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", () => {
      const open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
      header && header.classList.toggle("is-menu-open", !open);
    });
  }
})();
