import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ArrowLeft, ClipboardList, Edit3, Trash2, X } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type MedicalRecord = {
  id: string;
  patientId: string;
  diagnosis: string;
  history: string;
  evolution: string;
  createdAt: string;
  patient: {
    id: string;
    name: string;
    email: string;
    birthDate: string;
  };
};

type ApiErrorResponse = {
  message?: string | string[];
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

export function IndividualMedicalRecordView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estado del modal de edición.
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editHistory, setEditHistory] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editEvolution, setEditEvolution] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estado de confirmación y eliminación.
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal reutilizable para mensajes de éxito o error.
  const [feedbackModal, setFeedbackModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showFeedback = (title: string, message: string) => {
    setFeedbackModal({ visible: true, title, message });
  };

  const hideFeedback = () => {
    setFeedbackModal((previous) => ({ ...previous, visible: false }));
  };

  const fetchRecordDetails = useCallback(async () => {
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

      if (!id) {
        throw new Error('No se recibió el ID del expediente.');
      }

      const response = await fetch(
        `${baseUrl}/create-medical-records/${encodeURIComponent(id)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `No se pudo obtener el expediente. Código: ${response.status}`
        );
      }

      const data: MedicalRecord = await response.json();
      setRecord(data);
    } catch (error) {
      console.error('Error al cargar detalle del expediente:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecordDetails();
  }, [fetchRecordDetails]);

  // Abre el modal y carga los valores actuales del expediente.
  const handleEdit = () => {
    if (!record) return;

    setEditHistory(record.history || '');
    setEditDiagnosis(record.diagnosis || '');
    setEditEvolution(record.evolution || '');
    setIsEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    if (isSaving) return;
    setIsEditModalVisible(false);
  };

  // Guarda únicamente los campos clínicos; el paciente asociado no se modifica.
  const handleSaveEdit = async () => {
    if (!editHistory.trim() || !editDiagnosis.trim() || !editEvolution.trim()) {
      showFeedback(
        'Campos incompletos',
        'Por favor completa Antecedentes, Diagnóstico previo y Observaciones.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        throw new Error('No se encontró una sesión activa. Inicia sesión nuevamente.');
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL
        ?.trim()
        .replace(/\/+$/, '');

      if (!baseUrl) {
        throw new Error('No se encontró EXPO_PUBLIC_API_URL.');
      }

      const response = await fetch(
        `${baseUrl}/create-medical-records/${encodeURIComponent(id)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            history: editHistory.trim(),
            diagnosis: editDiagnosis.trim(),
            evolution: editEvolution.trim(),
          }),
        }
      );

      const responseData = await parseApiResponse<MedicalRecord>(response);

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse;
        throw new Error(
          getApiErrorMessage(errorData.message) ||
            `No se pudieron guardar los cambios. Código: ${response.status}`
        );
      }

      const updatedRecord = responseData as MedicalRecord;

      // Actualiza la vista con la respuesta del backend.
      setRecord((currentRecord) => {
        if (!currentRecord) return updatedRecord;

        return {
          ...currentRecord,
          ...updatedRecord,
          patient: updatedRecord.patient || currentRecord.patient,
        };
      });

      setIsEditModalVisible(false);
      showFeedback(
        'Cambios guardados',
        'La información del expediente médico se actualizó correctamente.'
      );
    } catch (error) {
      console.error('Error al actualizar expediente:', error);
      showFeedback(
        'No se pudieron guardar los cambios',
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado. Inténtalo nuevamente.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const token = await SecureStore.getItemAsync('access_token');

      if (!token) {
        throw new Error('No se encontró una sesión activa. Inicia sesión nuevamente.');
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL
        ?.trim()
        .replace(/\/+$/, '');

      if (!baseUrl) {
        throw new Error('No se encontró EXPO_PUBLIC_API_URL.');
      }

      const response = await fetch(
        `${baseUrl}/create-medical-records/${encodeURIComponent(id)}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await parseApiResponse<unknown>(response);

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse;
        throw new Error(
          getApiErrorMessage(errorData.message) ||
            `No se pudo eliminar el expediente. Código: ${response.status}`
        );
      }

      setIsDeleteModalVisible(false);
      router.replace('/(admin)/medicalRecords');
    } catch (error) {
      console.error('Error al eliminar expediente:', error);
      setIsDeleteModalVisible(false);
      showFeedback(
        'No se pudo eliminar',
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado. Inténtalo nuevamente.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Cálculo de la edad a partir de la fecha de nacimiento.
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 'Edad no disponible';

    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const birthdayPending =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate());

    if (birthdayPending) {
      age--;
    }

    return `${age} años`;
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#2B7A9E" />
        <Text style={{ marginTop: 10, color: '#374151' }}>
          Cargando expediente...
        </Text>
      </SafeAreaView>
    );
  }

  if (!record) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          },
        ]}
      >
        <Text
          style={{
            fontSize: 16,
            color: '#111827',
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          No se encontró información del expediente.
        </Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.replace('/(admin)/medicalRecords')}
        >
          <Text style={styles.editButtonText}>Regresar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(admin)/medicalRecords')}
              activeOpacity={0.7}
            >
              <ArrowLeft color="#000000" size={20} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Expediente Médico</Text>
              <Text style={styles.headerSubtitle}>
                Creado el:{' '}
                {new Date(record.createdAt).toLocaleDateString('es-ES')}
              </Text>
            </View>
          </View>

          <View style={styles.idsRow}>
            <Text style={styles.idText}>
              ID expediente:{' '}
              <Text style={styles.idValue}>
                {record.id.slice(0, 8)}...
              </Text>
            </Text>
            <Text style={styles.idText}>
              ID paciente:{' '}
              <Text style={styles.idValue}>
                {record.patientId.slice(0, 8)}...
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.bodyContainer}>
          <Text style={styles.sectionCategoryTitle}>Datos generales</Text>

          <View style={styles.patientCard}>
            <View style={styles.patientAvatarCircle}>
              <Text style={styles.patientAvatarText}>
                {record.patient?.name
                  ? record.patient.name.charAt(0).toUpperCase()
                  : 'P'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.patientName}>
                {record.patient?.name || 'Sin nombre'}
              </Text>
              <Text style={styles.patientAge}>
                {calculateAge(record.patient?.birthDate)}
              </Text>
              <Text style={styles.patientEmail}>
                {record.patient?.email || 'Sin correo'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionCategoryTitle}>Información clínica</Text>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <ClipboardList color="#000000" size={20} />
              <Text style={styles.cardTitle}>ANTECEDENTES</Text>
            </View>
            <Text style={styles.cardDescription}>{record.history}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <ClipboardList color="#000000" size={20} />
              <Text style={styles.cardTitle}>DIAGNÓSTICO PREVIO</Text>
            </View>
            <Text style={styles.cardDescription}>{record.diagnosis}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <ClipboardList color="#000000" size={20} />
              <Text style={styles.cardTitle}>OBSERVACIONES</Text>
            </View>
            <Text style={styles.cardDescription}>{record.evolution}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.85}
              onPress={handleEdit}
            >
              <Edit3 color="#FFFFFF" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.85}
              onPress={handleDelete}
            >
              <Trash2 color="#FFFFFF" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para editar la información clínica. */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleCancelEdit}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.editModalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>Editar expediente</Text>
                <Text style={styles.modalSubtitle}>
                  Actualiza la información clínica del paciente.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={handleCancelEdit}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <X color="#374151" size={20} />
              </TouchableOpacity>
            </View>

            <View style={styles.patientSummary}>
              <View style={styles.patientSummaryAvatar}>
                <Text style={styles.patientSummaryAvatarText}>
                  {record.patient?.name
                    ? record.patient.name.charAt(0).toUpperCase()
                    : 'P'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientSummaryName}>
                  {record.patient?.name || 'Paciente'}
                </Text>
                <Text style={styles.patientSummaryEmail}>
                  {record.patient?.email || 'Sin correo'}
                </Text>
              </View>
              <View style={styles.readOnlyTag}>
                <Text style={styles.readOnlyTagText}>Solo lectura</Text>
              </View>
            </View>

            <ScrollView
              style={styles.editFormScroll}
              contentContainerStyle={styles.editFormContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.editFieldLabel}>Antecedentes</Text>
              <TextInput
                style={styles.editTextArea}
                placeholder="Describe los antecedentes médicos..."
                placeholderTextColor="#9CA3AF"
                value={editHistory}
                onChangeText={setEditHistory}
                multiline
                textAlignVertical="top"
                editable={!isSaving}
              />

              <Text style={styles.editFieldLabel}>Diagnóstico previo</Text>
              <TextInput
                style={styles.editTextArea}
                placeholder="Escribe el diagnóstico clínico..."
                placeholderTextColor="#9CA3AF"
                value={editDiagnosis}
                onChangeText={setEditDiagnosis}
                multiline
                textAlignVertical="top"
                editable={!isSaving}
              />

              <Text style={styles.editFieldLabel}>Observaciones</Text>
              <TextInput
                style={styles.editTextArea}
                placeholder="Describe la evolución u observaciones..."
                placeholderTextColor="#9CA3AF"
                value={editEvolution}
                onChangeText={setEditEvolution}
                multiline
                textAlignVertical="top"
                editable={!isSaving}
              />

              <Text style={styles.editHelperText}>
                El paciente asociado al expediente no se puede modificar.
              </Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSaving && styles.disabledButton,
                ]}
                onPress={handleSaveEdit}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Confirmación antes de eliminar el expediente. */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          if (!isDeleting) setIsDeleteModalVisible(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalCard}>
            <View style={styles.deleteIconCircle}>
              <Trash2 color="#DC2626" size={25} />
            </View>
            <Text style={styles.confirmTitle}>¿Eliminar expediente?</Text>
            <Text style={styles.confirmMessage}>
              Esta acción eliminará el expediente médico de{' '}
              <Text style={styles.confirmPatientName}>
                {record.patient?.name || 'este paciente'}
              </Text>
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsDeleteModalVisible(false)}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmDeleteButton,
                  isDeleting && styles.disabledButton,
                ]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
                activeOpacity={0.85}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteButtonText}>Eliminar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mensajes de resultado o validación. */}
      <Modal
        visible={feedbackModal.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={hideFeedback}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTitle}>{feedbackModal.title}</Text>
            <Text style={styles.feedbackMessage}>{feedbackModal.message}</Text>
            <TouchableOpacity
              style={styles.feedbackButton}
              onPress={hideFeedback}
              activeOpacity={0.85}
            >
              <Text style={styles.feedbackButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CBE5FF' },
  scrollContent: { paddingHorizontal: 0, paddingTop: 0 },
  headerContainer: {
    backgroundColor: '#2B7A9E',
    paddingTop: 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 16,
  },
  bodyContainer: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 13, color: '#fff' },
  idsRow: {
    flexDirection: 'column',
    paddingHorizontal: 4,
    marginBottom: 4,
    gap: 3,
  },
  idText: { fontSize: 13, color: '#fff', fontWeight: '500' },
  idValue: { color: '#fff' },
  sectionCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 6,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  patientAvatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarText: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  patientName: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  patientAge: { fontSize: 13, color: '#4B5563', marginVertical: 1 },
  patientEmail: { fontSize: 12, color: '#6B7280' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },
  cardDescription: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 12, marginBottom: 10, marginTop: 10 },
  editButton: {
    flex: 1,
    backgroundColor: '#2B7A9E',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF0000',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  // Estilos del modal de edición.
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  editModalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitleContainer: { flex: 1, paddingRight: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  modalSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  closeModalButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  patientSummaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientSummaryAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B7A9E',
  },
  patientSummaryName: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  patientSummaryEmail: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  readOnlyTag: {
    backgroundColor: '#DCEAF3',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  readOnlyTagText: { color: '#2B7A9E', fontSize: 9, fontWeight: 'bold' },
  editFormScroll: { flexGrow: 0, flexShrink: 1 },
  editFormContent: { paddingBottom: 4 },
  editFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 5,
  },
  editTextArea: {
    minHeight: 92,
    maxHeight: 150,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 13,
    color: '#111827',
    lineHeight: 19,
    marginBottom: 10,
  },
  editHelperText: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 8,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: '#374151', fontSize: 13, fontWeight: 'bold' },
  saveButton: {
    flex: 1.4,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#2B7A9E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  disabledButton: { opacity: 0.65 },

  // Estilos de confirmación y mensajes.
  confirmModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    elevation: 8,
  },
  deleteIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmPatientName: { fontWeight: 'bold', color: '#111827' },
  confirmDeleteButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  feedbackCard: {
    width: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  feedbackMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  feedbackButton: {
    width: '100%',
    backgroundColor: '#2B7A9E',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
});