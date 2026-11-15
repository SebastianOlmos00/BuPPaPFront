import { api } from './api';
import type { Role, User } from './authService';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Parametros de listado y filtros (page, limit, search, searchBy, typeId, userId...). Los vacios no se envian.
export type ListParams = { page?: number; limit?: number; search?: string; searchBy?: string } & Record<string, string | number | undefined>;

function toQuery(params: ListParams = {}) {
  const pairs = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  if (pairs.length === 0) return '';
  return '?' + pairs.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&');
}

export interface AdminStats {
  registeredUsers: number;
  totalRecognitions: number;
  mostRecognizedRocks: { rockId: number; name: string; count: number }[];
}

export interface CollectionEntry {
  id: number;
  rockId: number;
  rockName: string | null;
  recognitionCount: number;
  firstDiscoveredAt: string;
}

export interface UnlockedAchievement {
  id: number;
  slug: string;
  name: string;
  experience: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface RecognitionRecord {
  id: number;
  userId: number | null;
  guestSessionId: number | null;
  rockId: number;
  confidence: number;
  result: string;
  note: string | null;
  createdAt: string;
}

export interface FeedbackRecord {
  id: number;
  analysisId: number;
  userId: number;
  isCorrect: boolean;
  comment: string | null;
  createdAt: string;
}

export interface Rock {
  id: number;
  typeId: number;
  categoryId: number;
  index: number;
  name: string;
  scientificName: string;
  description?: string | null;
  composition: string;
  formula: string;
  environment: string;
  commonUses: string;
  hardness: number;
  streak: string;
  color: string;
  texture: string;
  density: number;
  transparency: number;
  tenacity: number;
  imgUrl: string;
  mindatUrl: string;
}

export interface RockType {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Achievement {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  experience: number;
  conditionType: string | null;
  conditionValue: number | null;
  isActive: boolean;
}

// CRUD generico que expone el backend para un recurso: GET /, POST /, GET /:id, PATCH /:id y DELETE /:id.
function crudResource<T, Input = Partial<T>>(path: string) {
  return {
    list: (params: ListParams = {}) => api.get<Paginated<T>>(`${path}${toQuery(params)}`),
    get: (id: number) => api.get<T>(`${path}/${id}`),
    create: (data: Input) => api.post<T>(path, data),
    update: (id: number, data: Partial<Input>) => api.patch<T>(`${path}/${id}`, data),
    remove: (id: number) => api.delete<void>(`${path}/${id}`),
  };
}

export const rocksService = crudResource<Rock, Omit<Rock, 'id'>>('/rock');
export const typesService = crudResource<RockType, { name: string }>('/type');
export const categoriesService = crudResource<Category, { name: string; description?: string }>('/category');
export const achievementsService = crudResource<Achievement, Omit<Achievement, 'id'>>('/achievement');

export const adminService = {
  stats: () => api.get<AdminStats>('/admin/stats'),
  recognitions: (params: ListParams = {}) => api.get<Paginated<RecognitionRecord>>(`/admin/recognitions${toQuery(params)}`),
  feedback: (params: ListParams = {}) => api.get<Paginated<FeedbackRecord>>(`/admin/feedback${toQuery(params)}`),
  users: (params: ListParams = {}) => api.get<Paginated<User>>(`/user${toQuery(params)}`),
  roles: () => api.get<Paginated<Role>>('/role?limit=100'),
  updateUser: (id: number, changes: { roleId?: number; status?: 'active' | 'blocked' }) =>
    api.patch<User>(`/admin/users/${id}`, changes),
  userCollection: (id: number) => api.get<CollectionEntry[]>(`/admin/users/${id}/collection`),
  userAchievements: (id: number) => api.get<UnlockedAchievement[]>(`/admin/users/${id}/achievements`),
};