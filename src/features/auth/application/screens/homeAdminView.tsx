import { StyleSheet, Text, View } from 'react-native';

export function HomeAdminView() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Sinergia App (Vista Principal para Administrador)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f5f5f5'
    },
  title: {
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333'
    }
});