import api from "@/lib/api";

export const getJenis = () => api.get("/jenis");

export const tambahJenis = (data) => api.post("/jenis", data);

export const editJenis = (id, data) => api.put(`/jenis/${id}`, data);

export const hapusJenis = (id) => api.delete(`/jenis/${id}`);
