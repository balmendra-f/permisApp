import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/providers/AuthProvider";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";

const getRequestsByUser = (userId: string, callback: (data: any[]) => void) => {
  const q = query(collection(db, "solicitudes"), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

const PermissionsScreen = () => {
  const { user } = useAuth();
  const username = user?.name;
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = getRequestsByUser(user.id, setRequests);

    return () => unsubscribe();
  }, [user?.id]);

  const pendientes = requests.filter((r) => r.aproved === null).length;
  const aprobados = requests.filter((r) => r.aproved === true).length;
  const denegados = requests.filter((r) => r.aproved === false).length;

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

    let estadoConfig = { text: "", bgColor: "", textColor: "", icon: "" };
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

        <View className="flex-row items-center pt-3 border-t border-neutral-700/50">
          <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
          <Text className="text-gray-400 ml-2 text-sm">{fechaFormateada}</Text>
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

        <TouchableOpacity
          className="bg-blue-600 p-5 rounded-2xl flex-row justify-center items-center mb-8 shadow-lg shadow-blue-600/30 active:bg-blue-700"
          onPress={() => router.push("/request/page")}
        >
          <View className="bg-white/20 p-1 rounded-full">
            <Ionicons name="add" size={20} color="white" />
          </View>
          <Text className="text-white text-lg font-semibold ml-3">
            Nueva Solicitud
          </Text>
        </TouchableOpacity>

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
    </SafeAreaView>
  );
};

export default PermissionsScreen;
