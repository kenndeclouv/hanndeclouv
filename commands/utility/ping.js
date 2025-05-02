const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, WebhookClient } = require("discord.js");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Displays the bot latency and API latency."),
  async execute(interaction) {
    try {
      const sent = await interaction.reply({ content: "Pinging...", fetchReply: true, ephemeral: true });
      await interaction.channel.sendTyping();

      const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🏓 Pong!")
        .addFields({ name: "Bot Latency", value: `${botLatency}ms`, inline: true }, { name: "API Latency", value: `${apiLatency}ms`, inline: true })
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (error) {
      console.error("Error during ping command execution:", error);
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /ping`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

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
