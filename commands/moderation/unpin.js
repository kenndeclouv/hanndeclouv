const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unpin")
    .setDescription("Unpins a message in the channel.")
    .addStringOption((option) => option.setName("message_id").setDescription("ID of the message to unpin").setRequired(true)),
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
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk mengunpin pesan." });
    }

    const message = await interaction.channel.messages.fetch(messageId);
    if (!message) return interaction.editReply({ content: "Pesan tidak ditemukan!" });

    await message.unpin();
    const embed = new EmbedBuilder()
      .setColor("Green")
      // .setTitle(`> Unpin message`)
      .setDescription(`## 📌 Unpin message\nPesan dengan ID **${messageId}** telah diunpin.`)
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter(embedFooter(interaction));
    return interaction.editReply({ embeds: [embed] });
  },
};
