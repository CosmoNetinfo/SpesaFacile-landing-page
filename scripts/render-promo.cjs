// Run with Playwright installed and ffmpeg on PATH. Sources are local brand assets.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const temporary = path.join(root, '.checks/promo');
const destination = path.join(root, 'assets/promo');
const png = file => 'data:image/png;base64,' + fs.readFileSync(path.join(root, file)).toString('base64');
const svg = file => 'data:image/svg+xml;base64,' + fs.readFileSync(path.join(root, file)).toString('base64');
fs.mkdirSync(temporary, { recursive: true }); fs.mkdirSync(destination, { recursive: true });
const logo = svg('assets/design/icona-d.svg');
const home = png('assets/screenshots/notebook-home.png');
const shopping = png('assets/screenshots/notebook-shopping.png');
const scenes = [
  `<div class="tag">TI SUONA FAMILIARE?</div><h1>Hai preso<br><em>proprio tutto?</em></h1><div class="memo"><div>☑ Il latte.</div><div>☑ Il pane.</div><div class="missing">☐ E quell’altra cosa…</div></div><p>Il foglietto si dimentica.<br>Il telefono, molto meno.</p>`,
  `<div class="tag">UN PENSIERO IN MENO</div><h1>La tua lista.<br><em>Sempre con te.</em></h1><img class="screen" src="${home}" alt=""><p>Scrivi quello che serve.<br>Spunta quello che hai preso.</p>`,
  `<div class="tag">IL TUO BLOCCO DIGITALE</div><h1>La tua spesa.<br><em>Il tuo stile.</em></h1><div class="swatches"><i style="background:#b65308"></i><i style="background:#396647"></i><i style="background:#285f83"></i><i style="background:#98465d"></i></div><img class="screen shopping" src="${shopping}" alt=""><p>Liste, preferiti e budget.<br>Quattro colori da scegliere.</p>`,
  `<div class="tag">MENO FOGLIETTI. MENO PENSIERI.</div><img class="app-icon" src="${logo}" alt=""><h1 class="end">SpesaFacile.</h1><p class="free">Gratis per Android.</p><p>La prossima spesa<br>comincia qui.</p><div class="cta">Scaricala dal link nel post ↗</div><small>Android 8.0+ · Liste senza account<br>Uso personale e domestico gratuito</small>`
];
const css = `*{box-sizing:border-box}body{margin:0;font-family:Arial;background:#faf5e9;color:#30291f}.page{width:1080px;height:1920px;padding:135px 85px 100px;position:relative;text-align:center;background-image:linear-gradient(90deg,transparent 40px,#c16a3030 40px,#c16a3030 42px,transparent 42px),repeating-linear-gradient(transparent 0,transparent 79px,#b6bea020 79px,#b6bea020 80px)}.brand{display:flex;justify-content:center;align-items:center;gap:22px;font:bold 48px Georgia;margin-bottom:105px}.brand img{width:85px}.tag{font:bold 21px Arial;letter-spacing:3px;color:#7d603b}h1{font-size:106px;letter-spacing:-6px;line-height:1.08;margin:45px 0 55px}em{font-family:Georgia;font-weight:400;color:#ab4e14}p{font-size:42px;line-height:1.55;margin:45px 0}.memo{padding:65px 45px;text-align:left;background:#fffdf6;border:2px solid #ded6c5;border-radius:24px;box-shadow:0 15px 0 #dfd5c1;margin:80px 0;font:48px Georgia;line-height:2.4}.memo div{border-bottom:2px solid #ded6c5}.memo .missing{color:#ab4e14}.screen{height:860px;width:auto;border:12px solid #514438;border-radius:38px;box-shadow:25px 25px 0 #d9cdb8;display:block;margin:auto}.shopping{height:760px}.swatches{display:flex;justify-content:center;gap:30px;margin:-8px 0 40px}.swatches i{width:42px;height:42px;border-radius:50%}.app-icon{width:330px;margin:95px 0 20px}.end{font-size:115px;margin:40px 0 0}.free{font:italic 68px Georgia;color:#ab4e14;margin:24px 0 70px}.cta{padding:32px 28px;background:#b65312;color:#fffaf0;border-radius:18px;font:bold 34px Arial;margin:75px 0 35px}small{font:23px Arial;line-height:1.9;color:#736a5d}.signature{position:absolute;bottom:55px;left:0;right:0;font-size:19px;letter-spacing:2px;color:#7b725e}`;
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    for (let index = 0; index < scenes.length; index++) {
      await page.setContent(`<meta charset="utf-8"><style>${css}</style><div class="page"><div class="brand"><img src="${logo}" alt="">SpesaFacile</div>${scenes[index]}<div class="signature">UN PROGETTO COSMONET.INFO</div></div>`);
      await page.screenshot({ path: path.join(temporary, `scene-${index}.png`) });
    }
  } finally { await browser.close(); }
  fs.copyFileSync(path.join(temporary, 'scene-3.png'), path.join(destination, 'spesafacile-poster.png'));
  const args = ['-y', '-hide_banner', '-loglevel', 'error'];
  for (let i = 0; i < 4; i++) args.push('-loop', '1', '-framerate', '25', '-t', '4', '-i', path.join(temporary, `scene-${i}.png`));
  const filters = [0, 1, 2, 3].map(i => `[${i}:v]setsar=1,format=yuv420p[v${i}]`);
  filters.push('[v0][v1]xfade=transition=fade:duration=0.5:offset=3.5[a]', '[a][v2]xfade=transition=fade:duration=0.5:offset=7[b]', '[b][v3]xfade=transition=fade:duration=0.5:offset=10.5[out]');
  args.push('-filter_complex_threads', '1', '-filter_complex', filters.join(';'), '-map', '[out]', '-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-threads', '2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(destination, 'spesafacile-android.mp4'));
  const result = spawnSync(process.env.FFMPEG_PATH || 'ffmpeg', args, { encoding: 'utf8', timeout: 240000 });
  if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'Video encoding failed');
  console.log('Created assets/promo/spesafacile-android.mp4 (1080x1920, captions, no audio).');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
