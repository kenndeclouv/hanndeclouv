const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Unmutes a user in a voice channel.")
    .addUserOption((option) => option.setName("user").setDescription("User to unmute").setRequired(true)),
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

    if (!interaction.member.permissions.has("MUTE_MEMBERS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk membuka suara." });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.voice.setMute(false, "Unmuted by command.");
      const embed = new EmbedBuilder()
        .setColor("Green")
        // .setTitle(`> Unmute member`)
        .setDescription(`## 🔊 Unmute\n<@${user.id}> telah diunmute.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "Pengguna tersebut tidak ada di server ini!" });
    }
  },
};
