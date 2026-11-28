import { useRouter } from "vue-router";
import { getUser, isLoggedIn } from "@/lib/auth";

export function useMulaiBooking() {
  const router = useRouter();

  function mulai(lapanganId, query = {}) {
    const tujuan = router.resolve({
      path: `/penyewa/booking/baru/${lapanganId}`,
      query,
    });

    if (!isLoggedIn()) {
      return router.push({
        path: "/login",
        query: { redirect: tujuan.fullPath },
      });
    }

    if (getUser()?.role !== "penyewa") {
      alert("Hanya akun penyewa yang dapat membuat booking online.");
      return;
    }

    router.push(tujuan.fullPath);
  }

  return { mulai };
}
