import "../global.css";
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ScreenProvider from "../providers/ScreenProvider";
import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import { RequestsProvider } from "@/providers/RequestProvider";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";

const AppLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // No hacer nada mientras está cargando o navegando
    if (isLoading || isNavigating) {
      return;
    }

    // Esperar a que segments esté listo
    if (segments.length === 0) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inMasterGroup = segments[0] === "(master)";
    const inAdminGroup = segments[0] === "(admin)";
    const inAppGroup = segments[0] === "(app)";

    // Usuario NO autenticado
    if (!isAuthenticated) {
      if (!inAuthGroup) {
        console.log("🚫 No autenticado → /auth");
        setIsNavigating(true);
        setTimeout(() => {
          router.replace("/(auth)");
          setIsNavigating(false);
        }, 100);
      }
      return;
    }

    // Usuario autenticado - verificar si está en la ruta correcta
    const shouldBeInMaster = user?.isMaster === true;
    const shouldBeInAdmin = !user?.isMaster && user?.isAdmin === true;
    const shouldBeInApp = !user?.isMaster && !user?.isAdmin;

    // Verificar si ya está en la ruta correcta
    if (shouldBeInMaster && inMasterGroup) return;
    if (shouldBeInAdmin && inAdminGroup) return;
    if (shouldBeInApp && inAppGroup) return;

    // Redirigir a la ruta correcta
    console.log("🔁 Redirigiendo según rol de usuario");
    setIsNavigating(true);

    setTimeout(() => {
      if (shouldBeInMaster) {
        router.replace("/(master)");
      } else if (shouldBeInAdmin) {
        router.replace("/(admin)");
      } else {
        router.replace("/(app)/(tabs)");
      }
      setIsNavigating(false);
    }, 100);
  }, [
    isAuthenticated,
    isLoading,
    user?.isMaster,
    user?.isAdmin,
    segments,
    isNavigating,
  ]);

  // Mostrar loading mientras carga o navega
  if (isLoading || isNavigating) {
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
