#!/usr/bin/env node

/**
 * Automated script to replace all console.log with structured Pino logging
 * SECURITY: Prevents PII exposure in browser console (GDPR/CCPA violation)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to skip (test files, scripts, build output)
const SKIP_PATTERNS = [
  /node_modules/,
  /\.next/,
  /out/,
  /dist/,
  /build/,
  /scripts\/.*\.ts$/, // Allow scripts to keep console.log for CLI output
  /scripts\/.*\.js$/,
  /\.test\./,
  /\.spec\./,
];

// Get all TypeScript/JavaScript files with console.log
function getFilesWithConsoleLog() {
  try {
    const result = execSync(
      'find . -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\) -exec grep -l "console\\.log" {} \\; 2>/dev/null',
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    return result
      .split('\n')
      .filter(Boolean)
      .filter(file => !SKIP_PATTERNS.some(pattern => pattern.test(file)));
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
}

// Replace console.log with logger calls
function replaceConsoleLogInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let hasChanges = false;
  let addedImport = false;

  // Check if logger is already imported
  const hasLoggerImport = /import.*logger.*from.*['"]@\/lib\/logger['"]/.test(content);

  // Replace console.log patterns
  const patterns = [
    // console.log('message', data)
    {
      regex: /console\.log\((['"`])(.*?)\1,\s*(\{[^}]*\}|\w+)\)/g,
      replacement: (match, quote, message, data) => {
        hasChanges = true;
        return `logger.info('${message}', ${data})`;
      }
    },
    // console.log('message')
    {
      regex: /console\.log\((['"`])(.*?)\1\)/g,
      replacement: (match, quote, message) => {
        hasChanges = true;
        return `logger.info('${message}')`;
      }
    },
    // console.log(variable)
    {
      regex: /console\.log\((\w+)\)/g,
      replacement: (match, variable) => {
        hasChanges = true;
        return `logger.debug('Debug output', { data: ${variable} })`;
      }
    },
    // console.log with template literals
    {
      regex: /console\.log\(`([^`]*)`\)/g,
      replacement: (match, message) => {
        hasChanges = true;
        // Extract variables from template literal
        const hasVars = /\$\{.*\}/.test(message);
        if (hasVars) {
          return `logger.info(\`${message}\`)`;
        }
        return `logger.info('${message}')`;
      }
    },
  ];

  patterns.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  if (hasChanges && !hasLoggerImport) {
    // Add logger import at the top (after existing imports)
    const importStatement = "import { logger } from '@/lib/logger';\n";

    // Find the last import statement
    const importRegex = /import\s+.*?from\s+['"].*?['"];?\n/g;
    const imports = content.match(importRegex);

    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      content = content.slice(0, lastImportIndex + lastImport.length) +
                importStatement +
                content.slice(lastImportIndex + lastImport.length);
    } else {
      // No imports found, add at the top
      content = importStatement + content;
    }

    addedImport = true;
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { changed: true, addedImport };
  }

  return { changed: false, addedImport: false };
}

// Main execution
function main() {
  console.log('🔍 Scanning for console.log statements...\n');

  const files = getFilesWithConsoleLog();
  console.log(`Found ${files.length} files with console.log\n`);

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  files.forEach(file => {
    try {
      const result = replaceConsoleLogInFile(file);
      if (result.changed) {
        processedCount++;
        const importMsg = result.addedImport ? ' (+ import)' : '';
        console.log(`✅ ${file}${importMsg}`);
      } else {
        skippedCount++;
        console.log(`⏭️  ${file} (no changes)`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ ${file}: ${error.message}`);
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Processed: ${processedCount} files`);
  console.log(`   Skipped: ${skippedCount} files`);
  console.log(`   Errors: ${errorCount} files`);
  console.log(`\n✨ Migration complete!`);
}

main();
