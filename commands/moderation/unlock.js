const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlocks a channel to allow messages.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel to unlock").setRequired(false)),
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
    const channel = interaction.options.getChannel("channel") || interaction.channel;

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk membuka channel." });
    }

    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
    const lockEmbed = new EmbedBuilder()
      .setColor("Green")
      // .setTitle("> 🔒 Channel UnLocked")
      .setDescription(`## 🔓 Channel UnLocked\nChannel ini telah dibuka oleh <@${interaction.user.id}>`)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(embedFooter(interaction));

    await channel.send({ embeds: [lockEmbed] });
    const embed = new EmbedBuilder()
      .setColor("Green")
      // .setTitle(`> Unlock channel`)
      .setDescription(`## 🔓 Unlock channel\nChannel **${channel.name}** telah dibuka.`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(embedFooter(interaction));
    return interaction.editReply({ embeds: [embed] });
  },
};
