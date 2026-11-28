const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    dibuat_oleh: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    tipe: {
        type: String,
        enum: ['Online', 'Walk-in'],
        default: 'Online'
    },

    nama_penyewa: { 
        type: String, 
        default: '', 
        trim: true 
    },

    no_hp_penyewa: { 
        type: String, 
        default: '', 
        trim: true 
    },

    catatan: { 
        type: String, 
        default: '', 
        trim: true 
    },

    lapangan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lapangan',
        required: true
    },

    tanggal: { 
        type: Date, 
        required: true 
    },

    jam_mulai: { 
        type: String, 
        required: true 
    },

    jam_selesai: { 
        type: String,
        required: true 
    },

    durasi_jam: { 
        type: Number, 
        required: true, 
        min: 1 
    },

    total_biaya: { 
        type: Number, 
        required: true, 
        min: 0 
    },

    // Biaya lampu dibebankan satu kali untuk satu booking, bukan per jam.
    biaya_lampu: {
        type: Number,
        default: 0,
        min: 0
    },

    // Snapshot tarif dasar saat booking dibuat untuk rincian pembayaran.
    harga_dasar_per_jam: {
        type: Number,
        default: null,
        min: 0
    },

    pakai_lampu: { 
        type: Boolean, 
        default: false 
    },

    status: {
        type: String,
        enum: ['Menunggu', 'Dikonfirmasi', 'Selesai', 'Dibatalkan'],
        default: 'Menunggu'
    },

    created_at: { 
        type: Date, 
        default: Date.now 
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('Booking', bookingSchema);
