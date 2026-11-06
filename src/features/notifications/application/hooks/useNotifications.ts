
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/application/providers/authProvider';

import type {
    NotificationEntity,
} from '../../domain/entities/notifications';

import { notificationsRepository } from '../../infraestructure/repositories/notificationsRepository';

export function useNotifications() {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState<
        NotificationEntity[]
    >([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!user) {
            setNotifications([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data =
                await notificationsRepository.getNotifications();

            setNotifications(data);
        } catch (err) {
            console.error('Error consultando notificaciones:', err);
            setError('No fue posible consultar las notificaciones.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const markAsRead = useCallback(async (id: string) => {
        await notificationsRepository.markAsRead(id);

        setNotifications((current) =>
            current.map((item) =>
                item.id === id
                    ? { ...item, read: true }
                    : item,
            ),
        );
    }, []);

    return {
        notifications,
        loading,
        error,
        refresh,
        markAsRead,
    };
}
