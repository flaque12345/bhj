const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs');
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const PAL = {
  azur:   ['#f2fdff', '#a8f2ff', '#4fd4f7', '#1c8fd8', '#0a3f7a'],
  violet: ['#fbf2ff', '#e1b5ff', '#b06bff', '#7232d6', '#35136e'],
  rose:   ['#fff2f8', '#ffb3d9', '#ff5fae', '#d1237a', '#6b0a3a'],
  emeraude:['#f0fff6', '#a6f5c8', '#3fd98a', '#16985a', '#06452a'],
  or:     ['#fffbe8', '#ffe79a', '#ffc93a', '#e08a12', '#7a3d05'],
};
let uid = 0;
const id = p => `${p}${uid++}`;

function gem(cx, cy, s, pal, rot = 0) {
  const P = PAL[pal];
  const pts = {A:[-30,-35],B:[30,-35],C:[-50,-12],D:[50,-12],E:[0,55],M1:[-18,-12],M2:[18,-12]};
  const poly = (names, fill) => `<polygon points="${names.map(n => pts[n].join(',')).join(' ')}" fill="${fill}"/>`;
  return `<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${s / 100})">
    ${poly(['A','C','M1'], P[1])}
    ${poly(['A','B','M2','M1'], P[0])}
    ${poly(['B','D','M2'], P[2])}
    ${poly(['C','M1','E'], P[2])}
    ${poly(['M1','M2','E'], P[1])}
    ${poly(['M2','D','E'], P[3])}
    <polygon points="-30,-35 30,-35 50,-12 0,55 -50,-12" fill="none" stroke="${P[4]}" stroke-width="4" stroke-linejoin="round"/>
    <polyline points="-50,-12 50,-12" stroke="${P[4]}" stroke-width="2" opacity=".55"/>
    <polyline points="-30,-35 -18,-12 0,55 18,-12 30,-35" fill="none" stroke="${P[4]}" stroke-width="1.6" opacity=".4"/>
    <polygon points="-22,-31 -6,-31 -12,-18 -26,-18" fill="#fff" opacity=".85"/>
  </g>`;
}

function sparkle(cx, cy, r, color = '#fff', op = 1) {
  const k = r * 0.22;
  return `<path transform="translate(${cx} ${cy})" d="M0,${-r} Q${k},${-k} ${r},0 Q${k},${k} 0,${r} Q${-k},${k} ${-r},0 Q${-k},${-k} 0,${-r}Z" fill="${color}" opacity="${op}"/>`;
}

function coinFace(cx, cy, r) {
  const g = id('cf');
  return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".5" stop-color="#ffc93a"/><stop offset="1" stop-color="#d98510"/></linearGradient></defs>
  <g transform="translate(${cx} ${cy}) scale(${r / 50})">
    <circle r="50" fill="#b8650a"/>
    <circle r="46" fill="url(#${g})" stroke="#9a5208" stroke-width="3"/>
    <circle r="34" fill="none" stroke="#c97a10" stroke-width="4"/>
    <path d="M0,-22 L6.5,-7 L22,-6.5 L10,4 L14,20 L0,11 L-14,20 L-10,4 L-22,-6.5 L-6.5,-7Z" fill="#fff4c2" stroke="#b8650a" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-36,-18 A40,40 0 0 1 -12,-39" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
  </g>`;
}

function coinStack(cx, baseY, n, s = 1) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const y = baseY - i * 13 * s, dx = (i % 2 ? 2 : -2) * s;
    out += `<g transform="translate(${cx + dx} ${y}) scale(${s})">
      <path d="M-50,0 L-50,12 A50,16 0 0 0 50,12 L50,0Z" fill="#c4740c" stroke="#7a3d05" stroke-width="3"/>
      <path d="M-50,6 A50,16 0 0 0 50,6" fill="none" stroke="#ffd65a" stroke-width="2" opacity=".6"/>
      <ellipse rx="50" ry="16" fill="#ffd34d" stroke="#7a3d05" stroke-width="3"/>
      <ellipse rx="36" ry="10.5" fill="none" stroke="#e09a1a" stroke-width="3"/>
    </g>`;
  }
  return out;
}

function bg(color, rays) {
  const g = id('bg');
  let r = '';
  if (rays) {
    for (let i = 0; i < 16; i++) r += `<polygon points="256,256 ${256 + 260 * Math.cos((i * 22.5 - 4) * Math.PI / 180)},${256 + 260 * Math.sin((i * 22.5 - 4) * Math.PI / 180)} ${256 + 260 * Math.cos((i * 22.5 + 4) * Math.PI / 180)},${256 + 260 * Math.sin((i * 22.5 + 4) * Math.PI / 180)}" fill="${color}" opacity=".18"/>`;
    const m = id('m');
    r = `<defs><radialGradient id="${m}"><stop offset=".2" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="${m}k"><circle cx="256" cy="256" r="250" fill="url(#${m})"/></mask></defs><g mask="url(#${m}k)">${r}</g>`;
  }
  return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${color}" stop-opacity=".75"/><stop offset=".55" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>
  <circle cx="256" cy="256" r="250" fill="url(#${g})"/>${r}`;
}
const shadow = (cy, rx) => `<ellipse cx="256" cy="${cy}" rx="${rx}" ry="${rx * 0.16}" fill="#000" opacity=".28"/>`;

function pouch(cx, cy, s, c1, c2, c3) {
  const g = id('pg');
  return `<defs><radialGradient id="${g}" cx=".35" cy=".35" r=".8"><stop offset="0" stop-color="${c1}"/><stop offset=".6" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></radialGradient></defs>
  <g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M-62,-8 C-92,40 -70,88 0,88 C70,88 92,40 62,-8 C48,-28 28,-34 22,-46 L-22,-46 C-28,-34 -48,-28 -62,-8Z" fill="url(#${g})" stroke="${c3}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-40,10 C-55,40 -45,65 -20,74" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".25"/>
    <path d="M-24,-46 L-46,-78 L-14,-62 L0,-84 L14,-62 L46,-78 L24,-46Z" fill="${c2}" stroke="${c3}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="-30" y="-52" width="60" height="14" rx="7" fill="#ffd34d" stroke="#7a3d05" stroke-width="4"/>
  </g>`;
}

function chest(cx, cy, s, fill) {
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    <path d="M-96,-34 L-84,-112 Q0,-132 84,-112 L96,-34Z" fill="#5a2d12" stroke="#2e1406" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-80,-44 L-72,-102 Q0,-118 72,-102 L80,-44Z" fill="#3a1a08"/>
    <path d="M-96,-34 L-84,-112 M96,-34 L84,-112" stroke="#ffc93a" stroke-width="10"/>
    ${fill}
    <rect x="-100" y="-38" width="200" height="104" rx="8" fill="#8a4a1c" stroke="#2e1406" stroke-width="5"/>
    <path d="M-100,-4 H100 M-100,32 H100" stroke="#5a2d12" stroke-width="4"/>
    <rect x="-100" y="-38" width="200" height="14" fill="#ffc93a" stroke="#7a3d05" stroke-width="4"/>
    <rect x="-84" y="-38" width="18" height="104" fill="#ffc93a" stroke="#7a3d05" stroke-width="4"/>
    <rect x="66" y="-38" width="18" height="104" fill="#ffc93a" stroke="#7a3d05" stroke-width="4"/>
    <rect x="-18" y="-30" width="36" height="42" rx="6" fill="#ffd34d" stroke="#7a3d05" stroke-width="4"/>
    <circle cx="0" cy="-12" r="6" fill="#7a3d05"/><rect x="-2.5" y="-10" width="5" height="12" fill="#7a3d05"/>
  </g>`;
}

const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${body}</svg>`;

// ---------- CRISTAUX ----------
const items = {};
items['cristaux_1_poignee'] = svg(bg('#2fc6ff') + shadow(420, 110) +
  gem(256, 250, 230, 'azur', -6) + sparkle(370, 130, 26) + sparkle(140, 330, 16, '#fff', .8));

items['cristaux_2_petit_tas'] = svg(bg('#2fc6ff') + shadow(420, 160) +
  gem(170, 300, 160, 'azur', -16) + gem(345, 300, 160, 'azur', 14) + gem(256, 245, 200, 'azur', 0) +
  sparkle(385, 150, 24) + sparkle(120, 190, 16, '#fff', .8));

items['cristaux_3_bourse'] = svg(bg('#7b5cff') + shadow(440, 160) +
  pouch(256, 300, 1.55, '#9a6bff', '#5b2fc4', '#2a1060') +
  gem(220, 185, 95, 'azur', -18) + gem(300, 180, 100, 'violet', 14) + gem(258, 165, 110, 'azur', 0) +
  gem(140, 410, 80, 'azur', -30) + gem(375, 418, 70, 'violet', 25) +
  sparkle(395, 130, 24) + sparkle(110, 210, 18, '#fff', .8));

const chestGems = (pal2) => [
  gem(-60, -50, 60, 'azur', -20), gem(55, -52, 62, pal2, 18), gem(0, -62, 72, 'azur', 0),
  gem(-30, -45, 55, pal2, 10), gem(32, -42, 52, 'azur', -12), gem(-80, -38, 45, 'azur', 30), gem(82, -36, 45, pal2, -25),
].join('');
items['cristaux_4_coffre'] = svg(bg('#a04dff', true) + shadow(440, 190) +
  chest(256, 330, 1.55, chestGems('violet')) +
  gem(105, 425, 70, 'violet', -25) + gem(410, 430, 62, 'azur', 20) +
  sparkle(400, 110, 26) + sparkle(110, 170, 20, '#fff', .85) + sparkle(256, 90, 14, '#fff', .7));

let pile = '';
const pilePts = [[150,390,'azur',-20,90],[362,392,'violet',18,90],[205,400,'rose',8,80],[310,402,'azur',-8,84],
  [180,330,'violet',-12,96],[332,330,'azur',14,96],[256,350,'azur',0,104],[220,275,'azur',-10,106],[295,272,'violet',12,104],
  [256,215,'rose',0,118],[256,140,'azur',0,150]];
for (const [x,y,p,r,s] of pilePts) pile += gem(x, y, s * 1.05, p, r);
items['cristaux_5_montagne'] = svg(bg('#ff4fb0', true) + shadow(445, 200) + pile +
  sparkle(400, 120, 28) + sparkle(105, 160, 20, '#fff', .85) + sparkle(420, 300, 14, '#fff', .7));

// légendaire : cluster de cristaux géants + couronne
function shard(x, y, w, h, rot, pal) {
  const P = PAL[pal];
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <polygon points="0,${-h} ${w/2},${-h+w*0.6} ${w/2},0 0,${w*0.3} ${-w/2},0 ${-w/2},${-h+w*0.6}" fill="${P[2]}" stroke="${P[4]}" stroke-width="5" stroke-linejoin="round"/>
    <polygon points="0,${-h} ${-w/2},${-h+w*0.6} ${-w/2},0 0,${w*0.3}" fill="${P[1]}"/>
    <polygon points="0,${-h} ${w/2},${-h+w*0.6} ${w/2},0 0,${w*0.3}" fill="${P[3]}" opacity=".7"/>
    <polygon points="0,${-h} ${w/2},${-h+w*0.6} ${w/2},0 0,${w*0.3} ${-w/2},0 ${-w/2},${-h+w*0.6}" fill="none" stroke="${P[4]}" stroke-width="5" stroke-linejoin="round"/>
    <line x1="${-w*0.28}" y1="${-h+w*0.7}" x2="${-w*0.28}" y2="${-w*0.1}" stroke="#fff" stroke-width="${w*0.08}" stroke-linecap="round" opacity=".7"/>
  </g>`;
}
items['cristaux_6_tresor_legendaire'] = svg(bg('#ffb300', true) + shadow(440, 200) +
  shard(160, 420, 70, 210, -28, 'violet') + shard(355, 420, 70, 210, 26, 'rose') +
  shard(205, 425, 85, 260, -12, 'azur') + shard(310, 425, 85, 255, 12, 'violet') + shard(256, 430, 100, 320, 0, 'azur') +
  `<path d="M196,98 L214,62 L236,90 L256,48 L276,90 L298,62 L316,98Z" fill="#ffd34d" stroke="#7a3d05" stroke-width="5" stroke-linejoin="round"/>
   <circle cx="256" cy="80" r="7" fill="#ff5fae" stroke="#7a3d05" stroke-width="3"/>` +
  gem(130, 440, 70, 'or', -15) + gem(385, 442, 70, 'rose', 15) + gem(256, 452, 64, 'or', 0) +
  sparkle(410, 140, 30) + sparkle(100, 180, 22, '#fff', .9) + sparkle(430, 320, 16, '#fff', .75) + sparkle(85, 330, 14, '#fff', .7));

// ---------- PIÈCES ----------
items['pieces_1_poignee'] = svg(bg('#ffc21a') + shadow(420, 130) +
  coinStack(300, 390, 3, 1.1) + coinFace(200, 300, 95) + sparkle(380, 150, 24) + sparkle(120, 170, 16, '#fff', .8));

items['pieces_2_piles'] = svg(bg('#ffc21a') + shadow(430, 180) +
  coinStack(150, 400, 5, 1.05) + coinStack(362, 400, 7, 1.05) + coinStack(256, 410, 10, 1.15) +
  coinFace(385, 190, 60) + sparkle(130, 150, 22) + sparkle(420, 320, 14, '#fff', .8));

items['pieces_3_sac'] = svg(bg('#ffa21a', true) + shadow(440, 170) +
  pouch(256, 300, 1.55, '#e2b06a', '#a8692a', '#4f2a0a') +
  `<text x="256" y="395" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="120" fill="#ffd34d" stroke="#4f2a0a" stroke-width="8" paint-order="stroke">$</text>` +
  coinFace(200, 180, 46) + coinFace(300, 175, 50) + coinFace(252, 160, 54) +
  coinStack(115, 440, 3, .8) + coinFace(400, 410, 46) + sparkle(400, 120, 26) + sparkle(105, 230, 18, '#fff', .8));

const chestCoins = [coinFace(-62, -55, 32), coinFace(58, -58, 34), coinFace(-25, -62, 36), coinFace(22, -66, 38), coinFace(0, -48, 34), coinFace(-85, -40, 26), coinFace(86, -40, 26)].join('');
items['pieces_4_coffre'] = svg(bg('#ff8a00', true) + shadow(440, 190) +
  chest(256, 330, 1.55, chestCoins) +
  coinStack(100, 440, 4, .75) + coinFace(410, 420, 44) +
  sparkle(400, 110, 26) + sparkle(110, 160, 20, '#fff', .85) + sparkle(256, 92, 14, '#fff', .7));

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  for (const [name, s] of Object.entries(items)) {
    fs.writeFileSync(`${OUT}/${name}.svg`, s);
    await page.setContent(`<html><body style="margin:0;background:transparent">${s}</body></html>`);
    await page.screenshot({ path: `${OUT}/${name}.png`, omitBackground: true, clip: { x: 0, y: 0, width: 512, height: 512 } });
  }
  // planche d'aperçu
  const names = Object.keys(items);
  const html = `<html><body style="margin:0;background:#1b1f2e;display:grid;grid-template-columns:repeat(5,256px);gap:12px;padding:12px;font-family:Arial;color:#fff">${names.map(n => `<div><div style="width:256px;height:256px;background:#2a3148;border-radius:16px">${items[n].replace('width="512" height="512"', 'width="256" height="256"')}</div><div style="font-size:13px;margin-top:4px">${n}</div></div>`).join('')}</body></html>`;
  await page.setViewportSize({ width: 5 * 268 + 12, height: 2 * 290 + 24 });
  await page.setContent(html);
  await page.screenshot({ path: `${OUT}/apercu.png`, fullPage: true });
  await browser.close();
})();
