#!/usr/bin/env bash
# Pre-release checklist — The Original I Ching App
# Run from repo root (Git Bash / WSL on Windows).

set -euo pipefail

echo "=== Pre-release checklist ==="
echo ""
echo "1. Bump apps/mobile/app.config.js"
echo "   - version (versionName)"
echo "   - android.versionCode"
echo ""
echo "2. Update changelog"
echo "   node scripts/update-changelog.js \\"
echo "     --version X.Y.Z \\"
echo "     --versionCode N \\"
echo "     --stage \"Internal Testing|Closed Testing|Production\""
echo ""
echo "3. Verify repo"
echo "   npm run typecheck"
echo "   npm run i18n:audit"
echo ""
echo "4. Build Android artifact (local or EAS)"
echo "   cd apps/mobile && node scripts/assemble-android-release.js"
echo "   # or: eas build --platform android --profile preview"
echo ""
echo "5. Commit and push"
echo "   git add CHANGELOG.md apps/mobile/app.config.js"
echo "   git commit -m \"chore(release): vX.Y.Z (versionCode N)\""
echo "   git push origin staging"
echo ""
echo "6. Merge staging → main after CI green"
echo ""
echo "7. Upload AAB/APK to Google Play Console"
echo ""

if [[ "${1:-}" == "--run-checks" ]]; then
  echo "Running typecheck and i18n audit..."
  npm run typecheck
  npm run i18n:audit
  echo "Checks passed."
fi
