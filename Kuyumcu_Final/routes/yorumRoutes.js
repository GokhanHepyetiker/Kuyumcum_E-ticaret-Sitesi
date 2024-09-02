const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const { pool } = require('../config/db');


router.post('/ekle', authenticateToken, async (req, res) => {
    try {
        const { urunID, yorum } = req.body;
        const kullaniciID = req.user.id;

        await pool.query(`
            INSERT INTO Yorumlar (ÜrünID, KullanıcıID, Yorum) 
            VALUES ($1, $2, $3)
        `, [urunID, kullaniciID, yorum]);

        res.status(200).json({ message: 'Yorum eklendi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Yorum eklenirken bir hata oluştu', error });
    }
});

module.exports = router;
