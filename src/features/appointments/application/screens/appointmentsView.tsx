import { useRouter } from "expo-router"; // 1. Importar useRouter
import { Pressable, Text, View } from "react-native";

export function AppointmentsView() {
    const router = useRouter();

    return (
        <View>
            <Text>Vista de citas (Pacientes)</Text>
            <Pressable onPress={() => router.push("/(patient)/newAppointment")}>
                <Text>Nueva cita</Text>
            </Pressable>
        </View>
    );
}