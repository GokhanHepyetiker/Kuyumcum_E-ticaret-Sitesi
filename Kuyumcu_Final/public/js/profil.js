document.addEventListener('DOMContentLoaded', async function() {
    const profilForm = document.getElementById('profilForm');

    
    async function loadProfile() {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Giriş yapmanız gerekiyor.');
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('/api/kullanicilar/profil', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                document.getElementById('ad').value = result.data.ad;
                document.getElementById('soyad').value = result.data.soyad;
                document.getElementById('email').value = result.data.eposta;
                document.getElementById('bio').value = result.data.bio;
                document.getElementById('profilResmi').src = result.data.profilresmi;
            } else {
                alert(`Profil bilgileri yüklenemedi: ${result.message}`);
            }
        } catch (error) {
            console.error('Profil bilgileri yüklenirken bir hata oluştu:', error);
            alert('Profil bilgileri yüklenirken bir hata oluştu.');
        }
    }

    
    if (profilForm) {
        profilForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(profilForm);
            console.log(formData);
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('/api/kullanicilar/profil', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const result = await response.json();
                if (response.ok) {
                    alert('Profil başarıyla güncellendi!');
                    loadProfile(); 
                } else {
                    alert(`Profil güncellenemedi: ${result.message}`);
                }
            } catch (error) {
                console.error('Profil güncellenirken bir hata oluştu:', error);
                alert('Profil güncellenirken bir hata oluştu.');
            }
        });
    }

    loadProfile();
});
