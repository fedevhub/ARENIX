import { ref } from "vue";
import { ubahStatusBooking, batalkanBooking } from "@/services/bookingService";
import { kodeBooking } from "@/lib/format";

// onSelesai: fungsi untuk memuat ulang data setelah aksi berhasil
export function useAksiBooking(onSelesai) {
  const sedangProses = ref(false);

  async function jalankan(fn, pesanKonfirmasi) {
    if (pesanKonfirmasi && !confirm(pesanKonfirmasi)) return;

    sedangProses.value = true;
    try {
      await fn();
      await onSelesai?.();
    } catch (e) {
      alert(e.response?.data?.message ?? "Aksi gagal. Coba lagi.");
    } finally {
      sedangProses.value = false;
    }
  }

  return {
    sedangProses,
    konfirmasi: (b) =>
      jalankan(
        () => ubahStatusBooking(b._id, "Dikonfirmasi"),
        `Konfirmasi pembayaran ${kodeBooking(b)}? Pastikan uang sudah diterima.`,
      ),
    selesai: (b) =>
      jalankan(
        () => ubahStatusBooking(b._id, "Selesai"),
        `Tandai ${kodeBooking(b)} sebagai selesai?`,
      ),
    batal: (b) =>
      jalankan(
        () => batalkanBooking(b._id),
        `Batalkan booking ${kodeBooking(b)}? Slot akan dibuka kembali.`,
      ),
  };
}
