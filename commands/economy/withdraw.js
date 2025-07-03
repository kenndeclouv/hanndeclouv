const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Tarik uang tunai kamu dari bank.")
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah untuk menarik uang").setRequired(true)),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const amount = interaction.options.getInteger("amount");
      const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

      if (!user || user.bank < amount) {
        return interaction.editReply({ content: "kamu tidak memiliki uang yang cukup di bank untuk menarik uang!" });
      }

      user.bank -= amount;
      user.cash += amount;
      user.changed("bank", true);
      user.changed("cash", true);
      await user.saveAndUpdateCache("userId");

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("> Hasil Menarik Uang")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`${interaction.user.username} menarik **${amount} uang** dari bank.`)
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during withdraw command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
