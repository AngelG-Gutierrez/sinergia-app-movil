import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = () => {
    console.log('Actualizar contraseña:', { password, confirmPassword });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#CBE5FF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          bounces={false}
        >
          <View style={styles.headerRow}>
            <Image
              source={require('../../assets/images/LogoSinergia.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.iconCircleContainer}>
            <View style={styles.iconCircle}>
              <Lock color="#000000" size={48} strokeWidth={1.5} />
            </View>
          </View>

          <Text style={styles.title}>Cambio de contraseña</Text>
          <Text style={styles.subtitle}>Escribe tu nueva contraseña</Text>

          <View style={styles.inputContainer}>
            <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
              style={styles.eyeIconContainer}
            >
              {showPassword ? (
                <Eye color="#2B7A9E" size={20} />
              ) : (
                <EyeOff color="#9CA3AF" size={20} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirma contraseña"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
              style={styles.eyeIconContainer}
            >
              {showConfirmPassword ? (
                <Eye color="#2B7A9E" size={20} />
              ) : (
                <EyeOff color="#9CA3AF" size={20} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.updateButton}
            activeOpacity={0.85}
            onPress={handleUpdatePassword}
          >
            <Text style={styles.updateButtonText}>Actualizar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CBE5FF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 16,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 60,
  },
  iconCircleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIconContainer: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  updateButton: {
    backgroundColor: '#2B7A9E',
    borderRadius: 24,
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
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});