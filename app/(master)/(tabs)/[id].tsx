"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useGetUser, useUpdateUser } from "@/hooks/useUsers";
import Screen from "@/components/common/Screen";

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
  const { getUser } = useGetUser();
  const { updateUser } = useUpdateUser();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        const data = await getUser(id as string);
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
    if (!timestamp?.seconds) return "No disponible";

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);

    const ok = await updateUser(user.id, {
      name: user.name,
      email: user.email,
      section: user.section,
      country: user.country,
      vacationsInDays: user.vacationsInDays,
      vacationUsedInDays: user.vacationUsedInDays,
      administrativeDays: user.administrativeDays,
      timeReturnsInHours: user.timeReturnsInHours,
    });

    setSaving(false);

    if (ok) setEditing(false);
    else alert("❌ Error al actualizar usuario");
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-400 mt-3">Cargando usuario...</Text>
      </Screen>
    );
  }

  if (!user) {
    return (
      <Screen>
        <Text className="text-gray-400">Usuario no encontrado</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white">Volver</Text>
        </Pressable>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* VOLVER */}
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center mb-6 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={22} color="#3B82F6" />
          <Text className="text-blue-500 ml-2">Volver</Text>
        </Pressable>

        {/* INFO PRINCIPAL */}
        <View className="bg-gray-800 p-6 rounded-2xl shadow-md mb-4">
          {/* NOMBRE */}
          <Field
            label="Nombre"
            icon="person"
            editing={editing}
            value={user.name}
            onChange={(t) => setUser({ ...user, name: t })}
          />

          {/* EMAIL */}
          <Field
            label="Correo"
            icon="mail"
            editing={editing}
            value={user.email}
            onChange={(t) => setUser({ ...user, email: t })}
          />

          {/* SECCIÓN */}
          <Field
            label="Sección"
            icon="briefcase"
            editing={editing}
            value={user.section}
            onChange={(t) => setUser({ ...user, section: t })}
          />

          {/* PAÍS */}
          <Field
            label="País"
            icon="location"
            editing={editing}
            value={user.country}
            onChange={(t) => setUser({ ...user, country: t })}
          />

          {/* FECHA */}
          <View className="mt-5">
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={18} color="#9CA3AF" />
              <Text className="text-gray-400 ml-3">Creado</Text>
            </View>
            <Text className="text-gray-400 ml-9">
              {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>

        {/* ROLES */}
        <View className="bg-gray-800 p-6 rounded-2xl shadow-md mb-4">
          <Text className="text-white text-lg font-bold mb-3">
            Roles y Permisos
          </Text>

          <RoleRow icon="star" active={user.isMaster} label="Cuenta Master" />

          <RoleRow icon="shield" active={user.isAdmin} label="Administrador" />
        </View>

        {/* VACACIONES */}
        <View className="bg-gray-800 p-6 rounded-2xl shadow-md mb-4">
          <Text className="text-white text-lg font-bold mb-3">
            Vacaciones y Permisos
          </Text>

          <NumberField
            label="Días de vacaciones"
            icon="sunny"
            value={user.vacationsInDays}
            color="#10B981"
            editing={editing}
            onChange={(t) =>
              setUser({ ...user, vacationsInDays: Number(t) || 0 })
            }
          />

          <NumberField
            label="Vacaciones usadas"
            icon="checkmark-circle"
            value={user.vacationUsedInDays}
            color="#EF4444"
            editing={editing}
            onChange={(t) =>
              setUser({ ...user, vacationUsedInDays: Number(t) || 0 })
            }
          />

          <NumberField
            label="Días administrativos"
            icon="document-text"
            value={user.administrativeDays}
            color="#8B5CF6"
            editing={editing}
            onChange={(t) =>
              setUser({ ...user, administrativeDays: Number(t) || 0 })
            }
          />

          <NumberField
            label="Horas de regreso"
            icon="time"
            value={user.timeReturnsInHours}
            color="#F59E0B"
            editing={editing}
            onChange={(t) =>
              setUser({ ...user, timeReturnsInHours: Number(t) || 0 })
            }
          />
        </View>

        {/* ID */}
        <View className="bg-gray-800 p-4 rounded-2xl shadow-md">
          <Text className="text-gray-500 text-xs mb-1">ID de Usuario</Text>
          <Text className="text-gray-400 text-xs font-mono">{user.id}</Text>
        </View>

        {/* BOTONES */}
        <View className="mt-6">
          {!editing ? (
            <Pressable
              onPress={() => setEditing(true)}
              className="bg-blue-600 p-3 rounded-xl"
            >
              <Text className="text-white text-center font-semibold">
                Editar usuario
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSave}
              disabled={saving}
              className={`p-3 rounded-xl ${
                saving ? "bg-gray-500" : "bg-green-600"
              }`}
            >
              <Text className="text-white text-center font-semibold">
                {saving ? "Guardando..." : "Guardar cambios"}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

/* -------------------------- COMPONENTES LIMPIOS -------------------------- */

function Field({ label, icon, value, editing, onChange }: { label: string, icon: any, value: any, editing: boolean, onChange: (text: string) => void }) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-1">
        <Ionicons name={icon} size={18} color="#9CA3AF" />
        <Text className="text-gray-300 ml-3">{label}</Text>
      </View>

      {editing ? (
        <TextInput
          value={value || ""}
          onChangeText={onChange}
          className="bg-gray-700 text-white px-3 py-2 rounded-lg mt-1"
        />
      ) : (
        <Text className="text-gray-400 ml-9">{value || "-"}</Text>
      )}
    </View>
  );
}

function NumberField({ label, icon, value, editing, onChange, color }: { label: string, icon: any, value: any, editing: boolean, onChange: (text: string) => void, color: string }) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-1">
        <Ionicons name={icon} size={18} color={color} />
        <Text className="text-gray-300 ml-3">{label}</Text>
      </View>

      {editing ? (
        <TextInput
          value={String(value ?? 0)}
          keyboardType="numeric"
          onChangeText={onChange}
          className="bg-gray-700 text-white px-3 py-2 rounded-lg w-28 mt-1"
        />
      ) : (
        <Text className="text-gray-400 ml-9">
          {value ?? 0} {label.includes("Horas") ? "hrs" : "días"}
        </Text>
      )}
    </View>
  );
}

function RoleRow({ icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <View className="flex-row items-center mb-3">
      <Ionicons
        name={active ? icon : `${icon}-outline`}
        size={20}
        color={active ? "#3B82F6" : "#9CA3AF"}
      />
      <Text
        className={`ml-3 ${
          active ? "text-blue-400 font-semibold" : "text-gray-400"
        }`}
      >
        {active ? `✓ ${label}` : label}
      </Text>
    </View>
  );
}
