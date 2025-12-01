"use client";

import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/providers/AuthProvider";
import { useUsers } from "@/components/master/useUsers";
import { useRouter } from "expo-router";
import Button from "@/components/common/Button";
import { Colors } from "@/constants/Colors";

export default function PanelMaster() {
  const { user } = useAuth();
  const { users, loading, processingIds, toggleAdmin } = useUsers();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-slate-400 text-base">Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 bg-white border-b border-slate-100">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-indigo-100 justify-center items-center">
              <Ionicons name="people" size={24} color="#4f46e5" />
            </View>
            <View>
              <Text className="text-slate-900 text-2xl font-bold">
                Panel Master
              </Text>
              <Text className="text-slate-500 text-sm">{user?.name}</Text>
            </View>
          </View>
          <Pressable className="p-2 bg-slate-50 rounded-full border border-slate-100">
            <MaterialIcons name="logout" size={20} color="#64748b" />
          </Pressable>
        </View>

        {/* Contador */}
        <View className="mx-6 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <Text className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wide">Usuarios Totales</Text>
          <Text className="text-indigo-600 text-4xl font-extrabold">
            {users.length}
          </Text>
        </View>

        {/* Lista de usuarios */}
        <View className="px-6 py-6">
          <View className="mb-4">
            <Text className="text-slate-900 text-xl font-bold mb-1">
              Lista de Usuarios
            </Text>
            <Text className="text-slate-500 text-sm">
              Gestiona los permisos y roles de los usuarios
            </Text>
          </View>

          {users.map((u) => {
            const isProcessing = processingIds.has(u.id);
            return (
              <View
                key={u.id}
                className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100"
              >
                {/* Área clickeable para ver detalles */}
                <Pressable
                  onPress={() => router.push(`/${u.id}`)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
                  className="mb-4"
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-slate-900 text-lg font-bold">
                        {u.name || "Sin nombre"}
                    </Text>
                    {u.isAdmin && (
                        <View className="bg-amber-100 px-2 py-1 rounded text-xs">
                            <Text className="text-amber-700 font-bold text-[10px] uppercase">Admin</Text>
                        </View>
                    )}
                  </View>
                  <Text className="text-slate-500 text-sm">
                    {u.email || "Sin correo"}
                  </Text>
                </Pressable>

                {/* Botón toggle admin */}
                <Button
                    label={u.isAdmin ? "Quitar Admin" : "Hacer Admin"}
                    onPress={() => toggleAdmin(u.id, u.isAdmin)}
                    loading={isProcessing}
                    variant={u.isAdmin ? "outline" : "primary"}
                    className={u.isAdmin ? "border-amber-200 bg-amber-50" : ""}
                    textClassName={u.isAdmin ? "text-amber-700" : ""}
                    disabled={isProcessing}
                    size="sm"
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
