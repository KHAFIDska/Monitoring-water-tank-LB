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

// REGISTER
function register() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Email dan password harus diisi!");
        return;
    }

    if (isDisposableEmail(email)) {
        alert("Maaf, penggunaan email sementara tidak diperbolehkan. Silakan gunakan Gmail atau email resmi lainnya.");
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
            user.sendEmailVerification().then(() => {
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

                // Logout agar mereka harus verifikasi dulu sebelum masuk
                auth.signOut();
            });
        })
        .catch(err => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            feather.replace();
            
            if (err.code === 'auth/email-already-in-use') {
                alert("Email sudah terdaftar. Silakan login atau gunakan email lain.");
            } else {
                alert("Gagal daftar: " + err.message);
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
        alert("Silakan masukkan kode captcha!");
        return;
    }
    
    if (captchaInput.toLowerCase() !== window.captchaCode.toLowerCase()) {
        alert("Kode captcha salah! Silakan coba lagi.");
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
            alert("Login gagal: " + err.message);
            generateCaptcha();
            if (document.getElementById("captchaInput")) {
                document.getElementById("captchaInput").value = "";
            }
        });
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
                user.sendEmailVerification().then(() => {
                    alert("Email verifikasi telah dikirim ulang! Silakan cek inbox.");
                    auth.signOut();
                }).catch(e => {
                    alert("Gagal mengirim ulang: " + e.message);
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