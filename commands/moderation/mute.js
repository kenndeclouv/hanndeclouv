const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mutes a user in a voice channel.")
    .addUserOption((option) => option.setName("user").setDescription("User to mute").setRequired(true)),
  adminOnly: true,
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });
    // Check if user is in a voice channel
    const targetUser = interaction.options.getUser("user");
    const targetMember = await interaction.guild.members.fetch(targetUser.id);
    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({
        content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
        ephemeral: true,
      });
    }

    if (!targetMember.voice.channel) {
      return interaction.editReply({ content: "❌ User tersebut tidak berada di voice channel." });
    }
    const user = interaction.options.getUser("user");

    if (!interaction.member.permissions.has("MUTE_MEMBERS")) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini." });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.voice.setMute(true, "Muted by command.");
      const embed = new EmbedBuilder()
        .setColor("Red")
        // .setTitle("> Muted")
        .setDescription(`## 🔇 Muted\n**${user.tag}** telah dimute oleh **${interaction.user.tag}** melalui command.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter(embedFooter(interaction));
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "That user is not in this server!" });
    }
  },
};
