const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Menambahkan atau menghapus role dari pengguna.")
    .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan dimodifikasi").setRequired(true))
    .addRoleOption((option) => option.setName("role").setDescription("Role yang akan ditambahkan/dihapus").setRequired(true))
    .addStringOption((option) =>
      option.setName("action").setDescription("Pilih apakah akan menambahkan atau menghapus role.").setRequired(true).addChoices({ name: "Tambah", value: "add" }, { name: "Hapus", value: "remove" })
    ),
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
    const role = interaction.options.getRole("role");
    const action = interaction.options.getString("action");
    const member = await interaction.guild.members.fetch(user.id);

    // tambahkan sebelum add/remove role
    if (interaction.guild.members.me.roles.highest.position <= role.position) {
      return interaction.editReply({
        content: `❌ | Aku gak bisa mengatur role **${role.name}** karena role itu lebih tinggi atau setara denganku 😭`,
        ephemeral: true,
      });
    }

    // Check if the command issuer has permission to manage roles
    if (!interaction.member.permissions.has("MANAGE_ROLES")) {
      const embed = new EmbedBuilder().setColor("Red").setDescription("Kamu tidak memiliki izin untuk mengelola role.");
      return interaction.editReply({ embeds: [embed] });
    }

    // Add or remove the role based on the action
    const embed = new EmbedBuilder().setThumbnail(interaction.client.user.displayAvatarURL()).setTimestamp().setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });
    if (action === "add") {
      // Check if the member already has the role
      if (member.roles.cache.has(role.id)) {
        embed.setColor("Yellow").setDescription(`🎭 | **${user.tag}** sudah memiliki role **${role.name}**.`);
        return interaction.editReply({ embeds: [embed] });
      } else {
        await member.roles.add(role);
        embed.setColor("Green").setDescription(`🎭 | Role **${role.name}** telah ditambahkan kepada **${user.tag}**.`);
        return interaction.editReply({ embeds: [embed] });
      }
    } else if (action === "remove") {
      // Check if the member has the role to remove
      if (!member.roles.cache.has(role.id)) {
        embed.setColor("Yellow").setDescription(`🎭 | **${user.tag}** tidak memiliki role **${role.name}**.`);
        return interaction.editReply({ embeds: [embed] });
      } else {
        await member.roles.remove(role);
        embed.setColor("Green").setDescription(`🎭 | Role **${role.name}** telah dihapus dari **${user.tag}**.`);
        return interaction.editReply({ embeds: [embed] });
      }
    }
  },
};
