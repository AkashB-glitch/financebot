window.addEventListener("scroll", () => {
    const navbar = document.getElementById("navbar");
    if (window.scrollY > 50) {
        navbar.classList.add("shrink");
    } else {
        navbar.classList.remove("shrink");
    }
});
function scrollLeft(btn) {
    const container = btn.parentElement.querySelector('.scroll-container');
    container.scrollBy({ left: -220, behavior: 'smooth' });
}

function scrollRight(btn) {
    const container = btn.parentElement.querySelector('.scroll-container');
    container.scrollBy({ left: 220, behavior: 'smooth' });
}document.querySelectorAll('.scroll-btn.left').forEach(btn => {
    btn.addEventListener('click', () => {
        const container = btn.parentElement.querySelector('.scroll-container');
        container.scrollBy({ left: -220, behavior: 'smooth' });
    });
});
document.querySelectorAll('.scroll-btn.right').forEach(btn => {
    btn.addEventListener('click', () => {
        const container = btn.parentElement.querySelector('.scroll-container');
        container.scrollBy({ left: 220, behavior: 'smooth' });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".scroll-container");
    const btnLeft = document.querySelector(".scroll-btn.left");
    const btnRight = document.querySelector(".scroll-btn.right");

    // Function to update button states
    function updateButtons() {
        if (container.scrollLeft === 0) {
            btnLeft.classList.add("disabled");
        } else {
            btnLeft.classList.remove("disabled");
        }

        if (container.scrollWidth - container.clientWidth <= container.scrollLeft + 1) {
            btnRight.classList.add("disabled");
        } else {
            btnRight.classList.remove("disabled");
        }
    }

    // Initial button update
    updateButtons();

    // Scroll event listener
    container.addEventListener("scroll", updateButtons);

    // Click events for buttons
    btnLeft.addEventListener("click", function () {
        container.scrollBy({
            left: -200, // Adjust scroll amount
            behavior: "smooth"
        });
    });

    btnRight.addEventListener("click", function () {
        container.scrollBy({
            left: 200, // Adjust scroll amount
            behavior: "smooth"
        });
    });
});

document.querySelectorAll(".scroll-wrapper").forEach(wrapper => {
    const container = wrapper.querySelector(".scroll-container");
    const leftBtn = wrapper.querySelector(".scroll-btn.left");
    const rightBtn = wrapper.querySelector(".scroll-btn.right");
  
    leftBtn.addEventListener("click", () => {
      container.scrollBy({ left: -200, behavior: "smooth" });
    });
  
    rightBtn.addEventListener("click", () => {
      container.scrollBy({ left: 200, behavior: "smooth" });
    });
  });

// Balance Modal Functions
function showBalanceModal() {
    document.getElementById('balanceModal').style.display = 'block';
}

function closeBalanceModal() {
    document.getElementById('balanceModal').style.display = 'none';
    document.getElementById('balanceResult').style.display = 'none';
    document.getElementById('balanceForm').reset();
}

// Handle balance form submission
document.addEventListener('DOMContentLoaded', function() {
    const balanceForm = document.getElementById('balanceForm');
    if (balanceForm) {
        balanceForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const accountNumber = document.getElementById('accountNumber').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/check_balance', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `account_number=${accountNumber}&password=${password}`
                });

                const data = await response.json();

                if (data.status === 'success') {
                    document.getElementById('accountName').textContent = data.name;
                    document.getElementById('accountBalance').textContent = data.balance.toLocaleString();
                    document.getElementById('balanceResult').style.display = 'block';
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                alert('Network error. Please try again.');
            }
        });
    }
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('balanceModal');
    if (event.target === modal) {
        closeBalanceModal();
    }
});
