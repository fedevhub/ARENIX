require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModels');

// Ganti dulu sebelum dijalankan
const ADMIN = {
    nama: 'Budi Santoso',
    username: 'admin123',
    password: '123456',
    no_hp: '081234567890',
};

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const exists = await User.findOne({ username: ADMIN.username });
        if (exists) {
            console.log(`Username "${ADMIN.username}" sudah ada (role: ${exists.role}).`);
            return;
        }

        await User.create({
            ...ADMIN,
            password: await bcrypt.hash(ADMIN.password, 10),
            role: 'admin',
        });
        console.log(`Admin "${ADMIN.username}" berhasil dibuat.`);
    } catch (err) {
        console.error('Gagal:', err.message);
    } finally {
        await mongoose.disconnect();
    }
})();