const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays information about a user.")
    .addUserOption((option) => option.setName("user").setDescription("User to get info about").setRequired(false)),
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
    const user = interaction.options.getUser("user") || interaction.user;

    const member = await interaction.guild.members.fetch(user.id);
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`> User info`)
      .setDescription(`Informasi pengguna **${user.tag}**`)
      .addFields({ name: "Bergabung di server", value: member.joinedAt.toDateString() }, { name: "Roles", value: member.roles.cache.map((role) => role.name).join(", ") || "None" })
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    return interaction.editReply({ embeds: [embed] });
  },
};
