// Firebase is initialized in firebase-config.js

// List of common disposable email domains to block
const blockedDomains = [
    'mailinator.com', '10minutemail.com', 'temp-mail.org', 'guerrillamail.com',
    'dispostable.com', 'getnada.com', 'throwawaymail.com', 'yopmail.com'
];

function isDisposableEmail(email) {
    const domain = email.split('@')[1];
    return blockedDomains.includes(domain?.toLowerCase());
}

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

    if (isDisposableEmail(email)) {
        showNotification("Email sementara tidak diperbolehkan.", "error");
        return;
    }

    // Tampilkan loading jika ada (optional)
    const btn = event?.target || document.querySelector('button[onclick="register()"]');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Memproses... <i data-feather="loader"></i>';
    feather.replace();

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Kirim Verifikasi Email
            user.sendEmailVerification()
                .then(() => {
                    // Simpan data awal ke database
                    db.ref("users/" + user.uid).set({
                        email: email,
                        createdAt: new Date().toISOString(),
                        emailVerified: false
                    });

                    // Tampilkan State Sukses
                    document.getElementById("registerForm").style.display = "none";
                    document.getElementById("successState").style.display = "block";
                    document.getElementById("successEmailText").innerText = `Kami telah mengirimkan tautan verifikasi ke ${email}.`;
                    feather.replace();

                    // Logout agar mereka harus verifikasi dulu sebelum masuk (opsional, tapi polling butuh user stay logged in)
                    // auth.signOut(); // Jangan logout dulu agar bisa polling status

                    // Mulai polling status verifikasi
                    startVerificationPolling();
                })
                .catch(emailError => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    feather.replace();
                    console.error("Firebase Email Error Details:", emailError);
                    showNotification("Gagal kirim email verifikasi. Periksa koneksi atau Authorized Domains di Firebase.", "error");
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

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            if (user.emailVerified) {
                // Update status verifikasi di database jika perlu
                db.ref("users/" + user.uid).update({
                    emailVerified: true
                });
                window.location = "dashboard.html";
            } else {
                // Tampilkan pesan belum verifikasi dengan tombol resend
                if (loginMessage) {
                    loginMessage.style.display = "block";
                    loginMessage.innerHTML = `
                        <div class="alert alert-warning">
                            <p class="mb-2"><strong>Email belum diverifikasi!</strong></p>
                            <p class="mb-3" style="font-size: 0.9rem;">Silakan cek inbox Anda. Tidak menerima email?</p>
                            <button onclick="resendVerification()" class="btn-sm w-100">
                                Kirim Ulang Email Verifikasi <i data-feather="mail"></i>
                            </button>
                        </div>
                    `;
                    feather.replace();
                } else {
                    alert("Email Anda belum diverifikasi. Silakan cek inbox Anda.");
                }
                auth.signOut();
            }
        })
        .catch(err => {
            console.error("Login Error Details:", err);
            showNotification("Login gagal: " + err.message, "error");
            generateCaptcha();
            if (document.getElementById("captchaInput")) {
                document.getElementById("captchaInput").value = "";
            }
        });
}

function startVerificationPolling() {
    const checkInterval = setInterval(() => {
        const user = auth.currentUser;
        if (user) {
            user.reload().then(() => {
                if (user.emailVerified) {
                    clearInterval(checkInterval);
                    showNotification("Email berhasil diverifikasi! Mengalihkan...", "success");
                    
                    // Update status di database
                    db.ref("users/" + user.uid).update({
                        emailVerified: true
                    });

                    setTimeout(() => {
                        window.location = "dashboard.html";
                    }, 2000);
                }
            });
        }
    }, 3000); // Cek setiap 3 detik
}

function openEmailProvider() {
    const emailInput = document.getElementById("email");
    if (!emailInput) return;
    
    const email = emailInput.value;
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain === 'gmail.com') {
        window.open('https://mail.google.com', '_blank');
    } else if (domain === 'outlook.com' || domain === 'hotmail.com') {
        window.open('https://outlook.live.com', '_blank');
    } else if (domain === 'yahoo.com') {
        window.open('https://mail.yahoo.com', '_blank');
    } else {
        showNotification("Membuka provider email Anda...", "info");
        window.open('https://' + domain, '_blank');
    }
}

function resendVerification() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Masukkan email dan password Anda kembali untuk mengirim ulang verifikasi.");
        return;
    }

    // Login sementara untuk mendapatkan objek user
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            if (!user.emailVerified) {
                user.sendEmailVerification()
                    .then(() => {
                        alert("Email verifikasi telah dikirim ulang! Silakan cek inbox.");
                        auth.signOut();
                    })
                    .catch(e => {
                        console.error("Resend Error:", e);
                        alert("Gagal mengirim ulang: " + e.message + "\n\nPeriksa konfigurasi 'Authorized Domains' di Firebase.");
                    });
            } else {
                alert("Email Anda sudah terverifikasi. Silakan login.");
                window.location.reload();
            }
        })
        .catch(err => {
            alert("Gagal: " + err.message);
        });
}