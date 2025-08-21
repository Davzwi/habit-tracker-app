#!/bin/bash

# GitHub Upload Script für habit-tracker-app
# Ersetze YOUR_GITHUB_USERNAME mit deinem GitHub Benutzernamen

echo "📦 Habit Tracker App zu GitHub hochladen"
echo "========================================="
echo ""
echo "Bitte gib deinen GitHub Benutzernamen ein:"
read GITHUB_USERNAME

echo ""
echo "🔗 Verbinde mit GitHub Repository..."
git remote add origin https://github.com/$GITHUB_USERNAME/habit-tracker-app.git

echo "📤 Lade Code zu GitHub hoch..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Fertig! Deine App ist jetzt auf GitHub:"
echo "   https://github.com/$GITHUB_USERNAME/habit-tracker-app"
echo ""
echo "🌐 Du kannst GitHub Pages aktivieren für eine Live-Demo:"
echo "   1. Gehe zu Settings → Pages"
echo "   2. Source: Deploy from a branch"
echo "   3. Branch: main, Folder: / (root)"
echo "   4. Save"
echo ""
echo "   Deine App wird dann verfügbar sein unter:"
echo "   https://$GITHUB_USERNAME.github.io/habit-tracker-app"