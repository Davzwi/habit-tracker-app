grep -RIn \
  --include='*.html' --include='*.htm' \
  --include='*.js' --include='*.jsx' \
  --include='*.ts' --include='*.tsx' \
  --include='*.vue' --include='*.svelte' \
  --include='*.md' --include='*.css' \
  -E 'src=("|\x27)[^"'\''>]*\.svg|<use href=|data:image/svg\+xml|<svg|url\([^)]+\.svg' .