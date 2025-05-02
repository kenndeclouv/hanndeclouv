// commands.js
const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
const { fixPrefix } = require("../../helpers");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder().setName("fixprefix").setDescription("Menambahkan prefix role tertinggi ke nickname member."),
  adminOnly: true,
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const updated = await fixPrefix(interaction.guild);

      await interaction.editReply({
        content: `✅ selesai update prefix ke ${updated} member!`,
      });
    } catch (error) {
      console.error("Error during prefix command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /prefix`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

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
