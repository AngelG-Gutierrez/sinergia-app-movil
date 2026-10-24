import {
  useCreateAppointmentMutation,
  useOccupiedSlotsQuery,
  usePatientAppointmentsQuery,
} from "@/features/appointments/application/hooks/useAppointments";
import { useAuth } from "@/features/auth/application/providers/authProvider";
import { router, Stack } from "expo-router";
import { Calendar, Clock, FileText, Info, User } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  combineDateAndTime,
  toLocalDateString,
} from "../../domain/utils/appointment-date.util";

const BASE_TIME_SLOTS = [
  "09:00 a.m",
  "10:00 a.m",
  "11:00 a.m",
  "12:00 p.m",
  "01:00 p.m",
  "02:00 p.m",
  "03:00 p.m",
  "04:00 p.m",
  "05:00 p.m",
  "06:00 p.m",
  "07:00 p.m",
  "08:00 p.m",
];

const calculateAge = (birthDateStr?: string): number | null => {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birth.getUTCDate())
  ) {
    age--;
  }
  return age;
};

// Helper para comparar horarios sin importar puntos o espacios ("10:00 a.m." vs "10:00 a.m")
const normalizeTime = (t: string) =>
  t.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

export function NewAppointmentView() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Fecha inicial por defecto: mañana en hora local (para evitar horarios ya pasados)
  const tomorrowIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toLocalDateString(d);
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(tomorrowIso);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("09:00 a.m");

  // Obtenemos las citas del paciente para determinar si es primera vez o seguimiento
  const { data: patientAppointments = [] } = usePatientAppointmentsQuery();
  const { data: occupiedSlots = [] } = useOccupiedSlotsQuery(selectedDate);
  const { mutate: createAppointment, isPending } =
    useCreateAppointmentMutation();

  // Si ya tiene al menos una cita válida (no cancelada), las siguientes son de seguimiento
  const appointmentReason = useMemo(() => {
    const hasPreviousOrActiveAppointment = patientAppointments.some(
      (app) => app.status.toLowerCase() !== "cancelada",
    );
    return hasPreviousOrActiveAppointment
      ? "Cita de seguimiento"
      : "Cita de Valoración";
  }, [patientAppointments]);

  const patientAge = useMemo(
    () => calculateAge(user?.birthDate),
    [user?.birthDate],
  );

  // Formatea "AAAA-MM-DD" a "DD / MM / AAAA"
  const formattedDateDisplay = useMemo(() => {
    if (!selectedDate) return "dd / mm / aaaa";
    const [year, month, day] = selectedDate.split("-");
    return `${day} / ${month} / ${year}`;
  }, [selectedDate]);

  // Cruza los horarios base con los ocupados en el backend para esa fecha
  const timeSlots = useMemo(() => {
    return BASE_TIME_SLOTS.map((time) => {
      const isOccupied = occupiedSlots.some(
        (occupied) => normalizeTime(occupied) === normalizeTime(time),
      );
      return {
        time,
        available: !isOccupied,
      };
    });
  }, [occupiedSlots]);

  // Si al cambiar de fecha la hora seleccionada está ocupada, selecciona la primera disponible
  useEffect(() => {
    const currentSlot = timeSlots.find((s) => s.time === selectedTime);
    if (!currentSlot || !currentSlot.available) {
      const firstAvailable = timeSlots.find((s) => s.available);
      setSelectedTime(firstAvailable ? firstAvailable.time : "");
    }
  }, [timeSlots, selectedTime]);

  const handleConfirmDate = (date: Date) => {
    const isoDate = toLocalDateString(date);
    setSelectedDate(isoDate);
    setShowDatePicker(false);
  };

  const handleConfirmAppointment = () => {
    if (!user?.id) {
      Alert.alert("Error", "No se encontró la sesión activa del paciente.");
      return;
    }

    if (!selectedDate || !selectedTime) {
      Alert.alert(
        "Horario no disponible",
        "Por favor selecciona una fecha y hora disponibles.",
      );
      return;
    }

    const isoDateTime = combineDateAndTime(selectedDate, selectedTime);

    createAppointment(
      {
        date: isoDateTime,
        reason: appointmentReason,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "¡Cita confirmada!",
            `Tu ${appointmentReason.toLowerCase()} ha sido agendada correctamente.`,
            [
              {
                text: "Ver mis citas",
                onPress: () => router.replace("/(patient)/appointments"),
              },
            ],
          );
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            "El horario seleccionado ya no está disponible.";
          Alert.alert(
            "No se pudo agendar",
            Array.isArray(message) ? message[0] : message,
          );
        },
      },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#CBE5FF" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <Calendar color="#000000" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Agendar cita</Text>
            <Text style={styles.screenSubtitle}>
              Selecciona la fecha y hora que mejor se adapte a ti. Tu cita
              estará lista en segundos.
            </Text>
          </View>
        </View>

        {/* Paso 1: Datos del paciente */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.stepTitle}>Datos del paciente</Text>
          </View>

          <View style={styles.readOnlyInput}>
            <User color="#000000" size={20} style={styles.inputIcon} />
            <View>
              <Text style={styles.inputLabel}>Nombre</Text>
              <Text style={styles.inputValue}>{user?.name || "Paciente"}</Text>
            </View>
          </View>

          <View style={styles.readOnlyInput}>
            <Calendar color="#000000" size={20} style={styles.inputIcon} />
            <View>
              <Text style={styles.inputLabel}>Edad</Text>
              <Text style={styles.inputValue}>
                {patientAge !== null ? `${patientAge} años` : "No registrada"}
              </Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Info color="#2563EB" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.infoBannerText}>
              Tus datos se completan automáticamente con la información de tu
              perfil.
            </Text>
          </View>
        </View>

        {/* Paso 2: Selecciona la fecha */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={styles.stepTitle}>Selecciona la fecha</Text>
          </View>

          <View style={styles.selectionRow}>
            <View style={styles.indicatorsColumn}>
              <View style={styles.indicatorItem}>
                <View style={[styles.dot, { backgroundColor: "#10B981" }]} />
                <Text style={styles.indicatorText}>Disponible</Text>
              </View>
              <View style={styles.indicatorItem}>
                <View style={[styles.dot, { backgroundColor: "#EF4444" }]} />
                <Text style={styles.indicatorText}>Sin disponibilidad</Text>
              </View>
            </View>

            <View style={styles.selectedBox}>
              <Calendar color="#000000" size={18} style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.selectedBoxLabel}>Fecha seleccionada</Text>
                <Text style={styles.selectedBoxValue}>
                  {formattedDateDisplay}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.calendarPlaceholder}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.calendarPlaceholderText}>
              {formattedDateDisplay}
            </Text>
            <Text style={styles.calendarTapHint}>
              Toca aquí para elegir la fecha en el calendario
            </Text>
          </Pressable>

          <DateTimePickerModal
            isVisible={showDatePicker}
            mode="date"
            date={new Date(`${selectedDate}T12:00:00`)}
            minimumDate={new Date()}
            locale="es_MX"
            confirmTextIOS="Confirmar"
            cancelTextIOS="Cancelar"
            onConfirm={handleConfirmDate}
            onCancel={() => setShowDatePicker(false)}
          />
        </View>

        {/* Paso 3: Selecciona la hora */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <Text style={styles.stepTitle}>Selecciona la hora</Text>
          </View>

          <View style={styles.selectionRow}>
            <View style={styles.indicatorsColumn}>
              <View style={styles.indicatorItem}>
                <View style={[styles.dot, { backgroundColor: "#2B7A9E" }]} />
                <Text style={styles.indicatorText}>Disponible</Text>
              </View>
              <View style={styles.indicatorItem}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: "#E5E7EB",
                      borderWidth: 1,
                      borderColor: "#9CA3AF",
                    },
                  ]}
                />
                <Text style={styles.indicatorText}>Sin disponibilidad</Text>
              </View>
            </View>

            <View style={styles.selectedBox}>
              <Clock color="#000000" size={18} style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.selectedBoxLabel}>Hora seleccionada</Text>
                <Text style={styles.selectedBoxValue}>
                  {selectedTime || "Ninguna"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.timeGrid}>
            {timeSlots.map((slot, index) => {
              const isSelected = selectedTime === slot.time;
              return (
                <TouchableOpacity
                  key={index}
                  disabled={!slot.available}
                  onPress={() => setSelectedTime(slot.time)}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.timeSlotDisabled,
                    slot.available && isSelected && styles.timeSlotSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      !slot.available && styles.timeSlotTextDisabled,
                      slot.available &&
                        isSelected &&
                        styles.timeSlotTextSelected,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Paso 4: Confirmación de tu cita */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>4</Text>
            </View>
            <Text style={styles.stepTitle}>Confirmación de tu cita</Text>
          </View>

          <View style={styles.readOnlyInput}>
            <User color="#000000" size={20} style={styles.inputIcon} />
            <View>
              <Text style={styles.inputLabel}>Nombre del paciente</Text>
              <Text style={styles.inputValue}>{user?.name || "Paciente"}</Text>
            </View>
          </View>

          <View style={styles.readOnlyInput}>
            <FileText color="#000000" size={20} style={styles.inputIcon} />
            <View>
              <Text style={styles.inputLabel}>Motivo de la consulta</Text>
              <Text style={styles.inputValue}>{appointmentReason}</Text>
            </View>
          </View>

          <View style={styles.confirmationDetailsRow}>
            <View style={[styles.readOnlyInput, { flex: 1, marginBottom: 0 }]}>
              <Calendar color="#000000" size={18} style={styles.inputIcon} />
              <View>
                <Text style={styles.inputLabel}>Fecha</Text>
                <Text style={styles.inputValue}>{formattedDateDisplay}</Text>
              </View>
            </View>

            <View style={[styles.readOnlyInput, { flex: 1, marginBottom: 0 }]}>
              <Clock color="#000000" size={18} style={styles.inputIcon} />
              <View>
                <Text style={styles.inputLabel}>Hora</Text>
                <Text style={styles.inputValue}>
                  {selectedTime || "Sin hora"}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmBtn,
              (isPending || !selectedTime) && { opacity: 0.7 },
            ]}
            activeOpacity={0.85}
            disabled={isPending || !selectedTime}
            onPress={handleConfirmAppointment}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmBtnText}>Confirmar cita</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CBE5FF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  titleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  screenSubtitle: {
    fontSize: 12,
    color: "#374151",
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#CBE5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  readOnlyInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  inputValue: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 1,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BFDBFE",
    borderRadius: 10,
    padding: 10,
  },
  infoBannerText: {
    fontSize: 11,
    color: "#1D4ED8",
    flex: 1,
    lineHeight: 15,
  },
  selectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  indicatorsColumn: {
    gap: 6,
  },
  indicatorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedBoxLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111827",
  },
  selectedBoxValue: {
    fontSize: 12,
    color: "#4B5563",
  },
  calendarPlaceholder: {
    backgroundColor: "#CBE5FF",
    borderRadius: 12,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarPlaceholderText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
  },
  calendarTapHint: {
    fontSize: 12,
    color: "#1E40AF",
    marginTop: 6,
    fontWeight: "600",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeSlot: {
    width: "31%",
    backgroundColor: "#2B7A9E",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  timeSlotDisabled: {
    backgroundColor: "#F3F4F6",
  },
  timeSlotSelected: {
    backgroundColor: "#164E63",
    borderWidth: 2,
    borderColor: "#083344",
  },
  timeSlotText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  timeSlotTextDisabled: {
    color: "#9CA3AF",
  },
  timeSlotTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  confirmationDetailsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  confirmBtn: {
    backgroundColor: "#2B7A9E",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
