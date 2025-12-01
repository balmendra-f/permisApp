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

// NOTE: This file seems to be a duplicate/legacy version of the Master Panel logic
// but located in `app/(app)/index.tsx`. The real Master Panel is likely at `app/(master)/index.tsx`.
// However, since it exists here and was flagged, I will refactor it to use semantic colors.

export default function PanelMaster() {
  const { user } = useAuth();
  const { users, loading, processingIds, toggleAdmin } = useUsers();
  const router = useRouter();

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" className="text-primary" />
          <Text className="text-muted-foreground text-base">Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-6 bg-card border-b border-border">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-primary/10 justify-center items-center">
              <Ionicons name="people" size={24} className="text-primary" />
            </View>
            <View>
              <Text className="text-foreground text-2xl font-bold">
                Panel Master
              </Text>
              <Text className="text-muted-foreground text-sm">{user?.name}</Text>
            </View>
          </View>
          <Pressable className="p-2 rounded-full border border-border bg-card">
            <MaterialIcons name="logout" size={20} className="text-muted-foreground" />
          </Pressable>
        </View>

        {/* Contador */}
        <View className="mx-6 mt-6 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <Text className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wide">Usuarios Totales</Text>
          <Text className="text-primary text-4xl font-extrabold">
            {users.length}
          </Text>
        </View>

        {/* Lista de usuarios */}
        <View className="px-6 py-6">
          <View className="mb-4">
            <Text className="text-foreground text-xl font-bold mb-1">
              Lista de Usuarios
            </Text>
            <Text className="text-muted-foreground text-sm">
              Gestiona los permisos y roles
            </Text>
          </View>

          {users.map((u) => {
            const isProcessing = processingIds.has(u.id);
            return (
              <View
                key={u.id}
                className="bg-card p-5 rounded-2xl mb-4 shadow-sm border border-border"
              >
                <View className="flex-row justify-between items-start mb-2">
                   <View>
                      <Text className="text-foreground text-lg font-bold">
                        {u.name || "Sin nombre"}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        {u.email || "Sin correo"}
                      </Text>
                   </View>
                   {u.isAdmin && (
                      <View className="bg-yellow-500/20 px-2 py-1 rounded">
                         <Text className="text-yellow-600 text-[10px] font-bold uppercase">Admin</Text>
                      </View>
                   )}
                </View>

                <Button
                    label={u.isAdmin ? "Quitar Admin" : "Hacer Admin"}
                    onPress={() => toggleAdmin(u.id, u.isAdmin)}
                    loading={isProcessing}
                    variant={u.isAdmin ? "outline" : "primary"}
                    className={`mt-2 ${u.isAdmin ? "border-yellow-500/50 bg-yellow-500/5" : ""}`}
                    textClassName={u.isAdmin ? "text-yellow-600" : ""}
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
