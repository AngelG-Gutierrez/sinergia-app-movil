import { useRegisterMutation } from "@/features/auth/application/hooks/useAuthMutation";
import { useRouter } from "expo-router";
import { Calendar, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { mutate: registerUser, isPending } = useRegisterMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    registerUser(
      {
        name: fullName,
        email,
        password,
        birthDate,
      },
      {
        onSuccess: (data) => {
          // Redirigir según el rol
          if (data.user.role === "Administrador") {
            router.replace("/(admin)/home");
          } else {
            router.replace("/(patient)/home");
          }
        },
        onError: (error: any) => {
          const msg =
            error?.response?.data?.message || "Error al registrar usuario";
          Alert.alert("Error", Array.isArray(msg) ? msg[0] : msg);
        },
      },
    );
  };

  const handleConfirmDate = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    setBirthDate(formattedDate);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#CBE5FF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.welcomeTitle}>Crear cuenta</Text>
              {/* <Text style={styles.welcomeSubtitle}>
                Registra tu cuenta hoy mismo usando un correo electrónico y una
                contraseña válidos.
              </Text> */}
            </View>

            <Image
              source={require("../../assets/images/LogoSinergia.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View
            style={[
              styles.formContainer,
              { paddingBottom: Math.max(insets.bottom, 24) },
            ]}
          >
            <Text style={styles.formTitle}>Registro</Text>

            <View style={styles.inputContainer}>
              <User color="#9CA3AF" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Campo de Fecha de Nacimiento */}
            <Pressable
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color="#9CA3AF" size={20} style={styles.inputIcon} />
              <Text
                style={[
                  styles.input,
                  { color: birthDate ? "#111827" : "#9CA3AF" },
                ]}
              >
                {birthDate || "Fecha de nacimiento"}
              </Text>
            </Pressable>

            {/* Modal de Fecha compatible con iOS y Android */}
            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              date={
                birthDate
                  ? new Date(`${birthDate}T12:00:00`)
                  : new Date(2000, 0, 1)
              }
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
              locale="es_MX"
              confirmTextIOS="Confirmar"
              cancelTextIOS="Cancelar"
              onConfirm={handleConfirmDate}
              onCancel={() => setShowDatePicker(false)}
            />

            <View style={styles.inputContainer}>
              <Mail color="#9CA3AF" size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

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
              style={styles.registerButton}
              activeOpacity={0.85}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Registrarme</Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                ¿Ya tienes cuenta?{" "}
                <Text
                  style={styles.loginLink}
                  onPress={() => router.push("/login")}
                >
                  Inicia sesión
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CBE5FF",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#333333",
    lineHeight: 18,
  },
  logo: {
    width: 95,
    height: 60,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  eyeIconContainer: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  registerButton: {
    backgroundColor: "#2B7A9E",
    borderRadius: 24,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#374151",
  },
  loginLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
