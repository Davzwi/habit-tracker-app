// tools/replace-icons-block.mjs
// Ersetzt den Inline-Block  `const svgIcons = { ... };`  in index.html
// mit SVGs aus einem Verzeichnis (z. B. icons_white_orange/).
//
// Nutzung:
//   node tools/replace-icons-block.mjs --write --src icons_white_orange --index index.html
//   node tools/replace-icons-block.mjs --print --src icons_white_orange --index index.html
//
// --write  => schreibt direkt in index.html (Backup wird erstellt)
// --print  => gibt den fertigen Block in der Konsole aus (zum Copy-Paste)

import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const getArg = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 ? (args[i + 1] || dflt) : dflt;
};

const MODE_WRITE = args.includes("--write");
const MODE_PRINT = args.includes("--print");

const SRC_DIR = getArg("--src", "icons_white_orange");
const INDEX = getArg("--index", "index.html");

function log(...x){ console.log(...x); }
function err(x){ console.error(x); process.exit(1); }

function minify(svg) {
  return svg
    .replace(/\r?\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

// Keys im Projekt → Dateinamen im SRC_DIR (ohne .svg)
const NAME_MAP = {
  // Abweichungen
  sleep: "moon",
  hydrate: "water",
  jog: "run",
  read: "book",
  // 1:1 (nur als Erinnerung; nicht zwingend nötig)
  alarm: "alarm", water:"water", coffee:"coffee", run:"run", book:"book",
  heart:"heart", check:"check", plus:"plus", home:"home", shower:"shower",
  bed:"bed", phone:"phone", email:"email", brain:"brain", target:"target",
  chart:"chart", calendar:"calendar", search:"search", code:"code",
  gym:"gym", food:"food", meeting:"meeting", meditation:"meditation",
  star:"star", moon:"moon", laptop:"laptop"
};

async function fileExists(p){ try { await fs.access(p); return true; } catch { return false; } }

async function loadSvgOrNull(name) {
  const file = path.join(SRC_DIR, `${name}.svg`);
  if (!(await fileExists(file))) return null;
  const raw = await fs.readFile(file, "utf8");
  return minify(raw);
}

async function main() {
  if (!(await fileExists(SRC_DIR))) err(`❌ Quellordner nicht gefunden: ${SRC_DIR}`);
  if (!(await fileExists(INDEX)))   err(`❌ Datei nicht gefunden: ${INDEX}`);

  let html = await fs.readFile(INDEX, "utf8");
  // Finde den Block `const svgIcons = { ... };` (angepasst für deine index.html)
  const reIcons = /(\bconst\s+svgIcons\s*=\s*\{)([\s\S]*?)(\}\s*;)/m;
  const match = html.match(reIcons);
  if (!match) err("❌ Konnte den Block `const svgIcons = { ... };` in index.html nicht finden.");

  const before = match[1], body = match[2], after = match[3];

  // Alle Schlüssel aus dem Body holen:  key: `...` / key: "..." / '...'
  const pairRe = /([A-Za-z0-9_-]+)\s*:\s*([`'"])([\s\S]*?)\2\s*,?/g;
  const entries = [];
  let m;
  while ((m = pairRe.exec(body))) entries.push({ key: m[1], raw: m[0] });

  let replaced = 0, kept = 0, missing = [];
  let out = "";

  for (const e of entries) {
    const wanted = NAME_MAP[e.key] || e.key;
    let svg = await loadSvgOrNull(wanted);
    if (!svg && wanted !== e.key) svg = await loadSvgOrNull(e.key); // Fallback gleicher Name
    if (svg) {
      out += `  ${e.key}: \`${svg}\`,\n`;
      replaced++;
    } else {
      // kein passendes SVG gefunden → alten Eintrag beibehalten
      out += "  " + e.raw + "\n";
      kept++;
      missing.push(e.key);
    }
  }

  const newBlock = `${before}\n${out}${after}`;
  const newHtml = html.replace(reIcons, newBlock);

  if (MODE_PRINT && !MODE_WRITE) {
    // Nur ausgeben, damit du ihn selbst reinkopieren kannst
    console.log("\n/* ====== REPLACE THIS WHOLE BLOCK IN index.html ====== */\n");
    console.log(newBlock);
    console.log("\n/* ========== END ICONS BLOCK ========== */\n");
    log(`ℹ️  Ersetzt: ${replaced}, beibehalten: ${kept}${missing.length ? `, ohne Treffer: ${missing.join(", ")}` : ""}`);
    return;
  }

  if (MODE_WRITE) {
    // Direkt schreiben (Backup anlegen)
    const backup = INDEX.replace(/\.html$/, `.icons-backup-${Date.now()}.html`);
    await fs.writeFile(backup, html, "utf8");
    await fs.writeFile(INDEX, newHtml, "utf8");

    log(`✅ Icons-Block aktualisiert: ${replaced} ersetzt, ${kept} beibehalten.`);
    if (missing.length) log(`⚠️  Ohne Treffer: ${missing.join(", ")}`);
    log(`🧰 Backup: ${backup}`);
    log("💡 Tipp: Dev-Cache leeren & Hard-Reload (⌘⌥R).");
  }
}

main().catch(err);