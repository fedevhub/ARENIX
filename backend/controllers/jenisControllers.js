const Jenis = require('../models/jenisModels');

const getJenis = async (req, res) => {
    try {
        const data = await Jenis.find().sort({ nama: 1 });

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

const getJenisById = async (req, res) => {
    try {
        const data = await Jenis.findById(req.params.id);

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
            message: 'ID jenis tidak valid'
        });
    }
};

const createJenis = async (req, res) => {
    try {
        const { nama } = req.body;

        if (!nama || !nama.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nama jenis wajib diisi'
            });
        }

        const existing = await Jenis.findOne({
            nama: nama.trim()
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Jenis lapangan sudah tersedia'
            });
        }
        
        const data = await Jenis.create({
            nama: nama.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Jenis lapangan berhasil ditambahkan',
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateJenis = async (req, res) => {
    try {
        const { nama } = req.body;

        if (!nama || !nama.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Nama jenis wajib diisi'
            });
        }

        const duplicate = await Jenis.findOne({
            nama: nama.trim(),
            _id: { $ne: req.params.id }
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                message: 'Nama sudah digunakan'
            });
        }

        const data = await Jenis.findByIdAndUpdate(
            req.params.id,
            { nama: nama.trim() },
            { new: true, runValidators: true }
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Jenis lapangan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Jenis lapangan berhasil di perbarui',
            data
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteJenis = async (req, res) => {
    try {
        const used = await Jenis.exists({
            jenis_id: req.params.id
        });

        if (used) {
            return res.status(400).json({
                success: false,
                message: 'Jenis masih digunakan oleh lapangan'
            });
        }

        const data = await Jenis.findByIdAndDelete(req.params.id);

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Jenis lapangan tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Jenis lapangan berhasil dihapus'
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getJenis,
    getJenisById,
    createJenis,
    updateJenis,
    deleteJenis
};