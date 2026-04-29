@echo off
setlocal

:: Menampilkan pesan header yang keren
echo ==========================================
echo    BINA ELEKTRIC - AUTO DEPLOY SCRIPT
echo ==========================================

:: Meminta pesan commit dari user
set /p commit_msg="Masukkan pesan pembaruan (update code): "

if "%commit_msg%"=="" (
    set commit_msg="Pembaruan rutin: %date% %time%"
)

echo.
echo [+] Menyiapkan file untuk dikirim...
git add .

echo [+] Membuat catatan pembaruan: %commit_msg%
git commit -m "%commit_msg%"

echo [+] Mengirim ke GitHub (dan otomatis ke Netlify)...
git push origin main

echo.
echo ==========================================
echo    PEMBARUAN SELESAI! 
echo    Cek dashboard Netlify Anda untuk status.
echo ==========================================
pause
