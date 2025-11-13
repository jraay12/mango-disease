import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="menu" />

      {/* MENU SCREENS */}
      <Stack.Screen name="mn_recent" />
      <Stack.Screen name="mn_uploads" />
      <Stack.Screen name="mn_help" />
      <Stack.Screen name="mn_about" />
    </Stack>
  );
}
