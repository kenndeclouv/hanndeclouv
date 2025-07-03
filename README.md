<p align="center">
    <a href="https://kenndeclouv.rf.gd">
    <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0b5061df29d55a92d945_full_logo_blurple_RGB.svg" border="0" width="400" style="margin:0 auto; border-radius: 10px">
    </a>
</p>
<br />
<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/kenndeclouv/kythia">
  </a>

  <h3 align="center">Kythia Discord Bot</h3>
  <p align="center">
    <a href="https://github.com/kenndeclouv/kythia/issues">Report Bug</a>
    ·
    <a href="https://github.com/kenndeclouv/kythia/issues">Request Feature</a>
  </p>
</p>

## 📖 Overview

[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=kenndeclouv&repo=kythia&theme=tokyonight)](https://github.com/kenndeclouv)  
Kythia Discord Bot adalah bot Discord yang menyediakan berbagai fitur interaktif seperti sistem leveling, automod, dan perintah slash command untuk berbagai kebutuhan server Discord Anda. Dengan sistem leveling, pengguna mendapatkan XP setiap kali berinteraksi, dan diberikan reward berupa role tertentu setelah mencapai level tertentu.

## 📃 Features

- [x] **Moderation**: Perintah untuk moderasi seperti kick, ban, mute, dan lainnya.
- [x] **Slash Command**: Perintah untuk mengatur bot menggunakan slash command.
- [x] **Giveaway**: Perintah untuk melakukan giveaway di server.
- [x] **Automod**: Fitur automod untuk menjaga kebersihan dan kenyamanan server.
- [x] **Leveling System**: Sistem leveling yang memberikan XP berdasarkan aktivitas di channel.
- [x] **Cooldown XP**: Batasi pemberian XP dengan cooldown 1 menit.
- [x] **Role Rewards**: Memberikan role spesial saat mencapai level tertentu.
- [x] **Welcome Message**: Mengirim pesan selamat datang untuk member baru.
- [x] **Economy**: Perintah ekonomi seperti bank, kerja, shop, dan lainnya.
- [x] **Customizable**: Dapat disesuaikan sesuai dengan kebutuhan server.

## ⚙️ Prerequisites

Sebelum menjalankan bot ini, pastikan kamu telah menginstal hal-hal berikut:

1. **Node.js** (Versi terbaru)
2. **npm** (Biasanya terinstal bersama Node.js)
3. Token bot Discord dari [Discord Developer Portal](https://discord.com/developers/applications)
4. **Discord.js** library yang sudah terinstal
5. **MySQL** database terinstal

## 📖 Tutorial Instalasi

### 1. Siapkan Prasyarat

Pastikan kamu sudah menginstal software berikut:

1. **Node.js**

   - Unduh [Node.js](https://nodejs.org/) dan instal di komputer kamu.
   - Periksa instalasi dengan perintah berikut di terminal:
     ```bash
     node -v
     npm -v
     ```
     Jika versi Node.js dan npm muncul, berarti instalasi berhasil.

2. **Git**

   - Unduh dan instal [Git](https://git-scm.com/).
   - Periksa instalasi dengan:
     ```bash
     git --version
     ```

3. **Token Discord Bot**
   - Buka [Discord Developer Portal](https://discord.com/developers/applications).
   - Klik tombol **New Application**, beri nama bot, lalu buat.
   - Navigasi ke tab **Bot**, klik **Add Bot**, dan salin token bot.

### 2. Clone Repository

1. Buka terminal atau command prompt.
2. Pindah ke folder tempat kamu ingin menyimpan bot:
   ```bash
   cd path/to/your/folder
   ```
3. Clone repository:
   ```bash
   git clone https://github.com/kenndeclouv/kythia.git
   cd kythia
   ```

### 3. Install Dependencies

1. Pastikan kamu berada di dalam folder bot.
2. Jalankan perintah berikut untuk menginstal library yang dibutuhkan:
   ```bash
   npm install
   ```
3. Tunggu sampai semua dependensi selesai terinstal.

### 4. Setup File Environment

1. Buat file `.env` di folder root proyek.
2. Tambahkan konfigurasi berikut:

   ```env
   OWNER_ID=1158654757183959091
   # SETTINGS
   DISCORD_BOT_NAME=KythiaBot
   DISCORD_BOT_DESCRIPTION=Bot untuk server Discord
   DISCORD_BOT_TOKEN=your_bot_token
   DISCORD_BOT_CLIENT_ID=your_bot_client_id

   DISCORD_BOT_STATUS=online
   DISCORD_BOT_ACTIVITY=Playing with commands

   # DATABASE (MYSQL)
   DB_HOST=localhost
   DB_NAME=bot_db
   DB_USER=root
   DB_PASSWORD=password

   WEBHOOK_GUILD_INVITE="https://discord.com/api/webhooks/CHANNEL/TOKEN"
   WEBHOOK_ERROR_LOGS="https://discord.com/api/webhooks/CHANNEL/TOKEN"
   ```

   **Keterangan**:

   - `DISCORD_BOT_NAME`: Nama bot kamu.
   - `DISCORD_BOT_DESCRIPTION`: Deskripsi singkat tentang bot.
   - `DISCORD_BOT_TOKEN`: Token bot yang kamu dapatkan dari Discord Developer Portal.
   - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Konfigurasi database MySQL.

### 5. Jalankan Bot

1. Pastikan semua konfigurasi sudah benar.
2. Jalankan perintah berikut untuk memulai bot:
   ```bash
   node index.js
   ```
3. Jika bot berhasil berjalan, akan muncul pesan seperti:
   ```bash
   kenndeclouv#1234 terhubung!
   ```
4. Lihat di terminal apakah ada error atau tidak.
5. Jika tidak ada error, bot sudah berjalan dan siap digunakan.
6. Jika ada error, cek di file yang bersangkutan.
7. Pencet `ctrl + c` untuk menghentikan bot.

### 6. Undang Bot ke Server

1. Kembali ke [Discord Developer Portal](https://discord.com/developers/applications).
2. Pilih aplikasi bot kamu, lalu buka tab **OAuth2** > **URL Generator**.
3. Centang `bot` di scopes dan tambahkan permission yang dibutuhkan (misal: `Manage Roles`, `Send Messages`).
4. Salin URL yang dihasilkan, lalu buka di browser untuk mengundang bot ke server kamu.

### 7. Tes Bot

1. Buka server Discord tempat bot sudah diundang.
2. Ketik `/ping` untuk melihat status ping bot.
3. Selamat menggunakan bot!

## 🚀 Startup Commands

kamu bisa jalankan bot secara otomatis menggunakan [PM2](https://pm2.keymetrics.io/) — process manager untuk Node.js, berguna buat jalanin bot 24/7.

### 📦 Perintah PM2

| Perintah          | Deskripsi                                           |
| ----------------- | --------------------------------------------------- |
| `npm run startup` | install pm2, jalankan bot, dan simpan proses        |
| `npm run start`   | jalankan ulang proses yang udah disimpan            |
| `npm run restart` | restart bot                                         |
| `npm run stop`    | hentikan proses bot                                 |
| `npm run delete`  | hapus proses bot dari pm2                           |
| `npm run logs`    | lihat log bot secara realtime                       |
| `npm run seed`    | jalankan seeder (jika kamu pakai `run-seed.js`)     |
| `npm run test`    | jalankan file test/command (buat testing fitur bot) |

> pastikan kamu udah install dependencies dulu pakai `npm install` yaa sebelummu jalanin perintah apapun 😋

---

Untuk informasi lebih lanjut, kunjungi [website Kenndeclouv](https://kenndeclouv.my.id).