import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export function NewAppointmentView() {
    const router = useRouter();

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Pantalla para Crear Nueva Cita</Text>
            <Pressable 
                onPress={() => router.back()}
                style={{ marginTop: 20, padding: 10, backgroundColor: '#ffcccc', borderRadius: 5 }}
            >
                <Text style={{ color: 'red' }}>Cancelar</Text>
            </Pressable>
        </View>
    );
}