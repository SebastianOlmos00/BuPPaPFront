import { api } from './api';

export type VehicleStatus =
  | 'OPERATIONAL'
  | 'OPERATIONAL_WITH_OBSERVATIONS'
  | 'OUT_OF_SERVICE'
  | 'MAINTENANCE';

export type TripStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';

export interface Trip {
  id: number;
  sequence: number;
  routeId: number;
  scheduledStart: string;
  actualStart: string | null;
  actualEnd: string | null;
  status: TripStatus;
}

export interface Shift {
  id: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED' | 'NOT_PERFORMED';
  scheduledStart: string;
  scheduledEnd: string;
  actualStart: string | null;
  vehicle: { id: number; identifier: string; status: VehicleStatus } | null;
  trips: Trip[];
}

interface Paged<T> {
  items: T[];
}

// Turno en curso; si no hay, el siguiente programado.
export async function getCurrentShift(): Promise<Shift | null> {
  const active = await api.get<Paged<Shift>>('/driver/shifts?status=IN_PROGRESS');
  if (active.items.length > 0) return active.items[0];

  const scheduled = await api.get<Paged<Shift>>('/driver/shifts?status=SCHEDULED');
  if (scheduled.items.length === 0) return null;
  // La lista viene de más nuevo a más antiguo: el próximo turno es el último.
  return scheduled.items[scheduled.items.length - 1];
}

export const startShift = (shiftId: number, vehicleStatus: VehicleStatus, reason?: string) =>
  api.post(`/driver/shifts/${shiftId}/start`, { vehicleStatus, reason });

export const finishShift = (shiftId: number) => api.post(`/driver/shifts/${shiftId}/finish`);

export const setVehicleStatus = (shiftId: number, status: VehicleStatus, reason: string) =>
  api.post(`/driver/shifts/${shiftId}/vehicle-status`, { status, reason });

export const startTrip = (tripId: number) => api.post(`/driver/trips/${tripId}/start`);

export const finishTrip = (tripId: number, reasonNote?: string) =>
  api.post(`/driver/trips/${tripId}/finish`, { reasonNote });

// Se envía como JSON (sin foto). Ver nota de la incidencia más abajo.
export const reportIncident = (data: {
  type: 'VEHICLE' | 'ROUTE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}) => api.post('/driver/incidents', data);