const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, version, WebhookClient } = require("discord.js");
const os = require("os");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder().setName("stats").setDescription("Menampilkan statistik bot."),
  async execute(interaction) {
    await interaction.channel.sendTyping();

    try {
      const { client } = interaction;
      const uptime = formatDuration(client.uptime);
      const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalGuilds = client.guilds.cache.size;
      const totalUsers = client.users.cache.size;
      const nodeVersion = process.version;
      const discordJsVersion = version;
      const cpuModel = os.cpus()[0].model;

      // Calculate ping (bot latency & API latency)
      const sent = await interaction.reply({ content: "Mengambil statistik...", fetchReply: true });
      const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);

      const embed = new EmbedBuilder()
        .setColor("Purple")
        .setTitle("> 📊 Statistik Bot")
        .addFields(
          { name: "Uptime", value: uptime, inline: true },
          { name: "Penggunaan Memori", value: `${memoryUsage} MB`, inline: true },
          { name: "Server", value: `${totalGuilds}`, inline: true },
          { name: "Pengguna", value: `${totalUsers}`, inline: true },
          { name: "Node.js", value: nodeVersion, inline: true },
          { name: "discord.js", value: `v${discordJsVersion}`, inline: true },
          { name: "CPU", value: cpuModel, inline: false },
          { name: "Bot Latency", value: `${botLatency}ms`, inline: true },
          { name: "API Latency", value: `${apiLatency}ms`, inline: true },
          { name: "Owner", value: ` <@${process.env.OWNER_ID}>`, inline: false }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({
          text: interaction.client.user.username + " by kenndeclouv",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error during stats command execution:", error);
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /stats`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.reply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};

function formatDuration(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days) parts.push(`${days}h`);
  if (hours) parts.push(`${hours}j`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);

  return parts.join(" ");
}
