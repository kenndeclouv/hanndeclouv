const { Events, WebhookClient, EmbedBuilder } = require("discord.js");
require("dotenv").config();
module.exports = {
  name: Events.InviteDelete,
  async execute(invite) {
    try {
      console.log("🔵 invite delete");

      const invites = await invite.guild.invites.fetch();
      invite.client.invites.set(invite.guild.id, invites);
    } catch (error) {
      console.error("Error during invite delete execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error invite delete`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

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
