"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import Screen from "@/components/common/Screen";
import DateTimePicker from "@/components/common/DateTimePicker";
import CustomModal, { colors } from "@/components/common/Modal";
import { createRequest } from "@/api/request/createRequest";
import { getRequestsByUser } from "@/api/request/getRequestByUser";
import { useFileUpload } from "@/components/request/hook/UseFileUpload";
import { useAuth } from "@/providers/AuthProvider";

const tiposPermiso = [
  "Vacaciones",
  "Permiso Médico",
  "Permiso Personal",
  "Licencia por Maternidad",
  "Licencia por Paternidad",
  "Permiso por Fallecimiento",
  "Permiso por Estudio",
  "Otro",
];

const opcionesSaldo = [
  { label: "Vacaciones", value: "vacationsInDays" },
  { label: "Administrativo", value: "administrativeDays" },
];

export default function NuevaSolicitudForm() {
  const { user } = useAuth();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const section = user?.section;

  const [userData, setUserData] = useState<User | null>(user);
  const [takenDates, setTakenDates] = useState<Date[]>([]);

  useEffect(() => {
      if (!user) return;

      const ref = doc(db, "users", user.id);

      const unsubscribe = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          setUserData(snap.data() as User);
        }
      });

      // Fetch user requests to mark taken dates
      const unsubscribeRequests = getRequestsByUser(user.id, (data: any[]) => {
          const dates: Date[] = [];
          data.forEach(req => {
              if (req.aproved === true) { // Only approved requests
                  let start = req.fechaInicio?.toDate ? req.fechaInicio.toDate() : new Date(req.fechaInicio);
                  let end = req.fechaFin?.toDate ? req.fechaFin.toDate() : new Date(req.fechaFin);

                  // Normalize
                  start.setHours(0,0,0,0);
                  end.setHours(0,0,0,0);

                  // Add all dates in range
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                      dates.push(new Date(d));
                  }
              }
          });
          setTakenDates(dates);
      });

      return () => {
          unsubscribe();
          unsubscribeRequests();
      };
    }, [user]);

  const [tipoPermiso, setTipoPermiso] = useState("Vacaciones");
  const [tipoSaldo, setTipoSaldo] = useState("vacationsInDays");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [motivo, setMotivo] = useState("");
  const [documento, setDocumento] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saldoModalVisible, setSaldoModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  // Soporte para horas
  const [esPorHoras, setEsPorHoras] = useState(false);
  const [horaInicio, setHoraInicio] = useState<Date | null>(new Date());
  const [horaFin, setHoraFin] = useState<Date | null>(new Date(new Date().setHours(new Date().getHours() + 1)));


  const {
    uploading,
    progress,
    uploadedFile,
    pickDocument,
    pickImage,
    resetUpload,
  } = useFileUpload(`solicitudes/documentos/${userId}`);

  useEffect(() => {
    if (uploadedFile) setDocumento(uploadedFile.url);
  }, [uploadedFile]);

  const calcularDias = (inicio: Date, fin: Date) => {
    const diffTime = Math.abs(fin.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // incluye el día inicial
  };

  const calcularHoras = (inicio: Date, fin: Date) => {
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      return Math.round((diffTime / (1000 * 60 * 60)) * 10) / 10;
  };

  const handleSubmit = async () => {
    if (!fechaInicio || (!fechaFin && !esPorHoras)) {
      Alert.alert("Error", "Por favor selecciona las fechas de inicio y fin.");
      return;
    }

    if (!esPorHoras && fechaFin && fechaInicio > fechaFin) {
      Alert.alert(
        "Error",
        "La fecha de inicio no puede ser mayor a la fecha de fin."
      );
      return;
    }

    if (esPorHoras && horaInicio && horaFin && horaInicio >= horaFin) {
        Alert.alert(
            "Error",
            "La hora de inicio no puede ser mayor o igual a la hora de fin."
        );
        return;
    }

    let diasSolicitados = 0;

    if (esPorHoras && horaInicio && horaFin) {
        const horas = calcularHoras(horaInicio, horaFin);
        // Convertir horas a días (1 día = 8 horas para validación de saldo, pero se guarda el valor en el backend como sea necesario)
        // Como el sistema actual descuenta diasSolicitados directamente, enviaremos la fraccion.
        diasSolicitados = horas / 8;
    } else if (fechaFin) {
        diasSolicitados = calcularDias(fechaInicio, fechaFin);
    }

    if (!userData) return;

    const diasDisponibles =
      tipoSaldo === "vacationsInDays"
        ? userData.vacationsInDays - (userData.vacationUsedInDays || 0)
        : userData.administrativeDays;

    if (diasSolicitados <= 0) {
        Alert.alert("Error", "La cantidad solicitada debe ser mayor a 0.");
        return;
    }

    if (diasSolicitados > diasDisponibles) {
      Alert.alert(
        "Saldo insuficiente",
        `Solicitas ${Number(diasSolicitados.toFixed(2))} día(s) pero solo tienes ${Number(diasDisponibles.toFixed(2))} día(s) disponible(s) en ${
          tipoSaldo === "vacationsInDays" ? "vacaciones" : "administrativo"
        }.`
      );
      return;
    }

    if (!motivo.trim()) {
      Alert.alert("Error", "Por favor describe el motivo de tu solicitud.");
      return;
    }

    try {
      const solicitud = {
        tipoPermiso,
        tipoSaldo,
        fechaInicio,
        fechaFin: esPorHoras ? fechaInicio : fechaFin, // Si es por horas, la fecha fin es el mismo dia
        horaInicio: esPorHoras ? horaInicio : null,
        horaFin: esPorHoras ? horaFin : null,
        esPorHoras,
        motivo,
        documento: documento || null,
        documentoNombre: uploadedFile?.fileName || null,
        username: userData.name,
        section,
        diasSolicitados,
      };

      await createRequest(solicitud);

      Alert.alert(
        "Solicitud enviada",
        "Tu solicitud ha sido enviada con éxito.",
        [
          {
            text: "OK",
            onPress: () => {
              resetUpload();
              router.back();
            },
          },
        ]
      );
    } catch (e) {
      console.error("Error adding document: ", e);
      Alert.alert("Error", "Hubo un error al enviar tu solicitud.");
    }
  };

  const handleFileUpload = () => setUploadModalVisible(true);

  const handleSelectUploadOption = async (option: "document" | "image") => {
    setUploadModalVisible(false);
    if (option === "document") await pickDocument();
    else await pickImage();
  };

  const handleRemoveFile = () => {
    Alert.alert(
      "Eliminar documento",
      "¿Deseas eliminar el documento adjunto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setDocumento(null);
            resetUpload();
          },
        },
      ]
    );
  };

  const handleSelectTipoPermiso = (tipo: string) => {
    setTipoPermiso(tipo);
    setModalVisible(false);
  };

  const handleSelectTipoSaldo = (tipo: string) => {
    setTipoSaldo(tipo);
    setSaldoModalVisible(false);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="px-6 pt-6 pb-6">
            <View className="flex-row items-center mb-4">
              <TouchableOpacity className="mr-4" onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-3xl font-bold text-white">
                  Nueva Solicitud
                </Text>
                <Text className="text-base text-gray-400 mt-1">
                  Completa el formulario
                </Text>
              </View>
            </View>
          </View>

          <View className="mx-4 mb-6 bg-neutral-800 rounded-2xl p-6 shadow-lg">
            <Text className="text-lg font-semibold text-gray-300 mb-4">
              Saldo disponible:
            </Text>
            <View className="mb-6">
              <Text className="text-base text-gray-300 mb-1">
                Vacaciones: {userData ? (userData.vacationsInDays - userData.vacationUsedInDays).toFixed(2) : 0}{" "}
                días
              </Text>
              <Text className="text-base text-gray-300">
                Administrativos: {userData?.administrativeDays} días
              </Text>
            </View>

            {/* Tipo de Permiso */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-white mb-2">
                Tipo de Permiso
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="flex-row items-center justify-between border border-neutral-600 rounded-lg px-4 py-3 bg-neutral-700"
              >
                <Text className="text-base text-white">{tipoPermiso}</Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Tipo de saldo */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-white mb-2">
                Tipo de saldo a descontar
              </Text>
              <TouchableOpacity
                onPress={() => setSaldoModalVisible(true)}
                className="flex-row items-center justify-between border border-neutral-600 rounded-lg px-4 py-3 bg-neutral-700"
              >
                <Text className="text-base text-white">
                  {opcionesSaldo.find((o) => o.value === tipoSaldo)?.label}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Toggle Horas */}
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-base font-semibold text-white">
                Solicitar por horas
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={esPorHoras ? "#f5dd4b" : "#f4f3f4"}
                onValueChange={() => setEsPorHoras((prev) => !prev)}
                value={esPorHoras}
              />
            </View>

            {/* Fechas */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-white mb-2">
                {esPorHoras ? "Fecha" : "Fecha de Inicio"}
              </Text>
              <View className="flex-row items-center border border-neutral-600 rounded-lg px-4 bg-neutral-700">
                <DateTimePicker
                  mode="date"
                  disableButtons
                  onDateChange={(date) => setFechaInicio(date)}
                  value={fechaInicio}
                  androidTextColor="text-white"
                  markedDates={takenDates}
                />
                <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
              </View>
            </View>

            {!esPorHoras ? (
              <View className="mb-6">
                <Text className="text-base font-semibold text-white mb-2">
                  Fecha de Fin
                </Text>
                <View className="flex-row items-center border border-neutral-600 rounded-lg px-4 bg-neutral-700">
                  <DateTimePicker
                    mode="date"
                    disableButtons
                    onDateChange={(date) => setFechaFin(date)}
                    value={fechaFin}
                    androidTextColor="text-white"
                    markedDates={takenDates}
                  />
                  <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                </View>
              </View>
            ) : (
                <View className="flex-row justify-between mb-6">
                    <View className="flex-1 mr-2">
                        <Text className="text-base font-semibold text-white mb-2">
                            Hora Inicio
                        </Text>
                        <View className="flex-row items-center border border-neutral-600 rounded-lg px-4 bg-neutral-700">
                            <DateTimePicker
                                mode="time"
                                disableButtons
                                onDateChange={(date) => setHoraInicio(date)}
                                value={horaInicio}
                                androidTextColor="text-white"
                            />
                            <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                        </View>
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-base font-semibold text-white mb-2">
                            Hora Fin
                        </Text>
                         <View className="flex-row items-center border border-neutral-600 rounded-lg px-4 bg-neutral-700">
                            <DateTimePicker
                                mode="time"
                                disableButtons
                                onDateChange={(date) => setHoraFin(date)}
                                value={horaFin}
                                androidTextColor="text-white"
                            />
                            <Ionicons name="time-outline" size={20} color="#9CA3AF" />
                        </View>
                    </View>
                </View>
            )}

            {/* Motivo */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-white mb-2">
                Motivo
              </Text>
              <TextInput
                className="border border-neutral-600 rounded-lg px-4 py-3 text-base text-white bg-neutral-700"
                placeholder="Describe brevemente el motivo..."
                placeholderTextColor="#6B7280"
                value={motivo}
                onChangeText={setMotivo}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 100 }}
              />
            </View>

            {/* Archivo */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-white mb-2">
                Documento (Opcional)
              </Text>

              {uploadedFile ? (
                <View className="border border-green-600 rounded-lg px-4 py-3 bg-neutral-700">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 flex-row items-center">
                      <Ionicons
                        name="document-attach"
                        size={20}
                        color="#10B981"
                      />
                      <Text
                        className="text-sm text-white ml-2 flex-1"
                        numberOfLines={1}
                      >
                        {uploadedFile.fileName}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handleRemoveFile}
                      className="ml-2"
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color="#989292ff"
                      />
                    </TouchableOpacity>
                  </View>
                  <Text className="text-xs text-green-500 mt-1">
                    ✓ Archivo subido correctamente
                  </Text>
                </View>
              ) : uploading ? (
                <View className="border border-blue-600 rounded-lg px-4 py-3 bg-neutral-700">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm text-white">
                      Subiendo archivo...
                    </Text>
                    <Text className="text-sm text-blue-400">{progress}%</Text>
                  </View>
                  <View className="h-2 bg-neutral-600 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </View>
                </View>
              ) : (
                <View className="flex-row items-center gap-3">
                  <View className="flex-1 border border-neutral-600 rounded-lg px-4 py-3 bg-neutral-700">
                    <Text className="text-base text-gray-400">
                      Ningún archivo seleccionado
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleFileUpload}
                    className="border border-neutral-600 rounded-lg p-3 bg-neutral-700"
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              )}

              <Text className="text-sm text-gray-400 mt-2">
                Certificados médicos u otros documentos
              </Text>
            </View>

            {/* Botones */}
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-1 border border-neutral-600 rounded-lg py-4 bg-neutral-700"
                disabled={uploading}
              >
                <Text className="text-center text-base font-semibold text-white">
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                className="flex-1 rounded-lg py-4 bg-blue-600"
                disabled={uploading}
                style={{ opacity: uploading ? 0.5 : 1 }}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-base font-semibold text-white">
                    Enviar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal tipo de permiso */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Seleccionar Tipo de Permiso"
      >
        <View style={styles.modalContent}>
          {tiposPermiso.map((tipo) => (
            <TouchableOpacity
              key={tipo}
              onPress={() => handleSelectTipoPermiso(tipo)}
              style={[
                styles.optionItem,
                tipoPermiso === tipo && styles.optionItemSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  tipoPermiso === tipo && styles.optionTextSelected,
                ]}
              >
                {tipo}
              </Text>
              {tipoPermiso === tipo && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </CustomModal>

      {/* Modal tipo de saldo */}
      <CustomModal
        visible={saldoModalVisible}
        onClose={() => setSaldoModalVisible(false)}
        title="Seleccionar tipo de saldo"
      >
        <View style={styles.modalContent}>
          {opcionesSaldo.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => handleSelectTipoSaldo(opt.value)}
              style={[
                styles.optionItem,
                tipoSaldo === opt.value && styles.optionItemSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  tipoSaldo === opt.value && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
              {tipoSaldo === opt.value && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </CustomModal>

      {/* Modal subida */}
      <CustomModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        title="Seleccionar tipo de archivo"
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            onPress={() => handleSelectUploadOption("document")}
            style={styles.optionItem}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="document-text" size={24} color="#60A5FA" />
              <View className="ml-3">
                <Text style={styles.optionText}>Documento</Text>
                <Text className="text-xs text-gray-400 mt-1">
                  PDF, Word, etc.
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleSelectUploadOption("image")}
            style={styles.optionItem}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="image" size={24} color="#60A5FA" />
              <View className="ml-3">
                <Text style={styles.optionText}>Imagen</Text>
                <Text className="text-xs text-gray-400 mt-1">
                  JPG, PNG, etc.
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </CustomModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    paddingBottom: 20,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  optionItemSelected: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
  },
  optionTextSelected: {
    fontWeight: "600",
    color: colors.primary,
  },
});
