
import {
  Stack,
  useLocalSearchParams,
  useRouter
} from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  ArrowLeft,
  Calendar,
  Check,
  ClipboardList,
  Dumbbell,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
  statusCode?: number;
};

type PatientResponse = {
  id: string;
  name: string;
  email: string;
  age: string | number;
  hasMedicalRecord: boolean;
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

type SelectedExercise = {
  key: string;
  exerciseId: string;
  exerciseName: string;
  description: string;
  mediaUrl: string;
  frequency: string;
  duration: string;
  equipment: string;
};

const API_EXERCISES = 'https://oss.exercisedb.dev/api/v1';

const parseApiResponse = async <T,>(
  response: Response,
): Promise<T | ApiErrorResponse> => {
  const responseText = await response.text();

  if (!responseText) return {};

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return { message: responseText };
  }
};

const getApiErrorMessage = (message?: string | string[]) => {
  if (Array.isArray(message)) return message.join('\n');
  return message || 'Ocurrió un error inesperado.';
};

const getExerciseArray = (data: any): Exercise[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.exercises)) return data.exercises;
  return [];
};

export function NewPrescriptionAdminView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    exercise?: string;
    newSession?: string;
    patientId?: string;
    mode?: string;
    prescriptionId?: string;
  }>();
  const isEditingPrescription = params.mode === 'edit-exercise';

  const [patientId, setPatientId] = useState('');
  const [patient, setPatient] = useState<PatientResponse | null>(null);
  const [isPatientValidated, setIsPatientValidated] = useState(false);

  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [showCatalog, setShowCatalog] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Procesando solicitud...');

  const [showRecord, setShowRecord] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [recordLoading, setRecordLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const resetForm = () => {
    setPatientId('');
    setPatient(null);
    setIsPatientValidated(false);

    setSelectedExercises([]);

    setShowRecord(false);
    setMedicalRecord(null);
    setRecordLoading(false);

    setShowCatalog(false);
    setCatalogSearch('');

    setAlertConfig({
        visible: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });
  };

  // Limpiar el formulario cada vez que se inicia una nueva prescripción.
  useEffect(() => {
      if (!params.newSession) return;

      resetForm();
  }, [params.newSession]);

  const showAlert = (
    title: string,
    message: string,
    onConfirm: () => void = () => {},
  ) => {
    setAlertConfig({ visible: true, title, message, onConfirm });
  };

  const hideAlert = () => {
    const callback = alertConfig.onConfirm;
    setAlertConfig((prev) => ({ ...prev, visible: false }));
    callback();
  };

  const getBaseUrl = () => {
    const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, '');
    if (!baseUrl) throw new Error('API_URL_NOT_CONFIGURED');
    return baseUrl;
  };

  const getToken = async () => {
    const token = await SecureStore.getItemAsync('access_token');
    if (!token) throw new Error('SESSION_EXPIRED');
    return token;
  };

  // Cargar los datos de una prescripción cuando se abre el formulario en modo edición.
  useEffect(() => {
    if (!isEditingPrescription || !params.prescriptionId) return;

    const loadPrescriptionForEdit = async () => {
      setIsLoading(true);
      setLoadingMessage('Cargando prescripción...');

      try {
        const token = await getToken();
        const baseUrl = getBaseUrl();

        // Obtener la prescripción individual.
        const response = await fetch(
          `${baseUrl}/prescriptions/${encodeURIComponent(params.prescriptionId!)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await parseApiResponse<any>(response);

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage((result as ApiErrorResponse).message),
          );
        }

        const prescription = result as any;
        const currentPatientId = prescription.patientId || params.patientId;

        if (!currentPatientId) {
          throw new Error('No se pudo identificar al paciente de esta prescripción.');
        }

        // Obtener los datos completos del paciente para mostrar nombre y edad.
        const patientResponse = await fetch(
          `${baseUrl}/create-medical-records/patient/${encodeURIComponent(currentPatientId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const patientResult = await parseApiResponse<PatientResponse>(
          patientResponse,
        );

        if (!patientResponse.ok) {
          throw new Error(
            getApiErrorMessage(
              (patientResult as ApiErrorResponse).message,
            ),
          );
        }

        setPatientId(currentPatientId);
        setPatient(patientResult as PatientResponse);
        setIsPatientValidated(true);

        // Precargar los campos del ejercicio seleccionado.
        setSelectedExercises([
          {
            key: prescription.id,
            exerciseId: prescription.id,
            exerciseName: prescription.exerciseName || '',
            description: prescription.description || '',
            mediaUrl: prescription.mediaUrl || '',
            frequency: prescription.frequency || '',
            duration: prescription.duration || '',
            equipment: prescription.equipment || '',
          },
        ]);
      } catch (error) {
        console.error('Error cargando prescripción para editar:', error);

        showAlert(
          'No fue posible cargar la prescripción',
          error instanceof Error
            ? error.message
            : 'Ocurrió un error al recuperar los datos.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadPrescriptionForEdit();
  }, [isEditingPrescription, params.prescriptionId]);

  const handlePatientIdChange = (value: string) => {
    setPatientId(value);
    setPatient(null);
    setIsPatientValidated(false);
    setMedicalRecord(null);
    setShowRecord(false);
  };

  // Validar paciente mediante el endpoint existente de expedientes.
  const handleValidatePatient = async () => {
    if (!patientId.trim()) {
      showAlert('Campo vacío', 'Ingresa el ID del paciente.');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Validando información del paciente...');

    try {
      const token = await getToken();

      const response = await fetch(
        `${getBaseUrl()}/create-medical-records/patient/${encodeURIComponent(patientId.trim())}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = await parseApiResponse<PatientResponse>(response);

      if (!response.ok) {
        showAlert(
          response.status === 404 ? 'Paciente no encontrado' : 'No fue posible validar',
          getApiErrorMessage((result as ApiErrorResponse).message),
        );
        return;
      }

      const patientData = result as PatientResponse;

      setPatient(patientData);
      setIsPatientValidated(true);

      showAlert(
        'Paciente encontrado',
        patientData.hasMedicalRecord
          ? 'Sus datos se cargaron correctamente. Ya cuenta con expediente médico.'
          : 'El paciente no cuenta con expediente médico. No podrá recibir prescripciones hasta que se registre uno.',
      );

    } catch (error) {
      console.error('Error validando paciente:', error);

      showAlert(
        'Error de conexión',
        error instanceof Error && error.message === 'SESSION_EXPIRED'
          ? 'Tu sesión expiró. Inicia sesión nuevamente.'
          : error instanceof Error && error.message === 'API_URL_NOT_CONFIGURED'
            ? 'No se encontró EXPO_PUBLIC_API_URL.'
            : 'No fue posible comunicarse con el servidor.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Consultar el expediente del paciente.
  const handleViewMedicalRecord = async () => {
    if (!patient || !patient.hasMedicalRecord) return;

    setRecordLoading(true);

    try {
      const token = await getToken();

      const response = await fetch(
        `${getBaseUrl()}/create-medical-records/patient/${encodeURIComponent(patient.id)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const result = await parseApiResponse<any>(response);

      if (!response.ok) {
        showAlert(
          'Error',
          getApiErrorMessage((result as ApiErrorResponse).message),
        );
        return;
      }

      // Este endpoint devuelve los datos del paciente y el indicador
      // de expediente. Para obtener el contenido clínico se consulta
      // posteriormente el endpoint individual del expediente.
      const tokenAgain = await getToken();
      const recordsResponse = await fetch(
        `${getBaseUrl()}/create-medical-records`,
        {
          headers: { Authorization: `Bearer ${tokenAgain}` },
        },
      );

      const recordsResult = await parseApiResponse<any[]>(recordsResponse);

      if (!recordsResponse.ok || !Array.isArray(recordsResult)) {
        showAlert('Error', 'No fue posible consultar el expediente médico.');
        return;
      }

      const record = recordsResult.find(
        (item: any) => item.patientId === patient.id,
      );

      if (!record) {
        showAlert('Expediente no encontrado', 'No se encontró el expediente de este paciente.');
        return;
      }

      setMedicalRecord(record);
      setShowRecord(true);

    } catch (error) {
      console.error('Error consultando expediente:', error);
      showAlert('Error', 'No fue posible consultar el expediente médico.');
    } finally {
      setRecordLoading(false);
    }
  };

  // Cargar catálogo para el modal de selección.
  const fetchCatalog = async () => {
      setCatalogLoading(true);
      setCatalogError('');

      try {
          let offset = 0;
          let allExercises: Exercise[] = [];
          let hasMore = true;

          while (hasMore) {
              const response = await fetch(
                  `${API_EXERCISES}/exercises?limit=25&offset=${offset}`,
              );

              const result = await parseApiResponse<Exercise[]>(response);

              if (!response.ok) {
                  throw new Error(
                      getApiErrorMessage(
                          (result as ApiErrorResponse).message,
                      ),
                  );
              }

              const pageExercises = getExerciseArray(result);

              if (pageExercises.length === 0) {
                  hasMore = false;
                  continue;
              }

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

              if (pageExercises.length < 25) {
                  hasMore = false;
              }
          }

          setCatalog(allExercises);

          if (allExercises.length === 0) {
              setCatalogError('No se encontraron ejercicios en el catálogo.');
          }

      } catch (error) {
          console.error('Error cargando catálogo:', error);

          setCatalogError(
              'No fue posible cargar los ejercicios. Inténtalo nuevamente.',
          );
      } finally {
          setCatalogLoading(false);
      }
  };


  const openCatalog = () => {
    setCatalogSearch('');
    setShowCatalog(true);

    if (catalog.length === 0) {
      fetchCatalog();
    }
  };

  const filteredCatalog = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    return catalog.filter((exercise) =>
      exercise.name.toLowerCase().includes(query),
    );
  }, [catalog, catalogSearch]);

  const addExercise = (exercise: Exercise) => {
    const description = (exercise.instructions || [])
        .map((step, index) =>
            `${index + 1}. ${step.replace(/^Step:\d+\s*/i, '')}`,
        )
        .join('\n');

    const newExercise: SelectedExercise = {
        key: `${exercise.exerciseId}-${Date.now()}`,
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.name,
        description,
        mediaUrl: exercise.gifUrl,
        frequency: '',
        duration: '',
        equipment: '',
    };

    setSelectedExercises((prev) => {
        // Evitar agregar dos veces el mismo ejercicio.
        if (
            prev.some(
                (item) => item.exerciseId === exercise.exerciseId,
            )
        ) {
            return prev;
        }

        return [...prev, newExercise];
    });

    setShowCatalog(false);
  };

  useEffect(() => {
    if (!params.exercise) return;

    try {
        const exercise = JSON.parse(params.exercise) as Exercise;

        addExercise(exercise);

        router.setParams({ exercise: undefined });
    } catch (error) {
        console.error(
            'No se pudo recuperar el ejercicio seleccionado:',
            error,
        );
    }
  }, [params.exercise]);

  const updateExerciseField = (
    key: string,
    field: 'frequency' | 'duration' | 'equipment',
    value: string,
  ) => {
    setSelectedExercises((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeExercise = (key: string) => {
    setSelectedExercises((prev) => prev.filter((item) => item.key !== key));
  };

  // Crear una prescripción o actualizar una existente.
  const handleCreatePrescriptions = async () => {
    if (!isPatientValidated || !patient) {
      showAlert('Validación requerida', 'Primero debes validar el ID del paciente.');
      return;
    }

    if (!patient.hasMedicalRecord) {
      showAlert(
        'Expediente requerido',
        'El paciente necesita contar con un expediente médico antes de recibir ejercicios.',
      );
      return;
    }

    if (selectedExercises.length === 0) {
      showAlert('Sin ejercicios', 'Agrega al menos un ejercicio para continuar.');
      return;
    }

    const incomplete = selectedExercises.some(
      (item) => !item.frequency.trim() || !item.duration.trim(),
    );

    if (incomplete) {
      showAlert(
        'Campos incompletos',
        'Completa la frecuencia y duración del ejercicio.',
      );
      return;
    }

    setIsLoading(true);
    setLoadingMessage(
      isEditingPrescription
        ? 'Guardando cambios...'
        : 'Asignando ejercicios al paciente...',
    );

    try {
      const token = await getToken();
      const baseUrl = getBaseUrl();

      if (isEditingPrescription) {
        // Actualizar la prescripción existente.
        const exercise = selectedExercises[0];

        const response = await fetch(
          `${baseUrl}/prescriptions/${encodeURIComponent(params.prescriptionId!)}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              exerciseName: exercise.exerciseName,
              description: exercise.description || exercise.exerciseName,
              frequency: exercise.frequency.trim(),
              duration: exercise.duration.trim(),
              equipment: exercise.equipment.trim() || undefined,
              mediaUrl: exercise.mediaUrl || undefined,
            }),
          },
        );

        const result = await parseApiResponse<unknown>(response);

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage((result as ApiErrorResponse).message),
          );
        }

        showAlert(
          '¡Cambios guardados!',
          'La prescripción se actualizó correctamente.',
          () => {
            router.replace('/(admin)/prescription');
          },
        );
      } else {
        // Crear nuevas prescripciones, conservando el comportamiento actual.
        for (const exercise of selectedExercises) {
          const response = await fetch(`${baseUrl}/prescriptions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              patientId: patient.id,
              exerciseName: exercise.exerciseName,
              description: exercise.description || exercise.exerciseName,
              frequency: exercise.frequency.trim(),
              duration: exercise.duration.trim(),
              equipment: exercise.equipment.trim() || undefined,
              mediaUrl: exercise.mediaUrl || undefined,
            }),
          });

          const result = await parseApiResponse<unknown>(response);

          if (!response.ok) {
            throw new Error(
              getApiErrorMessage((result as ApiErrorResponse).message),
            );
          }
        }

        showAlert(
          '¡Prescripciones asignadas!',
          `Se asignaron correctamente ${selectedExercises.length} ejercicio(s) a ${patient.name}.`,
          () => {
            router.replace('/(admin)/prescription');
          },
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al guardar la prescripción.';

      if (
        message.includes(
          'El paciente debe haber asistido al menos a una cita finalizada',
        )
      ) {
        showAlert(
          'Cita finalizada requerida',
          'Este paciente todavía no cuenta con una cita finalizada. Primero debe asistir a una consulta para que puedas asignarle ejercicios.',
        );
      } else {
        console.error('Error guardando prescripción:', error);

        showAlert(
          'No fue posible completar la operación',
          message,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#CBE5FF" />

      {/* Indicador de carga */}
      <Modal transparent visible={isLoading || recordLoading} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#2B7A9E" />
            <Text style={styles.loaderText}>
              {recordLoading ? 'Consultando expediente...' : loadingMessage}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Mensajes personalizados */}
      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={hideAlert}>
              <Text style={styles.primaryButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal del expediente */}
      <Modal
        transparent
        visible={showRecord}
        animationType="slide"
        onRequestClose={() => setShowRecord(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Expediente médico</Text>
              <TouchableOpacity onPress={() => setShowRecord(false)}>
                <X color="#111827" size={22} />
              </TouchableOpacity>
            </View>

            {medicalRecord && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.recordLabel}>Diagnóstico</Text>
                <Text style={styles.recordText}>{medicalRecord.diagnosis}</Text>

                <Text style={styles.recordLabel}>Antecedentes</Text>
                <Text style={styles.recordText}>{medicalRecord.history}</Text>

                <Text style={styles.recordLabel}>Evolución y observaciones</Text>
                <Text style={styles.recordText}>{medicalRecord.evolution}</Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para elegir ejercicios */}
      <Modal
        transparent
        visible={showCatalog}
        animationType="slide"
        onRequestClose={() => setShowCatalog(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.catalogModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar ejercicio</Text>
              <TouchableOpacity onPress={() => setShowCatalog(false)}>
                <X color="#111827" size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search color="#9CA3AF" size={19} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar ejercicio..."
                placeholderTextColor="#9CA3AF"
                value={catalogSearch}
                onChangeText={setCatalogSearch}
              />
            </View>

            {catalogLoading ? (
              <View style={styles.catalogLoading}>
                <ActivityIndicator size="large" color="#2B7A9E" />
                <Text style={styles.loaderText}>Cargando ejercicios...</Text>
              </View>
            ) : catalogError ? (
              <View style={styles.catalogLoading}>
                <Text style={styles.emptyText}>{catalogError}</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={fetchCatalog}>
                  <Text style={styles.primaryButtonText}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {filteredCatalog.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.exerciseId}
                    style={styles.catalogExercise}
                    onPress={() => addExercise(exercise)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: exercise.gifUrl }}
                      style={styles.catalogImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.catalogExerciseName} numberOfLines={2}>
                      {exercise.name}
                    </Text>
                    <Plus color="#2B7A9E" size={22} />
                  </TouchableOpacity>
                ))}

                {filteredCatalog.length === 0 && (
                  <Text style={styles.emptyText}>
                    No encontramos ejercicios con ese nombre.
                  </Text>
                )}
              </ScrollView>
            )}

            <Text style={styles.catalogNote}>
              Mostrando los ejercicios de la consulta actual del catálogo.
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(admin)/prescription')}
          >
            <ArrowLeft color="#111827" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditingPrescription ? 'Editar prescripción' : 'Nueva prescripción'}
          </Text>
        </View>

        <Text style={styles.topInstruction}>
          {isEditingPrescription
          ? 'Estás modificando una prescripción del siguiente paciente:'
          : 'Ingresa el ID del paciente al que deseas asignarle ejercicios:'}
        </Text>

        <View style={styles.validateRow}>
          <TextInput
            style={styles.idInput}
            placeholder="ID del paciente"
            placeholderTextColor="#9CA3AF"
            value={patientId}
            onChangeText={handlePatientIdChange}
            editable={!isLoading && !isEditingPrescription}
            autoCapitalize="none"
          />

          {!isEditingPrescription && (
            <TouchableOpacity
              style={styles.validateButton}
              onPress={handleValidatePatient}
              disabled={isLoading}
            >
              <Text style={styles.validateButtonText}>Validar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.sectionTitleRow}>
            <ClipboardList color="#111827" size={20} />
            <Text style={styles.sectionTitle}>Datos del paciente</Text>
          </View>

          <View style={styles.inputContainer}>
            <User color="#9CA3AF" size={19} />
            <TextInput
              style={styles.input}
              placeholder="Nombre del paciente"
              placeholderTextColor="#9CA3AF"
              value={patient?.name || ''}
              editable={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Calendar color="#9CA3AF" size={19} />
            <TextInput
              style={styles.input}
              placeholder="Edad"
              placeholderTextColor="#9CA3AF"
              value={patient ? `${patient.age} años` : ''}
              editable={false}
            />
          </View>

          {isPatientValidated && patient && (
            <View style={styles.patientStatus}>
              <Check color="#2B7A9E" size={18} />
              <Text style={styles.patientStatusText}>Paciente validado</Text>
            </View>
          )}

          {patient?.hasMedicalRecord && (
            <TouchableOpacity
              style={styles.recordButton}
              onPress={handleViewMedicalRecord}
              disabled={recordLoading}
            >
              <ClipboardList color="#2B7A9E" size={18} />
              <Text style={styles.recordButtonText}>Consultar expediente médico</Text>
            </TouchableOpacity>
          )}

          {isPatientValidated && patient && !patient.hasMedicalRecord && (
            <Text style={styles.warningText}>
              Este paciente todavía no cuenta con expediente médico.
            </Text>
          )}

          <View style={[styles.sectionTitleRow, { marginTop: 24 }]}>
            <Dumbbell color="#111827" size={20} />
            <Text style={styles.sectionTitle}>Ejercicios asignados</Text>
          </View>

          {selectedExercises.length === 0 ? (
            <View style={styles.emptyExercises}>
              <Dumbbell color="#2B7A9E" size={34} />
              <Text style={styles.emptyTitle}>Aún no agregas ejercicios</Text>
              <Text style={styles.emptyText}>
                Selecciona uno o varios ejercicios para configurar su prescripción.
              </Text>
            </View>
          ) : (
            selectedExercises.map((exercise, index) => (
              <View key={exercise.key} style={styles.exerciseFormCard}>
                <View style={styles.exerciseFormHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>

                  <Text style={styles.exerciseFormTitle} numberOfLines={2}>
                    {exercise.exerciseName}
                  </Text>

                  
                  {!isEditingPrescription && (
                    <TouchableOpacity
                      onPress={() => removeExercise(exercise.key)}
                      style={styles.removeButton}
                    >
                      <Trash2 color="#DC2626" size={19} />
                    </TouchableOpacity>
                  )}
                </View>

                <Image
                  source={{ uri: exercise.mediaUrl }}
                  style={styles.selectedGif}
                  resizeMode="contain"
                />

                <Text style={styles.fieldLabel}>Frecuencia / repeticiones *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej. 3 series de 12 repeticiones"
                  placeholderTextColor="#9CA3AF"
                  value={exercise.frequency}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.key, 'frequency', value)
                  }
                />

                <Text style={styles.fieldLabel}>Duración estimada *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej. 15 minutos"
                  placeholderTextColor="#9CA3AF"
                  value={exercise.duration}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.key, 'duration', value)
                  }
                />

                <Text style={styles.fieldLabel}>Material o equipo (opcional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej. Banda elástica"
                  placeholderTextColor="#9CA3AF"
                  value={exercise.equipment}
                  onChangeText={(value) =>
                    updateExerciseField(exercise.key, 'equipment', value)
                  }
                />
              </View>
            ))
          )}

          {!isEditingPrescription && (
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={openCatalog}
              activeOpacity={0.85}
            >
            <Plus color="#111827" size={20} />
            <Text style={styles.addExerciseText}>Asignar ejercicio</Text>
          </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.createButton,
              (!isPatientValidated || !patient?.hasMedicalRecord || selectedExercises.length === 0) &&
                styles.disabledButton,
            ]}
            onPress={handleCreatePrescriptions}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isEditingPrescription ? 'Guardar cambios' : 'Confirmar asignación'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.requiredNote}>
            * Campos obligatorios. El equipo o material es opcional.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CBE5FF' },
  scrollContent: { paddingTop: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  topInstruction: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  validateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  idInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: '#111827',
  },
  validateButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 12,
    paddingHorizontal: 22,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  validateButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    marginTop: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 14, color: '#111827' },
  patientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 2,
    marginBottom: 10,
  },
  patientStatusText: { color: '#2B7A9E', fontSize: 13, fontWeight: '600' },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E5F3FA',
    borderRadius: 11,
    padding: 13,
    marginTop: 4,
  },
  recordButtonText: { color: '#2B7A9E', fontWeight: 'bold', fontSize: 13 },
  warningText: { color: '#B45309', fontSize: 13, marginTop: 5 },
  emptyExercises: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 22,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 9,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  exerciseFormCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    padding: 14,
    marginBottom: 14,
  },
  exerciseFormHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: { fontWeight: 'bold', color: '#2B7A9E' },
  exerciseFormTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  removeButton: { padding: 5 },
  selectedGif: {
    width: '100%',
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#4B5563',
    marginBottom: 5,
    marginTop: 7,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 45,
    fontSize: 13,
    color: '#111827',
  },
  addExerciseButton: {
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 5,
    marginBottom: 18,
  },
  addExerciseText: { color: '#111827', fontSize: 14, fontWeight: 'bold' },
  createButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  disabledButton: { opacity: 0.55 },
  createButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  requiredNote: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    width: '85%',
  },
  loaderText: { color: '#374151', fontSize: 14, textAlign: 'center' },
  alertCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 9,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 21,
  },
  primaryButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
  },
  catalogModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  recordLabel: {
    color: '#2B7A9E',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 5,
  },
  recordText: { color: '#374151', fontSize: 14, lineHeight: 21 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#111827', fontSize: 14 },
  catalogLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    gap: 12,
  },
  catalogExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  catalogImage: {
    width: 66,
    height: 66,
    backgroundColor: '#F8FAFC',
    borderRadius: 9,
  },
  catalogExerciseName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  catalogNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
