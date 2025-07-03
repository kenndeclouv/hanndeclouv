const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
const User = require("../../database/models/User");
const { levelUpXp, generateLevelImage, embedFooter } = require("../../helpers");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Info leveling di server ini.")
    .addSubcommand((subcommand) => subcommand.setName("profile").setDescription("Lihat profil level Kamu."))
    .addSubcommand((subcommand) => subcommand.setName("leaderboard").setDescription("Lihat papan peringkat level."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Tambahkan level ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan ditambahkan levelnya").setRequired(true))
        .addIntegerOption((option) => option.setName("level").setDescription("Level yang akan ditambahkan").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set level ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan diset levelnya").setRequired(true))
        .addIntegerOption((option) => option.setName("level").setDescription("Level yang akan diset").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("xp-add")
        .setDescription("Tambahkan XP ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan ditambahkan XPnya").setRequired(true))
        .addIntegerOption((option) => option.setName("xp").setDescription("XP yang akan ditambahkan").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("xp-set")
        .setDescription("Set XP ke pengguna.")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan diset XPnya").setRequired(true))
        .addIntegerOption((option) => option.setName("xp").setDescription("XP yang akan diset").setRequired(true))
    ),
  // adminOnly: true,

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
      switch (subcommand) {
        case "profile": {
          // Mencari data user berdasarkan ID
          let user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

          // Jika tidak ada data user, beri tahu bahwa profil belum ada
          if (!user) {
            user = await User.create({ userId: interaction.user.id, guildId: interaction.guild.id });
            return interaction.editReply({
              content: "Kamu belum memiliki profil level, membuatkan untuk kamu..",
            });
          }

          // Generate level profile image (buffer)
          // const { generateLevelImage } = require("../../helpers");
          const buffer = await generateLevelImage({
            username: interaction.user.username,
            avatarURL: interaction.user.displayAvatarURL({ extension: "png", size: 256 }),
            level: user.level,
            xp: user.xp,
            nextLevelXp: levelUpXp(user.level),
            backgroundURL: "https://files.catbox.moe/ooketf.png"
          });

          // Membuat embed untuk menampilkan profil level
          const embed = new EmbedBuilder()
            .setColor("Blue")
            // .setTitle("> Profil Level")
            .setDescription(`## 🎖️ Profil level\n**${interaction.user.username}**, Kamu berada di level **${user.level || 0}** dengan total XP **${user.xp || 0}**, **XP saat ini:** ${user.xp}/${levelUpXp(user.level)}.`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setImage("attachment://level-profile.png")
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          // Mengirimkan embed sebagai balasan beserta buffer gambar
          await interaction.editReply({ embeds: [embed], files: [{ attachment: buffer, name: "level-profile.png" }] });

          break; // Added break statement
        }
        case "leaderboard": {
          const topUsers = await User.findAll({
            where: { guildId: interaction.guild.id },
            order: [
              ["level", "DESC"],
              ["xp", "DESC"],
            ],
            limit: 10,
          });

          const leaderboard = topUsers.map((user, index) => `${index + 1}. <@${user.userId}> - Level **${user.level || 0}** (${user.xp || 0} XP)`).join("\n");

          const embed = new EmbedBuilder()
            .setColor("Gold")
            // .setTitle("> Papan Peringkat Level Top 3")
            .setDescription(`## 🏅 Level Leaderboard\n${leaderboard || "Belum ada data."}`)
            // .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          await interaction.editReply({ embeds: [embed] });
          break; // Added break statement
        }
        case "add": {
          if (!(await checkPermission(interaction.member))) {
            return interaction.editReply({
              content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
              ephemeral: true,
            });
          }
          const user = await User.getCache({ userId: interaction.options.getUser("user").id, guildId: interaction.guild.id });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.level += interaction.options.getInteger("level");
          user.changed("level", true);
          await user.saveAndUpdateCache("userId");
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> Level Added")
            .setDescription(
              `Level berhasil ditambahkan ke pengguna **${interaction.options.getUser("user").username}** sebanyak **${interaction.options.getInteger("level")}** level, sekarang levelnya adalah **${user.level
              }** level.`
            )
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
        case "set": {
          if (!(await checkPermission(interaction.member))) {
            return interaction.editReply({
              content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
              ephemeral: true,
            });
          }
          const user = await User.getCache({ userId: interaction.options.getUser("user").id, guildId: interaction.guild.id });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.level = interaction.options.getInteger("level");
          user.changed("level", true);
          await user.saveAndUpdateCache("userId");
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> Level Set")
            .setDescription(`Level berhasil diatur ke pengguna **${interaction.options.getUser("user").username}** sekarang levelnya adalah **${user.level}** level.`)
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
        case "xp-add": {
          if (!(await checkPermission(interaction.member))) {
            return interaction.editReply({
              content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
              ephemeral: true,
            });
          }
          const user = await User.getCache({ userId: interaction.options.getUser("user").id, guildId: interaction.guild.id });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.xp += interaction.options.getInteger("xp");
          user.changed("xp", true);
          await user.saveAndUpdateCache("userId");
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> XP Added")
            .setDescription(
              `XP berhasil ditambahkan ke pengguna **${interaction.options.getUser("user").username}** sebanyak **${interaction.options.getInteger("xp")}** XP, sekarang XPnya adalah **${user.xp}** XP.`
            )
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
        case "xp-set": {
          if (!(await checkPermission(interaction.member))) {
            return interaction.editReply({
              content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
              ephemeral: true,
            });
          }
          const user = await User.getCache({ userId: interaction.options.getUser("user").id, guildId: interaction.guild.id });
          if (!user) {
            return interaction.editReply({ content: "Pengguna tidak ditemukan." });
          }
          user.xp = interaction.options.getInteger("xp");
          user.changed("xp", true);
          await user.saveAndUpdateCache("userId");
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> XP Set")
            .setDescription(`XP berhasil diatur ke pengguna **${interaction.options.getUser("user").username}** sekarang XPnya adalah **${user.xp}** XP.`)
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          return interaction.editReply({ embeds: [embed], ephemeral: true });
        }
      }
    } catch (error) {
      console.error("Error during level command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /level`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

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
