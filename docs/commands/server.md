## 📁 Command Category: server

### /server

**Description:** Perintah terkait server

### Usage:
- `/server backup`
- `/server restore file:file.png clear:true`
- `/server clone name:[name] clear:true`

### Options:
### For `backup`:
Backup struktur server ke file JSON
*No options*

### For `restore`:
Restore struktur server dari file backup JSON
- `file` (File) **[Required]**
  - File backup server (.json)
- `clear` (True/False)
  - Hapus semua channel & role terlebih dahulu?

### For `clone`:
Clone struktur dari server lain yang bot join dan langsung restore ke server ini
- `name` (Text) **[Required]** *(autocomplete)*
  - Nama server sumber
- `clear` (True/False)
  - Hapus semua channel & role terlebih dahulu?


---

