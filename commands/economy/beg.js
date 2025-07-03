const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkCooldown, embedFooter } = require("../../helpers");
const User = require("../../database/models/User");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder().setName("beg").setDescription("Minta uang dari pengguna lain."),
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
      const cooldown = checkCooldown(user.lastBeg, process.env.BEG_COOLDOWN);
      if (cooldown.remaining) {
        return interaction.reply({ content: `🕒 | kamu dapat meminta uang lagi dalam **${cooldown.time}**!` });
      }

      // Randomize beg amount between 10 and 50
      const randomCash = Math.floor(Math.random() * 41) + 10;
      user.cash += randomCash;
      user.lastBeg = Date.now();
      user.changed("cash", true);
      user.changed("lastBeg", true);
      await user.saveAndUpdateCache("userId");

      const embed = new EmbedBuilder()
        .setColor("Yellow")
        .setTitle("> Hasil Meminta")
        .setThumbnail(interaction.user.displayAvatarURL())
        .setDescription(`kamu meminta dan menerima **${randomCash} uang**!`)
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during beg command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
