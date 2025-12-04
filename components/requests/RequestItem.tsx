import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "@/components/common/StatusBadge";

interface RequestItemProps {
  item: any;
  onCancel?: (id: string) => void;
}

export default function RequestItem({ item, onCancel }: RequestItemProps) {
  const fechaInicio = item.fechaInicio?.toDate
    ? item.fechaInicio.toDate()
    : new Date(item.fechaInicio);

  const fechaFin = item.fechaFin?.toDate
    ? item.fechaFin.toDate()
    : new Date(item.fechaFin);

  const fechaFormateada = `${fechaInicio.getDate()} ${fechaInicio.toLocaleString(
    "es-ES",
    { month: "short" }
  )} - ${fechaFin.getDate()} ${fechaFin.toLocaleString("es-ES", {
    month: "short",
  })}`;

  return (
    <View className="bg-neutral-800/80 p-5 rounded-2xl mt-3 border border-neutral-700/50 shadow-sm shadow-black/30">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-white mb-1">
            {item.tipoPermiso}
          </Text>
          <Text className="text-gray-300 text-sm leading-5">{item.motivo}</Text>
        </View>

        <StatusBadge status={item.status} />
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-neutral-700/50">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
          <Text className="text-gray-400 ml-2 text-sm">{fechaFormateada}</Text>
        </View>

        {item.status === "pending" && onCancel && (
          <TouchableOpacity onPress={() => onCancel(item.id)}>
            <Text className="text-red-400 text-sm font-semibold">Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
