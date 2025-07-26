const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Membuat bot mengirim pesan.")
    .addStringOption((option) => option.setName("message").setDescription("Pesan untuk dikirim").setRequired(true)),
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
    const message = interaction.options.getString("message");

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.editReply({
        content: "Kamu tidak memiliki izin untuk menggunakan perintah ini.",
      });
    }

    await interaction.channel.send(message);
    return interaction.editReply(`✅ | Bot mengirim pesan: ${message}`);
  },
};
