// tools/fix-dedup-and-replace.mjs
// 1) liest Icons aus vorhandenen Quellen
// 2) normalisiert auf "line-only, weiß, stroke=2, keine rects"
// 3) dedupliziert per Signatur
// 4) schreibt icons_unique/ + mapping.json
// 5) ersetzt in index.html den Block `const svgIcons = { ... };` (nur unique Keys)

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT   = process.cwd();
const INDEX  = path.join(ROOT, "index.html");
const OUTDIR = path.join(ROOT, "icons_unique");
const SOURCES = [
  "icons_line_white",
  "icons_theme_ready",
  "_export/icons_inline",
  "_export/icons_svg",
  "_export/icons_datauri",
  "icons_white_orange"
].map(d => path.join(ROOT, d));

const PREF_ALIAS = { sleep:"moon", hydrate:"water", jog:"run", read:"book" }; // bevorzugte Namen

// ---------- helpers ----------
async function exists(p){ try{ await fs.access(p); return true; }catch{ return false; } }
function slug(b){ return b.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
function sigHash(s){ return crypto.createHash("sha1").update(s).digest("hex"); }
function extractInner(svg){
  const m = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return (m?.[1] ?? svg);
}
function normalizeToLine(svgInner){
  let s = svgInner
    .replace(/<rect\b[^>]*>(\s*<\/rect>)?|<rect\b[^>]*\/>/gi,"")   // BG-Rects raus
    .replace(/stroke-width="[^"]*"/gi,"")
    .replace(/stroke="[^"]*"/gi,"")
    .replace(/fill="(?!none)[^"]*"/gi,'fill="none"')
    .replace(/<!--[\s\S]*?-->/g,"")
    .replace(/\s+/g," ")
    .trim();
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <g fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
${s}
  </g>
</svg>`;
}
function signature(svgNormalized){
  // Signatur ohne Wrapper, robust gegen kleine Unterschiede
  let x = extractInner(svgNormalized)
    .replace(/stroke-width="[^"]*"/gi,"")
    .replace(/stroke="[^"]*"/gi,"")
    .replace(/fill="(?!none)[^"]*"/gi,'fill="none"')
    .replace(/\s+/g," ")
    .trim();
  return sigHash(x);
}

// ---------- 1) Quellen einsammeln ----------
async function collectSvgs(){
  const files = [];
  for (const d of SOURCES){
    if (!(await exists(d))) continue;
    for (const f of await fs.readdir(d)){
      if (f.toLowerCase().endsWith(".svg")) files.push(path.join(d, f));
    }
  }
  if (!files.length) throw new Error("Keine SVG-Quelle gefunden. Lege z. B. icons_line_white/ an.");
  return files;
}

// ---------- 2/3) normalisieren + deduplizieren ----------
async function buildUnique(){
  const files = await collectSvgs();
  const seen = new Map(); // sig -> {name, svg}
  const map  = {};        // originalName -> keptName

  for (const abs of files){
    const base = path.basename(abs).replace(/\.svg$/i,"");
    let raw = await fs.readFile(abs, "utf8");
    const norm = normalizeToLine(extractInner(raw));
    const sig = signature(norm);

    // Bevorzugte Namensersetzung
    const preferred = PREF_ALIAS[base] ?? base;
    const candidate = slug(preferred);

    if (!seen.has(sig)){
      seen.set(sig, { name: candidate, svg: norm });
      map[base] = candidate;
    } else {
      // Duplikat → auf vorhandenen Namen mappen
      map[base] = seen.get(sig).name;
    }
  }

  // Konflikte: wenn zwei verschiedene sigs denselben Namen wollen -> eindeutige suffixe
  const nameCount = {};
  for (const v of seen.values()){
    nameCount[v.name] = (nameCount[v.name] || 0) + 1;
  }
  for (const v of seen.values()){
    if (nameCount[v.name] > 1){
      let i=2, newName=v.name;
      while(Object.values(seen).some(x => x?.name === newName)) newName = `${v.name}-${i++}`;
      v.name = newName;
    }
  }

  // unique Files schreiben
  await fs.rm(OUTDIR, { recursive:true, force:true });
  await fs.mkdir(OUTDIR, { recursive:true });
  for (const {name, svg} of seen.values()){
    await fs.writeFile(path.join(OUTDIR, `${name}.svg`), svg, "utf8");
  }
  await fs.writeFile(path.join(OUTDIR, "mapping.json"), JSON.stringify(map, null, 2), "utf8");

  return { uniques: Array.from(seen.values()), map };
}

// ---------- 4/5) index.html ersetzen ----------
async function replaceIconsBlock(uniques){
  if (!(await exists(INDEX))) throw new Error("index.html nicht gefunden.");
  let html = await fs.readFile(INDEX, "utf8");
  
  // Fix: Suche nach 'svgIcons' statt 'icons'
  const re = /(\bconst\s+svgIcons\s*=\s*\{)([\s\S]*?)(\}\s*;)/m;
  const m = html.match(re);
  if (!m) throw new Error("Block `const svgIcons = { ... };` nicht gefunden.");

  // Alphabetisch stabil sortieren
  uniques.sort((a,b)=> a.name.localeCompare(b.name));

  let body = "";
  for (const u of uniques){
    const oneLine = u.svg.replace(/\r?\n/g," ").replace(/\s{2,}/g," ").replace(/>\s+</g,"><").trim();
    body += `  ${u.name}: \`${oneLine}\`,\n`;
  }

  const backup = INDEX.replace(/\.html$/, `.icons-backup-${Date.now()}.html`);
  await fs.writeFile(backup, html, "utf8");
  
  const newBlock = m[1] + "\n" + body + m[3];
  html = html.replace(re, newBlock);
  await fs.writeFile(INDEX, html, "utf8");
  return backup;
}

(async ()=>{
  const { uniques, map } = await buildUnique();
  const backup = await replaceIconsBlock(uniques);
  console.log(`✅ Unique Icons: ${uniques.length} → ${OUTDIR}/`);
  console.log(`🧭 Mapping gespeichert: ${path.join(OUTDIR,"mapping.json")}`);
  console.log(`🧰 Backup: ${backup}`);
  console.log("ℹ️ Hinweis: Wenn dein Code bestimmte alte Namen verwendet, kannst du über mapping.json sehen,");
  console.log("   welcher neue Name dasselbe Motiv hat.");
})().catch(e=>{ console.error("❌", e.message); process.exit(1); });