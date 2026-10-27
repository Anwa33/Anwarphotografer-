# Nikon Tokina Studio APK Release Guide

Project Android ini sudah dipersiapkan untuk build release, tetapi Anda perlu membuat keystore lokal terlebih dahulu agar proses release benar-benar bisa menghasilkan APK yang valid.

Langkah build release:
1. Buat file `android/keystore.properties` dari contoh:
   - copy `android/keystore.properties.example` menjadi `android/keystore.properties`
2. Isi nilai keystore yang valid:
   - `storeFile=.../release-key.jks`
   - `storePassword=...`
   - `keyAlias=...`
   - `keyPassword=...`
3. Jalankan perintah berikut di folder `android`:
   - `./gradlew assembleRelease`
4. APK release akan dibuat di:
   - `android/app/build/outputs/apk/release/`

Catatan:
- `keystore.properties` dan file `.jks` sebaiknya tidak di-commit ke GitHub.
- Jika Anda tidak ingin membuat keystore, build debug tetap bisa dilakukan dengan:
  - `./gradlew assembleDebug`

Untuk menghasilakan APK dengan nama yang lebih rapi, Anda juga bisa menambahkan `applicationId` dan `versionName` sesuai branding final app Anda.
