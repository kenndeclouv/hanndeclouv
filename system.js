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
   * 🧨 deteksi link invite discord
   * - biasanya untuk mencegah promosi server lain
   */
  if (setting.antiInviteOn && /discord\.gg|discord\.com\/invite/.test(message.content)) {
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

  /**
   * 📛 sistem anti-spam
   * - mendeteksi jumlah pesan dalam jangka waktu pendek
   * - jika terlalu banyak, pesan dihapus
   */
  if (setting.antiSpamOn) {
    const now = Date.now();
    const windowMs = 5 * 1000; // 5 detik
    const maxMessages = 5; // maksimal 5 pesan

    if (!spamCache.has(guildId)) spamCache.set(guildId, new Map());
    const guildSpam = spamCache.get(guildId);

    let timestamps = guildSpam.get(userId) || [];
    timestamps = timestamps.filter((ts) => now - ts < windowMs);
    timestamps.push(now);
    guildSpam.set(userId, timestamps);

    if (timestamps.length >= maxMessages) {
      guildSpam.delete(userId); // bersihin cache user biar ga spam terus
      await sendWarning(message, "Proteksi Anti-spam", message.content, setting);
      return message.delete();
    }
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
      title: "> 🚨 Automod Log",
      fields: [
        { name: "User", value: `<@${message.author.id}>` },
        { name: "Alasan", value: reason },
        { name: "Channel", value: `<#${message.channel.id}>` },
        {
          name: "Isi Pesan",
          value: originalContent?.slice(0, 1000) || "(tidak tersedia)",
        },
      ],
      timestamp: new Date(),
    };

    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
};
