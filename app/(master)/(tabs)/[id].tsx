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
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-400 mt-3">Cargando usuario...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-gray-400">Usuario no encontrado</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white">Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mb-6 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={22} color="#3B82F6" />
          <Text className="text-blue-500 ml-2">Volver</Text>
        </Pressable>

        {/* Información básica */}
        <View className="bg-gray-800 p-6 rounded-2xl shadow-md mb-4">
          <Text className="text-white text-2xl font-bold mb-4">
            {user.name || "Sin nombre"}
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Ionicons name="mail" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 ml-3">
                {user.email || "Sin correo"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="briefcase" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 ml-3">
                Sección: {user.section || "No asignada"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="location" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 ml-3">
                País: {user.country || "No especificado"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="calendar" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 ml-3">
                Creado: {formatDate(user.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Roles y permisos */}
        <View className="bg-gray-800 p-6 rounded-2xl shadow-md mb-4">
          <Text className="text-white text-lg font-bold mb-3">
            Roles y Permisos
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Ionicons
                name={user.isMaster ? "star" : "star-outline"}
                size={20}
                color={user.isMaster ? "#F59E0B" : "#9CA3AF"}
              />
              <Text
                className={`ml-3 text-base ${
                  user.isMaster ? "text-amber-500 font-semibold" : "text-gray-400"
                }`}
              >
                {user.isMaster ? "✓ Cuenta Master" : "Usuario regular"}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons
                name={user.isAdmin ? "shield" : "shield-outline"}
                size={20}
                color={user.isAdmin ? "#3B82F6" : "#9CA3AF"}
              />
              <Text
                className={`ml-3 text-base ${
                  user.isAdmin ? "text-blue-500 font-semibold" : "text-gray-400"
                }`}
              >
                {user.isAdmin ? "✓ Administrador" : "Sin permisos administrativos"}
              </Text>
            </View>
          </View>
        </View>

        {/* Vacaciones y días */}
        <View className="bg-gray-800 p-6 rounded-2xl shadow-md mb-4">
          <Text className="text-white text-lg font-bold mb-3">
            Vacaciones y Permisos
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="sunny" size={18} color="#10B981" />
                <Text className="text-gray-400 ml-3">Días de vacaciones</Text>
              </View>
              <Text className="text-white font-bold text-base">
                {user.vacationsInDays ?? 0} días
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#EF4444" />
                <Text className="text-gray-400 ml-3">Vacaciones usadas</Text>
              </View>
              <Text className="text-white font-bold text-base">
                {user.vacationUsedInDays ?? 0} días
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="document-text" size={18} color="#8B5CF6" />
                <Text className="text-gray-400 ml-3">Días administrativos</Text>
              </View>
              <Text className="text-white font-bold text-base">
                {user.administrativeDays ?? 0} días
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Ionicons name="time" size={18} color="#F59E0B" />
                <Text className="text-gray-400 ml-3">Horas de regreso</Text>
              </View>
              <Text className="text-white font-bold text-base">
                {user.timeReturnsInHours ?? 0} hrs
              </Text>
            </View>
          </View>

          {/* Barra de progreso de vacaciones */}
          <View className="mt-4 pt-4 border-t border-gray-700">
            <Text className="text-gray-400 text-sm mb-2">
              Vacaciones disponibles
            </Text>
            <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-green-500"
                style={{
                  width: `${
                    ((user.vacationsInDays ?? 0) - (user.vacationUsedInDays ?? 0)) /
                    (user.vacationsInDays || 1) *
                    100
                  }%`,
                }}
              />
            </View>
            <Text className="text-gray-400 text-xs mt-1">
              {(user.vacationsInDays ?? 0) - (user.vacationUsedInDays ?? 0)} de{" "}
              {user.vacationsInDays ?? 0} días disponibles
            </Text>
          </View>
        </View>

        {/* ID del usuario */}
        <View className="bg-gray-800 p-4 rounded-2xl shadow-md">
          <Text className="text-gray-500 text-xs mb-1">ID de Usuario</Text>
          <Text className="text-gray-400 text-xs font-mono">{user.id}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}