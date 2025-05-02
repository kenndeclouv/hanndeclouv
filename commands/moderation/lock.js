const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, WebhookClient } = require("discord.js");
const { checkPermission } = require("../../helpers");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Locks a channel to prevent messages.")
    .addChannelOption((option) => option.setName("channel").setDescription("Channel to lock").setRequired(false)),
  adminOnly: true,
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      // cek permission manual
      if (!(await checkPermission(interaction.member))) {
        return interaction.editReply({
          content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
        });
      }

      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.editReply({
          content: "❌ Kamu tidak punya permission Manage Channels.",
        });
      }

      const channel = interaction.options.getChannel("channel") || interaction.channel;

      // coba kunci channel
      try {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      } catch (err) {
        return interaction.editReply({
          content: "❌ Gagal mengunci channel. Pastikan bot memiliki izin yang cukup.",
        });
      }

      // embed lock untuk channel
      const lockEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> 🔒 Channel Locked")
        .setDescription(`Channel ini telah dikunci oleh <@${interaction.user.id}>`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: `Sistem`,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      try {
        await channel.send({ embeds: [lockEmbed] });
      } catch (_) {
        // abaikan error kalau ga bisa kirim
      }

      // embed balasan ke user
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("> Lock")
        .setDescription(`**${channel.name}** telah dikunci.`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: `Dikunci oleh ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during lock command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /lock`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
