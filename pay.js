let currentUser = null;

// Login Handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const accountNumber = document.getElementById('accountNumber').value;
    const password = document.getElementById('password').value;
    
    showLoading(true);
    
    try {
        const response = await fetch('/check_balance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `account_number=${accountNumber}&password=${password}`
        });
        
        const data = await response.json();
        showLoading(false);
        
        if (data.status === 'success') {
            currentUser = {
                account_number: accountNumber,
                password: password,
                name: data.name,
                balance: data.balance
            };
            showDashboard();
            updateAccountInfo();
        } else {
            showStatus('loginStatus', data.message, 'error');
        }
    } catch {
        showLoading(false);
        showStatus('loginStatus', 'Connection error. Please try again.', 'error');
    }
});

// Transfer Handler
document.getElementById('transferForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const recipientAccount = document.getElementById('recipientAccount').value;
    const amount = document.getElementById('transferAmount').value;
    const note = document.getElementById('transactionNote').value;
    
    if (!currentUser) {
        showStatus('paymentStatus', 'Please login first', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/transfer_money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `sender_account=${currentUser.account_number}&sender_password=${currentUser.password}&recipient_account=${recipientAccount}&amount=${amount}&transaction_note=${note}`
        });
        
        const data = await response.json();
        showLoading(false);
        
        if (data.status === 'success') {
            currentUser.balance = data.new_balance;
            updateAccountInfo();
            showTransactionReceipt(data);
            document.getElementById('transferForm').reset();
            hideAllSections();
        } else {
            showStatus('paymentStatus', data.message, 'error');
        }
    } catch {
        showLoading(false);
        showStatus('paymentStatus', 'Connection error. Please try again.', 'error');
    }
});

// Verify Account
async function verifyAccount() {
    const recipientAccount = document.getElementById('recipientAccount').value;
    
    if (!recipientAccount) {
        showStatus('paymentStatus', 'Please enter recipient account number', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/verify_account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `account_number=${recipientAccount}`
        });
        
        const data = await response.json();
        showLoading(false);
        
        if (data.status === 'success') {
            document.getElementById('recipientName').textContent = data.account_holder;
            document.getElementById('recipientInfo').classList.remove('hidden');
            showStatus('paymentStatus', `Account verified: ${data.account_holder}`, 'success');
        } else {
            document.getElementById('recipientInfo').classList.add('hidden');
            showStatus('paymentStatus', data.message, 'error');
        }
    } catch {
        showLoading(false);
        showStatus('paymentStatus', 'Connection error. Please try again.', 'error');
    }
}

// UI Helpers
function showDashboard() {
    document.getElementById('loginCard').classList.add('hidden');
    document.getElementById('paymentDashboard').classList.remove('hidden');
}
function updateAccountInfo() {
    if (currentUser) {
        document.getElementById('accountHolderName').textContent = currentUser.name;
        document.getElementById('currentBalance').textContent = `₹${currentUser.balance.toFixed(2)}`;
    }
}
function showTransferMoney() {
    hideAllSections();
    document.getElementById('transferSection').classList.remove('hidden');
}
function showQuickPay() {
    hideAllSections();
    document.getElementById('quickPaySection').classList.remove('hidden');
}
function showCheckBalance() {
    hideAllSections();
    updateAccountInfo();
}
function setQuickAmount(amount) {
    showTransferMoney();
    document.getElementById('transferAmount').value = amount;
}
function hideAllSections() {
    document.getElementById('transferSection').classList.add('hidden');
    document.getElementById('quickPaySection').classList.add('hidden');
    document.getElementById('transactionReceipt').classList.add('hidden');
}
function startNewTransaction() {
    hideAllSections();
    showTransferMoney();
}
function logout() {
    currentUser = null;
    document.getElementById('paymentDashboard').classList.add('hidden');
    document.getElementById('loginCard').classList.remove('hidden');
}
function showTransactionReceipt(data) {
    document.getElementById('receiptTxnId').textContent = data.transaction_id;
    document.getElementById('receiptFrom').textContent = currentUser.account_number;
    document.getElementById('receiptTo').textContent = data.recipient_account;
    document.getElementById('receiptAmount').textContent = `₹${data.amount}`;
    document.getElementById('receiptBalance').textContent = `₹${currentUser.balance.toFixed(2)}`;
    document.getElementById('receiptDateTime').textContent = new Date().toLocaleString();
    document.getElementById('transactionReceipt').classList.remove('hidden');
}
function showLoading(show) {
    document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
}
function showStatus(elementId, message, type) {
    const el = document.getElementById(elementId);
    el.innerHTML = `<div class="status-message status-${type}">${message}</div>`;
}
