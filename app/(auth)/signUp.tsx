import React, { useEffect, useState } from "react";
import { View, Text, Keyboard, KeyboardAvoidingView, ScrollView, Platform, Alert } from "react-native";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase";
import createUser from "@/api/users/createUser.ts";
import useCountry from "@/hooks/useCountry";
import { useScreen } from "@/providers/ScreenProvider";
import Header from "@/components/common/Header";
import Screen from "@/components/common/Screen";
import Button from "@/components/common/Button";
import { FloatingTitleTextInputField } from "@/components/common/FloatingTitleTextInputField";

const SignUp = () => {
  const { setIsLoading } = useScreen();
  const { countryCode } = useCountry();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    password2: "",
    country: countryCode,
    section: "",
    sectionBoss: "", // Nuevo campo opcional
  });

  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      country: countryCode,
    }));
  }, [countryCode]);

  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (name: string, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSectionChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData((prevState) => ({
      ...prevState,
      section: numericValue,
    }));
  };

  const handleSectionBossChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setFormData((prevState) => ({
      ...prevState,
      sectionBoss: numericValue,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setErrorMessage("Please enter an email");
      return false;
    }
    if (!formData.name.trim()) {
      setErrorMessage("Please enter your name");
      return false;
    }
    if (!formData.section.trim()) {
      setErrorMessage("Please enter your section");
      return false;
    }
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return false;
    }
    if (formData.password !== formData.password2) {
      setErrorMessage("Passwords do not match");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    Keyboard.dismiss();
    setErrorMessage("");

    if (!validateForm()) return;

    setLocalLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const { uid } = userCredential.user;
      await createUser(uid, {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        section: formData.section,
        sectionBoss: formData.sectionBoss || null,
      });

      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      // router.replace("/"); // Handled by auth listener
    } catch (error: any) {
      const msg = error.code === "auth/email-already-in-use"
        ? "El correo ya está en uso."
        : "Error creando la cuenta.";
      setErrorMessage(msg);
      Alert.alert("Error", msg);
    } finally {
      setLocalLoading(false);
    }
  };

  const isFormIncomplete =
    !formData.email.trim() ||
    !formData.name.trim() ||
    !formData.section.trim() ||
    formData.password.length < 6 ||
    formData.password !== formData.password2;

  return (
    <Screen safeArea={false} className="bg-background">
      <Header title="Crear cuenta" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pb-10 pt-4">
            <View className="mb-6">
              <Text className="text-3xl font-bold text-foreground text-center mb-2">
                Únete
              </Text>
              <Text className="text-base text-muted-foreground text-center">
                Completa tus datos para empezar
              </Text>
            </View>

            <View className="space-y-4">
              <FloatingTitleTextInputField
                title="Correo electrónico"
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FloatingTitleTextInputField
                title="Nombre completo"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
                autoCapitalize="words"
              />

              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <FloatingTitleTextInputField
                    title="Sección"
                    value={formData.section}
                    onChange={handleSectionChange}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <FloatingTitleTextInputField
                    title="Jefatura (Opc.)"
                    value={formData.sectionBoss}
                    onChange={handleSectionBossChange}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <FloatingTitleTextInputField
                title="Contraseña"
                value={formData.password}
                onChange={(value) => handleInputChange("password", value)}
                secureTextEntry
                autoCapitalize="none"
              />

              <FloatingTitleTextInputField
                title="Confirmar contraseña"
                value={formData.password2}
                onChange={(value) => handleInputChange("password2", value)}
                secureTextEntry
                autoCapitalize="none"
              />

              {errorMessage !== "" && (
                <Text className="text-destructive text-sm text-center font-medium mt-2">
                  {errorMessage}
                </Text>
              )}
            </View>

            <Button
              label="Crear cuenta"
              onPress={onSubmit}
              disabled={isFormIncomplete}
              loading={localLoading}
              variant="primary"
              size="lg"
              className="mt-8 mb-4 shadow-md shadow-primary/30"
            />

            <View className="flex-row justify-center items-center mb-6">
              <Text className="text-muted-foreground text-sm">¿Ya tienes una cuenta? </Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default SignUp;
