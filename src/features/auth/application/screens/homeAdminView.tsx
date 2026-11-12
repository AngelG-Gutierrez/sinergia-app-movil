
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  Calendar,
  ChevronRight,
  CirclePlus,
  Dumbbell,
  FolderKanban,
  Users,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Patient = {
  id: string;
  name: string;
  email?: string;
  birthDate?: string;
};

type Appointment = {
  id: string;
  date: string;
  status: 'activa' | 'finalizada' | 'cancelada';
  reason: string;
  createdAt: string;
  patients: {
    id: string;
    appointmentId: string;
    patientId: string;
    patient: Patient;
  }[];
};

type MedicalRecord = {
  id: string;
  patientId: string;
  diagnosis: string;
  history: string;
  evolution: string;
  createdAt: string;
  patient: Patient;
};

type AttendedPatient = {
  id: string;
  name: string;
  reason: string;
  appointmentDate: string;
  medicalRecordId: string;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');

const getMexicoDateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
};

const formatAppointmentTime = (date: string) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return 'Horario no disponible';

  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City',
  }).format(parsedDate);
};

const getAppointmentStatus = (status: Appointment['status']) => {
  switch (status) {
    case 'activa':
      return {
        label: 'Próxima',
        backgroundColor: '#FEF08A',
        textColor: '#854D0E',
      };
    case 'finalizada':
      return {
        label: 'Completada',
        backgroundColor: '#BBF7D0',
        textColor: '#166534',
      };
    case 'cancelada':
      return {
        label: 'Cancelada',
        backgroundColor: '#FECACA',
        textColor: '#991B1B',
      };
    default:
      return {
        label: 'Pendiente',
        backgroundColor: '#BAE6FD',
        textColor: '#0369A1',
      };
  }
};

const getInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'P';
};

export function HomeAdminView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedAppointment, setSelectedAppointment] =
  useState<Appointment | null>(null);

  // Carga los datos cada vez que se abre o recupera el foco del dashboard.
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        throw new Error('No se encontró una sesión activa.');
      }

      if (!API_URL) {
        throw new Error('No se encontró EXPO_PUBLIC_API_URL.');
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const [appointmentsResponse, recordsResponse] = await Promise.all([
        fetch(`${API_URL}/appointments`, {
          method: 'GET',
          headers,
        }),
        fetch(`${API_URL}/create-medical-records`, {
          method: 'GET',
          headers,
        }),
      ]);

      if (!appointmentsResponse.ok) {
        throw new Error(
          `No se pudieron cargar las citas. Código: ${appointmentsResponse.status}`
        );
      }

      if (!recordsResponse.ok) {
        throw new Error(
          `No se pudieron cargar los expedientes. Código: ${recordsResponse.status}`
        );
      }

      const appointmentsData: Appointment[] = await appointmentsResponse.json();
      const recordsData: MedicalRecord[] = await recordsResponse.json();

      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (error) {
      console.error('Error al cargar el dashboard:', error);

      Alert.alert(
        'No se pudo cargar el inicio',
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  const todayKey = getMexicoDateKey(new Date());

  // Citas cuya fecha corresponde al día actual en horario de México.
  const appointmentsToday = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.date);

        return (
          !Number.isNaN(appointmentDate.getTime()) &&
          getMexicoDateKey(appointmentDate) === todayKey
        );
      })
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [appointments, todayKey]);

  // La tarjeta de citas hoy muestra las que siguen activas.
  const pendingAppointmentsToday = appointmentsToday.filter(
    (appointment) => appointment.status === 'activa'
  ).length;

  // Relaciona las citas finalizadas con el expediente de cada paciente.
  const recentlyAttendedPatients = useMemo(() => {
    const finishedAppointments = appointments
      .filter((appointment) => appointment.status === 'finalizada')
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    const uniquePatients = new Map<string, AttendedPatient>();

    for (const appointment of finishedAppointments) {
      for (const relation of appointment.patients || []) {
        const patient = relation.patient;

        if (!patient?.id || !patient.name) continue;

        // Busca el expediente usando el ID del paciente.
        const patientRecord = medicalRecords.find(
          (record) =>
            record.patientId === patient.id ||
            record.patient?.id === patient.id
        );

        // Sin ID de expediente no podemos abrir la pantalla individual.
        if (!patientRecord) continue;

        // Al estar ordenadas las citas de más reciente a más antigua,
        // la primera coincidencia será la última atención de ese paciente.
        if (!uniquePatients.has(patient.id)) {
          uniquePatients.set(patient.id, {
            id: patient.id,
            name: patient.name,
            reason: appointment.reason || 'Atención realizada',
            appointmentDate: appointment.date,
            medicalRecordId: patientRecord.id,
          });
        }
      }
    }

    return Array.from(uniquePatients.values()).slice(0, 3);
  }, [appointments, medicalRecords]);

  const handleOpenMedicalRecord = (recordId: string) => {
    router.push({
      pathname: '/(admin)/individualMedicalRecord',
      params: { id: recordId },
    });
  };

  const handleCreateMedicalRecord = () => {
    router.push('/(admin)/createMedicalRecord');
  };

  const handleOpenAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const handleCloseAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  const formatAppointmentDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Fecha no disponible';
    }

    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Mexico_City',
    }).format(parsedDate);
  };

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
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSubtitle}>¡Bienvenido!</Text>
          <Text style={styles.userName}>Jesus Alberto</Text>
        </View>

        <Text style={styles.sectionHeaderTitle}>RESUMEN GENERAL</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Calendar color="#2B7A9E" size={22} />
              <Text style={styles.statHeaderLabel}>Citas hoy</Text>
            </View>
            <Text style={styles.statNumber}>
              {isLoading ? '...' : String(pendingAppointmentsToday).padStart(2, '0')}
            </Text>
            <Text style={styles.statSubtext}>Pendientes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Users color="#2B7A9E" size={22} />
              <Text style={styles.statHeaderLabel}>Pacientes</Text>
            </View>
            <Text style={styles.statNumber}>00</Text>
            <Text style={styles.statSubtext}>Pacientes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Dumbbell color="#2B7A9E" size={22} />
              <Text style={styles.statHeaderLabel}>Prescripciones</Text>
            </View>
            <Text style={styles.statNumber}>00</Text>
            <Text style={styles.statSubtext}>Planes activos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <FolderKanban color="#2B7A9E" size={22} />
              <Text style={styles.statHeaderLabel}>Expedientes</Text>
            </View>
            <Text style={styles.statNumber}>
              {isLoading ? '...' : String(medicalRecords.length).padStart(2, '0')}
            </Text>
            <Text style={styles.statSubtext}>Registrados</Text>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsRow}>
            <CirclePlus color="#2B7A9E" size={22} />
            <Text style={styles.quickActionsTitle}>Acciones rápidas</Text>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.primaryActionBtn}
              activeOpacity={0.8}
              disabled
            >
              <Text style={styles.primaryActionText}>Nueva prescripción</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionBtn}
              activeOpacity={0.8}
              onPress={handleCreateMedicalRecord}
            >
              <Text style={styles.secondaryActionText}>Nuevo expediente</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Calendar color="#000000" size={20} />
              <Text style={styles.cardTitleText}>Agenda de citas (hoy)</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(admin)/appointments')}>
              <Text style={styles.seeAllText}>Ver todas {'>'}{'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subListContainer}>
            {isLoading ? (
              <ActivityIndicator color="#2B7A9E" style={{ padding: 20 }} />
            ) : appointmentsToday.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay citas programadas para hoy.
              </Text>
            ) : (
              appointmentsToday.slice(0, 3).map((item) => {
                const patientName =
                  item.patients?.[0]?.patient?.name || 'Paciente sin asignar';

                const status = getAppointmentStatus(item.status);

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.appointmentItem}
                    activeOpacity={0.75}
                    onPress={() => handleOpenAppointmentDetails(item)}
                  >
                    <View style={styles.appointmentInfo}>
                      <View style={styles.appointmentTopRow}>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeBadgeText}>
                            #{item.id.slice(0, 6)}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusTag,
                            { backgroundColor: status.backgroundColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusTagText,
                              { color: status.textColor },
                            ]}
                          >
                            {status.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.patientName}>{patientName}</Text>

                      <Text style={styles.appointmentMeta}>
                        {formatAppointmentTime(item.date)} || {item.reason || 'Sin motivo especificado'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Users color="#000000" size={20} />
              <Text style={styles.cardTitleText}>
                Pacientes atendidos recientemente
              </Text>
            </View>
          </View>

          <View style={styles.subListContainer}>
            {isLoading ? (
              <ActivityIndicator color="#2B7A9E" style={{ padding: 20 }} />
            ) : recentlyAttendedPatients.length === 0 ? (
              <Text style={styles.emptyText}>
                Todavía no hay pacientes atendidos con expediente registrado.
              </Text>
            ) : (
              recentlyAttendedPatients.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.patientItem}
                  activeOpacity={0.8}
                  onPress={() =>
                    handleOpenMedicalRecord(item.medicalRecordId)
                  }
                >
                  <View style={styles.patientAvatarBox}>
                    <Text style={styles.patientAvatarText}>
                      {getInitials(item.name)}
                    </Text>
                  </View>

                  <View style={styles.patientInfo}>
                    <Text style={styles.patientCode}>
                      ID #{item.id.slice(0, 8)}
                    </Text>
                    <Text style={styles.patientFullName}>{item.name}</Text>
                    <Text style={styles.patientDiscomfort} numberOfLines={1}>
                      {item.reason}
                    </Text>
                  </View>

                  <View style={styles.actionArrow}>
                    <ChevronRight color="#FFFFFF" size={20} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <Modal
        visible={selectedAppointment !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCloseAppointmentDetails}
      >
        <View style={styles.modalOverlay}>
          {selectedAppointment && (() => {
            const appointment = selectedAppointment;
            const status = getAppointmentStatus(appointment.status);

            return (
              <View style={styles.appointmentModalCard}>
                <View style={styles.appointmentModalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.appointmentModalTitle}>
                      Detalles de la cita
                    </Text>
                    <Text style={styles.appointmentModalSubtitle}>
                      ID: #{appointment.id.slice(0, 8)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.appointmentModalClose}
                    onPress={handleCloseAppointmentDetails}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.appointmentModalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.appointmentModalStatus,
                    { backgroundColor: status.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.appointmentModalStatusText,
                      { color: status.textColor },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>

                <View style={styles.appointmentDetailBlock}>
                  <Text style={styles.appointmentDetailLabel}>
                    Fecha y hora
                  </Text>
                  <Text style={styles.appointmentDetailValue}>
                    {formatAppointmentDate(appointment.date)}
                  </Text>
                </View>

                <View style={styles.appointmentDetailBlock}>
                  <Text style={styles.appointmentDetailLabel}>
                    Motivo de la cita
                  </Text>
                  <Text style={styles.appointmentDetailValue}>
                    {appointment.reason || 'Sin motivo especificado'}
                  </Text>
                </View>

                <View style={styles.appointmentDetailBlock}>
                  <Text style={styles.appointmentDetailLabel}>
                    Paciente asociado
                  </Text>

                  {appointment.patients?.length > 0 ? (
                    appointment.patients.map((relation) => (
                      <View
                        key={relation.id}
                        style={styles.appointmentModalPatient}
                      >
                        <View style={styles.patientAvatarBox}>
                          <Text style={styles.patientAvatarText}>
                            {getInitials(relation.patient?.name || 'Paciente')}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.appointmentDetailValue}>
                            {relation.patient?.name || 'Sin nombre'}
                          </Text>
                          <Text style={styles.appointmentModalPatientEmail}>
                            {relation.patient?.email || 'Sin correo registrado'}
                          </Text>
                          <Text style={styles.appointmentModalPatientId}>
                            ID: {relation.patientId.slice(0, 8)}...
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.appointmentDetailValue}>
                      No hay pacientes asociados a esta cita.
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.appointmentModalButton}
                  onPress={handleCloseAppointmentDetails}
                  activeOpacity={0.85}
                >
                  <Text style={styles.appointmentModalButtonText}>
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })()}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerIconBtn: {
    padding: 6,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#2B7A9E',
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  welcomeSection: {
    marginBottom: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#333333',
  },
  userName: {
    fontSize: 33,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 2,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#4B5563',
    letterSpacing: 1,
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statHeaderLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statSubtext: {
    fontSize: 12,
    color: '#4B5563',
  },
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickActionsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    backgroundColor: '#2B7A9E',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryActionBtn: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: '#2B7A9E',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeaderRow: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 5,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '80%',
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 12,
    color: '#2B7A9E',
    fontWeight: 'bold',
  },
  subListContainer: {
    gap: 10,
  },
  appointmentItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 2,
  },
  appointmentMeta: {
    fontSize: 12,
    lineHeight: 20,
    color: '#4B5563',
  },
  patientItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#BAE6FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  patientAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  patientInfo: {
    flex: 1,
  },
  patientCode: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  patientFullName: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 20,
    color: '#111827',
  },
  patientDiscomfort: {
    fontSize: 12,
    lineHeight: 20,
    color: '#4B5563',
  },
  actionArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2B7A9E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 18,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  appointmentModalCard: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    elevation: 8,
  },
  appointmentModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  appointmentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  appointmentModalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  appointmentModalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appointmentModalCloseText: {
    fontSize: 17,
    color: '#374151',
    fontWeight: 'bold',
  },
  appointmentModalStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  appointmentModalStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentDetailBlock: {
    marginBottom: 16,
  },
  appointmentDetailLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 6,
  },
  appointmentDetailValue: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 21,
    fontWeight: '500',
  },
  appointmentModalPatient: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 12,
    marginTop: 6,
    gap: 10,
  },
  appointmentModalPatientEmail: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  appointmentModalPatientId: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
  },
  appointmentModalButton: {
    height: 46,
    backgroundColor: '#2B7A9E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  appointmentModalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

});