#!/usr/bin/env node

import fs from "node:fs/promises";

const INDEX = "index.html";

// Einzigartige, spezielle Icons - keine Duplikate!
const UNIQUE_ICONS = {
  // Morgen/Abend
  alarm: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3L2 6m20-3l-3 3M9 4h6"/></svg>`,
  sleep: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/><path d="M17 7l2 2-2 2M10 17l-2-2 2-2"/></svg>`,
  
  // Aktivitäten
  coffee: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><path d="M6 1v3m4-3v3m4-3v3"/><path d="M4 12h12" stroke-dasharray="2 2"/></svg>`,
  hydrate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/><path d="M8 14h8" opacity="0.5"/></svg>`,
  food: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="3"/></svg>`,
  
  // Sport
  gym: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12h11M12 7v10"/><rect x="3" y="10" width="2" height="4" rx="1"/><rect x="19" y="10" width="2" height="4" rx="1"/><rect x="7" y="9" width="2" height="6" rx="1"/><rect x="15" y="9" width="2" height="6" rx="1"/></svg>`,
  jog: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2"/><path d="M5 20l4-6 3 3 5-5"/><path d="M14 10l2-4 3 2"/></svg>`,
  
  // Mental
  meditation: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/><path d="M3.5 3.5l4.5 4.5m8 0l4.5-4.5m0 17l-4.5-4.5m-8 0l-4.5 4.5"/></svg>`,
  read: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/><line x1="12" y1="8" x2="12" y2="13"/></svg>`,
  brain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v0a3 3 0 0 0-3 3v0a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3v0a3 3 0 0 0 3 3v0a3 3 0 0 0 3 3h0"/><path d="M12 2a3 3 0 0 1 3 3v0a3 3 0 0 1 3 3v0a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3v0a3 3 0 0 1-3 3v0a3 3 0 0 1-3 3h0"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
  
  // Arbeit
  laptop: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/><circle cx="12" cy="10" r="1"/></svg>`,
  meeting: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="2"/><circle cx="15" cy="9" r="2"/><path d="M3 20v-2a4 4 0 0 1 4-4h4m8 6v-2a4 4 0 0 0-4-4h-4"/></svg>`,
  code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="3" x2="12" y2="21" stroke-dasharray="3 3"/></svg>`,
  
  // Kommunikation
  phone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r="1"/><line x1="9" y1="5" x2="15" y2="5"/></svg>`,
  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 5L2 7"/></svg>`,
  
  // Selbstpflege
  shower: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v3h-8z"/><path d="M12 9v3"/><circle cx="8" cy="17" r="1"/><circle cx="12" cy="19" r="1"/><circle cx="16" cy="17" r="1"/><circle cx="10" cy="21" r="1"/><circle cx="14" cy="21" r="1"/></svg>`,
  bed: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8h20v8M2 12V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5"/><path d="M7 12V9m10 3V9"/></svg>`,
  
  // Ziele & Tracking
  target: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/></svg>`,
  chart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 12l4-4 4 4 5-5"/></svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h7l-5.5 4 2 7L12 15l-6.5 5 2-7L2 9h7z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/><path d="M20 12l-7 7" opacity="0.3"/></svg>`,
  
  // UI Elements
  plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="16" r="1"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><circle cx="11" cy="11" r="3" opacity="0.3"/></svg>`,
  
  // Keine Duplikate mehr! moon, water, run, book wurden entfernt
};

async function main() {
  console.log("🎨 Erstelle einzigartige, spezielle Icons...");
  
  let html = await fs.readFile(INDEX, "utf8");
  
  // Backup
  const backup = INDEX.replace(/\.html$/, `.unique-backup-${Date.now()}.html`);
  await fs.writeFile(backup, html, "utf8");
  
  // Finde svgIcons Block
  const iconBlockRegex = /(const\s+svgIcons\s*=\s*\{)([\s\S]*?)(\}\s*;)/;
  const match = html.match(iconBlockRegex);
  
  if (!match) {
    console.error("❌ svgIcons Block nicht gefunden!");
    process.exit(1);
  }
  
  // Erstelle neuen Block mit einzigartigen Icons
  let newContent = "\n";
  for (const [key, svg] of Object.entries(UNIQUE_ICONS)) {
    const minified = svg.replace(/\s+/g, ' ').trim();
    newContent += `  ${key}: \`${minified}\`,\n`;
  }
  newContent = newContent.slice(0, -2) + "\n";
  
  const newBlock = match[1] + newContent + match[3];
  html = html.replace(iconBlockRegex, newBlock);
  
  // Entferne Wiederholungsauswahl bei Aufgaben
  // Suche nach dem repeat select element
  html = html.replace(
    /<select[^>]*id="taskRepeat"[^>]*>[\s\S]*?<\/select>/gi,
    ''
  );
  
  // Entferne auch das Label
  html = html.replace(
    /<label[^>]*for="taskRepeat"[^>]*>[\s\S]*?<\/label>/gi,
    ''
  );
  
  // Entferne repeat aus Task-Erstellung
  html = html.replace(
    /repeat:\s*document\.getElementById\(['"]taskRepeat['"]\)\.value[,\s]*/g,
    ''
  );
  
  // Entferne repeat rendering
  html = html.replace(
    /\$\{task\.repeat[^}]*\}/g,
    ''
  );
  
  await fs.writeFile(INDEX, html, "utf8");
  
  console.log(`✅ ${Object.keys(UNIQUE_ICONS).length} einzigartige Icons erstellt!`);
  console.log("🚫 Duplikate entfernt: moon, water, run, book");
  console.log("🚫 Wiederholungsauswahl entfernt");
  console.log(`📦 Backup: ${backup}`);
}

main().catch(console.error);