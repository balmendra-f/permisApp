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
      available: userData.vacationsInDays - userData.vacationUsedInDays, // Fixed logic to match usage
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
        light: "bg-indigo-100",
        text: "text-indigo-600",
        icon: "#4f46e5",
      },
      emerald: {
        bg: "bg-emerald-500",
        light: "bg-emerald-100",
        text: "text-emerald-600",
        icon: "#059669",
      },
      amber: {
        bg: "bg-amber-500",
        light: "bg-amber-100",
        text: "text-amber-600",
        icon: "#d97706",
      },
    };

    const config = colorConfig[color];

    return (
      <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-200 mb-4">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-slate-900 font-bold text-lg mb-1">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-slate-500 text-sm">{subtitle}</Text>
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
                <Text className="text-slate-400 text-xs uppercase tracking-wide">Utilizadas</Text>
                <Text
                  className={`text-slate-900 text-2xl font-bold mt-1`}
                >
                  {progress.used.toFixed(1)}
                </Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-slate-400 text-xs uppercase tracking-wide">Disponibles</Text>
                <Text
                  className={`text-slate-900 text-2xl font-bold mt-1 ${config.text}`}
                >
                  {progress.available.toFixed(1)}
                </Text>
              </View>
            </View>

            {/* Barra de progreso */}
            <View className="bg-slate-100 rounded-full h-2 mt-2">
              <View
                className={`h-2 rounded-full ${config.bg}`}
                style={{
                  width: `${(progress.used / progress.total) * 100}%`,
                }}
              />
            </View>
            <Text className="text-slate-400 text-xs text-center mt-1">
              {Math.round((progress.used / progress.total) * 100)}% utilizado
            </Text>
          </View>
        ) : (
          <View className="flex-row items-end justify-between">
            <Text className={`text-3xl font-bold ${config.text}`}>{value}</Text>
            <Text className="text-slate-400 text-sm font-medium mb-1">
              {typeof value === "number" && value === 1 ? "día" : "días"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-900 mb-2">
            Balance
          </Text>
          <Text className="text-slate-500 text-base">
            Resumen de tus días disponibles
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
        <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-4">
          <View className="flex-row items-center">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#3b82f6"
            />
            <Text className="text-blue-700 font-medium ml-2 text-sm">
              Información importante
            </Text>
          </View>
          <Text className="text-blue-600 text-xs mt-2 leading-4">
            Todos los saldos se actualizan en tiempo real. Contacta con RRHH
            para más detalles sobre el uso de tus días.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LeaveBalanceScreen;
