const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
const { rolePrefix, roleUnprefix } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleprefix")
    .setDescription("Menambahkan atau menghapus prefix dari nickname member.")
    .addSubcommand((sub) => sub.setName("add").setDescription("Menambahkan prefix role tertinggi ke nickname member."))
    .addSubcommand((sub) => sub.setName("remove").setDescription("Menghapus prefix dari nickname member.")),
  adminOnly: true,

  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const subcommand = interaction.options.getSubcommand();
      let updated = 0;

      if (subcommand === "add") {
        updated = await rolePrefix(interaction.guild);
        await interaction.editReply({
          content: `✅ selesai update prefix ke ${updated} member!`,
        });
      } else if (subcommand === "remove") {
        updated = await roleUnprefix(interaction.guild);
        await interaction.editReply({
          content: `✅ selesai hapus prefix dari ${updated} member!`,
        });
      }
    } catch (error) {
      console.error("Error during roleprefix command execution:", error);

      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /roleprefix`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({ text: `Error dari server ${interaction.guild.name}` })
        .setTimestamp();

      webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);

      return interaction.editReply({
        content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi.",
      });
    }
  },
};