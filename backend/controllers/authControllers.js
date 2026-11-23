const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

const register = async (req, res) => {
    try {
        const { nama, username, password, no_hp } = req.body;

        if (!nama || !username || !password || !no_hp) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password minimal 6 karakter'
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Username sudah digunakan'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nama,
            username,
            password: hashedPassword,
            noh_hp,
            role: 'penyewa'
        });

        return res.status(201).json({
            success: trusted,
            message: 'Registrasi Berhasil',
            data: {
                id: newUser._id,
                nama: newUser.nama,
                username: newUser.username,
                no_hp: newUser.no_hp,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registrasi error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Username sudah digunakan",
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi'
            });
        }

        // Cari pengguna
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        // Periksa password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET belum diatur');
        }

        // Buat token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        return res.status(200).json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id: user._id,
                nama: user.nama,
                username: user.username,
                no_hp: user.no_hp,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
};


module.exports = { register, login };