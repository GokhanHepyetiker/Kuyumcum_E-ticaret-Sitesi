const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const kullaniciRoutes = require('./routes/kullaniciRoutes');
const magazaRoutes = require('./routes/magazaRoutes');
const dotenv = require('dotenv');
const { pool, veritabaniKontrolVeOlustur } = require('./config/db');
const urunRoutes = require('./routes/urunRoutes');
const sepetRoutes = require('./routes/sepetRoutes');
const yorumRoutes = require('./routes/yorumRoutes');
const siparisRoutes = require('./routes/siparisRoutes');
const magazamRoutes = require('./routes/magazamRoutes');
const path = require('path');

dotenv.config();

const app = express();

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/kullanicilar', kullaniciRoutes);
app.use('/api/magazalar', magazaRoutes);
app.use('/api/urunler', urunRoutes);
app.use('/api/sepet', sepetRoutes);
app.use('/api/yorumlar', yorumRoutes);
app.use('/api/siparisler', siparisRoutes);
app.use('/api/magazam', magazamRoutes);

const PORT = 3000;

async function tablolariOlustur() {
  const sorgular = [
    `
    CREATE TABLE IF NOT EXISTS Kullanıcılar (
      ID SERIAL PRIMARY KEY,
      KullanıcıAdı VARCHAR(50) UNIQUE NOT NULL,
      Eposta VARCHAR(50) UNIQUE NOT NULL,
      Şifre VARCHAR(255) NOT NULL,
      Rol VARCHAR(10) NOT NULL CHECK (Rol IN ('Musteri', 'Magaza')),
      Ad VARCHAR(50),
      Soyad VARCHAR(50),
      Bio TEXT,
      ProfilResmi TEXT
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS Mağazalar (
      ID SERIAL PRIMARY KEY,
      KullanıcıID INTEGER REFERENCES Kullanıcılar(ID) ON DELETE CASCADE,
      MağazaAdı VARCHAR(255) NOT NULL,
      Adres TEXT,
      Telefon VARCHAR(20)
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS Ürünler (
      ID SERIAL PRIMARY KEY,
      MağazaID INTEGER REFERENCES Mağazalar(ID) ON DELETE CASCADE,
      Ad VARCHAR(255) NOT NULL,
      Açıklama TEXT,
      Fiyat NUMERIC(10, 2) NOT NULL CHECK (Fiyat >= 0),
      ResimURL TEXT,
      StokMiktari INTEGER NOT NULL CHECK (StokMiktari >= 0),
      KategoriID INTEGER
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS Kategoriler (
      ID SERIAL PRIMARY KEY,
      KategoriAdı VARCHAR(50) NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS Sepetler (
      ID SERIAL PRIMARY KEY,
      KullanıcıID INTEGER REFERENCES Kullanıcılar(ID) ON DELETE CASCADE
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS SepetÜrünleri (
      ID SERIAL PRIMARY KEY,
      SepetID INTEGER REFERENCES Sepetler(ID) ON DELETE CASCADE,
      ÜrünID INTEGER REFERENCES Ürünler(ID) ON DELETE CASCADE,
      Miktar INTEGER NOT NULL CHECK (Miktar > 0),
      BirimFiyatı NUMERIC(10, 2) NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS Siparişler (
      ID SERIAL PRIMARY KEY,
      KullanıcıID INTEGER REFERENCES Kullanıcılar(ID) ON DELETE SET NULL,
      ToplamFiyat NUMERIC(10, 2) NOT NULL CHECK (ToplamFiyat >= 0),
      SiparişTarihi TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      Durum VARCHAR(50) NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS SiparişÜrünleri (
      ID SERIAL PRIMARY KEY,
      SiparişID INTEGER REFERENCES Siparişler(ID) ON DELETE CASCADE,
      ÜrünID INTEGER REFERENCES Ürünler(ID) ON DELETE CASCADE,
      Miktar INTEGER NOT NULL CHECK (Miktar > 0),
      BirimFiyatı NUMERIC(10, 2) NOT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS Yorumlar (
      ID SERIAL PRIMARY KEY,
      ÜrünID INTEGER REFERENCES Ürünler(ID) ON DELETE CASCADE,
      KullanıcıID INTEGER REFERENCES Kullanıcılar(ID) ON DELETE CASCADE,
      Yorum TEXT,
      Puan INTEGER CHECK (Puan >= 1 AND Puan <= 5),
      YorumTarihi TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS Abonelikler (
      ID SERIAL PRIMARY KEY,
      Eposta VARCHAR(255) UNIQUE NOT NULL
    );
    `
  ];
  try {
    for (const sorgu of sorgular) {
      await pool.query(sorgu);
    }
  } catch (error) {
    console.log("error", error);
  }

  console.log('Tüm tablolar başarıyla oluşturuldu.');
}

async function ornekVeriEkle() {
  try {
    const magazaKontrol = await pool.query('SELECT COUNT(*) FROM Mağazalar');
    if (magazaKontrol.rows[0].count > 0) {
      return;
    }

    const resimUrls = [
      '/images/ametist.jpg',
      '/images/batman.jpg',
      '/images/beyaz.jpg',
      '/images/fakir.jpg',
      '/images/lapis.jpg',
      '/images/pahalı.jpg',
      '/images/pembe.webp',
      '/images/rope.png',
      '/images/yakud.webp'
    ];

    const kullanicilar = [
      {
        kullaniciAdi: 'magaza1',
        eposta: 'magaza1@gmail.com',
        sifre: await bcrypt.hash('12345', 10),
        rol: 'Magaza',
        ad: 'Mağaza',
        soyad: 'Bir',
        bio: 'Bu birinci mağazadır.',
        profilResmi: '/images/magaza1.jpeg'
      },
      {
        kullaniciAdi: 'magaza2',
        eposta: 'magaza2@gmail.com',
        sifre: await bcrypt.hash('12345', 10),
        rol: 'Magaza',
        ad: 'Mağaza',
        soyad: 'İki',
        bio: 'Bu ikinci mağazadır.',
        profilResmi: '/images/magaza2.jpeg'
      }
    ];

    for (const kullanici of kullanicilar) {
      const kullaniciResult = await pool.query(`
        INSERT INTO Kullanıcılar (KullanıcıAdı, Eposta, Şifre, Rol, Ad, Soyad, Bio, ProfilResmi)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ID
      `, [kullanici.kullaniciAdi, kullanici.eposta, kullanici.sifre, kullanici.rol, kullanici.ad, kullanici.soyad, kullanici.bio, kullanici.profilResmi]);

      const kullaniciID = kullaniciResult.rows[0].id;

      const magazaResult = await pool.query(`
        INSERT INTO Mağazalar (KullanıcıID, MağazaAdı)
        VALUES ($1, $2) RETURNING ID
      `, [kullaniciID, kullanici.ad + ' Mağaza']);

      const magazaID = magazaResult.rows[0].id;

      for (const resimUrl of resimUrls) {
        await pool.query(`
          INSERT INTO Ürünler (MağazaID, Ad, Açıklama, Fiyat, ResimURL, StokMiktari, KategoriID)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [magazaID, path.basename(resimUrl, path.extname(resimUrl)), 'Ürün detayları için mağazamızı arayınız..', Math.floor(Math.random() * 1000), resimUrl, Math.floor(Math.random() * 100), 1]);
      }
    }

    console.log('Örnek veriler başarıyla eklendi.');
  } catch (error) {
    console.error('Örnek veriler eklenirken bir hata oluştu:', error);
  }
}

veritabaniKontrolVeOlustur().then(async () => {
  console.log('Veritabanı hazır.');
  await tablolariOlustur();
  await ornekVeriEkle();
});

app.listen(PORT, () => console.log(`Sunucu ${PORT} da çalışıyor.`));
