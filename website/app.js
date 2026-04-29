// Firebase is initialized in firebase-config.js

// REGISTER
function register() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const captchaInput = document.getElementById("captchaInput").value;
    const confirmUsage = document.getElementById("confirmUsage").checked;

    if (!email || !password) {
        alert("Silakan isi email dan kata sandi!");
        return;
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

    // Validasi Konfirmasi Penggunaan (Security Layer Tambahan)
    if (!confirmUsage) {
        alert("Silakan konfirmasi bahwa akun ini sedang Anda gunakan dengan mencentang kotak konfirmasi.");
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const uid = user.uid;

            // Simpan data ke database
            db.ref("users/" + uid).set({
                email: email,
                registeredAt: firebase.database.ServerValue.TIMESTAMP
            });

            // Kirim Email Verifikasi
            user.sendEmailVerification()
                .then(() => {
                    alert("Registrasi Berhasil! Silakan cek email Anda untuk verifikasi akun sebelum login.");
                    // Reset Captcha & Checkbox
                    generateCaptcha();
                    document.getElementById("captchaInput").value = "";
                    document.getElementById("confirmUsage").checked = false;
                })
                .catch(err => {
                    alert("Registrasi berhasil, namun gagal mengirim email verifikasi: " + err.message);
                });
        })
        .catch(err => {
            alert("Registrasi gagal: " + err.message);
            generateCaptcha();
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

            // Keamanan Ketat: Cek Verifikasi Email
            if (!user.emailVerified) {
                alert("Akun Anda belum diverifikasi. Silakan cek kotak masuk email Anda.");
                auth.signOut(); // Paksa keluar jika belum diverifikasi
                return;
            }

            window.location = "dashboard.html";
        })
        .catch(err => {
            alert("Login gagal: " + err.message);
            generateCaptcha(); // Refresh captcha on auth failure
            document.getElementById("captchaInput").value = "";
        });
}