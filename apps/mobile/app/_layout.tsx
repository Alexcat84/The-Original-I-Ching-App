import * as Sentry from "@sentry/react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { Component, type ReactNode, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SystemBars } from "react-native-edge-to-edge";
import { SafeAreaProvider } from "react-native-safe-area-context";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || "",
  debug: __DEV__,
});

SplashScreen.preventAutoHideAsync();

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: string | null;
}

class GlobalErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: null };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("[ErrorBoundary] Uncaught JS error:", error.message);
    console.error("[ErrorBoundary] Stack:", error.stack);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    this.setState({ errorInfo: info.componentStack });
  }

  render() {
    const { error, errorInfo } = this.state;
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView contentContainerStyle={styles.errorScroll}>
            <Text style={styles.errorTitle}>JS Crash</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {__DEV__ && (
              <>
                <Text style={styles.errorLabel}>Stack:</Text>
                <Text style={styles.errorStack}>{error.stack}</Text>
                {errorInfo && (
                  <>
                    <Text style={styles.errorLabel}>Component tree:</Text>
                    <Text style={styles.errorStack}>{errorInfo}</Text>
                  </>
                )}
              </>
            )}
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => this.setState({ error: null, errorInfo: null })}
            >
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function Layout() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 10_000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (__DEV__ && typeof window !== "undefined") {
      import("eruda").then((m) => m.default.init());
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <SystemBars style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0c0f14" },
            animation: "none",
          }}
        />
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#0c0f14",
    paddingTop: 60,
  },
  errorScroll: {
    padding: 20,
  },
  errorTitle: {
    color: "#ff4444",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorMessage: {
    color: "#ff8888",
    fontSize: 15,
    marginBottom: 16,
  },
  errorLabel: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 4,
  },
  errorStack: {
    color: "#666",
    fontSize: 11,
    fontFamily: "monospace",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#1a1f2e",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
  },
});
