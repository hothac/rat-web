// RECON HUB INDEPENDENT AUTH & REAL LOGIC
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
    if (sessionStorage.getItem("recon_authenticated") === "true") {
        const modal = document.getElementById("recon-login-modal");
        const dashboard = document.getElementById("recon-dashboard");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    }
});

// REAL DNS AND WHOIS / IP LOOKUP
async function startReconScan(event) {
    if (event && event.preventDefault) event.preventDefault();

    const targetInput = document.getElementById("recon-target-input");
    const btn = document.getElementById("start-scan-btn");

    if (!targetInput || !targetInput.value) return;

    let target = targetInput.value.trim().toLowerCase();
    target = target.replace(/^(?:https?:\/\/)?(?:www\.)?/, '').split('/')[0];

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tarayır...';

    document.getElementById("res-target-summary").innerText = "Yüklənir...";
    document.getElementById("res-ports").innerText = "Yüklənir...";
    document.getElementById("res-subdomains").innerText = "Yüklənir...";

    appendLog(`[+] Real sorğu başladı: ${target}`, "success");

    let resolvedIp = target;

    // 1. Google DNS A Record
    try {
        appendLog(`[*] DNS (A Record) sorğulanır...`, "info");
        const dnsResp = await fetch(`https://dns.google/resolve?name=${target}&type=A`);
        const dnsData = await dnsResp.json();

        if (dnsData.Answer && dnsData.Answer.length > 0) {
            const aRecord = dnsData.Answer.find(item => item.type === 1) || dnsData.Answer[dnsData.Answer.length - 1];
            resolvedIp = aRecord.data;
            appendLog(`[✔] IP Ünvanı tapıldı: ${resolvedIp}`, "success");
        } else {
            appendLog(`[*] Birbaşa IP və ya A rekordu tapılmadı: ${target}`, "info");
        }
    } catch (e) {
        appendLog(`[!] DNS A sorğusunda xəta baş verdi.`, "error");
    }

    // 2. WHOIS / Geolocation (ipwho.is API)
    try {
        appendLog(`[*] WHOIS və Provayder məlumatları çəkilir...`, "info");
        const ipResp = await fetch(`https://ipwho.is/${resolvedIp}`);
        const ipData = await ipResp.json();

        if (ipData && ipData.success !== false) {
            document.getElementById("res-target-summary").innerText = 
                `Domain/Host: ${target}\nIP: ${ipData.ip || resolvedIp}\nÖlkə: ${ipData.country || 'Bilinmir'}\nŞəhər: ${ipData.city || 'Bilinmir'}`;

            document.getElementById("res-ports").innerText = 
                `ASN: ${ipData.connection?.asn || 'N/A'}\nProvayder (ISP): ${ipData.connection?.isp || ipData.connection?.org || 'Bilinmir'}\nDomain: ${ipData.domain || target}`;
        } else {
            document.getElementById("res-target-summary").innerText = `Host: ${target}\nIP: ${resolvedIp}`;
            document.getElementById("res-ports").innerText = `Məlumat tapılmadı.`;
        }
    } catch (e) {
        document.getElementById("res-target-summary").innerText = `Host: ${target}\nIP: ${resolvedIp}`;
        document.getElementById("res-ports").innerText = `WHOIS servisinə bağlanıla bilmədi.`;
        appendLog(`[!] WHOIS sorğusunda xəta baş verdi.`, "error");
    }

    // 3. Google DNS MX Record
    try {
        appendLog(`[*] DNS MX (Mail Server) rekordları yoxlanılır...`, "info");
        const mxResp = await fetch(`https://dns.google/resolve?name=${target}&type=MX`);
        const mxData = await mxResp.json();

        if (mxData.Answer && mxData.Answer.length > 0) {
            const mxList = mxData.Answer.map(item => item.data).join("\n");
            document.getElementById("res-subdomains").innerText = mxList;
            appendLog(`[✔] ${mxData.Answer.length} ədəd Mail server tapıldı.`, "success");
        } else {
            document.getElementById("res-subdomains").innerText = "MX rekordları tapılmadı.";
            appendLog(`[-] MX rekordu yoxdur.`, "info");
        }
    } catch (e) {
        document.getElementById("res-subdomains").innerText = "MX sorğusu uğursuz oldu.";
        appendLog(`[!] MX sorğusunda xəta baş verdi.`, "error");
    }

    appendLog(`[✔] Tarama prosesi tamamlandı!`, "success");
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play"></i> Taramanı Başlat';
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