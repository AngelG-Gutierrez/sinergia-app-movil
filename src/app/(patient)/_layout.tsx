import { Tabs } from "expo-router";
import { Activity, Calendar, Home } from "lucide-react-native";

export default function PatientTabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#007AFF" }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Citas",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: "Ejercicios",
          tabBarIcon: ({ color, size }) => (
            <Activity size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          title: "Notificaciones",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          title: "Perfil",
        }}
      />
      <Tabs.Screen
        name="newAppointment"
        options={{
          href: null,
          title: "Nueva Cita",
        }}
      />
      <Tabs.Screen
        name="prescriptionsDetails"
        options={{
          href: null,
          title: "Detalles de Ejercicios",
        }}
      />
    </Tabs>
  );
}
