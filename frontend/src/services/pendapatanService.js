import api from "@/lib/api";

// Mengambil daftar pendapatan dari Booking
export const getPendapatan = () => {
  return api.get("/booking/pendapatan");
};

// Mengambil ringkasan pendapatan untuk card
export const getPendapatanData = () => {
  return api.get("/booking/pendapatan/ringkasan");
};
