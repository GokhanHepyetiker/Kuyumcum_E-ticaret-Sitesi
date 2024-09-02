document.addEventListener('DOMContentLoaded', function() {
    async function loadMagazalar() {
        try {
            const response = await fetch('/api/magazalar');
            const result = await response.json();
            if (response.ok) {
                const magazaListesi = document.getElementById('magazaListesi');
                result.data.forEach(magaza => {
                    const magazaKarti = `
                        <div class=" rounded-lg overflow-hidden shadow-lg cursor-pointer" onclick="window.location.href='urunler.html?magazaid=${magaza.id}'">
                            <img src="${magaza.profilresmi}" alt="${magaza.mağazaadı}" style="width:300px" class="h-48 object-cover">
                            <div class="p-6">
                                <h3 class="font-bold text-xl mb-2">${magaza.mağazaadı}</h3>
                                <p class="text-gega-grey">${magaza.adres ? magaza.adres : ''}</p>
                                <p class="text-gega-grey">${magaza.telefon ? magaza.telefon : ''}</p>
                            </div>
                        </div>
                    `;
                    magazaListesi.innerHTML += magazaKarti;
                });
            } else {
                alert(`Mağazalar yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Mağazalar yüklenirken bir hata oluştu:', error);
            alert('Mağazalar yüklenirken bir hata oluştu.');
        }
    }

    loadMagazalar();
});
