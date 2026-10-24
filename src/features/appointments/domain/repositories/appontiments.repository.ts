import { CreateAppointmentPayload } from "../datasources/appointments.datasource";
import { AppointmentEntity } from "../entities/appointment.entity";

export abstract class AppointmentsRepository {
  abstract getByPatient(): Promise<AppointmentEntity[]>;
  abstract getAllActive(): Promise<AppointmentEntity[]>;
  abstract create(
    payload: CreateAppointmentPayload,
  ): Promise<AppointmentEntity>;
  abstract cancel(appointmentId: string): Promise<AppointmentEntity>;
}
