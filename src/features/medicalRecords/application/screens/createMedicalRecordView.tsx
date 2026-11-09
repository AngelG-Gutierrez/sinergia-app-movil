import { Stack, useRouter } from 'expo-router';
import * as SecureStore from "expo-secure-store";
import { ArrowLeft, Calendar, ChevronRight, ClipboardList, Dumbbell, Mail, Plus, User } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

const getApiErrorMessage = (message?: string | string[]) => {
  if (Array.isArray(message)) {
    return message.join('\n');
  }

  return message || 'Ocurrió un error inesperado.';
};

const parseApiResponse = async <T,>(
  response: Response
): Promise<T | ApiErrorResponse> => {
  const responseText = await response.text();

  if (!responseText) {
    return {};
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    return { message: responseText };
  }
};

export function CreateMedicalRecordView() {

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [patientId, setPatientId] = useState('');
  const [isEditable, setIsEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [antecedents, setAntecedents] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [observations, setObservations] = useState('');
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'error',
    onConfirm: () => {}
  });
  const [loadingMessage, setLoadingMessage] = useState(
    'Procesando solicitud...'
  );

  const showCustomModal = (
    title: string,
    message: string,
    type: string = 'error',
    onConfirm: () => void = () => {}
  ) => {
    setModalConfig({ visible: true, title, message, type, onConfirm });
  };

  const hideCustomModal = () => {
    modalConfig.onConfirm();
    setModalConfig(prev => ({ ...prev, visible: false }));
  };

  const handlePatientIdChange = (value: string) => {
    setPatientId(value);
    setIsEditable(false);

    setName('');
    setAge('');
    setEmail('');

    setAntecedents('');
    setDiagnosis('');
    setObservations('');
  };

  const handleValidateId = async () => {
    if (!patientId.trim()) {
      showCustomModal(
        'Campo vacío',
        'Por favor ingresa un ID de paciente válido.'
      );
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Buscando información del paciente...');
    setIsEditable(false);

    try {
      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        showCustomModal(
          'Sesión expirada',
          'No se encontró tu sesión. Por favor, inicia sesión nuevamente.'
        );
        return;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL
        ?.trim()
        .replace(/\/+$/, '');

      if (!baseUrl) {
        throw new Error('API_URL_NOT_CONFIGURED');
      }

      const response = await fetch(
        `${baseUrl}/create-medical-records/patient/${encodeURIComponent(patientId.trim())}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await parseApiResponse<PatientResponse>(response);

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse;
        if (response.status === 404) {
          showCustomModal(
            'Paciente no encontrado',
            'No se encontró ningún paciente con ese ID. Verifica que lo hayas escrito correctamente.'
          );
        } else if (response.status === 401) {
          showCustomModal(
            'Sesión expirada',
            'Tu sesión no es válida. Inicia sesión nuevamente.'
          );
        } else if (response.status === 403) {
          showCustomModal(
            'Acceso denegado',
            'No tienes permisos para consultar esta información.'
          );
        } else {
          showCustomModal(
            'Error al consultar',
            getApiErrorMessage(errorData.message)
          );
        }

        return;
      }

      

  // Información recibida correctamente.
  const patientData = responseData as PatientResponse;

  // Comprobar si el paciente ya tiene un expediente.
  if (patientData.hasMedicalRecord) {
    setIsEditable(false);

    // Limpiar los datos para evitar que quede información anterior.
    setName('');
    setAge('');
    setEmail('');

    setAntecedents('');
    setDiagnosis('');
    setObservations('');

    showCustomModal(
      'Expediente existente',
      'Este paciente ya cuenta con un expediente médico registrado. No es posible crear otro.',
      'warning'
    );

    return;
  }

  // Si no tiene expediente, cargar sus datos normalmente.
  setName(patientData.name || '');
  setAge(String(patientData.age ?? ''));
  setEmail(patientData.email || '');

  setIsEditable(true);

  showCustomModal(
    'Paciente encontrado',
    'Los datos del paciente se han cargado correctamente.',
    'success'
  );

    } catch (error) {
      console.error('Error validando paciente:', error);

      if (error instanceof Error && error.message === 'API_URL_NOT_CONFIGURED') {
        showCustomModal(
          'Error de configuración',
          'No se encontró la dirección del servidor. Verifica la variable EXPO_PUBLIC_API_URL.'
        );
      } else {
        showCustomModal(
          'Error de conexión',
          'No fue posible comunicarse con el servidor. Verifica tu conexión e inténtalo nuevamente.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMorePrescriptions = () => {
    console.log('Añadir más prescripciones');
  };

  // creación del expediente en el backend
  const handleCreateRecord = async () => {
    if (!isEditable) {
      showCustomModal(
        'Validación requerida',
        'Es necesario validar el ID del paciente antes de crear el expediente.',
        'warning'
      );
      return;
    }

    if (!diagnosis.trim() || !antecedents.trim() || !observations.trim()) {
      showCustomModal(
        'Campos incompletos',
        'Por favor llena todos los campos de información clínica.',
        'warning'
      );
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Creando expediente médico...');

    try {
      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        showCustomModal(
          'Sesión expirada',
          'No se encontró tu sesión. Inicia sesión nuevamente.'
        );
        return;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL
        ?.trim()
        .replace(/\/+$/, '');

      if (!baseUrl) {
        throw new Error('API_URL_NOT_CONFIGURED');
      }

      const response = await fetch(
        `${baseUrl}/create-medical-records`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            patientId: patientId.trim(),
            diagnosis: diagnosis.trim(),
            history: antecedents.trim(),
            evolution: observations.trim(),
          }),
        }
      );

      const responseData = await parseApiResponse<unknown>(response);
      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse;
        if (response.status === 409) {
          showCustomModal(
            '¡Atención!',
            'Este paciente ya cuenta con un expediente clínico.'
          );
        } else if (response.status === 401) {
          showCustomModal(
            'Sesión expirada',
            'Tu sesión no es válida. Inicia sesión nuevamente.'
          );
        } else if (response.status === 403) {
          showCustomModal(
            'Acceso denegado',
            'No tienes permisos para crear expedientes clínicos.'
          );
        } else if (response.status === 400) {
          showCustomModal(
            'Datos incorrectos',
            getApiErrorMessage(errorData.message)          );
        } else {
          showCustomModal(
            'Error al crear expediente',
            getApiErrorMessage(errorData.message)
          );
        }

        return;
      }

      showCustomModal(
        '¡Éxito!',
        'Expediente médico creado exitosamente.',
        'success',
        () => router.replace('/(admin)/medicalRecords')
      );

    } catch (error) {
      console.error('Error creando expediente:', error);

      if (error instanceof Error && error.message === 'API_URL_NOT_CONFIGURED') {
        showCustomModal(
          'Error de configuración',
          'No se encontró la dirección del servidor. Verifica EXPO_PUBLIC_API_URL.'
        );
      } else {
        showCustomModal(
          'Error de conexión',
          'No se pudo establecer comunicación con el servidor. Inténtalo nuevamente.'
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

      <Modal transparent visible={isLoading} animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2B7A9E" />
            <Text style={styles.loaderText}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={modalConfig.visible} animationType="fade">
        <View style={styles.loaderOverlay}>
          <View style={styles.alertCard}>
            <Text style={styles.alertTitle}>{modalConfig.title}</Text>
            <Text style={styles.alertMessage}>{modalConfig.message}</Text>
            <TouchableOpacity style={styles.alertButton} onPress={hideCustomModal}>
              <Text style={styles.alertButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/(admin)/medicalRecords')}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#000000" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo expediente</Text>
        </View>

        <Text style={styles.topInstruction}>
          Escribe el ID del paciente al que le asignarás este expediente:
        </Text>

        <View style={styles.validateRow}>
          <TextInput
            style={styles.idInput}
            placeholder="Ej. clxyz1234..."
            placeholderTextColor="#9CA3AF"
            value={patientId}
            onChangeText={handlePatientIdChange}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.validateButton}
            activeOpacity={0.85}
            onPress={handleValidateId}
            disabled={isLoading}
          >
            <Text style={styles.validateButtonText}>Validar ID</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.whiteCardContainer}>
          <View style={styles.sectionTitleRow}>
            <ClipboardList color="#000000" size={20} />
            <Text style={styles.sectionTitle}>Datos generales (Autollenado)</Text>
          </View>

          <View style={[styles.inputContainer, !isEditable && styles.disabledInput]}>
            <User color="#9CA3AF" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor="#9CA3AF"
              value={name}
              editable={false}
            />
          </View>

          <View style={[styles.inputContainer, !isEditable && styles.disabledInput]}>
            <Calendar color="#9CA3AF" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Edad"
              placeholderTextColor="#9CA3AF"
              value={age}
              editable={false}
            />
          </View>

          <View style={[styles.inputContainer, !isEditable && styles.disabledInput]}>
            <Mail color="#9CA3AF" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              placeholderTextColor="#9CA3AF"
              value={email}
              editable={false}
            />
          </View>

          <View style={styles.sectionTitleRow}>
            <ClipboardList color="#000000" size={20} />
            <Text style={styles.sectionTitle}>Información clínica</Text>
          </View>

          <Text style={styles.fieldLabel}>Antecedentes</Text>
          <TextInput
            style={[styles.textArea, !isEditable && styles.disabledInput]}
            placeholder="Antecedentes médicos..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={antecedents}
            onChangeText={setAntecedents}
            editable={isEditable}
          />

          <Text style={styles.fieldLabel}>Diagnóstico previo</Text>
          <TextInput
            style={[styles.textArea, !isEditable && styles.disabledInput]}
            placeholder="Diagnóstico clínico..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={diagnosis}
            onChangeText={setDiagnosis}
            editable={isEditable}
          />

          <Text style={styles.fieldLabel}>Observaciones</Text>
          <TextInput
            style={[styles.textArea, !isEditable && styles.disabledInput]}
            placeholder="Evolución u observaciones..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={observations}
            onChangeText={setObservations}
            editable={isEditable}
          />

          <View style={styles.sectionTitleRow}>
            <Dumbbell color="#000000" size={20} />
            <Text style={styles.sectionTitle}>Prescripciones</Text>
          </View>

          <View style={styles.prescriptionCard}>
            <View style={styles.prescriptionIconBox}>
              <Dumbbell color="#000000" size={22} />
            </View>
            <View style={styles.prescriptionInfo}>
              <Text style={styles.prescriptionCardTitle}>Título de ejercicio</Text>
              <Text style={styles.prescriptionCardSubtitle}>Cantidad o detalles de la repetición</Text>
            </View>
            <View style={styles.arrowButton}>
              <ChevronRight color="#FFFFFF" size={20} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.addMoreButton}
            activeOpacity={0.8}
            onPress={handleAddMorePrescriptions}
          >
            <Plus color="#111827" size={20} style={{ marginRight: 6 }} />
            <Text style={styles.addMoreButtonText}>Añadir más prescripciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, !isEditable && { opacity: 0.6 }]}
            activeOpacity={0.85}
            onPress={handleCreateRecord}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>Crear expediente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#CBE5FF' },

  scrollContent: { paddingTop: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20, gap: 12 },

  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 3 },

  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },

  topInstruction: { fontSize: 13, color: '#374151', marginBottom: 10, paddingHorizontal: 20 },

  validateRow: { flexDirection: 'row', gap: 12, marginBottom: 20, paddingHorizontal: 20 },

  idInput: { flex: 1, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, height: 48, fontSize: 15, color: '#111827' },

  validateButton: { backgroundColor: '#2B7A9E', borderRadius: 12, paddingHorizontal: 24, height: 48, alignItems: 'center', justifyContent: 'center' },

  validateButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  whiteCardContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30, marginTop: 10 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, marginTop: 6 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },

  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 14, height: 48, marginBottom: 12 },

  disabledInput: { backgroundColor: '#E5E7EB', opacity: 0.7 },

  inputIcon: { marginRight: 10 },

  input: { flex: 1, fontSize: 14, color: '#111827' },

  fieldLabel: { fontSize: 12, color: '#4B5563', marginBottom: 4, marginTop: 4 },

  textArea: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, height: 90, fontSize: 14, color: '#111827', textAlignVertical: 'top', marginBottom: 12 },

  prescriptionCard: { backgroundColor: '#2B7A9E', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

  prescriptionIconBox: { width: 42, height: 46, borderRadius: 10, backgroundColor: '#CBE5FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },

  prescriptionInfo: { flex: 1 },

  prescriptionCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },

  prescriptionCardSubtitle: { fontSize: 11, color: '#E0F2FE', marginTop: 2 },

  arrowButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },

  addMoreButton: { backgroundColor: '#E5E7EB', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginTop: 6 },

  addMoreButtonText: { color: '#111827', fontSize: 14, fontWeight: 'bold' },

  createButton: { backgroundColor: '#2B7A9E', borderRadius: 14, height: 50, alignItems: 'center', justifyContent: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },

  createButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  loaderOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },

  loaderContainer: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, alignItems: 'center', gap: 12, width: '80%' },

  loaderText: { fontSize: 14, color: '#374151', textAlign: 'center', fontWeight: '500' },

  alertCard: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 20, width: '85%', alignItems: 'center', elevation: 5 },

  alertTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },

  alertMessage: { fontSize: 14, color: '#4B5563', textAlign: 'center', marginBottom: 20 },

  alertButton: { backgroundColor: '#2B7A9E', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 30, width: '100%', alignItems: 'center' },

  alertButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

});