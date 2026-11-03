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

socket.onopen = () => {
    console.log("Connected to Render backend server!");
};

socket.onmessage = (event) => {
    const history = document.getElementById("output-history");
    const terminalBody = document.getElementById("terminal-body");

    const resLine = document.createElement("div");
    resLine.className = "output-line";
    resLine.innerText = event.data;
    history.appendChild(resLine);

    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
};

socket.onerror = (error) => {
    console.error("WebSocket Error: ", error);
};

document.addEventListener("DOMContentLoaded", () => {
    const cliInput = document.getElementById("cli-input");
    
    if (cliInput) {
        cliInput.addEventListener("keydown", function(e) {
            if (e.key === "Enter") {
                const command = this.value.trim();
                if (command !== "") {
                    processCommand(command);
                    this.value = "";
                }
            }
        });
    }
});

function processCommand(cmd) {
    const history = document.getElementById("output-history");
    const terminalBody = document.getElementById("terminal-body");

    // Kullanıcının yazdığı komutu ekrana ekle
    const cmdLine = document.createElement("div");
    cmdLine.className = "output-line";
    cmdLine.innerHTML = `<span class="prompt">rat@hub:<span class="prompt-path">~</span>$</span> ${cmd}`;
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
        errLine.innerText = "[!] Backend bağlantısı hazır değil.";
        history.appendChild(errLine);
    }

    if (terminalBody) {
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }
}