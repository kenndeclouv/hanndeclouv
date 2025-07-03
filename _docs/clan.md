## 📁 Command Category: clan

### /clan

**Description:** Command clan.

### Usage:
- `/clan create name:[name] emoji:[emoji] owner:[owner] color:[color] rules:[rules] logo:file.png`
- `/clan war time:[time] reward_type:money reward_amount:100`
- `/clan join clan:[clan]`
- `/clan leave`
- `/clan delete clan:[clan]`
- `/clan verify clan:[clan]`
- `/clan transfer clan:[clan] owner:[owner]`
- `/clan list`

### Options:
### For `create`:
Buat clan baru.
- `name` (Text) **[Required]**
  - Nama clan
- `emoji` (Text) **[Required]**
  - Emoji clan
- `owner` (Mentionable) **[Required]**
  - Ketua atau owner clan
- `color` (Text)
  - Warna clan (hex, contoh: #ff0000), atau kosongkan untuk warna random
- `rules` (Text)
  - Aturan clan (opsional), pisahkan dengan ','
- `logo` (File)
  - Logo/gambar clan

### For `war`:
Mulai perang clan.
- `time` (Text) **[Required]**
  - Durasi perang (contoh: 1h30m)
- `reward_type` (Text) **[Required]**
  - Jenis reward
  - Choices: `money`, `xp`
- `reward_amount` (Number) **[Required]**
  - Jumlah reward

### For `join`:
Bergabung ke clan.
- `clan` (Text) **[Required]** *(autocomplete)*
  - Nama clan

### For `leave`:
Keluar dari clan.
*No options*

### For `delete`:
Hapus clan yang ada.
- `clan` (Text) **[Required]** *(autocomplete)*
  - Nama clan yang ingin dihapus

### For `verify`:
Verify suatu clan
- `clan` (Text) **[Required]** *(autocomplete)*
  - Nama clan yang ingin dihapus

### For `transfer`:
Transfer kepemilikan suatu clan
- `clan` (Text) **[Required]** *(autocomplete)*
  - Nama clan yang ingin dihapus
- `owner` (Mentionable) **[Required]**
  - Ketua atau owner clan

### For `list`:
List semua clan.
*No options*


---

