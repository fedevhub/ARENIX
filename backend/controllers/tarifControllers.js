const Lapangan = require('../models/lapanganModels');
const Tarif = require('../models/tarifModels');

const getTarif = async (req, res) => {
    try {
        const data = await Tarif.find()
            .populate('lapangan_id', 'nama')
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

const getTarifById = async (req, res) => {
    try {
        const data = await Tarif.findById(req.params.id)
            .populate('lapangan_id', 'nama');

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Tarif tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'ID tarif tidak valid'
        });
    }
};

const createTarif = async (req, res) => {
    try {
        const { 
            lapangan_id,
            tipe_hari,
            pakai_lampu,
            harga_per_jam
        } = req.body;

        if (!lapangan_id || !tipe_hari || typeof pakai_lampu !== 'boolean' || !harga_per_jam === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Data tarif belum lengkap'
            });
        }

        if (!['Weekday', 'Weekend'].includes(tipe_hari)) {
            return res.status(400).json({
                success: false,
                message: 'Tipe hari tidak valid'
            });
        }

        if (!Number.isFinite(Number(harga_per_jam)) || Number(harga_per_jam) < 0) {
            return res.status(400).json({
                success: false,
                message: 'Harga per jam tidak valid'
            });
        }

        const lapangan = await Lapangan.findById(lapangan_id);

        if (!lapangan) {
            return res.status(404).json({
                success: false,
                message: 'Lapangan tidak ditemukan'
            });
        }

        const existing = await Tarif.findOne({
            lapangan_id,
            tipe_hari,
            pakai_lampu
        });

        if (existing) {
            return res.status(409)({
                success: false,
                message: 'Tarif kombinasi tersebut sudah tersedia'
            });
        }

        const data = await Tarif.create({
            lapangan_id,
            tipe_hari,
            pakai_lampu,
            harga_per_jam: Number(harga_per_jam)
        });

        res.status(201).json({
            success: true,
            message: 'Tarif berhasil ditambahkan',
            data
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Tarif tersebut sudah tersedia'
            });
        }

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const updateTarif = async (req, res) => {
    try {
        const { 
            lapangan_id,
            tipe_hari,
            pakai_lampu,
            harga_per_jam
        } = req.body;

        const tarif = await Tarif.findById(req.params.id);

        if (tarif) {
            return res.status(404).json({
                success: false,
                message: 'Tarif tidak ditemukan'
            });
        }

        const newLapanganId = lapangan_id || tarif.lapangan_id;
        const newTipeHari = tipe_hari || tarif.tipe_hari;
        const newLampu = pakai_lampu === undefined
            ? tarif.pakai_lampu
            : pakai_lampu;

        if (!['Weekday', 'Weekend'].includes(newTipeHari)) {
            return res.status(400).json({
                success: false,
                message: 'Tipe hari tidak valid'
            });
        }

        if (typeof newLampu !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Pilihan lampu tidak valid'
            });
        }

        if (lapangan_id && !(await Lapangan.exists({ _id: lapangan_id }))) {
            return res.status(404).json({
                success: false,
                message: 'Lapangan tidak ditemukan'
            });
        }

        if (harga_per_jam !== undefined &&
            (!Number.isFinite(Number(harga_per_jam)) || Number(harga_per_jam) < 0)) {
            return res.status(400).json({
                success: false,
                message: 'Harga tidak valid'
            });
        }

        const duplicate = await Tarif.findOne({
            _id: { $ne: tarif._id },
            lapangan_id: newLapanganId,
            tipe_hari: newTipeHari,
            pakai_lampu: newLampu
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'Kombinasi tarif sudah digunakan'
            });
        }

        tarif.lapangan_id = newLapanganId;
        tarif.tipe_hari = newTipeHari;
        tarif.pakai_lampu = newLampu;

        if (harga_per_jam !== undefined) {
            tarif.harga_per_jam = Number(harga_per_jam);
        }

        await tarif.save();

        res.status(200).json({
            success: true,
            message: 'Tarif berhasil diperbarui',
            data: tarif
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteTarif = async (req, res) => {
    try {
        const data = await Tarif.findByIdAndDelete(req.params.id);

        if (data) {
            return res.status(400).json({
                success: false,
                message: 'Tarif tidak ditemukan'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Tarif berhasil dihapus'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTarif,
    getTarifById,
    createTarif,
    updateTarif,
    deleteTarif
};