import { useAuth } from "@/providers/AuthProvider";
import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUserListener } from "@/hooks/useUsers";
import Screen from "@/components/common/Screen";

const LeaveBalanceScreen = () => {
  const { user } = useAuth();
  const userData = useUserListener(user);

  if (!userData) return null;

  const leaveData = {
    vacations: {
      available: userData.vacationsInDays,
      used: userData.vacationUsedInDays,
      total: userData.vacationsInDays + userData.vacationUsedInDays,
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
        bg: "bg-blue-500",
        light: "bg-blue-500/20",
        text: "text-blue-400",
      },
      emerald: {
        bg: "bg-emerald-500",
        light: "bg-emerald-500/20",
        text: "text-emerald-400",
      },
      amber: {
        bg: "bg-amber-500",
        light: "bg-amber-500/20",
        text: "text-amber-400",
      },
    };

    const config = colorConfig[color];

    return (
      <View className="bg-neutral-800/80 p-5 rounded-2xl border border-neutral-700/50 shadow-lg shadow-black/30 mb-4">
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-white font-semibold text-lg mb-1">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-gray-400 text-sm">{subtitle}</Text>
            )}
          </View>
          <View className={`p-2 rounded-xl ${config.light}`}>
            <Ionicons
              name={icon as any}
              size={20}
              color={config.text.replace("text-", "")}
            />
          </View>
        </View>

        {progress ? (
          <View className="mb-3">
            <View className="flex-row justify-between mb-2">
              <View className="items-center flex-1">
                <Text className="text-gray-400 text-xs">Utilizadas</Text>
                <Text
                  className={`text-white text-2xl font-bold mt-1 ${config.text}`}
                >
                  {progress.used}
                </Text>
              </View>

              <View className="items-center flex-1">
                <Text className="text-gray-400 text-xs">Disponibles</Text>
                <Text
                  className={`text-white text-2xl font-bold mt-1 ${config.text}`}
                >
                  {progress.available}
                </Text>
              </View>
            </View>

            <View className="bg-neutral-700 rounded-full h-2 mt-2">
              <View
                className={`h-2 rounded-full ${config.bg}`}
                style={{
                  width: `${(progress.used / progress.total) * 100}%`,
                }}
              />
            </View>

            <Text className="text-gray-400 text-xs text-center mt-1">
              {Math.round((progress.used / progress.total) * 100)}% utilizado
            </Text>
          </View>
        ) : (
          <View className="flex-row items-end justify-between">
            <Text className={`text-3xl font-bold ${config.text}`}>{value}</Text>
            <Text className="text-gray-400 text-sm">
              {typeof value === "number" && value === 1 ? "día" : "días"}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen>
      <View className="p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white mb-2">
            Balance de Días
          </Text>
          <Text className="text-gray-300 text-base">
            Resumen de tus días disponibles y utilizados
          </Text>
        </View>

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

        <StatCard
          title="Días Administrativos"
          value={leaveData.adminDays}
          subtitle="Días disponibles para uso administrativo"
          icon="business-outline"
          color="emerald"
        />

        <StatCard
          title="Devoluciones de Tiempo"
          value={leaveData.timeReturns}
          subtitle="Horas acumuladas por devoluciones"
          icon="time-outline"
          color="amber"
        />

        <View className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700/30 mt-4">
          <View className="flex-row items-center">
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#60A5FA"
            />
            <Text className="text-blue-400 font-medium ml-2 text-sm">
              Información importante
            </Text>
          </View>
          <Text className="text-gray-400 text-xs mt-2 leading-4">
            Todos los saldos se actualizan en tiempo real. Contacta con RRHH
            para más detalles sobre el uso de tus días.
          </Text>
        </View>
      </View>
    </Screen>
  );
};

export default LeaveBalanceScreen;
