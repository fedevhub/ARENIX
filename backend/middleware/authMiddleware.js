const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan. Silakan login.'
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id)
            .select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        req.user = {
            id: user._id,
            nama: user.nama,
            username: user.username,
            no_hp: user.no_hp,
            role: user.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid atau sudah kedaluwarsa'
        });
    }
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Silakan login terlebih dahulu'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Kamu tidak memiliki akses ke fitur ini'
            });
        }

        next();
    };
};

module.exports = authMiddleware;
module.exports.authorizeRole = authorizeRole;
