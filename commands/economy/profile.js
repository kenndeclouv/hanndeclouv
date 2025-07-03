const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Lihat profil lengkap pengguna, termasuk level, bank, cash, dan lainnya.")
    .addUserOption(option =>
      option
        .setName("user")
        .setDescription("Pengguna yang ingin dilihat profilnya")
        .setRequired(false)
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();

    try {
      // Get target user or self
      const targetUser = interaction.options.getUser("user") || interaction.user;
      const userId = targetUser.id;
      const guildId = interaction.guild.id;
      const member = await interaction.guild.members.fetch(targetUser.id);
      // Fetch user data
      const userData = await User.getCache({ userId, guildId });

      if (!userData) {
        if (targetUser.id === interaction.user.id) {
          return interaction.editReply({
            content: "❌ | Kamu belum memiliki akun. Gunakan `/account create` untuk membuat akun.",
          });
        } else {
          return interaction.editReply({
            content: `❌ | ${targetUser.username} belum memiliki akun.`,
          });
        }
      }

      // Level & XP (if available)
      let level = userData.level || 1;
      let xp = userData.xp || 0;
      let nextLevelXp = (level * 100) || 100;

      // Bank & cash
      let bank = userData.bank || 0;
      let cash = userData.cash || 0;
      let bankType = userData.bankType ? userData.bankType.toUpperCase() : "-";

      // Other stats (if available)
      // let totalEarned = userData.totalEarned || 0;
      // let totalSpent = userData.totalSpent || 0;
      // let createdAt = userData.createdAt ? `<t:${Math.floor(new Date(userData.createdAt).getTime() / 1000)}:R>` : "-";

      // Rank (optional, if you want to implement leaderboard)
      // let rank = await getUserRank(userId, guildId);

      // Build embed
      const embed = new EmbedBuilder()
        .setColor("Blue")
        // .setTitle(`> 👤 Profil ${targetUser.username}`)
        // .setDescription(`## 👤 Profil ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setDescription(
          `## 🗃️ **Profil**\n` +
          `> **${targetUser.username}** <@${targetUser.id}>\n\n` +
          `> 🏷️ **Tag:** \`${targetUser.discriminator}\`   |   🆔 **ID:** \`${targetUser.id}\`\n` +
          `> 📅 **Akun Dibuat:** <t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>\n` +
          `> 👥 **Bergabung Server:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n` +
          `> 🤖 **Bot?:** \`${targetUser.bot ? "Ya" : "Tidak"}\`   |   🟢 **Status:** \`${member.presence?.status ? member.presence.status : "Tidak diketahui"}\`\n\n` +
          `### 🏆 **Level & XP**\n` +
          `> ⭐ **Level:** \`${level}\`   |   🧪 **XP:** \`${xp} / ${nextLevelXp}\`\n\n` +
          `### 💰 **Keuangan**\n` +
          `> 🏦 **Bank:** \`${bank.toLocaleString()} ${bankType !== "-" ? `(${bankType})` : ""}\`\n` +
          `> 💵 **Cash:** \`${cash.toLocaleString()}\`\n`
        )
        .setFooter(embedFooter(interaction))
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during profile command execution:", error);
      return interaction.editReply({
        content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi.",
      });
    }
  },
};
