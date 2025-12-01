
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Pressable,
} from "react-native";
import React, { useState } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { useRequests } from "@/providers/RequestProvider";
import { cancelRequest } from "@/api/request/cancelRequest";
import CustomModal from "@/components/common/Modal";
import { getDocs, query, collection, where } from "firebase/firestore";
import { db } from "@/firebase";

const PermissionsScreen = () => {
  const { user } = useAuth();
  const username = user?.name;
  const { requests } = useRequests();
  const [chiefModalVisible, setChiefModalVisible] = useState(false);
  const [chief, setChief] = useState<any>(null);

  const handleCancelRequest = async (id: string) => {
    Alert.alert(
      "Cancelar Solicitud",
      "¿Estás seguro de que deseas cancelar esta solicitud?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Sí, cancelar",
          onPress: async () => {
            try {
              await cancelRequest(id);
              Alert.alert("Éxito", "Solicitud cancelada correctamente.");
            } catch (error) {
              Alert.alert("Error", "No se pudo cancelar la solicitud.");
              console.error(error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleViewChief = async () => {
      setChiefModalVisible(true);
      if (chief) return;

      try {
          if (user?.sectionBoss) {
              // Fetch by ID if stored
             // We can assume user.sectionBoss might be the name or ID.
             // If it's a string name, we display it.
             // If it's an ID, we should fetch it. Let's assume it's a Name for now based on typical small app usage, or try to fetch if it looks like an ID.
             // Actually, the requirement says "Visualize the section chiefs".
             // If sectionBoss is stored in user, let's use it.
             // But if we need to find who is admin of my section:
             const q = query(
                 collection(db, "users"),
                 where("section", "==", user.section),
                 where("isAdmin", "==", true)
             );
             const querySnapshot = await getDocs(q);
             if (!querySnapshot.empty) {
                 setChief(querySnapshot.docs[0].data());
             }
          } else {
             // Fallback: search for admin in section
             if (user?.section) {
                 const q = query(
                     collection(db, "users"),
                     where("section", "==", user.section),
                     where("isAdmin", "==", true)
                 );
                 const querySnapshot = await getDocs(q);
                 if (!querySnapshot.empty) {
                     setChief(querySnapshot.docs[0].data());
                 }
             }
          }
      } catch (error) {
          console.error("Error fetching chief", error);
      }
  };

  const pendientes = requests.filter((r: any) => r.aproved === null).length;
  const aprobados = requests.filter((r: any) => r.aproved === true).length;
  const denegados = requests.filter((r: any) => r.aproved === false).length;

  const StatCard = ({
    count,
    label,
    color,
    icon,
  }: {
    count: number;
    label: string;
    color: string;
    icon: string;
  }) => (
    <View
      className={`p-6 rounded-2xl ${color} w-[30%] shadow-lg shadow-black/50`}
    >
      <View className="items-center">
        <View className="bg-white/20 p-2 rounded-full mb-2">
          <Ionicons name={icon as any} size={20} color="white" />
        </View>
        <Text className="text-white font-semibold text-sm text-center">
          {label}
        </Text>
        <Text className="text-white text-3xl font-bold mt-1">{count}</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
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

    // Estado según aproved
    let estadoConfig = {
      text: "",
      bgColor: "",
      textColor: "",
      icon: "",
    };

    if (item.aproved === null) {
      estadoConfig = {
        text: "Pendiente",
        bgColor: "bg-amber-500/20",
        textColor: "text-amber-400",
        icon: "time-outline",
      };
    } else if (item.aproved === false) {
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
            <Ionicons
              name={estadoConfig.icon as any}
              size={14}
              color={estadoConfig.textColor.replace("text-", "")}
            />
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
                <Text className="text-gray-400 ml-2 text-sm">{fechaFormateada}</Text>
            </View>
            {item.aproved === null && (
                <TouchableOpacity onPress={() => handleCancelRequest(item.id)}>
                    <Text className="text-red-400 text-sm font-semibold">Cancelar</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="p-6 flex-1">
        {/* Header */}
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

        {/* Conteo de permisos - Mejorado */}
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

        {/* Botón nueva solicitud - Mejorado */}
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

        {/* Historial de solicitudes */}
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

      {/* Modal Jefe */}
      <CustomModal
        visible={chiefModalVisible}
        onClose={() => setChiefModalVisible(false)}
        title="Mi Jefe de Sección"
      >
        <View className="p-4 items-center">
             {chief ? (
                 <>
                    <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
                        <Text className="text-3xl text-white font-bold">{chief.name?.charAt(0)}</Text>
                    </View>
                    <Text className="text-xl text-white font-bold mb-1">{chief.name}</Text>
                    <Text className="text-gray-400 mb-4">{chief.email}</Text>
                    <View className="flex-row items-center bg-neutral-800 px-4 py-2 rounded-lg">
                        <Ionicons name="briefcase-outline" size={16} color="#9CA3AF" />
                        <Text className="text-gray-300 ml-2">{user?.section}</Text>
                    </View>
                 </>
             ) : (
                 <Text className="text-gray-400">No se encontró información del jefe de sección.</Text>
             )}
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default PermissionsScreen;
