## 📁 Command Category: ticket

### /ticket

**Description:** Perintah sistem tiket

### Usage:
- `/ticket setup channel:#channel staff-role:@role logs:#channel transcript:#channel title:[title] description:[description] name:[name] format:[format] button:[button] buttoncolor:Primary image:[image] thumbnail:[thumbnail] footer-text:[footer-text] footer-icon:[footer-icon] ticket-category:[ticket-category] ticket-description:[ticket-description] ticket-image:[ticket-image] ticket-thumbnail:[ticket-thumbnail] ticket-footer-text:[ticket-footer-text] ticket-footer-icon:[ticket-footer-icon]`
- `/ticket remove user:@user`
- `/ticket add user:@user`
- `/ticket close`
- `/ticket transcript`

### Options:
### For `setup`:
Atur sistem tiket
- `channel` (Channel) **[Required]**
  - Channel untuk pembuatan tiket
- `staff-role` (Role) **[Required]**
  - Role untuk staf
- `logs` (Channel) **[Required]**
  - Channel log untuk tiket
- `transcript` (Channel) **[Required]**
  - Channel untuk transkrip
- `title` (Text) **[Required]**
  - Judul untuk pesan tiket
- `description` (Text) **[Required]**
  - Deskripsi untuk pesan tiket
- `name` (Text) **[Required]**
  - Nama untuk tiket
- `format` (Text) **[Required]**
  - Format untuk tiket (contoh: {username}-support)[{username}, {guildname}, {date}, {timestamp}]
- `button` (Text)
  - Nama tombol untuk pesan tiket (contoh: Buat Tiket, Support, dll)
- `buttoncolor` (Text)
  - Warna tombol untuk pesan tiket (contoh: Primary, Secondary, Success, Danger, Link)
  - Choices: `Primary`, `Secondary`, `Success`, `Danger`, `Link`
- `image` (Text)
  - Image untuk pesan tiket (jika tidak ada, akan menggunakan avatar bot)
- `thumbnail` (Text)
  - Thumbnail untuk pesan tiket (jika tidak ada, akan menggunakan avatar bot)
- `footer-text` (Text)
  - Text untuk footer
- `footer-icon` (Text)
  - Icon untuk footer
- `ticket-category` (Text)
  - Buat channel tiket di ketegori yang ditentukan
- `ticket-description` (Text)
  - Deskripsi untuk pesan tiket
- `ticket-image` (Text)
  - Image untuk pesan tiket
- `ticket-thumbnail` (Text)
  - Thumbnail untuk pesan tiket
- `ticket-footer-text` (Text)
  - Text untuk footer
- `ticket-footer-icon` (Text)
  - Icon untuk footer

### For `remove`:
Hapus pengguna dari channel tiket
- `user` (User) **[Required]**
  - Pengguna yang akan dihapus

### For `add`:
Tambahkan pengguna ke channel tiket
- `user` (User) **[Required]**
  - Pengguna yang akan ditambahkan

### For `close`:
Tutup tiket dan hapus channel tiket.
*No options*

### For `transcript`:
Dapatkan transkrip dari tiket.
*No options*


---

