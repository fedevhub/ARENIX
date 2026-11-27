import api from "@/lib/api";

export const getLapangan = () => api.get("/lapangan");

function buatFormData(data) {
  const formData = new FormData();

  formData.append("nama", data.nama);
  formData.append("jenis_id", data.jenis_id);
  formData.append("jam_buka", data.jam_buka);
  formData.append("jam_tutup", data.jam_tutup);
  formData.append("jam_mulai_lampu", data.jam_mulai_lampu);
  formData.append("status", data.status);

  if (data.gambar instanceof File) {
    formData.append("gambar", data.gambar);
  }

  return formData;
}

export const tambahLapangan = (data) =>
  api.post("/lapangan", buatFormData(data));

export const editLapangan = (id, data) =>
  api.put(`/lapangan/${id}`, buatFormData(data));

export const hapusLapangan = (id) => api.delete(`/lapangan/${id}`);

export const detailLapangan = (id) => api.get(`/lapangan/${id}`);
