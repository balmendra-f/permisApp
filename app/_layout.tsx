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
import { useThemeConfig } from "@/hooks/useThemeConfig";
import { useColorScheme } from "nativewind";

const AppLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();
  const { colorScheme } = useColorScheme();

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
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colorScheme === 'dark' ? '#020617' : '#f8fafc'}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
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

const RootLayout = () => {
  const { isLoaded } = useThemeConfig();

  if (!isLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ScreenProvider>
          <RequestsProvider>
            <View className="flex-1 bg-background">
              <AppLayout />
            </View>
          </RequestsProvider>
        </ScreenProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default RootLayout;
