## 📁 Command: moderation

### /announce

**Deskripsi:** Membuat pengumuman di channel yang ditentukan.

### Usage:
`/announce channel [channel]`
`/announce message [message]`

### Options:
### Untuk perintah (channel):
- `channel` (required) — Channel untuk pengumuman
  - **Contoh Penggunaan:** `/announce channel channel:[value]`
### Untuk perintah (message):
- `message` (required) — Pesan pengumuman
  - **Contoh Penggunaan:** `/announce message message:[value]`

---


### /ban

**Deskripsi:** Ban user dari server.

### Usage:
`/ban user [user]`
`/ban reason [reason]`

### Options:
### Untuk perintah (user):
- `user` (required) — User untuk diban
  - **Contoh Penggunaan:** `/ban user user:[value]`
### Untuk perintah (reason):
- `reason` — Alasan ban (opsional)
  - **Contoh Penggunaan:** `/ban reason reason:[value]`

---


### /clear

**Deskripsi:** menghapus pesan dari channel. (tidak bisa yang lebih dari 2 minggu)

### Usage:
`/clear amount [amount]`

### Options:
### Untuk perintah (amount):
- `amount` (required) — jumlah pesan untuk dihapus (0 = semua yang bisa)
  - **Contoh Penggunaan:** `/clear amount amount:[value]`

---


### /kick

**Deskripsi:** Kick user dari server.

### Usage:
`/kick user [user]`
`/kick reason [reason]`

### Options:
### Untuk perintah (user):
- `user` (required) — User untuk dikick
  - **Contoh Penggunaan:** `/kick user user:[value]`
### Untuk perintah (reason):
- `reason` — Alasan kick (opsional)
  - **Contoh Penggunaan:** `/kick reason reason:[value]`

---


### /lock

**Deskripsi:** Locks a channel to prevent messages.

### Usage:
`/lock channel [channel]`

### Options:
### Untuk perintah (channel):
- `channel` — Channel to lock
  - **Contoh Penggunaan:** `/lock channel channel:[value]`

---


### /mute

**Deskripsi:** Mutes a user in a voice channel.

### Usage:
`/mute user [user]`

### Options:
### Untuk perintah (user):
- `user` (required) — User to mute
  - **Contoh Penggunaan:** `/mute user user:[value]`

---


### /pin

**Deskripsi:** Pins a message in the channel.

### Usage:
`/pin message_id [message_id]`

### Options:
### Untuk perintah (message_id):
- `message_id` (required) — ID of the message to pin
  - **Contoh Penggunaan:** `/pin message_id message_id:[value]`

---


### /report

**Deskripsi:** Melaporkan pengguna kepada moderator.

### Usage:
`/report user [user]`
`/report reason [reason]`

### Options:
### Untuk perintah (user):
- `user` (required) — Pengguna yang dilaporkan
  - **Contoh Penggunaan:** `/report user user:[value]`
### Untuk perintah (reason):
- `reason` (required) — Alasan untuk laporan
  - **Contoh Penggunaan:** `/report reason reason:[value]`

---


### /role

**Deskripsi:** Menambahkan atau menghapus role dari pengguna.

### Usage:
`/role user [user]`
`/role role [role]`
`/role action [action]`

### Options:
### Untuk perintah (user):
- `user` (required) — Pengguna yang akan dimodifikasi
  - **Contoh Penggunaan:** `/role user user:[value]`
### Untuk perintah (role):
- `role` (required) — Role yang akan ditambahkan/dihapus
  - **Contoh Penggunaan:** `/role role role:[value]`
### Untuk perintah (action):
- `action` (required) — Pilih apakah akan menambahkan atau menghapus role.
  - Pilihan: `add`, `remove`
  - **Contoh Penggunaan:** `/role action action:add`

---


### /say

**Deskripsi:** Membuat bot mengirim pesan.

### Usage:
`/say message [message]`

### Options:
### Untuk perintah (message):
- `message` (required) — Pesan untuk dikirim
  - **Contoh Penggunaan:** `/say message message:[value]`

---


### /serverinfo

**Deskripsi:** Displays information about the server.

### Usage:

---


### /slowmode

**Deskripsi:** Sets the slowmode for the channel.

### Usage:
`/slowmode duration [duration]`

### Options:
### Untuk perintah (duration):
- `duration` (required) — Duration in seconds
  - **Contoh Penggunaan:** `/slowmode duration duration:[value]`

---


### /snipe

**Deskripsi:** Shows the most recent deleted message in this channel.

### Usage:

---


### /timeout

**Deskripsi:** Puts a user in timeout for a specified duration.

### Usage:
`/timeout user [user]`
`/timeout duration [duration]`

### Options:
### Untuk perintah (user):
- `user` (required) — User to timeout
  - **Contoh Penggunaan:** `/timeout user user:[value]`
### Untuk perintah (duration):
- `duration` (required) — Duration in seconds
  - **Contoh Penggunaan:** `/timeout duration duration:[value]`

---


### /unban

**Deskripsi:** Unbans a user from the server.

### Usage:
`/unban userid [userid]`

### Options:
### Untuk perintah (userid):
- `userid` (required) — User ID to unban
  - **Contoh Penggunaan:** `/unban userid userid:[value]`

---


### /unlock

**Deskripsi:** Unlocks a channel to allow messages.

### Usage:
`/unlock channel [channel]`

### Options:
### Untuk perintah (channel):
- `channel` — Channel to unlock
  - **Contoh Penggunaan:** `/unlock channel channel:[value]`

---


### /unmute

**Deskripsi:** Unmutes a user in a voice channel.

### Usage:
`/unmute user [user]`

### Options:
### Untuk perintah (user):
- `user` (required) — User to unmute
  - **Contoh Penggunaan:** `/unmute user user:[value]`

---


### /unpin

**Deskripsi:** Unpins a message in the channel.

### Usage:
`/unpin message_id [message_id]`

### Options:
### Untuk perintah (message_id):
- `message_id` (required) — ID of the message to unpin
  - **Contoh Penggunaan:** `/unpin message_id message_id:[value]`

---


### /userinfo

**Deskripsi:** Displays information about a user.

### Usage:
`/userinfo user [user]`

### Options:
### Untuk perintah (user):
- `user` — User to get info about
  - **Contoh Penggunaan:** `/userinfo user user:[value]`

---


### /warn

**Deskripsi:** Beri peringatan ke user.

### Usage:
`/warn user [user]`
`/warn reason [reason]`

### Options:
### Untuk perintah (user):
- `user` (required) — User untuk diberi peringatan
  - **Contoh Penggunaan:** `/warn user user:[value]`
### Untuk perintah (reason):
- `reason` (required) — Alasan
  - **Contoh Penggunaan:** `/warn reason reason:[value]`

---


### /warnings

**Deskripsi:** Menampilkan peringatan pengguna.

### Usage:
`/warnings user [user]`

### Options:
### Untuk perintah (user):
- `user` — Pengguna untuk memeriksa
  - **Contoh Penggunaan:** `/warnings user user:[value]`

---

