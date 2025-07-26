const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createCanvas, loadImage, registerFont } = require('canvas');
const TicketConfig = require("../database/models/TicketConfig");
const BotSetting = require("../database/models/BotSetting");
const Premium = require("../database/models/Premium");
const Ticket = require("../database/models/Ticket");
const User = require("../database/models/User");
const https = require("https");
const axios = require("axios");
const path = require("path");
require("dotenv").config();
const net = require("net");
const fs = require("fs");
// const canvas = require("canvas");
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
        await member.roles.add(role).catch(() => { });

        embeds.push(
          new EmbedBuilder()
            .setColor("Blue")
            // .setTitle("> Role reward!")
            .setDescription(`## 🏅 Role Reward\nselamatt ${message.author}, kamu dapat role **${role.name}** karena naik ke level **${reward.level}**! 🏅`)
            .setThumbnail(message.author.displayAvatarURL())
            .setTimestamp()
            .setFooter({
              text: `© ${message.client.user.username} by kenndeclouv`,
              iconURL: message.client.user.displayAvatarURL(),
            })
        );
      }
    }
  }

  const buffer = await generateLevelImage({
    username: message.author.username,
    avatarURL: message.author.displayAvatarURL({ extension: "png", size: 256 }),
    level: user.level,
    xp: user.xp,
    nextLevelXp: levelUpXp(user.level),
    // backgroundURL: "./assets/a.png"
    backgroundURL: "https://files.catbox.moe/ooketf.png"
  });

  const levelEmbed = new EmbedBuilder()
    .setColor("Blue")
    // .setTitle("> Level Up!")
    .setDescription(`## 🏅 Level Up!\nselamatt ${message.author}!, kamu telah naik ke level **${user.level}**! 🎉`)
    .setThumbnail(message.author.displayAvatarURL())
    .setImage("attachment://levelup.png") // 🟢 ini cara benernya
    .setTimestamp()
    .setFooter({
      text: "leveling system",
      iconURL: message.client.user.displayAvatarURL(),
    });

  // kirim
  if (channel) {
    await channel.send({
      embeds: [levelEmbed, ...embeds],
      files: [{ attachment: buffer, name: 'levelup.png' }], // lampirkan buffer
    }).catch(() => { });
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
// optional: font custom
// registerFont(path.join(__dirname, 'fonts', 'Poppins-Bold.ttf'), { family: 'Poppins' });

async function generateLevelImage({ username, avatarURL, level, xp, nextLevelXp, backgroundURL }) {
  const canvas = createCanvas(800, 250);
  const ctx = canvas.getContext('2d');
  // const backgroundURL = "https://files.catbox.moe/ooketf.png"
  // 🖼️ FIX: Handle background secara fleksibel (URL atau path lokal)
  try {
    if (backgroundURL) {
      let bgImage;

      // Cek jika backgroundURL adalah URL eksternal
      if (backgroundURL.startsWith('http')) {
        // Gunakan fetch untuk URL eksternal
        const response = await axios.get(backgroundURL, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');
        bgImage = await loadImage(buffer);
        console.log("PAKAI HTTP")
      } else {
        // Gunakan path.resolve untuk path lokal
        bgImage = await loadImage(path.resolve(backgroundURL));
        console.log("LOCAL FILE")
      }

      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    } else {
      // Default gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#23272a");
      gradient.addColorStop(1, "#2c2f33");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log("GAADA BACKGROUND")
    }
  } catch (bgError) {
    console.error("Error loading background:", bgError);
    // Fallback background
    ctx.fillStyle = "#23272a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 🎨 Handle avatar with better conversion and error handling
  let avatar;
  try {
    // Convert webp to png if needed
    const processedAvatarURL = avatarURL.replace(/\.webp\b/i, ".png");
    avatar = await loadImage(processedAvatarURL);
  } catch (avatarError) {
    console.error("Error loading avatar:", avatarError);
    // Create placeholder avatar
    avatar = await createPlaceholderAvatar(username);
  }

  // Draw avatar with border
  ctx.save();
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 25, 25, 200, 200);
  ctx.restore();

  // Draw avatar border
  ctx.strokeStyle = '#3498DB';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(125, 125, 100, 0, Math.PI * 2);
  ctx.stroke();

  // ✍️ Username with ellipsis if too long
  ctx.font = 'bold 34px "Segoe UI", sans-serif';
  ctx.fillStyle = '#ffffff';
  // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  // ctx.shadowBlur = 5;

  const maxUsernameWidth = 450;
  let displayUsername = username;
  if (ctx.measureText(username).width > maxUsernameWidth) {
    while (ctx.measureText(displayUsername + '...').width > maxUsernameWidth && displayUsername.length > 1) {
      displayUsername = displayUsername.slice(0, -1);
    }
    displayUsername += '...';
  }
  ctx.fillText(displayUsername, 250, 75);

  // 🧪 Level text
  ctx.font = 'bold 28px "Segoe UI", sans-serif';
  ctx.fillStyle = '#3498DB';
  ctx.fillText(`Level ${level}`, 250, 115);

  // 📊 XP Bar - Improved progress calculation
  const progressWidth = 500;
  const progressHeight = 30;
  const progressX = 250;
  const progressY = 160;
  const borderRadius = progressHeight / 2;
  const percent = Math.min(Math.max(xp / nextLevelXp, 0), 1); // Clamp between 0-1

  // Draw background bar
  drawRoundedRect(ctx, progressX, progressY, progressWidth, progressHeight, borderRadius, '#444');

  // Draw progress bar
  if (percent > 0) {
    const barWidth = Math.max(progressWidth * percent, borderRadius * 2); // Ensure minimum width for rounded ends

    if (barWidth === progressWidth) {
      // Full bar
      drawRoundedRect(ctx, progressX, progressY, barWidth, progressHeight, borderRadius, '#3498DB');
    } else {
      // Partial bar with rounded left end
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(progressX + borderRadius, progressY);
      ctx.arcTo(progressX, progressY, progressX, progressY + borderRadius, borderRadius);
      ctx.lineTo(progressX, progressY + progressHeight - borderRadius);
      ctx.arcTo(progressX, progressY + progressHeight, progressX + borderRadius, progressY + progressHeight, borderRadius);
      ctx.lineTo(progressX + barWidth, progressY + progressHeight);
      ctx.lineTo(progressX + barWidth, progressY);
      ctx.closePath();
      ctx.fillStyle = '#3498DB';
      ctx.fill();
      ctx.restore();
    }
  }

  // 🔢 XP Text (centered in progress bar)
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 18px "Segoe UI", sans-serif';
  // ctx.shadowBlur = 0;
  const xpText = `${xp.toLocaleString()} / ${nextLevelXp.toLocaleString()} XP`;
  const textWidth = ctx.measureText(xpText).width;
  ctx.fillText(
    xpText,
    progressX + (progressWidth - textWidth) / 2,
    progressY + progressHeight / 2 + 7 // Vertically center
  );

  return canvas.toBuffer();
}

/**
 * Generate a custom welcome image for a new member.
 * @param {Object} options
 * @param {string} options.username - The username of the new member.
 * @param {string} options.avatarURL - The avatar URL of the new member.
 * @param {string} options.guildName - The name of the guild/server.
 * @param {string} [options.backgroundURL] - Optional custom background image URL.
 * @param {string} [options.welcomeText] - Optional custom welcome text.
 * @returns {Promise<Buffer>} - The image buffer.
 */
async function generateWelcomeInImage({ username, avatarURL, guildName, backgroundURL, welcomeText }) {
  // Use default background if not provided
  const bgUrl = backgroundURL || "https://files.catbox.moe/ooketf.png";
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // Draw background
  try {
    let bgImage;
    if (bgUrl.startsWith('http')) {
      const response = await axios.get(bgUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      bgImage = await loadImage(buffer);
    } else {
      bgImage = await loadImage(bgUrl);
    }
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    // fallback: fill with color
    ctx.fillStyle = "#23272A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw avatar (circle)
  const avatarSize = 120;
  const avatarX = 60;
  const avatarY = canvas.height / 2 - avatarSize / 2;
  try {
    const avatarImg = await loadImage(avatarURL);
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();
  } catch (e) {
    // ignore avatar error
  }

  // Draw welcome text
  ctx.save();
  // ctx.shadowColor = "rgba(0,0,0,0.5)";
  // ctx.shadowBlur = 6;
  ctx.fillStyle = "#fff";
  ctx.font = 'bold 38px "Segoe UI", sans-serif';
  const mainText = welcomeText || `Selamat datang, ${username}!`;
  const textX = 220;
  const textY = 120;
  ctx.fillText(mainText, textX, textY);

  // Draw guild name
  ctx.font = '24px "Segoe UI", sans-serif';
  ctx.fillStyle = "#e0e0e0";
  ctx.fillText(`di ${guildName}`, textX, textY + 45);

  // Draw subtext
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillStyle = "#b0b0b0";
  ctx.fillText("Semoga betah dan have fun di server ini!", textX, textY + 80);
  ctx.restore();

  // Optionally, draw a border or overlay for style
  ctx.save();
  ctx.strokeStyle = "#3498DB";
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  return canvas.toBuffer();
}


// Helper function for rounded rectangles
function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

async function rolePrefix(guild) {
  // const prefixPattern = /^[\[\(（【「].+?[\]\)）】」]/;
  const prefixPattern = /^([^\w\d\s]{1,5}(?:\s?•)?)/;

  const prefixRoles = guild.roles.cache
    .filter((role) => prefixPattern.test(role.name))
    .sort((a, b) => b.position - a.position)
    // .map((role) => {
    //   const match = role.name.match(prefixPattern);
    //   return {
    //     roleId: role.id,
    //     prefix: match ? match[0] : "",
    //     position: role.position,
    //   };
    // });
    .map((role) => {
      const match = role.name.match(prefixPattern);
      return {
        roleId: role.id,
        prefix: match ? match[1] : "",
        position: role.position,
      };
    });

  let updated = 0;

  for (const member of guild.members.cache.values()) {
    // allow jika member adalah botnya sendiri
    const isBotSelf = member.id === guild.client.user.id;

    if (!member.manageable && !isBotSelf) {
      console.log("Member tidak bisa diatur :" + (member.nickname || member.user.username));
      continue;
    }

    const matching = prefixRoles.find((r) => member.roles.cache.has(r.roleId));
    if (!matching) continue;

    const currentNick = member.nickname || member.user.username;
    // const baseName = currentNick.replace(prefixPattern, "").trimStart();
    // const newNick = `${matching.prefix} ${baseName}`;
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
// async function roleUnprefix(guild) {
//   // const prefixPattern = /^[\[\(（【「].+?[\]\)）】」]\s?/;
//   const prefixPattern = /^([^\w\d\s]{1,5}(?:\s?•)?)\s?/;

//   let updated = 0;

//   for (const member of guild.members.cache.values()) {
//     const isBotSelf = member.id === guild.client.user.id;

//     if (!member.manageable && !isBotSelf) {
//       console.log("Member tidak bisa diatur :" + (member.nickname || member.user.username));
//       continue;
//     }

//     const currentNick = member.nickname;
//     if (!currentNick || !prefixPattern.test(currentNick)) continue;

//     const baseName = currentNick.replace(prefixPattern, "");

//     if (currentNick !== baseName) {
//       try {
//         await member.setNickname(baseName);
//         updated++;
//       } catch (err) {
//         console.warn(`❌ gagal ubah nick ${member.user.tag}: ${err.message}`);
//       }
//     }
//   }

//   return updated;
// }
async function roleUnprefix(guild) {
  // try {
  //   await guild.members.fetch({ time: 10000 });
  // } catch (err) {
  //   console.warn("❌ gagal fetch semua member (mungkin timeout), lanjut pakai cache aja");
  // }

  const prefixPattern = /^([^\w\d\s]{1,5}(?:\s?•)?)\s?/;

  let updated = 0;

  for (const member of guild.members.cache.values()) {
    const isBotSelf = member.id === guild.client.user.id;

    if (!member.manageable && !isBotSelf) {
      console.log("Member tidak bisa diatur :" + (member.nickname || member.user.username));
      continue;
    }

    const currentNick = member.nickname;
    if (!currentNick || !prefixPattern.test(currentNick)) continue;

    const baseName = currentNick.replace(prefixPattern, "");

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
// const updateStats = async (client, activeSettings) => {
//   const updates = [];

//   for (const s of activeSettings) {
//     if (!s.serverStatsOn) continue;

//     const guild = client.guilds.cache.get(s.guildId);
//     if (!guild) continue;

//     try {
//       const total = guild.memberCount;
//       const online = guild.members.cache.filter((m) => ["online", "idle", "dnd"].includes(m.presence?.status)).size;

//       if (s.memberCountChannelId) {
//         const memberChannel = guild.channels.cache.get(s.memberCountChannelId);
//         if (memberChannel && memberChannel.setName) {
//           updates.push(memberChannel.setName(`${total} Members`));
//         }
//       }

//       if (s.onlineCountChannelId) {
//         const onlineChannel = guild.channels.cache.get(s.onlineCountChannelId);
//         if (onlineChannel && onlineChannel.setName) {
//           updates.push(onlineChannel.setName(`${online} Online`));
//         }
//       }
//     } catch (err) {
//       console.error(`[STATS ERROR] ${guild?.name} (${s.guildId}):`, err);
//     }
//   }

//   await Promise.allSettled(updates);
// };



// function resolvePlaceholders(str, data) {
//   const now = new Date();
//   const formatDate = (d) =>
//     d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
//   const formatTime = (d) =>
//     d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

//   const placeholders = {
//     "{memberstotal}": data.members || 0,
//     "{online}": data.online || 0,
//     "{bots}": data.bots || 0,
//     "{humans}": data.humans || 0,
//     "{boosts}": data.boosts || 0,
//     "{channels}": data.channels || 0,
//     "{roles}": data.roles || 0,
//     "{date}": formatDate(now),
//     "{time}": formatTime(now),
//     "{guild}": data.guildName || "Guild",
//   };

//   let result = str;
//   for (const [key, val] of Object.entries(placeholders)) {
//     result = result.replaceAll(key, val.toString());
//   }

//   return result;
// }

// const updateStats = async (client, activeSettings) => {
//   const updates = [];

//   // console.log(activeSettings);
//   for (const s of activeSettings) {
//     if (!s.serverStatsOn || !s.serverStats || !Array.isArray(s.serverStats)) continue;

//     const guild = client.guilds.cache.get(s.guildId);
//     if (!guild) continue;

//     try {
//       await guild.members.fetch();

//       const members = guild.memberCount;
//       const online = guild.members.cache.filter(
//         (m) => ["online", "idle", "dnd"].includes(m.presence?.status)
//       ).size;
//       const bots = guild.members.cache.filter((m) => m.user.bot).size;
//       const humans = members - bots;
//       const boosts = guild.premiumSubscriptionCount || 0;
//       const channels = guild.channels.cache.size;
//       const roles = guild.roles.cache.size;

//       const data = {
//         members,
//         online,
//         bots,
//         humans,
//         boosts,
//         channels,
//         roles,
//         guildName: guild.name,
//       };

//       for (const stat of s.serverStats) {
//         if (!stat.enabled || !stat.channelId || !stat.format) continue;

//         const channel = guild.channels.cache.get(stat.channelId);
//         if (!channel || !channel.setName) continue;

//         const newName = resolvePlaceholders(stat.format, data);
//         updates.push(channel.setName(newName));
//       }
//     } catch (err) {
//       console.error(`[STATS ERROR] ${guild?.name} (${s.guildId}):`, err);
//     }
//   }

//   await Promise.allSettled(updates);
// };


function resolvePlaceholders(str, data) {
  const now = new Date();

  // Fungsi format tanggal dan waktu
  const formatDate = (d) =>
    d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  // Daftar hari dan bulan dalam Bahasa Indonesia
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Hitung usia server
  let guildAge = "Unknown";
  if (data.createdAt) {
    const created = new Date(data.createdAt);
    const diff = now - created;
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    guildAge = years > 0 ? `${years} tahun ${months} bulan` : `${months} bulan ${days} hari`;
  }

  // Placeholder lengkap
  const placeholders = {
    // Statistik anggota
    "{memberstotal}": data.members || 0,
    "{online}": data.online || 0,
    "{idle}": data.idle || 0,
    "{dnd}": data.dnd || 0,
    "{offline}": data.offline || 0,
    "{bots}": data.bots || 0,
    "{humans}": data.humans || 0,
    "{online_bots}": data.onlineBots || 0,
    "{online_humans}": data.onlineHumans || 0,

    // Statistik server
    "{boosts}": data.boosts || 0,
    "{boost_level}": data.boostLevel || 0,
    "{channels}": data.channels || 0,
    "{text_channels}": data.textChannels || 0,
    "{voice_channels}": data.voiceChannels || 0,
    "{categories}": data.categories || 0,
    "{announcement_channels}": data.announcementChannels || 0,
    "{stage_channels}": data.stageChannels || 0,
    "{roles}": data.roles || 0,
    "{emojis}": data.emojis || 0,
    "{stickers}": data.stickers || 0,

    // Informasi server
    "{guild}": data.guildName || "Server",
    "{guild_id}": data.guildId || "0",
    "{owner}": data.ownerName || "Pemilik",
    "{owner_id}": data.ownerId || "0",
    "{region}": data.region || "ID",
    "{verified}": data.verified ? "Ya" : "Tidak",
    "{partnered}": data.partnered ? "Ya" : "Tidak",

    // Waktu dinamis
    "{date}": formatDate(now),
    "{time}": formatTime(now),
    "{datetime}": `${formatDate(now)} ${formatTime(now)}`,
    "{day}": days[now.getDay()],
    "{month}": months[now.getMonth()],
    "{year}": now.getFullYear().toString(),
    "{hour}": now.getHours().toString().padStart(2, '0'),
    "{minute}": now.getMinutes().toString().padStart(2, '0'),
    "{second}": now.getSeconds().toString().padStart(2, '0'),
    "{timestamp}": now.getTime().toString(),

    // Informasi server dinamis
    "{created_date}": data.createdAt ? formatDate(new Date(data.createdAt)) : "Unknown",
    "{created_time}": data.createdAt ? formatTime(new Date(data.createdAt)) : "Unknown",
    "{guild_age}": guildAge,
    "{member_join}": data.memberJoin ? formatDate(new Date(data.memberJoin)) : "Unknown",
  };

  let result = str;
  for (const [key, val] of Object.entries(placeholders)) {
    result = result.replaceAll(key, val.toString());
  }

  return result;
}

const updateStats = async (client, activeSettings) => {
  const updates = [];

  for (const s of activeSettings) {
    if (!s.serverStatsOn || !s.serverStats || !Array.isArray(s.serverStats)) continue;

    const guild = client.guilds.cache.get(s.guildId);
    if (!guild) continue;

    try {
      await guild.members.fetch();
      await guild.channels.fetch();

      // Hitung status anggota
      const statusCount = {
        online: 0,
        idle: 0,
        dnd: 0,
        offline: 0,
        onlineBots: 0,
        onlineHumans: 0
      };

      guild.members.cache.forEach(member => {
        const status = member.presence?.status || 'offline';
        statusCount[status]++;

        if (member.user.bot && status !== 'offline') {
          statusCount.onlineBots++;
        } else if (!member.user.bot && status !== 'offline') {
          statusCount.onlineHumans++;
        }
      });

      // Hitung tipe channel
      const channelTypes = {
        text: 0,
        voice: 0,
        category: 0,
        announcement: 0,
        stage: 0
      };

      guild.channels.cache.forEach(channel => {
        switch (channel.type) {
          case ChannelType.GuildText: channelTypes.text++; break;
          case ChannelType.GuildVoice: channelTypes.voice++; break;
          case ChannelType.GuildCategory: channelTypes.category++; break;
          case ChannelType.GuildAnnouncement: channelTypes.announcement++; break;
          case ChannelType.GuildStageVoice: channelTypes.stage++; break;
        }
      });

      // Data lengkap untuk placeholder
      const data = {
        members: guild.memberCount,
        online: statusCount.online + statusCount.idle + statusCount.dnd,
        idle: statusCount.idle,
        dnd: statusCount.dnd,
        offline: statusCount.offline,
        bots: guild.members.cache.filter(m => m.user.bot).size,
        humans: guild.memberCount - guild.members.cache.filter(m => m.user.bot).size,
        onlineBots: statusCount.onlineBots,
        onlineHumans: statusCount.onlineHumans,
        boosts: guild.premiumSubscriptionCount || 0,
        boostLevel: guild.premiumTier,
        channels: guild.channels.cache.size,
        textChannels: channelTypes.text,
        voiceChannels: channelTypes.voice,
        categories: channelTypes.category,
        announcementChannels: channelTypes.announcement,
        stageChannels: channelTypes.stage,
        roles: guild.roles.cache.size,
        emojis: guild.emojis.cache.size,
        stickers: guild.stickers.cache.size,
        guildName: guild.name,
        guildId: guild.id,
        ownerName: guild.ownerId ? guild.members.cache.get(guild.ownerId)?.user?.tag : "Unknown",
        ownerId: guild.ownerId || "0",
        region: guild.preferredLocale,
        verified: guild.verified,
        partnered: guild.partnered,
        createdAt: guild.createdAt.toISOString(),
        memberJoin: s.memberJoin || null
      };

      for (const stat of s.serverStats) {
        if (!stat.enabled || !stat.channelId || !stat.format) continue;

        const channel = guild.channels.cache.get(stat.channelId);
        if (!channel || !channel.setName) continue;

        const newName = resolvePlaceholders(stat.format, data);
        if (channel.name !== newName) {
          updates.push(channel.setName(newName.substring(0, 100)));
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
    const messages = await channel.messages.fetch(); // bisa atur limit sesuai kebutuhan { limit: 100 }

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
        // Kirim transkrip ke channel transcript
        await transcriptChannel.send({
          content: `Transkrip untuk tiket dibuat oleh <@${ticket.userId}>.`,
          files: [
            {
              attachment: Buffer.from(transcriptText, "utf-8"),
              name: `ticket_transcript_${interaction.user.username}.txt`,
            },
          ],
        });

        // Kirim transkrip ke user yang membuka tiket
        try {
          const user = await interaction.client.users.fetch(ticket.userId);
          if (user) {
            await user.send({
              content: `Ini adalah transkrip untuk tiket yang kamu buat di server **${interaction.guild.name}**.`,
              files: [
                {
                  attachment: Buffer.from(transcriptText, "utf-8"),
                  name: `ticket_transcript_${interaction.user.username}.txt`,
                },
              ],
            });
          }
        } catch (e) {
          // User mungkin tidak bisa menerima DM
        }

        // Send log if channel exists
        if (logsChannel) {
          await logsChannel.send(`📝 | Tiket ditutup oleh ${interaction.user.tag} dan transkrip disimpan.`);
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
      content: `❌ | Kamu masih punya tiket terbuka di <#${existingTicket.channelId}>. Tutup dulu yaa sebelum bikin tiket baru`,
      ephemeral: true,
    });
  }
  // console.log("🛠 createTicket() called by:", interaction.user.tag);
  try {
    // const newCounter = await TicketCounter.create();
    // const ticketNumber = newCounter.id;
    const username = interaction.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8);
    const channelName = ticketConfig.format.replace("{username}", username).replace("{guildname}", interaction.guild.name).replace("{date}", new Date().toLocaleDateString("id-ID")).replace("{timestamp}", new Date().toLocaleString("id-ID"));

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
      .setTitle(`> 🎫 ${ticketConfig.ticketTitle ? ticketConfig.ticketTitle : ticketConfig.name}`)
      .setDescription(`${ticketConfig.ticketDescription ? ticketConfig.ticketDescription : `haloo ${interaction.user}! tiketmu udah terbuat! tolong tunggu staff <@&${ticketConfig.staffRoleId}> untuk bantu yaa`}`)
      .setColor("Blue")
      // .setFooter("Sistem Tiket")
      .setTimestamp();
    if (ticketConfig.ticketImage) ticketEmbed.setImage(ticketConfig.ticketImage);
    if (ticketConfig.ticketThumbnail) ticketEmbed.setThumbnail(ticketConfig.ticketThumbnail);
    if (ticketConfig.ticketFooterText) {
      ticketEmbed.setFooter({ iconURL: ticketConfig.ticketFooterIcon ? ticketConfig.ticketFooterIcon : interaction.client.user.displayAvatarURL({ dynamic: true }), text: ticketConfig.ticketFooterText ? ticketConfig.ticketFooterText : `Sistem Tiket ${interaction.guild.name}` });
    }

    const ticketButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticketclose").setLabel("❌ Close Ticket").setStyle(ButtonStyle.Danger));

    await ticketChannel.send({
      content: `<@&${ticketConfig.staffRoleId}> <@${interaction.user.id}>`,
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
      // ticketNumber: ticketNumber,
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
async function updatePetStatus(pet) {
  const now = Date.now();
  const lastUpdated = pet.lastUpdatedAt ? pet.lastUpdatedAt.getTime() : now;

  const hoursPassed = Math.floor((now - lastUpdated) / (1000 * 60 * 60)); // hitung berapa jam berlalu

  if (hoursPassed <= 0) return; // belum ada waktu yang cukup berlalu

  // update berdasarkan waktu yang lewat
  pet.hunger = Math.max(pet.hunger - 5 * hoursPassed, 0);
  pet.happiness = Math.max(pet.happiness - 10 * hoursPassed, 0);

  if (pet.hunger <= 0 && pet.happiness <= 0 && !pet.isDead) {
    pet.isDead = true;

    const user = await User.findOne({ where: { userId: pet.userId, isDead: false } });

    if (user) {
      const embed = new EmbedBuilder().setTitle("> 💀 Pet Kamu Telah Mati!").setDescription(`Pet kamu telah mati karena kelaparan!`).setColor("Red");

      try {
        const discordUser = await client.users.fetch(user.userId);
        await discordUser.send({ embeds: [embed] });
      } catch (sendErr) {
        console.error(`gagal mengirim pesan ke user ${user.userId}:`, sendErr);
      }
    }
  }

  pet.lastUpdatedAt = new Date();
  await pet.save();
}

// const config = require("../config");
// let translate = null;

// // Helper to return unchanged text (for skipped translation or errors)
// function getUnchangedText(text) {
//   return text;
// }

// // Helper to verify language code (basic check, can be improved)
// function verifyLang(lang) {
//   // Accepts 2-5 letter language codes (e.g., en, en-US, id, etc.)
//   return typeof lang === "string" && /^[a-z]{2,5}(-[A-Z]{2,5})?$/.test(lang);
// }

// // Helper to throw config error
// function genConfigError(section, key, error) {
//   console.error(
//     `❌ Config Error in section [${section}], key [${key}]:\n${error}`
//   );
// }

// const Translate = async (text = "", lang = "", allLowerCase = false) => {
//   let output;
//   let wait_time = config.opt?.Translate_Timeout;

//   let reg = /<([^>]+)>/g;

//   if (!translate) {
//     console.warn("❌ No translation module detected! ❌");
//     output = getUnchangedText(text);
//     return output;
//   }

//   // Use config language if not provided
//   lang = lang || config.app?.lang;

//   if (!text || !lang)
//     throw new Error(
//       "❌ You must provide a text and a language code to translate! ❌"
//     );

//   if (lang === "en") {
//     output = getUnchangedText(text);
//   } else {
//     const arrayStr = text.split(reg);
//     const translatedArray = await Promise.all(
//       arrayStr.map(async (str, index) => {
//         if (index % 2 == 0) {
//           if (verifyLang(lang)) {
//             try {
//               let Tranlate_buff;

//               if (wait_time) {
//                 const timeout = new Promise((_, reject) => {
//                   setTimeout(() => {
//                     reject(
//                       new Error(
//                         "❗ TimeoutRaisedError: The Translation took too long to complete! Skipping... ❗"
//                       )
//                     );
//                   }, wait_time);
//                 });
//                 Tranlate_buff = await Promise.race([
//                   translate(str, lang),
//                   timeout,
//                 ]);
//               } else {
//                 Tranlate_buff = await translate(str, lang);
//               }

//               if (!allLowerCase) return Tranlate_buff;
//               return Tranlate_buff.toLowerCase();
//             } catch (e) {
//               return getUnchangedText(str);
//             }
//           } else {
//             console.clear();
//             genConfigError(
//               "app",
//               "lang",
//               `❌ An invalid language was inserted in the config file. Please check the language code! ❌
// \t\t\tchange the language code in the config.js file\n`
//             );
//           }
//         } else {
//           return getUnchangedText(str);
//         }
//       })
//     );
//     output = translatedArray.join(" ");
//   }

//   return output;
// };

// const GetTranslationModule = async () => {
//   try {
//     const module = await import("translate");
//     translate = module.default || module;
//   } catch (e) {
//     throw new Error(
//       `❌ The translate module could not load properly. Please contact an Developers ❌ \n\n\nError:${e}`
//     );
//   }
// };

// const throwConfigError = (section = "app", key = "token", error = "") => {
//   genConfigError(section, key, error);
// };

async function checkIsPremium(userId) {
  // if (userId == process.env.OWNER_ID) return true
  const premium = await Premium.getCache({ userId: userId });
  if (!premium) return false;
  if (premium.expiresAt && new Date() > premium.expiresAt) return false;
  return premium.isPremium;
}

// Helper for consistent footer
const embedFooter = (interaction) => ({
  text: `© ${interaction.client.user.username} by kenndeclouv`,
  iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
});

async function checkNodeStatus(fqdn, port, apiKey) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(3000);

    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });

    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, fqdn);
  });
};

function progressBar(current, total, size = 10) {
  const ratio = Math.min(current / total, 1);
  const filled = Math.round(ratio * size);
  return "▰".repeat(filled) + "▱".repeat(size - filled);
};

async function generateNodeEmbed(ptero, clientUser) {
  const refreshTimestamp = Math.floor(Date.now() / 1000) + 60;
  const panelUrl = ptero.link;

  const embed = new EmbedBuilder()
    .setColor("Blue")
    .setTimestamp()
    .setFooter({
      text: `© ${clientUser.username} by kenndeclouv`,
      iconURL: clientUser.displayAvatarURL({ dynamic: true })
    });

  try {
    const { data } = await axios.get(`${panelUrl}/api/application/nodes`, {
      headers: { Authorization: `Bearer ${ptero.apiKey}` },
      timeout: 10000
    });

    let allNodesText = "## 📡 Pterodactyl Node Monitor\nReal time status node\n\n";

    for (const node of data.data) {
      const a = node.attributes;
      const usedMem = a.allocated_resources.memory || 0;
      const usedDisk = a.allocated_resources.disk || 0;

      const isOnline = await checkNodeStatus(a.fqdn, a.daemon_listen);
      const status = isOnline
        ? (a.maintenance_mode ? "🛠️ Maintenance" : "<a:a_success:1393344464214429716>")
        : "<a:a_danger:1393344725410385951>";

      allNodesText += `### ${status} ${a.name}
\
\`\`\`
` +
        `ip     : ${a.fqdn}
` +
        `ram    : ${usedMem} / ${a.memory} MB
` +
        `${progressBar(usedMem, a.memory)}
` +
        `disk   : ${usedDisk} / ${a.disk} MB
` +
        `${progressBar(usedDisk, a.disk)}
\`\`\`

`;
    }

    allNodesText += `🔄 refresh <t:${refreshTimestamp}:R>`;
    embed.setDescription(allNodesText);

  } catch (err) {
    embed.setColor("Red").setDescription("❌ gagal ambil data node");
    console.log(`[PteroEmbed] gagal ambil node dari ${panelUrl}: ${err.message}`);
  }

  return embed;
};

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
  updatePetStatus,
  generateLevelImage,
  generateWelcomeInImage,
  checkIsPremium,
  embedFooter,
  checkNodeStatus,
  progressBar,
  generateNodeEmbed
};
