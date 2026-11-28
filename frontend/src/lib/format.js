export const NAMA_HARI = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];
export const HARI_SINGKAT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
export const BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function rupiah(angka) {
  return "Rp" + Number(angka || 0).toLocaleString("id-ID");
}

const pad = (n) => String(n).padStart(2, "0");

export function toYMD(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseYMD(ymd) {
  const [y, m, d] = String(ymd).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function ymdDari(nilai) {
  if (!nilai) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(String(nilai)))
    return String(nilai).slice(0, 10);
  return toYMD(new Date(nilai));
}

export function tambahHari(ymd, jumlah) {
  const d = parseYMD(ymd);
  d.setDate(d.getDate() + jumlah);
  return toYMD(d);
}

export function isWeekend(ymd) {
  const hari = parseYMD(ymd).getDay();
  return hari === 0 || hari === 6;
}

export function tanggalPanjang(nilai) {
  const ymd = ymdDari(nilai);
  if (!ymd) return "-";
  const d = parseYMD(ymd);
  return `${NAMA_HARI[d.getDay()]}, ${d.getDate()} ${NAMA_BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

export function tanggalSingkat(nilai) {
  const ymd = ymdDari(nilai);
  if (!ymd) return "-";
  const d = parseYMD(ymd);
  return `${HARI_SINGKAT[d.getDay()]}, ${d.getDate()} ${BULAN_SINGKAT[d.getMonth()]} ${d.getFullYear()}`;
}

export function tanggalWaktu(nilai) {
  if (!nilai) return "-";
  const teks = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(nilai));
  return `${teks} WIB`;
}

export function toMinutes(jam) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(jam))) return null;
  const [h, m] = jam.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(menit) {
  return `${pad(Math.floor(menit / 60))}:${pad(menit % 60)}`;
}

export const jam = (nilai) => String(nilai || "").replace(":", ".");

export const rentangJam = (mulai, selesai) =>
  `${jam(mulai)} – ${jam(selesai)} WIB`;

export const STATUS_BOOKING = {
  Menunggu: {
    label: "Menunggu Bayar",
    kelas: "bg-[#FFF3E7] text-[#B45309]",
  },
  Dikonfirmasi: {
    label: "Dikonfirmasi",
    kelas: "bg-blue-50 text-blue-700",
  },
  Selesai: {
    label: "Selesai",
    kelas: "bg-green-50 text-green-700",
  },
  Dibatalkan: {
    label: "Dibatalkan",
    kelas: "bg-[#FEF2F2] text-[#DC2626]",
  },
};

export const labelStatus = (status) =>
  STATUS_BOOKING[status]?.label ?? status ?? "-";
export const kelasStatus = (status) =>
  STATUS_BOOKING[status]?.kelas ?? "bg-gray-100 text-gray-600";

export function kodeBooking(booking) {
  const id = String(booking?._id ?? booking?.id ?? "");
  return id ? `#BK-${id.slice(-5).toUpperCase()}` : "-";
}

export const namaPenyewa = (b) => b?.nama_penyewa || b?.user_id?.nama || "-";
export const noHpPenyewa = (b) => b?.no_hp_penyewa || b?.user_id?.no_hp || "-";

export const namaJenis = (lapangan) => lapangan?.jenis_id?.nama ?? "-";

export function lapanganLabel(booking) {
  const l = booking?.lapangan_id;
  if (!l) return "-";
  return l.jenis_id?.nama ? `${l.nama} (${l.jenis_id.nama})` : l.nama;
}

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3000/api";
const BASE_URL = API_URL.replace(/\/api\/?$/, "");

export function gambarUrl(gambar) {
  if (!gambar) return "";
  if (/^https?:\/\//i.test(gambar)) return gambar;

  const path = gambar.replace(/\\/g, "/").replace(/^\/+/, "");

  if (path.startsWith("uploads/")) return `${BASE_URL}/${path}`;
  if (path.startsWith("lapangan/")) return `${BASE_URL}/uploads/${path}`;
  return `${BASE_URL}/uploads/lapangan/${path}`;
}
