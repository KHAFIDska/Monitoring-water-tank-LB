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

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Kirim Verifikasi Email
            user.sendEmailVerification().then(() => {
                alert("Registrasi berhasil! Silakan cek inbox (atau folder spam) email Anda untuk melakukan verifikasi sebelum login.");
                
                // Simpan data awal ke database
                db.ref("users/" + user.uid).set({
                    email: email,
                    createdAt: new Date().toISOString()
                });

                // Logout agar mereka harus verifikasi dulu sebelum masuk
                auth.signOut().then(() => {
                    window.location = "index.html";
                });
            });
        })
        .catch(err => {
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
    const captchaInput = document.getElementById("captchaInput").value;
    
    // Validasi Captcha
    if (!captchaInput) {
        alert("Silakan masukkan kode captcha!");
        return;
    }
    
    if (captchaInput.toLowerCase() !== window.captchaCode.toLowerCase()) {
        alert("Kode captcha salah! Silakan coba lagi.");
        generateCaptcha(); // Refresh captcha on failure
        document.getElementById("captchaInput").value = "";
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Cek apakah email sudah diverifikasi
            if (user.emailVerified) {
                window.location = "dashboard.html";
            } else {
                alert("Email Anda belum diverifikasi. Silakan cek inbox Anda.");
                auth.signOut(); // Paksa keluar jika belum verifikasi
            }
        })
        .catch(err => {
            alert("Login gagal: " + err.message);
            generateCaptcha(); // Refresh captcha on auth failure
            document.getElementById("captchaInput").value = "";
        });
}