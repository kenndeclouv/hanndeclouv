# 📁 Command: moderation

## /announce

**Deskripsi:** Membuat pengumuman di channel yang ditentukan.

### Usage:
`/announce [channel]`
`/announce [message]`

### Options:
- `channel` (required) — Channel untuk pengumuman
  - **Contoh Penggunaan:** `/announce channel:[value]`
- `message` (required) — Pesan pengumuman
  - **Contoh Penggunaan:** `/announce message:[value]`

---


## /ban

**Deskripsi:** Ban user dari server.

### Usage:
`/ban [user]`

### Options:
- `user` (required) — User untuk diban
  - **Contoh Penggunaan:** `/ban user:[value]`

---


## /clear

**Deskripsi:** Menghapus pesan dari channel. (tidak bisa yang lebih dari 2 minggu)

### Usage:
`/clear [amount]`

### Options:
- `amount` (required) — Jumlah pesan untuk dihapus (0 = semua yg bisa)
  - **Contoh Penggunaan:** `/clear amount:[value]`

---


## /kick

**Deskripsi:** Kick user dari server.

### Usage:
`/kick [user]`

### Options:
- `user` (required) — User untuk dikick
  - **Contoh Penggunaan:** `/kick user:[value]`

---


## /lock

**Deskripsi:** Locks a channel to prevent messages.

### Usage:
`/lock [channel]`

### Options:
- `channel` — Channel to lock
  - **Contoh Penggunaan:** `/lock channel:[value]`

---


## /mute

**Deskripsi:** Mutes a user in a voice channel.

### Usage:
`/mute [user]`

### Options:
- `user` (required) — User to mute
  - **Contoh Penggunaan:** `/mute user:[value]`

---


## /pin

**Deskripsi:** Pins a message in the channel.

### Usage:
`/pin [message_id]`

### Options:
- `message_id` (required) — ID of the message to pin
  - **Contoh Penggunaan:** `/pin message_id:[value]`

---


## /report

**Deskripsi:** Melaporkan pengguna kepada moderator.

### Usage:
`/report [user]`
`/report [reason]`

### Options:
- `user` (required) — Pengguna yang dilaporkan
  - **Contoh Penggunaan:** `/report user:[value]`
- `reason` (required) — Alasan untuk laporan
  - **Contoh Penggunaan:** `/report reason:[value]`

---


## /role

**Deskripsi:** Menambahkan atau menghapus role dari pengguna.

### Usage:
`/role [user]`
`/role [role]`
`/role [action]`

### Options:
- `user` (required) — Pengguna yang akan dimodifikasi
  - **Contoh Penggunaan:** `/role user:[value]`
- `role` (required) — Role yang akan ditambahkan/dihapus
  - **Contoh Penggunaan:** `/role role:[value]`
- `action` (required) — Pilih apakah akan menambahkan atau menghapus role.
  - Pilihan: `Tambah`, `Hapus`
  - **Contoh Penggunaan:** `/role action:Tambah`

---


## /say

**Deskripsi:** Membuat bot mengirim pesan.

### Usage:
`/say [message]`

### Options:
- `message` (required) — Pesan untuk dikirim
  - **Contoh Penggunaan:** `/say message:[value]`

---


## /serverinfo

**Deskripsi:** Displays information about the server.

### Usage:
`/serverinfo`

---


## /slowmode

**Deskripsi:** Sets the slowmode for the channel.

### Usage:
`/slowmode [duration]`

### Options:
- `duration` (required) — Duration in seconds
  - **Contoh Penggunaan:** `/slowmode duration:[value]`

---


## /snipe

**Deskripsi:** Shows the most recent deleted message in this channel.

### Usage:
`/snipe`

---


## /timeout

**Deskripsi:** Puts a user in timeout for a specified duration.

### Usage:
`/timeout [user]`
`/timeout [duration]`

### Options:
- `user` (required) — User to timeout
  - **Contoh Penggunaan:** `/timeout user:[value]`
- `duration` (required) — Duration in seconds
  - **Contoh Penggunaan:** `/timeout duration:[value]`

---


## /unban

**Deskripsi:** Unbans a user from the server.

### Usage:
`/unban [userid]`

### Options:
- `userid` (required) — User ID to unban
  - **Contoh Penggunaan:** `/unban userid:[value]`

---


## /unlock

**Deskripsi:** Unlocks a channel to allow messages.

### Usage:
`/unlock [channel]`

### Options:
- `channel` — Channel to unlock
  - **Contoh Penggunaan:** `/unlock channel:[value]`

---


## /unmute

**Deskripsi:** Unmutes a user in a voice channel.

### Usage:
`/unmute [user]`

### Options:
- `user` (required) — User to unmute
  - **Contoh Penggunaan:** `/unmute user:[value]`

---


## /unpin

**Deskripsi:** Unpins a message in the channel.

### Usage:
`/unpin [message_id]`

### Options:
- `message_id` (required) — ID of the message to unpin
  - **Contoh Penggunaan:** `/unpin message_id:[value]`

---


## /userinfo

**Deskripsi:** Displays information about a user.

### Usage:
`/userinfo [user]`

### Options:
- `user` — User to get info about
  - **Contoh Penggunaan:** `/userinfo user:[value]`

---


## /warn

**Deskripsi:** Beri peringatan ke user.

### Usage:
`/warn [user]`
`/warn [reason]`

### Options:
- `user` (required) — User untuk diberi peringatan
  - **Contoh Penggunaan:** `/warn user:[value]`
- `reason` (required) — Alasan
  - **Contoh Penggunaan:** `/warn reason:[value]`

---


## /warnings

**Deskripsi:** Menampilkan peringatan pengguna.

### Usage:
`/warnings [user]`

### Options:
- `user` — Pengguna untuk memeriksa
  - **Contoh Penggunaan:** `/warnings user:[value]`

---

