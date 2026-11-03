// 1. Hash Generator Funksiyası
async function generateHash() {
    const input = document.getElementById("hash-input").value;
    const output = document.getElementById("hash-output");

    if (!input) {
        output.value = "";
        return;
    }

    const msgBuffer = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    output.value = hashHex;
}

const socket = new WebSocket("wss://rat-terminal-backend.onrender.com/ws");
let currentPath = "~";

// Əmrlər tarixçəsi (History) üçün dəyişənlər
let commandHistory = [];
let historyIndex = -1;

// Auto-complete (Tab) üçün əsas əmrlər siyahısı
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

document.addEventListener("DOMContentLoaded", () => {
    const cliInput = document.getElementById("cli-input");
    
    if (cliInput) {
        cliInput.addEventListener("keydown", function(e) {
            // 1. Enter düyməsi
            if (e.key === "Enter") {
                e.preventDefault();
                const command = this.value.trim();
                if (command !== "") {
                    // Tarixçəyə əlavə edirik
                    commandHistory.push(command);
                    historyIndex = commandHistory.length;
                    
                    processCommand(command);
                    this.value = "";
                }
            }
            // 2. Yuxarı Ox (ArrowUp) - Əvvəlki əmr
            else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (commandHistory.length > 0 && historyIndex > 0) {
                    historyIndex--;
                    this.value = commandHistory[historyIndex];
                }
            }
            // 3. Aşağı Ox (ArrowDown) - Növbəti əmr
            else if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    this.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    this.value = "";
                }
            }
            // 4. Tab düyməsi - Auto-complete
            else if (e.key === "Tab") {
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