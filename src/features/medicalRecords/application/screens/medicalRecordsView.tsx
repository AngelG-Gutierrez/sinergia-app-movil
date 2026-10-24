import { Stack, useRouter } from 'expo-router';
import { ChevronRight, ClipboardList, Search } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function MedicalRecordsView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const records = [
    { id: '1', number: '#001', date: 'dd / mm / aaaa', status: 'Completada' },
    { id: '2', number: '#001', date: 'dd / mm / aaaa', status: 'Completada' },
    { id: '3', number: '#001', date: 'dd / mm / aaaa', status: 'Completada' },
    { id: '4', number: '#001', date: 'dd / mm / aaaa', status: 'Completada' },
    { id: '5', number: '#001', date: 'dd / mm / aaaa', status: 'Completada' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#B2C7D9" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <View style={styles.titleIconBox}>
            <ClipboardList color="#000000" size={24} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>Mis expedientes médicos</Text>
            <Text style={styles.screenSubtitle}>
              Consulta la inforormación de todos tus expedientes médicos que tienes con nosotros.
            </Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar expediente"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.recordsList}>
          {records.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recordCard}
              activeOpacity={0.8}
            >
              <View style={styles.recordIconBox}>
                <ClipboardList color="#000000" size={24} />
              </View>

              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>Expediente {item.number}</Text>
                <Text style={styles.recordDate}>{item.date}</Text>
                <Text style={styles.recordStatusLabel}>
                  Estatus: <Text style={styles.recordStatusValue}>{item.status}</Text>
                </Text>
              </View>

              <View style={styles.arrowButton}>
                <ChevronRight color="#FFFFFF" size={22} />
              </View>
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
    backgroundColor: '#B2C7D9',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    backgroundColor: '#E5EFF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  screenSubtitle: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  recordsList: {
    gap: 14,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  recordIconBox: {
    width: 48,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#CBE5FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  recordDate: {
    fontSize: 12,
    color: '#4B5563',
    marginVertical: 2,
  },
  recordStatusLabel: {
    fontSize: 12,
    color: '#374151',
  },
  recordStatusValue: {
    color: '#2B7A9E',
    fontWeight: 'bold',
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2B7A9E',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});