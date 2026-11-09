import {
  AppointmentsDatasource,
  CreateAppointmentPayload,
} from "../../domain/datasources/appointments.datasource";
import { AppointmentEntity } from "../../domain/entities/appointment.entity";
import { AppointmentsRepository } from "../../domain/repositories/appontiments.repository";
import { AppointmentsDatasourceImpl } from "../datasources/appointments.datasource.impl";

export class AppointmentsRepositoryImpl implements AppointmentsRepository {
  constructor(private readonly datasource: AppointmentsDatasource) {}

  getByPatient(): Promise<AppointmentEntity[]> {
    return this.datasource.getByPatient();
  }

  getAllActive(): Promise<AppointmentEntity[]> {
    return this.datasource.getAllActive();
  }

  create(payload: CreateAppointmentPayload): Promise<AppointmentEntity> {
    return this.datasource.create(payload);
  }

  cancel(appointmentId: string): Promise<AppointmentEntity> {
    return this.datasource.cancel(appointmentId);
  }
}

const datasource = new AppointmentsDatasourceImpl();
export const appointmentsRepository = new AppointmentsRepositoryImpl(
  datasource,
);
