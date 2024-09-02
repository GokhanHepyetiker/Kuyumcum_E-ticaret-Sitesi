const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');


router.get('/:magazaId', async (req, res) => {
    try {
        const { magazaId } = req.params;
        const result = await pool.query('SELECT * FROM Ürünler WHERE MağazaID = $1', [magazaId]);
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürünler listelenirken bir hata oluştu', error });
    }
});

router.get('/kategori/:kategori', async (req, res) => {
    try {
        const { kategori } = req.params;
        let result;

        if (kategori === 'son-cikanlar') {
            result = await pool.query('SELECT * FROM Ürünler ORDER BY ID DESC LIMIT 10');
        } else if (kategori === 'populerler') {
            result = await pool.query(`
                SELECT Ürünler.*, COUNT(Yorumlar.ID) AS yorum_sayisi 
                FROM Ürünler 
                LEFT JOIN Yorumlar ON Ürünler.ID = Yorumlar.ÜrünID 
                GROUP BY Ürünler.ID 
                ORDER BY yorum_sayisi DESC 
                LIMIT 10
            `);
        } else if (kategori === 'en-cok-satanlar') {
            result = await pool.query(`
                SELECT Ürünler.*, COUNT(SiparişÜrünleri.ID) AS satis_sayisi 
                FROM Ürünler 
                LEFT JOIN SiparişÜrünleri ON Ürünler.ID = SiparişÜrünleri.ÜrünID 
                GROUP BY Ürünler.ID 
                ORDER BY satis_sayisi DESC 
                LIMIT 10
            `);
        } else if (kategori === 'on-siparis') {
            result = await pool.query('SELECT * FROM Ürünler ORDER BY ID DESC LIMIT 5');
        } else {
            return res.status(400).json({ message: 'Geçersiz kategori' });
        }
        

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürünler listelenirken bir hata oluştu', error });
    }
});

router.get('/detay/:urunId', async (req, res) => {
    try {
        const { urunId } = req.params;

        const urunResult = await pool.query(`
            SELECT u.*, m.MağazaAdı, m.KullanıcıID as magazaKullaniciID, k.ProfilResmi as magazaProfilResmi
            FROM Ürünler u
            JOIN Mağazalar m ON u.MağazaID = m.ID
            JOIN Kullanıcılar k ON m.KullanıcıID = k.ID
            WHERE u.ID = $1
        `, [urunId]);

        const yorumResult = await pool.query(`
            SELECT y.*, k.KullanıcıAdı, k.ProfilResmi
            FROM Yorumlar y
            JOIN Kullanıcılar k ON y.KullanıcıID = k.ID
            WHERE y.ÜrünID = $1
            ORDER BY y.YorumTarihi DESC
        `, [urunId]);

        if (urunResult.rows.length === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }

        res.status(200).json({
            urun: urunResult.rows[0],
            yorumlar: yorumResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürün detayları alınırken bir hata oluştu', error });
    }
});


module.exports = router;


module.exports = router;
