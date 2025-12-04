"use client";

import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { useUsers } from "@/components/master/useUsers";
import { useRouter } from "expo-router";
import Screen from "@/components/common/Screen";
import MasterUserCard from "@/components/master/MasterUserCard";

export default function PanelMaster() {
  const { user } = useAuth();
  const { users, loading, processingIds, toggleAdmin } = useUsers();
  const router = useRouter();

  if (loading) {
    return (
      <Screen className="flex-1 bg-black">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-400 text-base">Cargando usuarios...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView className="flex-1">
        <View className="flex-row justify-between items-center p-5 bg-gray-800">
          <View className="flex-row items-center gap-3">
            <View className="w-15 h-15 rounded-lg bg-blue-600 justify-center items-center">
              <Ionicons name="people-outline" size={32} color="#FFF" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold">
                Panel Master
              </Text>
              <Text className="text-gray-400 text-base mt-1">{user?.name}</Text>
            </View>
          </View>
          <Pressable>
            <MaterialIcons name="logout" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        <View className="bg-gray-800 m-5 p-6 rounded-2xl shadow-md">
          <Text className="text-white text-base mb-3">Usuarios Totales</Text>
          <Text className="text-blue-500 text-5xl font-bold">
            {users.length}
          </Text>
        </View>

        <View className="px-5">
          <Text className="text-white text-2xl font-bold mb-1">
            Lista de Usuarios
          </Text>
          <Text className="text-gray-400 text-sm mb-5">
            Dar o quitar permisos de administrador
          </Text>

          {users.map((u) => (
            <MasterUserCard
              key={u.id}
              user={u}
              isProcessing={processingIds.has(u.id)}
              onToggleAdmin={toggleAdmin}
            />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
