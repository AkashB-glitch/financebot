// Existing toggle code
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// ------------------------
// Sign Up & Login Handling
// ------------------------

// Handle Registration
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent page reload

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    // Save to localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    localStorage.setItem('password', password);

    alert('Registration successful! You can now log in.');

    // Switch to login form
    container.classList.remove('active');
});

// Handle Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const storedUsername = localStorage.getItem('username');
    const storedPassword = localStorage.getItem('password');

    if (username === storedUsername && password === storedPassword) {
        alert('Login successful!');
        // Redirect to next page
        window.location.href = 'index.html';
    } else {
        alert('Invalid username or password.');
    }
});
