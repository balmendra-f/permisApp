import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Pressable,
} from "react-native";
import React, { useState } from "react";
import Screen from "@/components/common/Screen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useRequests } from "@/providers/RequestProvider";
import { cancelRequest } from "@/api/request/cancelRequest";
import CustomModal from "@/components/common/Modal";
import { useBoss } from "@/components/admin/hooks/useBoss";
import StatCard from "@/components/common/StatCard";
import RequestItem from "@/components/requests/RequestItem";
import ChiefInfo from "@/components/chief/ChiefInfo";

const PermissionsScreen = () => {
  const { user } = useAuth();
  const username = user?.name;
  const { requests } = useRequests();
  const [chiefModalVisible, setChiefModalVisible] = useState(false);
  const { chief, loadChief } = useBoss(user?.section);

  const pendientes = requests.filter((r) => r.status === "pending").length;
  const aprobados = requests.filter((r) => r.status === "approved").length;
  const denegados = requests.filter((r) => r.status === "rejected").length;

  const handleCancelRequest = async (id: string) => {
    Alert.alert(
      "Cancelar Solicitud",
      "¿Estás seguro de que deseas cancelar esta solicitud?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelRequest(id);
              Alert.alert("Éxito", "Solicitud cancelada correctamente.");
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar la solicitud.");
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleViewChief = async () => {
    setChiefModalVisible(true);
    await loadChief();
  };

  return (
    <Screen>
      <View className="p-6 flex-1">
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Text className="text-3xl font-bold text-white mb-1">
              Mis Permisos
            </Text>
            <Text className="text-base text-gray-300">
              Bienvenido, <Text className="text-blue-400">{username}</Text>
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleViewChief}
            className="bg-neutral-800 p-2 rounded-full border border-neutral-700"
          >
            <Ionicons name="people-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-6">
          <StatCard
            count={pendientes}
            label="Pendientes"
            color="bg-amber-500"
            icon="time-outline"
          />
          <StatCard
            count={aprobados}
            label="Aprobados"
            color="bg-emerald-500"
            icon="checkmark-circle-outline"
          />
          <StatCard
            count={denegados}
            label="Denegados"
            color="bg-red-500"
            icon="close-circle-outline"
          />
        </View>

        <Pressable
          className="bg-blue-600 p-5 rounded-2xl flex-row justify-center items-center mb-8 shadow-lg shadow-blue-600/30 active:bg-blue-700"
          onPress={() => router.push("/request/page")}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <View className="bg-white/20 p-1 rounded-full">
            <Ionicons name="add" size={20} color="white" />
          </View>
          <Text className="text-white text-lg font-semibold ml-3">
            Nueva Solicitud
          </Text>
        </Pressable>

        <View className="mb-4">
          <Text className="text-xl font-bold text-white mb-1">
            Mis Solicitudes
          </Text>
          <Text className="text-sm text-gray-400">
            Historial de permisos solicitados
          </Text>
        </View>

        <FlatList
          data={requests}
          renderItem={({ item }) => (
            <RequestItem item={item} onCancel={handleCancelRequest} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <CustomModal
        visible={chiefModalVisible}
        onClose={() => setChiefModalVisible(false)}
        title="Mi Jefe de Sección"
      >
        <ChiefInfo chief={chief} userSection={user?.section} />
      </CustomModal>
    </Screen>
  );
};

export default PermissionsScreen;
