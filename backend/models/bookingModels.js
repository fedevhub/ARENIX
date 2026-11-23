
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

    pakai_lampu: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: [
            'Menunggu',
            'Dikonfirmasi',
            'Selesai',
            'Dibatalkan'
        ],
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
