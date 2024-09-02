const express = require('express');
const router = express.Router();
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Kullanici = require('../models/kullaniciModel');
const Magaza = require('../models/magazaModel');
const authenticateToken = require('../middlewares/auth');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

router.post('/register', upload.single('profilResmi'), async (req, res) => {
    try {
        const { kullaniciAdi, eposta, sifre, kullaniciTipi, ad, soyad, bio } = req.body;
        const hashedPassword = await bcrypt.hash(sifre, 10);
        const profilResmi = req.file ? `/images/${req.file.filename}` : null;

        const yeniKullanici = await Kullanici.create(
            kullaniciAdi, eposta, hashedPassword, kullaniciTipi, ad, soyad, bio, profilResmi
        );

        if (kullaniciTipi === 'Magaza') {
            const magazaAdi = `${kullaniciAdi} Mağazası`;
            const yeniMagaza = await Magaza.create(yeniKullanici.id, magazaAdi, '', '');
            yeniKullanici.magaza = yeniMagaza;
        }

        res.status(201).json({ message: 'Kayıt başarılı', data: yeniKullanici });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Kayıt sırasında bir hata oluştu', error });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { eposta, sifre } = req.body;
        const kullanici = await Kullanici.findByEmail(eposta);
        if (!kullanici) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
        }
        console.log(kullanici);
        const isMatch = await bcrypt.compare(sifre, kullanici.Şifre);
        if (!isMatch) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre' });
        }

        const token = jwt.sign({
            user:kullanici
        }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ message: 'Giriş başarılı', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Giriş sırasında bir hata oluştu', error });
    }
});

router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Çıkış başarılı' });
});

router.get('/profil', authenticateToken, async (req, res) => {
    try {
        console.log(req.user.id);  
        const kullanici = await Kullanici.findById(req.user.id);
        if (!kullanici) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.status(200).json({ data: kullanici });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Profil bilgileri alınırken bir hata oluştu', error });
    }
});

router.put('/profil', authenticateToken, upload.single('profile-picture'), async (req, res) => {
    try {
        const { ad, soyad, email, bio } = req.body;
        const profilResmi = req.file ? `/images/${req.file.filename}` : null;
        console.log(ad,soyad,email,bio);
        const updatedUser = await Kullanici.update(req.user.id, ad, soyad, email, bio, profilResmi);

        res.status(200).json({ message: 'Profil başarıyla güncellendi', data: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu', error });
    }
});

module.exports = router;
