import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatusBadgeProps {
  status: "pending" | "approved" | "rejected";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  let config = {
    text: "",
    bgColor: "",
    textColor: "",
    icon: "" as keyof typeof Ionicons.glyphMap,
  };

  if (status === "pending") {
    config = {
      text: "Pendiente",
      bgColor: "bg-amber-500/20",
      textColor: "text-amber-400",
      icon: "time-outline",
    };
  } else if (status === "rejected") {
    config = {
      text: "Denegado",
      bgColor: "bg-red-500/20",
      textColor: "text-red-400",
      icon: "close-circle-outline",
    };
  } else {
    config = {
      text: "Aprobado",
      bgColor: "bg-emerald-500/20",
      textColor: "text-emerald-400",
      icon: "checkmark-circle-outline",
    };
  }

  return (
    <View
      className={`px-3 py-2 rounded-full ${config.bgColor} flex-row items-center ml-3`}
    >
      <Ionicons name={config.icon} size={14} color="white" />
      <Text className={`${config.textColor} text-xs font-medium ml-1`}>
        {config.text}
      </Text>
    </View>
  );
}
