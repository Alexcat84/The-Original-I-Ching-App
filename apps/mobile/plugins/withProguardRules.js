const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

// Keep rules appended to android/app/proguard-rules.pro on every prebuild.
// The android/ dir is gitignored, so this plugin is the source of truth.
// Covers all native libraries used in the app + the Amazon AppStore SDK
// (bundled transitively by react-native-purchases) which caused startup crashes
// when R8 marked its methods as unreachable (commit 985b70d).
const KEEP_RULES = `
# ─── React Native core ────────────────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

# ─── React Native TurboModules / New Architecture ────────────────────────────
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# ─── Hermes engine ────────────────────────────────────────────────────────────
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.hermes.intl.** { *; }

# ─── Reanimated ───────────────────────────────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# ─── Expo modules core ────────────────────────────────────────────────────────
-keep class expo.modules.** { *; }
-keep class expo.core.** { *; }
-keep class expo.interfaces.** { *; }
-dontwarn expo.modules.**
-dontwarn expo.core.**

# ─── Expo individual modules ──────────────────────────────────────────────────
-keep class expo.modules.securestore.** { *; }
-keep class expo.modules.medialibrary.** { *; }
-keep class expo.modules.filesystem.** { *; }
-keep class expo.modules.sharing.** { *; }
-keep class expo.modules.localization.** { *; }
-keep class expo.modules.splashscreen.** { *; }
-keep class expo.modules.constants.** { *; }
-keep class expo.modules.application.** { *; }
-keep class expo.modules.linking.** { *; }

# ─── react-native-webview ─────────────────────────────────────────────────────
-keep class com.reactnativecommunity.webview.** { *; }
-dontwarn com.reactnativecommunity.webview.**

# ─── react-native-screens ─────────────────────────────────────────────────────
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# ─── react-native-safe-area-context ───────────────────────────────────────────
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.th3rdwave.safeareacontext.**

# ─── react-native-purchases (RevenueCat) ──────────────────────────────────────
-keep class com.revenuecat.purchases.** { *; }
-keep class com.reactlibrary.** { *; }
-dontwarn com.revenuecat.purchases.**
-keep class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# ─── Amazon AppStore SDK (transitive via react-native-purchases) ──────────────
# R8 warns about non-linear control flow in this SDK's bytecode — without this
# keep rule, R8 marks those methods as unreachable and removes them, causing a
# startup crash. This was the root cause fixed by commit 985b70d (which disabled
# proguard entirely as a workaround). The keep rule is the proper fix.
-keep class com.amazon.** { *; }
-dontwarn com.amazon.**

# ─── @sentry/react-native ─────────────────────────────────────────────────────
-keep class io.sentry.** { *; }
-keep class io.sentry.react.** { *; }
-dontwarn io.sentry.**
-keepattributes LineNumberTable,SourceFile
-renamesourcefileattribute SourceFile

# ─── AsyncStorage ─────────────────────────────────────────────────────────────
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ─── OkHttp (React Native networking) ────────────────────────────────────────
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**

# ─── Kotlin & Coroutines ──────────────────────────────────────────────────────
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keep class kotlinx.coroutines.** { *; }
-dontwarn kotlinx.coroutines.**

# ─── JSI / SoLoader ───────────────────────────────────────────────────────────
-keep class com.facebook.soloader.** { *; }
-dontwarn com.facebook.soloader.**

# ─── Fresco (image pipeline used by RN) ──────────────────────────────────────
-keep class com.facebook.imagepipeline.** { *; }
-keep class com.facebook.drawee.** { *; }
-dontwarn com.facebook.imagepipeline.**
-dontwarn com.facebook.drawee.**

# ─── Reflect-based access ─────────────────────────────────────────────────────
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp *;
    @com.facebook.react.uimanager.annotations.ReactPropGroup *;
}
-keepclassmembers class * {
    @android.webkit.JavascriptInterface *;
}
`;

function withProguardRules(config) {
  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const projectRoot = modConfig.modRequest.projectRoot;
      const proguardPath = path.join(
        projectRoot,
        "android",
        "app",
        "proguard-rules.pro"
      );

      const marker = "# ─── React Native core";
      let existing = fs.existsSync(proguardPath)
        ? fs.readFileSync(proguardPath, "utf8")
        : "";

      // Avoid duplicating the block on repeated prebuilds.
      if (!existing.includes(marker)) {
        fs.writeFileSync(proguardPath, existing + KEEP_RULES, "utf8");
      }

      return modConfig;
    },
  ]);
}

module.exports = withProguardRules;
