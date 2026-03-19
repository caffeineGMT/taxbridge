#!/usr/bin/env python3
"""
Fix broken imports where handleApiError import was inserted inside multi-line imports
"""

import os
import re
from pathlib import Path

API_DIR = Path("/Users/michaelguo/hivemind-projects/cross-border-tax/app/api")

stats = {"total": 0, "fixed": 0}


def fix_broken_imports(file_path):
    """Fix broken imports where handleApiError was inserted incorrectly"""
    with open(file_path, "r") as f:
        content = f.read()

    # Pattern: import { \n import { handleApiError
    # This means handleApiError was inserted inside a multi-line import
    if "import {\nimport { handleApiError" in content or "import {\r\nimport { handleApiError" in content:
        # Remove the incorrectly placed import
        content = re.sub(
            r"\nimport { handleApiError } from '@/lib/api-error-handler';",
            "",
            content,
        )

        # Find the end of all imports and add it there
        # Find the last line that starts with "import" or ends with "} from"
        lines = content.split("\n")
        last_import_idx = -1

        for i, line in enumerate(lines):
            if line.strip().startswith("import ") or line.strip().endswith("} from '@/lib/api/auth/api-keys';") or "from '@/lib" in line or "from 'next/server'" in line:
                # Make sure this line is not inside a comment or string
                if not line.strip().startswith("//"):
                    last_import_idx = i

        if last_import_idx >= 0:
            lines.insert(
                last_import_idx + 1,
                "import { handleApiError } from '@/lib/api-error-handler';",
            )
            content = "\n".join(lines)

            with open(file_path, "w") as f:
                f.write(content)

            print(f"✅ Fixed {file_path.name}")
            stats["fixed"] += 1
            return True

    return False


def main():
    print("🔧 Fixing broken imports...\n")

    route_files = list(API_DIR.glob("**/route.ts"))
    stats["total"] = len(route_files)

    for file_path in sorted(route_files):
        fix_broken_imports(file_path)

    print(f"\n📊 Summary:")
    print(f"   Total files: {stats['total']}")
    print(f"   Fixed: {stats['fixed']}")


if __name__ == "__main__":
    main()
