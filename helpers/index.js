const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const TicketCounter = require("../database/models/TicketCounter");
const TicketConfig = require("../database/models/TicketConfig");
const BotSetting = require("../database/models/BotSetting");
const Ticket = require("../database/models/Ticket");
const User = require("../database/models/User");
const axios = require("axios");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

// Initialize langs object to store language data
const langs = {};

// Automatically load all language files from the lang directory
try {
  const langDir = path.join(__dirname, "../lang");
  if (fs.existsSync(langDir)) {
    fs.readdirSync(langDir)
      .filter((file) => file.endsWith(".json") || file.endsWith(".js"))
      .forEach((file) => {
        const lang = file.split(".")[0];
        try {
          langs[lang] = require(`../lang/${file}`);
        } catch (err) {
          console.error(`Error loading language file ${file}:`, err);
        }
      });
  } else {
    console.warn("Language directory not found at:", langDir);
  }
} catch (err) {
  console.error("Error loading language files:", err);
}

function t(key, lang = "en", vars = {}) {
  // Default to English if requested language doesn't exist
  let text = langs[lang]?.[key] || langs["en"]?.[key] || key;

  // Replace all variables in the text
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`{${k}}`, "g"), v);
  }
  return text;
}

function checkCooldown(lastTime, cooldownInSeconds) {
  const now = Date.now();
  if (lastTime && now - lastTime < cooldownInSeconds * 1000) {
    const timeLeftInSeconds = cooldownInSeconds - Math.floor((now - lastTime) / 1000);
    const hours = Math.floor(timeLeftInSeconds / 3600);
    const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
    const seconds = timeLeftInSeconds % 60;
    return { remaining: true, time: `${hours}h ${minutes}m ${seconds}s` };
  }
  return { remaining: false };
}

async function checkPermission(user) {
  const guildId = user.guild.id;

  // owner / owner server selalu bisa
  if (user.id === user.guild.ownerId || user.id === process.env.OWNER_ID) return true;

  // ambil data setting
  const botSetting = await BotSetting.getCache({ guildId: guildId });

  if (!botSetting || !Array.isArray(botSetting.admins)) return false;

  const adminList = botSetting.admins;

  // cek kalo user.id ada di list
  if (adminList.includes(user.id)) return true;

  // cek kalo ada role user yang ada di adminList
  const hasAdminRole = user.roles.cache.some((role) => adminList.includes(role.id));
  return hasAdminRole;
}
function parseDuration(duration) {
  if (!duration || typeof duration !== "string") return 0;
  // regex fix: angka + optional spasi + unit valid, no campur aduk
  const timeUnitRegex = /(\d+)\s*(detik|second|seconds|menit|min|mins|minute|minutes|jam|hour|hours|hari|day|days|pekan|minggu|week|weeks|s|m|h|j|d|w|p)\b/gi;
  let totalMilliseconds = 0;
  let match;

  while ((match = timeUnitRegex.exec(duration)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case "s":
      case "detik":
      case "second":
      case "seconds":
        totalMilliseconds += value * 1000;
        break;
      case "m":
      case "menit":
      case "min":
      case "mins":
      case "minute":
      case "minutes":
        totalMilliseconds += value * 60 * 1000;
        break;
      case "h":
      case "j":
      case "jam":
      case "hour":
      case "hours":
        totalMilliseconds += value * 60 * 60 * 1000;
        break;
      case "d":
      case "hari":
      case "day":
      case "days":
        totalMilliseconds += value * 24 * 60 * 60 * 1000;
        break;
      case "w":
      case "p":
      case "pekan":
      case "minggu":
      case "week":
      case "weeks":
        totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        break;
    }
  }

  return totalMilliseconds;
}
function toTinyText(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz";
  const tiny = ["ᴀ", "ʙ", "ᴄ", "ᴅ", "ᴇ", "ғ", "ɢ", "ʜ", "ɪ", "ᴊ", "ᴋ", "ʟ", "ᴍ", "ɴ", "ᴏ", "ᴘ", "ǫ", "ʀ", "s", "ᴛ", "ᴜ", "ᴠ", "ᴡ", "x", "ʏ", "ᴢ"];

  return text
    .split("")
    .map((char) => {
      const lowerChar = char.toLowerCase();
      const index = normal.indexOf(lowerChar);
      if (index !== -1) {
        return tiny[index];
      }
      return char;
    })
    .join("");
}
function toTinyBoldText(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz";
  const tinyBold = ["𝗮", "𝗯", "𝗰", "𝗱", "𝗲", "𝗳", "𝗴", "𝗵", "𝗶", "𝗷", "𝗸", "𝗹", "𝗺", "𝗻", "𝗼", "𝗽", "𝗾", "𝗿", "𝘀", "𝘁", "𝘂", "𝘃", "𝘄", "𝘅", "𝘆", "𝘇"];

  return text
    .split("")
    .map((char) => {
      const lowerChar = char.toLowerCase();
      const index = normal.indexOf(lowerChar);
      if (index !== -1) {
        return tinyBold[index];
      }
      return char;
    })
    .join("");
}

async function updateMemberCounters(guild, setting) {
  if (!guild || !setting) return;

  await guild.members.fetch(); // pastiin cache lengkap

  const totalMembers = guild.memberCount;
  const onlineMembers = guild.members.cache.filter((m) => m.presence && ["online", "idle", "dnd"].includes(m.presence.status)).size;

  const memberChannel = guild.channels.cache.get(setting.memberCountChannelId);
  const onlineChannel = guild.channels.cache.get(setting.onlineCountChannelId);

  if (memberChannel) await memberChannel.setName(`${totalMembers} MEMBERS`);
  if (onlineChannel) await onlineChannel.setName(`${onlineMembers} ONLINE`);
}

// rumus xp yg dibutuhin buat naik level
const levelUpXp = (level) => level * level * 50;

// fungsi buat nambah xp
const addXp = async (guildId, userId, xpToAdd, message, channel) => {
  if (!channel) {
    // coba fetch ulang setting
    const setting = await BotSetting.getCache({ guildId: message.guild.id });
    if (setting && setting.levelingChannelId) {
      channel = message.guild.channels.cache.get(setting.levelingChannelId) || null;
    }
  }
  let user = await User.getCache({ userId: userId, guildId: guildId });

  if (!user) {
    user = await User.create({ guildId, userId, xp: 0, level: 1 });
  }

  user.xp += xpToAdd;
  let leveledUp = false;
  const levelBefore = user.level;

  // cek terus sampai xp ga cukup buat naik level
  while (user.xp >= levelUpXp(user.level)) {
    user.xp -= levelUpXp(user.level);
    user.level += 1;
    leveledUp = true;
  }

  // update user di database
  await user.update({ xp: user.xp, level: user.level });
  await user.saveAndUpdateCache();
  // kalo ga naik level, udahan
  if (!leveledUp) return;

  const member = message.guild.members.cache.get(userId);
  const botSetting = await BotSetting.getCache({ guildId: message.guild.id });

  const embeds = [];

  // 🎁 cek role reward
  if (botSetting && Array.isArray(botSetting.roleRewards)) {
    // ambil semua reward yg dilewatin
    const rewards = botSetting.roleRewards.filter((r) => r.level > levelBefore && r.level <= user.level);

    for (const reward of rewards) {
      const role = message.guild.roles.cache.get(reward.role);
      if (role && member) {
        await member.roles.add(role).catch(() => {});

        embeds.push(
          new EmbedBuilder()
            .setColor("Blue")
            .setTitle("> Role reward!")
            .setDescription(`selamatt ${message.author}, kamu dapat role **${role.name}** karena naik ke level **${reward.level}**! 🏅`)
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp()
            .setFooter({
              text: `sistem level`,
              iconURL: message.client.user.displayAvatarURL(),
            })
        );
      }
    }
  }

  // 🎉 kirim notifikasi level up terakhir
  embeds.push(
    new EmbedBuilder()
      .setColor("Green")
      .setTitle("> Level Up!")
      .setDescription(`selamatt ${message.author}!, kamu telah naik ke level **${user.level}**! 🎉`)
      .setThumbnail(message.author.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: `sistem level`,
        iconURL: message.client.user.displayAvatarURL(),
      })
  );

  if (channel && embeds.length > 0) {
    await channel.send({ embeds }).catch(() => {});
  } else {
    console.log(`⚠️ Leveling Channel tidak ditemukan untuk XP user ${userId}`);
  }
};

// fungsi buat hitung level dari xp total
const calculateLevel = (xp) => {
  let level = 1;
  while (xp >= levelUpXp(level)) {
    xp -= levelUpXp(level);
    level += 1;
  }
  return level;
};

async function rolePrefix(guild) {
  try {
    await guild.members.fetch({ time: 10000 });
  } catch (err) {
    console.warn("❌ gagal fetch semua member (mungkin timeout), lanjut pakai cache aja");
  }

  const prefixPattern = /^[\[\(（【「].+?[\]\)）】」]/;

  const prefixRoles = guild.roles.cache
    .filter((role) => prefixPattern.test(role.name))
    .sort((a, b) => b.position - a.position)
    .map((role) => {
      const match = role.name.match(prefixPattern);
      return {
        roleId: role.id,
        prefix: match ? match[0] : "",
        position: role.position,
      };
    });

  let updated = 0;

  for (const member of guild.members.cache.values()) {
    if (!member.manageable) {
      console.log("Member tidak bisa diatur :" + (member.nickname || member.user.username));
      continue;
    }

    const matching = prefixRoles.find((r) => member.roles.cache.has(r.roleId));
    if (!matching) continue;

    const currentNick = member.nickname || member.user.username;
    const baseName = currentNick.replace(prefixPattern, "").trimStart();
    const newNick = `${matching.prefix} ${baseName}`;

    if (currentNick !== newNick) {
      try {
        await member.setNickname(newNick);
        updated++;
      } catch (err) {
        console.warn(`❌ gagal ubah nick ${member.user.tag}: ${err.message}`);
      }
    }
  }

  return updated;
}

async function roleUnprefix(guild) {
  try {
    await guild.members.fetch({ time: 10000 });
  } catch (err) {
    console.warn("❌ gagal fetch semua member (mungkin timeout), lanjut pakai cache aja");
  }

  const prefixPattern = /^[\[\(（【「].+?[\]\)）】」]\s?/;

  let updated = 0;

  for (const member of guild.members.cache.values()) {
    if (!member.manageable) {
      console.log("Member tidak bisa diatur :" + (member.nickname || member.user.username));
      continue;
    }

    const currentNick = member.nickname;
    if (!currentNick || !prefixPattern.test(currentNick)) continue;

    const baseName = currentNick.replace(prefixPattern, "");

    // cuma ubah kalau beda
    if (currentNick !== baseName) {
      try {
        await member.setNickname(baseName);
        updated++;
      } catch (err) {
        console.warn(`❌ gagal ubah nick ${member.user.tag}: ${err.message}`);
      }
    }
  }

  return updated;
}

// UPDATE STATS
const updateStats = async (client, activeSettings) => {
  const updates = [];

  for (const s of activeSettings) {
    if (!s.serverStatsOn) continue;

    const guild = client.guilds.cache.get(s.guildId);
    if (!guild) continue;

    try {
      const total = guild.memberCount;
      const online = guild.members.cache.filter((m) => ["online", "idle", "dnd"].includes(m.presence?.status)).size;

      if (s.memberCountChannelId) {
        const memberChannel = guild.channels.cache.get(s.memberCountChannelId);
        if (memberChannel && memberChannel.setName) {
          updates.push(memberChannel.setName(`${total} Members`));
        }
      }

      if (s.onlineCountChannelId) {
        const onlineChannel = guild.channels.cache.get(s.onlineCountChannelId);
        if (onlineChannel && onlineChannel.setName) {
          updates.push(onlineChannel.setName(`${online} Online`));
        }
      }
    } catch (err) {
      console.error(`[STATS ERROR] ${guild?.name} (${s.guildId}):`, err);
    }
  }

  await Promise.allSettled(updates);
};

// UPDATE MINECRAFT STATS
const updateMinecraftStats = async (client, activeSettings) => {
  const updates = [];

  for (const s of activeSettings) {
    if (!s.minecraftStatsOn) continue;

    const guild = client.guilds.cache.get(s.guildId);
    if (!guild) continue;

    try {
      const res = await axios.get(`https://api.mcstatus.io/v2/status/java/${s.minecraftIp}`);
      const data = res.data;

      const ipName = `🌐 ${s.minecraftIp}`;
      const portName = `🔌 ${s.minecraftPort}`;
      const status = data.online ? `🟢 ONLINE` : `🔴 OFFLINE`;
      const players = data.online ? `🎮 ${data.players?.online || 0}/${data.players?.max || 0}` : `🎮 0/0`;

      const ipChannel = guild.channels.cache.get(s.minecraftIpChannelId);
      const portChannel = guild.channels.cache.get(s.minecraftPortChannelId);
      const statusChannel = guild.channels.cache.get(s.minecraftStatusChannelId);
      const playersChannel = guild.channels.cache.get(s.minecraftPlayersChannelId);

      if (ipChannel && ipChannel.setName) {
        updates.push(ipChannel.setName(ipName));
      }

      if (portChannel && portChannel.setName) {
        updates.push(portChannel.setName(portName));
      }

      if (statusChannel && statusChannel.setName) {
        updates.push(statusChannel.setName(status));
      }

      if (playersChannel && playersChannel.setName) {
        updates.push(playersChannel.setName(players));
      }
    } catch (err) {
      console.error(`[MC ERROR] ${s.guildId}:`, err.message);
    }
  }

  await Promise.allSettled(updates);
};
// Fungsi untuk membuat transkrip tiket
async function createTicketTranscript(channel) {
  try {
    // Ambil semua pesan di channel
    const messages = await channel.messages.fetch({ limit: 100 }); // bisa atur limit sesuai kebutuhan

    // Format pesan dalam bentuk chat log
    let transcriptText = "";
    messages.reverse().forEach((msg) => {
      const time = msg.createdAt.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }); // atur timezone sesuai
      transcriptText += `${time} - ${msg.author.tag}: ${msg.content}\n`;
    });

    // Mengembalikan teks transkrip
    return transcriptText;
  } catch (error) {
    throw new Error("Gagal membuat transkrip: " + error.message);
  }
}

async function closeTicket(interaction) {
  try {
    // Find the ticket and config using the guildId, not channelId for config
    const ticket = await Ticket.findOne({
      where: { channelId: interaction.channel.id },
    });

    if (!ticket) {
      return await interaction.reply({
        content: "❌ | Tiket tidak ditemukan.",
        ephemeral: true,
      });
    }

    // Get config by guildId
    const ticketConfig = await TicketConfig.findOne({
      where: { guildId: interaction.guild.id },
    });

    if (!ticketConfig) {
      return await interaction.reply({
        content: "❌ | Konfigurasi tiket tidak ditemukan.",
        ephemeral: true,
      });
    }

    await interaction.reply({ content: "🚪 | Tiket akan ditutup dalam 5 detik..." });

    setTimeout(async () => {
      try {
        // Get log and transcript channels
        const logsChannel = interaction.guild.channels.cache.get(ticketConfig.logsChannelId);
        const transcriptChannel = interaction.guild.channels.cache.get(ticketConfig.transcriptChannelId);

        if (!transcriptChannel) {
          await interaction.channel.send("❌ | Channel transkrip tidak ditemukan.");
          return;
        }

        // Create and send transcript using createTicketTranscript
        const transcriptText = await createTicketTranscript(interaction.channel);
        await transcriptChannel.send({
          content: `Transkrip untuk tiket #${ticket.ticketNumber} dibuat oleh <@${ticket.userId}>.`,
          files: [
            {
              attachment: Buffer.from(transcriptText, "utf-8"),
              name: `ticket_${ticket.ticketNumber}_transcript.txt`,
            },
          ],
        });

        // Send log if channel exists
        if (logsChannel) {
          await logsChannel.send(`📝 | Tiket #${ticket.ticketNumber} ditutup oleh ${interaction.user.tag} dan transkrip disimpan.`);
        }

        // Delete ticket from database and channel
        await Ticket.destroy({
          where: { channelId: interaction.channel.id },
        });

        // Try to delete the channel, but catch if already deleted
        try {
          await interaction.channel.delete();
        } catch (e) {
          // Channel might already be deleted
        }
      } catch (err) {
        console.error("Error in setTimeout:", err);
        try {
          await interaction.channel.send("❌ | Terjadi kesalahan saat menutup tiket.");
        } catch (e) {
          // Channel might already be deleted
        }
      }
    }, 5000);
  } catch (error) {
    console.error("Gagal menutup tiket:", error);
    try {
      await interaction.reply({
        content: "❌ | Terjadi kesalahan saat menutup tiket.",
        ephemeral: true,
      });
    } catch (e) {
      // Already replied
    }
  }
}

async function createTicket(interaction, ticketConfig) {
  // cek apakah user masih punya tiket terbuka
  const existingTicket = await Ticket.findOne({
    where: {
      userId: interaction.user.id,
      guildId: interaction.guild.id,
    },
  });

  if (existingTicket) {
    return await interaction.reply({
      content: `❌ | Kamu masih punya tiket terbuka di <#${existingTicket.channelId}>. Tutup dulu yaa sebelum bikin tiket baru 😋`,
      ephemeral: true,
    });
  }
  console.log("🛠 createTicket() called by:", interaction.user.tag);
  try {
    const newCounter = await TicketCounter.create();
    const ticketNumber = newCounter.id;
    const username = interaction.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8);
    const channelName = `${username}-${ticketNumber}`;

    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: ticketConfig.staffRoleId,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    const ticketEmbed = new EmbedBuilder()
      .setTitle(`🎫 Tiket #${ticketNumber}`)
      .setDescription(`haloo ${interaction.user}! tiketmu udah terbuat! tolong tunggu staff <@&${ticketConfig.staffRoleId}> untuk bantu yaa 🥺`)
      .setColor("Blue")
      // .setFooter("Sistem Tiket")
      .setTimestamp();

    const ticketButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_close").setLabel("❌ Close Ticket").setStyle(ButtonStyle.Danger));

    await ticketChannel.send({
      embeds: [ticketEmbed],
      components: [ticketButtons],
    });

    await interaction.reply({
      content: `✅ | Tiket telah dibuat : ${ticketChannel}`,
      ephemeral: true,
    });

    const newTicket = new Ticket({
      guildId: interaction.guild.id,
      userId: interaction.user.id,
      channelId: ticketChannel.id,
      ticketNumber: ticketNumber,
    });

    await newTicket.save();
  } catch (error) {
    console.error("Error saat membuat tiket:", error);
    await interaction.reply({
      content: "❌ | Error terjadi saat mencoba membuat tiket.",
      ephemeral: true,
    });
  }
}

module.exports = {
  t,
  checkCooldown,
  checkPermission,
  parseDuration,
  toTinyText,
  toTinyBoldText,
  updateMemberCounters,
  addXp,
  levelUpXp,
  calculateLevel,
  rolePrefix,
  roleUnprefix,
  updateStats,
  updateMinecraftStats,
  createTicketTranscript,
  closeTicket,
  createTicket,
};
