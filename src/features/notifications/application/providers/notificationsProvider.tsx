
import { useAuth } from '@/features/auth/application/providers/authProvider';

import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef } from 'react';

import {
    registerPushDevice,
} from '../../infraestructure/datasources/pushDeviceDatasource';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export function NotificationsProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loaded } = useAuth();

    const registeringUser = useRef<string | null>(null);

    useEffect(() => {
        if (!loaded || !user?.id) {
            registeringUser.current = null;
            return;
        }

        if (registeringUser.current === user.id) {
            return;
        }

        registeringUser.current = user.id;

        void registerPushDevice(user.id).catch(
            (error: unknown) => {
                console.warn(
                    '[PUSH] Error al registrar dispositivo:',
                    error,
                );

                registeringUser.current = null;
            },
        );
    }, [loaded, user?.id]);

    return <>{children}</>;
}
