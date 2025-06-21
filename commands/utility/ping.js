const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Cek kecepatan respon bot dan API Discord."),
  async execute(interaction) {
    try {
      const sent = await interaction.reply({ content: "🏓 Menghitung ping...", fetchReply: true });

      const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(interaction.client.ws.ping);

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("🏓 Pong!")
        .addFields({ name: "Bot Latency", value: `\`${botLatency}ms\``, inline: true }, { name: "API Latency", value: `\`${apiLatency}ms\``, inline: true })
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: `Diminta oleh ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });
    } catch (error) {
      console.error("Error in /ping command:", error);
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> ❌ Error command /ping")
        .setDescription(`\`\`\`${error.stack || error}\`\`\``)
        .addFields({ name: "User", value: `${interaction.user.tag} (${interaction.user.id})` }, ...(interaction.guild ? [{ name: "Guild", value: `${interaction.guild.name} (${interaction.guild.id})` }] : []))
        .setTimestamp();

      webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi.",
          embeds: [],
        });
      } else {
        await interaction.reply({
          content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi.",
          ephemeral: true,
        });
      }
    }
  },
};
