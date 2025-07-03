## 📁 Command Category: giveaway

### /giveaway

**Description:** Kelola giveaway

### Usage:
- `/giveaway start type:money duration:[duration] winners:100 prize:[prize] color:[color] role:@role`
- `/giveaway end message_id:[message_id]`
- `/giveaway cancel message_id:[message_id]`
- `/giveaway reroll message_id:[message_id]`

### Options:
### For `start`:
Mulai giveaway
- `type` (Text) **[Required]**
  - Tipe giveaway
  - Choices: `money`, `another`
- `duration` (Text) **[Required]**
  - Durasi (misal. 1 minggu 4 hari 12 menit)
- `winners` (Number) **[Required]**
  - Jumlah pemenang
- `prize` (Text) **[Required]**
  - Hadiah untuk giveaway
- `color` (Text)
  - Warna embed giveaway (hex code atau nama warna)
- `role` (Role)
  - Role yang akan diberikan

### For `end`:
Akhiri giveaway
- `message_id` (Text) **[Required]**
  - ID pesan dari giveaway

### For `cancel`:
Batalkan giveaway
- `message_id` (Text) **[Required]**
  - ID pesan dari giveaway

### For `reroll`:
Reroll pemenang giveaway
- `message_id` (Text) **[Required]**
  - ID pesan dari giveaway


---

