#!/usr/bin/env python3
"""
Batch update all API routes with proper error handling
Adds handleApiError import and replaces console.error with proper Sentry logging
"""

import os
import re
from pathlib import Path

API_DIR = Path("/Users/michaelguo/hivemind-projects/cross-border-tax/app/api")
DRY_RUN = False

stats = {"total": 0, "updated": 0, "skipped": 0}


def get_route_path(file_path):
    """Extract route path from file path"""
    # /app/api/stripe/checkout/route.ts -> /api/stripe/checkout
    parts = str(file_path).split("/app/api/")
    if len(parts) > 1:
        route = "/api/" + parts[1].replace("/route.ts", "")
        return route
    return "/api/unknown"


def update_route_file(file_path):
    """Update a single route file with error handling"""
    with open(file_path, "r") as f:
        content = f.read()
        original = content

    # Skip if already using handleApiError
    if "handleApiError" in content:
        print(f"⏭️  Skipping {file_path.name} (already updated)")
        stats["skipped"] += 1
        return

    # Skip if no console.error
    if "console.error" not in content:
        print(f"⏭️  Skipping {file_path.name} (no console.error)")
        stats["skipped"] += 1
        return

    modified = False

    # Add import if not present
    if "from '@/lib/api-error-handler'" not in content:
        # Find last import line
        import_lines = [
            i
            for i, line in enumerate(content.split("\n"))
            if line.strip().startswith("import ")
        ]

        if import_lines:
            last_import_idx = import_lines[-1]
            lines = content.split("\n")
            lines.insert(
                last_import_idx + 1,
                "import { handleApiError } from '@/lib/api-error-handler';",
            )
            content = "\n".join(lines)
            modified = True

    # Replace console.error in catch blocks
    # Pattern 1: console.error followed by return NextResponse.json with status 500
    pattern1 = r"(catch\s*\([^)]+\)\s*\{)\s*console\.error\([^;]+;[\s\n]*return NextResponse\.json\(\s*\{\s*error:[^}]+\},\s*\{\s*status:\s*5\d{2}\s*\}\s*\);"

    def replace_catch_500(match):
        route = get_route_path(file_path)
        return f"{match.group(1)}\n    return handleApiError(error, {{ route: '{route}', method: req.method }});"

    if re.search(pattern1, content):
        content = re.sub(pattern1, replace_catch_500, content)
        modified = True

    # Pattern 2: console.error followed by return NextResponse.json with other status codes
    pattern2 = r"console\.error\([^;]+;"
    if re.search(pattern2, content) and "catch" in content:
        # Comment out remaining console.error calls
        content = re.sub(
            r"(\s+)console\.error\(", r"\1// console.error(", content
        )
        modified = True

    if modified and not DRY_RUN:
        with open(file_path, "w") as f:
            f.write(content)
        print(f"✅ Updated {file_path.name}")
        stats["updated"] += 1
    elif modified and DRY_RUN:
        print(f"[DRY RUN] Would update {file_path.name}")
        stats["updated"] += 1
    else:
        stats["skipped"] += 1


def main():
    print("🔍 Finding API route files...\n")

    route_files = list(API_DIR.glob("**/route.ts"))
    stats["total"] = len(route_files)

    print(f"Found {len(route_files)} API route files\n")

    if DRY_RUN:
        print("🏃 Running in DRY RUN mode (no files will be modified)\n")

    for file_path in sorted(route_files):
        update_route_file(file_path)

    print(f"\n📊 Summary:")
    print(f"   Total files: {stats['total']}")
    print(f"   Updated: {stats['updated']}")
    print(f"   Skipped: {stats['skipped']}")


if __name__ == "__main__":
    main()
