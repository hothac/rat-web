// WIRESHARK ANALYZER - LOGIC
const SOC_USER = "rat";
const SOC_PASS = "@@@@stfu@@@@42";

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
        
        // Giriş yapılır yapılmaz paket akışını başlatıyoruz!
        startPacketStream();
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
        startPacketStream();
    }
});

// Real-time Paket Generasiya Funksiyası (Wireshark Təqlidi)
const protocols = ["TCP", "UDP", "HTTP", "DNS", "TLS"];
const sampleIps = ["192.168.1.15", "10.0.0.4", "142.250.190.46", "151.101.193.140", "8.8.8.8", "192.168.1.1"];
const sampleInfos = [
    "Standard query 0x1a2b A google.com",
    "GET /api/v1/status HTTP/1.1",
    "Client Hello, TLSv1.3",
    "Acknowledgment [SEQ=482 ACK=159 WIN=502]",
    "TCP port 443 retransmission",
    "UDP datagram length 128"
];

function startPacketStream() {
    // Üst-üste interval düşməməsi üçün yoxlayırıq
    if (window.packetInterval) clearInterval(window.packetInterval);

    window.packetInterval = setInterval(() => {
        if (!isStreaming) return;

        const now = new Date().toISOString().slice(11, 23);
        const src = sampleIps[Math.floor(Math.random() * sampleIps.length)];
        let dst = sampleIps[Math.floor(Math.random() * sampleIps.length)];
        while(src === dst) dst = sampleIps[Math.floor(Math.random() * sampleIps.length)];

        const proto = protocols[Math.floor(Math.random() * protocols.length)];
        const length = Math.floor(Math.random() * 1200) + 64;
        const info = sampleInfos[Math.floor(Math.random() * sampleInfos.length)];

        const packet = { id: packetId++, time: now, src, dst, proto, length, info };
        packetsData.push(packet);

        appendPacketRow(packet);

        if (packetsData.length > 100) {
            packetsData.shift();
            const tbody = document.getElementById("packet-table-body");
            if (tbody.firstChild) tbody.removeChild(tbody.firstChild);
        }
    }, 1200);
}

function appendPacketRow(pkt) {
    const tbody = document.getElementById("packet-table-body");
    if (!tbody) return;

    const row = document.createElement("tr");
    row.className = `proto-${pkt.proto.toLowerCase()}`;
    row.innerHTML = `
        <td>${pkt.id}</td>
        <td>${pkt.time}</td>
        <td>${pkt.src}</td>
        <td>${pkt.dst}</td>
        <td><b>${pkt.proto}</b></td>
        <td>${pkt.length}</td>
        <td>${pkt.info}</td>
    `;

    row.onclick = () => {
        document.querySelectorAll(".packet-table tr").forEach(r => r.classList.remove("selected"));
        row.classList.add("selected");
        showPacketDetails(pkt);
    };

    tbody.appendChild(row);
    tbody.parentElement.parentElement.scrollTop = tbody.parentElement.parentElement.scrollHeight;
}

function showPacketDetails(pkt) {
    const details = document.getElementById("packet-details-content");
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
    document.getElementById("packet-table-body").innerHTML = "";
    document.getElementById("packet-details-content").innerText = "Detallara baxmaq üçün paket seçin.";
}
window.clearPackets = clearPackets;

function filterPackets() {
    const query = document.getElementById("packet-filter").value.toLowerCase();
    const rows = document.querySelectorAll("#packet-table-body tr");
    
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(query) ? "" : "none";
    });
}
window.filterPackets = filterPackets;