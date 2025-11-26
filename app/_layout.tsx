import "../global.css";
import { useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ScreenProvider from "../providers/ScreenProvider";
import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import { RequestsProvider } from "@/providers/RequestProvider";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { LogBox } from "react-native";

const AppLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();
  LogBox.ignoreAllLogs(true);

  useEffect(() => {
    if (isLoading || segments.length === 0) return;

    const currentGroup = segments[0];

    if (!isAuthenticated) {
      if (currentGroup !== "(auth)") router.replace("/(auth)");
      return;
    }

    const destination = user?.isMaster
      ? "/(master)/(tabs)"
      : user?.isAdmin
      ? "/(admin)/(tabs)"
      : "/(app)/(tabs)";

    if (!destination.startsWith(`/${currentGroup}`)) {
      router.replace(destination);
    }
  }, [isAuthenticated, isLoading, user?.isMaster, user?.isAdmin, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(master)" />
    </Stack>
  );
};

const RootLayout = () => (
  <SafeAreaProvider>
    <AuthProvider>
      <ScreenProvider>
        <RequestsProvider>
          <AppLayout />
        </RequestsProvider>
      </ScreenProvider>
    </AuthProvider>
  </SafeAreaProvider>
);

export default RootLayout;
