import { router, Stack } from 'expo-router';
import { Calendar, CalendarCheck, Clock, History, MapPin, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function AppointmentsView() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');

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
            <CalendarCheck color="#000000" size={24} />
          </View>
          <View>
            <Text style={styles.screenTitle}>Mis citas</Text>
            <Text style={styles.screenSubtitle}>Consulta y administra tus citas</Text>
          </View>
        </View>

        <View style={styles.nextAppointmentCard}>
          <View style={styles.nextHeaderRow}>
            <CalendarCheck color="#FFFFFF" size={20} />
            <Text style={styles.nextHeaderText}>PRÓXIMA CITA</Text>
          </View>

          <View style={styles.nextDivider} />

          <View style={styles.nextDetailsRow}>
            <View style={styles.dateBadge}>
              <Text style={styles.badgeMonth}>Mes</Text>
              <Text style={styles.badgeDayNumber}>00</Text>
              <Text style={styles.badgeDayName}>Lunes</Text>
            </View>

            <View style={styles.nextInfoColumn}>
              <View style={styles.nextInfoRow}>
                <Clock color="#FFFFFF" size={18} />
                <Text style={styles.nextInfoText}>10:30 a.m.</Text>
              </View>
              <View style={[styles.nextInfoRow, { alignItems: 'flex-start', marginTop: 6 }]}>
                <MapPin color="#FFFFFF" size={18} style={{ marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.nextLocationTitle}>Consultorio de la clínica</Text>
                  <Text style={styles.nextLocationAddress}>Calle #00 localidad, estado</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.nextActionButtonsRow}>
            <TouchableOpacity style={styles.detailsBtnWhite} activeOpacity={0.8}>
              <Text style={styles.detailsBtnWhiteText}>Ver detalles</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtnOutline} activeOpacity={0.8}>
              <Text style={styles.cancelBtnOutlineText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Tu actividad</Text>

        <View style={styles.activityRow}>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Calendar color="#2B7A9E" size={22} />
              <Text style={styles.activityLabel}>Próximas</Text>
            </View>
            <Text style={styles.activityNumber}>02</Text>
            <Text style={styles.activitySubtext}>Citas programadas</Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <History color="#000000" size={22} />
              <Text style={[styles.activityLabel, { color: '#4B5563' }]}>Historial</Text>
            </View>
            <Text style={styles.activityNumber}>02</Text>
            <Text style={styles.activitySubtext}>Citas anteriores</Text>
          </View>
        </View>

        <View style={styles.bookAppointmentCard}>
          <View style={styles.bookHeaderRow}>
            <View style={styles.plusIconBox}>
              <Plus color="#2B7A9E" size={22} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bookTitle}>¿Necesitas otra cita?</Text>
              <Text style={styles.bookSubtitle}>Da clic y elige tu fecha y horario</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bookBtn} activeOpacity={0.85} onPress={() => router.replace('/(patient)/newAppointment')}>
            <Text style={styles.bookBtnText}>Agendar nueva cita</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Todas mis citas</Text>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'upcoming' && styles.filterTabActive]}
            onPress={() => setFilter('upcoming')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'upcoming' && styles.filterTabTextActive]}>Próximas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'past' && styles.filterTabActive]}
            onPress={() => setFilter('past')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'past' && styles.filterTabTextActive]}>Anteriores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'cancelled' && styles.filterTabActive]}
            onPress={() => setFilter('cancelled')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'cancelled' && styles.filterTabTextActive]}>Canceladas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentItemCard}>
          <View style={styles.itemRow}>
            <View style={styles.itemDateBadge}>
              <Text style={styles.itemBadgeMonth}>Mes</Text>
              <Text style={styles.itemBadgeDayNumber}>00</Text>
              <Text style={styles.itemBadgeDayName}>Lunes</Text>
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Valoración física</Text>
              <Text style={styles.itemTime}>10:55 a.m</Text>
              <Text style={styles.itemLocation}>Consultorio de Izúcar de Matamoros</Text>
            </View>
          </View>

          <View style={styles.itemFooterRow}>
            <Text style={styles.statusLabel}>
              Estatus: <Text style={styles.statusValue}>Completada</Text>
            </Text>
            <TouchableOpacity style={styles.miniDetailsBtn} activeOpacity={0.8}>
              <Text style={styles.miniDetailsBtnText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.appointmentItemCard}>
          <View style={styles.itemRow}>
            <View style={styles.itemDateBadge}>
              <Text style={styles.itemBadgeMonth}>Mes</Text>
              <Text style={styles.itemBadgeDayNumber}>00</Text>
              <Text style={styles.itemBadgeDayName}>Lunes</Text>
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Valoración física</Text>
              <Text style={styles.itemTime}>10:55 a.m</Text>
              <Text style={styles.itemLocation}>Consultorio de Izúcar de Matamoros</Text>
            </View>
          </View>

          <View style={styles.itemFooterRow}>
            <Text style={styles.statusLabel}>
              Estatus: <Text style={styles.statusValue}>Completada</Text>
            </Text>
            <TouchableOpacity style={styles.miniDetailsBtn} activeOpacity={0.8}>
              <Text style={styles.miniDetailsBtnText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.appointmentItemCard}>
          <View style={styles.itemRow}>
            <View style={styles.itemDateBadge}>
              <Text style={styles.itemBadgeMonth}>Mes</Text>
              <Text style={styles.itemBadgeDayNumber}>00</Text>
              <Text style={styles.itemBadgeDayName}>Lunes</Text>
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Valoración física</Text>
              <Text style={styles.itemTime}>10:55 a.m</Text>
              <Text style={styles.itemLocation}>Consultorio de Izúcar de Matamoros</Text>
            </View>
          </View>

          <View style={styles.itemFooterRow}>
            <Text style={styles.statusLabel}>
              Estatus: <Text style={styles.statusValue}>Completada</Text>
            </Text>
            <TouchableOpacity style={styles.miniDetailsBtn} activeOpacity={0.8}>
              <Text style={styles.miniDetailsBtnText}>Ver detalles</Text>
            </TouchableOpacity>
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
  logo: {
    width: 90,
    height: 50,
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
    marginTop: 15,
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
  nextAppointmentCard: {
    backgroundColor: '#237397',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  nextHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  nextDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 12,
  },
  nextDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  dateBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 70,
  },
  badgeMonth: {
    fontSize: 11,
    color: '#237397',
    fontWeight: '600',
  },
  badgeDayNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#237397',
  },
  badgeDayName: {
    fontSize: 10,
    color: '#6B7280',
  },
  nextInfoColumn: {
    flex: 1,
  },
  nextInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nextInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextLocationTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextLocationAddress: {
    fontSize: 11,
    color: '#E0F2FE',
  },
  nextActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsBtnWhite: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailsBtnWhiteText: {
    color: '#237397',
    fontSize: 13,
    fontWeight: 'bold',
  },
  cancelBtnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnOutlineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2B7A9E',
  },
  activityNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  activitySubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookAppointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  plusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  bookSubtitle: {
    fontSize: 12,
    color: '#4B5563',
  },
  bookBtn: {
    backgroundColor: '#237397',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#237397',
  },
  filterTabText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#237397',
    fontWeight: 'bold',
  },
  appointmentItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  itemDateBadge: {
    backgroundColor: '#CBE5FF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 65,
  },
  itemBadgeMonth: {
    fontSize: 11,
    color: '#111827',
    fontWeight: '600',
  },
  itemBadgeDayNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  itemBadgeDayName: {
    fontSize: 10,
    color: '#4B5563',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  itemTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 11,
    color: '#4B5563',
  },
  itemFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statusLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  statusValue: {
    color: '#237397',
    fontWeight: 'bold',
  },
  miniDetailsBtn: {
    backgroundColor: '#237397',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  miniDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});