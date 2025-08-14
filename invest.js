// Global variables
let currentUser = null;
let investmentCategories = {};
let selectedInvestment = null;
let investmentChart = null;

console.log('Invest.js loaded successfully!');

// DOM elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const categoryGrid = document.getElementById('categoryGrid');
const calculatorSection = document.getElementById('calculatorSection');
const calculationResults = document.getElementById('calculationResults');
const investmentList = document.getElementById('investmentList');
const successModal = document.getElementById('successModal');
const loadingSpinner = document.getElementById('loadingSpinner');
const portfolioSummary = document.getElementById('portfolioSummary');
const portfolioInvestments = document.getElementById('portfolioInvestments');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadInvestmentCategories();
    setupEventListeners();
    
    // Check if user is already logged in (from sessionStorage)
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
});

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    });
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted!');
    
    const accountNumber = document.getElementById('loginAccount').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!accountNumber || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    showLoading(true);
    
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
            currentUser = {
                name: data.name,
                account_number: accountNumber,
                password: password,
                balance: data.balance
            };
            
            // Save to session storage
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showDashboard();
            showNotification('Login successful!', 'success');
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Show dashboard
function showDashboard() {
    loginSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    
    // Update user info in navbar
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userBalance = document.getElementById('userBalance');
    
    userName.textContent = currentUser.name;
    userBalance.textContent = `₹${formatNumber(currentUser.balance)}`;
    userInfo.style.display = 'flex';
    
    // Load portfolio
    loadPortfolio();
}

// Load investment categories
async function loadInvestmentCategories() {
    try {
        const response = await fetch('/api/investment_categories');
        const data = await response.json();
        
        if (data.status === 'success') {
            investmentCategories = data.categories;
            renderCategories();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render investment categories
function renderCategories() {
    categoryGrid.innerHTML = '';
    
    for (const [categoryKey, category] of Object.entries(investmentCategories)) {
        const categoryCard = createCategoryCard(categoryKey, category);
        categoryGrid.appendChild(categoryCard);
    }
}

// Create category card
function createCategoryCard(categoryKey, category) {
    const card = document.createElement('div');
    card.className = 'category-card glass-card';
    card.onclick = () => showInvestmentCalculator(categoryKey, category);
    
    // Get category icon
    const iconMap = {
        real_estate: 'fa-building',
        vehicles: 'fa-car',
        business: 'fa-briefcase',
        stocks: 'fa-chart-line',
        crypto: 'fa-bitcoin',
        gold: 'fa-coins'
    };
    
    const icon = iconMap[categoryKey] || 'fa-coins';
    
    card.innerHTML = `
        <div class="category-header">
            <div class="category-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="category-info">
                <h3>${categoryKey.replace('_', ' ').toUpperCase()}</h3>
                <p>${Object.keys(category).length} investment options</p>
            </div>
        </div>
        <div class="subcategories">
            ${Object.entries(category).map(([subKey, subCategory]) => `
                <div class="subcategory-item" onclick="event.stopPropagation(); selectSubcategory('${categoryKey}', '${subKey}')">
                    <div class="subcategory-header">
                        <span class="subcategory-name">${subCategory.name}</span>
                        <span class="subcategory-roi">${subCategory.roi_percentage}% ROI</span>
                    </div>
                    <div class="subcategory-details">
                        <span>Min: ₹${formatNumber(subCategory.min_investment)}</span>
                        <span class="risk-level risk-${subCategory.risk_level.toLowerCase().replace(/[-\s]/g, '')}">${subCategory.risk_level}</span>
                    </div>
                    <p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.8;">${subCategory.description}</p>
                </div>
            `).join('')}
        </div>
    `;
    
    return card;
}

// Select subcategory and show calculator
function selectSubcategory(categoryKey, subKey) {
    selectedInvestment = {
        category: categoryKey,
        subcategory: subKey,
        data: investmentCategories[categoryKey][subKey]
    };
    
    showInvestmentCalculator();
}

// Show investment calculator
function showInvestmentCalculator() {
    if (!selectedInvestment) return;
    
    calculatorSection.style.display = 'block';
    
    // Update calculator header
    const header = calculatorSection.querySelector('.card-header h3');
    header.innerHTML = `<i class="fas fa-calculator"></i> ${selectedInvestment.data.name} Calculator`;
    
    // Set minimum investment amount
    const amountInput = document.getElementById('investmentAmount');
    amountInput.min = selectedInvestment.data.min_investment;
    amountInput.placeholder = `Min: ₹${formatNumber(selectedInvestment.data.min_investment)}`;
}

// Close calculator
function closeCalculator() {
    calculatorSection.style.display = 'none';
    calculationResults.style.display = 'none';
    selectedInvestment = null;
    
    // Clear form
    document.getElementById('investmentAmount').value = '';
    document.getElementById('investmentDuration').selectedIndex = 3; // Reset to 5 years
}

// Calculate returns
async function calculateReturns() {
    if (!selectedInvestment) return;
    
    const amount = parseFloat(document.getElementById('investmentAmount').value);
    const duration = parseInt(document.getElementById('investmentDuration').value);
    
    if (!amount || amount < selectedInvestment.data.min_investment) {
        showNotification(`Minimum investment: ₹${formatNumber(selectedInvestment.data.min_investment)}`, 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/calculate_investment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                category: selectedInvestment.category,
                subcategory: selectedInvestment.subcategory,
                amount: amount,
                duration: duration
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            displayCalculationResults(data.calculations);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Calculation error. Please try again.', 'error');
    }
}

// Display calculation results
function displayCalculationResults(calculations) {
    calculationResults.style.display = 'block';
    
    document.getElementById('resultInvested').textContent = `₹${formatNumber(calculations.invested_amount)}`;
    document.getElementById('resultReturns').textContent = `₹${formatNumber(calculations.total_returns)}`;
    document.getElementById('resultFutureValue').textContent = `₹${formatNumber(calculations.future_value)}`;
    document.getElementById('resultROI').textContent = `${calculations.roi_percentage}%`;
    document.getElementById('resultMaturityDate').textContent = new Date(calculations.maturity_date).toLocaleDateString();
    
    // Create investment growth chart
    createInvestmentChart(calculations);
}

// Create investment chart
function createInvestmentChart(calculations) {
    const ctx = document.getElementById('investmentChart').getContext('2d');
    
    if (investmentChart) {
        investmentChart.destroy();
    }
    
    const years = Array.from({length: calculations.duration_years + 1}, (_, i) => i);
    const values = years.map(year => {
        return calculations.invested_amount * Math.pow(1 + (calculations.roi_percentage / 100), year);
    });
    
    investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years.map(year => `Year ${year}`),
            datasets: [{
                label: 'Investment Value',
                data: values,
                borderColor: '#00f5ff',
                backgroundColor: 'rgba(0, 245, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#fff'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#fff',
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Make investment
async function makeInvestment() {
    if (!selectedInvestment || !currentUser) return;
    
    const amount = parseFloat(document.getElementById('investmentAmount').value);
    const duration = parseInt(document.getElementById('investmentDuration').value);
    
    if (!amount || amount < selectedInvestment.data.min_investment) {
        showNotification(`Minimum investment: ₹${formatNumber(selectedInvestment.data.min_investment)}`, 'error');
        return;
    }
    
    if (amount > currentUser.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/make_investment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                account_number: currentUser.account_number,
                password: currentUser.password,
                category: selectedInvestment.category,
                subcategory: selectedInvestment.subcategory,
                amount: amount,
                duration: duration
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            // Update current user balance
            currentUser.balance = data.investment_details.new_balance;
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Update balance display
            document.getElementById('userBalance').textContent = `₹${formatNumber(currentUser.balance)}`;
            
            // Show success modal
            showSuccessModal(data);
            
            // Close calculator and refresh portfolio
            closeCalculator();
            loadPortfolio();
            
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        showNotification('Investment failed. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Load portfolio
async function loadPortfolio() {
    if (!currentUser) return;

    showLoading(true);
    try {
        const response = await fetch(`/api/portfolio/${currentUser.account_number}`);
        const data = await response.json();

        if (data.status === 'success') {
            renderPortfolio(data.portfolio, data.investments);
        } else {
            showNotification(data.message, 'error');
            portfolioSummary.innerHTML = '<p>Error loading portfolio summary.</p>';
            portfolioInvestments.innerHTML = '<p>Error loading investments.</p>';
        }
    } catch (error) {
        showNotification('Network error loading portfolio. Please try again.', 'error');
        portfolioSummary.innerHTML = '<p>Network error loading portfolio summary.</p>';
        portfolioInvestments.innerHTML = '<p>Network error loading investments.</p>';
    } finally {
        showLoading(false);
    }
}

// Render portfolio
function renderPortfolio(summary, investments) {
    // Render summary
    if (summary) {
        portfolioSummary.innerHTML = `
            <div class="portfolio-item">
                <h4>Total Invested</h4>
                <p>₹${formatNumber(summary.total_invested)}</p>
            </div>
            <div class="portfolio-item">
                <h4>Current Value</h4>
                <p>₹${formatNumber(summary.current_value)}</p>
            </div>
            <div class="portfolio-item">
                <h4>Total Returns</h4>
                <p class="${summary.total_returns >= 0 ? 'text-success' : 'text-danger'}">₹${formatNumber(summary.total_returns)}</p>
            </div>
            <div class="portfolio-item">
                <h4>Last Updated</h4>
                <p>${new Date(summary.last_updated).toLocaleDateString()}</p>
            </div>
        `;
    } else {
        portfolioSummary.innerHTML = '<p>No portfolio summary available. Make your first investment!</p>';
    }

    // Render individual investments
    portfolioInvestments.innerHTML = '';
    if (investments && investments.length > 0) {
        investments.forEach(inv => {
            const investmentCard = document.createElement('div');
            investmentCard.className = 'investment-card glass-card';
            investmentCard.innerHTML = `
                <div class="investment-header">
                    <h4>${inv.type}</h4>
                    <span class="investment-status status-${inv.status}">${inv.status.toUpperCase()}</span>
                </div>
                <div class="investment-details">
                    <p><strong>Category:</strong> ${inv.category}</p>
                    <p><strong>Invested Amount:</strong> ₹${formatNumber(inv.amount_invested)}</p>
                    <p><strong>Expected Returns:</strong> ₹${formatNumber(inv.expected_returns)}</p>
                    <p><strong>Investment Date:</strong> ${new Date(inv.investment_date).toLocaleDateString()}</p>
                    <p><strong>Maturity Date:</strong> ${new Date(inv.maturity_date).toLocaleDateString()}</p>
                </div>
            `;
            portfolioInvestments.appendChild(investmentCard);
        });
    } else {
        portfolioInvestments.innerHTML = '<p>You have no active investments yet.</p>';
    }
}

// Show success modal
function showSuccessModal(data) {
    document.getElementById('modalTransactionId').textContent = data.transaction_id;
    document.getElementById('modalInvestmentType').textContent = data.investment_details.type;
    document.getElementById('modalAmountInvested').textContent = `₹${formatNumber(data.investment_details.amount_invested)}`;
    document.getElementById('modalExpectedReturns').textContent = `₹${formatNumber(data.investment_details.expected_returns)}`;
    document.getElementById('modalMaturityDate').textContent = new Date(data.investment_details.maturity_date).toLocaleDateString();
    document.getElementById('modalNewBalance').textContent = `₹${formatNumber(data.investment_details.new_balance)}`;
    
    successModal.style.display = 'block';
}

// Close success modal
function closeSuccessModal() {
    successModal.style.display = 'none';
}

// Show notification
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.className = 'notification';
    }, 3000);
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

// Format number with commas
function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0
    });
}
