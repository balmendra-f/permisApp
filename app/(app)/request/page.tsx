"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
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
import CustomModal from "@/components/common/Modal";
import { createRequest } from "@/api/request/createRequest";
import { getRequestsByUser } from "@/api/request/getRequestByUser";
import { useFileUpload } from "@/components/request/hook/UseFileUpload";
import { useAuth } from "@/providers/AuthProvider";
import { Colors } from "@/constants/Colors";
import Button from "@/components/common/Button";
import { useColorScheme } from "nativewind";

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
  const { colorScheme } = useColorScheme();

  const [userData, setUserData] = useState<any | null>(user);
  const [takenDates, setTakenDates] = useState<Date[]>([]);

  useEffect(() => {
      if (!user) return;

      const ref = doc(db, "users", user.id);

      const unsubscribe = onSnapshot(ref, (snap) => {
        if (snap.exists()) {
          setUserData(snap.data() as any);
        }
      });

      const unsubscribeRequests = getRequestsByUser(user.id, (data: any[]) => {
          const dates: Date[] = [];
          data.forEach(req => {
              if (req.aproved === true) {
                  let start = req.fechaInicio?.toDate ? req.fechaInicio.toDate() : new Date(req.fechaInicio);
                  let end = req.fechaFin?.toDate ? req.fechaFin.toDate() : new Date(req.fechaFin);

                  start.setHours(0,0,0,0);
                  end.setHours(0,0,0,0);

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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
        fechaFin: esPorHoras ? fechaInicio : fechaFin,
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

  const isDark = colorScheme === 'dark';

  return (
    <Screen className="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          <View className="px-6 pt-6 pb-6 bg-card border-b border-border mb-6">
            <View className="flex-row items-center mb-4">
              <Pressable
                className="mr-4 active:opacity-70 p-2 rounded-full bg-secondary"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={isDark ? "#fff" : "#0f172a"} />
              </Pressable>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground">
                  Nueva Solicitud
                </Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Completa el formulario
                </Text>
              </View>
            </View>
          </View>

          <View className="mx-6">
            <View className="bg-card rounded-xl p-5 shadow-sm border border-border mb-6">
              <Text className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Saldo disponible
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center flex-1 border-r border-border">
                    <Text className="text-2xl font-bold text-primary">
                        {userData ? (userData.vacationsInDays - userData.vacationUsedInDays).toFixed(1) : 0}
                    </Text>
                    <Text className="text-xs text-muted-foreground">Vacaciones</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-2xl font-bold text-primary">
                        {userData?.administrativeDays || 0}
                    </Text>
                    <Text className="text-xs text-muted-foreground">Administrativos</Text>
                </View>
              </View>
            </View>

            {/* Form Fields */}
            <View className="space-y-6">
                {/* Tipo de Permiso */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                    Tipo de Permiso
                  </Text>
                  <Pressable
                    onPress={() => setModalVisible(true)}
                    className="flex-row items-center justify-between border border-border rounded-xl px-4 py-3 bg-card active:bg-secondary"
                  >
                    <Text className="text-base text-foreground">{tipoPermiso}</Text>
                    <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                  </Pressable>
                </View>

                {/* Tipo de saldo */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                    Tipo de saldo a descontar
                  </Text>
                  <Pressable
                    onPress={() => setSaldoModalVisible(true)}
                    className="flex-row items-center justify-between border border-border rounded-xl px-4 py-3 bg-card active:bg-secondary"
                  >
                    <Text className="text-base text-foreground">
                      {opcionesSaldo.find((o) => o.value === tipoSaldo)?.label}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                  </Pressable>
                </View>

                {/* Toggle Horas */}
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-base font-medium text-foreground ml-1">
                    Solicitar por horas
                  </Text>
                  <Switch
                    trackColor={{ false: isDark ? "#334155" : "#e2e8f0", true: "#818cf8" }}
                    thumbColor={esPorHoras ? "#4f46e5" : isDark ? "#f1f5f9" : "#f8fafc"}
                    onValueChange={() => setEsPorHoras((prev) => !prev)}
                    value={esPorHoras}
                  />
                </View>

                {/* Fechas */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                    {esPorHoras ? "Fecha" : "Fecha de Inicio"}
                  </Text>
                  <View className="flex-row items-center border border-border rounded-xl px-4 bg-card h-14">
                    <DateTimePicker
                      mode="date"
                      disableButtons
                      onDateChange={(date) => setFechaInicio(date)}
                      value={fechaInicio}
                      androidTextColor={isDark ? "#f8fafc" : "#0f172a"}
                      markedDates={takenDates}
                      style={{ flex: 1 }}
                    />
                    <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                  </View>
                </View>

                {!esPorHoras ? (
                  <View>
                    <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                      Fecha de Fin
                    </Text>
                    <View className="flex-row items-center border border-border rounded-xl px-4 bg-card h-14">
                      <DateTimePicker
                        mode="date"
                        disableButtons
                        onDateChange={(date) => setFechaFin(date)}
                        value={fechaFin}
                        androidTextColor={isDark ? "#f8fafc" : "#0f172a"}
                        markedDates={takenDates}
                        style={{ flex: 1 }}
                      />
                      <Ionicons name="calendar-outline" size={20} color="#94a3b8" />
                    </View>
                  </View>
                ) : (
                    <View className="flex-row justify-between gap-4">
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                                Hora Inicio
                            </Text>
                            <View className="flex-row items-center border border-border rounded-xl px-4 bg-card h-14">
                                <DateTimePicker
                                    mode="time"
                                    disableButtons
                                    onDateChange={(date) => setHoraInicio(date)}
                                    value={horaInicio}
                                    androidTextColor={isDark ? "#f8fafc" : "#0f172a"}
                                />
                                <Ionicons name="time-outline" size={20} color="#94a3b8" />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                                Hora Fin
                            </Text>
                             <View className="flex-row items-center border border-border rounded-xl px-4 bg-card h-14">
                                <DateTimePicker
                                    mode="time"
                                    disableButtons
                                    onDateChange={(date) => setHoraFin(date)}
                                    value={horaFin}
                                    androidTextColor={isDark ? "#f8fafc" : "#0f172a"}
                                />
                                <Ionicons name="time-outline" size={20} color="#94a3b8" />
                            </View>
                        </View>
                    </View>
                )}

                {/* Motivo */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                    Motivo
                  </Text>
                  <TextInput
                    className="border border-border rounded-xl px-4 py-3 text-base text-foreground bg-card"
                    placeholder="Describe brevemente el motivo..."
                    placeholderTextColor="#94a3b8"
                    value={motivo}
                    onChangeText={setMotivo}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    style={{ minHeight: 100 }}
                  />
                </View>

                {/* Archivo */}
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2 ml-1">
                    Documento (Opcional)
                  </Text>

                  {uploadedFile ? (
                    <View className="border border-emerald-500/30 rounded-xl px-4 py-3 bg-emerald-500/10">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center">
                          <Ionicons
                            name="document-text"
                            size={24}
                            color="#10b981"
                          />
                          <Text
                            className="text-sm text-foreground ml-2 flex-1 font-medium"
                            numberOfLines={1}
                          >
                            {uploadedFile.fileName}
                          </Text>
                        </View>
                        <Pressable
                          onPress={handleRemoveFile}
                          className="ml-2 active:opacity-70 p-1"
                        >
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#ef4444"
                          />
                        </Pressable>
                      </View>
                      <Text className="text-xs text-emerald-600 mt-1 ml-8">
                        Archivo subido correctamente
                      </Text>
                    </View>
                  ) : uploading ? (
                    <View className="border border-primary/30 rounded-xl px-4 py-3 bg-primary/10">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-sm text-foreground font-medium">
                          Subiendo archivo...
                        </Text>
                        <Text className="text-sm text-primary font-bold">{progress}%</Text>
                      </View>
                      <View className="h-2 bg-primary/20 rounded-full overflow-hidden">
                        <View
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    </View>
                  ) : (
                    <Pressable
                        onPress={handleFileUpload}
                        className="border border-dashed border-muted-foreground/30 rounded-xl p-6 bg-card items-center justify-center active:bg-secondary"
                    >
                        <Ionicons
                          name="cloud-upload-outline"
                          size={32}
                          color="#94a3b8"
                        />
                        <Text className="text-muted-foreground mt-2 font-medium">Sube un archivo aquí</Text>
                        <Text className="text-xs text-muted-foreground/70 mt-1">
                            Certificados médicos u otros documentos
                        </Text>
                    </Pressable>
                  )}
                </View>

                {/* Botones */}
                <View className="flex-row gap-4 mt-4 mb-10">
                  <Button
                    label="Cancelar"
                    onPress={() => router.back()}
                    variant="outline"
                    className="flex-1 bg-card"
                    disabled={uploading}
                  />
                  <Button
                    label="Enviar Solicitud"
                    onPress={handleSubmit}
                    loading={uploading}
                    variant="primary"
                    className="flex-1 shadow-md shadow-primary/30"
                  />
                </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal tipo de permiso */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Tipo de Permiso"
      >
        <View style={styles.modalContent}>
          {tiposPermiso.map((tipo) => (
            <Pressable
              key={tipo}
              onPress={() => handleSelectTipoPermiso(tipo)}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderColor: isDark ? '#334155' : '#f1f5f9'
                },
                tipoPermiso === tipo && {
                  backgroundColor: isDark ? '#312e81' : '#e0e7ff',
                  borderColor: '#4f46e5'
                },
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isDark ? '#f8fafc' : '#0f172a' },
                  tipoPermiso === tipo && { color: '#4f46e5', fontWeight: '600' },
                ]}
              >
                {tipo}
              </Text>
              {tipoPermiso === tipo && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.light.tint}
                />
              )}
            </Pressable>
          ))}
        </View>
      </CustomModal>

      {/* Modal tipo de saldo */}
      <CustomModal
        visible={saldoModalVisible}
        onClose={() => setSaldoModalVisible(false)}
        title="Tipo de Saldo"
      >
        <View style={styles.modalContent}>
          {opcionesSaldo.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => handleSelectTipoSaldo(opt.value)}
              style={({ pressed }) => [
                styles.optionItem,
                {
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderColor: isDark ? '#334155' : '#f1f5f9'
                },
                tipoSaldo === opt.value && {
                  backgroundColor: isDark ? '#312e81' : '#e0e7ff',
                  borderColor: '#4f46e5'
                },
                { opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isDark ? '#f8fafc' : '#0f172a' },
                  tipoSaldo === opt.value && { color: '#4f46e5', fontWeight: '600' },
                ]}
              >
                {opt.label}
              </Text>
              {tipoSaldo === opt.value && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.light.tint}
                />
              )}
            </Pressable>
          ))}
        </View>
      </CustomModal>

      {/* Modal subida */}
      <CustomModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        title="Adjuntar Archivo"
      >
        <View style={styles.modalContent}>
          <Pressable
            onPress={() => handleSelectUploadOption("document")}
            style={({ pressed }) => [
              styles.optionItem,
              {
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderColor: isDark ? '#334155' : '#f1f5f9'
              },
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <View className="flex-row items-center flex-1">
              <View className="p-2 bg-blue-500/20 rounded-full mr-3">
                 <Ionicons name="document-text" size={24} color="#3b82f6" />
              </View>
              <View>
                <Text style={[styles.optionText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Documento</Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  PDF, Word, etc.
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#475569" : "#cbd5e1"} />
          </Pressable>

          <Pressable
            onPress={() => handleSelectUploadOption("image")}
            style={({ pressed }) => [
              styles.optionItem,
              {
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderColor: isDark ? '#334155' : '#f1f5f9'
              },
              { opacity: pressed ? 0.8 : 1 }
            ]}
          >
            <View className="flex-row items-center flex-1">
               <View className="p-2 bg-purple-500/20 rounded-full mr-3">
                  <Ionicons name="image" size={24} color="#a855f7" />
               </View>
              <View>
                <Text style={[styles.optionText, { color: isDark ? '#f8fafc' : '#0f172a' }]}>Imagen</Text>
                <Text className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, etc.
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? "#475569" : "#cbd5e1"} />
          </Pressable>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionItemSelected: {
    // handled dynamically
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  optionTextSelected: {
    fontWeight: "600",
  },
});
