#!/usr/bin/env python3
"""
Fix req.method vs request.method inconsistencies in API routes
"""

import os
import re
from pathlib import Path

API_DIR = Path("/Users/michaelguo/hivemind-projects/cross-border-tax/app/api")

stats = {"total": 0, "fixed": 0}


def fix_method_reference(file_path):
    """Fix req.method to match the actual parameter name"""
    with open(file_path, "r") as f:
        content = f.read()

    # Find function signature to get parameter name
    # export async function POST(request: NextRequest)
    func_match = re.search(
        r"export\s+async\s+function\s+(?:POST|GET|PUT|PATCH|DELETE)\s*\(\s*(\w+)\s*:",
        content,
    )

    if not func_match:
        return

    param_name = func_match.group(1)  # e.g., "request" or "req"

    # Check if handleApiError is using wrong parameter name
    wrong_pattern = r"handleApiError\([^,]+,\s*\{\s*route:[^,]+,\s*method:\s*(\w+)\.method"

    matches = list(re.finditer(wrong_pattern, content))
    if not matches:
        return

    modified = False
    for match in matches:
        used_param = match.group(1)
        if used_param != param_name:
            # Replace with correct parameter name
            content = content.replace(
                f"method: {used_param}.method", f"method: {param_name}.method"
            )
            modified = True

    if modified:
        with open(file_path, "w") as f:
            f.write(content)
        print(f"✅ Fixed {file_path.name}: {used_param}.method -> {param_name}.method")
        stats["fixed"] += 1


def main():
    print("🔧 Fixing req.method vs request.method inconsistencies...\n")

    route_files = list(API_DIR.glob("**/route.ts"))
    stats["total"] = len(route_files)

    for file_path in sorted(route_files):
        fix_method_reference(file_path)

    print(f"\n📊 Summary:")
    print(f"   Total files: {stats['total']}")
    print(f"   Fixed: {stats['fixed']}")


if __name__ == "__main__":
    main()
