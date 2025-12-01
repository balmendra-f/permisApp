import "../global.css";
import { useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ScreenProvider from "../providers/ScreenProvider";
import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import { RequestsProvider } from "@/providers/RequestProvider";
import { useEffect } from "react";
import { ActivityIndicator, View, StatusBar } from "react-native";
import { Stack } from "expo-router";
import { LogBox } from "react-native";
import { Colors } from "@/constants/Colors";

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
      ? "/(master)"
      : user?.isAdmin
      ? "/(admin)"
      : "/(app)/(tabs)";

    if (!destination.startsWith(`/${currentGroup}`)) {
      router.replace(destination);
    }
  }, [isAuthenticated, isLoading, user?.isMaster, user?.isAdmin, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.light.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        <Stack.Screen name="(app)" options={{ animation: "fade" }} />
        <Stack.Screen name="(admin)" options={{ animation: "fade" }} />
        <Stack.Screen name="(master)" options={{ animation: "fade" }} />
      </Stack>
    </>
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
