const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const setupPool = new Pool({
  user:  'postgres',
  host: 'localhost',
  password:  'postgres',
  port:  5432,
});

const pool = new Pool({
  user:  'postgres',
  host: 'localhost',
  database:  'kuyumcu',
  password:  'postgres',
  port:  5432,
});

const veritabaniKontrolVeOlustur = async () => {
  try {
    const res = await setupPool.query("SELECT 1 FROM pg_database WHERE datname='kuyumcu'");
    if (res.rowCount === 0) {
      await setupPool.query('CREATE DATABASE kuyumcu');
      console.log('Kuyumcu veritabanı başarıyla oluşturuldu.');
    } else {
      console.log('Kuyumcu veritabanı zaten mevcut.');
    }
  } catch (error) {
    console.error('Veritabanı kontrolü sırasında hata oluştu:', error);
  }
};

module.exports = {
  pool,
  veritabaniKontrolVeOlustur
};
