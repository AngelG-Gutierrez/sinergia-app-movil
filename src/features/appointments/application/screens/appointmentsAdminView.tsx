import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { Calendar, ChevronRight, Clock, FileText, Search, User, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppointmentPatient {
  id: string;
  appointmentId: string;
  patientId: string;
  patient: {
    id: string;
    name: string;
    email: string;
    birthDate: string;
  };
}

interface Appointment {
  id: string;
  date: string;
  status: string;
  reason: string;
  reminderSent: boolean;
  createdAt: string;
  patients: AppointmentPatient[];
}

type AppointmentFilter = 'all' | 'pending' | 'completed' | 'cancelled';

const TIME_ZONE = 'America/Mexico_City';

const getMexicoDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return {
    year: Number(parts.find(p => p.type === 'year')?.value),
    month: Number(parts.find(p => p.type === 'month')?.value),
    day: Number(parts.find(p => p.type === 'day')?.value),
  };
};

const getDateKey = (date: Date) => {
  const { year, month, day } = getMexicoDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getWeekStart = (date: Date) => {
  const { year, month, day } = getMexicoDateParts(date);
  const localDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = localDate.getUTCDay();
  const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  localDate.setUTCDate(localDate.getUTCDate() + difference);
  return localDate.getTime();
};

const formatAppointmentDate = (date: string) => {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

const formatAppointmentTime = (date: string) => {
  return new Intl.DateTimeFormat('es-MX', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

const getPatientAge = (birthDate?: string) => {
  if (!birthDate) return 'No disponible';

  const [year, month, day] = birthDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return 'No disponible';

  const today = getMexicoDateParts(new Date());
  let age = today.year - year;

  if (
    today.month < month ||
    (today.month === month && today.day < day)
  ) {
    age--;
  }

  return age >= 0 ? `${age} años` : 'No disponible';
};

const getStatusInfo = (status: string) => {
  switch (status.toLowerCase()) {
    case 'activa':
      return {
        label: 'Próxima',
        background: '#FEF08A',
        color: '#854D0E',
        filter: 'pending' as AppointmentFilter,
      };

    case 'finalizada':
      return {
        label: 'Completada',
        background: '#BBF7D0',
        color: '#166534',
        filter: 'completed' as AppointmentFilter,
      };

    case 'cancelada':
      return {
        label: 'Cancelada',
        background: '#FECACA',
        color: '#991B1B',
        filter: 'cancelled' as AppointmentFilter,
      };

    default:
      return {
        label: status || 'Desconocido',
        background: '#E5E7EB',
        color: '#374151',
        filter: 'all' as AppointmentFilter,
      };
  }
};

export function AppointmentsAdminView() {
  const insets = useSafeAreaInsets();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<AppointmentFilter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        throw new Error('No se encontró una sesión activa.');
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL
        ?.trim()
        .replace(/\/+$/, '');

      if (!baseUrl) {
        throw new Error('No se encontró EXPO_PUBLIC_API_URL.');
      }

      const response = await fetch(`${baseUrl}/appointments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || 'Error al obtener las citas registradas.'
        );
      }

      const data: Appointment[] = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando las citas:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'No fue posible cargar las citas.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const statistics = useMemo(() => {
    const now = new Date();
    const todayKey = getDateKey(now);
    const weekStart = getWeekStart(now);
    const weekEnd = weekStart + 7 * 24 * 60 * 60 * 1000;

    return {
      today: appointments.filter(
        item => getDateKey(new Date(item.date)) === todayKey
      ).length,

      week: appointments.filter(item => {
        const appointmentDay = getWeekStart(new Date(item.date));

        return appointmentDay === weekStart &&
          new Date(item.date).getTime() >= weekStart &&
          new Date(item.date).getTime() < weekEnd;
      }).length,

      completed: appointments.filter(
        item => item.status.toLowerCase() === 'finalizada'
      ).length,

      cancelled: appointments.filter(
        item => item.status.toLowerCase() === 'cancelada'
      ).length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return appointments
      .filter(item => {
        const statusInfo = getStatusInfo(item.status);

        const matchesFilter =
          filter === 'all' || statusInfo.filter === filter;

        const patientName =
          item.patients?.[0]?.patient?.name || 'Paciente no disponible';

        const matchesSearch =
          !query ||
          item.id.toLowerCase().includes(query) ||
          patientName.toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [appointments, filter, searchQuery]);

  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const closeAppointmentDetails = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
  };

  const selectedPatient =
    selectedAppointment?.patients?.[0]?.patient;

  const selectedStatus = selectedAppointment
    ? getStatusInfo(selectedAppointment.status)
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
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
            <Clock color="#2B7A9E" size={24} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.screenSubtitle}>
              Ve y administra tus citas fisioterapéuticas
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Citas hoy</Text>
            <Text style={styles.statNumber}>{statistics.today}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Citas en la semana</Text>
            <Text style={styles.statNumber}>{statistics.week}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Atendidas</Text>
            <Text style={styles.statNumber}>{statistics.completed}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Canceladas</Text>
            <Text style={styles.statNumber}>{statistics.cancelled}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeaderTitle}>
          Listado de citas registradas
        </Text>

        {/* Filtros en Grid de 2x2 para evitar amontonamientos */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
            onPress={() => setFilter('pending')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
            onPress={() => setFilter('completed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>
              Completadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'cancelled' && styles.filterTabActive]}
            onPress={() => setFilter('cancelled')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'cancelled' && styles.filterTabTextActive]}>
              Canceladas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Búsqueda */}
        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Busca por ID o paciente"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Listado */}
        <View style={styles.appointmentsList}>
          {isLoading ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="large" color="#2B7A9E" />
              <Text style={styles.stateText}>Cargando agenda...</Text>
            </View>
          ) : error ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateError}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchAppointments}
              >
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : filteredAppointments.length === 0 ? (
            <View style={styles.stateContainer}>
              <Clock color="#9CA3AF" size={32} />
              <Text style={styles.stateText}>
                {appointments.length === 0
                  ? 'Todavía no hay citas registradas.'
                  : 'No se encontraron citas con esos criterios.'}
              </Text>
            </View>
          ) : (
            filteredAppointments.map(item => {
              const statusInfo = getStatusInfo(item.status);
              const patientName =
                item.patients?.[0]?.patient?.name ||
                'Paciente no disponible';
              const appointmentCode =
                `#${item.id.slice(-6).toUpperCase()}`;

              return (
                <View key={item.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentInfo}>
                    <View style={styles.appointmentTopRow}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>
                          {appointmentCode}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.statusTag,
                          { backgroundColor: statusInfo.background },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTagText,
                            { color: statusInfo.color },
                          ]}
                        >
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.patientName}>
                      {patientName}
                    </Text>

                    <Text style={styles.appointmentMeta}>
                      {formatAppointmentDate(item.date)} {' | '}
                      {formatAppointmentTime(item.date)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.actionArrow}
                    activeOpacity={0.8}
                    onPress={() => openAppointmentDetails(item)}
                  >
                    <ChevronRight color="#FFFFFF" size={20} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal de detalles rediseñado */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAppointmentDetails}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.modalTitleIcon}>
                  <Calendar color="#2B7A9E" size={18} />
                </View>
                <Text style={styles.modalTitle}>Detalles de la cita</Text>
              </View>

              <TouchableOpacity
                onPress={closeAppointmentDetails}
                style={styles.modalCloseButton}
              >
                <X color="#374151" size={22} />
              </TouchableOpacity>
            </View>

            {selectedAppointment && selectedStatus && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                <View style={styles.modalStatusContainer}>
                  <View
                    style={[
                      styles.statusTagLarge,
                      { backgroundColor: selectedStatus.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagTextLarge,
                        { color: selectedStatus.color },
                      ]}
                    >
                      {selectedStatus.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailCardBlock}>
                  <View style={styles.detailItemRow}>
                    <User color="#2B7A9E" size={16} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.detailLabel}>Paciente</Text>
                      <Text style={styles.detailValueBold}>
                        {selectedPatient?.name || 'Paciente no disponible'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItemRow}>
                    <Clock color="#2B7A9E" size={16} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.detailLabel}>Edad</Text>
                      <Text style={styles.detailValue}>
                        {getPatientAge(selectedPatient?.birthDate)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailCardBlock}>
                  <View style={styles.detailItemRow}>
                    <Calendar color="#2B7A9E" size={16} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.detailLabel}>Fecha y Hora</Text>
                      <Text style={styles.detailValueBold}>
                        {formatAppointmentDate(selectedAppointment.date)}
                      </Text>
                      <Text style={[styles.detailValue, { marginTop: 2 }]}>
                        {formatAppointmentTime(selectedAppointment.date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItemRow}>
                    <FileText color="#2B7A9E" size={16} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.detailLabel}>Motivo de la cita</Text>
                      <Text style={styles.detailValue}>
                        {selectedAppointment.reason || 'No especificado'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailDivider} />

                  <View style={styles.detailItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>ID de la cita</Text>
                      <Text style={[styles.detailValue, { fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }]}>
                        {selectedAppointment.id}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={closeAppointmentDetails}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalDoneButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },

  screenSubtitle: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  statHeaderLabel: {
    fontSize: 12,
    color: '#2B7A9E',
    fontWeight: '600',
    marginBottom: 4,
  },

  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },

  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  // Contenedor de filtros actualizado a Grid (2 columnas) para evitar amontonamientos
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },

  filterTab: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterTabActive: {
    borderColor: '#2B7A9E',
    backgroundColor: '#F0F9FF',
  },

  filterTabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },

  filterTabTextActive: {
    color: '#2B7A9E',
    fontWeight: 'bold',
  },

  appointmentsList: {
    gap: 12,
  },

  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  appointmentInfo: {
    flex: 1,
  },

  appointmentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },

  codeBadge: {
    backgroundColor: '#BAE6FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  codeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0369A1',
  },

  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  statusTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  patientName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },

  appointmentMeta: {
    fontSize: 12,
    color: '#4B5563',
  },

  actionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2B7A9E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    paddingHorizontal: 20,
    gap: 12,
  },

  stateText: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },

  stateError: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#2B7A9E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  modalTitleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },

  modalCloseButton: {
    padding: 4,
  },

  modalStatusContainer: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  statusTagLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusTagTextLarge: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  detailCardBlock: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },

  detailLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  detailValueBold: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 'bold',
  },

  modalDoneButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  modalDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});