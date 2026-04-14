const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'output', 'pdf');
const tmpDir = path.join(rootDir, 'tmp', 'pdfs');
const htmlPath = path.join(tmpDir, 'lightning-games-detailed-report.html');
const pdfPath = path.join(outputDir, 'lightning-games-detailed-report-tr.pdf');

const categoryMap = {
  arcade: ['snake','cyberdash','neonbrawl','tetris','asteroids','frogger','whackamole','doodlejump','runner','flappy','space','orbcollector','skyfall','lasergrid','orbit','stacker','colorrush','blaster','pixelquest','bouncy','rhythmtap','ninja','orbitdefense','gravityflip','tapdash','ballblast','blockdash','bubbleshooter','colormatcher','colorswitch','cubefall','lightcycle','pinball','reaction','rushhour','skydefender','snakevsblock','tunnelrush'],
  puzzle: ['game2048','memory','tictactoe','minesweeper','simon','wordquest','jewels','hexpuzzle','shapeshifter','zigzag','battlecards','typingrush','wordchain'],
  classic: ['pong','neonduel','breakout','pacman'],
  strategy: ['towerdefense','gardenempire'],
  creative: ['piano','neondraw']
};

const categoryLabels = {
  arcade: 'Arcade',
  puzzle: 'Puzzle',
  classic: 'Classic',
  strategy: 'Strategy',
  creative: 'Creative',
  other: 'Other'
};

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readText(filePath) { return fs.readFileSync(filePath, 'utf8'); }
function countLines(filePath) { return readText(filePath).split(/\r?\n/).length; }
function esc(text) { return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function humanBytes(bytes) { return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`; }
function inferCategory(id) { for (const [k, ids] of Object.entries(categoryMap)) if (ids.includes(id)) return k; return 'other'; }
function titleFromId(id) { return id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([a-z])(\d)/g, '$1 $2').replace(/(\d)([a-z])/gi, '$1 $2').replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()); }
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function table(headers, rows) {
  return `<table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function collectStats() {
  const gameFiles = fs.readdirSync(path.join(rootDir, 'games')).filter((name) => name.endsWith('.js')).map((name) => {
    const filePath = path.join(rootDir, 'games', name);
    const id = name.replace(/\.js$/, '');
    return { id, category: inferCategory(id), lines: countLines(filePath), size: fs.statSync(filePath).size };
  }).sort((a, b) => a.id.localeCompare(b.id));

  const simpleList = (dir, pattern) => walk(path.join(rootDir, dir)).filter((file) => pattern.test(file)).map((file) => ({
    name: path.relative(rootDir, file),
    lines: countLines(file),
    size: fs.statSync(file).size
  }));

  const rendererFiles = simpleList('renderer', /\.js$/);
  const scriptFiles = simpleList('scripts', /\.js$/);
  const styleFiles = simpleList('styles', /\.css$/);
  const buildUiFiles = fs.existsSync(path.join(rootDir, 'build-ui', 'src')) ? simpleList(path.join('build-ui', 'src'), /\.(cpp|h|hpp)$/) : [];
  const totalCodeLines = [...gameFiles, ...rendererFiles, ...scriptFiles, ...styleFiles, ...buildUiFiles].reduce((sum, file) => sum + file.lines, 0);
  const gamesByCategory = {};
  for (const file of gameFiles) gamesByCategory[file.category] = (gamesByCategory[file.category] || 0) + 1;
  const packageJson = JSON.parse(readText(path.join(rootDir, 'package.json')));
  return { gameFiles, rendererFiles, scriptFiles, styleFiles, buildUiFiles, totalCodeLines, gamesByCategory, packageJson };
}

function makeSections(stats) {
  const majorGames = [...stats.gameFiles].sort((a, b) => b.lines - a.lines).slice(0, 12);
  const categoryMetrics = Object.entries(stats.gamesByCategory).map(([k, v]) => `<div class="metric"><span class="metric-label">${categoryLabels[k] || k}</span><span class="metric-value">${v}</span></div>`).join('');
  const gameTable = table(['#', 'ID', 'Ad', 'Kategori', 'Satir', 'Boyut'], stats.gameFiles.map((g, i) => [String(i + 1), esc(g.id), esc(titleFromId(g.id)), esc(categoryLabels[g.category] || g.category), String(g.lines), humanBytes(g.size)]));
  const largeGameTable = table(['#', 'ID', 'Kategori', 'Satir', 'Boyut'], majorGames.map((g, i) => [String(i + 1), esc(g.id), esc(categoryLabels[g.category] || g.category), String(g.lines), humanBytes(g.size)]));
  const rendererTable = table(['Dosya', 'Satir', 'Boyut'], stats.rendererFiles.map((f) => [esc(f.name), String(f.lines), humanBytes(f.size)]));
  const scriptsTable = table(['Dosya', 'Satir', 'Boyut'], stats.scriptFiles.map((f) => [esc(f.name), String(f.lines), humanBytes(f.size)]));
  const buildUiTable = table(['Dosya', 'Satir', 'Boyut'], stats.buildUiFiles.map((f) => [esc(f.name), String(f.lines), humanBytes(f.size)]));
  const scriptCmdTable = table(['Komut', 'Deger'], Object.entries(stats.packageJson.scripts || {}).map(([k, v]) => [esc(k), `<code>${esc(v)}</code>`]));

  return [
    {
      title: '1. Yonetici Ozeti',
      body: `<p><b>Lightning Games</b>, sistem tepsisine yerlesen ve tek bir kisayolla acilan bir masaustu mikro arcade platformudur. Projenin ana vaadi, kullanicinin oyun secmek icin agir bir istemciye ya da internete ihtiyac duymamasidir.</p>
      <p>Guncel kod tabaninda <b>${stats.gameFiles.length} oyun modulu</b> bulunuyor. Bu oyunlar Electron kabugu, vanilya JavaScript renderer katmani, localStorage kaliciligi, tema motoru ve procedural ses sistemi ile birlestiriliyor.</p>
      <div class="metrics-grid"><div class="metric"><span class="metric-label">Surum</span><span class="metric-value">${esc(stats.packageJson.version)}</span></div><div class="metric"><span class="metric-label">Toplam Kod Satiri</span><span class="metric-value">${stats.totalCodeLines.toLocaleString('tr-TR')}</span></div><div class="metric"><span class="metric-label">Renderer Dosya</span><span class="metric-value">${stats.rendererFiles.length}</span></div></div><div class="metrics-grid">${categoryMetrics}</div>`
    },
    {
      title: '2. Urun Vizyonu',
      body: `<p>Bu uygulama klasik bir launcher gibi davranmaz; kullanici deneyimi "calisma arasinda anlik mola" ihtiyacina gore optimize edilmis durumdadir. <code>Ctrl+Alt+G</code> ile acilan pencere, oyunu aratmaz; oyunu kullanicinin baglamina getirir.</p>
      <p>Bu vizyon, offline calisma, hesap gerektirmeme, dusuk acilis maliyeti ve tek dosya dagitimi gibi teknik kararlarla desteklenir. Urun mesajiyla mimari tercihlerin birbiriyle uyumlu olmasi, projenin en guclu taraflarindandir.</p>`
    },
    {
      title: '3. Mimari Ozeti',
      body: `<p><code>main.js</code>, tray, pencere yasam dongusu, global hotkey ve Chromium GPU switch’lerini yonetir. <code>preload.js</code>, renderer icin minimum IPC koprusu saglar. <code>renderer/</code> altinda launcher, GameManager, soundManager ve particle sistemi bulunur.</p>
      <p>Oyunlarin her biri <code>games/</code> altinda bagimsiz moduller olarak tutulur. Bu yapida ortak bir framework katmani yoktur; bunun yerine merkezde GameManager’in sagladigi operasyon sozlesmesi bulunur.</p>`
    },
    {
      title: '4. Ana Surec ve Masaustu Entegrasyonu',
      body: `<p>Electron ana sureci, pencereyi 960 x 700 boyutunda, frameless ve her zaman ustte calisacak sekilde tanimliyor. Blur durumunda gecikmeli gizleme, animasyon esnasinda tekrarli tetiklemeyi engelleme ve startup grace period gibi detaylar masaustu kullanim kalitesini arttiriyor.</p>
      <p>Tray menusu icinde acma, baslangicta calistirma ve tamamen cikma eylemleri bulunuyor. Tek instance kilidi de ayni uygulamanin birden fazla kopyasinin acilmasini engelliyor.</p>`
    },
    {
      title: '5. Guvenlik Modeli',
      body: `<p>Preload katmani bilerek ince tutulmus. Renderer yalnizca pencereyi kapatma, uygulamayi sonlandirma ve gosterim/gizleme event’lerini dinleme yetkisine sahip. Node entegrasyonu kapali, context isolation acik ve web guvenlik ayarlari korunuyor.</p>
      <p>Bu model, framework kullanmayan genis bir script tabaniyla calisilirken bile masaustu yetkilerinin olabildigince sinirli kalmasini sagliyor.</p>`
    },
    {
      title: '6. Launcher ve Arayuz Sistemi',
      body: `<p>Launcher tarafi, sadece bir menu degil; urunun merkezi deneyim katmanidir. Oyun kartlari, kategoriler, favoriler, arama, ayarlar, istatistik ve tema gecisleri tek bir UI motorunda bir araya geliyor.</p>
      <p><code>GAME_CARDS_CONFIG</code> gibi yapilar, her oyun icin ikon, aciklama ve glow karakteri tanimlayarak teknik metadata ile gorsel sunumu ayni kaynakta bulusturuyor.</p>${rendererTable}`
    },
    {
      title: '7. GameManager Ayrintisi',
      body: `<p>GameManager; oyun kaydi, aktif oturum, pause/resume, high score kontrolu, favoriler, ayarlar ve achievement mantigini birlestiren ana servis katmanidir. Bu, oyunlar birbirinden bagimsiz kalsa bile urunun genel davranisinin tek noktadan yonetilmesini saglar.</p>
      <p>Ayarlar modelinde renderScale, particleDensity, glowIntensity, animSpeed, sfxVolume, musicVolume, muteOnBlur, compactMode ve achievementNotifications gibi bircok ince ayar bulunmasi, projenin sadece prototip koleksiyonu olmadigini gosterir.</p>`
    },
    {
      title: '8. Veri Kaliciligi',
      body: `<p>Skorlar, ayarlar, favoriler, toplam oynama suresi ve benzeri kullanici verileri <code>localStorage</code> icine yaziliyor. Bu tercih, urunun offline ve portable karakteriyle dogrudan uyumludur.</p>
      <p>Cloud ya da hesap sistemi olmamasi bazen tasinabilirligi sinirlar, ancak acilis hizi, basitlik ve mahremiyet acisindan buyuk avantaj saglar.</p>`
    },
    {
      title: '9. Procedural Audio',
      body: `<p><code>soundManager.js</code> tarafinda ses dosyasi yerine Web Audio API tabanli bir sentezleme modeli kullaniliyor. Oyun bazli muzik temalari, notalar, bass dizileri ve percussion pattern’leri ile tanimlaniyor.</p>
      <p>Bu, paket boyutunu dusurur, ses pipeline’ini basitlestirir ve urunun retro-neon karakteriyle guclu bir uyum kurar.</p>`
    },
    {
      title: '10. Tema Sistemi',
      body: `<p>Projede 11 temaya kadar uzanan bir gorsel kimlik cesitliligi bulunuyor. Neon, Retro, Minimal, Forest, Ocean, Sunset, Purple Haze, Matrix, Cyberpunk, Dark Blue ve Fire gibi varyantlar, ayni urunun farkli ruh hallerini sunuyor.</p>
      <p>CSS custom properties tabanli yapi, bu temalari merkezi token’lar uzerinden yonetmeyi kolaylastirir. Tema sistemi bu projede kozmetik bir ek degil, urun kimliginin tasiyici kolonlarindan biridir.</p>`
    },
    {
      title: '11. Oyun Kutuphanesi Kompozisyonu',
      body: `<p>Kutuphane hem klasik hem ozgun isleri birlikte tasiyor. Snake, Tetris, Pac-Man ve Pong gibi bilinen deneyimlerin yanina battlecards, gardenempire, snakevsblock, tunnelrush ve neonbrawl gibi ozgunlestirilmis basliklar eklenmis.</p>
      <p>Bu karisim, kullanici edinimi ve elde tutma acisindan saglikli. Taniyabilir oyunlar iceri alirken, ozgun moduller kutuphaneye kendi imzasini veriyor.</p>${largeGameTable}`
    },
    {
      title: '12. Build ve Operasyon Araclari',
      body: `<p>Repo, build almak icin yalnizca standart package script’lerine yaslanmiyor. Cleanup, lint, validate, release, install, info, package ve stats gibi yardimci araclar, projeyi operasyonel olarak da olgunlastiriyor.</p>${scriptCmdTable}${scriptsTable}`
    },
    {
      title: '13. Native Build UI',
      body: `<p><code>build-ui/</code> altindaki C++ tabanli arayuz, Dear ImGui ve GLFW kullanarak build surecini masaustu seviyesinde bir deneyime ceviriyor. Bu kisim, geliştirici ergonomisine verilen onemi gosteren guclu bir isaret.</p>
      <p>DPI farkliliklari, subprocess yonetimi ve log streaming gibi detaylar, bu aracın basit bir deneme olmaktan oteye gectigini gosteriyor.</p>${buildUiTable}`
    },
    {
      title: '14. Dokumantasyon ve Evrim',
      body: `<p>README, context ve AGENTS dokumanlari arasinda oyun sayisi ve bazi ozellik tanimlarinda tarihsel farklar bulunuyor. Bu durum, projenin hizli gelistigini ama dokumantasyonun her zaman ayni anda guncellenmedigini gosteriyor.</p>
      <p>Bu PDF, dogrudan kod tabanina bakarak guncel durumu onceleyen bir referans olarak hazirlandi. Uzun vadede tek kanonik veri kaynagi ve otomatik dokumantasyon uretimi faydali olur.</p>`
    },
    {
      title: '15. Teknik Riskler',
      body: `<p>Framework’suz genisleme hizi yuksek olsa da oyun sayisi arttikca ortak sozlesmelerin gevsemesi, metadata sapmasi ve tekrar eden yardimci fonksiyonlar risk yaratabilir. UI ve oyun davranislari icin daha derin otomatik testler de gelecekte degerli olacaktir.</p>
      <p>Bununla birlikte mevcut temel guclu: ince preload, net masaustu kontrolu, merkezde GameManager, ayrik oyun modulleri ve build script ekosistemi.</p>`
    },
    {
      title: '16. Tam Oyun Envanteri',
      body: `<p>Asagidaki tablo, depoda bulunan tum oyun modullerinin guncel teknik listesini verir. Bu kisim bilerek detayli tutuldu; hem teknik referans hem de kutuphane denetimi icin kullanilabilir.</p>${gameTable}`
    },
    {
      title: '17. Sonuc ve Oneriler',
      body: `<p>Lightning Games, mikro mola odakli bir masaustu urunu olarak net kimlige sahip. Hizi, local-first yapisi, procedural audio tercihleri, tray entegrasyonu ve buyuk oyun kutuphanesi birlikte dusunuldugunde proje etkileyici derecede butunluklu gorunuyor.</p>
      <p>Bir sonraki buyume asamasi icin merkezi oyun registry’si, export/import altyapisi, gorsel regresyon testleri ve belgelerin tek kaynaktan turetilmesi en yuksek getirili adimlar olarak gorunuyor.</p>`
    }
  ];
}

function buildHtml(stats) {
  const sections = makeSections(stats);
  const toc = sections.map((section) => `<li>${esc(section.title)}</li>`).join('');
  const body = sections.map((section) => `<section class="page-section"><h2>${esc(section.title)}</h2>${section.body}</section>`).join('');
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Lightning Games Rapor</title><style>
  @page { size: A4; margin: 18mm 14mm; }
  :root { --bg:#07111f; --bg2:#0f1d33; --ink:#ecf5ff; --muted:#a6bdd8; --cyan:#3ad7ff; --magenta:#ff4eb8; --line:rgba(130,186,255,.22); --gold:#ffd670; }
  * { box-sizing:border-box; } html,body { margin:0; padding:0; color:var(--ink); font-family:"Segoe UI",Arial,sans-serif; background:radial-gradient(circle at top left, rgba(58,215,255,.18), transparent 28%),radial-gradient(circle at top right, rgba(255,78,184,.16), transparent 24%),linear-gradient(180deg,var(--bg),var(--bg2)); font-size:10.5pt; line-height:1.52; }
  .cover,.toc,.page-section { min-height:260mm; page-break-after:always; } .cover { display:flex; flex-direction:column; justify-content:space-between; padding:14mm 8mm 10mm; }
  .cover-badge { display:inline-block; padding:6px 12px; border:1px solid rgba(58,215,255,.55); border-radius:999px; color:var(--cyan); font-size:11pt; letter-spacing:.08em; text-transform:uppercase; background:rgba(58,215,255,.08); }
  h1 { margin:16mm 0 6mm; font-size:30pt; line-height:1.05; } .subtitle { font-size:14pt; color:var(--muted); max-width:140mm; }
  .hero-grid,.metrics-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:8mm; } .metric { border:1px solid var(--line); background:rgba(5,12,22,.55); border-radius:12px; padding:10px 12px; min-height:56px; }
  .metric-label { display:block; color:var(--muted); font-size:8pt; text-transform:uppercase; letter-spacing:.08em; margin-bottom:4px; } .metric-value { font-size:15pt; color:#fff; font-weight:700; }
  .pill-row { display:flex; flex-wrap:wrap; gap:7px; margin-top:6mm; } .pill { border-radius:999px; border:1px solid rgba(58,215,255,.38); background:rgba(58,215,255,.08); color:#dff8ff; padding:5px 10px; font-size:8.5pt; }
  .cover-footer { display:flex; justify-content:space-between; align-items:flex-end; color:var(--muted); font-size:9pt; border-top:1px solid var(--line); padding-top:8mm; margin-top:10mm; }
  .toc h2,.page-section h2 { margin:0 0 8mm; font-size:18pt; color:#fff; } .toc ol { margin:0; padding-left:20px; columns:2; column-gap:22px; } .toc li { margin:0 0 8px; color:var(--muted); break-inside:avoid; }
  .page-section h2 { padding:10px 12px; border:1px solid var(--line); border-radius:14px; background:linear-gradient(90deg, rgba(58,215,255,.16), rgba(255,78,184,.12)); }
  p { margin:0 0 4.2mm; text-align:justify; color:#ebf3ff; } code { font-family:Consolas,"Courier New",monospace; font-size:9pt; color:var(--gold); background:rgba(255,255,255,.06); border-radius:6px; padding:1px 5px; }
  table { width:100%; border-collapse:collapse; margin:5mm 0; font-size:8.4pt; table-layout:fixed; } th,td { border:1px solid var(--line); padding:6px 7px; vertical-align:top; word-wrap:break-word; } th { background:rgba(58,215,255,.12); color:#fff; text-align:left; } td { background:rgba(6,15,25,.48); color:#e4eefc; }
  .note { border-left:3px solid var(--magenta); background:rgba(255,78,184,.08); padding:10px 12px; border-radius:0 10px 10px 0; color:#f7dff0; margin:6mm 0; }
  .small { font-size:8.5pt; color:var(--muted); }
  </style></head><body>
  <section class="cover"><div><span class="cover-badge">Lightning Games Technical Report</span><h1>Lightning Games<br>Cok Detayli Proje Raporu</h1><p class="subtitle">Bu rapor, projeyi mimari, urun, operasyon ve oyun kutuphanesi seviyesinde kapsamli bicimde anlatmak icin hazirlanmis Turkce teknik dokumandir.</p>
  <div class="hero-grid"><div class="metric"><span class="metric-label">Surum</span><span class="metric-value">${esc(stats.packageJson.version)}</span></div><div class="metric"><span class="metric-label">Oyun Modulu</span><span class="metric-value">${stats.gameFiles.length}</span></div><div class="metric"><span class="metric-label">Kod Satiri</span><span class="metric-value">${stats.totalCodeLines.toLocaleString('tr-TR')}</span></div><div class="metric"><span class="metric-label">Dagitim</span><span class="metric-value">Electron Portable</span></div><div class="metric"><span class="metric-label">Paketleme</span><span class="metric-value">Bun + npm</span></div><div class="metric"><span class="metric-label">Odak</span><span class="metric-value">Instant Tray Arcade</span></div></div>
  <div class="pill-row"><span class="pill">System Tray</span><span class="pill">Global Hotkey</span><span class="pill">HTML5 Canvas</span><span class="pill">Local First</span><span class="pill">Procedural Audio</span><span class="pill">Theme Engine</span><span class="pill">Build UI</span></div></div>
  <div class="cover-footer"><div><div>Hazirlayan: Codex</div><div>Tarih: 13 Nisan 2026</div></div><div class="small">Kaynaklar: AGENTS.md, README.md, context.md, package.json ve guncel repo taramasi</div></div></section>
  <section class="toc"><h2>Icindekiler</h2><div class="note">Bu PDF, kullanici dostu bir tanitim brosurunden ziyade; rapor, teknik inceleme ve proje hafizasi olarak kullanilabilecek kapsamli bir referans olacak sekilde tasarlandi.</div><ol>${toc}</ol></section>${body}</body></html>`;
}

function main() {
  ensureDir(outputDir);
  ensureDir(tmpDir);
  const stats = collectStats();
  fs.writeFileSync(htmlPath, buildHtml(stats), 'utf8');
  const electronBinary = path.join(rootDir, 'node_modules', '.bin', 'electron.cmd');
  const printerScript = path.join(rootDir, 'scripts', 'print_project_report_pdf.js');
  const result = spawnSync(electronBinary, [printerScript, htmlPath, pdfPath], { cwd: rootDir, stdio: 'inherit', shell: false });
  if (result.status !== 0) process.exit(result.status || 1);
  console.log(`PDF generated: ${pdfPath}`);
}

main();
