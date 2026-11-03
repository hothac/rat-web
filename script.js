// GİRİŞ MƏLUMATLARI
const AUTH_USER = "rat";
const AUTH_PASS = "@@@@stfu@@@@42";

function checkAuth() {
    const userInp = document.getElementById("login-username");
    const passInp = document.getElementById("login-password");
    const errorEl = document.getElementById("login-error");
    const modal = document.getElementById("login-modal");

    if (!userInp || !passInp) return;

    const uValue = userInp.value.trim();
    const pValue = passInp.value.trim();

    if (uValue === AUTH_USER && pValue === AUTH_PASS) {
        if (modal) modal.style.display = "none";
        sessionStorage.setItem("authenticated", "true");
        
        const cli = document.getElementById("cli-input");
        if (cli) cli.focus();
    } else {
        if (errorEl) {
            errorEl.innerText = "[!] İstifadəçi adı və ya şifrə yanlışdır!";
        }
    }
}

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

// WebSocket Bağlantısı
const socket = new WebSocket("wss://rat-terminal-backend.onrender.com/ws");
let currentPath = "~";

let commandHistory = [];
let historyIndex = -1;

const availableCommands = [
    "nmap", "gobuster", "sqlmap", "whois", "dig", "nslookup",
    "ping", "curl", "wget", "ls", "cd", "pwd", "clear", "help",
    "cat", "nano", "vim", "git", "ifconfig", "netstat"
];

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

    if (textToDisplay) {
        const resLine = document.createElement("div");
        resLine.className = "output-line";
        resLine.innerText = textToDisplay;
        history.appendChild(resLine);
    }

    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
};

function updatePromptPath() {
    const promptPathElements = document.querySelectorAll(".prompt-path");
    promptPathElements.forEach(el => el.innerText = currentPath);
}

// SƏHİFƏ YÜKLƏNDİKDƏ İŞƏ DÜŞƏN HADİSƏLƏR (BİR HİSSƏDƏ YIĞILDI)
document.addEventListener("DOMContentLoaded", () => {
    // 1. Session Yoxlanışı
    if (sessionStorage.getItem("authenticated") === "true") {
        const modal = document.getElementById("login-modal");
        if (modal) modal.style.display = "none";
    }

    // 2. Daxil Ol Düyməsinə Click Hadisəsi
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
        loginBtn.addEventListener("click", checkAuth);
    }

    // 3. Login Xanalarında Enter Hadisəsi
    const passInput = document.getElementById("login-password");
    const userInput = document.getElementById("login-username");

    if (passInput) {
        passInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") checkAuth();
        });
    }
    if (userInput) {
        userInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") checkAuth();
        });
    }

    // 4. Terminal İdaroetmə Hadisələri (Enter, Oxlar, Tab)
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

    const cmdLine = document.createElement("div");
    cmdLine.className = "output-line";
    cmdLine.innerHTML = `<span class="prompt">rat@hub:<span class="prompt-path">${currentPath}</span>$</span> ${cmd}`;
    history.appendChild(cmdLine);

    const cleanCmd = cmd.trim();

    if (cleanCmd.toLowerCase() === 'clear') {
        history.innerHTML = "";
        return;
    }

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ command: cleanCmd }));
    } else {
        const errLine = document.createElement("div");
        errLine.className = "output-line text-red";
        errLine.innerText = "[!] Backend bağlantısı hazır deyil.";
        history.appendChild(errLine);
    }

    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
}