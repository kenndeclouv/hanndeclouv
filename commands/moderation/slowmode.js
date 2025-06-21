const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Sets the slowmode for the channel.")
    .addIntegerOption((option) => option.setName("duration").setDescription("Duration in seconds").setRequired(true)),
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
    const duration = interaction.options.getInteger("duration");

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk mengatur slowmode." });
    }

    await interaction.channel.setRateLimitPerUser(duration);
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setDescription(`⏳ | Slowmode set to **${duration}** seconds.`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    return interaction.editReply({ embeds: [embed] });
  },
};
