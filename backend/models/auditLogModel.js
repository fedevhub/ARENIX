
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    aksi: {
        type: String,
        required: true,
        enum: [
            'Tambah Booking',
            'Konfirmasi Pembayaran',
            'Batalkan Booking',
            'Selesaikan Booking',
            'Tambah Lapangan',
            'Edit Lapangan',
            'Hapus Lapangan',
            'Tambah Tarif',
            'Edit Tarif',
            'Hapus Tarif',
            'Tambah User',
            'Edit User',
            'Hapus User'
        ]
    },

    booking_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },

    waktu: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
