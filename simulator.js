/**
 * SIMULATOR DATA WATER TANK
 * Script ini digunakan untuk mensimulasikan data dari sensor (misal ESP8266)
 * ke Firebase Realtime Database agar Dashboard terlihat bekerja.
 */

// Gunakan variabel db dari firebase-config.js
function startSimulator() {
    console.log("Simulator dimulai...");
    
    setInterval(() => {
        // Logika simulasi: Air berkurang/bertambah sedikit demi sedikit
        const tinggiMax = 200; // cm
        const literMax = 500;  // liter
        
        let tinggi = Math.floor(Math.random() * tinggiMax);
        let persen = Math.round((tinggi / tinggiMax) * 100);
        let liter = Math.round((persen / 100) * literMax);
        
        let status = "NORMAL";
        if (persen > 90) status = "FULL / BAHAYA";
        if (persen < 10) status = "HAMPIR HABIS";

        const data = {
            tinggi_air: tinggi,
            persen: persen,
            liter: liter,
            status: status,
            last_updated: new Date().toISOString()
        };

        db.ref("water_tank").set(data)
            .then(() => console.log("Data terkirim ke Firebase:", data))
            .catch(err => console.error("Gagal kirim data:", err));

    }, 5000); // Update setiap 5 detik
}

// Tambahkan tombol di dashboard untuk menyalakan simulator jika sedang mode development
// Atau panggil saja di console browser: startSimulator()
