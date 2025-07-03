const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder().setName("bank").setDescription("Cek saldo bank kamu."),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      let user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
      if (!user) {
        return interaction.reply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun." });
      }

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription("## 💵 Saldo Bank")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`**${interaction.user.username}**, kamu memiliki **${user.cash} uang tunai** dan **${user.bank} di bank ${user.bankType}**, total **${user.cash + user.bank} uang**`)
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during bank command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
