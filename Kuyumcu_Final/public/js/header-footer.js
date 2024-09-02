document.addEventListener('DOMContentLoaded', function() {
    
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            updateHeader();
        })
        .catch(error => console.error('Header yüklenirken bir hata oluştu:', error));

    
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Footer yüklenirken bir hata oluştu:', error));

    
    function updateHeader() {
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            document.getElementById('loginButton').style.display = 'none';
            document.getElementById('signupButton').style.display = 'none';
            document.getElementById('profilButton').style.display = 'block';
            document.getElementById('siparislerimButton').style.display = 'block';
            document.getElementById('logoutButton').style.display = 'block';
            if (payload.user.rol === 'Magaza') {
                const magazamLink = document.createElement('a');
                magazamLink.href = 'magazam.html';
                magazamLink.innerText = 'Mağazam';
                magazamLink.className = ' bg-gega-red hover:bg-red-700 text-white p-3 rounded';
                document.getElementById('loginArea').prepend(magazamLink);
            }
            document.getElementById('logoutButton').addEventListener('click', function() {
                localStorage.removeItem('token');
                window.location.reload();
            });
        } else {
            document.getElementById('loginButton').style.display = 'block';
            document.getElementById('signupButton').style.display = 'block';
            document.getElementById('profilButton').style.display = 'none';
            document.getElementById('siparislerimButton').style.display = 'none';
            document.getElementById('logoutButton').style.display = 'none';
        }
    }
});
