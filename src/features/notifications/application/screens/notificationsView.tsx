import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Dumbbell } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function NotificationsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const notifications = [
    {
      id: '1',
      type: 'exercise',
      title: 'Título de la notificación',
      description: 'Texto rápido de la notificación, se puede extender un poco',
      read: false,
    },
    {
      id: '2',
      type: 'appointment',
      title: 'Título de la notificación',
      description: 'Texto rápido de la notificación, se puede extender un poco',
      read: false,
    },
    {
      id: '3',
      type: 'exercise',
      title: 'Título de la notificación',
      description: 'Texto rápido de la notificación, se puede extender un poco',
      read: true,
    },
    {
      id: '4',
      type: 'exercise',
      title: 'Título de la notificación',
      description: 'Texto rápido de la notificación, se puede extender un poco',
      read: true,
    },
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#000000" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'unread' && styles.filterTabTextActive]}>
              No leídas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'read' && styles.filterTabActive]}
            onPress={() => setFilter('read')}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, filter === 'read' && styles.filterTabTextActive]}>
              Leídas
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notificationsList}>
          {notifications.map((item) => (
            <View key={item.id} style={styles.notificationCard}>
              <View style={styles.cardHeaderRow}>
                {item.type === 'exercise' ? (
                  <Dumbbell color="#000000" size={22} style={styles.cardIcon} />
                ) : (
                  <Calendar color="#000000" size={22} style={styles.cardIcon} />
                )}
                <Text style={styles.notificationTitle}>{item.title}</Text>
              </View>
              <Text style={styles.notificationDescription}>{item.description}</Text>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    backgroundColor: '#E2F0FE',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterTabText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#111827',
    fontWeight: 'bold',
  },
  notificationsList: {
    gap: 14,
  },
  notificationCard: {
    backgroundColor: '#F3F8FB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  cardIcon: {
    marginRight: 2,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    paddingLeft: 34,
  },
});