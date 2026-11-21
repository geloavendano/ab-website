/* Component sheets (components-vN.html): build the doodle library from whichever ab-doodles-vN.js sprite the
   sheet loaded, so each sheet never drifts from its sprite. Shared by v1–v3; kept out of the HTML for the CSP. */

const colors = ["c-pink", "c-teal", "c-blue", "c-yellow", "c-pink-soft"];
const grid = document.querySelector("[data-doodle-grid]");
Object.entries(window.AB_DOODLES).forEach(([name, [viewBox]], i) => {
  const cell = document.createElement("div");
  cell.className = "doodle-cell";
  cell.tabIndex = 0;
  cell.innerHTML = `<svg class="doodle draw-on-hover ${colors[i % colors.length]}" viewBox="${viewBox}" aria-hidden="true"><use href="#d-${name}"/></svg><code>#d-${name}</code><code>${viewBox}</code>`;
  grid.appendChild(cell);
});
// Show them drawn at rest on this sheet; hover redraws.
const style = document.createElement("style");
style.textContent = `.doodle-cell .draw-on-hover use{stroke-dashoffset:0}
  .doodle-cell:is(:hover,:focus-visible) .draw-on-hover use{animation:redraw .9s cubic-bezier(.2,.8,.2,1)}
  @keyframes redraw{from{stroke-dashoffset:1.05}to{stroke-dashoffset:0}}`;
document.head.appendChild(style);
