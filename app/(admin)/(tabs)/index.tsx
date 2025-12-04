"use client";

import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useRequests } from "@/providers/RequestProvider";
import { updateRequestById } from "@/api/request/updateById";
import { useAuth } from "@/providers/AuthProvider";

interface Solicitud {
  id: string;
  userId: string;
  section: string | null;
  tipoPermiso: string;
  motivo: string;
  fechaInicio: any;
  fechaFin: any;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  documento: any;
  username: string;
}

export default function PanelAdmin() {
  const { requests, loading } = useRequests();
  const { user } = useAuth();
  const section = user?.section;
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const solicitudesPendientes = requests.filter(
    (req: Solicitud) => req.status === "pending" && req.section === section
  );

  const formatDate = (dateObj: any) => {
    if (!dateObj) return "Fecha no disponible";
    try {
      if (dateObj.toDate) {
        return dateObj.toDate().toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      if (dateObj instanceof Date) {
        return dateObj.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return "Fecha inválida";
    } catch {
      return "Fecha inválida";
    }
  };

  const getTipoColor = (tipo: string) => {
    const colores: { [key: string]: string } = {
      Vacaciones: "#1E88E5",
      "Permiso Personal": "#9C27B0",
      "Licencia Médica": "#43A047",
      "Día Libre": "#FB8C00",
    };
    return colores[tipo] || "#757575";
  };

  const handleAprobar = async (id: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(id));
      await updateRequestById(id, { status: "approved", isPending: false });
      Alert.alert(
        "Solicitud Aprobada",
        "La solicitud ha sido aprobada exitosamente"
      );
    } catch {
      Alert.alert("Error", "Hubo un problema al aprobar la solicitud.");
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleRechazar = async (id: string) => {
    Alert.alert(
      "Rechazar Solicitud",
      "¿Estás seguro de rechazar esta solicitud?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingIds((prev) => new Set(prev).add(id));
              await updateRequestById(id, { status: "rejected", isPending: false });
              Alert.alert(
                "Solicitud Rechazada",
                "La solicitud ha sido rechazada"
              );
            } catch {
              Alert.alert(
                "Error",
                "Hubo un problema al rechazar la solicitud."
              );
            } finally {
              setProcessingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
              });
            }
          },
        },
      ]
    );
  };

  if (!section) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 justify-center items-center gap-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-gray-400 text-base">
            Tu usuario no tiene una sección asignada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-400 text-base">
            Cargando solicitudes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <ScrollView className="flex-1">
        {/* Encabezado */}
        <View className="flex-row justify-between items-center p-5 bg-gray-800">
          <View className="flex-row items-center gap-3">
            <View className="w-15 h-15 rounded-lg bg-blue-600 justify-center items-center">
              <Ionicons name="shield-outline" size={32} color="#FFF" />
            </View>
            <View>
              <Text className="text-white text-2xl font-bold">
                Panel Administrador
              </Text>
              <Text className="text-gray-400 text-base mt-1">{user?.name}</Text>
            </View>
          </View>
          <Pressable>
            <MaterialIcons name="logout" size={24} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Indicador de número de solicitudes */}
        <View className="bg-gray-800 m-5 p-6 rounded-2xl shadow-md">
          <Text className="text-white text-base mb-3">
            Solicitudes Pendientes
          </Text>
          <Text className="text-blue-500 text-5xl font-bold">
            {solicitudesPendientes.length}
          </Text>
        </View>

        {/* Lista */}
        <View className="px-5 pt-0">
          <Text className="text-white text-2xl font-bold mb-1">
            Solicitudes por Aprobar
          </Text>
          <Text className="text-gray-400 text-sm mb-5">
            Revisa y gestiona las solicitudes
          </Text>

          {solicitudesPendientes.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Ionicons
                name="checkmark-circle-outline"
                size={48}
                color="#9CA3AF"
              />
              <Text className="text-gray-400 text-base mt-3">
                No hay solicitudes pendientes
              </Text>
            </View>
          ) : (
            solicitudesPendientes.map((solicitud: Solicitud) => {
              const isProcessing = processingIds.has(solicitud.id);
              const badgeColor = getTipoColor(solicitud.tipoPermiso);

              return (
                <View
                  key={solicitud.id}
                  className="bg-gray-800 p-5 rounded-2xl mb-4 shadow-md"
                >
                  <Text className="text-white text-xl font-bold mb-3">
                    Usuario: {solicitud.username || "Sin nombre"}
                  </Text>

                  <View
                    className="self-start px-3 py-1 rounded mb-3"
                    style={{ backgroundColor: badgeColor }}
                  >
                    <Text className="text-white text-sm font-semibold">
                      {solicitud.tipoPermiso}
                    </Text>
                  </View>

                  <Text className="text-gray-400 text-base mb-3">
                    {solicitud.motivo}
                  </Text>

                  <View className="flex-row items-center gap-2 mb-5">
                    <Ionicons
                      name="calendar-outline"
                      size={18}
                      color="#757575"
                    />
                    <Text className="text-gray-400 text-sm">
                      {formatDate(solicitud.fechaInicio)} —{" "}
                      {formatDate(solicitud.fechaFin)}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Pressable
                      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded border-2 border-red-700 bg-gray-900 ${
                        isProcessing ? "opacity-60" : ""
                      } active:bg-gray-800`}
                      onPress={() => handleRechazar(solicitud.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#D32F2F" />
                      ) : (
                        <>
                          <Ionicons
                            name="close-circle-outline"
                            size={20}
                            color="#EF4444"
                          />
                          <Text className="text-red-500 text-base font-semibold">
                            Rechazar
                          </Text>
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded bg-blue-600 ${
                        isProcessing ? "opacity-60" : ""
                      } active:bg-blue-700`}
                      onPress={() => handleAprobar(solicitud.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle-outline"
                            size={20}
                            color="#FFF"
                          />
                          <Text className="text-white text-base font-semibold">
                            Aprobar
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
