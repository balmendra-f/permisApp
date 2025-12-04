import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ChiefInfoProps {
  chief: any;
  userSection: string | undefined;
}

export default function ChiefInfo({ chief, userSection }: ChiefInfoProps) {
  return (
    <View className="p-4 items-center">
      {chief ? (
        <>
          <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl text-white font-bold">
              {chief.name?.charAt(0)}
            </Text>
          </View>
          <Text className="text-xl text-white font-bold mb-1">
            {chief.name}
          </Text>
          <Text className="text-gray-400 mb-4">{chief.email}</Text>

          <View className="flex-row items-center bg-neutral-800 px-4 py-2 rounded-lg">
            <Ionicons name="briefcase-outline" size={16} color="#9CA3AF" />
            <Text className="text-gray-300 ml-2">{userSection}</Text>
          </View>
        </>
      ) : (
        <Text className="text-gray-400">
          No se encontró información del jefe de sección.
        </Text>
      )}
    </View>
  );
}
