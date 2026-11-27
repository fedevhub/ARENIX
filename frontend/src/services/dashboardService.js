import api from '@/lib/api';

export const getDashboardData = () => api.get('/dashboard/data')
export const getRiwayatAktivitas = () => api.get('/dashboard/auditLog')