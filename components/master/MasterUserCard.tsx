import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface MasterUserCardProps {
  user: any;
  isProcessing: boolean;
  onToggleAdmin: (id: string, isAdmin: boolean) => void;
}

export default function MasterUserCard({
  user,
  isProcessing,
  onToggleAdmin,
}: MasterUserCardProps) {
  const router = useRouter();

  return (
    <View className="bg-gray-800 p-5 rounded-2xl mb-4 shadow-md">
      <Pressable
        onPress={() => router.push(`/${user.id}`)}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Text className="text-white text-lg font-bold mb-1">
          {user.name || "Sin nombre"}
        </Text>
        <Text className="text-gray-400 text-sm mb-3">
          {user.email || "Sin correo"}
        </Text>
      </Pressable>

      <Pressable
        className={`flex-row items-center justify-center gap-2 py-3 rounded border-2 border-yellow-700 bg-gray-900 ${
          isProcessing ? "opacity-60" : ""
        }`}
        onPress={(e) => {
          e.stopPropagation();
          onToggleAdmin(user.id, user.isAdmin);
        }}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#FBBF24" />
        ) : (
          <>
            <Ionicons
              name="shield-outline"
              size={20}
              color={user.isAdmin ? "#FBBF24" : "#9CA3AF"}
            />
            <Text
              className={`text-base font-semibold ${
                user.isAdmin ? "text-yellow-400" : "text-gray-400"
              }`}
            >
              {user.isAdmin ? "Quitar Admin" : "Hacer Admin"}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
