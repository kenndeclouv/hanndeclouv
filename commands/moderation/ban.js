const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban user dari server.")
    .addUserOption((option) => option.setName("user").setDescription("User untuk diban").setRequired(true))
    .addStringOption((option) => option.setName("reason").setDescription("Alasan ban (opsional)").setRequired(false)),
  adminOnly: true,
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({
        content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
        ephemeral: true,
      });
    }
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "Member diban oleh command.";

    if (!interaction.member.permissions.has("BAN_MEMBERS")) {
      return interaction.editReply({ content: "Kamu tidak memiliki izin untuk memban user." });
    }

    let member;
    try {
      member = await interaction.guild.members.fetch(user.id);
    } catch (e) {
      member = null;
    }

    if (member) {
      await member.ban({ reason });
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> Ban")
        .setDescription(`🚫 | **${user.tag}** telah diban dari server.\n**Alasan:** ${reason}`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({
          text: `Sistem`,
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      return interaction.editReply({ embeds: [embed] });
    } else {
      return interaction.editReply({ content: "User tidak ada di server ini!" });
    }
  },
};
