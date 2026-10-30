import { Stack } from 'expo-router';
import { Bell, ChevronRight, Clock, Menu, Search } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function AppointmentsAdminView() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  const appointments = [
    { id: '1', code: '#001', status: 'Próxima', statusBg: '#FEF08A', statusText: '#854D0E', name: 'Nombre del paciente', details: '10:00 a.m || Revisión general' },
    { id: '2', code: '#001', status: 'Próxima', statusBg: '#FEF08A', statusText: '#854D0E', name: 'Nombre del paciente', details: '10:00 a.m || Revisión general' },
    { id: '3', code: '#001', status: 'Completada', statusBg: '#BBF7D0', statusText: '#166534', name: 'Nombre del paciente', details: '10:00 a.m || Revisión general' },
    { id: '4', code: '#001', status: 'Cancelada', statusBg: '#FECACA', statusText: '#991B1B', name: 'Nombre del paciente', details: '10:00 a.m || Revisión general' },
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
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
            <Menu color="#000000" size={24} />
          </TouchableOpacity>

          <View style={styles.headerRightRow}>
            <TouchableOpacity style={styles.headerIconBtn} activeOpacity={0.7}>
              <Bell color="#000000" size={24} />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>A</Text>
            </View>
          </View>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <Clock color="#000000" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Agenda</Text>
            <Text style={styles.screenSubtitle}>Administra y configura.</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Citas hoy</Text>
            <Text style={styles.statNumber}>00</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Citas en la semana</Text>
            <Text style={styles.statNumber}>00</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Atendidas</Text>
            <Text style={styles.statNumber}>00</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statHeaderLabel}>Canceladas</Text>
            <Text style={styles.statNumber}>00</Text>
          </View>
        </View>

        <Text style={styles.sectionHeaderTitle}>Listado de citas registradas</Text>

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

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>Todas</Text>
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
            <Text style={[styles.filterTabText, filter === 'completed' && styles.filterTabTextActive]}>Completadas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'cancelled' && styles.filterTabActive]}
            onPress={() => setFilter('cancelled')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'cancelled' && styles.filterTabTextActive]}>Canceladas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentsList}>
          {appointments.map((item, index) => (
            <View key={index} style={styles.appointmentCard}>
              <View style={styles.appointmentInfo}>
                <View style={styles.appointmentTopRow}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeBadgeText}>{item.code}</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: item.statusBg }]}>
                    <Text style={[styles.statusTagText, { color: item.statusText }]}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.patientName}>{item.name}</Text>
                <Text style={styles.appointmentMeta}>{item.details}</Text>
              </View>

              <TouchableOpacity style={styles.actionArrow} activeOpacity={0.8}>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontSize: 13,
    color: '#374151',
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 6,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterTabActive: {
    borderColor: '#2B7A9E',
  },
  filterTabText: {
    fontSize: 11,
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
});