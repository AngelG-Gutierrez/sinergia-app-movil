
import { httpClient } from '@/core/api/axios.adapter';

import type {
    NotificationEntity,
} from '../../domain/entities/notifications';

export class NotificationsDatasource {
    async getNotifications(): Promise<NotificationEntity[]> {
        return httpClient.get<NotificationEntity[]>(
            '/notifications',
        );
    }

    async markAsRead(id: string): Promise<void> {
        await httpClient.patch(
            `/notifications/${encodeURIComponent(id)}/read`,
            {},
        );
    }
}

export const notificationsDatasource =
    new NotificationsDatasource();
