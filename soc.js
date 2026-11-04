// WIRESHARK ANALYZER - FINAL STABLE LOGIC
const SOC_USER = "rat";
const SOC_PASS = "Admin@123!";

let packetId = 1;
let isStreaming = true;
let packetsData = [];

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
        
        // Daxil olan kimi axını başlat
        initStream();
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
        
        // Səhifə yüklənən kimi axını başlat
        initStream();
    }
});

const protocols = ["TCP", "UDP", "HTTP", "DNS", "TLS"];
const sampleIps = ["192.168.1.15", "10.0.0.4", "142.250.190.46", "151.101.193.140", "8.8.8.8", "192.168.1.1", "172.217.168.14"];
const sampleInfos = [
    "Standard query 0x1a2b A google.com",
    "GET /api/v1/status HTTP/1.1",
    "Client Hello, TLSv1.3",
    "Acknowledgment [SEQ=482 ACK=159 WIN=502]",
    "TCP port 443 retransmission",
    "UDP datagram length 128",
    "HTTP/1.1 200 OK (JSON)",
    "DNS Response A 142.250.190.46"
];

function initStream() {
    // Əgər əvvəlki interval qalıbsa təmizlə
    if (window.packetInterval) clearInterval(window.packetInterval);

    // Hər 1 saniyədə bir dənə paket atacaq
    window.packetInterval = setInterval(() => {
        if (!isStreaming) return;

        const tbody = document.getElementById("packet-table-body");
        if (!tbody) return; // Əgər element hələ yoxdursa gözlə

        const now = new Date().toISOString().slice(11, 23);
        const src = sampleIps[Math.floor(Math.random() * sampleIps.length)];
        let dst = sampleIps[Math.floor(Math.random() * sampleIps.length)];
        while(src === dst) dst = sampleIps[Math.floor(Math.random() * sampleIps.length)];

        const proto = protocols[Math.floor(Math.random() * protocols.length)];
        const length = Math.floor(Math.random() * 1200) + 64;
        const info = sampleInfos[Math.floor(Math.random() * sampleInfos.length)];

        const packet = { id: packetId++, time: now, src, dst, proto, length, info };
        packetsData.push(packet);

        const row = document.createElement("tr");
        row.className = `proto-${proto.toLowerCase()}`;
        row.innerHTML = `
            <td>${packet.id}</td>
            <td>${packet.time}</td>
            <td>${packet.src}</td>
            <td>${packet.dst}</td>
            <td><b>${packet.proto}</b></td>
            <td>${packet.length}</td>
            <td>${packet.info}</td>
        `;

        row.onclick = () => {
            document.querySelectorAll(".packet-table tr").forEach(r => r.classList.remove("selected"));
            row.classList.add("selected");
            showPacketDetails(packet);
        };

        tbody.appendChild(row);

        // Avtomatik aşağı kaydır
        const container = tbody.parentElement.parentElement;
        container.scrollTop = container.scrollHeight;

        // 100-dən çox olanda yuxarıdan sil ki, yaddaş dolmasın
        if (packetsData.length > 100) {
            packetsData.shift();
            if (tbody.firstChild) tbody.removeChild(tbody.firstChild);
        }
    }, 1000);
}

function showPacketDetails(pkt) {
    const details = document.getElementById("packet-details-content");
    if (!details) return;
    details.innerHTML = `Frame ${pkt.id}: ${pkt.length} bytes on wire\n` +
                        `Arrival Time: ${pkt.time}\n` +
                        `Source IP: ${pkt.src}\n` +
                        `Destination IP: ${pkt.dst}\n` +
                        `Protocol: ${pkt.proto}\n` +
                        `Payload Info: ${pkt.info}\n\n` +
                        `[Ethernet II, Src: 00:11:22:33:44:55, Dst: 66:77:88:99:aa:bb]\n` +
                        `[Internet Protocol Version 4, Src IP: ${pkt.src}, Dst IP: ${pkt.dst}]\n` +
                        `[Tcp Segment Data: Raw Hex Dump available (${pkt.length} bytes)]`;
}

function toggleStream() {
    isStreaming = !isStreaming;
    const btn = document.getElementById("toggle-stream-btn");
    if (!btn) return;
    if (isStreaming) {
        btn.className = "ctrl-btn pause";
        btn.innerHTML = '<i class="fas fa-pause"></i> Pauza';
    } else {
        btn.className = "ctrl-btn play";
        btn.innerHTML = '<i class="fas fa-play"></i> Davam et';
    }
}
window.toggleStream = toggleStream;

function clearPackets() {
    packetsData = [];
    packetId = 1;
    const tbody = document.getElementById("packet-table-body");
    if (tbody) tbody.innerHTML = "";
    const details = document.getElementById("packet-details-content");
    if (details) details.innerText = "Detallara baxmaq üçün paket seçin.";
}
window.clearPackets = clearPackets;

function filterPackets() {
    const queryInput = document.getElementById("packet-filter");
    if (!queryInput) return;
    const query = queryInput.value.toLowerCase();
    const rows = document.querySelectorAll("#packet-table-body tr");
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}
window.filterPackets = filterPackets;