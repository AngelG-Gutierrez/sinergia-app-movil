import { useFocusEffect, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { ChevronRight, ClipboardList, FileQuestion, Plus, Search } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
  };
};


export function MedicalRecordsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedicalRecords = useCallback(async () => {
    setIsLoading(true);

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

      const response = await fetch(
        `${baseUrl}/create-medical-records`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener los expedientes médicos.');
      }

      const data: MedicalRecord[] = await response.json();

      setRecords(data);
    } catch (error) {
      console.error('Error cargando expedientes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMedicalRecords();
    }, [fetchMedicalRecords])
  );

  // Filtrar registros según la barra de búsqueda
  const filteredRecords = records.filter((item) => {
    const query = searchQuery.toLowerCase().trim();

    const recordId = item.id.toLowerCase();
    const patientId = item.patient?.id?.toLowerCase() || '';
    const patientName = item.patient?.name?.toLowerCase() || '';

    return (
      recordId.includes(query) ||
      patientId.includes(query) ||
      patientName.includes(query)
    );
  });


  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#CBE5FF" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 80) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <ClipboardList color="#000000" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenSubtitle}>
              Consulta la información de todos los expedientes médicos de tus pacientes.
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por ID o nombre"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2B7A9E" />
            <Text style={styles.loaderText}>Cargando expedientes...</Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <FileQuestion color="#2B7A9E" size={48} />
            </View>

            <Text style={styles.emptyTitle}>
              No hay expedientes médicos
            </Text>

            <Text style={styles.emptySubtitle}>
              Aún no se ha registrado ningún expediente en el sistema.
              Comienza creando el primero.
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.85}
              onPress={() => router.replace('/(admin)/createMedicalRecord')}
            >
              <Plus color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
              <Text style={styles.emptyButtonText}>
                Crear primer expediente
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Search color="#2B7A9E" size={48} />
            </View>

            <Text style={styles.emptyTitle}>
              No se encontraron resultados
            </Text>

            <Text style={styles.emptySubtitle}>
              No hay expedientes relacionados con:
            </Text>

            <Text style={styles.searchResultText}>
              "{searchQuery.trim()}"
            </Text>

            <TouchableOpacity
              style={styles.emptyButton}
              activeOpacity={0.85}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.emptyButtonText}>
                Limpiar búsqueda
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {filteredRecords.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recordCard}
                activeOpacity={0.8}
                onPress={() => router.push({
                  pathname: '/(admin)/individualMedicalRecord',
                  params: { id: item.id }
                })}
              >
                <View style={styles.recordIconBox}>
                  <ClipboardList color="#000000" size={24} />
                </View>

                
                <View style={styles.recordInfo}>
                  <Text style={styles.recordTitle}>
                    ID: {item.id.slice(0, 12) + (item.id.length > 15 ? '...' : '')}
                  </Text>

                  <Text style={styles.recordPatient}>
                    {item.patient?.name || 'Paciente sin nombre'}
                  </Text>

                  <Text style={styles.recordDate}>
                    Creado: {
                      new Date(item.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    }
                  </Text>
                </View>

                <View style={styles.arrowButton}>
                  <ChevronRight color="#000000" size={22} />
                </View>
              </TouchableOpacity>
            ))}

          </View>
        )}
      </ScrollView>

      {/* Botón flotante para crear nuevo expediente */}
      <TouchableOpacity
        style={[styles.floatingButton, { bottom: Math.max(insets.bottom, 16) }]}
        activeOpacity={0.85}
        onPress={() => router.replace('/(admin)/createMedicalRecord')}
      >
        <Plus color="#FFFFFF" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CBE5FF' },
  scrollContent: { paddingHorizontal: 20 },
  titleSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12, marginTop: -5 },
  titleIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E5EFF7', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { fontSize: 22, marginBottom: 5, fontWeight: 'bold', color: '#000000' },
  screenSubtitle: { fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 14, height: 48, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#111827' },
  loaderContainer: { marginTop: 60, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderText: { fontSize: 14, color: '#374151' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 40, elevation: 2 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, color: '#4B5563', textAlign: 'center', marginBottom: 5, lineHeight: 18 },
  emptyButton: { backgroundColor: '#2B7A9E', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  recordsList: { gap: 14 },
  recordCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  recordIconBox: { width: 48, height: 54, borderRadius: 10, backgroundColor: '#CBE5FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  recordInfo: { flex: 1 },
  recordTitle: { fontSize: 14, fontWeight: 'bold', color: '#111827', flexWrap: 'wrap' },
  recordPatient: { fontSize: 15, fontWeight: '600', color: '#2B7A9E', marginTop: 1 },
  recordDate: { fontSize: 12, color: '#4B5563', marginVertical: 2 },
  recordStatusLabel: { fontSize: 12, color: '#374151' },
  recordStatusValue: { color: '#2B7A9E', fontWeight: 'bold' },
  arrowButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D1E7EB', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  floatingButton: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#2B7A9E', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 99 },
  searchResultText: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#2B7A9E',
  textAlign: 'center',
  marginTop: 8,
  marginBottom: 16,
},
});