const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, PermissionsBitField, WebhookClient } = require("discord.js");
const Giveaway = require("../../database/models/Giveaway");
const User = require("../../database/models/User");
const { checkPermission } = require("../../helpers");
const { parseDuration } = require("../../helpers");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveaway")
    .setDescription("Kelola giveaway")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("start")
        .setDescription("Mulai giveaway")
        .addStringOption((option) => option.setName("type").setDescription("Tipe giveaway").setRequired(true).addChoices({ name: "In Server Money", value: "money" }, { name: "Lainnya", value: "another" }))
        .addStringOption((option) => option.setName("duration").setDescription("Durasi (misal. 1 minggu 4 hari 12 menit)").setRequired(true))
        .addIntegerOption((option) => option.setName("winners").setDescription("Jumlah pemenang").setRequired(true))
        .addStringOption((option) => option.setName("prize").setDescription("Hadiah untuk giveaway").setRequired(true))
        .addStringOption((option) => option.setName("color").setDescription("Warna embed giveaway (hex code atau nama warna)").setRequired(false))
        .addRoleOption((option) => option.setName("role").setDescription("Role yang akan diberikan").setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("Akhiri giveaway")
        .addStringOption((option) => option.setName("message_id").setDescription("ID pesan dari giveaway").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("cancel")
        .setDescription("Batalkan giveaway")
        .addStringOption((option) => option.setName("message_id").setDescription("ID pesan dari giveaway").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reroll")
        .setDescription("Reroll pemenang giveaway")
        .addStringOption((option) => option.setName("message_id").setDescription("ID pesan dari giveaway").setRequired(true))
    ),
  adminOnly: true,
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const subcommand = interaction.options.getSubcommand();
      if (!(await checkPermission(interaction.member))) {
        return interaction.editReply({
          content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
          ephemeral: true,
        });
      }

      switch (subcommand) {
        case "start":
          await startGiveaway(interaction);
          break;
        case "end":
          await endGiveaway(interaction);
          break;
        case "cancel":
          await cancelGiveaway(interaction);
          break;
        case "reroll":
          await rerollGiveaway(interaction);
          break;
        default:
          await interaction.editReply("Subcommand tidak dikenal.");
      }
    } catch (error) {
      console.error("Error during giveaway command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /giveaway`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter(`Error dari server ${interaction.guild.name}`)
        .setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};

/**
  ===============================================
                PRIVATE FUNCTION
  ===============================================
 */
async function startGiveaway(interaction) {
  const durationInput = interaction.options.getString("duration");
  const winners = interaction.options.getInteger("winners");
  const prize = interaction.options.getString("prize");
  const type = interaction.options.getString("type");
  const color = interaction.options.getString("color") || "Random";
  const role = interaction.options.getRole("role");

  const duration = parseDuration(durationInput);
  if (duration <= 0) return interaction.editReply("Durasi tidak valid");

  const endTime = Date.now() + duration;
  const endTimestamp = Math.floor(endTime / 1000);

  // Membuat embed giveaway
  const embed = new EmbedBuilder()
    .setTitle("> Giveaway! 🎉")
    .setDescription(`${role ? `<@&${role.id}>` : "@everyone"}\n\nHadiah: \`${prize}\`\nPemenang: \`${winners}\`\nBerakhir: <t:${endTimestamp}:R>\n\nReact 🎉 untuk ikut!`)
    .setColor(color)
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .setImage("https://i.ibb.co/Y0C1Zcw/tenor.gif")
    .setFooter({ text: `Berakhir: ${new Date(endTime).toLocaleString()}` });

  const message = await interaction.channel.send({ embeds: [embed] });
  await message.react("🎉");

  // Menyimpan data giveaway ke database
  const giveawayData = {
    messageId: message.id,
    channelId: interaction.channel.id,
    guildId: interaction.guild.id,
    type: type,
    duration: duration,
    winners: winners,
    prize: prize,
    participants: "[]",
    ended: false,
    roleId: role?.id || null,
  };
  await Giveaway.create(giveawayData);

  // Membuat reaction collector
  const collector = message.createReactionCollector({
    time: duration,
    filter: async (reaction, user) => {
      try {
        // Skip bot reactions
        if (user.bot) return false;

        // Validasi emoji
        if (reaction.emoji.name !== "🎉") return false;

        // Cek role requirement
        if (role) {
          const member = await reaction.message.guild.members.fetch(user.id);
          return member.roles.cache.has(role.id);
        }

        return true;
      } catch (error) {
        console.error("Error filtering reaction:", error);
        return false;
      }
    },
  });

  // Handler untuk reaksi masuk
  collector.on("collect", async (reaction, user) => {
    try {
      const giveaway = await Giveaway.findOne({
        where: { messageId: reaction.message.id },
      });

      if (!giveaway) return;

      console.log(user.id + "REACT");

      const member = await interaction.guild.members.fetch(user.id);
      if (role && !member.roles.cache.has(role.id)) {
        // kalo dia ga punya role yg ditentukan, hapus react nya
        console.log(user.id + "TIDAK ADA AKSES");
        await reaction.users.remove(user.id);
        return;
      }

      // Penanganan peserta
      const participants = JSON.parse(giveaway.participants);
      if (!participants.includes(user.id)) {
        participants.push(user.id);
        await giveaway.update({ participants: JSON.stringify(participants) });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      reaction.users.remove(user.id).catch(() => {});
    }
  });

  // Handler untuk reaksi dicabut
  collector.on("remove", async (reaction, user) => {
    try {
      const giveaway = await Giveaway.findOne({
        where: { messageId: reaction.message.id },
      });

      if (!giveaway) return;

      const participants = JSON.parse(giveaway.participants);
      const index = participants.indexOf(user.id);

      if (index > -1) {
        participants.splice(index, 1);
        await giveaway.update({ participants: JSON.stringify(participants) });
      }
    } catch (error) {
      console.error("Error removing participant:", error);
    }
  });

  // Handler akhir giveaway
  collector.on("end", async () => {
    try {
      await endGiveawayById(message.id, interaction.guild, interaction);
    } catch (error) {
      console.error("Error ending giveaway:", error);
      interaction.channel.send(`Gagal mengakhiri giveaway ${message.url}`).catch(() => {});
    }
  });

  await interaction.editReply(`Giveaway dimulai! Berakhir dalam ${durationInput}`);
}

// Fungsi untuk mengakhiri giveaway
async function endGiveaway(interaction) {
  const messageId = interaction.options.getString("message_id");
  const giveaway = await Giveaway.findOne({ where: { messageId } });

  if (!giveaway || giveaway.ended) {
    return interaction.editReply("Giveaway tidak ditemukan atau sudah berakhir.");
  }

  await endGiveawayById(messageId, interaction.guild, interaction);
  await interaction.editReply("Giveaway telah berakhir.");
}

// Fungsi untuk membatalkan giveaway
async function cancelGiveaway(interaction) {
  const messageId = interaction.options.getString("message_id");
  const giveaway = await Giveaway.findOne({ where: { messageId } });

  if (!giveaway) {
    return interaction.editReply("Giveaway tidak ditemukan.");
  }

  const channel = await interaction.guild.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);

  const embed = new EmbedBuilder()
    .setColor("Red")
    .setTitle("> ❌ Giveaway Dibatalkan!")
    .setDescription(`@everyone\nGiveaway ini telah dibatalkan oleh <@${interaction.user.id}>`)
    .setThumbnail(interaction.client.user.displayAvatarURL())
    .setTimestamp();

  await message.edit({ embeds: [embed] });
  await giveaway.destroy(); // Hapus dari DB

  await interaction.editReply("Giveaway telah dibatalkan.");
}

// Fungsi untuk reroll giveaway
// async function rerollGiveaway(interaction) {
//   const messageId = interaction.options.getString("message_id");
//   const giveaway = await Giveaway.findOne({ where: { messageId } });

//   if (!giveaway) {
//     return interaction.editReply("Giveaway tidak ditemukan.");
//   }

//   if (!giveaway.ended) {
//     return interaction.editReply("Giveaway belum berakhir.");
//   }

//   const channel = await interaction.guild.channels.fetch(giveaway.channelId);
//   const message = await channel.messages.fetch(messageId);

//   let participants = [];
//   try {
//     participants = JSON.parse(giveaway.participants || "[]");
//   } catch (error) {
//     console.error("Error parsing participants:", error);
//     return interaction.editReply("Terjadi kesalahan saat memproses data peserta.");
//   }

//   if (participants.length === 0) {
//     return interaction.editReply("Tidak ada peserta yang dapat di-reroll.");
//   }

//   const winners = [];
//   for (let i = 0; i < giveaway.winners; i++) {
//     if (participants.length === 0) break;
//     const randomIndex = Math.floor(Math.random() * participants.length);
//     winners.push(participants[randomIndex]);
//     participants.splice(randomIndex, 1);
//   }

//   const winnerUsernames = await Promise.all(
//     winners.map(async (id) => {
//       try {
//         const user = await interaction.guild.members.fetch(id);
//         return user ? `<@${user.id}>` : `Pengguna tidak ditemukan (${id})`;
//       } catch (error) {
//         console.error("Error fetching user:", error);
//         return `Error fetching user (${id})`;
//       }
//     })
//   );

//   const rerollEmbed = new EmbedBuilder()
//     .setTitle("> 🎉 Giveaway Reroll!")
//     .setDescription(`**Pemenang baru:**\n${winnerUsernames.join("\n")}`)
//     .setColor("Green")
//     .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
//     .setImage("https://i.ibb.co/Y0C1Zcw/tenor.gif")
//     .setTimestamp()
//     .setFooter({ text: "Sistem", iconURL: interaction.client.user.displayAvatarURL() });

//   await message.channel.send({ embeds: [rerollEmbed] });
//   await interaction.editReply(`Giveaway telah di-reroll dengan ${winners.length} pemenang baru.`);
// }
async function rerollGiveaway(interaction) {
  const messageId = interaction.options.getString("message_id");
  const giveaway = await Giveaway.findOne({ where: { messageId } });

  if (!giveaway) {
    return interaction.editReply("Giveaway tidak ditemukan.");
  }

  if (!giveaway.ended) {
    return interaction.editReply("Giveaway belum berakhir.");
  }

  const channel = await interaction.guild.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);

  let participants = [];
  try {
    participants = JSON.parse(giveaway.participants || "[]");
  } catch (error) {
    console.error("Error parsing participants:", error);
    return interaction.editReply("Terjadi kesalahan saat memproses data peserta.");
  }

  if (participants.length === 0) {
    return interaction.editReply("Tidak ada peserta yang dapat di-reroll.");
  }

  const winners = [];
  for (let i = 0; i < giveaway.winners; i++) {
    if (participants.length === 0) break;
    const randomIndex = Math.floor(Math.random() * participants.length);
    winners.push(participants[randomIndex]);
    participants.splice(randomIndex, 1);
  }

  const winnerUsernames = await Promise.all(
    winners.map(async (id) => {
      try {
        const user = await interaction.guild.members.fetch(id);
        return user ? `<@${user.id}>` : `Pengguna tidak ditemukan (${id})`;
      } catch (error) {
        console.error("Error fetching user:", error);
        return `Error fetching user (${id})`;
      }
    })
  );

  const updatedEmbed = new EmbedBuilder()
    .setTitle("> 🎉 Giveaway Berakhir (Reroll)!")
    .setDescription(`@everyone\nHadiah: \`${giveaway.prize}\`\nPemenang Baru: ${winnerUsernames.join(", ")}`)
    .setColor("Green")
    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
    .setImage("https://i.ibb.co/Y0C1Zcw/tenor.gif")
    .setTimestamp()
    .setFooter({ text: "Giveaway Selesai - Reroll", iconURL: interaction.client.user.displayAvatarURL() });

  // ⬇️ ini bagian penting, EDIT message giveaway lamanya
  await message.edit({ embeds: [updatedEmbed] });

  await interaction.editReply(`Giveaway berhasil di-reroll dengan ${winners.length} pemenang baru.`);
}

async function endGiveawayById(messageId, guild, interaction) {
  const giveaway = await Giveaway.findOne({ where: { messageId } });
  if (!giveaway || giveaway.ended) return;

  const channel = await guild.channels.fetch(giveaway.channelId);
  const message = await channel.messages.fetch(messageId);

  let participants = [];
  try {
    participants = JSON.parse(giveaway.participants || "[]");
  } catch (error) {
    console.error("Error parsing participants:", error);
    participants = [];
  }

  let updatedEmbed;

  if (participants.length === 0) {
    // kalau gak ada peserta
    updatedEmbed = new EmbedBuilder()
      .setTitle("> 🎉 Giveaway Berakhir!")
      .setDescription("Tidak ada peserta yang mengikuti giveaway.")
      .setColor("Red")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setImage("https://i.ibb.co/Y0C1Zcw/tenor.gif")
      .setTimestamp()
      .setFooter({ text: "Giveaway Selesai", iconURL: interaction.client.user.displayAvatarURL() });
  } else {
    // ada peserta
    const winners = [];
    for (let i = 0; i < giveaway.winners; i++) {
      if (participants.length === 0) break;
      const randomIndex = Math.floor(Math.random() * participants.length);
      winners.push(participants[randomIndex]);
      participants.splice(randomIndex, 1);
    }

    const winnerUsernames = await Promise.all(
      winners.map(async (id) => {
        try {
          const user = await guild.members.fetch(id);
          return user ? `<@${user.id}>` : `Pengguna tidak ditemukan (${id})`;
        } catch (error) {
          console.error("Error fetching user:", error);
          return `Error fetching user (${id})`;
        }
      })
    );

    // kalau giveaway tipe money, kasih duit ke pemenang
    if (giveaway.type === "money") {
      const money = parseInt(giveaway.prize);
      for (const winnerId of winners) {
        try {
          const winner = await guild.members.fetch(winnerId);
          let user = await User.findOne({ where: { userId: winner.id } });
          if (user) {
            user.cash += money;
            await user.save();
          }

          const embed = new EmbedBuilder()
            .setTitle("> 🎉 Kamu Menang Giveaway!")
            .setDescription(`Kamu mendapatkan ${money} cash dari giveaway!`)
            .setColor("Green")
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setImage("https://i.ibb.co/Y0C1Zcw/tenor.gif")
            .setTimestamp()
            .setFooter({ text: "Sistem", iconURL: interaction.client.user.displayAvatarURL() });

          await winner.send({ embeds: [embed] });
        } catch (err) {
          console.error(`Error sending DM to winner (${winnerId}):`, err);
        }
      }
    }

    updatedEmbed = new EmbedBuilder()
      .setTitle("> 🎉 Giveaway Berakhir!")
      .setDescription(`Hadiah: \`${giveaway.prize}\`\nPemenang: ${winnerUsernames.join(", ")}`)
      .setColor("Green")
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setImage("https://i.ibb.co/Y0C1Zcw/tenor.gif")
      .setTimestamp()
      .setFooter({ text: "Giveaway Selesai", iconURL: interaction.client.user.displayAvatarURL() });
  }

  // ⬇️ ini yang paling penting
  await message.edit({ embeds: [updatedEmbed] });

  giveaway.ended = true;
  await giveaway.save();
}
