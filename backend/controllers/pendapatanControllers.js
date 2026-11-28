const Booking = require('../models/bookingModels')

const getPendapatan = async (req, res) => {
    try {
        const data = await Booking.find()
            .populate('penyewa_id', 'nama username')
            .populate('lapangan_id', 'nama')
            .sort({ createdAt: -1 })

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