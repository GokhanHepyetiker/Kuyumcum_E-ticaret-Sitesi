document.addEventListener('DOMContentLoaded', async function() {
    const sepetUrunlerContainer = document.getElementById('sepet-urunler');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Lütfen giriş yapın');
        window.location.href = 'login.html';
        return;
    }

    async function loadSepetUrunler() {
        try {
            const response = await fetch('/api/sepet', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                sepetUrunlerContainer.innerHTML = '';
                result.data.forEach(urun => {
                    const urunHTML = `
                        <tr class="border-b border-gega-red">
                            <td class="ml-12 px-4 py-4 flex items-center">
                                <img src="${urun.resimurl}" alt="${urun.ad}" class="h-24 w-24">
                            </td>
                            <td class="px-4 py-4 text-center">${urun.ad}</td>
                            <td class="px-4 py-4 text-center">${urun.birimfiyatı} TL</td>
                            <td class="px-4 py-4 text-center">${urun.miktar}</td>
                            <td class="px-4 py-4 text-center">${urun.birimfiyatı * urun.miktar} TL</td>
                            <td class="px-4 py-4 text-center">
                                <button class="text-red-500 hover:text-red-700" onclick="sepettenSil(${urun.urunid})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                    sepetUrunlerContainer.innerHTML += urunHTML;
                });
            } else {
                alert(`Sepet ürünleri yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Sepet ürünleri yüklenirken bir hata oluştu:', error);
            alert('Sepet ürünleri yüklenirken bir hata oluştu.');
        }
    }

    window.sepettenSil = async function(urunID) {
        try {
            const response = await fetch(`/api/sepet/${urunID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                alert('Ürün sepetten silindi');
                loadSepetUrunler(); 
            } else {
                alert(`Ürün sepetten silinemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Sepetten ürün silinirken bir hata oluştu:', error);
            alert('Sepetten ürün silinirken bir hata oluştu.');
        }
    };

    document.getElementById('odeme-yap').addEventListener('click', async function() {
        const kartNumarasi = document.getElementById('kart-numarasi').value;
        const sonKullanmaTarihi = document.getElementById('son-kullanma-tarihi').value;
        const cvv = document.getElementById('cvv').value;

        if (!kartNumarasi || !sonKullanmaTarihi || !cvv) {
            alert('Lütfen tüm kart bilgilerini girin');
            return;
        }

        try {
            const response = await fetch('/api/siparisler/olustur', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ kartNumarasi, sonKullanmaTarihi, cvv })
            });

            const result = await response.json();
            if (response.ok) {
                alert('Sipariş oluşturuldu');
                window.location.href = 'siparislerim.html';
            } else {
                alert(`Sipariş oluşturulamadı: ${result.message}`);
            }
        } catch (error) {
            console.error('Sipariş oluşturulurken bir hata oluştu:', error);
            alert('Sipariş oluşturulurken bir hata oluştu.');
        }
    });

    loadSepetUrunler();
});
