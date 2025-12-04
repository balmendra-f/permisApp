import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  count: number;
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function StatCard({ count, label, color, icon }: StatCardProps) {
  return (
    <View
      className={`p-6 rounded-2xl ${color} w-[30%] shadow-lg shadow-black/50`}
    >
      <View className="items-center">
        <View className="bg-white/20 p-2 rounded-full mb-2">
          <Ionicons name={icon} size={20} color="white" />
        </View>
        <Text className="text-white font-semibold text-sm text-center">
          {label}
        </Text>
        <Text className="text-white text-3xl font-bold mt-1">{count}</Text>
      </View>
    </View>
  );
}
