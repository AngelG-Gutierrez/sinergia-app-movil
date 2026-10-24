import { httpClient } from "@/core/api/axios.adapter";
import {
  AppointmentsDatasource,
  CreateAppointmentPayload,
} from "../../domain/datasources/appointments.datasource";
import { AppointmentEntity } from "../../domain/entities/appointment.entity";

export class AppointmentsDatasourceImpl implements AppointmentsDatasource {
  async getByPatient(): Promise<AppointmentEntity[]> {
    // @Get('upcoming') AppointmentsController
    return await httpClient.get<AppointmentEntity[]>("/appointments/upcoming");
  }

  async getAllActive(): Promise<AppointmentEntity[]> {
    try {
      return await httpClient.get<AppointmentEntity[]>("/appointments");
    } catch {
      return [];
    }
  }

  async create(payload: CreateAppointmentPayload): Promise<AppointmentEntity> {
    //@Post() CreateAppointmentDto (date, reason)
    return await httpClient.post<AppointmentEntity>("/appointments", {
      date: payload.date,
      reason: payload.reason,
    });
  }

  async cancel(appointmentId: string): Promise<AppointmentEntity> {
    // @Patch(':id/cancel')
    return await httpClient.patch<AppointmentEntity>(
      `/appointments/${appointmentId}/cancel`,
      {},
    );
  }
}
