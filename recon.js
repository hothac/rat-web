// RECON HUB - AUTH & PASSIVE DNS LOOKUP
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

    if (userInp.value.trim() === RECON_USER && passInp.value.trim() === RECON_PASS) {
        sessionStorage.setItem("recon_authenticated", "true");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    } else {
        if (errorEl) errorEl.innerText = "[!] İstifadəçi adı və ya şifrə yanlışdır!";
    }
}
window.handleReconLogin = handleReconLogin;

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("recon_authenticated") === "true") {
        const modal = document.getElementById("recon-login-modal");
        const dashboard = document.getElementById("recon-dashboard");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    }
});

// Google DNS-over-HTTPS vasitəsilə sorğu funksiyası
async function fetchDNSRecord(domain, type) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`, {
            headers: { 'Accept': 'application/dns-json' }
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.Answer || [];
    } catch (e) {
        return null;
    }
}

async function startReconScan(event) {
    if (event && event.preventDefault) event.preventDefault();

    const targetInput = document.getElementById("recon-target-input");
    const btn = document.getElementById("start-scan-btn");

    if (!targetInput || !targetInput.value) return;

    let target = targetInput.value.trim().toLowerCase();
    target = target.replace(/^(?:https?:\/\/)?(?:www\.)?/, '').split('/')[0].split(':')[0];

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sorğulanır...';

    const boxA = document.getElementById("res-a-records");
    const boxNS = document.getElementById("res-ns-records");
    const boxMX = document.getElementById("res-mx-records");

    boxA.innerText = "Yüklənir...";
    boxNS.innerText = "Yüklənir...";
    boxMX.innerText = "Yüklənir...";

    appendLog(`[+] Pasiv DNS təhlili başladı: ${target}`, "success");

    // 1. A REKORDLARI
    appendLog(`[*] DNS A (IP) rekordları sorğulanır...`, "info");
    const aRecords = await fetchDNSRecord(target, "A");
    if (aRecords && aRecords.length > 0) {
        boxA.innerText = aRecords.map(r => r.data).join("\n");
        appendLog(`[✔] ${aRecords.length} ədəd IP rekordu tapıldı.`, "success");
    } else {
        boxA.innerText = "A rekordu tapılmadı.";
        appendLog(`[-] A rekordu tapılmadı.`, "warn");
    }

    // 2. NS REKORDLARI
    appendLog(`[*] DNS NS (Name Server) rekordları sorğulanır...`, "info");
    const nsRecords = await fetchDNSRecord(target, "NS");
    if (nsRecords && nsRecords.length > 0) {
        boxNS.innerText = nsRecords.map(r => r.data).join("\n");
        appendLog(`[✔] ${nsRecords.length} ədəd NS server tapıldı.`, "success");
    } else {
        boxNS.innerText = "NS rekordu tapılmadı.";
        appendLog(`[-] NS rekordu tapılmadı.`, "warn");
    }

    // 3. MX REKORDLARI
    appendLog(`[*] DNS MX (Mail Server) rekordları sorğulanır...`, "info");
    const mxRecords = await fetchDNSRecord(target, "MX");
    if (mxRecords && mxRecords.length > 0) {
        boxMX.innerText = mxRecords.map(r => r.data).join("\n");
        appendLog(`[✔] ${mxRecords.length} ədəd Mail server tapıldı.`, "success");
    } else {
        boxMX.innerText = "MX rekordu tapılmadı.";
        appendLog(`[-] MX rekordu tapılmadı.`, "warn");
    }

    appendLog(`[✔] Pasiv təhlil uğurla başa çatdı!`, "success");
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> DNS Rekordlarını Çıxar';
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