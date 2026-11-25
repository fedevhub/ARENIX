const Lapangan = require('../models/lapanganModels');
const User = require('../models/userModels');
const Booking = require('../models/bookingModels');
const Tarif = require('../models/tarifModels');
const AuditLog = require('../models/auditLogModel');

const toMinutes = (time) => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        return null;
    }

    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
};

const createLog = async (userId, aksi, bookingId = null) => {
    await AuditLog.create({
        user_id: userId,
        aksi,
        booking_id: bookingId
    });
};

const getDateInfo = (value) => {
    if (typeof value !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    if (date.toISOString().slice(0, 10) !== value) {
        return null;
    }

    return {
        date,
        day: date.getUTCDay()
    };
};

const getBookings = async (req, res) => {
    try {
        const filter = {};

        if (req.user.role === 'penyewa') {
            filter.user_id = req.user.id;
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        if (req.query.tanggal) {
            const info = getDateInfo(req.query.tanggal);

            if (!info) {
                return res.status(400).json({
                    success: false,
                    message: 'Format tanggal harus YYYY-MM-DD'
                });
            }

            filter.tanggal = info.date;
        }

        const data = await Booking.find(filter)
            .populate('user_id', 'nama username no_hp')
            .populate('lapangan_id', 'nama')
            .sort({ tanggal: -1, jam_mulai });
        
        res.status(200).json({
            success: true,
            jumlah: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getBookingById = async (req, res) => {
    try {
        const data = await Booking(req.params.id)
            .populate('user_id', 'nama username no_hp')
            .populate('lapangan_id', 'nama');

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Booking tidak ditemukan'
            });
        }

        if (
            req.user.role === 'penyewa' &&
            String(data.user_id._id) !== String(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Kamu tidak dapat melihat booking pengguna lain'
            });
        }
        
        res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'ID booking tidak valid'
        });
    }
};

const getJadwal = async (req, res) => {
    try {
        const { lapangan_id, tanggal } = req.query;

        if (!lapangan_id || !tanggal ) {
            return res.status(400).json({
                success: false,
                message: 'Lapangan & tanggal wajib dipilih'
            });
        }

        const info = getDateInfo(tanggal);

        if (!info) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
            });
        }

        const lapangan = await Lapangan.findById(lapangan_id);

        if (!lapangan || lapangan.status !== 'Aktif') {
            return res.status(404).json({
                success: false,
                message: 'Lapangan tidak ditemukan atau tidak aktif'
            });
        }

        const bookings = await Booking.find({
            lapangan_id,
            tanggal: info.date,
            status: { $ne: 'Dibatalkan' }
        }).select('jam_mulai jam_selesai status');

        const bookedSlots = bookings.map(item => ({
            jam_mulai: item.jam_mulai,
            jam_selesai: item.jam_selesai,
            status: item.status
        }));

        res.status(200).json({
            success: true,
            data: {
                lapangan,
                tanggal,
                jam_buka: lapangan.jam_buka,
                jam_tutup: lapangan.jam_tutup,
                booking: bookedSlots
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const createBooking = async (req, res) => {
    try {
        const {
            user_id,
            lapangan_id,
            tanggal,
            jam_mulai,
            jam_selesai,
            pakai_lampu
        } = req.body;

        if (
            !lapangan_id ||
            !tanggal ||
            !jam_mulai ||
            !jam_selesai ||
            typeof pakai_lampu !== 'boolean'
        ) {
            return res.status(400).json({
                success: false,
                message: 'Data booking belum lengkap'
            });
        }

        let targetUserId = req.user.id;

        if (req.user.role === 'petugas') {
            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Pilih penyewa terlebih dahulu'
                });
            }

            targetUserId = user_id;
        } else if (req.user.role !== 'penyewa') {
            return res.status(403).json({
                success: false,
                message: 'Role tidak diizinkan membuat booking'
            });
        }

        const penyewa = await User.findById(targetUserId);

        if (!penyewa || penyewa.role !== 'penyewa') {
            return res.status(404).json({
                success: false,
                message: 'Data penyewa tidak ditemukan'
            });
        }

        const info = getDateInfo(tanggal);

        if (!info) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
            });
        }

        if (info.date.getTime() < Date.UTC(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
        )) {
            return res.status(400).json({
                success: false,
                message: 'Tanggal booking tidak boleh di masa lalu'
            });
        }

        const start = toMinutes(jam_mulai);
        const end = toMinutes(jam_selesai);

        if (start === null || end === null || end <= start) {
            return res.status(400).json({
                success: false,
                message: 'Jam booking tidak valid'
            });
        }

        const durasi = (end - start) / 60;

        if (!Number.isInteger(durasi)) {
            return res.status(400).json({
                success: false,
                message: 'Durasi booking harus dalam kelipatan satu jam'
            });
        }

        const lapangan = await Lapangan.findById(lapangan_id);

        if (!lapangan || lapangan.status !== 'Aktif') {
            return res.status(404).json({
                success: false,
                message: 'Lapangan tidak ditemukan atau tidak aktif'
            });
        }

        const buka = toMinutes(lapangan.jam_buka);
        const tutup = toMinutes(lapangan.jam_tutup);

        if (buka === null || tutup === null ||
            start < buka || end > tutup) {
            return res.status(400).json({
                success: false,
                message: 'Jam booking di luar jam operasional'
            });
        }

        const mulaiLampu = toMinutes(lapangan.jam_mulai_lampu);

        if (pakai_lampu && (mulaiLampu === null || start < mulaiLampu)) {
            return res.status(400).json({
                success: false,
                message: 'Lampu belum dapat digunakan pada jam tersebut'
            });
        }

        const bentrok = await Booking.findOne({
            lapangan_id,
            tanggal: info.date,
            status: { $ne: 'Dibatalkan' },
            jam_mulai: { $lt: jam_selesai },
            jam_selesai: { $gt: jam_mulai }
        });

        if (bentrok) {
            return res.status(409).json({
                success: false,
                message: 'Jadwal sudah dibooking. Silakan pilih jam lain.'
            });
        }

        const tipeHari = [0, 6].includes(info.day)
            ? 'Weekend'
            : 'Weekday';

        const tarif = await Tarif.findOne({
            lapangan_id,
            tipe_hari: tipeHari,
            pakai_lampu
        });

        if (!tarif) {
            return res.status(404).json({
                success: false,
                message: 'Tarif untuk pilihan tersebut belum tersedia'
            });
        }

        const totalBiaya = tarif.harga_per_jam * durasi;

        const booking = await Booking.create({
            user_id: targetUserId,
            lapangan_id,
            tanggal: info.date,
            jam_mulai,
            jam_selesai,
            durasi_jam: durasi,
            total_biaya: totalBiaya,
            pakai_lampu,
            status: 'Menunggu'
        });

        await createLog(
            req.user.id,
            'Tambah Booking',
            booking._id
        );

        res.status(201).json({
            success: true,
            message: 'Booking berhasil dibuat',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatus = ['Dikonfirmasi', 'Selesai'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status tidak valid'
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking tidak ditemukan'
            });
        }

        if (req.user.role !== 'petugas') {
            return res.status(403).json({
                success: false, 
                message: 'Hanya petugas yang dapat menguba status booking'
            });
        }

        if (status === 'Dikonfirmasi' && booking.status !== 'Menunggu') {
            return res.status(400).json({
                success: false,
                message: 'Hanya booking menunggu yang dapat dikonfirmasi'
            });
        }

        if (status === 'Selesai' && booking.status !== 'Dikonfirmasi') {
            return res.status(400).json({
                success: false,
                message: 'Booking harus dikonfirmasi sebelum diselesaikan'
            });
        }

        booking.status = status;
        await boking.save();

        const aksi = status === 'Dikonfirmasi'
            ? 'Konfirmasi Pembayaran'
            : 'Selesaikan Booking';
        
        await createLog(req.user.id, aksi, booking._id);

        res.status(200).json({
            success: true,
            message: 'Status booking berhasil diperbarui',
            data: booking
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking tidak ditemukan'
            });
        }

        const isOwner = String(booking.user_id) === String(req.user.id);

        const isPetugas = req.user.role === 'petugas';

        if (!isOwner && !isPetugas) {
            return res.status(403).json({
                success: false,
                message: 'Kamu tidak memiliki akses membatalkan booking ini'
            });
        }

        if (booking.status !== 'Menunggu') {
            return res.status(400).json({
                success: false,
                message: 'Hanya booking yang menunggu yang dapat dibatalkan'
            });
        }

        booking.status = 'Dibatalkan';
        await booking.save();

        await createLog(
            req.user.id,
            'Batalkan Booking',
            booking._id
        );

        res.status(200).json({
            success: true,
            message: 'Booking berhasil dibatalkan',
            data: booking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}

const deleteLapangan = async (req, res) => {
    try {
        const bookingExists = await Booking.exists({
            lapangan_id: req.params.id,
            status: { $ne: 'Dibatalkan' }
        });

        if (bookingExists) {
            return res.status(400).json({
                success: false,
                message: 'Lapangan memiliki riwayat booking. Nonaktifkan saja'
            });
        }

        await Tarif.deleteMany({
            lapangan_id: req.params.id
        }); 

        const data = await Lapangan.findByIdAndDelete(req.paras.id);

        if (!data) {
            return res.status(400).json({
                success: true,
                message: 'Lapangan tidak ditemukan'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Lapangan berhasil dihapus'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getBookings,
    getBookingById,
    getJadwal,
    createBooking,
    updateBookingStatus,
    cancelBooking
};