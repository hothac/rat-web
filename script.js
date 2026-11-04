// ==========================================
// 1. GİRİŞ VƏ PAROL YOXLANIŞI (INDEX & APP)
// ==========================================
const AUTH_USER = "rat";
const AUTH_PASS = "Admin@123!";

function handleLogin(event) {
    if (event && event.preventDefault) event.preventDefault();

    // Hem index.html (username) hem app.html (login-username) ID'lerini destekliyoruz
    const userInp = document.getElementById("username") || document.getElementById("login-username");
    const passInp = document.getElementById("password") || document.getElementById("login-password");
    const errorEl = document.getElementById("error-msg") || document.getElementById("login-error");
    const modal = document.getElementById("login-card") || document.getElementById("login-modal");
    const panelCard = document.getElementById("panel-card");

    if (!userInp || !passInp) return;

    const uValue = userInp.value.trim();
    const pValue = passInp.value.trim();

    if (uValue === AUTH_USER && pValue === AUTH_PASS) {
        sessionStorage.setItem("authenticated", "true");

        if (modal) {
            modal.classList.add("hidden");
            modal.style.setProperty("display", "none", "important");
        }
        if (panelCard) {
            panelCard.classList.remove("hidden");
            panelCard.style.display = "flex";
        }

        const cli = document.getElementById("cli-input");
        if (cli) cli.focus();
    } else {
        if (errorEl) {
            errorEl.innerText = "[!] İstifadəçi adı və ya şifrə yanlışdır!";
        }
    }
}
window.handleLogin = handleLogin;
window.checkAuth = handleLogin;

// index.html Sekmə Keçidləri
window.switchTab = function(tabName) {
    const tabs = document.querySelectorAll(".tab-content");
    const btns = document.querySelectorAll(".menu-btn");
    
    tabs.forEach(t => t.classList.add("hidden"));
    btns.forEach(b => b.classList.remove("active"));
    
    const targetTab = document.getElementById("tab-" + tabName);
    if (targetTab) targetTab.classList.remove("hidden");
    
    if (window.event && window.event.currentTarget) {
        window.event.currentTarget.classList.add("active");
    }
};

// Hash Generator Funksiyası
async function generateHash() {
    const input = document.getElementById("hash-input")?.value;
    const output = document.getElementById("hash-output");

    if (!input || !output) return;

    const msgBuffer = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    output.value = hashHex;
}
window.generateHash = generateHash;


// ==========================================
// 2. TERMINAL VƏ WEBSOCKET MƏNTİQİ
// ==========================================
let socket = null;
let currentPath = "~";
let commandHistory = [];
let historyIndex = -1;

const availableCommands = [
    "nmap", "gobuster", "sqlmap", "whois", "dig", "nslookup",
    "ping", "curl", "wget", "ls", "cd", "pwd", "clear", "help",
    "cat", "nano", "vim", "git", "ifconfig", "netstat"
];

if (document.getElementById("cli-input") || document.getElementById("output-history")) {
    socket = new WebSocket("wss://rat-terminal-backend.onrender.com/ws");

    socket.onopen = () => {
        console.log("Connected to Render backend server!");
    };

    socket.onmessage = (event) => {
        const history = document.getElementById("output-history");
        const terminalBody = document.getElementById("terminal-body");

        let rawText = event.data;
        let textToDisplay = "";

        try {
            const response = JSON.parse(rawText);
            if (response.type === "cwd") {
                currentPath = response.pwd;
                updatePromptPath();
                textToDisplay = response.output || "";
            } else if (response.output !== undefined) {
                textToDisplay = response.output;
            } else {
                textToDisplay = rawText;
            }
        } catch (e) {
            textToDisplay = rawText;
        }

        if (textToDisplay && history) {
            const resLine = document.createElement("div");
            resLine.className = "output-line";
            resLine.innerText = textToDisplay;
            history.appendChild(resLine);
        }

        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    };
}

function updatePromptPath() {
    const promptPathElements = document.querySelectorAll(".prompt-path");
    promptPathElements.forEach(el => el.innerText = currentPath);
}

function processCommand(cmd) {
    const history = document.getElementById("output-history");
    const terminalBody = document.getElementById("terminal-body");

    if (history) {
        const cmdLine = document.createElement("div");
        cmdLine.className = "output-line";
        cmdLine.innerHTML = `<span class="prompt">rat@hub:<span class="prompt-path">${currentPath}</span>$</span> ${cmd}`;
        history.appendChild(cmdLine);
    }

    const cleanCmd = cmd.trim();

    if (cleanCmd.toLowerCase() === 'clear') {
        if (history) history.innerHTML = "";
        return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command: cleanCmd }));
    } else {
        if (history) {
            const errLine = document.createElement("div");
            errLine.className = "output-line text-red";
            errLine.innerText = "[!] Backend bağlantısı hazır deyil.";
            history.appendChild(errLine);
        }
    }

    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
}


// ==========================================
// 3. SƏHİFƏ YÜKLƏNDİKDƏ İŞƏ DÜŞƏN MƏNTİQ
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Yoxlanışı (Giriş edilibsə modalı gizlət, paneli göstər)
    if (sessionStorage.getItem("authenticated") === "true") {
        const modal = document.getElementById("login-card") || document.getElementById("login-modal");
        const panelCard = document.getElementById("panel-card");
        
        if (modal) {
            modal.classList.add("hidden");
            modal.style.setProperty("display", "none", "important");
        }
        if (panelCard) {
            panelCard.classList.remove("hidden");
            panelCard.style.display = "flex";
        }
    }

    // 2. Daxil Ol Düyməsi Dinləyicisi (Həm index.html, həm app.html üçün)
    const loginBtn = document.getElementById("login-btn") || 
                     document.querySelector("button[onclick*='handleLogin']") ||
                     document.querySelector("#login-card button");
    if (loginBtn) {
        loginBtn.onclick = handleLogin;
    }

    // 3. Login Xanalarında Enter Dinləyicisi
    const passInput = document.getElementById("password") || document.getElementById("login-password");
    const userInput = document.getElementById("username") || document.getElementById("login-username");

    if (passInput) {
        passInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleLogin(e);
        });
    }
    if (userInput) {
        userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleLogin(e);
        });
    }

    // 4. Terminal İdarəetmə Hadisələri (Yalnız app.html üçün)
    const cliInput = document.getElementById("cli-input");
    if (cliInput) {
        cliInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                e.preventDefault();
                const command = this.value.trim();
                if (command !== "") {
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                    processCommand(command);
                    this.value = "";
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (commandHistory.length > 0 && historyIndex > 0) {
                    historyIndex--;
                    this.value = commandHistory[historyIndex];
                }
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    this.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    this.value = "";
                }
            } else if (e.key === "Tab") {
                e.preventDefault();
                const currentInput = this.value.trim();
                if (currentInput !== "") {
                    const matches = availableCommands.filter(cmd => cmd.startsWith(currentInput));
                    if (matches.length === 1) {
                        this.value = matches[0] + " ";
                    }
                }
            }
        });
    }
});

function processCommand(cmd) {
    const history = document.getElementById("output-history");
    const terminalBody = document.getElementById("terminal-body");

    if (history) {
        const cmdLine = document.createElement("div");
        cmdLine.className = "output-line";
        cmdLine.innerHTML = `<span class="prompt">rat@hub:<span class="prompt-path">${currentPath}</span>$</span> ${cmd}`;
        history.appendChild(cmdLine);
    }

    const cleanCmd = cmd.trim();

    if (cleanCmd.toLowerCase() === 'clear') {
        if (history) history.innerHTML = "";
        return;
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command: cleanCmd }));
    } else {
        if (history) {
            const errLine = document.createElement("div");
            errLine.className = "output-line text-red";
            errLine.innerText = "[!] Backend bağlantısı hazır deyil.";
            history.appendChild(errLine);
        }
    }

    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
}




// Səhifə yüklənəndə GeoIP və Sistem məlumatlarını çəkmək
document.addEventListener("DOMContentLoaded", () => {
    loadGeoIPInfo();
    loadSystemInfo();
    checkAllPings();
});

// 1. GeoIP və IP Məlumatı
async function loadGeoIPInfo() {
    const ipDiv = document.getElementById("ip-info");
    if (!ipDiv) return;
    
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        ipDiv.innerHTML = `
            <b>IP Ünvan:</b> ${data.ip || 'Naməlum'}<br>
            <b>Ölkə:</b> ${data.country_name || 'Naməlum'} (${data.country_code})<br>
            <b>Şəhər:</b> ${data.city || 'Naməlum'}<br>
            <b>Provayder (ISP):</b> ${data.org || 'Naməlum'}
        `;
    } catch (error) {
        ipDiv.innerHTML = "<span style='color: #f85149;'>[!] IP məlumatlarını çəkmək mümkün olmadı (API limit və ya şəbəkə xətası).</span>";
    }
}

// 2. Sistem və Brauzer Məlumatı
function loadSystemInfo() {
    const sysDiv = document.getElementById("sys-info");
    if (!sysDiv) return;

    const ua = navigator.userAgent;
    const platform = navigator.platform || "Naməlum";
    const cores = navigator.hardwareConcurrency || "Təyin olunmayıb";
    const memory = navigator.deviceMemory ? navigator.deviceMemory + " GB+" : "Naməlum";
    const language = navigator.language || "Naməlum";

    sysDiv.innerHTML = `
        <b>Əməliyyat Sistemi / Platforma:</b> ${platform}<br>
        <b>CPU Nüvə Sayı (Logical Cores):</b> ${cores}<br>
        <b>Təxmini RAM:</b> ${memory}<br>
        <b>Brauzer Dili:</b> ${language}<br>
        <b>User-Agent:</b> <span style="font-size: 0.8rem; color: #8b949e;">${ua}</span>
    `;
}

// 3. Ping / Latency Simulyasiyası (Fetch vasitəsilə gecikmə ölçmə)
async function checkAllPings() {
    setPing("ping-google", "https://www.google.com/favicon.ico");
    setPing("ping-cf", "https://1.1.1.1/favicon.ico");
    setPing("ping-thm", "https://tryhackme.com/favicon.ico");
}

async function setPing(elementId, url) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.innerText = "Ölçülür...";
    const start = performance.now();
    try {
        // mode: 'no-cors' sayəsində xarici favicon-lara sorğu atıb cavab müddətini ölçə bilirik
        await fetch(url, { mode: 'no-cors', cache: 'no-store' });
        const end = performance.now();
        const duration = Math.round(end - start);
        el.innerText = `${duration} ms`;
        el.style.color = duration < 150 ? "#3fb950" : "#d29922";
    } catch (err) {
        el.innerText = "Timeout / Blok";
        el.style.color = "#f85149";
    }
}