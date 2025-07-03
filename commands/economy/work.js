const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkCooldown, embedFooter } = require("../../helpers");
const Inventory = require("../../database/models/Inventory");
const User = require("../../database/models/User");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder().setName("work").setDescription("Bekerja untuk mendapatkan uang."),
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
        return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun." });
      }

      const laptop = await Inventory.getCache({ userId: user.userId, itemName: "💻 Laptop" });

      let cooldownTime = 1;
      if (laptop) {
        cooldownTime = 0.5;
      }
      // Cooldown check
      const cooldown = checkCooldown(user.lastWork, process.env.WORK_COOLDOWN * cooldownTime);
      if (cooldown.remaining) {
        return interaction.editReply({ content: `🕒 | kamu dapat bekerja lagi dalam **${cooldown.time}**!` });
      }

      const randomCash = Math.floor((Math.random() * 101 + 50) * 0.5 * (user.careerMastered || 1));

      // Determine if the user has to pay tax
      const payTax = Math.random() < 0.05; // 5% chance
      let taxAmount = 0;
      if (payTax) {
        taxAmount = Math.floor(randomCash * 0.1); // 10% tax
        user.cash += randomCash - taxAmount;
      } else {
        user.cash += randomCash;
      }

      user.lastWork = new Date();
      const workedMaximally = Math.random() >= 0.8; // 20% chance of working maximally
      if (workedMaximally && user.careerMastered < 10) {
        user.careerMastered += 1;
      }
      user.changed("cash", true);
      user.changed("lastWork", true);
      await user.saveAndUpdateCache("userId");

      const embed = new EmbedBuilder()
        .setColor(payTax ? "Yellow" : "Green")
        .setTitle("> Hasil Bekerja")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(
          `${interaction.user.username} bekerja keras dan mendapatkan **${randomCash} uang**!${payTax ? ` tapi harus membayar pajak sebesar **${taxAmount} uang**.` : ""}${
            workedMaximally ? ` dan level karir kamu naik **${user.careerMastered}**!` : ""
          }`
        )
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during work command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
