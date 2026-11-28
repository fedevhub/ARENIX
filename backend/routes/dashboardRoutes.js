
const express = require('express');
const router = express.Router();

const User = require('../models/userModels');
const Lapangan = require('../models/lapanganModels');
const Booking = require('../models/bookingModels');
const AuditLog = require('../models/auditLogModel');

const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.use(authorizeRole('admin'));

// Format tanggal menjadi YYYY-MM-DD
const dateKey = (date) => {
    const d = new Date(date);

    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// GET /api/dashboard/data
router.get('/data', async (req, res) => {
    try {
        const [
            totalPengguna,
            totalLapangan,
            totalBooking,
            semuaBooking,
            bookingTerbaru,
            aktivitasTerbaru
        ] = await Promise.all([
            User.countDocuments(),
            Lapangan.countDocuments(),
            Booking.countDocuments(),

            Booking.find({
                status: { $in: ['Dikonfirmasi', 'Selesai'] }
            })
                .select('tanggal total_biaya status')
                .lean(),

            Booking.find()
                .populate('user_id', 'nama username')
                .populate('lapangan_id', 'nama')
                .sort({ created_at: -1 })
                .limit(5)
                .lean(),

            AuditLog.find()
                .populate('user_id', 'nama username')
                .sort({ waktu: -1 })
                .limit(5)
                .lean()
        ]);

        // Total pendapatan
        const totalPendapatan = semuaBooking.reduce(
            (total, booking) =>
                total + Number(booking.total_biaya || 0),
            0
        );

        // Booking mingguan: 7 hari terakhir
        const bookingMingguan = [];

        const hariIni = new Date();

        for (let i = 6; i >= 0; i--) {
            const tanggal = new Date(
                Date.UTC(
                    hariIni.getUTCFullYear(),
                    hariIni.getUTCMonth(),
                    hariIni.getUTCDate() - i
                )
            );

            const key = dateKey(tanggal);

            const jumlah = await Booking.countDocuments({
                tanggal: {
                    $gte: new Date(`${key}T00:00:00.000Z`),
                    $lt: new Date(
                        new Date(`${key}T00:00:00.000Z`).getTime()
                        + 24 * 60 * 60 * 1000
                    )
                }
            });

            bookingMingguan.push({
                label: tanggal.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    timeZone: 'UTC'
                }),
                value: jumlah,
                secondary: 0
            });
        }

        // Pendapatan bulanan: 6 bulan terakhir
        const pendapatanBulanan = [];

        const sekarang = new Date();

        for (let i = 5; i >= 0; i--) {
            const awalBulan = new Date(
                Date.UTC(
                    sekarang.getUTCFullYear(),
                    sekarang.getUTCMonth() - i,
                    1
                )
            );

            const akhirBulan = new Date(
                Date.UTC(
                    awalBulan.getUTCFullYear(),
                    awalBulan.getUTCMonth() + 1,
                    1
                )
            );

            const total = semuaBooking
                .filter((booking) => {
                    const tanggal = new Date(booking.tanggal);

                    return (
                        tanggal >= awalBulan &&
                        tanggal < akhirBulan
                    );
                })
                .reduce(
                    (sum, booking) =>
                        sum + Number(booking.total_biaya || 0),
                    0
                );

            pendapatanBulanan.push({
                label: awalBulan.toLocaleDateString('id-ID', {
                    month: 'short',
                    timeZone: 'UTC'
                }),
                value: total
            });
        }

        // Format booking terbaru
        const dataBookingTerbaru = bookingTerbaru.map((booking) => ({
            id: booking._id,
            kode: `ARENIX-${String(booking._id).slice(-6).toUpperCase()}`,
            penyewa:
                booking.user_id?.nama ||
                booking.user_id?.username ||
                booking.nama_penyewa ||
                '-',
            lapangan: booking.lapangan_id?.nama || '-',
            status: booking.status
        }));

        // Format aktivitas terbaru
        const dataAktivitas = aktivitasTerbaru.map((aktivitas) => ({
            id: aktivitas._id,
            aksi: aktivitas.aksi,
            pelaku:
                aktivitas.user_id?.nama ||
                aktivitas.user_id?.username ||
                '-',
            waktu: new Date(aktivitas.waktu).toLocaleString('id-ID', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
        }));

        return res.status(200).json({
            success: true,
            pengguna: totalPengguna,
            lapangan: totalLapangan,
            booking: totalBooking,
            pendapatan: totalPendapatan,
            bookingMingguan,
            pendapatanBulanan,
            bookingTerbaru: dataBookingTerbaru,
            aktivitas: dataAktivitas
        });

    } catch (error) {
        console.error('GAGAL MEMUAT DASHBOARD:', error);

        return res.status(500).json({
            success: false,
            message: 'Gagal mengambil data dashboard',
            detail: error.message
        });
    }
});

module.exports = router;
