const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder().setName("cash").setDescription("Cek saldo tunai kamu."),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
      if (!user) {
        return interaction.reply({ content: "kamu belum memiliki saldo." });
      }

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription("## 💵 Saldo Tunai")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`**${interaction.user.username}**, kamu memiliki **${user.cash} uang tunai!**`)
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during cash command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
