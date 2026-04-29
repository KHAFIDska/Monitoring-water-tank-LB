// Firebase is initialized in firebase-config.js

// REGISTER
function register() {
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            let uid = userCredential.user.uid;

            db.ref("users/" + uid).set({
                email: email
            });

            alert("Register berhasil!");
        })
        .catch(err => alert(err.message));
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
        .then(() => {
            window.location = "dashboard.html";
        })
        .catch(err => {
            alert("Login gagal: " + err.message);
            generateCaptcha(); // Refresh captcha on auth failure
            document.getElementById("captchaInput").value = "";
        });
}