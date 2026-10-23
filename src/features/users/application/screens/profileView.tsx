import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function ProfileView() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleEditData = () => {
    console.log('Editar datos');
  };

  const handleLogout = () => {
    console.log('Cerrar sesión');
  };

  const handleDeleteAccount = () => {
    console.log('Eliminar cuenta');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#226D8E" />

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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Mi Perfil</Text>
            <Text style={styles.headerSubtitle}>Información de la cuenta</Text>
          </View>
        </View>

        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>E</Text>
          </View>
          <Text style={styles.userEmail}>ejemploemail@gmail.com</Text>
          <Text style={styles.userId}>id: 23dv223fd</Text>
        </View>

        <View style={styles.dataCard}>
          <Text style={styles.dataCardTitle}>Tus datos</Text>

          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            <Text style={styles.fieldValue}>Nombre de usuario completo</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Fecha de nacimiento</Text>
            <Text style={styles.fieldValue}>dd / mm / aaaa</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Correo electrónico</Text>
            <Text style={styles.fieldValue}>ejemploemail@gmail.com</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.infoField}>
            <Text style={styles.fieldLabel}>Contraseña</Text>
            <Text style={styles.fieldValue}>************</Text>
            <View style={styles.underline} />
          </View>

          <TouchableOpacity
            style={styles.editButton}
            activeOpacity={0.8}
            onPress={handleEditData}
          >
            <Text style={styles.editButtonText}>Editar datos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          activeOpacity={0.8}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#226D8E',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#95C5D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 44,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E0F2FE',
    marginTop: 2,
  },
  avatarCard: {
    backgroundColor: '#6BA1B8',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9EC2D4',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userId: {
    fontSize: 13,
    color: '#E0F2FE',
  },
  dataCard: {
    backgroundColor: '#033752',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C53030',
  },
  dataCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  infoField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#93C5FD',
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  underline: {
    height: 1,
    backgroundColor: '#93C5FD',
  },
  editButton: {
    backgroundColor: '#2B7A9E',
    borderWidth: 1,
    borderColor: '#60A5FA',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#72A4B9',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF0000',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});