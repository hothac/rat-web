// RECON HUB INDEPENDENT AUTH & LOGIC
const RECON_USER = "rat";
const RECON_PASS = "Admin@123!";

function handleReconLogin(event) {
    if (event && event.preventDefault) event.preventDefault();

    const userInp = document.getElementById("recon-login-username");
    const passInp = document.getElementById("recon-login-password");
    const errorEl = document.getElementById("recon-login-error");
    const modal = document.getElementById("recon-login-modal");
    const dashboard = document.getElementById("recon-dashboard");

    if (!userInp || !passInp) return;

    const uVal = userInp.value.trim();
    const pVal = passInp.value.trim();

    if (uVal === RECON_USER && pVal === RECON_PASS) {
        sessionStorage.setItem("recon_authenticated", "true");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    } else {
        if (errorEl) {
            errorEl.innerText = "[!] İstifadəçi adı və ya şifrə yanlışdır!";
        }
    }
}
window.handleReconLogin = handleReconLogin;

document.addEventListener("DOMContentLoaded", () => {
    // Autentifikasiya yoxlanışı
    if (sessionStorage.getItem("recon_authenticated") === "true") {
        const modal = document.getElementById("recon-login-modal");
        const dashboard = document.getElementById("recon-dashboard");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    }
});

// TARAMA SİMULASİYASI VƏ LOG İDARƏETMƏSİ
function startReconScan(event) {
    if (event && event.preventDefault) event.preventDefault();

    const targetInput = document.getElementById("recon-target-input");
    const btn = document.getElementById("start-scan-btn");

    if (!targetInput || !targetInput.value) return;

    const target = targetInput.value.trim();

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tarayır...';

    appendLog(`[+] Target təyin olundu: ${target}`, "success");
    appendLog(`[*] Recon modulları işə salınır...`, "info");

    // UI Simulyasiya Nümunəsi (Backend WebSocket inteqrasiyasına hazır strukturdadır)
    setTimeout(() => {
        if (document.getElementById("opt-whois").checked) {
            appendLog(`[*] WHOIS / DNS məlumatları toplanır...`, "warn");
            document.getElementById("res-target-summary").innerText = `Host: ${target}\nStatus: Active\nIP: 192.168.1.100`;
        }
    }, 1000);

    setTimeout(() => {
        if (document.getElementById("opt-portscan").checked) {
            appendLog(`[*] Nmap port taraması aparılır...`, "warn");
            document.getElementById("res-ports").innerText = `80/tcp  - HTTP (nginx)\n443/tcp - HTTPS (OpenSSL)\n22/tcp  - SSH (OpenSSH)`;
        }
    }, 2500);

    setTimeout(() => {
        if (document.getElementById("opt-subdomain").checked) {
            appendLog(`[*] Subdomain brute-force başladıldı...`, "warn");
            document.getElementById("res-subdomains").innerText = `api.${target}\nadmin.${target}\nmail.${target}`;
        }
    }, 4000);

    setTimeout(() => {
        appendLog(`[✔] Recon taraması uğurla tamamlandı!`, "success");
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Taramanı Başlat';
    }, 5000);
}
window.startReconScan = startReconScan;

function appendLog(text, type = "info") {
    const consoleOut = document.getElementById("recon-console-output");
    if (!consoleOut) return;

    const line = document.createElement("div");
    line.className = `log-line ${type}`;
    line.innerText = text;
    consoleOut.appendChild(line);
    consoleOut.scrollTop = consoleOut.scrollHeight;
}