// CRYPTO ANALYZER LOGIC
const CRYPTO_USER = "rat";
const CRYPTO_PASS = "Admin@123!";

function handleCryptoLogin(event) {
    if (event && event.preventDefault) event.preventDefault();

    const userInp = document.getElementById("crypto-login-username");
    const passInp = document.getElementById("crypto-login-password");
    const errorEl = document.getElementById("crypto-login-error");
    const modal = document.getElementById("crypto-login-modal");
    const dashboard = document.getElementById("crypto-dashboard");

    if (!userInp || !passInp) return;

    if (userInp.value.trim() === CRYPTO_USER && passInp.value.trim() === CRYPTO_PASS) {
        sessionStorage.setItem("crypto_authenticated", "true");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    } else {
        if (errorEl) errorEl.innerText = "[!] İstifadəçi adı və ya şifrə yanlışdır!";
    }
}
window.handleCryptoLogin = handleCryptoLogin;

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("crypto_authenticated") === "true") {
        const modal = document.getElementById("crypto-login-modal");
        const dashboard = document.getElementById("crypto-dashboard");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    }
});

// Şifrə Analiz və Entropiya Hesablama
function analyzePassword() {
    const pwd = document.getElementById("password-input").value;
    const lenEl = document.getElementById("stat-length");
    const entEl = document.getElementById("stat-entropy");
    const strEl = document.getElementById("stat-strength");

    if (!pwd) {
        lenEl.innerText = "0";
        entEl.innerText = "0 bits";
        strEl.innerText = "-";
        resetTimes();
        return;
    }

    const length = pwd.length;
    lenEl.innerText = length;

    // Simvol hovuzunun ölçüsünü təyin edirik (Pool size)
    let poolSize = 0;
    if (/[a-z]/.test(pwd)) poolSize += 26;
    if (/[A-Z]/.test(pwd)) poolSize += 26;
    if (/[0-9]/.test(pwd)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) poolSize += 32;

    // Entropiya hesablama: E = L * log2(PoolSize)
    const entropy = poolSize > 0 ? Math.round(length * Math.log2(poolSize)) : 0;
    entEl.innerText = `${entropy} bits`;

    // Təhlükəsizlik Səviyyəsi
    if (entropy < 28) {
        strEl.innerHTML = '<span style="color: #f85149;">Çox Zəif (Anında Qırılır)</span>';
    } else if (entropy < 36) {
        strEl.innerHTML = '<span style="color: #d29922;">Zəif</span>';
    } else if (entropy < 60) {
        strEl.innerHTML = '<span style="color: #58a6ff;">Orta</span>';
    } else if (entropy < 128) {
        strEl.innerHTML = '<span style="color: #3fb950;">Güclü</span>';
    } else {
        strEl.innerHTML = '<span style="color: #7ee787;">Kvant Dözümlü (Çox Güclü)</span>';
    }

    // Kombinasiya sayı: 2^entropy
    calculateBruteForceTimes(poolSize, length);
}
window.analyzePassword = analyzePassword;

function calculateBruteForceTimes(poolSize, length) {
    if (poolSize === 0 || length === 0) {
        resetTimes();
        return;
    }

    // Ümumi kombinasiya sayı = PoolSize ^ Length (Böyük ədədlər üçün BigInt və ya log istifadə edirik)
    // Sürətlər (saniyədə yoxlama):
    // CPU: 10 hash/s
    // GPU (RTX 4090): 100,000,000,000 hash/s (100 GH/s)
    // Rig (8x RTX 4090): 800,000,000,000 hash/s (800 GH/s)
    // Cloud: 10,000,000,000,000 hash/s (10 TH/s)

    const combinations = Math.pow(poolSize, length);

    document.getElementById("time-cpu").innerText = formatTime(combinations / 10);
    document.getElementById("time-gpu").innerText = formatTime(combinations / 100000000000);
    document.getElementById("time-rig").innerText = formatTime(combinations / 800000000000);
    document.getElementById("time-cloud").innerText = formatTime(combinations / 10000000000000);
}

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds > 1e30) return "Milyardlarla il+";
    if (seconds < 1) return "1 saniyədən az";

    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const years = days / 365;
    const centuries = years / 100;

    if (centuries > 1) return `${Math.round(centuries)} əsr`;
    if (years > 1) return `${Math.round(years)} il`;
    if (days > 1) return `${Math.round(days)} gün`;
    if (hours > 1) return `${Math.round(hours)} saat`;
    if (minutes > 1) return `${Math.round(minutes)} dəqiqə`;
    return `${Math.round(seconds)} saniyə`;
}

function resetTimes() {
    document.getElementById("time-cpu").innerText = "-";
    document.getElementById("time-gpu").innerText = "-";
    document.getElementById("time-rig").innerText = "-";
    document.getElementById("time-cloud").innerText = "-";
}

// Güclü şifrə generatoru
function generateStrongPassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*!";
    let pwd = "";
    for (let i = 0; i < 16; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById("password-input").value = pwd;
    analyzePassword();
}
window.generateStrongPassword = generateStrongPassword;