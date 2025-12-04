import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface AdminRequestCardProps {
  solicitud: any;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
  formatDate: (date: any) => string;
}

export default function AdminRequestCard({
  solicitud,
  onApprove,
  onReject,
  isProcessing,
  formatDate,
}: AdminRequestCardProps) {
  const getTipoColor = (tipo: string) => {
    const colores: { [key: string]: string } = {
      Vacaciones: "#1E88E5",
      "Permiso Personal": "#9C27B0",
      "Licencia Médica": "#43A047",
      "Día Libre": "#FB8C00",
    };
    return colores[tipo] || "#757575";
  };

  const badgeColor = getTipoColor(solicitud.tipoPermiso);

  return (
    <View className="bg-gray-800 p-5 rounded-2xl mb-4 shadow-md">
      <Text className="text-white text-xl font-bold mb-3">
        Usuario: {solicitud.username || "Sin nombre"}
      </Text>

      <View
        className="self-start px-3 py-1 rounded mb-3"
        style={{ backgroundColor: badgeColor }}
      >
        <Text className="text-white text-sm font-semibold">
          {solicitud.tipoPermiso}
        </Text>
      </View>

      <Text className="text-gray-400 text-base mb-3">{solicitud.motivo}</Text>

      <View className="flex-row items-center gap-2 mb-5">
        <Ionicons name="calendar-outline" size={18} color="#757575" />
        <Text className="text-gray-400 text-sm">
          {formatDate(solicitud.fechaInicio)} — {formatDate(solicitud.fechaFin)}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded border-2 border-red-700 bg-gray-900 ${
            isProcessing ? "opacity-60" : ""
          } active:bg-gray-800`}
          onPress={() => onReject(solicitud.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#D32F2F" />
          ) : (
            <>
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text className="text-red-500 text-base font-semibold">
                Rechazar
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded bg-blue-600 ${
            isProcessing ? "opacity-60" : ""
          } active:bg-blue-700`}
          onPress={() => onApprove(solicitud.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#FFF"
              />
              <Text className="text-white text-base font-semibold">
                Aprobar
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
