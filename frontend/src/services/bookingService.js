import api from "@/lib/api";

export const getBookings = (params = {}) => api.get("/booking", { params });

export const getBookingDetail = (id) => api.get(`/booking/${id}`);

// Publik
export const getJadwal = (lapanganId, tanggal) =>
  api.get("/booking/jadwal", { params: { lapangan_id: lapanganId, tanggal } });

// Publik
export const getJadwalSemua = (tanggal) =>
  api.get("/booking/jadwal-semua", { params: { tanggal } });

export const buatBooking = (data) => api.post("/booking", data);

// status: 'Dikonfirmasi' | 'Selesai' (hanya petugas)
export const ubahStatusBooking = (id, status) =>
  api.patch(`/booking/${id}/status`, { status });

export const batalkanBooking = (id) => api.patch(`/booking/${id}/batal`);
