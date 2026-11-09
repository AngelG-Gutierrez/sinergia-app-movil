import { AppointmentEntity } from "../entities/appointment.entity";

export interface CreateAppointmentPayload {
  date: string; // ISO DateTime
  reason: string; // Motivo de la consulta
}

export abstract class AppointmentsDatasource {
  abstract getByPatient(): Promise<AppointmentEntity[]>;
  abstract getAllActive(): Promise<AppointmentEntity[]>;
  abstract create(
    payload: CreateAppointmentPayload,
  ): Promise<AppointmentEntity>;
  abstract cancel(appointmentId: string): Promise<AppointmentEntity>;
}
