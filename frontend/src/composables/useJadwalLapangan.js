import { computed, ref, watch } from "vue";

import { detailLapangan } from "@/services/lapanganService";
import { getTarif } from "@/services/tarifService";
import { getJadwal } from "@/services/bookingService";

import { indeksTarif, bangunSlot, hitungBiaya } from "@/lib/booking";

import { toYMD, toMinutes } from "@/lib/format";

export function useJadwalLapangan(lapanganId) {
  const lapangan = ref(null);
  const tarifLapangan = ref(null);
  const tanggal = ref(toYMD());
  const booking = ref([]);
  const pilihan = ref(null);

  const pakaiLampu = ref(false);

  const loading = ref(true);
  const loadingJadwal = ref(false);
  const error = ref("");

  const aktif = computed(() => lapangan.value?.status === "Aktif");

  // Daftar slot lapangan
  const slots = computed(() =>
    lapangan.value
      ? bangunSlot({
          jamBuka: lapangan.value.jam_buka,
          jamTutup: lapangan.value.jam_tutup,
          booking: booking.value,
          ymd: tanggal.value,
        })
      : [],
  );

  // Durasi booking dalam jam
  const durasi = computed(() => {
    if (!pilihan.value) return 0;

    const mulai = toMinutes(pilihan.value.mulai);
    const selesai = toMinutes(pilihan.value.selesai);

    if (mulai === null || selesai === null) return 0;

    return (selesai - mulai) / 60;
  });

  // Cek apakah jadwal booking melewati jam mulai lampu
  const lampuTersedia = computed(() => {
    if (!pilihan.value || !lapangan.value) {
      return false;
    }

    const mulaiLampu = toMinutes(lapangan.value.jam_mulai_lampu || "17:00");

    const mulaiBooking = toMinutes(pilihan.value.mulai);

    if (mulaiLampu === null || mulaiBooking === null) {
      return false;
    }

    return mulaiBooking >= mulaiLampu;
  });

  // Lampu otomatis aktif berdasarkan jadwal booking
  const lampuAktif = computed(() => lampuTersedia.value);

  // Rincian biaya booking
  const biaya = computed(() =>
    hitungBiaya({
      tarifLapangan: tarifLapangan.value,
      ymd: tanggal.value,
      durasi: durasi.value,
      pakaiLampu: lampuAktif.value,
      jamMulai: pilihan.value?.mulai,
      jamSelesai: pilihan.value?.selesai,
      jamMulaiLampu: lapangan.value?.jam_mulai_lampu || "17:00",
    }),
  );

  // Biaya tambahan lampu hanya sekali per booking.
  const tambahanLampuPerJam = computed(() => biaya.value.biayaLampu);

  // Sinkronisasi status lampu
  watch(
    lampuTersedia,
    (tersedia) => {
      pakaiLampu.value = tersedia;
    },
    { immediate: true },
  );

  // Memuat jadwal booking
  async function muatJadwal() {
    if (!lapangan.value || !aktif.value) {
      booking.value = [];
      return;
    }

    loadingJadwal.value = true;

    try {
      const res = await getJadwal(lapanganId, tanggal.value);

      booking.value = res.data.data.booking ?? [];
    } catch (e) {
      error.value = e.response?.data?.message ?? "Gagal memuat jadwal.";
    } finally {
      loadingJadwal.value = false;
    }
  }

  // Memilih rentang slot
  function pasangPilihan(mulai, selesai) {
    if (!mulai || !selesai) return;

    const a = slots.value.findIndex((s) => s.mulai === mulai);

    const b = slots.value.findIndex((s) => s.selesai === selesai);

    if (a < 0 || b < a) return;

    const rentangSlot = slots.value.slice(a, b + 1);

    if (rentangSlot.every((s) => s.status === "Tersedia")) {
      pilihan.value = {
        mulai,
        selesai,
      };
    }
  }

  // Memuat data awal lapangan dan tarif
  async function muatAwal(prefill = {}) {
    loading.value = true;
    error.value = "";

    try {
      const [l, t] = await Promise.all([
        detailLapangan(lapanganId),
        getTarif(),
      ]);

      lapangan.value = l.data.data;

      tarifLapangan.value =
        indeksTarif(t.data.data ?? [])[String(lapanganId)] ?? null;

      if (
        /^\d{4}-\d{2}-\d{2}$/.test(prefill.tanggal ?? "") &&
        prefill.tanggal >= toYMD()
      ) {
        tanggal.value = prefill.tanggal;
      }

      await muatJadwal();

      pasangPilihan(prefill.mulai, prefill.selesai);
    } catch (e) {
      error.value = e.response?.data?.message ?? "Gagal memuat lapangan.";
    } finally {
      loading.value = false;
    }
  }

  // Mengganti tanggal booking
  async function gantiTanggal(ymd) {
    tanggal.value = ymd;
    pilihan.value = null;
    pakaiLampu.value = false;

    await muatJadwal();
  }

  // Dipertahankan agar kompatibel dengan komponen yang sudah ada
  function setLampu(nilai) {
    pakaiLampu.value = lampuTersedia.value ? true : Boolean(nilai);
  }

  return {
    lapangan,
    tarifLapangan,
    tanggal,
    booking,
    pilihan,
    slots,
    durasi,
    aktif,
    lampuTersedia,
    lampuAktif,
    tambahanLampuPerJam,
    biaya,
    loading,
    loadingJadwal,
    error,
    muatAwal,
    muatJadwal,
    gantiTanggal,
    setLampu,
  };
}
