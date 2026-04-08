import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  useEffect(() => {
    // Splash screen will be hidden by the WebView screen once loaded.
    // Safety fallback: hide after 10s in case of network issues.
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 10_000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0c0f14" translucent={false} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0c0f14" },
          animation: "none",
        }}
      />
    </SafeAreaProvider>
  );
}
