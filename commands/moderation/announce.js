const { SlashCommandBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Membuat pengumuman di channel yang ditentukan.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel untuk pengumuman").setRequired(true))
    .addStringOption((option) => option.setName("message").setDescription("Pesan pengumuman").setRequired(true)),
  adminOnly: true,
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({
        content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
        ephemeral: true,
      });
    }
    const channel = interaction.options.getChannel("channel");
    const message = interaction.options.getString("message");

    if (!interaction.member.permissions.has("SEND_MESSAGES")) {
      return interaction.editReply({ content: "kamu tidak memiliki izin untuk mengirim pesan." });
    }

    await channel.send(`📢 Pengumuman: ${message}`);
    return interaction.editReply(`✅ | Pengumuman dikirim di **${channel.name}**.`);
  },
};
