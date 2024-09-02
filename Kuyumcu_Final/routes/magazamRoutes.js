const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/auth');
const { pool } = require('../config/db');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


router.get('/', authenticateToken, async (req, res) => {
    try {
        const kullaniciID = req.user.id;
        const result = await pool.query(`
            SELECT u.*
            FROM Ürünler u
            JOIN Mağazalar m ON u.MağazaID = m.ID
            WHERE m.KullanıcıID = $1
        `, [kullaniciID]);

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürünler alınırken bir hata oluştu', error });
    }
});


router.post('/ekle', authenticateToken, upload.single('resim'), async (req, res) => {
    try {
        const { ad, aciklama, fiyat, stokmiktari, kategori } = req.body;
        const kullaniciID = req.user.id;
        const resimurl = req.file ? `/images/${req.file.filename}` : null;

        const magazaResult = await pool.query(`
            SELECT ID FROM Mağazalar WHERE KullanıcıID = $1
        `, [kullaniciID]);

        if (magazaResult.rows.length === 0) {
            return res.status(404).json({ message: 'Mağaza bulunamadı' });
        }

        const magazaID = magazaResult.rows[0].id;

        
        let kategoriID;
        const kategoriResult = await pool.query(`
            SELECT ID FROM Kategoriler WHERE KategoriAdı = $1
        `, [kategori]);

        if (kategoriResult.rows.length > 0) {
            kategoriID = kategoriResult.rows[0].id;
        } else {
            const yeniKategoriResult = await pool.query(`
                INSERT INTO Kategoriler (KategoriAdı) VALUES ($1) RETURNING ID
            `, [kategori]);
            kategoriID = yeniKategoriResult.rows[0].id;
        }

        await pool.query(`
            INSERT INTO Ürünler (MağazaID, Ad, Açıklama, Fiyat, ResimURL, StokMiktari, KategoriID)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [magazaID, ad, aciklama, fiyat, resimurl, stokmiktari, kategoriID]);

        res.status(200).json({ message: 'Ürün eklendi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürün eklenirken bir hata oluştu', error });
    }
});


router.delete('/:urunID', authenticateToken, async (req, res) => {
    try {
        const { urunID } = req.params;
        const kullaniciID = req.user.id;

        const result = await pool.query(`
            DELETE FROM Ürünler
            WHERE ID = $1 AND MağazaID = (SELECT ID FROM Mağazalar WHERE KullanıcıID = $2)
        `, [urunID, kullaniciID]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Ürün bulunamadı' });
        }

        res.status(200).json({ message: 'Ürün silindi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ürün silinirken bir hata oluştu', error });
    }
});

module.exports = router;
