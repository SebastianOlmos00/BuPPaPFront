import { api } from './api';

interface Paged {
  total: number;
}

// Las listas del backend devuelven { items, total, page, pageSize }.
// Con pageSize=1 solo se pide el total.
export async function getAdminSummary() {
  const [drivers, vehicles, activeShifts] = await Promise.all([
    api.get<Paged>('/admin/drivers?pageSize=1'),
    api.get<Paged>('/admin/vehicles?pageSize=1'),
    api.get<Paged>('/admin/shifts?status=IN_PROGRESS&pageSize=1'),
  ]);
  return {
    drivers: drivers.total,
    vehicles: vehicles.total,
    activeShifts: activeShifts.total,
  };
}