
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
import { Colors } from "@/constants/Colors";

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
      className={`p-4 rounded-xl bg-white w-[30%] shadow-sm shadow-slate-200 border border-slate-100`}
    >
      <View className="items-center">
        <View className={`p-2 rounded-full mb-2 ${color} bg-opacity-10`}>
          <Ionicons name={icon as any} size={20} color={
              color.includes("emerald") ? "#10b981" :
              color.includes("red") ? "#ef4444" :
              "#f59e0b"
          } />
        </View>
        <Text className="text-slate-500 font-medium text-xs text-center">
          {label}
        </Text>
        <Text className="text-slate-900 text-2xl font-bold mt-1">{count}</Text>
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

    let estadoConfig = {
      text: "",
      bgColor: "",
      textColor: "",
      icon: "",
    };

    if (item.aproved === null) {
      estadoConfig = {
        text: "Pendiente",
        bgColor: "bg-amber-50",
        textColor: "text-amber-600",
        icon: "time-outline",
      };
    } else if (item.aproved === false) {
      estadoConfig = {
        text: "Denegado",
        bgColor: "bg-red-50",
        textColor: "text-red-600",
        icon: "close-circle-outline",
      };
    } else {
      estadoConfig = {
        text: "Aprobado",
        bgColor: "bg-emerald-50",
        textColor: "text-emerald-600",
        icon: "checkmark-circle-outline",
      };
    }

    return (
      <View className="bg-white p-5 rounded-2xl mt-3 border border-slate-100 shadow-sm shadow-slate-200">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-semibold text-slate-900 mb-1">
              {item.tipoPermiso}
            </Text>
            <Text className="text-slate-500 text-sm leading-5">
              {item.motivo}
            </Text>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full ${estadoConfig.bgColor} flex-row items-center ml-3`}
          >
            <Ionicons
              name={estadoConfig.icon as any}
              size={14}
              color={
                  item.aproved === null ? "#d97706" :
                  item.aproved === false ? "#dc2626" :
                  "#059669"
              }
            />
            <Text
              className={`${estadoConfig.textColor} text-xs font-semibold ml-1`}
            >
              {estadoConfig.text}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
            <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text className="text-slate-500 ml-2 text-sm">{fechaFormateada}</Text>
            </View>
            {item.aproved === null && (
                <TouchableOpacity onPress={() => handleCancelRequest(item.id)}>
                    <Text className="text-red-500 text-sm font-semibold">Cancelar</Text>
                </TouchableOpacity>
            )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Text className="text-3xl font-bold text-slate-900 mb-1">
              Mis Permisos
            </Text>
            <Text className="text-base text-slate-500">
              Bienvenido, <Text className="text-indigo-600 font-medium">{username}</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleViewChief}
            className="bg-white p-2 rounded-full border border-slate-200 shadow-sm"
          >
             <Ionicons name="people-outline" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Conteo de permisos - Mejorado */}
        <View className="flex-row justify-between mb-6">
          <StatCard
            count={pendientes}
            label="Pendientes"
            color="bg-amber-100"
            icon="time-outline"
          />
          <StatCard
            count={aprobados}
            label="Aprobados"
            color="bg-emerald-100"
            icon="checkmark-circle-outline"
          />
          <StatCard
            count={denegados}
            label="Denegados"
            color="bg-red-100"
            icon="close-circle-outline"
          />
        </View>

        {/* Botón nueva solicitud */}
        <Pressable
          className="bg-primary p-4 rounded-xl flex-row justify-center items-center mb-8 shadow-lg shadow-indigo-200 active:opacity-90"
          onPress={() => router.push("/request/page")}
          style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
        >
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text className="text-white text-lg font-semibold ml-2">
            Nueva Solicitud
          </Text>
        </Pressable>

        {/* Historial de solicitudes */}
        <View className="mb-4">
          <Text className="text-xl font-bold text-slate-900 mb-1">
            Mis Solicitudes
          </Text>
          <Text className="text-sm text-slate-500">
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
                    <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4">
                        <Text className="text-3xl text-indigo-600 font-bold">{chief.name?.charAt(0)}</Text>
                    </View>
                    <Text className="text-xl text-slate-900 font-bold mb-1">{chief.name}</Text>
                    <Text className="text-slate-500 mb-4">{chief.email}</Text>
                    <View className="flex-row items-center bg-slate-100 px-4 py-2 rounded-lg">
                        <Ionicons name="briefcase-outline" size={16} color="#64748b" />
                        <Text className="text-slate-600 ml-2">{user?.section}</Text>
                    </View>
                 </>
             ) : (
                 <Text className="text-slate-400">No se encontró información del jefe de sección.</Text>
             )}
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

export default PermissionsScreen;
