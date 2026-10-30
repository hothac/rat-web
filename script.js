// ==========================================
// YENİ ALƏT: SHA-256 HASH GENERATOR
// ==========================================

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