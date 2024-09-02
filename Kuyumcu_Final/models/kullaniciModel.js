const { pool } = require('../config/db');

class Kullanici {
    static async create(kullaniciAdi, eposta, sifre, rol, ad, soyad, bio, profilResmi) {
        const query = `
            INSERT INTO Kullanıcılar (KullanıcıAdı, Eposta, Şifre, Rol, Ad, Soyad, Bio, ProfilResmi)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        const values = [kullaniciAdi, eposta, sifre, rol, ad, soyad, bio, profilResmi];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByEmail(eposta) {
        const query = 'SELECT * FROM Kullanıcılar WHERE Eposta = $1';
        const values = [eposta];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM Kullanıcılar WHERE ID = $1';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    static async update(id, ad, soyad, eposta, bio, profilResmi) {
        const query = `
            UPDATE Kullanıcılar
            SET Ad = $1, Soyad = $2, Eposta = $3, Bio = $4, ProfilResmi = COALESCE($5, ProfilResmi)
            WHERE ID = $6 RETURNING *;
        `;
        const values = [ad, soyad, eposta, bio, profilResmi, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
    
    
}



module.exports = Kullanici;
