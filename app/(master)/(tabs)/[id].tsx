"use client";

import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import getUserById from "@/api/users/getUserById";
import Button from "@/components/common/Button";

interface User {
  id: string;
  name?: string;
  email?: string;
  section?: string;
  country?: string;
  isAdmin?: boolean;
  isMaster?: boolean;
  vacationsInDays?: number;
  vacationUsedInDays?: number;
  administrativeDays?: number;
  timeReturnsInHours?: number;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
    type: string;
  };
}

export default function UserDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const data = await getUserById(id as string);
        setUser(data);
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.seconds) return "No disponible";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-slate-400 mt-3">Cargando usuario...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
        <Text className="text-slate-400">Usuario no encontrado</Text>
        <Button
          label="Volver"
          onPress={() => router.back()}
          className="mt-4 w-32"
          variant="primary"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mb-6 active:opacity-70 p-2 -ml-2 rounded-lg"
        >
          <Ionicons name="arrow-back" size={24} color="#4f46e5" />
          <Text className="text-indigo-600 font-semibold ml-2">Volver</Text>
        </Pressable>

        {/* Información básica */}
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-slate-900 text-2xl font-bold">
                {user.name || "Sin nombre"}
              </Text>
              <Text className="text-slate-500 text-sm">{user.id}</Text>
            </View>
            <View className={`w-12 h-12 rounded-full items-center justify-center ${user.isMaster ? 'bg-amber-100' : 'bg-indigo-100'}`}>
                <Ionicons name={user.isMaster ? "star" : "person"} size={24} color={user.isMaster ? "#d97706" : "#4f46e5"} />
            </View>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Ionicons name="mail" size={20} color="#64748b" />
              <View className="ml-3">
                  <Text className="text-xs text-slate-400 uppercase">Correo</Text>
                  <Text className="text-slate-700 font-medium">
                    {user.email || "Sin correo"}
                  </Text>
              </View>
            </View>

            <View className="flex-row gap-4">
                <View className="flex-1 flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Ionicons name="briefcase" size={20} color="#64748b" />
                    <View className="ml-3">
                        <Text className="text-xs text-slate-400 uppercase">Sección</Text>
                        <Text className="text-slate-700 font-medium">
                            {user.section || "N/A"}
                        </Text>
                    </View>
                </View>
                <View className="flex-1 flex-row items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Ionicons name="location" size={20} color="#64748b" />
                    <View className="ml-3">
                        <Text className="text-xs text-slate-400 uppercase">País</Text>
                        <Text className="text-slate-700 font-medium">
                            {user.country || "N/A"}
                        </Text>
                    </View>
                </View>
            </View>

            <View className="flex-row items-center px-2">
              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
              <Text className="text-slate-400 text-sm ml-2">
                Miembro desde: {formatDate(user.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Roles y permisos */}
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-4">
          <Text className="text-slate-900 text-lg font-bold mb-4">
            Roles
          </Text>
          
          <View className="flex-row gap-3">
            <View className={`flex-1 p-3 rounded-xl border flex-row items-center justify-center ${user.isMaster ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <Ionicons
                name={user.isMaster ? "star" : "star-outline"}
                size={20}
                color={user.isMaster ? "#d97706" : "#94a3b8"}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  user.isMaster ? "text-amber-700" : "text-slate-400"
                }`}
              >
                Master
              </Text>
            </View>

            <View className={`flex-1 p-3 rounded-xl border flex-row items-center justify-center ${user.isAdmin ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
              <Ionicons
                name={user.isAdmin ? "shield-checkmark" : "shield-outline"}
                size={20}
                color={user.isAdmin ? "#2563eb" : "#94a3b8"}
              />
              <Text
                className={`ml-2 text-sm font-semibold ${
                  user.isAdmin ? "text-blue-700" : "text-slate-400"
                }`}
              >
                Admin
              </Text>
            </View>
          </View>
        </View>

        {/* Vacaciones y días */}
        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <Text className="text-slate-900 text-lg font-bold mb-4">
            Balance de Días
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center p-3 bg-slate-50 rounded-xl">
              <View className="flex-row items-center">
                <View className="p-2 bg-emerald-100 rounded-lg">
                    <Ionicons name="sunny" size={18} color="#059669" />
                </View>
                <View className="ml-3">
                    <Text className="text-slate-700 font-semibold">Vacaciones</Text>
                    <Text className="text-slate-400 text-xs">Total asignado</Text>
                </View>
              </View>
              <Text className="text-slate-900 font-bold text-lg">
                {user.vacationsInDays ?? 0}
              </Text>
            </View>

            <View className="flex-row justify-between items-center p-3 bg-slate-50 rounded-xl">
              <View className="flex-row items-center">
                 <View className="p-2 bg-rose-100 rounded-lg">
                    <Ionicons name="time" size={18} color="#be123c" />
                 </View>
                <View className="ml-3">
                    <Text className="text-slate-700 font-semibold">Usadas</Text>
                    <Text className="text-slate-400 text-xs">Días tomados</Text>
                </View>
              </View>
              <Text className="text-slate-900 font-bold text-lg">
                {user.vacationUsedInDays ?? 0}
              </Text>
            </View>

            <View className="flex-row gap-4 mt-2">
                <View className="flex-1 bg-indigo-50 p-3 rounded-xl border border-indigo-100 items-center">
                    <Text className="text-indigo-600 font-bold text-xl">{user.administrativeDays ?? 0}</Text>
                    <Text className="text-indigo-400 text-xs text-center">Días Admin</Text>
                </View>
                <View className="flex-1 bg-amber-50 p-3 rounded-xl border border-amber-100 items-center">
                    <Text className="text-amber-600 font-bold text-xl">{user.timeReturnsInHours ?? 0}</Text>
                    <Text className="text-amber-400 text-xs text-center">Horas Retorno</Text>
                </View>
            </View>
          </View>

          {/* Barra de progreso de vacaciones */}
          <View className="mt-6 pt-4 border-t border-slate-100">
            <View className="flex-row justify-between mb-2">
                <Text className="text-slate-500 text-sm font-medium">
                Disponibilidad
                </Text>
                <Text className="text-slate-900 text-sm font-bold">
                    {Math.max(0, (user.vacationsInDays ?? 0) - (user.vacationUsedInDays ?? 0)).toFixed(1)} días
                </Text>
            </View>

            <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <View
                className="h-full bg-emerald-500 rounded-full"
                style={{
                  width: `${Math.min(100, Math.max(0,
                    ((user.vacationsInDays ?? 0) - (user.vacationUsedInDays ?? 0)) /
                    (user.vacationsInDays || 1) *
                    100
                  ))}%`,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
