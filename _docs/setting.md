## 📁 Command Category: setting

### /set

**Description:** Konfigurasi pengaturan Bot

### Usage:
- `/set automod whitelist action:add target:[target]`
- `/set automod badwords action:add word:[word]`
- `/set automod exception-channel action:add channel:#channel`
- `/set automod log-channel channel:#channel`
- `/set automod badwords-list`
- `/set automod exception-channel-list`
- `/set automod whitelist-list`
- `/set fitur anti-invites status:enable`
- `/set fitur anti-links status:enable`
- `/set fitur anti-spam status:enable`
- `/set fitur anti-badwords status:enable`
- `/set fitur server-stats status:enable`
- `/set fitur economy status:enable`
- `/set fitur giveaway status:enable`
- `/set fitur invites status:enable`
- `/set fitur suggestion status:enable`
- `/set fitur ticket status:enable`
- `/set fitur pet status:enable`
- `/set fitur clan status:enable`
- `/set fitur adventure status:enable`
- `/set fitur leveling status:enable`
- `/set fitur welcome-in status:enable`
- `/set fitur welcome-out status:enable`
- `/set fitur nsfw status:enable`
- `/set fitur checklist status:enable`
- `/set fitur minecraft-stats status:enable`
- `/set fitur testimony status:enable`
- `/set stats add format:[format] channel:#channel`
- `/set stats edit stats:[stats] channel:#channel format:[format]`
- `/set stats enable stats:[stats]`
- `/set stats disable stats:[stats]`
- `/set stats remove stats:[stats]`
- `/set admin edit action:add target:[target]`
- `/set admin admin-list`
- `/set welcome in-channel channel:#channel`
- `/set welcome out-channel channel:#channel`
- `/set welcome role role:@role`
- `/set welcome in-text text:[text]`
- `/set welcome out-text text:[text]`
- `/set cooldown daily cooldown:100`
- `/set cooldown beg cooldown:100`
- `/set cooldown lootbox cooldown:100`
- `/set cooldown work cooldown:100`
- `/set cooldown rob cooldown:100`
- `/set cooldown hack cooldown:100`
- `/set cooldown pet cooldown:100`
- `/set cooldown gacha cooldown:100`
- `/set leveling channel channel:#channel`
- `/set leveling cooldown cooldown:100`
- `/set leveling xp xp:100`
- `/set leveling rolereward action:add level:100 role:@role`
- `/set minecraft ip ip:[ip]`
- `/set minecraft port port:100`
- `/set minecraft ip-channel channel:#channel`
- `/set minecraft port-channel channel:#channel`
- `/set minecraft status-channel channel:#channel`
- `/set language lang:id`
- `/set testimony channel channel:#channel`
- `/set testimony feedback-channel channel:#channel`
- `/set testimony count-channel channel:#channel`
- `/set testimony count-format format:[format]`
- `/set testimony reset-count`
- `/set testimony count value:100`
- `/set view`

### Options:
### For `automod whitelist`:
Tambah/hapus dari whitelist
- `action` (Text) **[Required]**
  - Tambah/hapus
  - Choices: `add`, `remove`
- `target` (Mentionable) **[Required]**
  - User/role

### For `automod badwords`:
Tambah/hapus kata kasar
- `action` (Text) **[Required]**
  - Tambah/hapus
  - Choices: `add`, `remove`
- `word` (Text) **[Required]**
  - Kata

### For `automod exception-channel`:
Tambah/hapus pengecualian channel
- `action` (Text) **[Required]**
  - Tambah/hapus
  - Choices: `add`, `remove`
- `channel` (Channel) **[Required]**
  - Channel untuk pengecualian

### For `automod log-channel`:
Channel untuk dijadikan log automod
- `channel` (Channel) **[Required]**
  - Pilih channel untuk dijadikan log automod

### For `automod badwords-list`:
Lihat daftar badwords
*No options*

### For `automod exception-channel-list`:
Lihat channel yang dikecualikan
*No options*

### For `automod whitelist-list`:
Lihat whitelist
*No options*

### For `fitur anti-invites`:
Aktif/nonaktifkan deteksi tautan undangan
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur anti-links`:
Aktif/nonaktifkan deteksi tautan umum
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur anti-spam`:
Aktif/nonaktifkan deteksi spam
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur anti-badwords`:
Aktif/nonaktifkan ban kata kasar
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur server-stats`:
Aktif/nonaktif server stats
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur economy`:
Aktif/nonaktif fitur economy
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur giveaway`:
Aktif/nonaktif fitur giveaway
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur invites`:
Aktif/nonaktif fitur invites
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur suggestion`:
Aktif/nonaktif fitur suggestion
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur ticket`:
Aktif/nonaktif fitur ticket
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur pet`:
Aktif/nonaktif fitur pet
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur clan`:
Aktif/nonaktif fitur clan
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur adventure`:
Aktif/nonaktif fitur adventure
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur leveling`:
Aktif/nonaktif fitur leveling
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur welcome-in`:
Aktif/nonaktif fitur welcome in
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur welcome-out`:
Aktif/nonaktif fitur welcome out
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur nsfw`:
Aktif/nonaktif fitur konten nsfw
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur checklist`:
Aktif/nonaktif fitur checklist
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur minecraft-stats`:
Aktif/nonaktif fitur minecraft server stats
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `fitur testimony`:
Aktif/nonaktif fitur testimony
- `status` (Text) **[Required]**
  - Aktifkan/nonaktifkan
  - Choices: `enable`, `disable`

### For `stats add`:
Tambah stat baru untuk channel tertentu
- `format` (Text) **[Required]**
  - Format stat, misal: {memberstotal}
- `channel` (Channel)
  - Pilih channel yang ingin dijadikan stat (jika tidak dipilih, bot akan membuat channel baru)

### For `stats edit`:
Edit format dari stat channel yang udah ada
- `stats` (Text) **[Required]** *(autocomplete)*
  - Pilih stats yang ingin diubah
- `channel` (Channel)
  - Edit channel stat
- `format` (Text)
  - Edit format stat, misal: {membersonline}

### For `stats enable`:
Aktifkan stat channel
- `stats` (Text) **[Required]** *(autocomplete)*
  - Pilih stats yang ingin diaktifkan

### For `stats disable`:
Nonaktifkan stat channel
- `stats` (Text) **[Required]** *(autocomplete)*
  - Pilih stats yang ingin dinonaktifkan

### For `stats remove`:
Hapus stat dan channel-nya
- `stats` (Text) **[Required]** *(autocomplete)*
  - Pilih stats yang ingin dihapus

### For `admin edit`:
Tambah/hapus admin
- `action` (Text) **[Required]**
  - Tambah/hapus
  - Choices: `add`, `remove`
- `target` (Mentionable) **[Required]**
  - User/role admin

### For `admin admin-list`:
Lihat daftar admin
*No options*

### For `welcome in-channel`:
Set channel welcome in
- `channel` (Channel) **[Required]**
  - Channel welcome in

### For `welcome out-channel`:
Set channel welcome out
- `channel` (Channel) **[Required]**
  - Channel welcome out

### For `welcome role`:
Set role welcome
- `role` (Role) **[Required]**
  - Role untuk welcome

### For `welcome in-text`:
Set teks welcome in
- `text` (Text) **[Required]**
  - Teks untuk welcome in

### For `welcome out-text`:
Set teks welcome out
- `text` (Text) **[Required]**
  - Teks untuk welcome out

### For `cooldown daily`:
Set cooldown daily
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `cooldown beg`:
Set cooldown beg
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `cooldown lootbox`:
Set cooldown lootbox
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `cooldown work`:
Set cooldown work
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `cooldown rob`:
Set cooldown rob
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `cooldown hack`:
Set cooldown hack
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `cooldown pet`:
Set cooldown pet
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `cooldown gacha`:
Set cooldown gacha
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `leveling channel`:
Set channel untuk pesan level up
- `channel` (Channel) **[Required]**
  - Channel untuk pesan level up

### For `leveling cooldown`:
Set cooldown mendapatkan XP
- `cooldown` (Number) **[Required]**
  - Cooldown dalam detik

### For `leveling xp`:
Set jumlah XP per pesan
- `xp` (Number) **[Required]**
  - Jumlah XP yang didapat per pesan

### For `leveling rolereward`:
Set role reward untuk level tertentu
- `action` (Text) **[Required]**
  - Tambah atau hapus role reward
  - Choices: `add`, `remove`
- `level` (Number) **[Required]**
  - Level yang dibutuhkan
- `role` (Role) **[Required]**
  - Role yang akan diberikan

### For `minecraft ip`:
Set IP server Minecraft
- `ip` (Text) **[Required]**
  - IP server Minecraft

### For `minecraft port`:
Set port server Minecraft
- `port` (Number) **[Required]**
  - Port server Minecraft

### For `minecraft ip-channel`:
Set channel untuk menampilkan IP server Minecraft
- `channel` (Channel) **[Required]**
  - Channel untuk IP Minecraft

### For `minecraft port-channel`:
Set channel untuk menampilkan port server Minecraft
- `channel` (Channel) **[Required]**
  - Channel untuk port Minecraft

### For `minecraft status-channel`:
Set channel untuk status server Minecraft
- `channel` (Channel) **[Required]**
  - Channel untuk status Minecraft

### For `language`:
Set bot language
- `lang` (Text) **[Required]**
  - Choose language
  - Choices: `id`, `en`

### For `testimony channel`:
Set channel untuk mengirim testimoni
- `channel` (Channel) **[Required]**
  - Channel testimoni

### For `testimony feedback-channel`:
Set channel untuk feedback testimoni
- `channel` (Channel) **[Required]**
  - Channel feedback testimoni

### For `testimony count-channel`:
Set channel untuk menampilkan jumlah testimoni (akan diubah namanya otomatis)
- `channel` (Channel) **[Required]**
  - Channel counter testimoni

### For `testimony count-format`:
Set format nama channel testimoni counter
- `format` (Text) **[Required]**
  - Format nama channel, gunakan {count} untuk jumlah. Contoh: testimoni-{count}

### For `testimony reset-count`:
Reset jumlah testimoni ke 0
*No options*

### For `testimony count`:
Ubah jumlah testimoni
- `value` (Number) **[Required]**
  - Integer

### For `view`:
Lihat semua pengaturan bot
*No options*


---

