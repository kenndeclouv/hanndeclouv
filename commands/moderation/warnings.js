const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Menampilkan peringatan pengguna.")
    .addUserOption((option) => option.setName("user").setDescription("Pengguna untuk memeriksa").setRequired(false)),
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

    const user = interaction.options.getUser("user") || interaction.user;
    const userRecord = await User.getCache("userId", user.id);

    // Fix: Check if userRecord exists and if warnings is a valid array before accessing .length
    if (!userRecord || !Array.isArray(userRecord.warnings) || userRecord.warnings.length === 0) {
      return interaction.editReply({
        content: `⚠️ | **${user.tag}** tidak memiliki peringatan.`,
      });
    }

    const warningsList = userRecord.warnings.map((warning) => `Reason: ${warning.reason}, Date: ${warning.date ? new Date(warning.date).toLocaleString() : "Unknown"}`).join("\n");

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`> Warnings`)
      .setDescription(`Peringatan untuk <@${user.id}> :\n${warningsList}`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: `Sistem`,
        iconURL: interaction.client.user.displayAvatarURL(),
      });

    return interaction.editReply({ embeds: [embed] });
  },
};
