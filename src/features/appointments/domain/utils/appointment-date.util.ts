// 1. Une "2026-10-25" + "01:00 p.m" (o "13:00 p.m") en un DateTime ISO para Prisma
export const combineDateAndTime = (
  dateStr: string,
  timeSlot: string,
): string => {
  const [timePart, periodPart] = timeSlot.trim().split(" ");
  const [hoursStr, minutesStr] = timePart.split(":");

  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  const isPM = periodPart?.toLowerCase().includes("p");

  // Convierte formato 12h a 24h (ej. "01:00 p.m" -> 13 hrs)
  if (isPM && hours < 12) {
    hours += 12;
  } else if (!isPM && hours === 12) {
    hours = 0;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  // Creamos la fecha en hora local para que coincida con el horario del consultorio
  const combined = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return combined.toISOString();
};

// 2. Extrae la hora legible en 12h (ej. "01:00 p.m.") desde el DateTime ISO de Prisma
export const extractTimeFromISO = (isoDate: string): string => {
  const dateObj = new Date(isoDate);
  if (isNaN(dateObj.getTime())) return "--:--";

  const rawHours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const suffix = rawHours >= 12 ? "p.m." : "a.m.";

  // Convierte 24h a 12h (13 -> 01, 0 -> 12)
  const hours12 = rawHours % 12 || 12;
  const paddedHours = String(hours12).padStart(2, "0");

  return `${paddedHours}:${minutes} ${suffix}`;
};

// 3. Extrae Mes, Día número y Día de la semana para los badges de la UI
export const formatDateBadge = (isoDate: string) => {
  const dateObj = new Date(isoDate);
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const days = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  if (isNaN(dateObj.getTime())) {
    return { month: "Mes", dayNumber: "00", dayName: "Día" };
  }

  return {
    month: months[dateObj.getMonth()],
    dayNumber: String(dateObj.getDate()).padStart(2, "0"),
    dayName: days[dateObj.getDay()],
  };
};

// 4. Extrae "AAAA-MM-DD" respetando la zona horaria local del dispositivo
export const toLocalDateString = (dateInput: string | Date): string => {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
