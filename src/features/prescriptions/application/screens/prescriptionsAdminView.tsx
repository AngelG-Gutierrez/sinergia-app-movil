
import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Dumbbell,
  Filter,
  HeartPulse,
  Search,
  ShieldUser,
  User,
  X
} from 'lucide-react-native';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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

type ApiErrorResponse = {
  message?: string | string[];
};

type PrescriptionSummary = {
  id: string;
  exerciseName: string;
  createdAt: string;
};

type PatientWithPrescriptions = {
  id: string;
  name: string;
  exercisesCount: number;
  prescriptions: PrescriptionSummary[];
  lastAssignedAt: string | null;
};

type PatientDetails = {
  id: string;
  name: string;
  email: string;
  age: string | number;
  hasMedicalRecord: boolean;
};

type PatientPrescription = {
  id: string;
  exerciseName: string;
  description: string;
  frequency: string;
  duration?: string | null;
  equipment?: string | null;
  mediaUrl?: string | null;
  createdAt: string;
};

type MedicalRecord = {
    id: string;
    patientId: string;
    diagnosis: string;
    history: string;
    evolution: string;
    createdAt: string;
    patient?: {
        id: string;
        name: string;
        email: string;
        birthDate: string;
    };
};

type Exercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
};

const API_EXERCISES = 'https://oss.exercisedb.dev/api/v1';
const PAGE_SIZE = 8;
const EXERCISE_API_PAGE_SIZE = 25;

const parseApiResponse = async <T,>(
  response: Response,
): Promise<T | ApiErrorResponse> => {
  const text = await response.text();

  if (!text) return {};

  try {
    return JSON.parse(text) as T;
  } catch {
    return { message: text };
  }
};

const getErrorMessage = (message?: string | string[]) => {
  if (Array.isArray(message)) return message.join('\n');
  return message || 'Ocurrió un error inesperado.';
};

const getExerciseArray = (data: any): Exercise[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.exercises)) return data.exercises;
  return [];
};

const formatDate = (date?: string | null) => {
  if (!date) return 'Sin fecha';

  return new Date(date).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export function PrescriptionsAdminView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [patients, setPatients] = useState<PatientWithPrescriptions[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [errorExercises, setErrorExercises] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAllPatients, setShowAllPatients] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const [showMedicalRecord, setShowMedicalRecord] = useState(false);
  const [selectedMedicalRecord, setSelectedMedicalRecord] =
      useState<MedicalRecord | null>(null);
  const [isLoadingMedicalRecord, setIsLoadingMedicalRecord] =
      useState(false);

  const [selectedPatient, setSelectedPatient] =
    useState<PatientWithPrescriptions | null>(null);

  const [patientDetails, setPatientDetails] =
    useState<PatientDetails | null>(null);

  const [patientPrescriptions, setPatientPrescriptions] =
    useState<PatientPrescription[]>([]);

  const [isLoadingPatientDetails, setIsLoadingPatientDetails] =
    useState(false);

  const [isAssigning, setIsAssigning] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const getBaseUrl = () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL
      ?.trim()
      .replace(/\/+$/, '');

    if (!baseUrl) {
      throw new Error('No se encontró EXPO_PUBLIC_API_URL.');
    }

    return baseUrl;
  };

  // Obtener pacientes con prescripciones
  const fetchPatients = useCallback(async () => {
    setIsLoadingPatients(true);

    try {
      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        throw new Error('No se encontró una sesión activa.');
      }

      const response = await fetch(
        `${getBaseUrl()}/prescriptions/admin`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = await parseApiResponse<PatientWithPrescriptions[]>(
        response,
      );

      if (!response.ok) {
        throw new Error(
          getErrorMessage((result as ApiErrorResponse).message),
        );
      }

      setPatients(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error cargando pacientes con prescripciones:', error);
      showAlert(
        'Error al cargar pacientes',
        error instanceof Error ? error.message : 'No fue posible obtener los pacientes.',
      );
    } finally {
      setIsLoadingPatients(false);
    }
  }, []);

  const fetchPatientDetails = async (patientId: string) => {
    setIsLoadingPatientDetails(true);
    setPatientDetails(null);
    setPatientPrescriptions([]);

    try {
      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        throw new Error('No se encontró una sesión activa.');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [patientResponse, prescriptionsResponse] = await Promise.all([
        fetch(
          `${getBaseUrl()}/create-medical-records/patient/${encodeURIComponent(patientId)}`,
          { headers },
        ),
        fetch(
          `${getBaseUrl()}/prescriptions/admin/patients/${encodeURIComponent(patientId)}`,
          { headers },
        ),
      ]);

      const patientResult =
        await parseApiResponse<PatientDetails>(patientResponse);

      const prescriptionsResult =
        await parseApiResponse<PatientPrescription[]>(prescriptionsResponse);

      if (!patientResponse.ok) {
        throw new Error(
          getErrorMessage((patientResult as ApiErrorResponse).message),
        );
      }

      if (!prescriptionsResponse.ok) {
        throw new Error(
          getErrorMessage((prescriptionsResult as ApiErrorResponse).message),
        );
      }

      setPatientDetails(patientResult as PatientDetails);

      setPatientPrescriptions(
        Array.isArray(prescriptionsResult)
          ? prescriptionsResult
          : [],
      );
    } catch (error) {
      showAlert(
        'Error al consultar al paciente',
        error instanceof Error
          ? error.message
          : 'No fue posible obtener los detalles del paciente.',
      );
    } finally {
      setIsLoadingPatientDetails(false);
    }
  };

  const handleViewMedicalRecord = async () => {
      if (!patientDetails || !patientDetails.hasMedicalRecord) return;

      setIsLoadingMedicalRecord(true);

      try {
          const token = await SecureStore.getItemAsync('access_token');

          if (!token) {
              throw new Error('SESSION_EXPIRED');
          }

          const response = await fetch(
              `${getBaseUrl()}/create-medical-records`,
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  },
              },
          );

          const result = await parseApiResponse<any>(response);

          if (!response.ok) {
              throw new Error(
                  getErrorMessage((result as ApiErrorResponse).message),
              );
          }

          if (!Array.isArray(result)) {
              throw new Error('La respuesta de expedientes no tiene el formato esperado.');
          }

          // Buscar el expediente que pertenece al paciente seleccionado.
          const record = result.find(
              (item: MedicalRecord) =>
                  item.patientId === patientDetails.id,
          );

          if (!record) {
              setAlertConfig({
                visible: true,
                title: 'Expediente no encontrado',
                message: 'No se encontró el expediente médico de este paciente.',
            });
              return;
          }

          setSelectedMedicalRecord(record);
          setShowMedicalRecord(true);

      } catch (error) {
          console.error('Error consultando expediente médico:', error);

          setAlertConfig({
              visible: true,
              title: 'Error',
              message:
                  error instanceof Error &&
                  error.message === 'SESSION_EXPIRED'
                      ? 'Tu sesión expiró. Inicia sesión nuevamente.'
                      : error instanceof Error
                          ? error.message
                          : 'No fue posible consultar el expediente médico.',
          });

      } finally {
          setIsLoadingMedicalRecord(false);
      }
  };

  const handleOpenPatient = (patient: PatientWithPrescriptions) => {
    setShowAllPatients(false);
    setSelectedPatient(patient);
    fetchPatientDetails(patient.id);
  };

  const handleClosePatientDetails = () => {
    setSelectedPatient(null);
    setPatientDetails(null);
    setPatientPrescriptions([]);
    setShowMedicalRecord(false);
    setSelectedMedicalRecord(null);
  };

  // Obtener catálogo de ExerciseDB
  const fetchExercises = useCallback(async () => {
    setIsLoadingExercises(true);
    setErrorExercises('');

    try {
      let offset = 0;
      let allExercises: Exercise[] = [];
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${API_EXERCISES}/exercises?limit=${EXERCISE_API_PAGE_SIZE}&offset=${offset}`,
        );

        const result = await parseApiResponse<Exercise[]>(response);

        if (!response.ok) {
          throw new Error(
            getErrorMessage((result as ApiErrorResponse).message),
          );
        }

        const pageExercises = getExerciseArray(result);

        if (pageExercises.length === 0) {
          hasMore = false;
          continue;
        }

        // Evita repetir ejercicios si la API devuelve una página duplicada.
        const existingIds = new Set(
          allExercises.map((exercise) => exercise.exerciseId),
        );

        const newExercises = pageExercises.filter(
          (exercise) => !existingIds.has(exercise.exerciseId),
        );

        if (newExercises.length === 0) {
          hasMore = false;
          continue;
        }

        allExercises = [...allExercises, ...newExercises];

        offset += pageExercises.length;

        if (pageExercises.length < EXERCISE_API_PAGE_SIZE) {
          hasMore = false;
        }
      }

      setExercises(allExercises);

      if (allExercises.length === 0) {
        setErrorExercises('No se encontraron ejercicios en el catálogo.');
      }
    } catch (error) {
      console.error('Error consultando ExerciseDB:', error);
      setErrorExercises(
        error instanceof Error
          ? error.message
          : 'No fue posible cargar el catálogo de ejercicios.',
      );
    } finally {
      setIsLoadingExercises(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPatients();
      fetchExercises();
    }, [fetchPatients, fetchExercises]),
  );

  // Opciones de filtros obtenidas del catálogo cargado
  const bodyParts = useMemo(() => {
    return Array.from(
      new Set(exercises.flatMap((item) => item.bodyParts || [])),
    ).sort();
  }, [exercises]);

  const equipments = useMemo(() => {
    return Array.from(
      new Set(exercises.flatMap((item) => item.equipments || [])),
    ).sort();
  }, [exercises]);

  // Búsqueda y filtros locales
  const filteredExercises = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesName = !query ||
        exercise.name.toLowerCase().includes(query);

      const matchesBodyPart = !selectedBodyPart ||
        exercise.bodyParts?.includes(selectedBodyPart);

      const matchesEquipment = !selectedEquipment ||
        exercise.equipments?.includes(selectedEquipment);

      return matchesName && matchesBodyPart && matchesEquipment;
    });
  }, [
    exercises,
    searchQuery,
    selectedBodyPart,
    selectedEquipment,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExercises.length / PAGE_SIZE),
  );

  const paginatedExercises = filteredExercises.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const recentPatients = patients.slice(0, 5);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSelectBodyPart = (value: string) => {
    setSelectedBodyPart(value);
    setCurrentPage(1);
  };

  const handleSelectEquipment = (value: string) => {
    setSelectedEquipment(value);
    setCurrentPage(1);
  };

  const handleAssignExercise = () => {
    if (!selectedExercise) return;

    router.push({
        pathname: '/(admin)/newPrescription' as never,
        params: {
            exercise: JSON.stringify(selectedExercise),
            newSession: Date.now().toString(),
        },
    });

    setSelectedExercise(null);
  };

  const handleEditPatient = (patient: PatientWithPrescriptions) => {
    router.push({
      pathname: '/(admin)/newPrescription' as never,
      params: {
        patientId: patient.id,
        mode: 'edit',
      },
    });

    setShowAllPatients(false);
  };

  const clearFilters = () => {
    setSelectedBodyPart('');
    setSelectedEquipment('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    selectedBodyPart || selectedEquipment,
  );

  const handleDeletePrescription = (prescriptionId: string) => {
    Alert.alert(
      'Eliminar ejercicio',
      '¿Estás seguro de que deseas eliminar este ejercicio de la prescripción del paciente?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('access_token');

              if (!token) {
                throw new Error('No se encontró una sesión activa.');
              }

              const response = await fetch(
                `${getBaseUrl()}/prescriptions/${prescriptionId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                },
              );

              const result = await parseApiResponse<{ message?: string }>(
                response,
              );

              if (!response.ok) {
                throw new Error(
                  getErrorMessage((result as ApiErrorResponse).message),
                );
              }

              if (selectedPatient) {
                await fetchPatientDetails(selectedPatient.id);
              }

              await fetchPatients();

              showAlert(
                'Ejercicio eliminado',
                'La prescripción se eliminó correctamente.',
              );
            } catch (error) {
              showAlert(
                'No se pudo eliminar',
                error instanceof Error
                  ? error.message
                  : 'Ocurrió un error al eliminar la prescripción.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#CBE5FF" />

      {/* Modal de alertas */}
      <Modal
        transparent
        visible={alertConfig.visible}
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>
            <Text style={styles.modalDescription}>
              {alertConfig.message}
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={hideAlert}>
              <Text style={styles.primaryButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: todos los pacientes */}
      <Modal
        visible={showAllPatients}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllPatients(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.largeModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Pacientes con prescripciones</Text>
                <Text style={styles.modalSubtitle}>
                  Selecciona un paciente para editar sus ejercicios
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAllPatients(false)}
              >
                <X color="#111827" size={21} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={styles.patientModalCard}
                  activeOpacity={0.8}
                  onPress={() => handleOpenPatient(patient)}
                >
                  <View style={styles.patientModalHeader}>
                    <View style={styles.patientAvatar}>
                      <User color="#2B7A9E" size={19} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.patientName}>{patient.name}</Text>
                      <Text style={styles.patientId}>
                        ID: {patient.id}
                      </Text>
                    </View>

                    <ChevronRight color="#2B7A9E" size={22} />
                  </View>

                  <Text style={styles.exerciseListLabel}>
                    Ejercicios asignados ({patient.exercisesCount})
                  </Text>

                  {patient.prescriptions.map((prescription) => (
                    <Text
                      key={prescription.id}
                      style={styles.exerciseListItem}
                    >
                      • {prescription.exerciseName}
                    </Text>
                  ))}
                </TouchableOpacity>
              ))}

              {patients.length === 0 && (
                <Text style={styles.emptyText}>
                  No hay pacientes con prescripciones.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>


      <Modal
        visible={Boolean(selectedPatient)}
        transparent
        animationType="slide"
        onRequestClose={handleClosePatientDetails}
      >
        <View style={styles.overlay}>
          <View style={styles.largeModal}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Detalle del paciente</Text>
                <Text style={styles.modalSubtitle}>
                  Información y ejercicios asignados
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClosePatientDetails}
              >
                <X color="#111827" size={21} />
              </TouchableOpacity>
            </View>

            {isLoadingPatientDetails ? (
              <View style={styles.inlineLoading}>
                <ActivityIndicator color="#2B7A9E" size="large" />
                <Text style={styles.inlineLoadingText}>
                  Cargando información del paciente...
                </Text>
              </View>
            ) : patientDetails ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Información del paciente */}
                <View style={styles.patientInfoCard}>
                  <View style={styles.patientAvatar}>
                    <User color="#2B7A9E" size={23} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientName}>
                      {patientDetails.name}
                    </Text>
                    <Text style={styles.patientId}>
                      ID: {patientDetails.id}
                    </Text>
                    <Text style={styles.patientAge}>
                      Edad: {patientDetails.age} años
                    </Text>
                  </View>
                </View>

                {/* Expediente médico */}
                <TouchableOpacity
                  style={[
                    styles.medicalRecordButton,
                    !patientDetails.hasMedicalRecord &&
                      styles.medicalRecordButtonDisabled,
                  ]}
                  disabled={isLoadingMedicalRecord}
                  onPress={handleViewMedicalRecord}
                >
                  <HeartPulse color="#FFFFFF" size={19} />
                  <Text style={styles.medicalRecordButtonText}>
                    {patientDetails.hasMedicalRecord
                      ? 'Ver expediente médico'
                      : 'No cuenta con expediente médico'}
                  </Text>
                </TouchableOpacity>

                {/* Ejercicios */}
                <View style={styles.patientExercisesHeader}>
                  <Text style={styles.patientExercisesTitle}>
                    Ejercicios asignados
                  </Text>

                  <Text style={styles.patientExercisesCount}>
                    {patientPrescriptions.length}
                  </Text>
                </View>

                {patientPrescriptions.length === 0 ? (
                  <Text style={styles.emptyText}>
                    Este paciente no tiene ejercicios asignados.
                  </Text>
                ) : (
                  patientPrescriptions.map((prescription) => (
                    <View
                      key={prescription.id}
                      style={styles.prescriptionDetailCard}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prescriptionExerciseName}>
                          {prescription.exerciseName}
                        </Text>

                        <Text style={styles.prescriptionFrequency}>
                          Frecuencia: {prescription.frequency}
                        </Text>

                        {prescription.duration ? (
                          <Text style={styles.prescriptionFrequency}>
                            Duración: {prescription.duration}
                          </Text>
                        ) : null}

                        <Text style={styles.prescriptionFrequency}>
                          Material: {prescription.equipment || 'No especificado'}
                        </Text>
                      </View>

                      <View style={styles.prescriptionActions}>
                        <TouchableOpacity
                          style={styles.editPrescriptionButton}
                          onPress={() => {
                            handleClosePatientDetails();

                            router.push({
                              pathname: '/(admin)/newPrescription' as never,
                              params: {
                                patientId: patientDetails.id,
                                prescriptionId: prescription.id,
                                mode: 'edit-exercise',
                              },
                            });
                          }}
                        >
                          <Text style={styles.editPrescriptionButtonText}>
                            Editar
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deletePrescriptionButton}
                          onPress={() =>
                            handleDeletePrescription(prescription.id)
                          }
                        >
                          <Text style={styles.deletePrescriptionButtonText}>
                            Eliminar
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>
                No fue posible cargar la información del paciente.
              </Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: filtros */}
      <Modal
        visible={showFilters}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar ejercicios</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilters(false)}
              >
                <X color="#111827" size={21} />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Parte del cuerpo</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedBodyPart && styles.filterChipActive,
                ]}
                onPress={() => handleSelectBodyPart('')}
              >
                <Text style={[
                  styles.filterChipText,
                  !selectedBodyPart && styles.filterChipTextActive,
                ]}>
                  Todas
                </Text>
              </TouchableOpacity>

              {bodyParts.map((part) => (
                <TouchableOpacity
                  key={part}
                  style={[
                    styles.filterChip,
                    selectedBodyPart === part && styles.filterChipActive,
                  ]}
                  onPress={() => handleSelectBodyPart(part)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedBodyPart === part && styles.filterChipTextActive,
                  ]}>
                    {part}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Equipo</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptions}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedEquipment && styles.filterChipActive,
                ]}
                onPress={() => handleSelectEquipment('')}
              >
                <Text style={[
                  styles.filterChipText,
                  !selectedEquipment && styles.filterChipTextActive,
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>

              {equipments.map((equipment) => (
                <TouchableOpacity
                  key={equipment}
                  style={[
                    styles.filterChip,
                    selectedEquipment === equipment && styles.filterChipActive,
                  ]}
                  onPress={() => handleSelectEquipment(equipment)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedEquipment === equipment && styles.filterChipTextActive,
                  ]}>
                    {equipment}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={clearFilters}
              >
                <Text style={styles.secondaryButtonText}>Limpiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.primaryButtonText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: detalles del ejercicio */}
      <Modal
        visible={Boolean(selectedExercise)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalle del ejercicio</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedExercise(null)}
              >
                <X color="#111827" size={21} />
              </TouchableOpacity>
            </View>

            {selectedExercise && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image
                  source={{ uri: selectedExercise.gifUrl }}
                  style={styles.detailGif}
                  resizeMode="contain"
                />

                <Text style={styles.detailExerciseName}>
                  {selectedExercise.name}
                </Text>

                <Text style={styles.detailSectionTitle}>
                  Equipo utilizado
                </Text>
                <Text style={styles.detailDescription}>
                  {selectedExercise.equipments?.join(', ') || 'No especificado'}
                </Text>

                <Text style={styles.detailSectionTitle}>
                  Instrucciones
                </Text>

                {(selectedExercise.instructions || []).map((step, index) => (
                  <Text key={index} style={styles.instructionText}>
                    {index + 1}. {step.replace(/^Step:\d+\s*/i, '')}
                  </Text>
                ))}

                <View style={styles.assignHint}>
                  <Dumbbell color="#2B7A9E" size={23} />
                  <Text style={styles.assignHintText}>
                    ¿Deseas asignar este ejercicio a uno de tus pacientes?
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.85}
                  onPress={handleAssignExercise}
                >
                  <Text style={styles.primaryButtonText}>
                    Asignar a un paciente
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
          transparent
          visible={showMedicalRecord}
          animationType="slide"
          onRequestClose={() => setShowMedicalRecord(false)}
      >
          <View
              style={{
                  flex: 1,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 20,
              }}
          >
              <View
                  style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 20,
                      padding: 20,
                      width: '100%',
                      maxHeight: '80%',
                  }}
              >
                  {/* Encabezado */}
                  <View
                      style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 18,
                      }}
                  >
                      <View style={{ flex: 1 }}>
                          <Text
                              style={{
                                  fontSize: 19,
                                  fontWeight: 'bold',
                                  color: '#111827',
                              }}
                          >
                              Expediente médico
                          </Text>

                          <Text
                              style={{
                                  fontSize: 12,
                                  color: '#6B7280',
                                  marginTop: 4,
                              }}
                          >
                              {patientDetails?.name}
                          </Text>
                      </View>

                      <TouchableOpacity
                          onPress={() => setShowMedicalRecord(false)}
                          style={{ padding: 5 }}
                      >
                          <X color="#111827" size={23} />
                      </TouchableOpacity>
                  </View>

                  {selectedMedicalRecord && (
                      <ScrollView showsVerticalScrollIndicator={false}>
                          <Text
                              style={{
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                  color: '#2B7A9E',
                                  marginBottom: 5,
                              }}
                          >
                              DIAGNÓSTICO
                          </Text>

                          <Text
                              style={{
                                  fontSize: 14,
                                  color: '#374151',
                                  lineHeight: 21,
                                  marginBottom: 16,
                              }}
                          >
                              {selectedMedicalRecord.diagnosis || 'Sin información registrada.'}
                          </Text>

                          <Text
                              style={{
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                  color: '#2B7A9E',
                                  marginBottom: 5,
                              }}
                          >
                              ANTECEDENTES
                          </Text>

                          <Text
                              style={{
                                  fontSize: 14,
                                  color: '#374151',
                                  lineHeight: 21,
                                  marginBottom: 16,
                              }}
                          >
                              {selectedMedicalRecord.history || 'Sin información registrada.'}
                          </Text>

                          <Text
                              style={{
                                  fontSize: 12,
                                  fontWeight: 'bold',
                                  color: '#2B7A9E',
                                  marginBottom: 5,
                              }}
                          >
                              EVOLUCIÓN Y OBSERVACIONES
                          </Text>

                          <Text
                              style={{
                                  fontSize: 14,
                                  color: '#374151',
                                  lineHeight: 21,
                                  marginBottom: 16,
                              }}
                          >
                              {selectedMedicalRecord.evolution || 'Sin información registrada.'}
                          </Text>

                          <Text
                              style={{
                                  fontSize: 11,
                                  color: '#9CA3AF',
                                  marginTop: 5,
                              }}
                          >
                              Fecha de registro:{' '}
                              {selectedMedicalRecord.createdAt
                                  ? new Date(selectedMedicalRecord.createdAt).toLocaleDateString('es-MX')
                                  : 'No disponible'}
                          </Text>
                      </ScrollView>
                  )}
              </View>
          </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 30) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.introRow}>
          <View style={styles.introIcon}>
            <Dumbbell color="#111827" size={23} />
          </View>

          <Text style={styles.introText}>
            Asigna ejercicios de recuperación a tus pacientes.
          </Text>
        </View>

        {/* Pacientes recientes */}
        <View style={styles.recentCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <ShieldUser color="#111827" size={22} />
              <Text style={styles.sectionTitle}>Pacientes con prescripciones</Text>
            </View>

            {patients.length > 5 && (
              <TouchableOpacity onPress={() => setShowAllPatients(true)}>
                <Text style={styles.seeAllText}>Ver todos {'>'}{'>'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {isLoadingPatients ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color="#2B7A9E" />
              <Text style={styles.inlineLoadingText}>
                Cargando pacientes...
              </Text>
            </View>
          ) : patients.length === 0 ? (
            <Text style={styles.emptyRecentText}>
              Aún no hay pacientes con prescripciones asignadas.
            </Text>
          ) : (
            recentPatients.map((patient) => (
              <TouchableOpacity
                key={patient.id}
                style={styles.recentPatient}
                activeOpacity={0.8}
                onPress={() => handleOpenPatient(patient)}
              >
                <View style={styles.recentPatientInfo}>
                  <Text style={styles.recentPatientId} numberOfLines={1}>
                    ID: {patient.id}
                  </Text>
                  <Text style={styles.recentPatientName} numberOfLines={1}>
                    {patient.name}
                  </Text>
                  <Text style={styles.recentPatientExercises} numberOfLines={1}>
                    {patient.exercisesCount} ejercicios asignados
                  </Text>
                </View>

                <View style={styles.recentArrow}>
                  <ChevronRight color="#FFFFFF" size={21} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Crear prescripción */}
        <View style={styles.createCard}>
          <View style={styles.createCardTop}>
            <View style={styles.createIcon}>
              <HeartPulse color="#111827" size={25} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.createCardTitle}>
                ¿Tu paciente está listo?
              </Text>
              <Text style={styles.createCardSubtitle}>
                Añade su rutina de recuperación
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                  pathname: '/(admin)/newPrescription' as never,
                  params: {
                      newSession: Date.now().toString(),
                  },
              })
            }
          >
            <CirclePlus color="#ffffff" size={20}/>
            <Text style={styles.createButtonText}>Crear prescripción</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.line}></View>
        <Text style={styles.catalogTitle}>Ejercicios disponibles</Text>
        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={19} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicio"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <X color="#6B7280" size={18} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive,
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Filter
            color={hasActiveFilters ? '#FFFFFF' : '#374151'}
            size={17}
          />
          <Text style={[
            styles.filterButtonText,
            hasActiveFilters && styles.filterButtonTextActive,
          ]}>
            Filtros {hasActiveFilters ? '(activos)' : ''}
          </Text>
        </TouchableOpacity>

        {/* Catálogo */}
        <View style={styles.catalogHeader}>
          <Text style={styles.catalogSubtitle}>
            {filteredExercises.length} resultados
          </Text>
        </View>

        {isLoadingExercises ? (
          <View style={styles.catalogLoading}>
            <ActivityIndicator size="large" color="#2B7A9E" />
            <Text style={styles.inlineLoadingText}>
              Cargando catálogo de ejercicios...
            </Text>
          </View>
        ) : errorExercises ? (
          <View style={styles.emptyCatalog}>
            <Dumbbell color="#2B7A9E" size={38} />
            <Text style={styles.emptyTitle}>Catálogo no disponible</Text>
            <Text style={styles.emptyText}>{errorExercises}</Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={fetchExercises}
            >
              <Text style={styles.primaryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : paginatedExercises.length === 0 ? (
          <View style={styles.emptyCatalog}>
            <Search color="#2B7A9E" size={38} />
            <Text style={styles.emptyTitle}>
              No encontramos ejercicios
            </Text>
            <Text style={styles.emptyText}>
              Prueba con otro nombre o modifica los filtros.
            </Text>
          </View>
        ) : (
          <View style={styles.exerciseGrid}>
            {paginatedExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.exerciseId}
                style={styles.exerciseCard}
                activeOpacity={0.85}
                onPress={() => setSelectedExercise(exercise)}
              >
                <Image
                  source={{ uri: exercise.gifUrl }}
                  style={styles.exerciseImage}
                  resizeMode="contain"
                />
                <Text style={styles.exerciseName} numberOfLines={2}>
                  {exercise.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Paginación */}
        {!isLoadingExercises && !errorExercises && totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[
                styles.pageArrow,
                currentPage === 1 && styles.pageArrowDisabled,
              ]}
              disabled={currentPage === 1}
              onPress={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft color="#FFFFFF" size={20} />
            </TouchableOpacity>

            <Text style={styles.pageText}>
              Página {currentPage} de {totalPages}
            </Text>

            <TouchableOpacity
              style={[
                styles.pageArrow,
                currentPage === totalPages && styles.pageArrowDisabled,
              ]}
              disabled={currentPage === totalPages}
              onPress={() => setCurrentPage((prev) => prev + 1)}
            >
              <ChevronRight color="#FFFFFF" size={20} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.attribution}>
          Ejercicios proporcionados por ExerciseDB · AscendAPI
        </Text>
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
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  line: {
    backgroundColor: "#000000",
    width: '100%',
    height: 1,
    marginBottom: 15,
    marginTop: 5
  },
  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    marginTop: -10,
  },
  introIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#E5EFF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introText: {
    fontSize: 13,
    display: 'flex',
    color: '#374151',
    lineHeight: 18,
  },
  createCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
  },
  createCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 9,
  },
  createIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  createCardSubtitle: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  createButton: {
    backgroundColor: '#2B7A9E',
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: 6,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 9,
    gap: 5,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 12,
    color: '#2B7A9E',
    fontWeight: 'bold',
  },
  inlineLoading: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 7,
  },
  inlineLoadingText: {
    fontSize: 13,
    color: '#4B5563',
  },
  emptyRecentText: {
    color: '#6B7280',
    fontSize: 12,
    paddingVertical: 9,
    textAlign: 'center',
  },
  recentPatient: {
    backgroundColor: '#EDF4F6',
    borderRadius: 10,
    padding: 8,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentPatientInfo: {
    flex: 1,
    gap: 3,
  },
  recentPatientId: {
    backgroundColor: '#70E8C1',
    color: '#064E3B',
    fontSize: 11,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    maxWidth: '100%',
    marginBottom: 4,
  },
  recentPatientName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  recentPatientExercises: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  recentArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2B7A9E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchContainer: {
    height: 43,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  filterButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  filterButtonActive: {
    backgroundColor: '#2B7A9E',
  },
  filterButtonText: {
    color: '#374151',
    fontSize: 11,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  catalogHeader: {
    marginBottom: 10,
  },
  catalogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10
  },
  catalogSubtitle: {
    color: '#64748B',
    fontSize: 12,
  },
  catalogLoading: {
    paddingVertical: 45,
    alignItems: 'center',
    gap: 12,
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  exerciseCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    paddingBottom: 10,
    elevation: 2,
  },
  exerciseImage: {
    width: '100%',
    height: 145,
    backgroundColor: '#E5E7EB',
  },
  exerciseName: {
    color: '#111827',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingTop: 9,
    minHeight: 42,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginTop: 20,
  },
  pageArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2B7A9E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageArrowDisabled: {
    opacity: 0.35,
  },
  pageText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
  attribution: {
    color: '#64748B',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 22,
  },
  emptyCatalog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
  },
  largeModal: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
  },
  detailModal: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 17,
  },
  filterModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: 'bold',
  },
  modalSubtitle: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 3,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    color: '#4B5563',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginVertical: 15,
  },
  primaryButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 11,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  patientModalCard: {
    backgroundColor: '#F3F7F9',
    borderRadius: 13,
    padding: 12,
    marginBottom: 10,
  },
  patientModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  patientAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientName: {
    color: '#111827',
    fontSize: 13,
    fontWeight: 'bold',
  },
  patientId: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  exerciseListLabel: {
    color: '#2B7A9E',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  exerciseListItem: {
    color: '#374151',
    fontSize: 11,
    marginTop: 3,
  },
  filterLabel: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 7,
  },
  filterOptions: {
    gap: 7,
    paddingBottom: 8,
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: '#2B7A9E',
  },
  filterChipText: {
    color: '#374151',
    fontSize: 11,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 11,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: 'bold',
  },
  detailGif: {
    width: '100%',
    height: 210,
    backgroundColor: '#F3F4F6',
    borderRadius: 13,
    marginBottom: 12,
  },
  detailExerciseName: {
    color: '#111827',
    fontSize: 19,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  detailCategory: {
    color: '#2B7A9E',
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  detailSectionTitle: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 15,
    marginBottom: 4,
  },
  detailDescription: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 18,
  },
  instructionText: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  assignHint: {
    backgroundColor: '#EAF5FA',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 18,
    marginBottom: 12,
  },
  assignHintText: {
    flex: 1,
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  patientInfoCard: {
    backgroundColor: '#F3F7F9',
    borderRadius: 13,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 12,
  },

  patientAge: {
    color: '#374151',
    fontSize: 11,
    marginTop: 4,
  },

  medicalRecordButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },

  medicalRecordButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },

  medicalRecordButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  patientExercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  patientExercisesTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: 'bold',
  },

  patientExercisesCount: {
    color: '#2B7A9E',
    fontSize: 12,
    fontWeight: 'bold',
  },

  prescriptionDetailCard: {
    backgroundColor: '#F3F7F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 9,
  },

  prescriptionExerciseName: {
    color: '#111827',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },

  prescriptionFrequency: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  prescriptionActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  editPrescriptionButton: {
    flex: 1,
    backgroundColor: '#2B7A9E',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },

  editPrescriptionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },

  deletePrescriptionButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },

  deletePrescriptionButtonText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
