document.addEventListener('DOMContentLoaded', function() {
    const kayitForm = document.getElementById('kayitForm');

    if (kayitForm) {
        kayitForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(kayitForm);
            try {
                const response = await fetch('/api/kullanicilar/register', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                if (response.ok) {
                    alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
                    window.location.href = 'login.html';
                } else {
                    alert(`Kayıt başarısız: ${result.message}`);
                }
            } catch (error) {
                console.error('Kayıt sırasında bir hata oluştu:', error);
                alert('Kayıt sırasında bir hata oluştu.');
            }
        });
    }
});
