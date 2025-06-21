const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unbans a user from the server.")
    .addStringOption((option) => option.setName("userid").setDescription("User ID to unban").setRequired(true)),
  adminOnly: true,
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });
    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({
        content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
        ephemeral: true,
      });
    }
    const userId = interaction.options.getString("userid");

    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk membatasi anggota." });
    }

    try {
      await interaction.guild.members.unban(userId);
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`> Unban member`)
        .setDescription(`<@${userId}> telah diunbann dari server ini.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      return interaction.editReply({ content: "Tidak bisa membatasi pengguna tersebut. Silakan periksa ID." });
    }
  },
};
