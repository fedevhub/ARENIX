
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const connectDB = require('./config/connectDb');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jenisRoutes = require('./routes/jenisRoutes');
const lapanganRoutes = require('./routes/lapanganRoutes');
const tarifRoutes = require('./routes/tarifRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FILES - HARUS SEBELUM ROUTE 404
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Halaman utama
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Arenix Backend API berhasil dijalankan'
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jenis', jenisRoutes);
app.use('/api/lapangan', lapanganRoutes);
app.use('/api/tarif', tarifRoutes);
app.use('/api/booking', bookingRoutes);

// Error 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Terjadi kesalahan pada server'
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Arenix Backend berjalan di port ${PORT}`);
        });
    } catch (error) {
        console.error('Gagal menjalankan server:', error.message);
        process.exit(1);
    }
};

startServer();
