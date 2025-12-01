import React, { useState } from "react";
import {
  View,
  TextInput,
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

const Forgot = () => {
  const auth = getAuth();
  const { setIsLoading } = useScreen();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const onSubmit = async () => {
    setIsLoading(true);
    if (!isValidEmail(email)) {
      setError(true);
      setErrorMessage("Ingresa un correo electrónico válido");
      setIsLoading(false);
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
        "Error al enviar el correo de restablecimiento. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen>
      <Header title="¿Olvidaste tu contraseña?" />
      <View className="flex-1 p-6 justify-center">
        <View className="items-center mb-16">
          <Image
            source={require("../../assets/images/icon.png")}
            className="h-40 w-40 mt-20 rounded-full"
            resizeMode="contain"
          />
        </View>

        <Text className="text-3xl font-bold text-white text-center mb-2">
          Restablecer contraseña
        </Text>
        <Text className="text-base text-gray-400 text-center mb-8">
          Ingresa tu correo para recibir instrucciones
        </Text>

        <View className="mb-6">
          <TextInput
            className="bg-neutral-800 rounded-xl p-4 mb-2 text-white text-base"
            placeholder="Correo electrónico"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          {error && (
            <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
          )}
        </View>

        <Pressable
          onPress={onSubmit}
          className="bg-indigo-700 rounded-xl p-4 items-center mb-4 active:opacity-80"
        >
          <Text className="text-white text-base font-semibold">
            Enviar enlace
          </Text>
        </Pressable>

        <View className="flex-row justify-center items-center">
          <Text className="text-gray-400 text-sm">
            ¿Recordaste tu contraseña?{" "}
          </Text>
          <Pressable
            onPress={() => router.push("/(auth)")}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text className="text-indigo-500 text-sm font-semibold">
              Iniciar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
};

export default Forgot;
