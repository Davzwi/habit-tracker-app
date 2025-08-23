import fs from 'fs/promises';
import path from 'path';

const icons = {
  alarm: { svg: `<circle cx="12" cy="13" r="8"/><path d="M12 6v7l3 3"/><path d="M4 4l3 3m10-3l3 3"/>`, bg: '#FFA62B' },
  meeting: { svg: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"/>`, bg: '#667EEA' },
  coffee: { svg: `<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3m4-3v3m4-3v3"/>`, bg: '#8B5CF6' },
  food: { svg: `<path d="M12 2l8 4-8 4-8-4 8-4z"/><path d="M12 10v12"/><path d="M4 6v12l8 4 8-4V6"/>`, bg: '#10B981' },
  laptop: { svg: `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 20h20"/>`, bg: '#6366F1' },
  gym: { svg: `<path d="M20 12h-4m-8 0H4m8-5v10"/><circle cx="12" cy="7" r="3"/><circle cx="12" cy="17" r="3"/><circle cx="20" cy="12" r="2"/><circle cx="4" cy="12" r="2"/>`, bg: '#EF4444' },
  moon: { svg: `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`, bg: '#9D7BFF' },
  book: { svg: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`, bg: '#F59E0B' },
  water: { svg: `<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>`, bg: '#6CA6FF' },
  run: { svg: `<circle cx="13" cy="4" r="2"/><path d="M13 7v10l-4 4m6-14l-1 4l4 3l3-3"/>`, bg: '#EC4899' },
  meditation: { svg: `<circle cx="12" cy="8" r="3"/><path d="M12 11v10m-5-10l-2 8h14l-2-8"/>`, bg: '#A78BFA' },
  heart: { svg: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`, bg: '#EF4444' },
  star: { svg: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`, bg: '#FCD34D' },
  check: { svg: `<polyline points="20 6 9 17 4 12"/>`, bg: '#10B981' },
  plus: { svg: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`, bg: '#6366F1' },
  home: { svg: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`, bg: '#3B82F6' },
  shower: { svg: `<path d="M12 2v8m-8 4h16m-8 0v8m-4-4v4m8-4v4m-12-8v4"/>`, bg: '#06B6D4' },
  bed: { svg: `<path d="M3 7v11h18V7"/><path d="M3 11h18"/><path d="M7 11v-4h3v4m4 0v-4h3v4"/>`, bg: '#8B5CF6' },
  phone: { svg: `<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1"/>`, bg: '#71717A' },
  email: { svg: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>`, bg: '#DC2626' },
  code: { svg: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`, bg: '#059669' },
  brain: { svg: `<path d="M9.5 2a4.5 4.5 0 0 0-1 8.88V19a2 2 0 0 0 4 0v-1h1v1a2 2 0 0 0 4 0v-8.12A4.5 4.5 0 0 0 14.5 2h-5z"/>`, bg: '#7C3AED' },
  target: { svg: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`, bg: '#DC2626' },
  chart: { svg: `<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>`, bg: '#10B981' },
  calendar: { svg: `<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>`, bg: '#6366F1' },
  search: { svg: `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>`, bg: '#71717A' }
};

// Create theme-ready SVG files
for (const [name, data] of Object.entries(icons)) {
  const svgContent = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="var(--bg, ${data.bg})" opacity="0.15"/>
  ${data.svg.replace(/>/g, ' stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>')}
</svg>`;
  
  await fs.writeFile(
    path.join(process.cwd(), 'icons_theme_ready', `${name}.svg`),
    svgContent
  );
}

// Create icon styles CSS
const cssContent = `.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.icon img {
  width: 32px;
  height: 32px;
}

/* Icon-specific background colors */
${Object.entries(icons).map(([name, data]) => 
  `.icon.${name} { --bg: ${data.bg}; }`
).join('\n')}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .icon { color: #fff; }
}

/* Light mode adjustments */
@media (prefers-color-scheme: light) {
  .icon { color: #1f2937; }
}`;

await fs.writeFile(
  path.join(process.cwd(), 'icons_theme_ready', 'icon-styles.css'),
  cssContent
);

// Create demo HTML
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Theme-Ready Icons Demo</title>
  <link rel="stylesheet" href="icon-styles.css">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 2rem;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 2rem;
    }
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 1.5rem;
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .icon-name {
      color: white;
      font-size: 12px;
      text-align: center;
    }
    .icon {
      width: 48px;
      height: 48px;
      padding: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      transition: transform 0.2s;
    }
    .icon:hover {
      transform: scale(1.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Theme-Ready Icons</h1>
    <div class="icon-grid">
      ${Object.keys(icons).map(name => `
      <div class="icon-item">
        <div class="icon ${name}">
          <img src="${name}.svg" alt="${name}">
        </div>
        <div class="icon-name">${name}</div>
      </div>`).join('')}
    </div>
  </div>
</body>
</html>`;

await fs.writeFile(
  path.join(process.cwd(), 'icons_theme_ready', 'demo.html'),
  htmlContent
);

console.log('✅ Created theme-ready icons in icons_theme_ready/');
console.log('📄 Files created:');
console.log('   - 25 SVG icon files');
console.log('   - icon-styles.css');
console.log('   - demo.html');
console.log('\n🎨 Usage example:');
console.log('   <div class="icon water"><img src="./icons_theme_ready/water.svg" alt="water"></div>');