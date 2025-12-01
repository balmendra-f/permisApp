import React, { useState } from "react";
import { View, Text, ScrollView, Switch, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/common/Button";
import { useThemeConfig } from "@/hooks/useThemeConfig";
import CustomModal from "@/components/common/Modal";

const Settings = () => {
  const logout = async () => {
    await signOut(auth);
  };
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme } = useThemeConfig();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const getThemeLabel = (t: string) => {
    switch (t) {
      case "light": return "Claro";
      case "dark": return "Oscuro";
      case "system": return "Sistema";
      default: return "Sistema";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-3xl font-bold text-foreground">
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
            title="Tema"
            subtitle={getThemeLabel(theme || "system")}
            icon="moon-outline"
            onPress={() => setThemeModalVisible(true)}
          />
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
                variant="destructive"
                className="border-destructive/20 bg-destructive/10"
                textClassName="text-destructive font-bold"
            />
        </View>
      </ScrollView>

      {/* Theme Modal */}
      <CustomModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        title="Seleccionar Tema"
      >
        <View className="pb-4">
          {["light", "dark", "system"].map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                setTheme(t as any);
                setThemeModalVisible(false);
              }}
              className={`flex-row justify-between items-center p-4 rounded-xl mb-2 border ${
                theme === t ? "bg-secondary border-primary" : "bg-card border-border"
              }`}
            >
              <Text className={`text-base ${theme === t ? "text-primary font-bold" : "text-foreground"}`}>
                {getThemeLabel(t)}
              </Text>
              {theme === t && (
                <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
              )}
            </Pressable>
          ))}
        </View>
      </CustomModal>
    </SafeAreaView>
  );
};

const SettingItem = ({ title, subtitle, onPress, rightElement, icon }: any) => {
  return (
    <Pressable
      className="flex-row items-center px-4 py-4 border-b border-border last:border-b-0 active:bg-secondary"
      onPress={onPress}
    >
      {icon && (
        <View className="mr-4 w-8 items-center">
            <Ionicons name={icon} size={22} color="#94a3b8" />
        </View>
      )}
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">
          {title}
        </Text>
        {subtitle && <Text className="text-sm text-muted-foreground mt-0.5">{subtitle}</Text>}
      </View>
      {rightElement ? (
          <View className="ml-2">{rightElement}</View>
      ) : (
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
      )}
    </Pressable>
  );
};

const SettingsSection = ({ title, children }: any) => (
  <View className="mb-8">
    <Text className="text-sm font-bold text-muted-foreground mb-3 pl-2 uppercase tracking-wide">
      {title}
    </Text>
    <View className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      {children}
    </View>
  </View>
);

export default Settings;
