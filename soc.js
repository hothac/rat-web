// SOC & LOG ANALYZER - INDEPENDENT AUTH & PARSER LOGIC
const SOC_USER = "rat";
const SOC_PASS = "Admin@123!";

let totalCount = 0;
let normalCount = 0;
let alertCount = 0;

function handleSocLogin(event) {
    if (event && event.preventDefault) event.preventDefault();

    const userInp = document.getElementById("soc-login-username");
    const passInp = document.getElementById("soc-login-password");
    const errorEl = document.getElementById("soc-login-error");
    const modal = document.getElementById("soc-login-modal");
    const dashboard = document.getElementById("soc-dashboard");

    if (!userInp || !passInp) return;

    if (userInp.value.trim() === SOC_USER && passInp.value.trim() === SOC_PASS) {
        sessionStorage.setItem("soc_authenticated", "true");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    } else {
        if (errorEl) errorEl.innerText = "[!] İstifadəçi adı və ya şifrə yanlışdır!";
    }
}
window.handleSocLogin = handleSocLogin;

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("soc_authenticated") === "true") {
        const modal = document.getElementById("soc-login-modal");
        const dashboard = document.getElementById("soc-dashboard");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    }
});

// Nümunə logları doldurmaq üçün
function loadSampleLog(type) {
    const input = document.getElementById("soc-log-input");
    if (!input) return;

    if (type === 'ssh') {
        input.value = "Failed password for invalid user admin from 198.51.100.42 port 44321 ssh2";
    } else if (type === 'web') {
        input.value = "192.168.1.15 - - [04/Nov/2026:14:20:10 +0400] \"GET /index.html HTTP/1.1\" 200 452";
    }
}
window.loadSampleLog = loadSampleLog;

// Log təhlil funksiyası
function analyzeLogEntry(event) {
    if (event && event.preventDefault) event.preventDefault();

    const input = document.getElementById("soc-log-input");
    const feed = document.getElementById("soc-alert-list");

    if (!input || !input.value.trim()) return;

    const logText = input.value.trim();
    totalCount++;

    // Əgər ilk logdursa placeholder-i silirik
    const placeholder = feed.querySelector(".feed-placeholder");
    if (placeholder) placeholder.remove();

    const now = new Date().toLocaleTimeString();
    const alertDiv = document.createElement("div");

    // Şübhəli sözlərin analizi (Failed, Invalid, Error, 404, 500 və s.)
    const isSuspicious = /failed|invalid|unauthorized|denied|error|401|403|500/i.test(logText);

    if (isSuspicious) {
        alertCount++;
        alertDiv.className = "alert-item danger";
        alertDiv.innerHTML = `
            <div class="alert-header">
                <span style="color: #f85149;"><i class="fas fa-triangle-exclamation"></i> SUSPICIOUS ACTIVITY</span>
                <span class="time">${now}</span>
            </div>
            <div class="alert-body">${escapeHtml(logText)}</div>
        `;
    } else {
        normalCount++;
        alertDiv.className = "alert-item success";
        alertDiv.innerHTML = `
            <div class="alert-header">
                <span style="color: #3fb950;"><i class="fas fa-check"></i> NORMAL EVENT</span>
                <span class="time">${now}</span>
            </div>
            <div class="alert-body">${escapeHtml(logText)}</div>
        `;
    }

    feed.insertBefore(alertDiv, feed.firstChild);
    updateMetrics();
    input.value = "";
}
window.analyzeLogEntry = analyzeLogEntry;

function updateMetrics() {
    document.getElementById("total-logs").innerText = totalCount;
    document.getElementById("normal-events").innerText = normalCount;
    document.getElementById("threat-alerts").innerText = alertCount;
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}