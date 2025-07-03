const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { checkCooldown, embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Kumpulkan uang harian kamu."),
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

      // Cooldown check
      const cooldown = checkCooldown(user.lastDaily, process.env.DAILY_COOLDOWN);
      if (cooldown.remaining) {
        return interaction.reply({ content: `🕒 | kamu dapat mengumpulkan uang harian kamu dalam **${cooldown.time}**!` });
      }

      // Randomize the daily cash reward between 50 and 150
      const randomCash = Math.floor(Math.random() * 101) + 50;
      user.cash += randomCash;
      user.lastDaily = Date.now();
      user.changed("cash", true);
      user.changed("lastDaily", true);
      await user.saveAndUpdateCache("userId");

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setDescription("## 💵 Hasil Mengumpulkan Uang Harian")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`kamu mengumpulkan uang harian kamu sebesar **${randomCash} uang**!`)
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during daily command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
