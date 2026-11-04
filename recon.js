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

// REAL DNS VƏ WHOIS / IP SORĞULARI
async function startReconScan(event) {
    if (event && event.preventDefault) event.preventDefault();

    const targetInput = document.getElementById("recon-target-input");
    const btn = document.getElementById("start-scan-btn");

    if (!targetInput || !targetInput.value) return;

    let target = targetInput.value.trim().toLowerCase();
    // URL daxil edilibsə (https:// və s.), yalnız domen adını təmizləyirik
    target = target.replace(/^(?:https?:\/\/)?(?:www\.)?/, '').split('/')[0];

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Axtarılır...';

    // Ekranı sıfırlayırıq
    document.getElementById("res-target-summary").innerText = "Yüklənir...";
    document.getElementById("res-ports").innerText = "Yüklənir...";
    document.getElementById("res-subdomains").innerText = "Yüklənir...";

    appendLog(`[+] Real sorğu başladı: ${target}`, "success");

    try {
        // 1. Google DNS-over-HTTPS vasitəsilə A rekordunu (IP) tapırıq
        appendLog(`[*] DNS (A Record) sorğulanır...`, "info");
        const dnsResp = await fetch(`https://dns.google/resolve?name=${target}&type=A`);
        const dnsData = await dnsResp.json();

        let resolvedIp = "";
        if (dnsData.Answer && dnsData.Answer.length > 0) {
            resolvedIp = dnsData.Answer[dnsData.Answer.length - 1].data;
            appendLog(`[✔] IP Ünvanı tapıldı: ${resolvedIp}`, "success");
        } else {
            // Əgər daxil edilən heç domen deyil, birbaşa IP-dir sə
            resolvedIp = target;
            appendLog(`[*] Birbaşa IP sorğusu icra edilir: ${resolvedIp}`, "info");
        }

        // 2. IP haqqında WHOIS / Geolocation məlumatlarını alırıq (ipapi.co API)
        appendLog(`[*] WHOIS və İstehsalçı/Geo məlumatları çəkilir...`, "info");
        const ipResp = await fetch(`https://ipapi.co/${resolvedIp}/json/`);
        const ipData = await ipResp.json();

        if (ipData && !ipData.error) {
            document.getElementById("res-target-summary").innerText = 
                `Domain/Host: ${target}\nIP: ${ipData.ip || resolvedIp}\nÖlkə: ${ipData.country_name || 'Bilinmir'}\nŞəhər: ${ipData.city || 'Bilinmir'}`;

            document.getElementById("res-ports").innerText = 
                `ASN: ${ipData.asn || 'N/A'}\nProvayder (ISP): ${ipData.org || ipData.network || 'Bilinmir'}\nOrg: ${ipData.version || 'IPv4'}`;
        } else {
            document.getElementById("res-target-summary").innerText = `Host: ${target}\nIP: ${resolvedIp}`;
            document.getElementById("res-ports").innerText = `Məlumat tapılmadı.`;
        }

        // 3. Domenin Mail (MX) rekordlarını çəkirik
        appendLog(`[*] DNS MX (Mail Server) rekordları yoxlanılır...`, "info");
        const mxResp = await fetch(`https://dns.google/resolve?name=${target}&type=MX`);
        const mxData = await mxResp.json();

        if (mxData.Answer && mxData.Answer.length > 0) {
            const mxList = mxData.Answer.map(item => item.data).join("\n");
            document.getElementById("res-subdomains").innerText = mxList;
            appendLog(`[✔] ${mxData.Answer.length} ədəd Mail server tapıldı.`, "success");
        } else {
            document.getElementById("res-subdomains").innerText = "MX rekordları tapılmadı.";
            appendLog(`[-] MX rekordu yoxdur.`, "warn");
        }

        appendLog(`[✔] Bütün real məlumatlar uğurla gətirildi!`, "success");

    } catch (err) {
        appendLog(`[!] Xəta baş verdi: Sorğu tamamlanamadı.`, "error");
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Taramanı Başlat';
    }
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