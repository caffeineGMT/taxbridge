#!/bin/bash

# Bulk replace console.log with logger calls
# Faster approach using sed

set -e

echo "🔍 Replacing console.log with logger.info..."

# Find all TS/TSX files in app/, lib/, components/ (exclude .next, node_modules)
find app lib components -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | while read -r file; do
  # Skip files without console.log
  if ! grep -q "console\.log" "$file" 2>/dev/null; then
    continue
  fi

  echo "Processing: $file"

  # Create backup
  cp "$file" "$file.bak"

  # Replace console.log with logger.info using sed
  # Pattern 1: console.log('message', data) -> logger.info('message', { data })
  # Pattern 2: console.log('message') -> logger.info('message')
  sed -i.tmp "s/console\.log(/logger.info(/g" "$file"

  # Remove temp file
  rm -f "$file.tmp"

  # Add logger import if not present
  if ! grep -q "import.*logger.*from.*@/lib/logger" "$file"; then
    # Find the line number of the last import
    last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)

    if [ -n "$last_import_line" ]; then
      # Insert after last import
      sed -i.tmp "${last_import_line}a\\
import { logger } from '@/lib/logger';
" "$file"
      rm -f "$file.tmp"
    fi
  fi

  echo "  ✅ Updated $file"
done

echo ""
echo "✨ Migration complete!"
echo ""
echo "Checking remaining console.log statements..."
remaining=$(grep -r "console\.log" app lib components --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "Remaining: $remaining"
