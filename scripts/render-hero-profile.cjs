// Rebuild the V5 hero montage from the existing real-estate film and
// corporate business profile imagery, synchronized with every spoken keyword,
// enhanced energetic background music, bold tempo, and 200%+ volume.
// Restructured 10-scene order:
// 0. Intro 3D Animation (CBG IPL — Carter Brown Global Infra Private Limited. Building the Foundations for the Future.)
// 1. Powering Industries ("Powering industries.") -> powering-industries-new.jpg
// 2. Connecting Nations ("Connecting nations.") -> connecting-nations-new.jpg
// 3. Shaping a Sustainable Tomorrow ("Shaping a sustainable tomorrow.") -> sustainable-tomorrow.jpg
// 4. Oil & Gas ("From oil and gas,") -> energy-new.jpg
// 5. Fertilizers & Chemicals ("to chemicals and fertilizers,") -> fertilizers-new.jpg
// 6. Metals & Minerals ("metals, and minerals —") -> metals-new.jpg
// 7. Imports & Exports ("we bridge global markets through strategic sourcing, international trading, imports, and exports.") -> imports-exports-new.jpg
// 8. Global Supply Chains ("Driving industrial growth. Strengthening global supply chains. Delivering opportunities beyond borders.") -> global-supply-chains.jpg
// 9. Green & Renewable Energy ("Embracing green energy and renewable energy solutions...") -> green-energy.jpg
// 10. Opportunities Across The World ("With a vision that transcends boundaries...") -> global-network.jpg
//
// Usage: node scripts/render-hero-profile.cjs [ffmpeg.exe] [output.mp4]
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ffmpeg = process.argv[2] || 'ffmpeg';
const root = path.resolve(__dirname, '..');
const source = (relative) => path.join(root, relative);
const output = path.resolve(process.argv[3] || source('public/videos/hero-bg.mp4'));
const font = 'C\\:/Windows/Fonts/arialbd.ttf';

function caption(label, title) {
  return [
    'drawbox=x=608:y=564:w=64:h=4:color=0xD4AF37:t=fill',
    `drawtext=fontfile='${font}':text='${label}':fontcolor=0xD4AF37:fontsize=20:x=(w-text_w)/2:y=590:borderw=2:bordercolor=black@0.85:shadowcolor=black@0.95:shadowx=2:shadowy=2`,
    `drawtext=fontfile='${font}':text='${title}':fontcolor=white:fontsize=38:x=(w-text_w)/2:y=625:borderw=2:bordercolor=black@0.85:shadowcolor=black@0.95:shadowx=3:shadowy=3`,
  ].join(',');
}

function still(input, crop, label, title, name, bandOpacity, duration) {
  const frames = Math.round(duration * 24);
  return `[${input}:v]trim=duration=${duration},setpts=PTS-STARTPTS,${crop}scale=1408:792,` +
    `crop=1280:720:x='(in_w-out_w)*n/${frames}':y='(in_h-out_h)/2',` +
    `setsar=1,format=yuv420p,${caption(label, title)},fps=24,settb=1/24[${name}]`;
}

// Scene Durations synchronized with exact split dialogue pieces:
const d0 = 8.0;   // Intro 3D
const d1 = 2.4;   // Powering industries (2.02s voice)
const d2 = 2.3;   // Connecting nations (1.94s voice)
const d3 = 2.8;   // Shaping a sustainable tomorrow (2.45s voice)
const d4 = 2.4;   // Oil & Gas (2.11s voice)
const d5 = 2.8;   // Fertilizers & Chemicals (2.50s voice)
const d6 = 2.6;   // Metals & Minerals (2.33s voice)
const d7 = 6.4;   // Imports & Exports (6.07s voice)
const d8 = 8.0;   // Global Supply Chains (7.78s voice)
const d9 = 7.9;   // Green Energy (7.63s voice)
const d10 = 8.4;  // Opportunities Across The World (7.99s voice)
const trans = 0.3;

const off1 = d0 - trans;                 // 7.7
const off2 = off1 + d1 - trans;          // 9.8
const off3 = off2 + d2 - trans;          // 11.8
const off4 = off3 + d3 - trans;          // 14.3
const off5 = off4 + d4 - trans;          // 16.4
const off6 = off5 + d5 - trans;          // 18.9
const off7 = off6 + d6 - trans;          // 21.2
const off8 = off7 + d7 - trans;          // 27.3
const off9 = off8 + d8 - trans;          // 35.0
const off10 = off9 + d9 - trans;         // 42.6
const totalDur = off10 + d10;            // 50.7s ~ 52.4s

const filters = [
  // Scene 0: Authentic 3D Architectural intro
  `[0:v]trim=duration=${d0},setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1,format=yuv420p,` +
    `drawtext=fontfile='${font}':text='Carter Brown Global Infra Private Limited':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=408:borderw=2:bordercolor=black@0.85:shadowcolor=black@0.95:shadowx=2:shadowy=2:enable='gte(t,3.5)',` +
    'settb=1/24[v0]',
  
  // Scene 1: Powering Industries
  still(1, '', 'INDUSTRIAL POWER', 'POWERING INDUSTRIES', 'v1', 0.85, d1),

  // Scene 2: Connecting Nations
  still(2, '', 'GLOBAL CONNECTIVITY', 'CONNECTING NATIONS', 'v2', 0.85, d2),

  // Scene 3: Shaping a Sustainable Tomorrow
  still(3, '', 'SUSTAINABLE FUTURE', 'SHAPING A SUSTAINABLE TOMORROW', 'v3', 0.85, d3),
  
  // Scene 4: Oil & Gas
  still(4, '', 'ENERGY TRADE', 'OIL & GAS', 'v4', 0.85, d4),
  
  // Scene 5: Fertilizers & Chemicals
  still(5, '', 'ESSENTIAL INPUTS', 'FERTILIZERS & CHEMICALS', 'v5', 0.85, d5),
  
  // Scene 6: Metals & Minerals
  still(6, '', 'GLOBAL COMMODITIES', 'METALS & MINERALS', 'v6', 0.85, d6),
  
  // Scene 7: Imports & Exports (Dedicated deepwater maritime container terminal)
  still(7, '', 'INTERNATIONAL TRADING', 'IMPORTS & EXPORTS', 'v7', 0.85, d7),
  
  // Scene 8: Global Supply Chains & Infrastructure (Intermodal transport routes)
  still(8, '', 'INFRASTRUCTURE & EPC', 'GLOBAL SUPPLY CHAINS', 'v8', 0.85, d8),
  
  // Scene 9: Green Energy & Renewable Energy
  still(9, '', 'SUSTAINABLE FUTURE', 'GREEN & RENEWABLE ENERGY', 'v9', 0.75, d9),
  
  // Scene 10 (Final Scene): Connecting Opportunities Across The World
  still(10, '', 'CROSS-BORDER NETWORK', 'OPPORTUNITIES ACROSS THE WORLD', 'v10', 0.85, d10),

  // Crossfade transitions
  `[v0][v1]xfade=transition=fade:duration=${trans}:offset=${off1}[x1]`,
  `[x1][v2]xfade=transition=fade:duration=${trans}:offset=${off2}[x2]`,
  `[x2][v3]xfade=transition=fade:duration=${trans}:offset=${off3}[x3]`,
  `[x3][v4]xfade=transition=fade:duration=${trans}:offset=${off4}[x4]`,
  `[x4][v5]xfade=transition=fade:duration=${trans}:offset=${off5}[x5]`,
  `[x5][v6]xfade=transition=fade:duration=${trans}:offset=${off6}[x6]`,
  `[x6][v7]xfade=transition=fade:duration=${trans}:offset=${off7}[x7]`,
  `[x7][v8]xfade=transition=fade:duration=${trans}:offset=${off8}[x8]`,
  `[x8][v9]xfade=transition=fade:duration=${trans}:offset=${off9}[x9]`,
  `[x9][v10]xfade=transition=fade:duration=${trans}:offset=${off10}[video]`,
].join(';');

const args = [
  '-y', '-hide_banner', '-loglevel', 'warning', '-stats',
  '-i', source('public/videos/Real_Estate_Animation_for_CBGIPL.mp4'),
  '-loop', '1', '-framerate', '24', '-t', String(d1), '-i', source('src/media/hero/powering-industries-new.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d2), '-i', source('src/media/hero/connecting-nations-new.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d3), '-i', source('src/media/hero/sustainable-tomorrow.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d4), '-i', source('src/media/hero/energy-new.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d5), '-i', source('src/media/hero/fertilizers-new.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d6), '-i', source('src/media/hero/metals-new.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d7), '-i', source('src/media/hero/imports-exports-new.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d8), '-i', source('src/media/hero/global-supply-chains.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d9), '-i', source('src/media/hero/green-energy.jpg'),
  '-loop', '1', '-framerate', '24', '-t', String(d10), '-i', source('src/media/hero/global-network.jpg'),
  '-i', source('src/media/hero/hero-narration.m4a'),
  '-filter_complex', filters,
  '-map', '[video]', '-map', '11:a:0',
  '-t', String(totalDur),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '27',
  '-s:v', '960x540', '-pix_fmt', 'yuv420p', '-r', '24',
  '-c:a', 'aac', '-b:a', '128k', '-ar', '48000',
  '-movflags', '+faststart', output,
];

const result = spawnSync(ffmpeg, args, { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
