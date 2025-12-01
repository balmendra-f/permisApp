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
import { useColorScheme } from "nativewind";

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
  const { colorScheme } = useColorScheme();

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

  const isDark = colorScheme === 'dark';

  if (!section) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center gap-4">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="text-muted-foreground text-base">
            Tu usuario no tiene una sección asignada
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center gap-4">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="text-muted-foreground text-base">
            Cargando solicitudes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Encabezado */}
        <View className="flex-row justify-between items-center p-6 bg-card border-b border-border">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-full bg-primary/10 justify-center items-center">
              <Ionicons name="shield-checkmark" size={24} className="text-primary" />
            </View>
            <View>
              <Text className="text-foreground text-2xl font-bold">
                Panel Admin
              </Text>
              <Text className="text-muted-foreground text-sm">{user?.name}</Text>
            </View>
          </View>
          <Pressable className="p-2 bg-secondary rounded-full border border-border">
            <MaterialIcons name="logout" size={20} className="text-muted-foreground" />
          </Pressable>
        </View>

        {/* Indicador de número de solicitudes */}
        <View className="mx-6 mt-6 bg-card p-6 rounded-2xl shadow-sm border border-border">
          <Text className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wide">
            Solicitudes Pendientes
          </Text>
          <Text className="text-primary text-4xl font-extrabold">
            {solicitudesPendientes.length}
          </Text>
        </View>

        {/* Lista */}
        <View className="px-6 py-6">
          <View className="mb-4">
            <Text className="text-foreground text-xl font-bold">
              Por Aprobar
            </Text>
            <Text className="text-muted-foreground text-sm">
              Revisa y gestiona las solicitudes de tu sección
            </Text>
          </View>

          {solicitudesPendientes.length === 0 ? (
            <View className="items-center justify-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <View className="w-16 h-16 bg-secondary rounded-full items-center justify-center mb-4">
                  <Ionicons
                    name="checkmark-done"
                    size={32}
                    className="text-muted-foreground"
                  />
              </View>
              <Text className="text-muted-foreground text-base font-medium">
                Todo al día
              </Text>
              <Text className="text-muted-foreground/70 text-xs mt-1">
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
                  className="bg-card p-5 rounded-2xl mb-4 shadow-sm border border-border"
                >
                  <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text className="text-foreground text-lg font-bold">
                             {solicitud.username || "Sin nombre"}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: badgeColor }} />
                            <Text className="text-muted-foreground text-xs font-medium uppercase">
                                {solicitud.tipoPermiso}
                            </Text>
                        </View>
                      </View>

                  </View>

                  <Text className="text-foreground/80 text-base mb-4 leading-6">
                    {solicitud.motivo}
                  </Text>

                  <View className="flex-row items-center gap-2 mb-6 bg-secondary p-3 rounded-xl">
                    <Ionicons
                      name="calendar"
                      size={18}
                      className="text-muted-foreground"
                    />
                    <Text className="text-foreground text-sm font-medium">
                      {formatDate(solicitud.fechaInicio)} <Text className="text-muted-foreground">-</Text> {formatDate(solicitud.fechaFin)}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <Button
                        label="Rechazar"
                        onPress={() => handleRechazar(solicitud.id)}
                        variant="outline"
                        className="flex-1 border-destructive/20 bg-destructive/5"
                        textClassName="text-destructive"
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
