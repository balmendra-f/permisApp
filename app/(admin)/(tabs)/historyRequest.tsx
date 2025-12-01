import { useAuth } from "@/providers/AuthProvider";
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { Ionicons } from "@expo/vector-icons";

interface User {
  id: string;
  vacationsInDays: number;
  vacationUsedInDays: number;
  administrativeDays: number;
  timeReturnsInHours: number;
}

const LeaveBalanceScreen = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(user as any);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, "users", user.id);

    // 🔄 escuchar en tiempo real cambios del usuario
    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data() as any);
      }
    });

    return () => unsubscribe();
  }, [user]);

  if (!userData) return null;

  const leaveData = {
    vacations: {
      available: userData.vacationsInDays - userData.vacationUsedInDays,
      used: userData.vacationUsedInDays,
      total: userData.vacationsInDays,
    },
    adminDays: userData.administrativeDays,
    timeReturns: userData.timeReturnsInHours,
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "blue",
    progress,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: "blue" | "emerald" | "amber";
    progress?: { used: number; available: number; total: number };
  }) => {
    const colorConfig = {
      blue: {
        bg: "bg-indigo-500",
        light: "bg-indigo-500/10",
        text: "text-indigo-600",
        icon: "#4f46e5",
      },
      emerald: {
        bg: "bg-emerald-500",
        light: "bg-emerald-500/10",
        text: "text-emerald-600",
        icon: "#059669",
      },
      amber: {
        bg: "bg-amber-500",
        light: "bg-amber-500/10",
        text: "text-amber-600",
        icon: "#d97706",
      },
    };

    const config = colorConfig[color];

    return (
      <View className="bg-card p-5 rounded-2xl border border-border shadow-sm shadow-border/50 mb-4">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-foreground font-bold text-lg mb-1">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-muted-foreground text-sm">{subtitle}</Text>
            )}
          </View>
          <View className={`p-2 rounded-xl ${config.light}`}>
            <Ionicons
              name={icon as any}
              size={20}
              color={config.icon}
            />
          </View>
        </View>

        {progress ? (
          <View className="mb-3">
            <View className="flex-row justify-between mb-2">
              <View className="items-center flex-1">
                <Text className="text-muted-foreground text-xs uppercase tracking-wide">Utilizadas</Text>
                <Text
                  className={`text-foreground text-2xl font-bold mt-1`}
                >
                  {progress.used.toFixed(1)}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-muted-foreground text-xs uppercase tracking-wide">Disponibles</Text>
                <Text
                  className={`text-foreground text-2xl font-bold mt-1 ${config.text}`}
                >
                  {progress.available.toFixed(1)}
                </Text>
              </View>
            </View>

            {/* Barra de progreso */}
            <View className="bg-secondary rounded-full h-2 mt-2">
              <View
                className={`h-2 rounded-full ${config.bg}`}
                style={{
                  width: `${(progress.used / progress.total) * 100}%`,
                }}
              />
            </View>
            <Text className="text-muted-foreground text-xs text-center mt-1">
              {Math.round((progress.used / progress.total) * 100)}% utilizado
            </Text>
          </View>
        ) : (
          <View className="flex-row items-end justify-between">
            <Text className={`text-3xl font-bold ${config.text}`}>{value}</Text>
            <Text className="text-muted-foreground text-sm font-medium mb-1">
              {typeof value === "number" && value === 1 ? "día" : "días"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-foreground mb-2">
            Balance de Días
          </Text>
          <Text className="text-muted-foreground text-base">
            Resumen de tus días disponibles y utilizados
          </Text>
        </View>

        {/* Vacaciones con progreso */}
        <StatCard
          title="Vacaciones"
          value={`${leaveData.vacations.total} días`}
          icon="beach-outline"
          color="blue"
          progress={{
            used: leaveData.vacations.used,
            available: leaveData.vacations.available,
            total: leaveData.vacations.total,
          }}
        />

        {/* Días administrativos */}
        <StatCard
          title="Días Administrativos"
          value={leaveData.adminDays}
          subtitle="Días disponibles para uso administrativo"
          icon="business-outline"
          color="emerald"
        />

        {/* Devoluciones de tiempo */}
        <StatCard
          title="Devoluciones de Tiempo"
          value={leaveData.timeReturns}
          subtitle="Horas acumuladas por devoluciones"
          icon="time-outline"
          color="amber"
        />

        {/* Información adicional */}
        <View className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 mt-4">
          <View className="flex-row items-center">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#3b82f6"
            />
            <Text className="text-blue-600 dark:text-blue-400 font-medium ml-2 text-sm">
              Información importante
            </Text>
          </View>
          <Text className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-2 leading-4">
            Todos los saldos se actualizan en tiempo real. Contacta con RRHH
            para más detalles sobre el uso de tus días.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LeaveBalanceScreen;
