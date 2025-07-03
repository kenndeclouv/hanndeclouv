const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
const User = require("../../database/models/User");
const BotSetting = require("../../database/models/BotSetting");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Beri peringatan ke user.")
    .addUserOption((option) => option.setName("user").setDescription("User untuk diberi peringatan").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Alasan").setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });

    try {
      const setting = await BotSetting.getCache({ guildId: interaction.guild.id });
      const targetUser = interaction.options.getUser("user");
      const reason = interaction.options.getString("reason");

      let member;
      try {
        member = await interaction.guild.members.fetch(targetUser.id);
      } catch (err) {
        member = null;
      }

      if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
        return interaction.editReply({
          content: "Kamu tidak memiliki izin untuk memberi peringatan.",
        });
      }

      if (!member) {
        return interaction.editReply({
          content: "Pengguna tersebut tidak ada di server ini!",
        });
      }

      const userRecord = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });
      if (!userRecord) {
        return interaction.editReply({
          content: "Pengguna tidak ditemukan di database!",
        });
      }

      if (!Array.isArray(userRecord.warnings)) {
        userRecord.warnings = []; // inisialisasi array jika kosong
      }
      userRecord.warnings.push({ reason, date: new Date() });

      try {
        userRecord.changed("warnings", true);
        await userRecord.saveAndUpdateCache("userId"); // Pastikan kita simpan dengan benar
      } catch (err) {
        console.error("Error while saving user record:", err);
        return interaction.editReply({
          content: "Gagal menyimpan peringatan ke database!",
        });
      }

      // Jika sudah ada 3 peringatan (setelah penambahan ini), timeout member selama 1 hari
      let timeoutApplied = false;
      if (userRecord.warnings.length >= 3) {
        // Cek apakah bot punya izin MODERATE_MEMBERS
        if (member.moderatable && member.permissions.has("SEND_MESSAGES")) {
          try {
            // 1 hari = 24 * 60 * 60 * 1000 ms = 86400000 ms
            await member.timeout(86400000, "Mencapai 3 peringatan.");
            timeoutApplied = true;
          } catch (err) {
            // Gagal timeout, bisa log jika perlu
            console.warn("Gagal timeout member setelah 3 warning:", err.message);
          }
        } else {
          // Bot tidak punya izin, bisa log jika perlu
          console.warn("Bot tidak punya izin MODERATE_MEMBERS untuk timeout member.");
        }
      }

      if (setting && setting.modLogChannelId) {
        const modLogChannel = interaction.guild.channels.cache.get(setting.modLogChannelId);

        if (!modLogChannel) {
          return interaction.editReply({
            content: "Channel mod log tidak ditemukan!",
          });
        }

        if (!modLogChannel.permissionsFor(interaction.client.user).has("SEND_MESSAGES")) {
          return interaction.editReply({
            content: "Bot tidak memiliki izin untuk mengirim pesan ke channel mod log!",
          });
        }

        try {
          const channelEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("> ⚠️ Peringatan Diberikan")
            .setDescription(`<@${targetUser.id}> telah menerima peringatan dari <@${interaction.user.id}> karena: **${reason}**`)
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          await modLogChannel.send({ embeds: [channelEmbed] });

          // Jika timeout diterapkan, log juga ke modlog
          if (timeoutApplied) {
            const timeoutEmbed = new EmbedBuilder()
              .setColor("Orange")
              .setTitle("> ⏳ Timeout Otomatis")
              .setDescription(`<@${targetUser.id}> telah di-timeout selama 1 hari karena mencapai 3 peringatan.`)
              .setTimestamp()
              .setFooter(embedFooter(interaction));
            await modLogChannel.send({ embeds: [timeoutEmbed] });
          }
        } catch (err) {
          console.warn("Gagal mengirim log ke modLogChannel:", err.message);
        }
      }

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("> Warn member")
        .setDescription(`<@${targetUser.id}> telah diberi peringatan karena: ${reason}` + (timeoutApplied ? "\n\n⏳ User telah di-timeout selama 1 hari karena mencapai 3 peringatan." : ""))
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(embedFooter(interaction));

      const warnEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> ⚠️ Peringatan Diberikan")
        .setDescription(
          `Kamu (<@${targetUser.id}>) telah menerima peringatan dari <@${interaction.user.id}> karena: **${reason}**` +
          (timeoutApplied ? "\n\n⏳ Kamu telah di-timeout selama 1 hari karena mencapai 3 peringatan." : "")
        )
        .setTimestamp()
        .setFooter(embedFooter(interaction));

      try {
        await targetUser.send({ embeds: [warnEmbed] });
      } catch (err) {
        // Gagal DM user, bisa diabaikan atau log jika perlu
      }

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during warn command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /warn`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

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
