const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");
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
      // .setTitle(`> User info`)
      .setDescription(`## 📊 User info\nInformasi pengguna **${user.tag}**`)
      .addFields(
        { name: "Username", value: `${user.username}`, inline: true },
        { name: "Tag", value: `#${user.discriminator}`, inline: true },
        { name: "User ID", value: user.id, inline: false },
        { name: "Akun Dibuat", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
        { name: "Bergabung di server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
        { name: "Bot?", value: user.bot ? "Ya" : "Tidak", inline: true },
        { name: "Status", value: member.presence?.status ? member.presence.status : "Tidak diketahui", inline: true },
        {
          name: "Roles", value: member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => `<@&${role.id}>`)
            .join(", ") || "None", inline: false
        }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(embedFooter(interaction));
    return interaction.editReply({ embeds: [embed] });
  },
};
