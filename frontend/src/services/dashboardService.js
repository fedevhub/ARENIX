import api from "@/lib/api";

export const getDashboardData = () => {
  return api.get("/dashboard/data");
};

export const getRiwayatAktivitas = () => {
  return api.get("/dashboard/auditLog");
};
