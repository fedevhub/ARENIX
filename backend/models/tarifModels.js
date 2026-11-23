
const mongoose = require('mongoose');

const tarifSchema = new mongoose.Schema({
    lapangan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lapangan',
        required: true
    },

    tipe_hari: {
        type: String,
        required: true,
        enum: ['Weekday', 'Weekend']
    },

    pakai_lampu: {
        type: Boolean,
        required: true,
        default: false
    },

    harga_per_jam: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true,
    versionKey: false
});

tarifSchema.index(
    { lapangan_id: 1, tipe_hari: 1, pakai_lampu: 1 },
    { unique: true }
);

module.exports = mongoose.model('Tarif', tarifSchema);
