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

const populateBooking = (query) =>
    query
        .populate('user_id', 'nama username no_hp')
        .populate('dibuat_oleh', 'nama username')
        .populate({
            path: 'lapangan_id',
            select: 'nama gambar jam_buka jam_tutup jam_mulai_lampu status jenis_id',
            populate: { path: 'jenis_id', select: 'nama' }
        });

const hitungRincian = async (booking) => {
    const lapanganId = booking.lapangan_id?._id ?? booking.lapangan_id;
    const hari = new Date(booking.tanggal).getUTCDay();
    const tipeHari = [0, 6].includes(hari) ? 'Weekend' : 'Weekday';

    let hargaDasar = booking.durasi_jam > 0
        ? booking.total_biaya / booking.durasi_jam
        : 0;
    let biayaLampu = 0;

    if (booking.pakai_lampu) {
        const tarifDasar = await Tarif.findOne({
            lapangan_id: lapanganId,
            tipe_hari: tipeHari,
            pakai_lampu: false
        });

        hargaDasar = booking.harga_dasar_per_jam
            ?? tarifDasar?.harga_per_jam
            ?? (tipeHari === 'Weekend' ? 75000 : 55000);

        // Booking baru menyimpan biaya lampu agar rincian tetap akurat
        // walaupun tarif diubah kemudian. Booking lama tetap ditampilkan
        // dengan perhitungan tarif sebelumnya.
        biayaLampu = booking.biaya_lampu ?? Math.max(
            0,
            booking.total_biaya - (hargaDasar * booking.durasi_jam)
        );
    }

    return {
        tipe_hari: tipeHari,
        harga_per_jam: hargaDasar,
        harga_dasar_per_jam: hargaDasar,
        tambahan_lampu_per_jam: biayaLampu,
        jam_lampu: booking.pakai_lampu && biayaLampu > 0 ? 1 : 0
    };
};


const getPendapatan = async (req, res) => {
  try {
    const data = await Booking.find({
      status: { $in: ["Dikonfirmasi", "Selesai"] },
    })
      .populate("user_id", "nama username no_hp")
      .populate("lapangan_id", "nama")
      .sort({ tanggal: -1, created_at: -1 })
      .lean();

    const totalPendapatan = data.reduce(
      (total, item) => total + Number(item.total_biaya || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      jumlah: data.length,
      totalPendapatan,
      data,
    });
  } catch (error) {
    console.error("GAGAL MENGAMBIL PENDAPATAN:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Mengambil ringkasan untuk empat kartu pendapatan
const getPendapatanRingkasan = async (req, res) => {
  try {
    const [totalBooking, bookingSelesai, bookingDibatalkan, dataPendapatan] =
      await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: "Selesai" }),
        Booking.countDocuments({ status: "Dibatalkan" }),
        Booking.find({
          status: { $in: ["Dikonfirmasi", "Selesai"] },
        })
          .select("total_biaya")
          .lean(),
      ]);

    const totalPendapatan = dataPendapatan.reduce(
      (total, item) => total + Number(item.total_biaya || 0),
      0,
    );

    return res.status(200).json({
      success: true,
      data: {
        total_pendapatan: totalPendapatan,
        total_booking: totalBooking,
        booking_selesai: bookingSelesai,
        booking_dibatalkan: bookingDibatalkan,
      },
    });
  } catch (error) {
    console.error("GAGAL MENGAMBIL RINGKASAN PENDAPATAN:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
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

        if (req.query.lapangan_id) {
            filter.lapangan_id = req.query.lapangan_id;
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

        const data = await populateBooking(
            Booking.find(filter).sort({
                tanggal: -1,
                jam_mulai: 1,
                created_at: -1
            })
        );

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
        const booking = await populateBooking(
            Booking.findById(req.params.id)
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking tidak ditemukan'
            });
        }

        if (
            req.user.role === 'penyewa' &&
            String(booking.user_id?._id) !== String(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: 'Kamu tidak dapat melihat booking pengguna lain'
            });
        }

        const riwayat = await AuditLog.find({ booking_id: booking._id })
            .populate('user_id', 'nama role')
            .sort({ waktu: 1 });

        const rincian = await hitungRincian(booking);

        res.status(200).json({
            success: true,
            data: {
                ...booking.toObject(),
                riwayat,
                rincian
            }
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

        if (!lapangan_id || !tanggal) {
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

const getJadwalSemua = async (req, res) => {
    try {
        const info = getDateInfo(req.query.tanggal);

        if (!info) {
            return res.status(400).json({
                success: false,
                message: 'Format tanggal harus YYYY-MM-DD'
            });
        }

        const data = await Booking.find({
            tanggal: info.date,
            status: { $ne: 'Dibatalkan' }
        }).select('lapangan_id jam_mulai jam_selesai status');

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createBooking = async (req, res) => {
    try {
        const {
            lapangan_id,
            tanggal,
            jam_mulai,
            jam_selesai,
            pakai_lampu,
            nama_penyewa,
            no_hp_penyewa,
            catatan
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

        let userId = null;
        let dibuatOleh = null;
        let tipe = 'Online';
        let namaPenyewa = '';
        let noHpPenyewa = '';

        if (req.user.role === 'petugas') {
            namaPenyewa = String(nama_penyewa || '').trim();
            noHpPenyewa = String(no_hp_penyewa || '').trim();

            if (!namaPenyewa || !noHpPenyewa) {
                return res.status(400).json({
                    success: false,
                    message: 'Nama dan nomor telepon penyewa wajib diisi'
                });
            }

            tipe = 'Walk-in';
            dibuatOleh = req.user.id;
        } else if (req.user.role === 'penyewa') {
            const akun = await User.findById(req.user.id);

            if (!akun || akun.role !== 'penyewa') {
                return res.status(404).json({
                    success: false,
                    message: 'Data penyewa tidak ditemukan'
                });
            }

            userId = akun._id;
            namaPenyewa = akun.nama;
            noHpPenyewa = akun.no_hp;
        } else {
            return res.status(403).json({
                success: false,
                message: 'Role tidak diizinkan membuat booking'
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

        const tarifDasar = await Tarif.findOne({
            lapangan_id,
            tipe_hari: tipeHari,
            pakai_lampu: false
        });

        const hargaDasar = tarifDasar?.harga_per_jam
            ?? (tipeHari === 'Weekend' ? 75000 : 55000);

        let biayaLampu = 0;
        if (pakai_lampu) {
            const tarifLampu = await Tarif.findOne({
                lapangan_id,
                tipe_hari: tipeHari,
                pakai_lampu: true
            });

            // Tarif lampu tersimpan sebagai tarif per jam lama; selisihnya
            // dipakai sebagai biaya lampu satu kali per booking.
            biayaLampu = Math.max(
                0,
                (tarifLampu?.harga_per_jam ?? hargaDasar + 15000) - hargaDasar
            );
        }

        const totalBiaya = (hargaDasar * durasi) + biayaLampu;

        const booking = await Booking.create({
            user_id: userId,
            dibuat_oleh: dibuatOleh,
            tipe,
            nama_penyewa: namaPenyewa,
            no_hp_penyewa: noHpPenyewa,
            catatan: String(catatan || '').trim().slice(0, 300),
            lapangan_id,
            tanggal: info.date,
            jam_mulai,
            jam_selesai,
            durasi_jam: durasi,
            total_biaya: totalBiaya,
            biaya_lampu: biayaLampu,
            harga_dasar_per_jam: hargaDasar,
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
                message: 'Hanya petugas yang dapat mengubah status booking'
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
        await booking.save();

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

        const isOwner = Boolean(booking.user_id) &&
            String(booking.user_id) === String(req.user.id);

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
};

module.exports = {
    getBookings,
    getBookingById,
    getJadwal,
    getJadwalSemua,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    getPendapatan,
    getPendapatanRingkasan
};
