#!/bin/bash

# === Pfade anpassen, falls nötig ===
PROJECT=~/habit-tracker-app
TARGET="$PROJECT/src/icons"                 # hier liegen deine alten Icons

# Quelle automatisch wählen (icons_theme_ready bevorzugt, sonst _export/*)
if   [ -d "$PROJECT/icons_theme_ready" ]; then SRC="$PROJECT/icons_theme_ready"
elif [ -d "$PROJECT/_export/icons_svg" ]; then SRC="$PROJECT/_export/icons_svg"
elif [ -d "$PROJECT/_export/icons_inline" ]; then SRC="$PROJECT/_export/icons_inline"
elif [ -d "$PROJECT/_export/icons_datauri" ]; then SRC="$PROJECT/_export/icons_datauri"
else echo "❌ Keine Icon-Quelle gefunden. Lege icons_theme_ready/ oder _export/ an."; exit 1; fi

echo "Quelle: $SRC"
mkdir -p "$TARGET" "$PROJECT/icons_white_orange" "$PROJECT/backup/icons_$(date +%F_%H%M)"

# 1) Backup
cp -a "$TARGET"/*.svg "$PROJECT/backup/icons_$(date +%F_%H%M)"/ 2>/dev/null || true

# 2) Theme/Export -> Weiß/Orange konvertieren (stroke #fff, bg #FFA62B)
for f in "$SRC"/*.svg; do
  [ -f "$f" ] || continue
  bn="$(basename "$f")"
  # Theme-Variante (currentColor/--bg) -> fix Weiß/Orange
  sed -E 's/fill="var\(--bg,[^"]+\)"/fill="#FFA62B"/g; s/stroke="currentColor"/stroke="#FFFFFF"/g' \
    "$f" > "$PROJECT/icons_white_orange/$bn"
done

# 3) 1:1 ersetzen (nur gleich benannte Dateien überschreiben)
for f in "$PROJECT/icons_white_orange"/*.svg; do
  base="$(basename "$f")"
  [ -f "$TARGET/$base" ] && cp -f "$f" "$TARGET/$base"
done

# 4) Häufige Namens-Mappings (falls dein Projekt andere alte Namen nutzt)
# -> trag hier weitere Paare ein, falls nötig
declare -A MAP=( ["sleep"]="moon" )
for old in "${!MAP[@]}"; do new="${MAP[$old]}";
  if [ -f "$PROJECT/icons_white_orange/$new.svg" ]; then
    cp -f "$PROJECT/icons_white_orange/$new.svg" "$TARGET/$old.svg"
  fi
done

# 5) Bericht
echo "— Ersetzte Namen (Schnittmenge):"
comm -12 <(ls "$PROJECT/icons_white_orange" | sort) <(ls "$TARGET" | sort) | sed 's/^/  • /'
echo "— Im Projekt vorhanden, aber im neuen Pack (noch) nicht gefunden:"
comm -23 <(ls "$TARGET" | sort) <(ls "$PROJECT/icons_white_orange" | sort) | sed 's/^/  • /'
echo "✅ Fertig."