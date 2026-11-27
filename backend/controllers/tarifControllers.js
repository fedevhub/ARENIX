const mongoose = require('mongoose')
const Lapangan = require('../models/lapanganModels')
const Tarif = require('../models/tarifModels')

const getTarif = async (req, res) => {
    try {
        const data = await Tarif.find()
            .populate('lapangan_id', 'nama')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            data,
        })
    } catch (error) {
        console.error('Get tarif error:', error)

        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

const getTarifById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID tarif tidak valid',
            })
        }

        const data = await Tarif.findById(id)
            .populate('lapangan_id', 'nama')

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Tarif tidak ditemukan',
            })
        }

        return res.status(200).json({
            success: true,
            data,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

const createTarif = async (req, res) => {
    try {
        const {
            lapangan_id,
            tipe_hari,
            pakai_lampu,
            harga_per_jam,
        } = req.body

        if (
            !lapangan_id ||
            !tipe_hari ||
            pakai_lampu === undefined ||
            pakai_lampu === null ||
            harga_per_jam === undefined ||
            harga_per_jam === null ||
            harga_per_jam === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Data tarif belum lengkap',
            })
        }

        if (!mongoose.Types.ObjectId.isValid(lapangan_id)) {
            return res.status(400).json({
                success: false,
                message: 'ID lapangan tidak valid',
            })
        }

        if (!['Weekday', 'Weekend'].includes(tipe_hari)) {
            return res.status(400).json({
                success: false,
                message: 'Tipe hari tidak valid',
            })
        }

        if (
            typeof pakai_lampu !== 'boolean' ||
            !Number.isFinite(Number(harga_per_jam)) ||
            Number(harga_per_jam) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Data lampu atau harga tidak valid',
            })
        }

        const lapangan = await Lapangan.findById(lapangan_id)

        if (!lapangan) {
            return res.status(404).json({
                success: false,
                message: 'Lapangan tidak ditemukan',
            })
        }

        const existing = await Tarif.findOne({
            lapangan_id,
            tipe_hari,
            pakai_lampu,
        })

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Tarif kombinasi tersebut sudah tersedia',
            })
        }

        const data = await Tarif.create({
            lapangan_id,
            tipe_hari,
            pakai_lampu,
            harga_per_jam: Number(harga_per_jam),
        })

        const hasil = await Tarif.findById(data._id)
            .populate('lapangan_id', 'nama')

        return res.status(201).json({
            success: true,
            message: 'Tarif berhasil ditambahkan',
            data: hasil,
        })
    } catch (error) {
        console.error('Create tarif error:', error)

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Tarif tersebut sudah tersedia',
            })
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

const updateTarif = async (req, res) => {
    try {
        const { id } = req.params

        const {
            lapangan_id,
            tipe_hari,
            pakai_lampu,
            harga_per_jam,
        } = req.body

        console.log('ID tarif yang diedit:', id)
        console.log('Data update tarif:', req.body)

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID tarif tidak valid',
            })
        }

        if (
            !lapangan_id ||
            !tipe_hari ||
            pakai_lampu === undefined ||
            pakai_lampu === null ||
            harga_per_jam === undefined ||
            harga_per_jam === null ||
            harga_per_jam === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Data tarif belum lengkap',
            })
        }

        if (!mongoose.Types.ObjectId.isValid(lapangan_id)) {
            return res.status(400).json({
                success: false,
                message: 'ID lapangan tidak valid',
            })
        }

        if (!['Weekday', 'Weekend'].includes(tipe_hari)) {
            return res.status(400).json({
                success: false,
                message: 'Tipe hari tidak valid',
            })
        }

        if (
            typeof pakai_lampu !== 'boolean' ||
            !Number.isFinite(Number(harga_per_jam)) ||
            Number(harga_per_jam) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: 'Data lampu atau harga tidak valid',
            })
        }

        const tarif = await Tarif.findById(id)

        if (!tarif) {
            return res.status(404).json({
                success: false,
                message: 'Data tarif tidak ditemukan',
            })
        }

        const lapangan = await Lapangan.findById(lapangan_id)

        if (!lapangan) {
            return res.status(404).json({
                success: false,
                message: 'Lapangan tidak ditemukan',
            })
        }

        // Cek kombinasi tarif lain, kecuali data yang sedang diedit
        const existing = await Tarif.findOne({
            _id: { $ne: id },
            lapangan_id,
            tipe_hari,
            pakai_lampu,
        })

        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Kombinasi tarif tersebut sudah digunakan',
            })
        }

        tarif.lapangan_id = lapangan_id
        tarif.tipe_hari = tipe_hari
        tarif.pakai_lampu = pakai_lampu
        tarif.harga_per_jam = Number(harga_per_jam)

        await tarif.save()

        const hasil = await Tarif.findById(id)
            .populate('lapangan_id', 'nama')

        return res.status(200).json({
            success: true,
            message: 'Tarif berhasil diperbarui',
            data: hasil,
        })
    } catch (error) {
        console.error('Update tarif error:', error)

        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

const deleteTarif = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID tarif tidak valid',
            })
        }

        const data = await Tarif.findByIdAndDelete(id)

        if (!data) {
            return res.status(404).json({
                success: false,
                message: 'Tarif tidak ditemukan',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Tarif berhasil dihapus',
        })
    } catch (error) {
        console.error('Delete tarif error:', error)

        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports = {
    getTarif,
    getTarifById,
    createTarif,
    updateTarif,
    deleteTarif,
}
