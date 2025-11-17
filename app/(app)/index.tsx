"use client";

import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { useUsers } from "@/components/master/useUsers";

export default function PanelMaster() {
  const { user } = useAuth();
  const { users, loading, processingIds, toggleAdmin } = useUsers();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-400 text-base">Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView className="flex-1">
        {/* Header */}
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
          <TouchableOpacity>
            <MaterialIcons name="logout" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Contador */}
        <View className="bg-gray-800 m-5 p-6 rounded-2xl shadow-md">
          <Text className="text-white text-base mb-3">Usuarios Totales</Text>
          <Text className="text-blue-500 text-5xl font-bold">
            {users.length}
          </Text>
        </View>

        {/* Lista de usuarios */}
        <View className="px-5">
          <Text className="text-white text-2xl font-bold mb-1">
            Lista de Usuarios
          </Text>
          <Text className="text-gray-400 text-sm mb-5">
            Dar o quitar permisos de administrador
          </Text>

          {users.map((u) => {
            const isProcessing = processingIds.has(u.id);
            return (
              <View
                key={u.id}
                className="bg-gray-800 p-5 rounded-2xl mb-4 shadow-md"
              >
                <Text className="text-white text-lg font-bold mb-1">
                  {u.name || "Sin nombre"}
                </Text>
                <Text className="text-gray-400 text-sm mb-3">
                  {u.email || "Sin correo"}
                </Text>

                <TouchableOpacity
                  className={`flex-row items-center justify-center gap-2 py-3 rounded border-2 border-yellow-700 bg-gray-900 ${
                    isProcessing ? "opacity-60" : ""
                  }`}
                  onPress={() => toggleAdmin(u.id, u.isAdmin)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FBBF24" />
                  ) : (
                    <>
                      <Ionicons
                        name="shield-outline"
                        size={20}
                        color={u.isAdmin ? "#FBBF24" : "#9CA3AF"}
                      />
                      <Text
                        className={`text-base font-semibold ${
                          u.isAdmin ? "text-yellow-400" : "text-gray-400"
                        }`}
                      >
                        {u.isAdmin ? "Quitar Admin" : "Hacer Admin"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
