// commands/moderation/snipe.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");

// We'll use a simple in-memory map to store the last deleted message per channel
// This is a fallback in case the event handler is not set up properly
const snipes = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("snipe")
    .setDescription("Shows the most recent deleted message in this channel."),
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

    // Try to get the snipe from the global snipes map (populated by the event handler)
    const channelId = interaction.channel.id;
    let lastDeletedMessage;
    if (global.snipes && global.snipes.has(channelId)) {
      lastDeletedMessage = global.snipes.get(channelId);
    }

    if (!lastDeletedMessage) {
      return interaction.editReply({ content: "Tidak ada pesan yang dihapus untuk diambil di channel ini." });
    }

    const snipeEmbed = new EmbedBuilder()
      .setColor("Red")
      .setAuthor({
        name: lastDeletedMessage.author?.tag || "Unknown User",
        iconURL: lastDeletedMessage.author?.displayAvatarURL() || interaction.client.user.displayAvatarURL(),
      })
      .setDescription(lastDeletedMessage.content || "*No content*")
      .setTimestamp(lastDeletedMessage.createdAt || Date.now())
      .setFooter(embedFooter(interaction));

    // Attachments (if any)
    if (lastDeletedMessage.attachments && lastDeletedMessage.attachments.length > 0) {
      snipeEmbed.setImage(lastDeletedMessage.attachments[0]);
    }

    return interaction.editReply({ embeds: [snipeEmbed] });
  },
};
