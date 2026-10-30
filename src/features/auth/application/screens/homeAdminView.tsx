import { Stack } from 'expo-router';
import { Bell, Calendar, ChevronRight, Dumbbell, FolderKanban, Plus, Users } from 'lucide-react-native';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function HomeAdminView() {
  const insets = useSafeAreaInsets();

  const appointments = [
    { id: '1', code: '#001', tag: 'Próxima', tagColor: '#FEF08A', tagTextColor: '#854D0E', name: 'Nombre del paciente', time: '10:00 a.m || Revisión general' },
    { id: '2', code: '#002', tag: 'Pendiente', tagColor: '#BAE6FD', tagTextColor: '#0369A1', name: 'Nombre del paciente', time: '10:00 a.m || Revisión general' },
    { id: '3', code: '#002', tag: 'Pendiente', tagColor: '#BAE6FD', tagTextColor: '#0369A1', name: 'Nombre del paciente', time: '10:00 a.m || Revisión general' },
  ];

  const patients = [
    { id: '1', code: 'Id #001', name: 'Nombre del Paciente', discomfort: 'Molestia del paciente' },
    { id: '2', code: 'Id #002', name: 'Nombre del Paciente', discomfort: 'Molestia del paciente' },
    { id: '3', code: 'Id #003', name: 'Nombre del Paciente', discomfort: 'Molestia del paciente' },
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
            <Bell color="#000000" size={24} />
          </TouchableOpacity>

          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSubtitle}>¡Bienvenido!</Text>
          <Text style={styles.userName}>Nombre de usuario</Text>
        </View>

        <Text style={styles.sectionHeaderTitle}>RESUMEN GENERAL</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Calendar color="#2B7A9E" size={22} />
              <Text style={styles.statHeaderLabel}>Citas hoy</Text>
            </View>
            <Text style={styles.statNumber}>00</Text>
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
            <Text style={styles.statNumber}>00</Text>
            <Text style={styles.statSubtext}>Registrados</Text>
          </View>
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Acciones rápidas</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.primaryActionBtn} activeOpacity={0.8}>
              <Plus color="#FFFFFF" size={18} style={{ marginRight: 6 }} />
              <Text style={styles.primaryActionText}>Nueva prescripción</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryActionBtn} activeOpacity={0.8}>
              <Plus color="#2B7A9E" size={18} style={{ marginRight: 6 }} />
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
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Ver todas {'>'}{'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subListContainer}>
            {appointments.map((item) => (
              <View key={item.id} style={styles.appointmentItem}>
                <View style={styles.appointmentInfo}>
                  <View style={styles.appointmentTopRow}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeBadgeText}>{item.code}</Text>
                    </View>
                    <View style={[styles.statusTag, { backgroundColor: item.tagColor }]}>
                      <Text style={[styles.statusTagText, { color: item.tagTextColor }]}>{item.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.patientName}>{item.name}</Text>
                  <Text style={styles.appointmentMeta}>{item.time}</Text>
                </View>
                <TouchableOpacity style={styles.actionArrow} activeOpacity={0.8}>
                  <ChevronRight color="#FFFFFF" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Users color="#000000" size={20} />
              <Text style={styles.cardTitleText}>Pacientes recientes</Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAllText}>Ver todos {'>'}{'>'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subListContainer}>
            {patients.map((item) => (
              <View key={item.id} style={styles.patientItem}>
                <View style={styles.patientAvatarBox}>
                  <Text style={styles.patientAvatarText}>NP</Text>
                </View>

                <View style={styles.patientInfo}>
                  <Text style={styles.patientCode}>{item.code}</Text>
                  <Text style={styles.patientFullName}>{item.name}</Text>
                  <Text style={styles.patientDiscomfort}>{item.discomfort}</Text>
                </View>

                <TouchableOpacity style={styles.actionArrow} activeOpacity={0.8}>
                  <ChevronRight color="#FFFFFF" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
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
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginBottom: 2,
  },
  appointmentMeta: {
    fontSize: 11,
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
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  patientFullName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  patientDiscomfort: {
    fontSize: 11,
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
});