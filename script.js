// Constants for easier updates and maintainability
const MIN_INVESTMENT = 550;
const REFERRAL_EARNING = 110; // 20% of Kshs 550
const MIN_WITHDRAWAL = 15000;

let referralEarnings = 0;

// Utility Functions
function showError(inputId, message) {
    const inputField = document.getElementById(inputId);
    inputField.style.border = "2px solid red";

    if (!inputField.nextSibling || !inputField.nextSibling.classList.contains("error-message")) {
        const errorElement = document.createElement("div");
        errorElement.className = "error-message";
        errorElement.textContent = message;
        errorElement.style.color = "red";
        inputField.parentNode.insertBefore(errorElement, inputField.nextSibling);
    }

    inputField.focus();
}

function resetForm(formId) {
    const form = document.getElementById(formId);
    form.reset();

    // Clear error messages
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((error) => error.remove());

    // Reset input field styles
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
        input.style.border = "";
    });

    // Clear notification area
    const notificationArea = document.getElementById('notification-area');
    if (notificationArea) {
        notificationArea.textContent = "";
    }
}

function showSuccessMessage(message) {
    const notificationArea = document.getElementById('notification-area');
    notificationArea.textContent = message;
    notificationArea.style.color = "green";
}

function showErrorMessage(message) {
    const notificationArea = document.getElementById('notification-area');
    notificationArea.textContent = message;
    notificationArea.style.color = "red";
}

// Utility function to validate fields with regex
function validateField(value, regex, errorMessage, inputId) {
    if (!regex.test(value)) {
        showError(inputId, errorMessage);
        return false;
    }
    return true;
}

// Utility function to check if a number is valid
function isValidNumber(value) {
    return !isNaN(value) && value > 0;
}

// Utility function to sanitize user input
function sanitizeInput(input) {
    const tempElement = document.createElement('div');
    tempElement.textContent = input;
    return tempElement.innerHTML;
}

// Fetch M-Pesa Till Number
async function fetchMpesaTill() {
    // Replace API call with a hardcoded value
    return "3366998"; // Example Till number
}

// Initialize account balance
function initializeAccount() {
    const totalInvestment = localStorage.getItem('totalInvestment') || 0;
    document.getElementById('total-investment').textContent = `Kshs ${totalInvestment}`;
}

// Update account balance
function updateAccountBalance(amount) {
    let totalInvestment = parseFloat(localStorage.getItem('totalInvestment') || 0);
    totalInvestment += amount;
    localStorage.setItem('totalInvestment', totalInvestment);
    document.getElementById('total-investment').textContent = `Kshs ${totalInvestment}`;
}

// Join Form Submission
const joinForm = document.getElementById('join-form');
if (joinForm) {
    joinForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const name = sanitizeInput(document.getElementById('name').value.trim());
        const email = sanitizeInput(document.getElementById('email').value.trim());
        const phone = sanitizeInput(document.getElementById('phone').value.trim());

        resetForm('join-form');

        if (!name) {
            showError('name', 'Full Name is required.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validateField(email, emailRegex, 'Please enter a valid email address.', 'email')) return;

        const phoneRegex = /^07\d{8}$/;
        if (!validateField(phone, phoneRegex, 'Please enter a valid Kenyan phone number (e.g., 07XXXXXXXX).', 'phone')) return;

        const mpesaTill = await fetchMpesaTill();
        if (name && email && phone) {
            // Display payment instructions
            const paymentInstructions = `
                <h3>Payment Instructions</h3>
                <p>To complete your registration, please pay <strong>Kshs 550</strong> to the following M-Pesa Till Number:</p>
                <p><strong>Till Number: ${mpesaTill}</strong></p>
                <p>Once payment is confirmed, you will receive a confirmation message.</p>
            `;
            const notificationArea = document.getElementById('notification-area');
            notificationArea.innerHTML = paymentInstructions;
            notificationArea.style.color = "black";
            notificationArea.style.backgroundColor = "#f9f9f9";
            notificationArea.style.border = "1px solid #ddd";
        } else {
            showErrorMessage('Please fill in all required fields.');
        }
    });
}

// Investment Form Submission
const investmentForm = document.getElementById('investment-form');
if (investmentForm) {
    investmentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const investAmount = parseFloat(sanitizeInput(document.getElementById('invest-amount').value.trim()));

        if (!isValidNumber(investAmount)) {
            showError('invest-amount', 'Please enter a valid investment amount greater than 0.');
            return;
        }

        updateAccountBalance(investAmount);
        showSuccessMessage(`You've successfully invested Kshs ${investAmount}.`);
        resetForm('investment-form');
    });
}

// Referral Earnings Calculation
function addReferralEarnings() {
    const referrals = parseInt(document.getElementById("referrals").value);
    if (isValidNumber(referrals) && referrals >= 1) {
        referralEarnings += referrals * REFERRAL_EARNING;
        document.getElementById("referral-earnings").textContent = `Total Referral Earnings: Kshs ${referralEarnings.toFixed(2)}`;
    } else {
        showError("referrals", "Please enter a valid number of referrals.");
    }
}

// Withdrawal Functionality
function submitWithdrawal() {
    const withdrawAmount = parseFloat(document.getElementById("withdraw-amount").value);

    if (isValidNumber(withdrawAmount)) {
        // Automatically decline the withdrawal and provide a reason
        showError("withdraw-amount", "Your withdrawal request has been declined. Please try again after 24 hours.");
        resetForm("withdrawal-form");
    } else {
        showError("withdraw-amount", "Please enter a valid withdrawal amount.");
    }
}

// Admin Approval (Simulated)
function approveWithdrawals() {
    if (confirm("Are you sure you want to approve all withdrawals?")) {
        showSuccessMessage("Withdrawals approved. Earnings updated.");
        referralEarnings = 0;
        document.getElementById("referral-earnings").textContent = `Total Referral Earnings: Kshs 0.00`;
    }
}

// Payment Proof Form Submission
const paymentProofForm = document.getElementById('payment-proof-form');
if (paymentProofForm) {
    paymentProofForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const transactionId = sanitizeInput(document.getElementById('transaction-id').value.trim());
        const phoneNumber = sanitizeInput(document.getElementById('phone-number').value.trim());

        if (!transactionId) {
            showError('transaction-id', 'Transaction ID is required.');
            return;
        }

        const phoneRegex = /^07\d{8}$/;
        if (!validateField(phoneNumber, phoneRegex, 'Please enter a valid Kenyan phone number (e.g., 07XXXXXXXX).', 'phone-number')) return;

        showSuccessMessage("Your payment proof has been submitted. We will verify your payment and update your account shortly.");
        resetForm('payment-proof-form');
    });
}

// Initialize account on page load
document.addEventListener('DOMContentLoaded', initializeAccount);
