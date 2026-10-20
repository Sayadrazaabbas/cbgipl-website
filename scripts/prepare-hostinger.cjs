const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'dist');
const outputArg = process.argv[2];
const existingRootArg = process.argv[3];
const outputDir = outputArg
  ? path.resolve(outputArg)
  : path.join(projectRoot, 'dist-hostinger');

if (!fs.existsSync(path.join(sourceDir, 'index.html'))) {
  throw new Error('dist/index.html is missing. Run npm run build first.');
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.cpSync(sourceDir, outputDir, { recursive: true });

const indexPath = path.join(outputDir, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(
  /<meta property="og:url" content="[^"]*"\s*\/?>/,
  '<meta property="og:url" content="https://cbgipl.com/" />\n  <link rel="canonical" href="https://cbgipl.com/" />\n  <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />'
);

html = html.replace(
  /<link rel="preload" as="video" href="[^"]*hero-bg\.mp4"([^>]*)>/,
  '<link rel="preload" as="video" href="./videos/hero-bg.mp4"$1>'
);

const remoteHero = '<source src="https://github.com/Sayadrazaabbas/V5/releases/download/v1.0-media/hero-bg.mp4" type="video/mp4">';
const localHero = '<source src="./videos/hero-bg.mp4" type="video/mp4">';
html = html.replace(
  new RegExp(`${remoteHero.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*${localHero.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
  `${localHero}\n      ${remoteHero}`
);

fs.writeFileSync(indexPath, html, 'utf8');

if (existingRootArg) {
  const existingRoot = path.resolve(existingRootArg);
  const preserve = [
    'google5e5ad3e57a42b3ed.html',
    'robots.txt',
    'sitemap.xml',
    'vite.svg',
  ];

  for (const relativePath of preserve) {
    const sourcePath = path.join(existingRoot, relativePath);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, path.join(outputDir, relativePath));
    }
  }
}

console.log(`Hostinger package prepared at ${outputDir}`);
