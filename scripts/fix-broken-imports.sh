#!/bin/bash

# Fix broken imports caused by logger insertion
# Pattern: import {
#          import { logger } from '@/lib/logger';
#          actualImport

echo "🔧 Fixing broken import statements..."

# Get list of files with broken imports
files=$(grep -r "^import {$" app/ lib/ components/ --include="*.ts" --include="*.tsx" 2>/dev/null | cut -d: -f1 | sort -u)

count=0
for file in $files; do
  # Check if file has the broken pattern
  if grep -q "^import {$" "$file"; then
    # This is a complex fix - we need to move the logger import out of the multiline import
    # and place it before the multiline import starts

    # Create a backup
    cp "$file" "$file.bak2"

    # Use awk to fix the file
    awk '
      /^import {$/ {
        # Start of multiline import
        in_import = 1
        import_start = NR
        multiline_import = $0 "\n"
        next
      }
      in_import && /^import { logger } from / {
        # Found logger import in middle of multiline import - save it
        logger_import = $0
        next
      }
      in_import && /^}/ {
        # End of multiline import
        # Print logger import before the multiline import
        if (logger_import) {
          print logger_import
        }
        # Print the multiline import
        printf "%s", multiline_import
        print
        logger_import = ""
        multiline_import = ""
        in_import = 0
        next
      }
      in_import {
        # Continuation of multiline import
        multiline_import = multiline_import $0 "\n"
        next
      }
      {
        # Normal line
        print
      }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

    echo "  ✅ Fixed: $file"
    ((count++))
  fi
done

echo ""
echo "✨ Fixed $count files"
