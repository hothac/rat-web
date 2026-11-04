// ==========================================
// 1. GİRİŞ VƏ PAROL YOXLANIŞI (INDEX & APP)
// ==========================================
const AUTH_USER = "rat";
const AUTH_PASS = "@@@@stfu@@@@42";

function handleLogin(event) {
    if (event && event.preventDefault) event.preventDefault();

    const userInp = document.getElementById("login-username");
    const passInp = document.getElementById("login-password");
    const errorEl = document.getElementById("login-error");
    const modal = document.getElementById("login-modal");
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
    if (sessionStorage.getItem("authenticated") === "true") {
        const modal = document.getElementById("login-modal");
        const panelCard = document.getElementById("panel-card");
        if (modal) {
            modal.classList.add("hidden");
            modal.style.setProperty("display", "none", "important");
        }
        if (panelCard) {
            panelCard.classList.remove("hidden");
        }
    }

    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", handleLogin);
    }

    const passInput = document.getElementById("login-password");
    const userInput = document.getElementById("login-username");

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

    const cliInput = document.getElementById("cli-input");
    if (cliInput) {
        cliInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter