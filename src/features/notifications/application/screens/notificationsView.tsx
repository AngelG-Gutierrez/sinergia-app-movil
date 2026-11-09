
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  RefreshCw,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useNotifications } from '../hooks/useNotifications';

type Filter = 'all' | 'unread' | 'read';

export function NotificationsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [filter, setFilter] = useState<Filter>('all');

  const {
    notifications,
    loading,
    error,
    refresh,
    markAsRead,
  } = useNotifications();

  // Actualizar cada vez que se abre esta pantalla.
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === 'unread') return !item.read;
      if (filter === 'read') return item.read;
      return true;
    });
  }, [notifications, filter]);

  const handleNotificationPress = async (id: string) => {
    const notification = notifications.find(
      (item) => item.id === id,
    );

    if (!notification || notification.read) return;

    try {
      await markAsRead(id);
    } catch (err) {
      console.error('Error marcando notificación:', err);

      Alert.alert(
        'Error',
        'No fue posible marcar la notificación como leída.',
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'left', 'right']}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar
        barStyle="dark-content"
        backgroundColor="#CBE5FF"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#000000" size={20} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Notificaciones
          </Text>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw color="#1769AA" size={20} />
          </TouchableOpacity>
        </View>

        {/* Contador */}
        <Text style={styles.summaryText}>
          {unreadCount} notificaciones sin leer
        </Text>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          {(
            [
              ['all', 'Todas'],
              ['unread', 'No leídas'],
              ['read', 'Leídas'],
            ] as const
          ).map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[
                styles.filterTab,
                filter === value && styles.filterTabActive,
              ]}
              onPress={() => setFilter(value)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === value &&
                  styles.filterTabTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cargando */}
        {loading && (
          <ActivityIndicator
            color="#208AEF"
            size="large"
            style={styles.loading}
          />
        )}

        {/* Error */}
        {error && (
          <View style={styles.messageBox}>
            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity onPress={() => void refresh()}>
              <Text style={styles.retryText}>
                Intentar nuevamente
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Notificaciones reales */}
        <View style={styles.notificationsList}>
          {!loading &&
            !error &&
            filteredNotifications.length === 0 && (
              <View style={styles.messageBox}>
                <Text style={styles.emptyText}>
                  No hay notificaciones para mostrar.
                </Text>
              </View>
            )}

          {filteredNotifications.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.notificationCard,
                !item.read && styles.unreadCard,
              ]}
              activeOpacity={0.8}
              onPress={() =>
                void handleNotificationPress(item.id)
              }
            >
              <View style={styles.cardHeaderRow}>
                {item.type === 'EXERCISE_PLAN_ASSIGNED' ? (
                  <Dumbbell color="#000000" size={22} />
                ) : (
                  <Calendar color="#000000" size={22} />
                )}

                <Text style={styles.notificationTitle}>
                  {item.title}
                </Text>

                {!item.read && (
                  <View style={styles.unreadDot} />
                )}
              </View>

              <Text style={styles.notificationDescription}>
                {item.body}
              </Text>

              <Text style={styles.notificationDate}>
                {new Date(item.createdAt).toLocaleString(
                  'es-MX',
                )}
              </Text>

              {!item.read && (
                <Text style={styles.unreadLabel}>
                  Toca para marcar como leída
                </Text>
              )}
            </TouchableOpacity>
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
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 18,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
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
  },
  filterTabText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
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
  unreadCard: {
    borderColor: '#208AEF',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
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
    lineHeight: 19,
    marginBottom: 10,
  },
  notificationDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#208AEF',
  },
  unreadLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#1769AA',
  },
  loading: {
    marginVertical: 20,
  },
  messageBox: {
    padding: 25,
    alignItems: 'center',
  },
  emptyText: {
    color: '#4B5563',
    textAlign: 'center',
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 10,
    color: '#1769AA',
    fontWeight: 'bold',
  },
});
