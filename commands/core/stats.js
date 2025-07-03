const { EmbedBuilder, version, WebhookClient } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { embedFooter } = require("../../helpers");
require("dotenv").config();
const os = require("os");
module.exports = {
  data: new SlashCommandBuilder().setName("stats").setDescription("Menampilkan statistik bot."),
  async execute(interaction) {
    if (interaction.guild) {
      await interaction.channel.sendTyping();
    }

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
        .setColor("Blue") //#8e44ad
        // .setTitle("✨ Bot Statistik")
        .setDescription(
          [
            "## 📊 **Statistik Bot**",
            "",
            `> **Uptime:** \`${uptime}\``,
            `> **Penggunaan Memori:** \`${memoryUsage} MB\``,
            `> **Server:** \`${totalGuilds}\`   |   **Pengguna:** \`${totalUsers}\``,
            "",
            "### ⚙️ **Teknologi**",
            `> **Node.js:** \`${nodeVersion}\`   |   **discord.js:** \`v${discordJsVersion}\``,
            `> **CPU:** \`${cpuModel}\``,
            "",
            "### 📶 **Koneksi**",
            `> **Bot Latency:** \`${botLatency}ms\`   |   **API Latency:** \`${apiLatency}ms\``,
            "",
            "### 👑 **Owner**",
            `> \`kenndeclouv\``
          ].join("\n")
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter(embedFooter(interaction))
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error during stats command execution:", error);
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> ❌ Error command /stats")
        .setDescription(`\`\`\`${error.stack || error}\`\`\``)
        .addFields(
          { name: "User", value: `${interaction.user.tag} (${interaction.user.id})` },
          ...(interaction.guild ? [{ name: "Guild", value: `${interaction.guild.name} (${interaction.guild.id})` }] : [])
        )
        .setTimestamp();

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
  if (days) parts.push(`${days} h`);
  if (hours) parts.push(`${hours} j`);
  if (minutes) parts.push(`${minutes} m`);
  if (seconds) parts.push(`${seconds} s`);

  return parts.join(" ");
}
