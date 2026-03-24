import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: "#0c0f14" }, headerTintColor: "#c9a227" }} />
    </>
  );
}
