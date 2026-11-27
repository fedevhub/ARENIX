import api from "@/lib/api";

export const getLapangan = () => api.get("/lapangan");

export const getTarif = () => api.get("/tarif");

export const tambahTarif = (data) => api.post("/tarif", data);

export const editTarif = (id, data) => api.put(`/tarif/${id}`, data);

export const hapusTarif = (id) => api.delete(`/tarif/${id}`);
