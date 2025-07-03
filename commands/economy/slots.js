const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Mainkan mesin slot dan coba keberuntungan kamu. (JUDI HARAM BOY!)")
    .addIntegerOption((option) => option.setName("bet").setDescription("Jumlah untuk bertaruh").setRequired(true)),
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
      const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

      if (!user || user.cash < bet) {
        return interaction.editReply({ content: "❌ | kamu tidak memiliki uang yang cukup untuk bertaruh!" });
      }

      const slotResults = ["🍒", "🍋", "🍊"];
      const winChance = 0.3; // 30% chance
      const roll = Array(3)
        .fill()
        .map(() => (Math.random() < winChance ? slotResults[0] : slotResults[Math.floor(Math.random() * slotResults.length)]));

      if (roll.every((symbol) => symbol === roll[0])) {
        user.cash += bet * 3; // Triple win
        user.changed("cash", true);
        await user.saveAndUpdateCache("userId");

        const embed = new EmbedBuilder()
          .setColor("Green")
          // .setTitle("> Hasil Bermain Slot")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`## 🎰 Hasil Bermain Slot\n${interaction.user.username} menang! **${roll.join(" | ")}** ${interaction.user.username} tripled taruhan ${interaction.user.username} dan mendapatkan **${bet * 3} uang**!`)
          .setTimestamp()
          .setFooter(embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
      } else {
        user.cash -= bet; // Lose the bet
        user.changed("cash", true);
        await user.saveAndUpdateCache("userId");

        const embed = new EmbedBuilder()
          .setColor("Red")
          // .setTitle("> Hasil Bermain Slot")
          .setThumbnail(interaction.user.displayAvatarURL())
          .setDescription(`## 🎰 Hasil Bermain Slot\n❌ | ${interaction.user.username} kalah! **${roll.join(" | ")}** kamu kehilangan **${bet} uang**.`)
          .setTimestamp()
          .setFooter(embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("Error during slots command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
