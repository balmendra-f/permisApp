import React, { useState } from "react";
import { View, Text, ScrollView, Switch, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/common/Button";

const Settings = () => {
  const logout = async () => {
    await signOut(auth);
  };
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-bold text-slate-900">
            Ajustes
          </Text>
        </View>

        <SettingsSection title="Cuenta">
          <SettingItem
            title="Perfil"
            subtitle="Información personal"
            icon="person-outline"
            onPress={() => {}}
          />
          <SettingItem
            title="Seguridad"
            subtitle="Contraseña y acceso"
            icon="lock-closed-outline"
            onPress={() => {}}
          />
        </SettingsSection>

        <SettingsSection title="Preferencias">
          <SettingItem
            title="Notificaciones"
            subtitle="Gestionar alertas"
            icon="notifications-outline"
            onPress={() => {}}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#e2e8f0", true: "#818cf8" }}
                thumbColor={notifications ? "#4f46e5" : "#f1f5f9"}
              />
            }
          />
          <SettingItem title="Idioma" subtitle="Español" icon="language-outline" onPress={() => {}} />
        </SettingsSection>

        <SettingsSection title="Soporte">
          <SettingItem
            title="Ayuda"
            subtitle="Centro de ayuda"
            icon="help-circle-outline"
            onPress={() => {}}
          />
          <SettingItem
            title="Acerca de"
            subtitle="Versión 1.0.0"
            icon="information-circle-outline"
            onPress={() => {}}
          />
        </SettingsSection>

        <View className="mt-4 mb-10">
            <Button
                label="Cerrar sesión"
                onPress={logout}
                variant="outline"
                className="border-red-200 bg-red-50"
                textClassName="text-red-600 font-bold"
            />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingItem = ({ title, subtitle, onPress, rightElement, icon }: any) => {
  return (
    <Pressable
      className="flex-row items-center px-4 py-4 border-b border-slate-100 last:border-b-0 active:bg-slate-50"
      onPress={onPress}
    >
      {icon && (
        <View className="mr-4 w-8 items-center">
            <Ionicons name={icon} size={22} color="#64748b" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-semibold text-slate-900">
          {title}
        </Text>
        {subtitle && <Text className="text-sm text-slate-500 mt-0.5">{subtitle}</Text>}
      </View>
      {rightElement ? (
          <View className="ml-2">{rightElement}</View>
      ) : (
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
      )}
    </Pressable>
  );
};

const SettingsSection = ({ title, children }: any) => (
  <View className="mb-8">
    <Text className="text-sm font-bold text-slate-500 mb-3 pl-2 uppercase tracking-wide">
      {title}
    </Text>
    <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
      {children}
    </View>
  </View>
);

export default Settings;
