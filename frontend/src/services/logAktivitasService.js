import api from "@/lib/api";

export function getLogAktivitas() {
  return api.get("/audit-log");
}
