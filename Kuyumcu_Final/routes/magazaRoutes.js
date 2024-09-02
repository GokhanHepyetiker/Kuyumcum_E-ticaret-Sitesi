const express = require('express');
const router = express.Router();
const Magaza = require('../models/magazaModel');
const { pool } = require('../config/db');


router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT m.*, k.ProfilResmi 
            FROM Mağazalar m 
            JOIN Kullanıcılar k ON m.KullanıcıID = k.ID
        `);
        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Mağazalar listelenirken bir hata oluştu', error });
    }
});

module.exports = router;
