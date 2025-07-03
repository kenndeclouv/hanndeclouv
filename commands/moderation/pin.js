const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("pin")
    .setDescription("Pins a message in the channel.")
    .addStringOption((option) => option.setName("message_id").setDescription("ID of the message to pin").setRequired(true)),
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
    const messageId = interaction.options.getString("message_id");

    if (!interaction.member.permissions.has("MANAGE_MESSAGES")) {
      return interaction.editReply({ content: "You do not have permission to pin messages." });
    }

    const message = await interaction.channel.messages.fetch(messageId);
    if (!message) return interaction.editReply({ content: "Message not found!" });

    await message.pin();
    const embed = new EmbedBuilder()
      .setColor("Green")
      // .setTitle("> Pin")
      .setDescription(`## 📌 Pin\n**${message.content}** telah dipin dari channel ini.`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(embedFooter(interaction));
    return interaction.editReply({ embeds: [embed] });
  },
};
