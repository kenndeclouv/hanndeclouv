## 📁 Command Category: invites

### /invites

**Description:** Kelola undangan dan hadiah

### Usage:
- `/invites user user:@user`
- `/invites add user:@user number:100`
- `/invites remove user:@user number:100`
- `/invites leaderboard`
- `/invites reset user:@user`

### Options:
### For `user`:
Periksa undangan pengguna
- `user` (User) **[Required]**
  - Pengguna yang akan diperiksa

### For `add`:
Tambahkan undangan ke pengguna (Hanya pemilik)
- `user` (User) **[Required]**
  - Pengguna yang akan ditambahkan undangannya
- `number` (Number) **[Required]**
  - Jumlah undangan

### For `remove`:
Hapus undangan dari pengguna (Hanya pemilik)
- `user` (User) **[Required]**
  - Pengguna yang akan dihapus undangannya
- `number` (Number) **[Required]**
  - Jumlah undangan

### For `leaderboard`:
Lihat papan peringkat pengundang teratas
*No options*

### For `reset`:
Atur ulang undangan pengguna (Hanya pemilik)
- `user` (User) **[Required]**
  - Pengguna yang akan diatur ulang


---

