const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const { pool } = require('../config/db');


router.post('/olustur', authenticateToken, async (req, res) => {
    try {
        const kullaniciID = req.user.id;
        const { kartNumarasi, sonKullanmaTarihi, cvv } = req.body;

        
        const sepetResult = await pool.query(`
            SELECT su.*, u.Fiyat 
            FROM SepetÜrünleri su 
            JOIN Sepetler s ON su.SepetID = s.ID 
            JOIN Ürünler u ON su.ÜrünID = u.ID 
            WHERE s.KullanıcıID = $1
        `, [kullaniciID]);

        const sepetUrunler = sepetResult.rows;

        if (sepetUrunler.length === 0) {
            return res.status(400).json({ message: 'Sepetinizde ürün bulunmamaktadır' });
        }

        
        const toplamFiyat = sepetUrunler.reduce((total, urun) => total + (urun.fiyat * urun.miktar), 0);

        
        const siparisResult = await pool.query(`
            INSERT INTO Siparişler (KullanıcıID, ToplamFiyat, Durum) 
            VALUES ($1, $2, 'Hazırlanıyor') RETURNING ID
        `, [kullaniciID, toplamFiyat]);

        const siparisID = siparisResult.rows[0].id;

        
        for (const urun of sepetUrunler) {
            await pool.query(`
                INSERT INTO SiparişÜrünleri (SiparişID, ÜrünID, Miktar, BirimFiyatı) 
                VALUES ($1, $2, $3, $4)
            `, [siparisID, urun.Ürünid, urun.miktar, urun.fiyat]);
        }

        
        await pool.query(`
            DELETE FROM SepetÜrünleri WHERE SepetID = (SELECT ID FROM Sepetler WHERE KullanıcıID = $1)
        `, [kullaniciID]);

        res.status(200).json({ message: 'Sipariş oluşturuldu' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Sipariş oluşturulurken bir hata oluştu', error });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const kullaniciID = req.user.id;

        const siparisResult = await pool.query(`
            SELECT * FROM Siparişler WHERE KullanıcıID = $1 ORDER BY SiparişTarihi DESC
        `, [kullaniciID]);

        const siparisler = siparisResult.rows;

        for (const siparis of siparisler) {
            const urunResult = await pool.query(`
                SELECT su.*, u.Ad, u.ResimURL 
                FROM SiparişÜrünleri su 
                JOIN Ürünler u ON su.ÜrünID = u.ID 
                WHERE su.SiparişID = $1
            `, [siparis.id]);

            siparis.urunler = urunResult.rows;
        }

        res.status(200).json({ data: siparisler });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Siparişler alınırken bir hata oluştu', error });
    }
});


module.exports = router;
