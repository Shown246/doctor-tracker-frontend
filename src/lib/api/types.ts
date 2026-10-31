import type { components } from './schema';
export type Schema = components['schemas'];
export type Account = Schema['CurrentUserResponse']['data'];
export type Role = Account['role'];
export type Doctor = Schema['DoctorResponse']['data'];
export type Patient = Schema['PatientResponse']['data'];
export type PatientDetail = Schema['PatientDetailResponse']['data'];
export type Note = Schema['NoteResponse']['data'];
export type Registration = Schema['RegistrationDetailResponse']['data'];
export type Dashboard = Schema['DashboardResponse']['data'];
export type Meta = Schema['PatientListResponse']['meta'];
export type Page<T> = { data: T[]; meta: Meta };
export const statuses = [
  'unassessed',
  'under_treatment',
  'stable',
  'critical',
  'recovered',
] as const;
export const genders = ['female', 'male', 'other', 'undisclosed'] as const;
export function portalPath(account: Account) {
  return account.status === 'active' ? `/${account.role}` : '/status';
}
