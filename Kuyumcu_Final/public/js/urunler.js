document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const magazaId = urlParams.get('magazaid');

    if (!magazaId) {
        alert('Mağaza ID bulunamadı');
        return;
    }

    const urunListesi = document.getElementById('urunListesi');
    const token = localStorage.getItem('token');

    async function loadUrunler() {
        try {
            const response = await fetch(`/api/urunler/${magazaId}`);
            const result = await response.json();
            if (response.ok) {
                result.data.forEach(urun => {
                    const urunKarti = `
                        <div class="rounded-lg overflow-hidden shadow-lg flex items-center p-4 mb-4">
                            <img src="${urun.resimurl}" alt="${urun.ad}" class="w-24 h-24 object-cover rounded-lg mr-4">
                            <div class="flex-grow">
                                <h3 class="font-bold text-xl mb-2 mr-2">${urun.ad}</h3>
                                <p class="text-gega-grey">${urun.açıklama}</p>
                                <p class="text-gega-grey mt-4">Fiyat: ${urun.fiyat} TL</p>
                            </div>
                            ${token ? `
                                <div class="flex items-center ml-8 items-right">
                                    <input type="number" id="adet-${urun.id}" min="1" value="1" class="w-16 p-2 border border-gray-300 rounded mr-2">
                                    <button onclick="sepeteEkle(${urun.id}, ${urun.fiyat})" class="bg-gega-red hover:bg-red-700 text-white p-2 rounded">Sepete Ekle</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                    urunListesi.innerHTML += urunKarti;
                });
            } else {
                alert(`Ürünler yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Ürünler yüklenirken bir hata oluştu:', error);
            alert('Ürünler yüklenirken bir hata oluştu.');
        }
    }
    
    

    window.sepeteEkle = async function(urunID, birimFiyati) {
        const miktar = document.getElementById(`adet-${urunID}`).value;

        try {
            const response = await fetch('/api/sepet/ekle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ urunID, miktar, birimFiyati })
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
    };

    loadUrunler();
});
