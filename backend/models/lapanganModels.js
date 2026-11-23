
const mongoose = require('mongoose');

const lapanganSchema = new mongoose.Schema({
    nama: {
        type: String,
        required: true,
        trim: true
    },

    jenis_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jenis',
        required: true
    },

    gambar: {
        type: String,
        required: true
    },

    jam_buka: {
        type: String,
        required: true
    },

    jam_tutup: {
        type: String,
        required: true
    },

    jam_mulai_lampu: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['Aktif', 'Nonaktif'],
        default: 'Aktif'
    }
}, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Lapangan', lapanganSchema);
