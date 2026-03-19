#!/bin/bash

# Batch update all API routes with error handling
# This script adds imports and replaces console.error with handleApiError

set -e

echo "🔧 Batch updating API routes with error handling..."

# Find all route files
ROUTE_FILES=$(find /Users/michaelguo/hivemind-projects/cross-border-tax/app/api -name "route.ts" -type f)

UPDATED=0
SKIPPED=0

for FILE in $ROUTE_FILES; do
  # Skip if already using handleApiError
  if grep -q "handleApiError" "$FILE"; then
    echo "⏭️  Skipping $(basename $(dirname "$FILE"))/route.ts (already updated)"
    ((SKIPPED++))
    continue
  fi

  # Skip if no console.error
  if ! grep -q "console.error" "$FILE"; then
    echo "⏭️  Skipping $(basename $(dirname "$FILE"))/route.ts (no console.error)"
    ((SKIPPED++))
    continue
  fi

  echo "✏️  Updating $(basename $(dirname "$FILE"))/route.ts..."

  # Create backup
  cp "$FILE" "$FILE.backup"

  # Add import after the last existing import (if not already present)
  if ! grep -q "from '@/lib/api-error-handler'" "$FILE"; then
    # Find the line number of the last import
    LAST_IMPORT_LINE=$(grep -n "^import" "$FILE" | tail -1 | cut -d: -f1)

    if [ -n "$LAST_IMPORT_LINE" ]; then
      # Insert the new import after the last import
      sed -i '' "${LAST_IMPORT_LINE}a\\
import { handleApiError } from '@/lib/api-error-handler';
" "$FILE"
    fi
  fi

  # Replace console.error patterns with handleApiError
  # Pattern: console.error(...); return NextResponse.json({ error: ... }, { status: 500 });
  sed -i '' 's/console\.error(\(.*\));[[:space:]]*return NextResponse\.json([[:space:]]*{[[:space:]]*error:/return handleApiError(error, { route: req.nextUrl.pathname, method: req.method }); \/\/ Original: console.error(\1); return NextResponse.json({ error:/g' "$FILE"

  # Pattern: just console.error in catch blocks
  sed -i '' 's/console\.error(/\/\/ console.error(/g' "$FILE"

  ((UPDATED++))
done

echo ""
echo "📊 Summary:"
echo "   Updated: $UPDATED"
echo "   Skipped: $SKIPPED"
echo "   Total: $(echo "$ROUTE_FILES" | wc -l)"
