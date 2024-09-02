const { pool } = require('../config/db');

class Magaza {
    static async create(kullaniciID, magazaAdi, adres, telefon) {
        const query = `
            INSERT INTO Mağazalar (KullanıcıID, MağazaAdı, Adres, Telefon)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const values = [kullaniciID, magazaAdi, adres, telefon];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
}

module.exports = Magaza;
