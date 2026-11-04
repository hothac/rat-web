// CHEAT-SHEET LOGIC - BULLETPROOF COPY
const CHEAT_USER = "rat";
const CHEAT_PASS = "Admin@123!";

function handleCheatLogin(event) {
    if (event && event.preventDefault) event.preventDefault();

    const userInp = document.getElementById("cheat-login-username");
    const passInp = document.getElementById("cheat-login-password");
    const errorEl = document.getElementById("cheat-login-error");
    const modal = document.getElementById("cheat-login-modal");
    const dashboard = document.getElementById("cheat-dashboard");

    if (!userInp || !passInp) return;

    if (userInp.value.trim() === CHEAT_USER && passInp.value.trim() === CHEAT_PASS) {
        sessionStorage.setItem("cheat_authenticated", "true");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    } else {
        if (errorEl) errorEl.innerText = "[!] İstifadəçi adı və ya şifrə yanlışdır!";
    }
}
window.handleCheatLogin = handleCheatLogin;

document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem("cheat_authenticated") === "true") {
        const modal = document.getElementById("cheat-login-modal");
        const dashboard = document.getElementById("cheat-dashboard");
        if (modal) modal.classList.add("hidden");
        if (dashboard) dashboard.classList.remove("hidden");
    }
});

// 100% İŞLƏK KOPYALAMA MEXANİZMİ (Fallback üsulu)
function copyCode(btn) {
    const codeEl = btn.parentElement.querySelector("code");
    
    // Mətni düzgün oxumaq üçün içindəki HTML teqlərini təmizləyirik
    const textToCopy = codeEl.innerText;

    // Müvəqqəti textareas yaradıb mətni ora atırıq
    const textarea = document.createElement("textarea");
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" style="color: #3fb950;"></i>';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 1500);
        } else {
            console.error("Kopyalama uğursuz oldu.");
        }
    } catch (err) {
        console.error("Kopyalama xətası: ", err);
    }

    document.body.removeChild(textarea);
}
window.copyCode = copyCode;

// Canlı Axtarış Filtri
function filterCheats() {
    const query = document.getElementById("cheat-search").value.toLowerCase();
    const cards = document.querySelectorAll(".cheat-card");

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (text.includes(query)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
}
window.filterCheats = filterCheats;