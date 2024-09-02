document.addEventListener('DOMContentLoaded', function() {
    const sonCikanlarLink = document.getElementById('son-cikanlar-link');
    const populerlerLink = document.getElementById('populerler-link');
    const enCokSatanlarLink = document.getElementById('en-cok-satanlar-link');
    const productsContainer = document.getElementById('products-container');
    const preorderContainer = document.getElementById('preorder-container');

    async function loadProducts(category) {
        try {
            const response = await fetch(`/api/urunler/kategori/${category}`);
            const result = await response.json();
            if (response.ok) {
                productsContainer.innerHTML = '';
                result.data.forEach(urun => {
                    const urunKarti = `
                        <div class="rounded-lg overflow-hidden shadow-lg cursor-pointer" onclick="window.location.href='urun-detay.html?urunid=${urun.id}'">
                            <div class="p-6">
                            <img src="${urun.resimurl}" alt="${urun.ad}" class="w-15 h-15 object-cover rounded-lg">
                                <h3 class="font-bold text-xl mb-2">${urun.ad}</h3>
                                <p class="text-gega-grey">${urun.açıklama}</p>
                                <p class="text-gega-grey mt-4">Fiyat: ${urun.fiyat}</p>
                            </div>
                        </div>
                    `;
                    productsContainer.innerHTML += urunKarti;
                });
            } else {
                alert(`Ürünler yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Ürünler yüklenirken bir hata oluştu:', error);
            alert('Ürünler yüklenirken bir hata oluştu.');
        }
    }

    async function loadPreorderProducts() {
        try {
            const response = await fetch(`/api/urunler/kategori/on-siparis`);
            const result = await response.json();
            if (response.ok) {
                preorderContainer.innerHTML = '';
                result.data.forEach(urun => {
                    const urunKarti = `
                        <div class="rounded-lg overflow-hidden shadow-lg cursor-pointer" onclick="window.location.href='urun-detay.html?urunid=${urun.id}'">
                            <div class="p-6">
                                <img src="${urun.resimurl}" alt="${urun.ad}" class="w-10 h-10 object-cover rounded-lg">
                                <h3 class="font-bold text-xl mb-2">${urun.ad}</h3>
                                <p class="text-gega-grey">${urun.açıklama}</p>
                                <p class="text-gega-grey mt-4">Fiyat: ${urun.fiyat}</p>
                            </div>
                        </div>
                    `;
                    preorderContainer.innerHTML += urunKarti;
                });
            } else {
                alert(`Ön sipariş ürünleri yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Ön sipariş ürünleri yüklenirken bir hata oluştu:', error);
            alert('Ön sipariş ürünleri yüklenirken bir hata oluştu.');
        }
    }

    sonCikanlarLink.addEventListener('click', function() {
        loadProducts('son-cikanlar');
    });

    populerlerLink.addEventListener('click', function() {
        loadProducts('populerler');
    });

    enCokSatanlarLink.addEventListener('click', function() {
        loadProducts('en-cok-satanlar');
    });

    function loadCurrencyRates() {
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
            .then(response => response.json())
            .then(currencyData => {
                const currencyContainer = document.getElementById('currency-container');
                const currencies = `
                <div>USD/TRY: ${currencyData.rates.TRY}</div>
                <div>USD/EUR: ${currencyData.rates.EUR}</div>
                <div>USD/GBP: ${currencyData.rates.GBP}</div>
                <div>USD/JPY: ${currencyData.rates.JPY}</div>
                <div>USD/RUB: ${currencyData.rates.RUB}</div>
                `;
                currencyContainer.innerHTML = currencies;
            })
            .catch(error => console.error('Kurlar yüklenirken bir hata oluştu:', error));
    }

    loadCurrencyRates();
    
    loadProducts('son-cikanlar');
    loadPreorderProducts();
});
