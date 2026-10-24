import { httpClient } from "@/core/api/axios.adapter";
import {
  AppointmentsDatasource,
  CreateAppointmentPayload,
} from "../../domain/datasources/appointments.datasource";
import { AppointmentEntity } from "../../domain/entities/appointment.entity";

export class AppointmentsDatasourceImpl implements AppointmentsDatasource {
  async getByPatient(): Promise<AppointmentEntity[]> {
    // Coincide con @Get('upcoming') de tu AppointmentsController
    return await httpClient.get<AppointmentEntity[]>("/appointments/upcoming");
  }

  async getAllActive(): Promise<AppointmentEntity[]> {
    // Envuelto en try/catch porque @Get() tiene @Roles('Administrador')
    try {
      return await httpClient.get<AppointmentEntity[]>("/appointments");
    } catch {
      return [];
    }
  }

  async create(payload: CreateAppointmentPayload): Promise<AppointmentEntity> {
    // Coincide con @Post() y CreateAppointmentDto (date, reason)
    return await httpClient.post<AppointmentEntity>("/appointments", {
      date: payload.date,
      reason: payload.reason,
    });
  }

  async cancel(appointmentId: string): Promise<AppointmentEntity> {
    // Coincide con @Patch(':id/cancel')
    return await httpClient.patch<AppointmentEntity>(
      `/appointments/${appointmentId}/cancel`,
      {},
    );
  }
}
