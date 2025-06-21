const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Puts a user in timeout for a specified duration.")
    .addUserOption((option) => option.setName("user").setDescription("User to timeout").setRequired(true))
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
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration") * 1000;

    if (!interaction.member.permissions.has("MODERATE_MEMBERS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk membatasi anggota." });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      try {
        await member.timeout(duration, "Timeout by command.");
        const embed = new EmbedBuilder()
          .setColor("Green")
          .setTitle(`> Timeout member`)
          .setDescription(`<@${user.id}> telah dibatasi selama **${duration / 1000}** detik.`)
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setTimestamp()
          .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
        return interaction.editReply({ embeds: [embed] });
      } catch (error) {
        console.error("Error during timeout:", error);
        return interaction.editReply({ content: `❌ Terjadi kesalahan saat mencoba timeout pengguna: ${error.message}` });
      }
    } else {
      return interaction.editReply({ content: "Pengguna tersebut tidak ada di server ini!" });
    }
  },
};
