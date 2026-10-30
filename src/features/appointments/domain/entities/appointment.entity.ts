export type AppointmentStatus = "activa" | "cancelada" | "finalizada";

export interface AppointmentEntity {
  id: string;
  date: string;
  status: AppointmentStatus;
  reason: string;
  reminderSent: boolean;
  createdAt: string;
}
