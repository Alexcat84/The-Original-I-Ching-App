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
  splash: {
    backgroundColor: "#0c0f14",
    resizeMode: "contain",
  },
  android: {
    package: "com.theoriginaliching.app",
    versionCode: 1,
    backgroundColor: "#0c0f14",
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
        autoVerify: true,
        data: [
          {
            scheme: "theoriginaliching",
            host: "auth",
            pathPrefix: "/callback",
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
      projectId: process.env.EAS_PROJECT_ID || "0d7699fd-9b1d-4bc0-a6f3-4b79df9d4de6",
    },
  },
});
