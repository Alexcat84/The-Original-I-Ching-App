#!/usr/bin/env bash
# Pre-release checklist — The Original I Ching App
# Run from repo root (Git Bash / WSL on Windows).

set -euo pipefail

echo "=== Pre-release checklist ==="
echo ""
echo "1. Bump apps/mobile/app.config.js"
echo "   - version (versionName)"
echo "   - android.versionCode (Play Store)"
echo "   - ios.buildNumber (App Store — must strictly increase)"
echo ""
echo "2. Update changelog"
echo "   node scripts/update-changelog.js \\"
echo "     --version X.Y.Z \\"
echo "     --versionCode N \\"
echo "     --buildNumber M \\"
echo "     --stage \"Internal Testing|Closed Testing|Production\""
echo "   # Omit --buildNumber for Android-only releases"
echo ""
echo "3. Verify repo"
echo "   npm run typecheck"
echo "   npm run i18n:audit"
echo ""
echo "4. Build Android artifact via EAS"
echo "   cd apps/mobile && npx eas build --platform android --profile staging-aab"
echo "   # APK for testing: --profile preview"
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
echo "8. iOS (when applicable)"
echo "   cd apps/mobile && npx eas build --platform ios --profile preview"
echo "   # Production: --profile production"
echo "   Update docs/00000000-OPS-IOS-01-app-store-changelog.md What's New copy"
echo ""

if [[ "${1:-}" == "--run-checks" ]]; then
  echo "Running typecheck and i18n audit..."
  npm run typecheck
  npm run i18n:audit
  echo "Checks passed."
fi
