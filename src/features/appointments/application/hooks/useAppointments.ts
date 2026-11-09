import { useAuth } from "@/features/auth/application/providers/authProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateAppointmentPayload } from "../../domain/datasources/appointments.datasource";
import {
  extractTimeFromISO,
  toLocalDateString,
} from "../../domain/utils/appointment-date.util";
import { appointmentsRepository } from "../../infraestructure/repositories/appointments.repository.impl";

export const usePatientAppointmentsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentsRepository.getByPatient(),
    enabled: !!user?.id,
  });
};

// Obtiene las horas ocupadas para una fecha "AAAA-MM-DD" en hora local
export const useOccupiedSlotsQuery = (selectedDate: string) => {
  const { data: patientAppointments = [] } = usePatientAppointmentsQuery();

  return useQuery({
    queryKey: ["appointments", "all"],
    queryFn: () => appointmentsRepository.getAllActive(),
    select: (allAppointments) => {
      // Unimos las citas globales con las del paciente por seguridad
      const combined = [...allAppointments, ...patientAppointments];

      const occupied = combined
        .filter((app) => {
          if (app.status.toLowerCase() !== "activa") return false;
          return toLocalDateString(app.date) === selectedDate;
        })
        .map((app) => extractTimeFromISO(app.date));

      // Eliminamos duplicados
      return Array.from(new Set(occupied));
    },
    enabled: !!selectedDate,
  });
};

export const useCreateAppointmentMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      appointmentsRepository.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "all"] });
    },
  });
};

export const useCancelAppointmentMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (appointmentId: string) =>
      appointmentsRepository.cancel(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["appointments", "all"] });
    },
  });
};
