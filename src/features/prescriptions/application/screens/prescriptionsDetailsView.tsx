import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Dumbbell, Layers, Repeat, Stethoscope } from 'lucide-react-native';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function PrescriptionsDetailsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleComplete = () => {
    console.log('Marcar ejercicio como completado');
  };

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
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace("/(patient)/prescriptions")}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#000000" size={20} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Detalles del ejercicio</Text>
            <Text style={styles.headerTitle}>Nombre del ejercicio</Text>
          </View>
        </View>

        <View style={styles.gifCard}>
          <Text style={styles.gifText}>Gif del ejercicio</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Stethoscope color="#000000" size={20} />
            <Text style={styles.sectionTitle}>DESCRIPCIÓN TÉCNICA</Text>
          </View>
          <Text style={styles.descriptionText}>
            Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio
          </Text>
        </View>

        <View style={styles.rowCards}>
          <View style={styles.halfCard}>
            <View style={styles.miniIconBox}>
              <Layers color="#2B7A9E" size={22} />
            </View>
            <Text style={styles.halfLabel}>SERIES</Text>
            <Text style={styles.halfValue}>00 Series</Text>
          </View>

          <View style={styles.halfCard}>
            <View style={styles.miniIconBox}>
              <Clock color="#2B7A9E" size={22} />
            </View>
            <Text style={styles.halfLabel}>DURACIÓN</Text>
            <Text style={styles.halfValue}>15 min</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Repeat color="#000000" size={20} />
            <Text style={styles.sectionTitle}>REPETICIONES</Text>
          </View>
          <Text style={styles.singleValueText}>12 por cada pie y mano</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Dumbbell color="#000000" size={20} />
            <Text style={styles.sectionTitle}>EQUIPO</Text>
          </View>
          <Text style={styles.singleValueText} numberOfLines={1}>
            Banda elástica, mancuerna...
          </Text>
        </View>

        <View style={[styles.card, styles.physioCard]}>
          <View style={styles.sectionTitleRow}>
            <Stethoscope color="#000000" size={20} />
            <Text style={styles.sectionTitle}>INSTRUCCIONES DEL FISIOTERAPEUTA</Text>
          </View>
          <Text style={styles.descriptionText}>
            Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio Descripción del ejercicio
          </Text>
        </View>

        <TouchableOpacity
          style={styles.completeButton}
          activeOpacity={0.85}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Marcar como Completado</Text>
        </TouchableOpacity>
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
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  gifCard: {
    backgroundColor: '#C6E0FF',
    borderRadius: 20,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  gifText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  physioCard: {
    borderColor: '#FCA5A5',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  rowCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  miniIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  halfLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  halfValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  singleValueText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  completeButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});