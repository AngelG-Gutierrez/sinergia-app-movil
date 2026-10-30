import { Stack, useRouter } from 'expo-router';
import { ChevronRight, ClipboardList, Dumbbell } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function PrescriptionsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const exercises = [
    { id: '1', title: 'Título de ejercicio', details: 'Cantidad o detalles de la repetición', status: 'Completada', statusColor: '#2B7A9E' },
    { id: '2', title: 'Título de ejercicio', details: 'Cantidad o detalles de la repetición', status: 'Pendiente', statusColor: '#4B5563' },
    { id: '3', title: 'Título de ejercicio', details: 'Cantidad o detalles de la repetición', status: 'Completada', statusColor: '#2B7A9E' },
    { id: '4', title: 'Título de ejercicio', details: 'Cantidad o detalles de la repetición', status: 'Completada', statusColor: '#2B7A9E' },
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
            <Dumbbell color="#000000" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Mis ejercicios</Text>
            <Text style={styles.screenSubtitle}>
              Consulta los ejercicios y rutinas programadas por tu fisioterapeuta.
            </Text>
          </View>
        </View>

        <View style={styles.planCard}>
          <View style={styles.planHeaderRow}>
            <ClipboardList color="#FFFFFF" size={20} />
            <Text style={styles.planHeaderText}>PLAN ACTUAL</Text>
          </View>

          <Text style={styles.planTitle}>Título de plan de ejercicio</Text>
          <View style={styles.planDivider} />

          <View style={styles.planInfoRow}>
            <View>
              <Text style={styles.planLabel}>Fecha de asignación</Text>
              <Text style={styles.planValue}>dd / mm / aaaa</Text>
            </View>
            <View>
              <Text style={styles.planLabel}>Total de ejercicios</Text>
              <Text style={styles.planValue}>00 ejercicios</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.planBtn} activeOpacity={0.85}>
            <Text style={styles.planBtnText}>Ver plan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>Todos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
            onPress={() => setFilter('pending')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>Pendientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'completed' && styles.filterTabActive]}
            onPress={() => setFilter('completed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>Realizados</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exercisesList}>
          {exercises.map((item, index) => (
            <View key={index} style={styles.exerciseCard}>
              <View style={styles.exerciseIconBox}>
                <Dumbbell color="#000000" size={24} />
              </View>

              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{item.title}</Text>
                <Text style={styles.exerciseDetails}>{item.details}</Text>
                <Text style={styles.exerciseStatusLabel}>
                  Estatus: <Text style={[styles.exerciseStatusValue, { color: item.statusColor }]}>{item.status}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.actionArrow}
                activeOpacity={0.8}
                onPress={() => router.push("/(patient)/prescriptionsDetails")}
              >
                <ChevronRight color="#FFFFFF" size={20} />
              </TouchableOpacity>
            </View>
          ))}
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
    marginBottom: 16,
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
  planCard: {
    backgroundColor: '#237397',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  planHeaderText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  planDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 12,
  },
  planInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  planLabel: {
    fontSize: 11,
    color: '#E0F2FE',
    marginBottom: 2,
  },
  planValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  planBtnText: {
    color: '#237397',
    fontSize: 13,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    borderColor: '#237397',
  },
  filterTabText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#237397',
    fontWeight: 'bold',
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exerciseIconBox: {
    width: 48,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  exerciseDetails: {
    fontSize: 12,
    color: '#4B5563',
    marginVertical: 2,
  },
  exerciseStatusLabel: {
    fontSize: 12,
    color: '#374151',
  },
  exerciseStatusValue: {
    fontWeight: 'bold',
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
});