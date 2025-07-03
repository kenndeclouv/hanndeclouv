const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
require("dotenv").config();
const { checkCooldown, embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder().setName("lootbox").setDescription("Buka kotak hadiah untuk mendapatkan hadiah acak."),
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

      // Cooldown check
      const cooldown = checkCooldown(user.lastLootbox, process.env.LOOTBOX_COOLDOWN);
      if (cooldown.remaining) {
        return interaction.editReply({ content: `🕒 | kamu dapat membuka kotak hadiah lainnya dalam **${cooldown.time}**!` });
      }

      // Randomize lootbox reward between 100 and 500
      const randomReward = Math.floor(Math.random() * 401) + 100;
      user.cash += randomReward;
      user.lastLootbox = Date.now();
      user.changed("cash", true);
      user.changed("lastLootbox", true);
      await user.saveAndUpdateCache("userId");

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("> Hasil Membuka Kotak Hadiah")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`kamu membuka kotak hadiah dan menerima **${randomReward} uang**!`)
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during lootbox command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
