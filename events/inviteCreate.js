const { Events, WebhookClient, EmbedBuilder } = require("discord.js");
const InviteModel = require("../database/models/Invite");
require("dotenv").config();
module.exports = {
  name: Events.InviteCreate,
  async execute(invite) {
    if (!invite.client.invites) invite.client.invites = new Map();

    try {
      console.log("🔵 invite create")
      // fetch ulang semua invite
      const invites = await invite.guild.invites.fetch();
      invite.client.invites.set(invite.guild.id, invites);

      // simpan ke DB
      if (invite.inviter) {
        await InviteModel.findOrCreate({
          where: {
            guildId: invite.guild.id,
            userId: invite.inviter.id,
          },
          defaults: {
            invites: 0, // diitung pas memberJoin
          },
        });
      }
    } catch (error) {
      console.error("Error invite create :", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error invite create`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

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
