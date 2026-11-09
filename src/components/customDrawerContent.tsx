// src/components/CustomDrawerContent.tsx
import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CustomDrawerContentProps = {
  state: { routes: Array<{ key: string; name: string }>; index: number };
  navigation: { navigate: (name: string) => void };
};
const drawerMetadata: Record<string, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  home: {
      title: 'Inicio',
      icon: 'link'
  },
  appointments: {
    title: 'Agenda',
    icon: 'calendar'
  },
  medicalRecords: {
    title: 'Expedientes Médicos',
    icon: 'clipboard'
  },
  notifications: {
    title: 'Notificaciones',
    icon: 'notifications'
  },
  profile: {
    title: 'Perfil',
    icon: 'person'
  },
};

export function CustomDrawerContent(props: CustomDrawerContentProps) {
  const { state, navigation } = props;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerSubtitle}>Menú principal</Text>
        <Image 
          source={require('../../assets/images/LogoSinergia.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {state.routes.map((route, index) => {
        const metadata = drawerMetadata[route.name];

        if (!metadata) return null;

        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={[styles.card, isFocused && styles.cardActive]}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
              <Ionicons 
                name={metadata.icon} 
                size={22} 
                color={isFocused ? '#0284C7' : '#1E293B'} 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.cardTitle, isFocused && styles.cardTitleActive]}>
                {metadata.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: 20,
    marginTop: 25,
    paddingHorizontal: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  iconContainer: {
    width: 44,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: '#E0F2FE',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  cardTitleActive: {
    color: '#0369A1',
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  logo: {
    width: 150, 
    height: 130, 
    marginVertical: 25,
  },
});