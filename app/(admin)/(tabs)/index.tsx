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
import Button from "@/components/common/Button";
import { Colors } from "@/constants/Colors";

interface Solicitud {
  id: string;
  userId: string;
  section: string | null;
  tipoPermiso: string;
  motivo: string;
  fechaInicio: any;
  fechaFin: any;
  aproved: boolean | null;
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
    (req: Solicitud) => req.aproved === null && req.section === section
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
      Vacaciones: "#3b82f6", // Blue 500
      "Permiso Personal": "#a855f7", // Purple 500
      "Licencia Médica": "#10b981", // Emerald 500
      "Día Libre": "#f59e0b", // Amber 500
    };
    return colores[tipo] || "#64748b"; // Slate 500
  };

  const handleAprobar = async (id: string) => {
    try {
      setProcessingIds((prev) => new Set(prev).add(id));
      await updateRequestById(id, { aproved: true, isPending: false });
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
              await updateRequestById(id, { aproved: false, isPending: false });
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
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 justify-center items-center gap-4">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-slate-400 text-base">
            Tu usuario no tiene una sección asignada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-slate-400 text-base">
            Cargando solicitudes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView className="flex-1">
        {/* Encabezado */}
        <View className="flex-row justify-between items-center p-6 bg-white border-b border-slate-100">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-indigo-100 justify-center items-center">
              <Ionicons name="shield-checkmark" size={24} color="#4f46e5" />
            </View>
            <View>
              <Text className="text-slate-900 text-2xl font-bold">
                Panel Admin
              </Text>
              <Text className="text-slate-500 text-sm">{user?.name}</Text>
            </View>
          </View>
          <Pressable className="p-2 bg-slate-50 rounded-full border border-slate-100">
            <MaterialIcons name="logout" size={20} color="#64748b" />
          </Pressable>
        </View>

        {/* Indicador de número de solicitudes */}
        <View className="mx-6 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <Text className="text-slate-500 text-sm font-medium mb-1 uppercase tracking-wide">
            Solicitudes Pendientes
          </Text>
          <Text className="text-indigo-600 text-4xl font-extrabold">
            {solicitudesPendientes.length}
          </Text>
        </View>

        {/* Lista */}
        <View className="px-6 py-6">
          <View className="mb-4">
            <Text className="text-slate-900 text-xl font-bold">
              Por Aprobar
            </Text>
            <Text className="text-slate-500 text-sm">
              Revisa y gestiona las solicitudes de tu sección
            </Text>
          </View>

          {solicitudesPendientes.length === 0 ? (
            <View className="items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
                  <Ionicons
                    name="checkmark-done"
                    size={32}
                    color="#94a3b8"
                  />
              </View>
              <Text className="text-slate-400 text-base font-medium">
                Todo al día
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
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
                  className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100"
                >
                  <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text className="text-slate-900 text-lg font-bold">
                             {solicitud.username || "Sin nombre"}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: badgeColor }} />
                            <Text className="text-slate-500 text-xs font-medium uppercase">
                                {solicitud.tipoPermiso}
                            </Text>
                        </View>
                      </View>

                  </View>

                  <Text className="text-slate-600 text-base mb-4 leading-6">
                    {solicitud.motivo}
                  </Text>

                  <View className="flex-row items-center gap-2 mb-6 bg-slate-50 p-3 rounded-xl">
                    <Ionicons
                      name="calendar"
                      size={18}
                      color="#64748b"
                    />
                    <Text className="text-slate-700 text-sm font-medium">
                      {formatDate(solicitud.fechaInicio)} <Text className="text-slate-400">-</Text> {formatDate(solicitud.fechaFin)}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Button
                        label="Rechazar"
                        onPress={() => handleRechazar(solicitud.id)}
                        variant="outline"
                        className="flex-1 border-red-200 bg-red-50"
                        textClassName="text-red-600"
                        loading={isProcessing}
                        disabled={isProcessing}
                    />
                    <Button
                        label="Aprobar"
                        onPress={() => handleAprobar(solicitud.id)}
                        variant="primary"
                        className="flex-1"
                        loading={isProcessing}
                        disabled={isProcessing}
                    />
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
