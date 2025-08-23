#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const INDEX = "index.html";

// Saubere, funktionierende Icons
const WORKING_ICONS = {
  alarm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M5 3L2 6m20-3l-3 3"/></svg>`,
  sleep: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  coffee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3m4-3v3m4-3v3"/></svg>`,
  water: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>`,
  gym: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 12h11M12 7v10M3 10h2v4H3zm16 0h2v4h-2zM7 9h2v6H7zm8 0h2v6h-2z"/></svg>`,
  run: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><path d="M8 21l3-9 7 9M13 10l2-6 4 3 3 3"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  meditation: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1M3.5 3.5l4.5 4.5m8 0l4.5-4.5m0 17l-4.5-4.5m-8 0l-4.5 4.5"/></svg>`,
  laptop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  meeting: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  brain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-5A2.5 2.5 0 0 1 9.5 2zM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-5A2.5 2.5 0 0 0 14.5 2z"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  shower: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v9m4-4l-4 4-4-4"/><circle cx="12" cy="13" r="2"/><path d="M8 17v1m4-1v1m4-1v1m-8 2v1m4-1v1m4-1v1"/></svg>`,
  bed: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 20h18M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  // Aliase für Kompatibilität
  hydrate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  jog: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><path d="M8 21l3-9 7 9M13 10l2-6 4 3 3 3"/></svg>`,
  read: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`
};

async function fixEverything() {
  console.log("🔧 Fixing everything in your habit tracker...\n");
  
  let html = await fs.readFile(INDEX, "utf8");
  
  // Backup
  const backup = INDEX.replace(/\.html$/, `.backup-${Date.now()}.html`);
  await fs.writeFile(backup, html, "utf8");
  console.log(`📦 Backup created: ${backup}`);
  
  let fixes = [];
  
  // 1. Fix svgIcons
  console.log("1️⃣ Fixing icon definitions...");
  const iconBlockRegex = /(const\s+svgIcons\s*=\s*\{)([\s\S]*?)(\}\s*;)/;
  const match = html.match(iconBlockRegex);
  
  if (match) {
    let newIconsContent = "\n";
    for (const [key, svg] of Object.entries(WORKING_ICONS)) {
      newIconsContent += `  ${key}: \`${svg}\`,\n`;
    }
    newIconsContent = newIconsContent.slice(0, -2) + "\n";
    
    const newBlock = match[1] + newIconsContent + match[3];
    html = html.replace(iconBlockRegex, newBlock);
    fixes.push("✅ Icons fixed and deduplicated");
  }
  
  // 2. Fix duplicate icon entries
  console.log("2️⃣ Removing duplicate icon entries...");
  // Remove any lines with duplicate keys in svgIcons
  const lines = html.split('\n');
  const seenKeys = new Set();
  const cleanedLines = [];
  let inIconBlock = false;
  
  for (let line of lines) {
    if (line.includes('const svgIcons = {')) {
      inIconBlock = true;
    }
    
    if (inIconBlock && line.includes(':') && line.includes('`')) {
      const keyMatch = line.match(/^\s*(\w+):/);
      if (keyMatch) {
        const key = keyMatch[1];
        if (seenKeys.has(key)) {
          continue; // Skip duplicate
        }
        seenKeys.add(key);
      }
    }
    
    if (line.includes('};') && inIconBlock) {
      inIconBlock = false;
    }
    
    cleanedLines.push(line);
  }
  
  html = cleanedLines.join('\n');
  fixes.push("✅ Duplicate icons removed");
  
  // 3. Fix getSVGIcon function
  console.log("3️⃣ Fixing icon rendering function...");
  const oldGetSVGIcon = /function getSVGIcon\([^)]*\)\s*\{[^}]*\}/;
  const newGetSVGIcon = `function getSVGIcon(name) {
      const icon = svgIcons[name] || svgIcons.star || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="2"/></svg>';
      return icon;
    }`;
  
  if (html.match(oldGetSVGIcon)) {
    html = html.replace(oldGetSVGIcon, newGetSVGIcon);
    fixes.push("✅ Icon rendering function fixed");
  }
  
  // 4. Ensure initializeSVGIcons works correctly
  console.log("4️⃣ Fixing icon initialization...");
  const oldInitSVG = /function initializeSVGIcons\(\)\s*\{[\s\S]*?\n\s*\}/;
  const newInitSVG = `function initializeSVGIcons() {
      const iconElements = document.querySelectorAll('[data-icon]');
      iconElements.forEach(element => {
        const iconName = element.getAttribute('data-icon');
        const svg = getSVGIcon(iconName);
        if (svg && !element.innerHTML.includes('svg')) {
          element.innerHTML = svg;
          element.style.width = element.style.width || '24px';
          element.style.height = element.style.height || '24px';
          element.style.display = 'inline-flex';
          element.style.alignItems = 'center';
          element.style.justifyContent = 'center';
          element.style.color = 'white';
        }
      });
    }`;
  
  if (html.match(oldInitSVG)) {
    html = html.replace(oldInitSVG, newInitSVG);
    fixes.push("✅ Icon initialization fixed");
  }
  
  // 5. Fix the year/month navigation
  console.log("5️⃣ Fixing date navigation...");
  
  // Check if navigation functions exist
  if (!html.includes('function changeMonth(')) {
    html = html.replace('</script>', `
    function changeMonth(direction) {
      selectedDate.setMonth(selectedDate.getMonth() + direction);
      updateCalendarDisplay();
      generateDateSelector();
      checkTodayButtonVisibility();
      loadUserTasks();
    }
    
    function changeYear(direction) {
      selectedDate.setFullYear(selectedDate.getFullYear() + direction);
      updateCalendarDisplay();
      generateDateSelector();
      checkTodayButtonVisibility();
      loadUserTasks();
    }
    </script>`);
    fixes.push("✅ Navigation functions added");
  }
  
  // 6. Save the fixed HTML
  await fs.writeFile(INDEX, html, "utf8");
  
  console.log("\n✨ Fixes applied:");
  fixes.forEach(fix => console.log(`  ${fix}`));
  
  console.log("\n🎉 Everything should be working now!");
  console.log("💡 Reload the page with Cmd+Shift+R to see the changes");
}

fixEverything().catch(console.error);