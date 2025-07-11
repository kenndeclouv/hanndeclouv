const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("transfer")
    .setDescription("Transfer uang kepada pengguna lain.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna untuk mentransfer uang").setRequired(true))
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah uang untuk mentransfer").setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const target = interaction.options.getUser("target");
      const amount = interaction.options.getInteger("amount");

      const giver = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
      const receiver = await User.getCache({ userId: target.id, guildId: interaction.guild.id });

      if (!giver || giver.bank < amount) {
        return interaction.editReply({ content: "kamu tidak memiliki uang di bank yang cukup untuk mentransfer." });
      }
      if (!receiver) {
        return interaction.editReply({ content: "Pengguna yang dituju tidak memiliki akun. gunakan `/account create` untuk membuat akun." });
      }
      if (giver.userId === receiver.userId) {
        return interaction.editReply({ content: "kamu tidak dapat mentransfer uang kepada diri sendiri." });
      }
      let fee = 0;
      if (giver.bankType !== receiver.bankType) {
        fee = Math.floor(amount * 0.05);
      }
      if (giver.bank < amount + fee) {
        return interaction.editReply({ content: "kamu tidak memiliki uang di bank yang cukup untuk menutupi biaya transfer." });
      }
      giver.bank -= amount + fee;
      receiver.bank += amount;

      giver.changed("bank", true);
      receiver.changed("bank", true);
      await giver.saveAndUpdateCache("userId");
      await receiver.saveAndUpdateCache("userId");

      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

      const confirmEmbed = new EmbedBuilder()
        .setColor("Yellow")
        .setDescription("## 💵 Konfirmasi Transfer Uang")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`kamu akan mentransfer **${amount} uang** ke **${target.username}** dengan biaya **${fee} uang**. Apakah kamu ingin melanjutkan?`)
        .setTimestamp()
        .setFooter(embedFooter(interaction));

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("confirm").setLabel("Konfirmasi").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("cancel").setLabel("Batalkan").setStyle(ButtonStyle.Danger)
      );

      await interaction.editReply({ embeds: [confirmEmbed], components: [row] });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on("collect", async (i) => {
        if (i.customId === "confirm") {
          const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription("## 💵 Berhasil Transfer Uang")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`kamu berhasil mentransfer **${amount} uang** ke **${target.username}** dengan biaya **${fee} uang**!`)
            .setTimestamp()
            .setFooter(embedFooter(interaction));
          await i.update({ embeds: [embed], components: [] });

          const targetEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription("## 💵 kamu Mendapatkan Transfer Uang")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`kamu menerima **${amount} uang** transfer ke bank kamu dari **${interaction.user.username}**!`)
            .setTimestamp()
            .setFooter(embedFooter(interaction));
          await target.send({ embeds: [targetEmbed] });
        } else if (i.customId === "cancel") {
          await i.update({ content: "Transfer dibatalkan.", components: [] });
        }
      });

      collector.on("end", (collected) => {
        if (collected.size === 0) {
          interaction.editReply({ content: "Waktu habis. Transfer dibatalkan.", components: [] });
        }
      });
    } catch (error) {
      console.error("Error during transfer command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
