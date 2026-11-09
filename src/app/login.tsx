import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useLoginMutation } from "../features/auth/application/hooks/useAuthMutation";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const { mutate: login, isPending } = useLoginMutation();

  const handleLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor ingresa tu correo y contraseña.",
      );
      return;
    }

    login(
      {
        email: email.trim().toLowerCase(),
        password,
      },
      {
        onSuccess: (data) => {
          // Redirige según el rol
          if (data.user.role === "Administrador") {
            router.replace("/(admin)/home");
          } else {
            router.replace("/(patient)/home");
          }
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || "Correo o contraseña incorrectos";
          Alert.alert("Error", Array.isArray(message) ? message[0] : message);
        },
      },
    );
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
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
              {/* <Text style={styles.welcomeSubtitle}>
                Ingresa tus credenciales otorgadas por tu fisioterapeuta.
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
              { paddingBottom: Math.max(insets.bottom, 20) },
            ]}
          >
            <Text style={styles.formTitle}>Inicio de sesión</Text>

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

            <View style={styles.optionsRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.replace("/forgotPassword")}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isPending && { opacity: 0.7 }]}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                ¿No tienes cuenta?{" "}
                <Text
                  style={styles.registerLink}
                  onPress={() => router.replace("/signUp")}
                >
                  Registrate
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
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  logo: {
    width: 100,
    height: 65,
  },
  formContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
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
    color: "#111827",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 28,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#2B7A9E",
    borderRadius: 24,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footerContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#374151",
  },
  registerLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
});
