#!/usr/bin/env node

/**
 * Script to add error handling to all API routes
 * Replaces console.error with handleApiError from lib/api-error-handler.ts
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const API_DIR = path.join(__dirname, '../app/api');
const DRY_RUN = process.argv.includes('--dry-run');

// Statistics
let stats = {
  total: 0,
  updated: 0,
  skipped: 0,
  errors: 0,
};

async function updateRouteFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;

    // Skip if already using handleApiError
    if (content.includes('handleApiError')) {
      console.log(`⏭️  Skipping ${filePath} (already using handleApiError)`);
      stats.skipped++;
      return;
    }

    // Check if file has try/catch blocks
    const hasTryCatch = content.includes('try {') && content.includes('catch');

    if (!hasTryCatch) {
      console.log(`⚠️  Skipping ${filePath} (no try/catch blocks)`);
      stats.skipped++;
      return;
    }

    // Add import if not present
    if (!content.includes("from '@/lib/api-error-handler'")) {
      // Find the last import statement
      const importRegex = /^import .+ from .+;$/gm;
      const imports = content.match(importRegex);

      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const afterLastImport = lastImportIndex + lastImport.length;

        // Insert new import after last import
        content =
          content.slice(0, afterLastImport) +
          "\nimport { handleApiError } from '@/lib/api-error-handler';" +
          content.slice(afterLastImport);
        modified = true;
      }
    }

    // Replace console.error patterns in catch blocks with handleApiError
    // Pattern 1: console.error followed by return NextResponse.json
    const pattern1 = /catch\s*\(([^)]+)\)\s*{\s*console\.error\([^;]+;\s*return\s+NextResponse\.json\(\s*{\s*error:[^}]+}\s*,\s*{\s*status:\s*(\d+)\s*}\s*\);/gs;

    if (pattern1.test(content)) {
      content = content.replace(
        pattern1,
        (match, errorVar, statusCode) => {
          const route = getRouteFromPath(filePath);
          const method = getMethodFromContent(originalContent);
          return `catch (${errorVar}) {\n    return handleApiError(${errorVar}, { route: '${route}', method: '${method}' });`;
        }
      );
      modified = true;
    }

    // Pattern 2: Just console.error in catch block
    const pattern2 = /catch\s*\(([^)]+)\)\s*{\s*console\.error\(([^;]+)\);?\s*\n?\s*return NextResponse\.json\(/gs;

    if (pattern2.test(content)) {
      const route = getRouteFromPath(filePath);
      const method = getMethodFromContent(originalContent);

      content = content.replace(
        /catch\s*\(([^)]+)\)\s*{\s*console\.error\([^;]+;\s*/g,
        (match, errorVar) => `catch (${errorVar}) {\n    `
      );
      modified = true;
    }

    // Write file if modified
    if (modified) {
      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${filePath}`);
      } else {
        console.log(`[DRY RUN] Would update ${filePath}`);
      }
      stats.updated++;
    } else {
      stats.skipped++;
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

function getRouteFromPath(filePath) {
  // Extract route from file path
  // e.g., /app/api/stripe/checkout/route.ts -> /api/stripe/checkout
  const match = filePath.match(/\/app\/(api\/.+)\/route\.ts$/);
  return match ? `/${match[1]}` : '/api/unknown';
}

function getMethodFromContent(content) {
  // Try to detect HTTP method from export
  if (content.includes('export async function POST')) return 'POST';
  if (content.includes('export async function GET')) return 'GET';
  if (content.includes('export async function PUT')) return 'PUT';
  if (content.includes('export async function PATCH')) return 'PATCH';
  if (content.includes('export async function DELETE')) return 'DELETE';
  return 'POST'; // Default
}

async function main() {
  console.log('🔍 Finding API route files...\n');

  const files = glob.sync(`${API_DIR}/**/route.ts`);
  stats.total = files.length;

  console.log(`Found ${files.length} API route files\n`);

  if (DRY_RUN) {
    console.log('🏃 Running in DRY RUN mode (no files will be modified)\n');
  }

  for (const file of files) {
    await updateRouteFile(file);
  }

  console.log('\n📊 Summary:');
  console.log(`   Total files: ${stats.total}`);
  console.log(`   Updated: ${stats.updated}`);
  console.log(`   Skipped: ${stats.skipped}`);
  console.log(`   Errors: ${stats.errors}`);
}

main().catch(console.error);
