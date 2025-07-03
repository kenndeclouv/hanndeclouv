const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip koin dan coba keberuntungan kamu.")
    .addIntegerOption((option) => option.setName("bet").setDescription("Jumlah untuk bertaruh").setRequired(true))
    .addStringOption((option) => option.setName("side").setDescription("Heads atau Tails").setRequired(true).addChoices({ name: "Heads", value: "heads" }, { name: "Tails", value: "tails" })),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const bet = interaction.options.getInteger("bet");
      const side = interaction.options.getString("side").toLowerCase();
      const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

      if (!user || user.cash < bet) {
        return interaction.reply({ content: "kamu tidak memiliki uang tunai yang cukup untuk bertaruh." });
      }

      const flip = Math.random() < 0.5 ? "heads" : "tails";

      if (side === flip) {
        user.cash += bet; // Double the bet if correct
        user.changed("cash", true);
        await user.saveAndUpdateCache("userId");
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setDescription("## 🪙 Hasil Coin Flip")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`🎉 | **${flip}**! kamu menang dan mendapatkan **${bet} uang**!`)
          .setTimestamp()
          .setFooter(embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
      } else {
        user.cash -= bet; // Lose the bet if incorrect
        user.changed("cash", true);
        await user.saveAndUpdateCache("userId");
        const embed = new EmbedBuilder()
          .setColor("Red")
          .setDescription("## 🪙 Hasil Coin Flip")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`❌ | **${flip}**! kamu kehilangan **${bet} uang**.`)
          .setTimestamp()
          .setFooter(embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error during coinflip command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
