import { router, Stack } from "expo-router";
import {
  Bell,
  Calendar,
  CalendarClock,
  ClipboardList,
  Dumbbell,
  FileText,
  MessageCircle,
  Phone,
  Stethoscope,
} from "lucide-react-native";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../providers/authProvider";

export function HomePatientScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(" ")[0] : "Usuario";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
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
            style={styles.headerIconBtn}
            activeOpacity={0.7}
            onPress={() => router.replace("/(patient)/notifications")}
          >
            <Bell color="#000000" size={24} />
          </TouchableOpacity>

          <Image
            source={require("@/assets/images/LogoSinergia.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.avatarCircle}>
            <TouchableOpacity
              onPress={() => router.replace("/(patient)/profile")}
            >
              <Text style={styles.avatarText}>{userInitial}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeSubtitle}>¡Bienvenido!</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>

        <View style={styles.cardsRow}>
          <View style={styles.summaryCard}>
            <CalendarClock color="#000000" size={28} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Tu próxima cita</Text>
            <Text style={styles.cardDateText}>dd / mm / aaaa</Text>
            <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8}>
              <Text style={styles.detailsBtnText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryCard}>
            <Dumbbell color="#000000" size={28} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Ejercicios pendientes</Text>
            <Text style={styles.cardCountText}>2</Text>
            <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8}>
              <Text style={styles.detailsBtnText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.healthMessage}>
          Tu salud es nuestra prioridad, procura seguir las indicaciones de esta
          aplicación para tu pronta recuperación.
        </Text>

        <View style={styles.recordCard}>
          <Text style={styles.recordSectionTitle}>
            Resúmen de expediente actual
          </Text>

          <View style={styles.recordHeaderRow}>
            <View>
              <Text style={styles.fieldLabel}>ID DEL EXPEDIENTE</Text>
              <Text style={styles.recordId}>#001</Text>
            </View>
            <View style={styles.recordBadgeIcon}>
              <ClipboardList color="#2B7A9E" size={22} />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.dateBlock}>
            <View style={styles.dateIconBox}>
              <Calendar color="#2B7A9E" size={20} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.fieldLabel}>FECHA DE VISITA</Text>
              <Text style={styles.dateValue}>dd / mm / aaaa</Text>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Stethoscope color="#000000" size={20} />
              <Text style={styles.blockTitle}>Situación del paciente</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoText}>
                Texto Texto Texto Texto Texto Texto Texto Texto Texto Texto
              </Text>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Dumbbell color="#000000" size={20} />
              <Text style={styles.blockTitle}>Ejercicios asignados</Text>
            </View>
            <View style={styles.assignedExerciseRow}>
              <View style={styles.assignedLeft}>
                <View style={styles.recordBadgeIcon}>
                  <ClipboardList color="#000000" size={22} />
                </View>
                <Text style={styles.exerciseNumber}>3</Text>
              </View>
              <TouchableOpacity
                style={styles.miniDetailsBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.miniDetailsBtnText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <FileText color="#000000" size={20} />
              <Text style={styles.blockTitle}>Indicaciones médicas</Text>
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoText}>
                Texto Texto Texto Texto Texto Texto Texto Texto Texto Texto
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.contactTitle}>
            ¿Dudas o sugerencias? Contáctanos
          </Text>
          <View style={styles.socialButtonsRow}>
            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: "#25D366" }]}
              activeOpacity={0.8}
            >
              <MessageCircle color="#FFFFFF" size={22} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: "#1877F2" }]}
              activeOpacity={0.8}
            >
              <MessageCircle color="#FFFFFF" size={22} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: "#E1306C" }]}
              activeOpacity={0.8}
            >
              <MessageCircle color="#FFFFFF" size={22} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialCircle, { backgroundColor: "#2B7A9E" }]}
              activeOpacity={0.8}
            >
              <Phone color="#FFFFFF" size={22} />
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
    backgroundColor: "#CBE5FF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    borderColor: "#2B7A9E",
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: "#333333",
  },
  userName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#000000",
  },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  cardIcon: {
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 12,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 4,
  },
  cardDateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  cardCountText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  detailsBtn: {
    backgroundColor: "#2B7A9E",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: "100%",
    alignItems: "center",
  },
  detailsBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  healthMessage: {
    fontSize: 13,
    color: "#333333",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  recordSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  recordHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  recordId: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  recordBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#CBE5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },
  dateBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#CBE5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  sectionBlock: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  infoTextBox: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  assignedExerciseRow: {
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  assignedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exerciseNumber: {
    fontSize: 22,
    fontWeight: "500",
    color: "#111827",
  },
  miniDetailsBtn: {
    backgroundColor: "#2B7A9E",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  miniDetailsBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  contactContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 12,
  },
  socialButtonsRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  socialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
});
