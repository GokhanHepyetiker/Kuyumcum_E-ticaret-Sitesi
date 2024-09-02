document.addEventListener('DOMContentLoaded', async function() {
    const siparislerContainer = document.getElementById('siparisler-container');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Lütfen giriş yapın');
        window.location.href = 'login.html';
        return;
    }

    async function loadSiparisler() {
        try {
            const response = await fetch('/api/siparisler', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                siparislerContainer.innerHTML = '';
                result.data.forEach(siparis => {
                    const siparisHTML = `
                        <div class=" p-6 rounded-lg shadow-lg">
                            <h3 class="text-2xl font-bold mb-4 text-gega-red">Sipariş ID: ${siparis.id}</h3>
                            <p class="text-gega-grey mb-4">Toplam Fiyat: ${siparis.toplamfiyat} TL</p>
                            <p class="text-gega-grey mb-4">Sipariş Tarihi: ${new Date(siparis.sipariştarihi).toLocaleString()}</p>
                            <p class="text-gega-grey mb-4">Durum: ${siparis.durum}</p>
                            <div class="overflow-x-auto">
                                <table class="table-auto w-full">
                                    <thead>
                                        <tr class="text-right">
                                            <th class="px-4 py-2">Resim</th>
                                            <th class="px-4 py-2">Ürün</th>
                                            <th class="px-4 py-2">Fiyat</th>
                                            <th class="px-4 py-2">Miktar</th>
                                            <th class="px-4 py-2">Toplam</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${siparis.urunler.map(urun => `
                                            <tr class="border-b border-gega-red">
                                                <td class="px-4 py-4 flex items-center">
                                                    <img src="${urun.resimurl}" alt="${urun.ad}" class="h-20 mr-4 w-24">
                                                </td>
                                                <td class="px-4 py-4 text-right">${urun.ad}</td>
                                                <td class="px-4 py-4 text-right">${urun.birimfiyatı} TL</td>
                                                <td class="px-4 py-4 text-right">${urun.miktar}</td>
                                                <td class="px-4 py-4 text-right">${urun.birimfiyatı * urun.miktar} TL</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    siparislerContainer.innerHTML += siparisHTML;
                });
            } else {
                alert(`Siparişler yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Siparişler yüklenirken bir hata oluştu:', error);
            alert('Siparişler yüklenirken bir hata oluştu.');
        }
    }

    loadSiparisler();
});
