import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SRC = process.env.SRC || path.join(ROOT, "icons_white_orange");
const INDEX = process.env.INDEX || path.join(ROOT, "index.html");

// 1) Map (alte Keys -> neue Dateinamen ohne .svg)
const MAP = {
  sleep: "moon",
  hydrate: "water",
  jog: "run",
  read: "book",
  // häufige 1:1
  alarm:"alarm", water:"water", coffee:"coffee", run:"run", book:"book",
  heart:"heart", check:"check", plus:"plus", home:"home", shower:"shower",
  bed:"bed", phone:"phone", email:"email", brain:"brain", target:"target",
  chart:"chart", calendar:"calendar", search:"search", code:"code",
  gym:"gym", food:"food", meeting:"meeting", meditation:"meditation", star:"star", moon:"moon", laptop:"laptop"
};

function minifySvg(s){
  return s
    .replace(/\r?\n/g," ")
    .replace(/\s{2,}/g," ")
    .replace(/>\s+</g,"><")
    .trim();
}

const svgCache = new Map();
async function loadSvg(name){
  const file = path.join(SRC, `${name}.svg`);
  const raw = await fs.readFile(file, "utf8");
  return minifySvg(raw);
}

(async () => {
  let html = await fs.readFile(INDEX, "utf8");

  // 2) Icons-Block finden: const svgIcons = { ... };
  const reIcons = /(const\s+svgIcons\s*=\s*\{)([\s\S]*?)(\}\s*;)/m;
  const m = html.match(reIcons);
  if(!m){
    console.error("❌ Konnte den svgIcons-Block (const svgIcons = { ... }) in index.html nicht finden.");
    process.exit(1);
  }
  const head = m[1], body = m[2], tail = m[3];

  // 3) Einträge parsen:  key: `...`  /  key: '...'  /  "key": "..."
  const rePair = /([A-Za-z0-9_-]+)\s*:\s*([`'"])([\s\S]*?)\2\s*,?/g;
  let out = "";
  let replaced = 0, total = 0, missing = [];

  let match;
  while((match = rePair.exec(body))){
    total++;
    const key = match[1];
    const newName = MAP[key] || key;  // map oder 1:1
    try{
      if(!svgCache.has(newName)) svgCache.set(newName, await loadSvg(newName));
      const svg = svgCache.get(newName);
      // Wir schreiben Template-String mit Backticks (robust gegen Quotes)
      out += `  ${key}: \`${svg}\`,\n`;
      replaced++;
    }catch(e){
      // kein passendes SVG → alten Eintrag lassen
      out += match[0] + "\n";
      missing.push(key);
    }
  }

  const newBlock = head + "\n" + out + tail;
  const newHtml = html.replace(reIcons, newBlock);
  
  const backup = INDEX.replace(/\.html$/, `.icons-backup-${Date.now()}.html`);
  await fs.writeFile(backup, html, "utf8");
  await fs.writeFile(INDEX, newHtml, "utf8");

  console.log(`✅ Icons-Block aktualisiert: ${replaced}/${total} Einträge ersetzt.`);
  if(missing.length){
    console.log("⚠️ Keine Entsprechung gefunden für:", missing.join(", "));
  }
  console.log("Backup:", backup);
})();