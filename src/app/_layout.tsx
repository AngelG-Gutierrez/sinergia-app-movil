
import { queryClient } from '@/core/query/query-client';
import { AuthProvider } from '@/features/auth/application/providers/authProvider';
import { NotificationsProvider } from '@/features/notifications/application/providers/notificationsProvider';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <Stack screenOptions={{ headerShown: true }}>
            <Stack.Screen
              name="index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="login"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="signUp"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="forgotPassword"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="resetPassword"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(patient)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(admin)"
              options={{ headerShown: false }}
            />
          </Stack>
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
