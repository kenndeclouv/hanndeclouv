/**
 * dokumentasi sistem automoderation dan leveling
 * file: system.js
 * copyright © 2025 kenndeclouv
 * dibuat oleh: chaadeclouv
 *
 * file ini merupakan handler utama yang menangani event `messageCreate`
 * bot ini memfilter pesan dari user berdasarkan pengaturan (setting) server,
 * termasuk leveling, anti-badwords, anti-invite, anti-link, dan anti-spam.
 */

/**
 * 🔧 import modul internal
 */
const { addXp } = require("./helpers");
const BotSetting = require("./database/models/BotSetting");

// sistem cooldown dan spam disimpan dalam cache lokal berbasis Map
// masing-masing per server (guild) agar efisien dan tidak bentrok antar server
const spamCache = new Map(); // Map<guildId, Map<userId, timestamps[]>> -> spam tracking
const cooldown = new Map(); // Map<guildId-userId, lastTimestamp>

/**
 * 🧠 fungsi utama yang dijalankan setiap kali ada pesan baru di server
 */
module.exports = async (message) => {
  // abaikan pesan dari bot
  if (message.author.bot) return;

  const guildId = message.guild.id;
  const userId = message.author.id;

  // ambil pengaturan server dari cache database
  let setting = await BotSetting.getCache({ guildId: guildId });
  if (!setting) {
    setting = BotSetting.create({ guildId: guildId });
    BotSetting.saveAndUpdateCache("guildId");
  }
  /**
   * 🛑 abaikan channel tertentu jika diatur dalam pengaturan
   */
  if (Array.isArray(setting.ignoredChannels)) {
    if (setting.ignoredChannels.includes(message.channel.id)) {
      return; // skip pesan dari channel ini
    }
  }

  /**
   * ⛔ whitelist: user/role yang dikecualikan dari automod
   */
  if (Array.isArray(setting.whitelist)) {
    if (setting.whitelist.includes(userId)) return; // user masuk whitelist
    if (message.mentions.roles.size > 0 && [...message.mentions.roles.values()].some((r) => setting.whitelist.includes(r.id))) return; // role masuk whitelist
  }

  /**
   * 🤬 sistem deteksi kata kasar
   * - kata kasar didefinisikan oleh admin server
   * - pencocokan dilakukan menggunakan regex untuk fleksibilitas
   */
  if (setting.antiBadwordOn == true) {
    let badWords = setting.badwords ? setting.badwords : [];

    // parse string json jadi array jika perlu
    if (typeof badWords === "string") {
      try {
        badWords = JSON.parse(badWords);
      } catch (e) {
        console.error("❌ gagal parse badWords, reset ke array kosong");
        badWords = [];
      }
    }

    if (Array.isArray(badWords) && badWords.length > 0) {
      // escape karakter regex agar aman
      const escapedWords = badWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const regex = new RegExp(`(?:^|\\W)(${escapedWords.join("|")})`, "i");

      if (regex.test(message.content.toLowerCase())) {
        await sendWarning(message, "Proteksi Anti-kata kasar", message.content, setting);
        return message.delete(); // hapus pesan jika terdeteksi
      }
    }
  }

  /**
   * 📛 ANTI-SPAM ULTRA GUILD-WIDE
   * - mendeteksi spam dari user di semua channel dalam guild
   * - deteksi jumlah pesan dalam jangka waktu pendek
   */

  // if (setting.antiSpamOn) {
  //   const now = Date.now();
  //   const windowMs = 15 * 1000; // 15 detik
  //   const maxMessages = 2; // maksimal 2 pesan per 15 detik di semua channel

  //   if (!spamCache.has(guildId)) spamCache.set(guildId, new Map());
  //   const guildSpam = spamCache.get(guildId);

  //   if (!guildSpam.has(userId)) guildSpam.set(userId, []);

  //   let timestamps = guildSpam.get(userId).filter(ts => now - ts < windowMs);
  //   timestamps.push(now);
  //   guildSpam.set(userId, timestamps);

  //   if (timestamps.length >= maxMessages) {
  //     guildSpam.delete(userId); // reset cache buat user
  //     await sendWarning(message, "Proteksi Anti-spam", message.content, setting);
  //     return message.delete();
  //   }
  // }
  /**
   * 📛 SISTEM ANTI-SPAM & ANTI-DUPLICATE MESSAGE GLOBAL
   */

  const now = Date.now();
  const windowMs = 15 * 1000; // waktu deteksi spam
  const maxMessages = 5; // maksimal 5 pesan dalam 15 detik

  // inisialisasi cache
  if (!spamCache.has(guildId)) spamCache.set(guildId, new Map());
  const guildSpam = spamCache.get(guildId);

  if (!guildSpam.has(userId)) guildSpam.set(userId, []);
  let userMessages = guildSpam.get(userId);

  // filter pesan lama (yang udah lewat window)
  userMessages = userMessages.filter((msg) => now - msg.timestamp < windowMs);

  // tambahin pesan baru
  userMessages.push({
    timestamp: now,
    content: message.content.trim().toLowerCase(), // buat cek isi sama
    channelId: message.channel.id
  });

  guildSpam.set(userId, userMessages);

  // cek apakah ada banyak pesan sama persis
  const sameMessages = userMessages.filter(m => m.content === message.content.trim().toLowerCase());

  if (sameMessages.length >= 3) {
    // cari semua pesan di semua channel (limitasi ke last 10 aja per channel misalnya)
    const channels = message.guild.channels.cache.filter(c => c.isTextBased());
    for (const [_, channel] of channels) {
      try {
        const fetched = await channel.messages.fetch({ limit: 10 });
        fetched
          .filter(m => m.author.id === userId && m.content.trim().toLowerCase() === message.content.trim().toLowerCase())
          .forEach(m => m.delete().catch(() => { }));
      } catch (_) { }
    }

    // timeout user 10 menit (600 detik)
    try {
      await message.member.timeout(600_000, "Spam pesan yang sama di banyak channel");
    } catch (_) { }

    await sendWarning(message, "Proteksi Spam Duplikat (Pesan Sama)", message.content, setting);
    guildSpam.delete(userId);
    return;
  }

  // cek apakah terlalu banyak pesan berbeda dalam waktu singkat
  if (userMessages.length >= maxMessages) {
    await sendWarning(message, "Proteksi Spam Cepat (Isi Berbeda)", message.content, setting);
    await message.delete().catch(() => { });
    guildSpam.delete(userId);
    return;
  }

  /**
   * 📄 Proteksi Spam Mention 
   *   Jika pesan mengandung mention user/role sebanyak 3 atau lebih, pesan akan dihapus dan user mendapat peringatan.
   */
  if (setting.antiMentionOn) {
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    if (mentionCount >= 3) {
      await sendWarning(message, "Proteksi Spam Mention", message.content, setting);
      return message.delete();
    }
  }

  /**
 * 🎯 sistem leveling user berdasarkan pesan
 * - jika leveling aktif, tambahkan XP ke user
 * - tiap user per server dikenakan cooldown agar tidak spam XP
 */
  if (setting.levelingOn) {
    const channel = setting.levelingChannelId ? message.guild.channels.cache.get(setting.levelingChannelId) : message.channel;
    const xpPerMessage = typeof setting.levelingXp === "number" ? setting.levelingXp : 15;
    const cooldownTime = typeof setting.levelingCooldown === "number" ? setting.levelingCooldown : 60000; // default 1 menit

    const key = `${guildId}-${userId}`; // unik per server + user
    const now = Date.now();
    const lastTimestamp = cooldown.get(key) || 0;

    if (now - lastTimestamp >= cooldownTime) {
      // channel bisa null jika dihapus, biarkan addXp handle fallback
      await addXp(guildId, userId, xpPerMessage, message, channel);
      cooldown.set(key, now);
    }
  }

  /**
   * 🧨 DETEKSI LINK INVITE DISCORD 
   * tangkep semua bentuk link invite, termasuk yang pake spasi, backslash, invisible char, dll
   */

  const inviteRegex = /(?:https?:\/\/)?(?:www\.)?(?:discord(?:app)?\.com\/invite|discord\.gg|dsc\.gg|invite\.gg|disc\.gg|dscrdly\.com|discord\.me|discord\.io|discord\.link|discordplus\.me|joinmydiscord\.com)(?:[\s\\\/]*)[a-z0-9-]{2,}/i;

  // fungsi untuk bersihin pesan dari spasi, backslash, invisible char, dan huruf kapital
  const sanitize = (text) =>
    text
      .replace(/[\s\\]+/g, '') // hapus spasi dan backslash
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // hapus invisible char
      .toLowerCase(); // lowercase biar stabil

  const sanitizedContent = sanitize(message.content);

  // cek juga di embeds dan attachment
  const hasInviteInEmbed = message.embeds.some(embed =>
    inviteRegex.test(
      sanitize(embed.url || '') +
      sanitize(embed.description || '') +
      sanitize(embed.title || '')
    )
  );

  const hasInviteInAttachment = message.attachments.some(att =>
    inviteRegex.test(sanitize(att.url || ''))
  );

  // deteksi dan eksekusi
  if (
    setting.antiInviteOn &&
    (inviteRegex.test(sanitizedContent) || hasInviteInEmbed || hasInviteInAttachment)
  ) {
    await sendWarning(message, "Proteksi Anti-invite", message.content, setting);
    return message.delete();
  }

  /**
   * 🌐 deteksi link website umum
   * - mencegah spam link berbahaya atau promosi tidak diinginkan
   */
  if (setting.antiLinkOn && /https?:\/\/[^\s]+/.test(message.content)) {
    await sendWarning(message, "Proteksi Anti-link", message.content, setting);
    return message.delete();
  }
};

/**
 * 🚨 fungsi kirim peringatan ke user dan log ke channel
 * - memberi feedback langsung bahwa pesan mereka diblokir
 * - juga mencatat pelanggaran ke channel log server
 */
const sendWarning = async (message, reason, originalContent = null, setting) => {
  const warningMessage = `🚫 **Peringatan!** Pesan kamu dihapus karena **${reason}**.`;
  const warning = await message.channel.send(warningMessage);
  setTimeout(() => warning.delete(), 10000); // hapus warning setelah 10 detik

  const logChannel = message.guild.channels.cache.get(setting.modLogChannelId);
  if (logChannel) {
    const embed = {
      color: 0xff0000,
      // title: "> 🚨 Automod Log",
      description: [
        "## 🚨 Automod Log",
        `**User:** <@${message.author.id}> (\`${message.author.tag}\` | \`${message.author.id}\`)`,
        `**Channel:** <#${message.channel.id}> (\`${message.channel.name}\`)`,
        `**Alasan:** ${reason}`,
        "",
        originalContent
          ? `**Isi Pesan:**\n\`\`\`\n${originalContent.slice(0, 1000)}${originalContent.length > 1000 ? '... (terpotong)' : ''}\n\`\`\``
          : "**Isi Pesan:** (tidak tersedia)"
      ].join("\n"),
      fields: [
        { name: "User ID", value: message.author.id, inline: true },
        { name: "Username", value: message.author.tag, inline: true },
        { name: "Channel ID", value: message.channel.id, inline: true },
        { name: "Pesan Dikirim Pada", value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`, inline: true },
        // { name: "Pesan Link", value: `[Jump to Message](${message.url})`, inline: false },
      ],
      footer: {
        text: `Automod • ${message.guild.name}`,
        icon_url: message.guild.iconURL?.() || undefined,
      },
      timestamp: new Date(),
    };

    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
};
