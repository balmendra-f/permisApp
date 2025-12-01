import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useScreen } from "@/providers/ScreenProvider";
import { auth } from "@/firebase";
import Screen from "@/components/common/Screen";
import Button from "@/components/common/Button";
import { FloatingTitleTextInputField } from "@/components/common/FloatingTitleTextInputField";

export default function LoginScreen() {
  const { setIsLoading } = useScreen();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loadingLocal, setLoadingLocal] = useState(false);

  const goToForgot = () => router.push("/(auth)/forgot");

  const handleInputChange = (name: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value.trim(),
    }));
  };

  const onSubmit = async () => {
    const password = formData.password;

    if (password.trim().length < 6) {
      Alert.alert("Error", "Ingresa una contraseña de al menos 6 caracteres");
      return;
    }

    Keyboard.dismiss();
    setLoadingLocal(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, password);
    } catch (error) {
      Alert.alert("Error", "Correo o contraseña inválida", [{ text: "OK" }], {
        cancelable: false,
      });
      setLoadingLocal(false);
    }
  };

  return (
    <Screen safeArea={false} className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-8 justify-center min-h-screen pb-10">
            <View className="items-center mb-10">
              <View className="bg-card p-4 rounded-3xl shadow-sm mb-6 border border-border">
                <Image
                  source={require("../../assets/images/icon.png")}
                  className="h-24 w-24"
                  resizeMode="contain"
                />
              </View>
              <Text className="text-3xl font-bold text-foreground text-center mb-2">
                Bienvenido
              </Text>
              <Text className="text-base text-muted-foreground text-center max-w-xs">
                Inicia sesión para gestionar tus permisos de salud.
              </Text>
            </View>

            <View className="mb-8 w-full max-w-md self-center">
              <FloatingTitleTextInputField
                title="Correo electrónico"
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FloatingTitleTextInputField
                title="Contraseña"
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <Button
                label="¿Olvidaste tu contraseña?"
                onPress={goToForgot}
                variant="ghost"
                size="sm"
                className="self-end mb-4 px-0 h-auto"
                textClassName="text-muted-foreground font-normal"
              />

              <Button
                label="Iniciar sesión"
                onPress={onSubmit}
                loading={loadingLocal}
                variant="primary"
                size="lg"
                className="mb-6 shadow-md shadow-primary/30"
              />

              <View className="flex-row justify-center items-center">
                <Text className="text-muted-foreground text-sm">¿No tienes una cuenta? </Text>
                <Button
                  label="Regístrate"
                  onPress={() => router.push("/(auth)/signUp")}
                  variant="ghost"
                  size="sm"
                  className="px-1 h-auto"
                  textClassName="text-primary font-bold"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
