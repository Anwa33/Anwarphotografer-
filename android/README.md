# Nikon Tokina Studio

Project Android untuk halaman `public/nikon_d3400_tokina_studio.html` dibuat sebagai WebView app.

Cara build:
1. Buka folder `android` di Android Studio.
2. Tunggu Gradle sync selesai.
3. Pilih `Build > Build Bundle(s) / APK(s) > Build APK(s)`.
4. Hasil APK akan muncul di `android/app/build/outputs/apk/debug/`.

Catatan:
- Aplikasi memuat file HTML dari `android/app/src/main/assets/nikon_d3400_tokina_studio.html`.
- Fitur upload foto pada halaman dijalankan dengan Android file chooser.
- Untuk generate APK release dibutuhkan keystore dan signing config.
