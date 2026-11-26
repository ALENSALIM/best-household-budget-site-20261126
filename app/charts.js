// charts.js — SVG donut + bar chart builders, pure functions from numbers.
// No libraries, no network: both charts are drawn in code from the figures
// passed in, so they always match the site's own data.

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Donut chart: spending by category. Segments are {label, value, color}.
// Drawn as stroked circles so each slice is a clean arc, with a small gap
// between slices so neighbours stay readable; the centre shows the total.
// Hovering a slice dims the others (see style.css).
export function donutChart(segments, size = 240) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const r = 100;
  const cx = 140;
  const cy = 140;
  const circ = 2 * Math.PI * r;
  const gap = 2.5; // arc-length gap between slices, in svg units
  let offset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const frac = s.value / total;
      const len = Math.max(frac * circ - gap, 1);
      const arc = `<circle class="donut-seg" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="42" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" data-label="${esc(s.label)}"><title>${esc(s.label)} — $${s.value.toFixed(2)} (${(frac * 100).toFixed(1)}%)</title></circle>`;
      offset += frac * circ;
      return arc;
    })
    .join('\n      ');
  return `<svg class="donut" viewBox="0 0 280 280" width="${size}" height="${size}" role="img" aria-label="Spending by category, total $${total.toFixed(2)}">
      ${arcs}
      <text class="donut-centre-top" x="140" y="132" text-anchor="middle">Spent in month</text>
      <text class="donut-centre-sum" x="140" y="160" text-anchor="middle">$${total.toFixed(2)}</text>
    </svg>`;
}

// Bar chart: one bar per day of the month. `days` is an array of 30 numbers
// (spending per day, index 0 = day 1). The biggest day gets its value labelled.
export function barChart(days, size = 600) {
  const max = Math.max(...days, 1);
  const w = 600;
  const h = 190;
  const base = 160;
  const top = 24;
  const gap = 2;
  const bw = (w - 20) / days.length - gap;
  const bars = days
    .map((v, i) => {
      const bh = v > 0 ? Math.max(2, ((v / max) * (base - top)).toFixed(1)) : 0;
      const x = 10 + i * (bw + gap);
      const y = base - bh;
      const biggest = v === max && v > 0;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh}" rx="2" fill="${biggest ? '#d98e2b' : '#1d4d3b'}" class="${biggest ? 'bar biggest' : 'bar'}"><title>Day ${i + 1}: $${v.toFixed(2)}</title></rect>${biggest ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" class="bar-label">$${v.toFixed(0)}</text>` : ''}`;
    })
    .join('\n      ');
  return `<svg class="bars" viewBox="0 0 ${w} ${h}" width="${size}" height="${Math.round((size * h) / w)}" role="img" aria-label="Daily spending across the month">
      <line x1="10" y1="${base}" x2="${w - 10}" y2="${base}" class="axis" />
      ${bars}
      <text x="10" y="${h - 4}" class="tick">1</text>
      <text x="${(10 + 9.5 * (bw + gap)).toFixed(1)}" y="${h - 4}" text-anchor="middle" class="tick">10</text>
      <text x="${(10 + 19.5 * (bw + gap)).toFixed(1)}" y="${h - 4}" text-anchor="middle" class="tick">20</text>
      <text x="${w - 10}" y="${h - 4}" text-anchor="end" class="tick">30</text>
    </svg>`;
}
