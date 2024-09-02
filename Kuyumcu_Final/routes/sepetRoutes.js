const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const { pool } = require('../config/db');


router.get('/', authenticateToken, async (req, res) => {
    try {
        const kullaniciID = req.user.id;
        const result = await pool.query(`
            SELECT su.*, u.Ad, u.ResimURL, su.Miktar * su.BirimFiyatı AS ToplamFiyat
            FROM SepetÜrünleri su 
            JOIN Sepetler s ON su.SepetID = s.ID 
            JOIN Ürünler u ON su.ÜrünID = u.ID 
            WHERE s.KullanıcıID = $1
        `, [kullaniciID]);

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sepet ürünleri alınırken bir hata oluştu', error });
    }
});


router.delete('/:urunID', authenticateToken, async (req, res) => {
    try {
        const { urunID } = req.params;
        const kullaniciID = req.user.id;

        const result = await pool.query(`
            DELETE FROM SepetÜrünleri 
            WHERE ÜrünID = $1 AND SepetID = (SELECT ID FROM Sepetler WHERE KullanıcıID = $2)
        `, [urunID, kullaniciID]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ürün sepetinizde bulunamadı' });
        }

        res.status(200).json({ message: 'Ürün sepetten silindi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürün sepetten silinirken bir hata oluştu', error });
    }
});


router.post('/ekle', authenticateToken, async (req, res) => {
    try {
        const { urunID, miktar, birimFiyati } = req.body;
        const kullaniciID = req.user.id;

        
        let sepetResult = await pool.query(`
            SELECT ID FROM Sepetler WHERE KullanıcıID = $1
        `, [kullaniciID]);

        let sepetID;
        if (sepetResult.rows.length === 0) {
            sepetResult = await pool.query(`
                INSERT INTO Sepetler (KullanıcıID) VALUES ($1) RETURNING ID
            `, [kullaniciID]);
            sepetID = sepetResult.rows[0].id;
        } else {
            sepetID = sepetResult.rows[0].id;
        }

        
        await pool.query(`
            INSERT INTO SepetÜrünleri (SepetID, ÜrünID, Miktar, BirimFiyatı) 
            VALUES ($1, $2, $3, $4)
        `, [sepetID, urunID, miktar, birimFiyati]);

        res.status(200).json({ message: 'Ürün sepete eklendi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürün sepete eklenirken bir hata oluştu', error });
    }
});

module.exports = router;
