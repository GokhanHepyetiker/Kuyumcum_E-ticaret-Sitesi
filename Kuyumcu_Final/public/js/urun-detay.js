document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const urunId = urlParams.get('urunid');
    const urunDetayContainer = document.getElementById('urun-detay');
    const token = localStorage.getItem('token');

    if (!urunId) {
        alert('Ürün ID bulunamadı');
        return;
    }

    async function loadUrunDetay() {
        try {
            const response = await fetch(`/api/urunler/detay/${urunId}`);
            const result = await response.json();
            if (response.ok) {
                const urun = result.urun;
                const yorumlar = result.yorumlar;

                const urunDetayHTML = `
                    <div class="lg:basis-2/3">
                        <img src="${urun.resimurl}" alt="${urun.ad}" class="w-full h-96 object-cover rounded-lg">
                    </div>
                    <div class="lg:basis-1/3">
                        <h2 class="text-3xl font-bold text-gega-red mb-4">${urun.ad}</h2>
                        <p class="text-gega-grey mb-4">${urun.açıklama}</p>
                        <p class="text-gega-grey mb-4">Fiyat: ${urun.fiyat}</p>
                        <p class="text-gega-grey mb-4">Stok: ${urun.stokmiktari}</p>
                        <div class="mb-4">
                            <h3 class="text-2xl font-bold text-gega-red mb-2">Mağaza</h3>
                            <div class="flex items-center">
                                <img src="${urun.magazaprofilresmi}" alt="${urun.magazaadi}" class="w-12 h-12 rounded-full mr-4">
                                <div>
                                    <h4 class="text-lg font-bold">${urun.mağazaadı}</h4>
                                    <a href="urunler.html?magazaid=${urun.magazakullaniciid}" class="text-gega-red">Mağaza Sayfası</a>
                                </div>
                            </div>
                        </div>
                        ${token ? `
                            <div class="mb-4">
                                <input type="number" id="adet" min="1" value="1" class="p-2 border border-gray-300 rounded">
                                <button id="sepete-ekle" class="ml-2 bg-gega-red hover:bg-red-700 text-white p-2 rounded">Sepete Ekle</button>
                            </div>
                            <div class="mb-4">
                                <textarea id="yorum" class="w-full p-2 border border-gray-300 rounded" rows="3" placeholder="Yorum yazın"></textarea>
                                <button id="yorum-ekle" class="mt-2 bg-gega-red hover:bg-red-700 text-white p-2 rounded">Yorum Yap</button>
                            </div>
                        ` : ''}
                        <div id="yorumlar" class="mt-4">
                            <h3 class="text-2xl font-bold text-gega-red mb-2">Yorumlar</h3>
                            ${yorumlar.map(yorum => `
                                <div class="mb-4">
                                <img src="${yorum.profilresmi}" alt="${yorum.kullaniciadi}" class="w-10 h-10 rounded-full mr-4">
                                    <h4 class="font-bold">${yorum.kullanıcıadı}</h4>
                                    <p>${yorum.yorum}</p>
                                    <p class="text-sm text-gega-grey">${new Date(yorum.yorumtarihi).toLocaleString()}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                urunDetayContainer.innerHTML = urunDetayHTML;

                if (token) {
                    document.getElementById('sepete-ekle').addEventListener('click', async function() {
                        const miktar = document.getElementById('adet').value;

                        try {
                            const response = await fetch('/api/sepet/ekle', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ urunID: urun.id, miktar, birimFiyati: urun.fiyat })
                            });

                            const result = await response.json();
                            if (response.ok) {
                                alert('Ürün sepete eklendi');
                            } else {
                                alert(`Ürün sepete eklenemedi: ${result.message}`);
                            }
                        } catch (error) {
                            console.error('Sepete ürün eklenirken bir hata oluştu:', error);
                            alert('Sepete ürün eklenirken bir hata oluştu.');
                        }
                    });

                    document.getElementById('yorum-ekle').addEventListener('click', async function() {
                        const yorum = document.getElementById('yorum').value;

                        try {
                            const response = await fetch('/api/yorumlar/ekle', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ urunID: urun.id, yorum })
                            });

                            const result = await response.json();
                            if (response.ok) {
                                alert('Yorum eklendi');
                                loadUrunDetay(); 
                            } else {
                                alert(`Yorum eklenemedi: ${result.message}`);
                            }
                        } catch (error) {
                            console.error('Yorum eklenirken bir hata oluştu:', error);
                            alert('Yorum eklenirken bir hata oluştu.');
                        }
                    });
                }
            } else {
                alert(`Ürün detayları yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Ürün detayları yüklenirken bir hata oluştu:', error);
            alert('Ürün detayları yüklenirken bir hata oluştu.');
        }
    }

    loadUrunDetay();
});
