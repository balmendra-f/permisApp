import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  Image,
  Pressable,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useScreen } from "../../providers/ScreenProvider";
import { router } from "expo-router";
import Header from "@/components/common/Header";
import Screen from "@/components/common/Screen";
import Button from "@/components/common/Button";
import { FloatingTitleTextInputField } from "@/components/common/FloatingTitleTextInputField";

const Forgot = () => {
  const auth = getAuth();
  const { setIsLoading } = useScreen();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const onSubmit = async () => {
    setLoading(true);
    if (!isValidEmail(email)) {
      setError(true);
      setErrorMessage("Ingresa un correo electrónico válido");
      setLoading(false);
      return;
    }

    setError(false);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Correo enviado",
        `Hemos enviado un enlace para restablecer tu contraseña a ${email}. Revisa tu bandeja de entrada.`,
        [{ text: "OK" }]
      );
      router.push("/(auth)");
    } catch (error) {
      setError(true);
      setErrorMessage(
        "Error al enviar el correo. Verifica que la cuenta exista."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen safeArea={false} className="bg-background">
      <Header title="Recuperar cuenta" />
      <View className="flex-1 p-6 justify-center">
        <View className="items-center mb-10">
          <View className="bg-card p-4 rounded-3xl shadow-sm mb-6 border border-border">
            <Image
              source={require("../../assets/images/icon.png")}
              className="h-24 w-24"
              resizeMode="contain"
            />
          </View>

          <Text className="text-3xl font-bold text-foreground text-center mb-2">
            Restablecer contraseña
          </Text>
          <Text className="text-base text-muted-foreground text-center mb-8 max-w-xs">
            Ingresa tu correo para recibir instrucciones
          </Text>
        </View>

        <View className="mb-6 w-full max-w-md self-center">
          <FloatingTitleTextInputField
            title="Correo electrónico"
            value={email}
            onChange={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            error={error ? errorMessage : undefined}
            touched={error}
          />

          <Button
            label="Enviar enlace"
            onPress={onSubmit}
            loading={loading}
            variant="primary"
            size="lg"
            className="mt-4 mb-6 shadow-md shadow-primary/30"
          />

          <View className="flex-row justify-center items-center">
            <Text className="text-muted-foreground text-sm">
              ¿Recordaste tu contraseña?{" "}
            </Text>
            <Button
              label="Iniciar sesión"
              onPress={() => router.push("/(auth)")}
              variant="ghost"
              size="sm"
              className="px-1 h-auto"
              textClassName="text-primary font-bold"
            />
          </View>
        </View>
      </View>
    </Screen>
  );
};

export default Forgot;
