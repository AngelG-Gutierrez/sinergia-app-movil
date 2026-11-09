import { CustomDrawerContent } from '@/components/customDrawerContent';
import { Drawer } from 'expo-router/drawer';

export default function AdminDrawerLayout() {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: true, headerStyle: { backgroundColor: '#CBE5FF', borderBottomColor: '#E2E8F0', elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 }, headerTitleStyle: { fontSize: 23, color: '#000000'}  }}
    >
      <Drawer.Screen name="home" options={{ title: 'Inicio' }} />
      <Drawer.Screen name="appointments" options={{ title: 'Agenda' }} />
      <Drawer.Screen name="medicalRecords" options={{ title: 'Expedientes Médicos' }} />
      <Drawer.Screen name="createMedicalRecord" options={{ title: 'Nuevo Expediente', drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="individualMedicalRecord" options={{ title: 'Expediente Individual', drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="notifications" options={{ title: 'Notificaciones' }}/>
      <Drawer.Screen name="profile" options={{ title: 'Perfil' }}/>
    </Drawer>
  );
}