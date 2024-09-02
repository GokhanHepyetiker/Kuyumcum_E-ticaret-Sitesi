document.addEventListener('DOMContentLoaded', async function() {
    const urunlerContainer = document.getElementById('urunler-container');
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Lütfen giriş yapın');
        window.location.href = 'login.html';
        return;
    }

    async function loadUrunler() {
        try {
            const response = await fetch('/api/magazam', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                urunlerContainer.innerHTML = '';
                result.data.forEach(urun => {
                    const urunHTML = `
                        <div class=" p-6 rounded-lg shadow-lg flex items-center justify-between">
                            <div>
                                <h3 class="text-2xl font-bold mb-4 text-gega-red">${urun.ad}</h3>
                                <p class="text-gega-grey mb-4">${urun.açıklama}</p>
                                <p class="text-gega-grey mb-4">Fiyat: ${urun.fiyat} TL</p>
                                <p class="text-gega-grey mb-4">Stok: ${urun.stokmiktari}</p>
                            </div>
                            <div>
                                <img src="${urun.resimurl}" alt="${urun.ad}" class="h-20 w-20 object-cover rounded-lg">
                            </div>
                            <div>
                                <button class="text-red-500 hover:text-red-700" onclick="urunSil(${urun.id})">
                                    <i class="fas fa-trash"></i> Sil
                                </button>
                            </div>
                        </div>
                    `;
                    urunlerContainer.innerHTML += urunHTML;
                });
            } else {
                alert(`Ürünler yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Ürünler yüklenirken bir hata oluştu:', error);
            alert('Ürünler yüklenirken bir hata oluştu.');
        }
    }

    window.urunSil = async function(urunID) {
        try {
            const response = await fetch(`/api/magazam/${urunID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok) {
                alert('Ürün silindi');
                loadUrunler(); 
            } else {
                alert(`Ürün silinemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Ürün silinirken bir hata oluştu:', error);
            alert('Ürün silinirken bir hata oluştu.');
        }
    };

    document.getElementById('urun-ekle-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData(this);

        try {
            const response = await fetch('/api/magazam/ekle', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (response.ok) {
                alert('Ürün eklendi');
                loadUrunler(); 
                document.getElementById('urun-ekle-form').reset(); 
            } else {
                alert(`Ürün eklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Ürün eklenirken bir hata oluştu:', error);
            alert('Ürün eklenirken bir hata oluştu.');
        }
    });

    loadUrunler();
});
