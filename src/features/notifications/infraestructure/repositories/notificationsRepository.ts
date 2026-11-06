
import type {
    NotificationEntity,
} from '../../domain/entities/notifications';

import { notificationsDatasource } from '../datasources/notificationsDatasource';

export class NotificationsRepositoryImpl {
    async getNotifications(): Promise<NotificationEntity[]> {
        return notificationsDatasource.getNotifications();
    }

    async markAsRead(id: string): Promise<void> {
        await notificationsDatasource.markAsRead(id);
    }
}

export const notificationsRepository =
    new NotificationsRepositoryImpl();
