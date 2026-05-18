const APP_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app";
const ADI_REGISTRATION_TOKEN = process.env.ADI_REGISTRATION_TOKEN || "";

module.exports = ({ config }) => ({
  ...config,
  name: "The Original I Ching",
  slug: "the-original-i-ching",
  version: "3.2.5",
  scheme: "theoriginaliching",
  orientation: "portrait",
  platforms: ["android"],
  userInterfaceStyle: "dark",
  backgroundColor: "#0c0f14",
  androidStatusBar: {
    barStyle: "light-content",
    backgroundColor: "#0c0f14",
    translucent: false,
  },
  splash: {
    backgroundColor: "#0c0f14",
    resizeMode: "contain",
  },
  android: {
    package: "com.theoriginaliching.app",
    versionCode: 18,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    buildToolsVersion: "35.0.0",
    // Prevent restoring stale auth/webview state after reinstall from Android backup.
    allowBackup: false,
    backgroundColor: "#0c0f14",
    // P7: Required by Google Play Store listing
    privacyPolicyUrl: "https://theoriginaliching.com/privacy",
    adaptiveIcon: {
      backgroundColor: "#0c0f14",
    },
    permissions: [
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.READ_EXTERNAL_STORAGE",
    ],
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: false,
        data: [
          {
            scheme: "theoriginaliching",
            host: "auth",
            pathPrefix: "/callback",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
      {
        action: "VIEW",
        autoVerify: false,
        data: [
          {
            scheme: "rc-340e77bf41",
          },
        ],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          buildToolsVersion: "35.0.0",
          enableProguardInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
        },
      },
    ],
    "./plugins/withProguardRules",
    "./plugins/withForceDarkDisabled",
    [
      "./plugins/withAdiRegistrationFile",
      {
        token: ADI_REGISTRATION_TOKEN,
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#0c0f14",
        resizeMode: "contain",
        dark: {
          backgroundColor: "#0c0f14",
          resizeMode: "contain",
        },
      },
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Necesitamos acceso a tu galería para guardar imágenes.",
        savePhotosPermission: "Necesitamos permiso para guardar imágenes en tu galería.",
        isAccessMediaLocationEnabled: true,
      },
    ],
    "expo-secure-store",
  ],
  /* Consumed at runtime via expo-constants in app/index.tsx (WebView BASE_URL). */
  extra: {
    apiUrl: APP_URL,
    eas: {
      projectId: "0d7699fd-9b1d-4bc0-a6f3-4b79df9d4de6",
    },
  },
});
