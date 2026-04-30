// Firebase is initialized in firebase-config.js


// PREMIUM NOTIFICATION SYSTEM
function showNotification(message, type = 'info') {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'info';
    if (type === 'error') icon = 'alert-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'alert-triangle';

    toast.innerHTML = `
        <i data-feather="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    feather.replace();

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// REGISTER
function register() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (!email || !password) {
        showNotification("Email dan password harus diisi!", "warning");
        return;
    }

    // Tampilkan loading
    const btn = document.querySelector('button[onclick*="register"]');
    let originalText = "";
    if (btn) {
        originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Memproses... <i data-feather="loader" class="spin"></i>';
        if (typeof feather !== 'undefined') feather.replace();
    }

    try {
        auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Simpan data awal ke database
            db.ref("users/" + user.uid).set({
                email: email,
                createdAt: new Date().toISOString(),
                emailVerified: true // Set true secara otomatis untuk kemudahan
            }).then(() => {
                showNotification("Pendaftaran berhasil! Mengalihkan ke dashboard...", "success");
                setTimeout(() => {
                    window.location = "dashboard.html";
                }, 2000);
            });
        })
        .catch(err => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            feather.replace();
            
            if (err.code === 'auth/email-already-in-use') {
                showNotification("Email sudah terdaftar. Silakan login.", "warning");
            } else {
                console.error("Register Error:", err);
                showNotification("Gagal daftar: " + err.message, "error");
            }
        });
    } catch (e) {
        console.error("Critical Register Error:", e);
        showNotification("Terjadi kesalahan sistem. Silakan coba lagi.", "error");
    }
}

// LOGIN
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const captchaInput = document.getElementById("captchaInput")?.value;
    const loginMessage = document.getElementById("loginMessage");
    
    // Reset message
    if (loginMessage) {
        loginMessage.style.display = "none";
        loginMessage.innerHTML = "";
    }

    // Validasi Captcha
    if (!captchaInput) {
        showNotification("Silakan masukkan kode captcha!", "warning");
        return;
    }
    
    if (captchaInput.toLowerCase() !== window.captchaCode.toLowerCase()) {
        showNotification("Kode captcha salah!", "error");
        generateCaptcha();
        document.getElementById("captchaInput").value = "";
        return;
    }

    // Tampilkan loading
    const btn = document.querySelector('button[onclick*="login"]');
    let originalText = "";
    if (btn) {
        originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Memproses... <i data-feather="loader" class="spin"></i>';
        if (typeof feather !== 'undefined') feather.replace();
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Langsung masuk tanpa cek verifikasi
            window.location = "dashboard.html";
        })
        .catch(err => {
            console.error("Login Error Details:", err);
            showNotification("Login gagal: " + err.message, "error");
            generateCaptcha();
            if (document.getElementById("captchaInput")) {
                document.getElementById("captchaInput").value = "";
            }
        })
        .finally(() => {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalText;
                if (typeof feather !== 'undefined') feather.replace();
            }
        });
}
