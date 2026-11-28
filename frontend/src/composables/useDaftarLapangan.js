import { computed, ref } from "vue";
import { getLapangan } from "@/services/lapanganService";
import { getTarif } from "@/services/tarifService";
import { getJadwalSemua } from "@/services/bookingService";
import {
  indeksTarif,
  hargaTermurah,
  bangunSlot,
  jumlahSlotTersedia,
} from "@/lib/booking";
import { toYMD } from "@/lib/format";

export function useDaftarLapangan() {
  const daftar = ref([]);
  const jadwalHariIni = ref([]);
  const loading = ref(true);
  const error = ref("");

  const pencarian = ref("");
  const filterJenis = ref("Semua");
  const filterStatus = ref("Semua");

  async function muat() {
    loading.value = true;
    error.value = "";

    try {
      const ymd = toYMD();
      const [l, t, j] = await Promise.all([
        getLapangan(),
        getTarif(),
        getJadwalSemua(ymd),
      ]);

      const tarif = indeksTarif(t.data.data ?? []);
      jadwalHariIni.value = j.data.data ?? [];

      daftar.value = (l.data.data ?? []).map((item) => {
        const id = String(item._id);
        const booking = jadwalHariIni.value.filter(
          (b) => String(b.lapangan_id) === id,
        );
        const slots = bangunSlot({
          jamBuka: item.jam_buka,
          jamTutup: item.jam_tutup,
          booking,
          ymd,
        });

        return {
          ...item,
          harga: hargaTermurah(tarif[id]),
          slotsHariIni: slots,
          slotTersedia: jumlahSlotTersedia(slots),
        };
      });
    } catch (e) {
      error.value = e.response?.data?.message ?? "Gagal memuat data lapangan.";
    } finally {
      loading.value = false;
    }
  }

  const opsiJenis = computed(() => [
    ...new Set(daftar.value.map((l) => l.jenis_id?.nama).filter(Boolean)),
  ]);

  const tampil = computed(() => {
    const q = pencarian.value.trim().toLowerCase();

    return daftar.value.filter((l) => {
      const cocokQ =
        !q ||
        l.nama.toLowerCase().includes(q) ||
        (l.jenis_id?.nama ?? "").toLowerCase().includes(q);
      const cocokJenis =
        filterJenis.value === "Semua" || l.jenis_id?.nama === filterJenis.value;
      const cocokStatus =
        filterStatus.value === "Semua" || l.status === filterStatus.value;
      return cocokQ && cocokJenis && cocokStatus;
    });
  });

  return {
    daftar,
    tampil,
    loading,
    error,
    muat,
    pencarian,
    filterJenis,
    filterStatus,
    opsiJenis,
  };
}
