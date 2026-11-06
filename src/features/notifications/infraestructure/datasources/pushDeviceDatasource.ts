
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { httpClient } from '@/core/api/axios.adapter';

const DEVICE_KEY = 'sinergia_registered_push_device';

type PlatformType = 'ios' | 'android';

interface RegisteredDevice {
    token: string;
    userId: string;
}

function isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
}

async function getSavedDevice(): Promise<RegisteredDevice | null> {
    const saved = await SecureStore.getItemAsync(DEVICE_KEY);

    if (!saved) return null;

    try {
        return JSON.parse(saved) as RegisteredDevice;
    } catch {
        return null;
    }
}

export async function registerPushDevice(
    userId: string,
): Promise<void> {
    // Expo Go no admite registro de push remotas.
    if (isExpoGo()) {
        console.log('[PUSH] Expo Go: registro omitido.');
        return;
    }

    if (!Device.isDevice) {
        console.log('[PUSH] Se requiere un dispositivo físico.');
        return;
    }

    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        return;
    }

    const platform: PlatformType = Platform.OS;

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId;

    if (!projectId || typeof projectId !== 'string') {
        console.warn('[PUSH] Falta configurar el projectId de EAS.');
        return;
    }

    if (platform === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Notificaciones Sinergia',
            importance: Notifications.AndroidImportance.MAX,
        });
    }

    const permissions = await Notifications.getPermissionsAsync();

    let granted =
        permissions.granted ||
        permissions.ios?.status ===
        Notifications.IosAuthorizationStatus.PROVISIONAL;

    if (!granted) {
        const requested =
            await Notifications.requestPermissionsAsync();

        granted =
            requested.granted ||
            requested.ios?.status ===
            Notifications.IosAuthorizationStatus.PROVISIONAL;
    }

    if (!granted) {
        console.log('[PUSH] Permiso no concedido.');
        return;
    }

    const expoToken = (
        await Notifications.getExpoPushTokenAsync({
            projectId,
        })
    ).data;

    await httpClient.post('/notifications/devices', {
        token: expoToken,
        platform,
    });

    await SecureStore.setItemAsync(
        DEVICE_KEY,
        JSON.stringify({
            token: expoToken,
            userId,
        }),
    );

    console.log('[PUSH] Dispositivo registrado.');
}

export async function deactivatePushDevice(): Promise<void> {
    const saved = await getSavedDevice();

    if (!saved) return;

    try {
        await httpClient.post('/notifications/devices/deactivate', {
            token: saved.token,
        });

        await SecureStore.deleteItemAsync(DEVICE_KEY);

        console.log('[PUSH] Dispositivo desactivado.');
    } catch (error: unknown) {
        console.warn(
            '[PUSH] No se pudo desactivar el dispositivo:',
            error,
        );
    }
}
