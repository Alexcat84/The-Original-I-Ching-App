const APP_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app";

module.exports = ({ config }) => ({
  ...config,
  name: "The Original I Ching",
  slug: "the-original-i-ching",
  version: "1.0.0",
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
    package: "com.theoriginaliching.mobile",
    versionCode: 1,
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
  extra: {
    apiUrl: APP_URL,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "864cb513-7d48-44eb-b89f-01cc9ce00043",
    },
  },
});
