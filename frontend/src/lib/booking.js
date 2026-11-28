import { isWeekend, toYMD, toMinutes, fromMinutes } from "@/lib/format";

// Tarif default ARENIX
const TARIF_WEEKDAY = 55000;
const TAMBAHAN_WEEKEND = 20000;
const TAMBAHAN_LAMPU = 15000;

/**
 * Ubah daftar tarif dari API menjadi:
 * { [lapanganId]: { Weekday: { dasar, lampu }, Weekend: { dasar, lampu } } }
 */
export function indeksTarif(daftarTarif = []) {
  const hasil = {};

  for (const t of daftarTarif) {
    const id = String(t.lapangan_id?._id ?? t.lapangan_id);

    hasil[id] ??= { Weekday: {}, Weekend: {} };

    hasil[id][t.tipe_hari][t.pakai_lampu ? "lampu" : "dasar"] = Number(
      t.harga_per_jam,
    );
  }

  return hasil;
}

// Harga terendah untuk kartu lapangan
export function hargaTermurah(tarifLapangan) {
  const semua = [
    tarifLapangan?.Weekday?.dasar ?? TARIF_WEEKDAY,
    tarifLapangan?.Weekend?.dasar ?? TARIF_WEEKDAY + TAMBAHAN_WEEKEND,
  ].filter((v) => typeof v === "number");

  return semua.length ? Math.min(...semua) : null;
}

// Mengambil harga berdasarkan tanggal
export function hargaHari(tarifLapangan, ymd) {
  const tipe = isWeekend(ymd) ? "Weekend" : "Weekday";

  const hargaDatabase = tarifLapangan?.[tipe]?.dasar;

  if (hargaDatabase != null) {
    return hargaDatabase;
  }

  return tipe === "Weekend" ? TARIF_WEEKDAY + TAMBAHAN_WEEKEND : TARIF_WEEKDAY;
}

/**
 * Menghitung rincian biaya booking.
 *
 * Weekday = Rp55.000/jam
 * Weekend = Rp75.000/jam
 * Lampu = tambahan Rp15.000 sekali per booking
 *
 * Lampu dikenakan jika jam selesai melewati batas jam lampu.
 */
export function hitungBiaya({
  tarifLapangan,
  ymd,
  durasi,
  pakaiLampu,
  jamMulai,
  jamSelesai,
  jamMulaiLampu = "17:00",
}) {
  const tipe = isWeekend(ymd) ? "Weekend" : "Weekday";

  let dasar = tarifLapangan?.[tipe]?.dasar ?? null;

  // Fallback harga dasar
  if (dasar == null) {
    dasar =
      tipe === "Weekend" ? TARIF_WEEKDAY + TAMBAHAN_WEEKEND : TARIF_WEEKDAY;
  }

  const mulai = toMinutes(jamMulai);
  const batasLampu = toMinutes(jamMulaiLampu);

  // Lampu dipakai otomatis bila booking dimulai setelah jam lampu berlaku.
  const lampuDikenakan =
    pakaiLampu &&
    mulai !== null &&
    batasLampu !== null &&
    mulai >= batasLampu;

  const hargaLampu = tarifLapangan?.[tipe]?.lampu ?? dasar + TAMBAHAN_LAMPU;
  const tambahanLampu = Math.max(0, hargaLampu - dasar);
  // Selisih tarif lampu adalah biaya tetap, sehingga hanya ditagihkan
  // sekali meskipun durasi booking lebih dari satu jam.
  const biayaLampu = lampuDikenakan && durasi > 0 ? tambahanLampu : 0;

  const sewa = durasi * dasar;
  const tersedia = typeof dasar === "number" && durasi > 0;

  return {
    tipe,
    tersedia,
    hargaDasar: dasar,
    tambahanPerJam: lampuDikenakan ? tambahanLampu : 0,
    hargaPerJam: dasar,
    sewa,
    biayaLampu,
    total: tersedia ? sewa + biayaLampu : 0,
  };
}

/**
 * Bangun daftar slot 1 jam dari jam buka-tutup.
 * Status: Tersedia | Terisi | Lewat
 */
export function bangunSlot({ jamBuka, jamTutup, booking = [], ymd }) {
  const buka = toMinutes(jamBuka);
  const tutup = toMinutes(jamTutup);

  if (buka === null || tutup === null) return [];

  const hariIni = toYMD();
  const sekarang = new Date();
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  const slots = [];

  for (let m = buka; m + 60 <= tutup; m += 60) {
    const mulai = fromMinutes(m);
    const selesai = fromMinutes(m + 60);

    const terisi = booking.some(
      (b) => b.jam_mulai < selesai && b.jam_selesai > mulai,
    );

    let status = "Tersedia";

    if (terisi) {
      status = "Terisi";
    } else if (ymd < hariIni || (ymd === hariIni && m < menitSekarang)) {
      status = "Lewat";
    }

    slots.push({
      mulai,
      selesai,
      status,
    });
  }

  return slots;
}

export const jumlahSlotTersedia = (slots) =>
  slots.filter((s) => s.status === "Tersedia").length;
