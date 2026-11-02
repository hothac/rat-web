async function generateHash() {
    const input = document.getElementById("hash-input").value;
    const output = document.getElementById("hash-output");

    if (!input) {
        output.value = "";
        return;
    }

    // Brauzerin daxili Web Crypto API-ı vasitəsilə SHA-256 Hash almaq
    const msgBuffer = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    output.value = hashHex;
}


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
    
    const cmdLine = document.createElement("div");
    cmdLine.className = "output-line";
    cmdLine.innerHTML = `<span class="prompt">rat@hub:<span class="prompt-path">~</span>$</span> ${cmd}`;
    history.appendChild(cmdLine);

    const cleanCmd = cmd.toLowerCase().trim();
    let response = "";

    switch(cleanCmd) {
        case 'help':
            response = `<span class="text-yellow">Əsas Əmrlər:</span>
 - <span class="text-green">help</span>: Əmrlər siyahısını gösterir
 - <span class="text-green">clear</span>: Terminal ekranını təmizləyir
 - <span class="text-green">whoami</span>: Cari istifadəçi məlumatı
 - <span class="text-green">sysinfo</span>: Brauzer və sistem resursları
 - <span class="text-green">nmap</span>: Nmap əmr sintaksisi və nümunələr
 - <span class="text-green">gobuster</span>: Gobuster əmr sintaksisi və nümunələr`;
            break;

        case 'clear':
            history.innerHTML = "";
            return;

        case 'whoami':
            response = `<span class="text-blue">rat (Cyber Security Analyst / Admin)</span>`;
            break;

        case 'sysinfo':
            response = `OS / Platform: ${navigator.platform}
Ekran: ${window.screen.width}x${window.screen.height}
Cores: ${navigator.hardwareConcurrency || 'Bilinmir'}`;
            break;

        case 'nmap':
            response = `<span class="text-yellow">Nmap Command Reference:</span>
 SYN Scan: <span class="text-green">nmap -sS -p- &lt;target&gt;</span>
 Service/Version Detect: <span class="text-green">nmap -sV -sC -p 80,443 &lt;target&gt;</span>
 Aggressive Scan: <span class="text-green">nmap -A -T4 &lt;target&gt;</span>`;
            break;

        case 'gobuster':
            response = `<span class="text-yellow">Gobuster Directory Reference:</span>
 Dir Scan: <span class="text-green">gobuster dir -u http://&lt;target&gt; -w /path/to/wordlist.txt</span>
 DNS Subdomain Scan: <span class="text-green">gobuster dns -d &lt;domain&gt; -w /path/to/wordlist.txt</span>`;
            break;

        default:
            response = `<span class="text-red">Əmr tapılmadı: ${cmd}. 'help' yazaraq əmrlərə baxa bilərsiniz.</span>`;
    }

    const resLine = document.createElement("div");
    resLine.className = "output-line";
    resLine.innerHTML = response;
    history.appendChild(resLine);

    terminalBody.scrollTop = terminalBody.scrollHeight;
}