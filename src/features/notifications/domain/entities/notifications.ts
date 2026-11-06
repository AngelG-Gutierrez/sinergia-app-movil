
export type NotificationType =
    | "APPOINTMENT_CREATED"
    | "APPOINTMENT_ASSIGNED"
    | "EXERCISE_PLAN_ASSIGNED";

export interface NotificationEntity {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    referenceId: string | null;
    read: boolean;
    createdAt: string;
}

export interface PushDeviceEntity {
    id: string;
    userId: string;
    token: string;
    platform: "ios" | "android";
    active: boolean;
}
