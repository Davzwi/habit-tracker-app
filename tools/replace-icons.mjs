import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

// --- helpers ---
async function exists(p){ try{ await fs.access(p); return true; }catch{ return false; } }
const exts = [".svg"];

async function listSvg(dir){
  if(!(await exists(dir))) return [];
  const out = [];
  for(const f of await fs.readdir(dir)){ if(exts.includes(path.extname(f))) out.push(path.join(dir,f)); }
  return out;
}

function base(fn){ return path.basename(fn).toLowerCase(); }
function stem(fn){ return path.basename(fn).toLowerCase().replace(/\.svg$/,''); }

function extractInner(svg){
  const m = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return (m?.[1] ?? svg)
    .replace(/<\?xml[^>]*\?>/gi,'')
    .replace(/<!DOCTYPE[^>]*>/gi,'')
    .replace(/<!--[\s\S]*?-->/g,'');
}

function normalizeToWhiteOrange(inner){
  // remove existing stroke/fill/width and force line-icon look
  inner = inner
    .replace(/stroke-width="[^"]*"/gi,'')
    .replace(/stroke="[^"]*"/gi,'')
    .replace(/fill="(?!none)[^"]*"/gi,'fill="none"');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <rect x="1" y="1" width="22" height="22" rx="6" fill="#FFA62B"/>
  <g fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
${inner}
  </g>
</svg>`;
}

(async () => {
  // --- 1) Icon-Zielordner bestimmen ---
  const targetCandidates = ["src/icons","public/icons","assets/icons","icons"];
  let TARGET = null;
  for(const c of targetCandidates){ if(await exists(path.join(ROOT,c))){ TARGET = path.join(ROOT,c); break; } }
  if(!TARGET){
    // wenn nichts existiert, lege src/icons an
    TARGET = path.join(ROOT,"src/icons");
    await fs.mkdir(TARGET, { recursive:true });
  }

  // --- 2) Quellen einsammeln (was es eben gibt) ---
  const srcDirs = ["icons_theme_ready","_export/icons_svg","_export/icons_inline","_export/icons_datauri"]
    .map(d => path.join(ROOT,d));
  const sources = [];
  for(const d of srcDirs) sources.push(...await listSvg(d));
  if(sources.length === 0){
    console.error("❌ Keine SVG-Quelle gefunden (icons_theme_ready oder _export/...).");
    process.exit(1);
  }

  // --- 3) Normalisieren nach icons_white_orange/ ---
  const OUT = path.join(ROOT,"icons_white_orange");
  await fs.mkdir(OUT,{recursive:true});
  for(const f of sources){
    const raw = await fs.readFile(f,"utf8");
    const inner = extractInner(raw);
    const norm = normalizeToWhiteOrange(inner);
    await fs.writeFile(path.join(OUT, base(f)), norm, "utf8");
  }

  // --- 4) 1:1 ersetzen (gleich benannte Dateien) ---
  const targetFiles = (await listSvg(TARGET)).map(base);
  const newFiles = (await listSvg(OUT)).map(base);
  const newSet = new Set(newFiles);

  const replaced = [];
  for(const t of targetFiles){
    if(newSet.has(t)){
      await fs.copyFile(path.join(OUT, t), path.join(TARGET, t));
      replaced.push(t);
    }
  }

  // --- 5) Namens-Mapping für häufige Fälle (sleep -> moon etc.) ---
  const map = {
    "sleep":"moon",
    "bed":"bed",
    "alarm":"alarm",
    "water":"water",
    "hydrate":"water",
    "coffee":"coffee",
    "run":"run",
    "jog":"run",
    "book":"book",
    "read":"book",
    "heart":"heart",
    "check":"check",
    "plus":"plus",
    "home":"home",
    "shower":"shower",
    "phone":"phone",
    "email":"email",
    "brain":"brain",
    "target":"target",
    "chart":"chart",
    "calendar":"calendar",
    "search":"search",
    "code":"code",
    "gym":"gym",
    "food":"food",
    "meeting":"meeting",
    "meditation":"meditation",
    "star":"star",
    "moon":"moon"
  };

  const outSet = new Set((await listSvg(OUT)).map(stem));
  for(const t of targetFiles){
    const k = stem(t);
    if(!newSet.has(t) && map[k] && outSet.has(map[k])){
      await fs.copyFile(path.join(OUT, map[k]+".svg"), path.join(TARGET, k+".svg"));
      replaced.push(`${k}.svg ← ${map[k]}.svg`);
    }
  }

  // --- 6) Bericht ---
  const missing = [];
  for(const t of targetFiles){
    if(!(newSet.has(t) || (map[stem(t)] && outSet.has(map[stem(t)])))){
      missing.push(t);
    }
  }

  console.log("✅ Zielordner:", TARGET);
  console.log("🔁 Ersetzt:", replaced.length);
  replaced.slice(0,50).forEach(n => console.log("   •", n));
  if(missing.length){
    console.log("⚠️  Keine Entsprechung gefunden (bitte manuell mappen):");
    missing.forEach(n => console.log("   •", n));
  }else{
    console.log("🎉 Alles gemappt.");
  }
})();