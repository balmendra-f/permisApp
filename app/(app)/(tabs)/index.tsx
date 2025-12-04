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

  const StatCard = ({ count, label, color, icon }: any) => (
    <View
      className={`p-6 rounded-2xl ${color} w-[30%] shadow-lg shadow-black/50`}
    >
      <View className="items-center">
        <View className="bg-white/20 p-2 rounded-full mb-2">
          <Ionicons name={icon} size={20} color="white" />
        </View>
        <Text className="text-white font-semibold text-sm text-center">
          {label}
        </Text>
        <Text className="text-white text-3xl font-bold mt-1">{count}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: any) => {
    const fechaInicio = item.fechaInicio?.toDate
      ? item.fechaInicio.toDate()
      : new Date(item.fechaInicio);

    const fechaFin = item.fechaFin?.toDate
      ? item.fechaFin.toDate()
      : new Date(item.fechaFin);

    const fechaFormateada = `${fechaInicio.getDate()} ${fechaInicio.toLocaleString(
      "es-ES",
      { month: "short" }
    )} - ${fechaFin.getDate()} ${fechaFin.toLocaleString("es-ES", {
      month: "short",
    })}`;

    let estadoConfig = {
      text: "",
      bgColor: "",
      textColor: "",
      icon: "",
    };

    if (item.status === "pending") {
      estadoConfig = {
        text: "Pendiente",
        bgColor: "bg-amber-500/20",
        textColor: "text-amber-400",
        icon: "time-outline",
      };
    } else if (item.status === "rejected") {
      estadoConfig = {
        text: "Denegado",
        bgColor: "bg-red-500/20",
        textColor: "text-red-400",
        icon: "close-circle-outline",
      };
    } else {
      estadoConfig = {
        text: "Aprobado",
        bgColor: "bg-emerald-500/20",
        textColor: "text-emerald-400",
        icon: "checkmark-circle-outline",
      };
    }

    return (
      <View className="bg-neutral-800/80 p-5 rounded-2xl mt-3 border border-neutral-700/50 shadow-sm shadow-black/30">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-white mb-1">
              {item.tipoPermiso}
            </Text>
            <Text className="text-gray-300 text-sm leading-5">
              {item.motivo}
            </Text>
          </View>

          <View
            className={`px-3 py-2 rounded-full ${estadoConfig.bgColor} flex-row items-center ml-3`}
          >
            <Ionicons name={estadoConfig.icon} size={14} color="white" />
            <Text
              className={`${estadoConfig.textColor} text-xs font-medium ml-1`}
            >
              {estadoConfig.text}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-neutral-700/50">
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
            <Text className="text-gray-400 ml-2 text-sm">
              {fechaFormateada}
            </Text>
          </View>

          {item.status === "pending" && (
            <TouchableOpacity onPress={() => handleCancelRequest(item.id)}>
              <Text className="text-red-400 text-sm font-semibold">
                Cancelar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
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
          renderItem={renderItem}
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
        <View className="p-4 items-center">
          {chief ? (
            <>
              <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl text-white font-bold">
                  {chief.name?.charAt(0)}
                </Text>
              </View>
              <Text className="text-xl text-white font-bold mb-1">
                {chief.name}
              </Text>
              <Text className="text-gray-400 mb-4">{chief.email}</Text>

              <View className="flex-row items-center bg-neutral-800 px-4 py-2 rounded-lg">
                <Ionicons name="briefcase-outline" size={16} color="#9CA3AF" />
                <Text className="text-gray-300 ml-2">{user?.section}</Text>
              </View>
            </>
          ) : (
            <Text className="text-gray-400">
              No se encontró información del jefe de sección.
            </Text>
          )}
        </View>
      </CustomModal>
    </Screen>
  );
};

export default PermissionsScreen;
