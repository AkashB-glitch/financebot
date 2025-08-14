// Navbar shrink on scroll
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('shrink');
    } else {
        navbar.classList.remove('shrink');
    }
});

// Show Create Account Form
document.getElementById('showCreateBtn').addEventListener('click', () => {
    const createContainer = document.getElementById('createContainer');
    createContainer.classList.remove('hidden');
    createContainer.style.animation = "fadeInUp 0.6s ease";
    createContainer.scrollIntoView({ behavior: 'smooth' });
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    let formData = new FormData(this);
    let res = await fetch('/login', { method: 'POST', body: formData });
    let data = await res.json();
    let output = document.getElementById('loginOutput');
    output.style.display = 'block';
    if (data.status === "success") {
        output.innerHTML = `<strong>Welcome ${data.name}</strong><br>
                            Account No: ${data.account_number}<br>
                            IFSC: ${data.ifsc}<br>
                            Balance: ₹${data.balance}`;
    } else {
        output.innerHTML = `<strong style="color:red;">${data.message}</strong>`;
    }
});

// Handle account creation
document.getElementById('createForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    let formData = new FormData(this);
    let res = await fetch('/create_account', { method: 'POST', body: formData });
    let data = await res.json();
    let output = document.getElementById('createOutput');
    output.style.display = 'block';
    if (data.status === "success") {
        output.innerHTML = `<strong>Account Created!</strong><br>
                            Name: ${data.name}<br>
                            Account No: ${data.account_number}<br>
                            IFSC: ${data.ifsc}<br>
                            Password: ${data.password}<br>
                            Balance: ₹${data.balance}`;
    } else {
        output.innerHTML = `<strong style="color:red;">${data.message}</strong>`;
    }
});
