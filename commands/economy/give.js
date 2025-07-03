const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give")
    .setDescription("Berikan uang kepada pengguna lain.")
    .addUserOption((option) => option.setName("target").setDescription("Pengguna untuk memberikan uang").setRequired(true))
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah uang untuk memberikan").setRequired(true)),
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

      if (!giver || giver.cash < amount) {
        return interaction.editReply({ content: "❌ | Kamu tidak memiliki uang tunai yang cukup untuk memberikan.", ephemeral: true });
      }

      // Update balances
      giver.cash -= amount;
      receiver.cash += amount;

      giver.changed("cash", true);
      receiver.changed("cash", true);
      await giver.saveAndUpdateCache("userId");
      await receiver.saveAndUpdateCache("userId");

      const embed = new EmbedBuilder()
        .setColor("Green")
        // .setDescription("## 💵 Hasil Memberikan Uang")
        .setDescription(`## 💵 Hasil Memberikan Uang\nKamu memberikan **${amount} uang** ke **${target.username}**!`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during give command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
