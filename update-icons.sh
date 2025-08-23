#!/bin/bash

# === 0) Pfade anpassen, falls nötig ===
PROJECT="$HOME/habit-tracker-app"
TARGET_DIR="$PROJECT/src/icons"
ZIP="$HOME/Downloads/icons_white_orange.zip"

# === 1) In Projekt wechseln & Zielordner sicherstellen ===
cd "$PROJECT" || { echo "Projektordner nicht gefunden"; exit 1; }
mkdir -p "$TARGET_DIR"

# === 2) Neues Icon-Pack entpacken ===
if [ ! -f "$ZIP" ]; then
  echo "❌ ZIP-Datei nicht gefunden: $ZIP"
  exit 1
fi

mkdir -p icons_white_orange
unzip -o "$ZIP" -d icons_white_orange > /dev/null

# Falls ZIP die Dateien in Unterordnern enthält
if [ -d icons_white_orange/icons_white_orange ]; then
  mv icons_white_orange/icons_white_orange/* icons_white_orange/ 2>/dev/null || true
fi

# === 3) Backup der alten Icons ===
BACKUP="$PROJECT/backup/icons_$(date +%F_%H%M)"
mkdir -p "$BACKUP"
cp -a "$TARGET_DIR"/*.svg "$BACKUP"/ 2>/dev/null || true
echo "🔒 Backup unter: $BACKUP"

# === 4) 1:1 ersetzbare Icons kopieren ===
for f in icons_white_orange/*.svg; do
  base="$(basename "$f")"
  if [ -f "$TARGET_DIR/$base" ]; then
    cp -f "$f" "$TARGET_DIR/$base"
    echo "  ✓ Ersetzt: $base"
  fi
done

# === 5) Namens-Mapping ===
cat > icon-map.txt <<'EOF'
sleep:moon
alarm:alarm
water:water
coffee:coffee
run:run
book:book
heart:heart
check:check
plus:plus
home:home
shower:shower
bed:bed
phone:phone
email:email
brain:brain
chart:chart
calendar:calendar
search:search
code:code
gym:gym
food:food
meeting:meeting
laptop:laptop
meditation:meditation
star:star
target:target
EOF

while IFS=: read -r OLD NEW; do
  [ -z "$OLD" ] && continue
  if [ -f "icons_white_orange/${NEW}.svg" ]; then
    cp -f "icons_white_orange/${NEW}.svg" "$TARGET_DIR/${OLD}.svg"
  fi
done < icon-map.txt

# === 6) Bericht ===
echo ""
echo "📊 Ersetzte Icons:"
comm -12 <(ls icons_white_orange 2>/dev/null | sort) <(ls "$TARGET_DIR" 2>/dev/null | sort) | sed 's/^/  • /'

echo ""
echo "⚠️  Noch nicht ersetzt:"
comm -23 <(ls "$TARGET_DIR" 2>/dev/null | sort) <(ls icons_white_orange 2>/dev/null | sort) | sed 's/^/  • /'

echo ""
echo "✅ Fertig! Icons wurden aktualisiert."