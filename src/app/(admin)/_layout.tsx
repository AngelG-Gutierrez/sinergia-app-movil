import { Drawer } from 'expo-router/drawer';

export default function AdminDrawerLayout() {
  return (
    <Drawer screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="home" options={{ title: 'Inicio' }} />
      <Drawer.Screen name="appointments" options={{ title: 'Administrar Agenda' }} />
      <Drawer.Screen name="medicalRecords" options={{ title: 'Historiales Médicos' }} />
      <Drawer.Screen name="patientList" options={{ title: 'Lista de pacientes' }}/>
      <Drawer.Screen name="exercises" options={{ title: 'Repretorio de ejercicios' }}/>
      <Drawer.Screen name="notifications" options={{ title: 'Notificaciones' }}/>
      <Drawer.Screen name="agendaConfig" options={{ title: 'Configuración de Agenda' }}/>
      <Drawer.Screen name="profile" options={{ title: 'Perfil' }}/>
    </Drawer>
  );
}