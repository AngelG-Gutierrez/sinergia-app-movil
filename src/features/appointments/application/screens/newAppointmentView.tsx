import { Stack } from 'expo-router';
import { Calendar, Clock, Info, User } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function NewAppointmentView() {

  const insets = useSafeAreaInsets();
  const [selectedTime, setSelectedTime] = useState('10:00 a.m');

  const timeSlots = [
    { time: '10:00 a.m', available: true },
    { time: '10:30 a.m', available: true },
    { time: '11:00 a.m', available: false },
    { time: '11:30 a.m', available: false },
    { time: '12:00 p.m', available: true },
    { time: '12:30 p.m', available: true },
    { time: '13:00 p.m', available: true },
    { time: '14:30 p.m', available: false },
    { time: '15:00 p.m', available: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
              Selecciona la fecha y hora que mejor se adapte a ti. Tu cita estará lista en segundos.
            </Text>
          </View>
        </View>

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
              <Text style={styles.inputValue}>Nombre completo del paciente</Text>
            </View>
          </View>

          <View style={styles.readOnlyInput}>
            <Calendar color="#000000" size={20} style={styles.inputIcon} />
            <View>
              <Text style={styles.inputLabel}>Edad</Text>
              <Text style={styles.inputValue}>00 años</Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Info color="#2563EB" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.infoBannerText}>
              Tus datos se completan automáticamente con la información de tu perfil.
            </Text>
          </View>
        </View>

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
                <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.indicatorText}>Disponible</Text>
              </View>
              <View style={styles.indicatorItem}>
                <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.indicatorText}>Sin disponibilidad</Text>
              </View>
            </View>

            <View style={styles.selectedBox}>
              <Calendar color="#000000" size={18} style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.selectedBoxLabel}>Fecha seleccionada</Text>
                <Text style={styles.selectedBoxValue}>dd / mm / aaaa</Text>
              </View>
            </View>
          </View>

          <View style={styles.calendarPlaceholder}>
            <Text style={styles.calendarPlaceholderText}>Calendario</Text>
          </View>
        </View>

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
                <View style={[styles.dot, { backgroundColor: '#2B7A9E' }]} />
                <Text style={styles.indicatorText}>Disponible</Text>
              </View>
              <View style={styles.indicatorItem}>
                <View style={[styles.dot, { backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#9CA3AF' }]} />
                <Text style={styles.indicatorText}>Sin disponibilidad</Text>
              </View>
            </View>

            <View style={styles.selectedBox}>
              <Clock color="#000000" size={18} style={{ marginRight: 6 }} />
              <View>
                <Text style={styles.selectedBoxLabel}>Hora seleccionada</Text>
                <Text style={styles.selectedBoxValue}>{selectedTime}</Text>
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
                      slot.available && isSelected && styles.timeSlotTextSelected,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
              <Text style={styles.inputValue}>Nombre completo del paciente</Text>
            </View>
          </View>

          <View style={styles.confirmationDetailsRow}>
            <View style={[styles.readOnlyInput, { flex: 1, marginBottom: 0 }]}>
              <Calendar color="#000000" size={18} style={styles.inputIcon} />
              <View>
                <Text style={styles.inputLabel}>Fecha</Text>
                <Text style={styles.inputValue}>dd / mm / aaaa</Text>
              </View>
            </View>

            <View style={[styles.readOnlyInput, { flex: 1, marginBottom: 0 }]}>
              <Clock color="#000000" size={18} style={styles.inputIcon} />
              <View>
                <Text style={styles.inputLabel}>Hora</Text>
                <Text style={styles.inputValue}>{selectedTime}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.confirmBtn} activeOpacity={0.85}>
            <Text style={styles.confirmBtnText}>Confirmar cita</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CBE5FF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  titleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
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
    fontWeight: 'bold',
    color: '#111827',
  },
  inputValue: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BFDBFE',
    borderRadius: 10,
    padding: 10,
  },
  infoBannerText: {
    fontSize: 11,
    color: '#1D4ED8',
    flex: 1,
    lineHeight: 15,
  },
  selectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  indicatorsColumn: {
    gap: 6,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  selectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedBoxLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  selectedBoxValue: {
    fontSize: 12,
    color: '#4B5563',
  },
  calendarPlaceholder: {
    backgroundColor: '#CBE5FF',
    borderRadius: 12,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarPlaceholderText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '31%',
    backgroundColor: '#2B7A9E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  timeSlotDisabled: {
    backgroundColor: '#F3F4F6',
  },
  timeSlotSelected: {
    backgroundColor: '#2B7A9E',
  },
  timeSlotText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeSlotTextDisabled: {
    color: '#9CA3AF',
  },
  timeSlotTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  confirmationDetailsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  confirmBtn: {
    backgroundColor: '#2B7A9E',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});