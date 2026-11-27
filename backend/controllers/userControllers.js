const User = require('../models/userModels');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res) => {
    try {
        const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            succes: false,
            message: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Penguna tidak ditemukan'
            });
        } 

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'ID pengguna tidak valid'
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { nama, username, password, no_hp, role } = req.body;

        if (!nama || !username || !password || !no_hp || !role ) {
            return res.status(400).json({
                success: false,
                message: 'Semua field wajib diisi'
            });
        }

        if (!['admin', 'petugas', 'penyewa'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Role tidak valid'
            });
        }

        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                messagae: 'Username sudah digunakan'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            nama,
            username,
            password: hashedPassword,
            no_hp,
            role
        });

        res.status(201).json({
            success: true,
            message: 'Pengguna berhasil ditambahkan',
            data: {
                id: user._id,
                nama: user.nama,
                username: user.username,
                no_hp: user.no_hp,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.messagae
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { nama, username, password, no_hp, role } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        if (username && username !== user.username) {
            const duplicate = await User.findOne({ username });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: 'Username sudah digunakan'
                });
            }
            user.username = username;
        }

        if (nama !== undefined) user.nama = nama;
        if (no_hp !== undefined) user.no_hp = no_hp;

        if (role !== undefined) {
            if (!['admin', 'petugas', 'penyewa'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Role tidak valid'
                });
            }
            user.role = role;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Pengguna berhasil diperbarui',
            data: {
                id: user._id,
                nama: user.nama,
                username: user.username,
                no_hp: user.no_hp,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// DELETE pengguna
const deleteUser = async (req, res) => {
    try {
        if (req.params.id === String(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'Kamu tidak dapat menghapus akun sendiri'
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Pengguna berhasil dihapus'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};