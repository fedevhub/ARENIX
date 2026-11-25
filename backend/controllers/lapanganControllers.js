const Lapangan = require('../models/lapanganModels');
const Jenis = require('../models/jenisModels');
const Booking = require('../models/bookingModels');
const Tarif = require('../models/tarifModels');

const getLapangan = async (req, res) => {
    try {
        const data = await Lapangan.find()
            .populate('jenis_id', 'nama')
            .sort({ createdAt: -1 });
        
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

const getLapanganById = async (req, res) => {
    try {
        const data = await Jenis.findById(req.params.id)
            .populate('jenis_id', 'nama');

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Jenis lapangan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'ID lapangan tidak valid'
        });
    }
};

const createLapangan = async (req, res) => {
    try {
        const { 
            nama,
            jenis_id,
            gambar,
            jam_buka,
            jam_tutup,
            jam_mulai_lampu,
            status
        } = req.body;

        if (!nama || !jenis_id || !gambar || !jam_buka || !jam_tutup || !jam_mulai_lampu) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        const data = await Lapangan.create({
            nama,
            jenis_id,
            gambar,
            jam_buka,
            jam_tutup,
            jam_mulai_lampu,
            status: status || 'Aktif'
        });

        res.status(201).json({
            success: true,
            message: 'Lapangan berhasil ditambahkan',
            data
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateLapangan = async (req, res) => {
    try {
        const { 
            nama,
            jenis_id,
            gambar,
            jam_buka,
            jam_tutup,
            jam_mulai_lampu,
            status
        } = req.body;

        if (jenis_id) {
            const jenis = await Jenis.findById(jenis_id);

            if (!jenis) {
                return res.status(404).json({
                    success: false,
                    message: 'Jenis lapangan tidak ditemukan'
                });
            }
        }

        const data = await Lapangan.findByIdAndUpdate(
            req.params.id,
            {
                ...(nama !== undefined && { nama }),
                ...(jenis_id !== undefined && { jenis_id }),
                ...(gambar !== undefined && { gambar }),
                ...(jam_buka !== undefined && { jam_buka }),
                ...(jam_tutup !== undefined && { jam_tutup }),
                ...(jam_mulai_lampu !== undefined && { jam_mulai_lampu }),
                ...(status !== undefined && { status })
            },
            {
                new: true,
                validators: true
            }
        ).populate('jenis_id', 'nama');

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Lapangan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lapangan berhasil di perbarui',
            data
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

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
    getLapangan,
    getLapanganById,
    createLapangan,
    updateLapangan,
    deleteLapangan
};