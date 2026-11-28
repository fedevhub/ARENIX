import { jsPDF } from 'jspdf'
import {
    jam, kodeBooking, lapanganLabel, namaPenyewa, rupiah, tanggalPanjang,
} from '@/lib/format'

/** Mengunduh struk tanpa mengambil tangkapan layar halaman. */
export function unduhStrukPdf(booking) {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
    const rincian = booking.rincian ?? {}
    const sewa = booking.durasi_jam * (rincian.harga_dasar_per_jam ?? 0)
    const lampu = (rincian.jam_lampu ?? 0) * (rincian.tambahan_lampu_per_jam ?? 0)

    pdf.setFillColor(20, 39, 68)
    pdf.rect(0, 0, 210, 48, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(24)
    pdf.text('ARENIX', 18, 22)
    pdf.setFontSize(8)
    pdf.text('BUKTI RESERVASI LAPANGAN RESMI', 18, 30)
    pdf.setFillColor(227, 245, 236)
    pdf.roundedRect(145, 16, 46, 12, 6, 6, 'F')
    pdf.setTextColor(14, 124, 71)
    pdf.setFontSize(9)
    pdf.text('LUNAS / VALID', 168, 23.5, { align: 'center' })

    pdf.setTextColor(20, 39, 68)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.text('KODE BOOKING', 18, 65)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(26)
    pdf.text(kodeBooking(booking), 18, 78)

    const rows = [
        ['Nama Penyewa', namaPenyewa(booking)],
        ['Lapangan', lapanganLabel(booking)],
        ['Tanggal Main', tanggalPanjang(booking.tanggal)],
        ['Jadwal & Durasi', `${jam(booking.jam_mulai)} – ${jam(booking.jam_selesai)} WIB (${booking.durasi_jam} Jam)`],
    ]
    let y = 96
    pdf.setDrawColor(225, 232, 240)
    pdf.line(18, 87, 192, 87)
    rows.forEach(([label, nilai]) => {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(11)
        pdf.setTextColor(101, 117, 139)
        pdf.text(label, 18, y)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(20, 39, 68)
        pdf.text(nilai, 192, y, { align: 'right' })
        y += 13
    })

    pdf.line(18, y - 5, 192, y - 5)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(101, 117, 139)
    pdf.text(`Sewa Lapangan (${booking.durasi_jam} jam × ${rupiah(rincian.harga_dasar_per_jam)})`, 18, y + 8)
    pdf.text('Tambahan Lampu (sekali per booking)', 18, y + 20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(20, 39, 68)
    pdf.text(rupiah(sewa), 192, y + 8, { align: 'right' })
    pdf.text(rupiah(lampu), 192, y + 20, { align: 'right' })

    pdf.setFillColor(237, 241, 246)
    pdf.roundedRect(18, y + 31, 174, 20, 4, 4, 'F')
    pdf.setFontSize(13)
    pdf.text('Total Dibayar', 26, y + 43)
    pdf.setFontSize(18)
    pdf.text(rupiah(booking.total_biaya), 184, y + 43, { align: 'right' })
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    pdf.setTextColor(101, 117, 139)
    pdf.text('Terima kasih telah bermain di Arenix Sports Center.', 105, y + 65, { align: 'center' })

    pdf.save(`struk-${booking.kode_booking ?? booking._id}.pdf`)
}
