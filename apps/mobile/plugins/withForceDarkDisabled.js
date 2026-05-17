const { withAndroidStyles } = require("@expo/config-plugins");

// Prevent Android system Force Dark from being applied on top of our explicit theme.
// Without this, on some devices the autofill/autocomplete popup gets double-darkened:
// dark app theme + Force Dark = near-black popup with dark text (unreadable).
function withForceDarkDisabled(config) {
  return withAndroidStyles(config, (modConfig) => {
    const styles = modConfig.modResults;
    const styleArr = styles.resources?.style;
    if (!Array.isArray(styleArr)) return modConfig;

    const appTheme = styleArr.find((s) => s.$?.name === "AppTheme");
    if (!appTheme) return modConfig;

    if (!Array.isArray(appTheme.item)) appTheme.item = [];

    const alreadySet = appTheme.item.some(
      (i) => i.$?.name === "android:forceDarkAllowed"
    );
    if (!alreadySet) {
      appTheme.item.push({
        $: { name: "android:forceDarkAllowed" },
        _: "false",
      });
    }

    return modConfig;
  });
}

module.exports = withForceDarkDisabled;
