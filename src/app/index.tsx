import { useAuth } from "@/features/auth/application/providers/authProvider";
import { router, SplashScreen, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const { user, loaded } = useAuth();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      if (!loaded) return;

      const prepare = async () => {
        try {
          await SplashScreen.preventAutoHideAsync();

          if (!isActive) return;

          if (user) {
            if (user.role === "Administrador") {
              router.replace("/(admin)/home");
            } else {
              router.replace("/(patient)/home");
            }
          } else {
            router.replace("/login");
          }
        } finally {
          if (isActive) {
            await SplashScreen.hideAsync();
          }
        }
      };

      prepare();

      return () => {
        isActive = false;
      };
    }, [loaded, user]),
  );

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2B7A9E" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
