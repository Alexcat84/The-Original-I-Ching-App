const APP_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app";
const ADI_REGISTRATION_TOKEN = process.env.ADI_REGISTRATION_TOKEN || "";

module.exports = ({ config }) => ({
  ...config,
  name: "The Original I Ching",
  slug: "the-original-i-ching",
  version: "4.2.4",
  scheme: "theoriginaliching",
  orientation: "portrait",
  platforms: ["android"],
  userInterfaceStyle: "dark",
  backgroundColor: "#0c0f14",
  // New Architecture is mandatory since RN 0.82 / Expo SDK 55; SDK 57 (RN 0.86)
  // has no legacy option. See docs/auditorias/20260715-AUD-MOB-01.
  newArchEnabled: true,
  androidStatusBar: {
    barStyle: "light-content",
  },
  androidNavigationBar: {
    barStyle: "light-content",
  },
  splash: {
    image: "./assets/logo.png",
    backgroundColor: "#0c0f14",
    resizeMode: "contain",
  },
  android: {
    package: "com.theoriginaliching.app",
    versionCode: 64,
    // Prevent restoring stale auth/webview state after reinstall from Android backup.
    allowBackup: false,
    backgroundColor: "#0c0f14",
    // P7: Required by Google Play Store listing
    privacyPolicyUrl: "https://theoriginaliching.com/privacy",
    icon: "./assets/icon.png",
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#0c0f14",
    },
    permissions: ["android.permission.WRITE_EXTERNAL_STORAGE"],
    blockedPermissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_MEDIA_VIDEO",
      "android.permission.READ_MEDIA_VISUAL_USER_SELECTED",
      "android.permission.ACCESS_MEDIA_LOCATION",
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
      "react-native-edge-to-edge",
      {
        android: {
          parentTheme: "Default",
          enforceNavigationBarContrast: false,
        },
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          // No SDK pins: Expo SDK 57 defaults to compile/target API 36 (Android 16),
          // which is the Play requirement for updates from 2026-08-31. Pinning 35
          // here would silently defeat the whole migration.
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
        image: "./assets/logo.png",
        imageWidth: 200,
        backgroundColor: "#0c0f14",
        resizeMode: "contain",
        dark: {
          image: "./assets/logo.png",
          imageWidth: 200,
          backgroundColor: "#0c0f14",
          resizeMode: "contain",
        },
      },
    ],
    [
      "expo-media-library",
      {
        savePhotosPermission: "Necesitamos permiso para guardar imágenes en tu galería.",
        isAccessMediaLocationEnabled: false,
      },
    ],
    "expo-secure-store",
  ],
  /* Consumed at runtime via expo-constants in app/index.tsx (WebView BASE_URL). */
  extra: {
    apiUrl: APP_URL,
    androidCloudProjectNumber: 564428602412,
    eas: {
      projectId: "0d7699fd-9b1d-4bc0-a6f3-4b79df9d4de6",
    },
  },
});
