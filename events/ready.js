require("dotenv").config();
const BotSetting = require("../database/models/BotSetting");
const { updateStats, updateMinecraftStats } = require("../helpers");
const { WebhookClient } = require('discord.js');

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`✅ bot siap sebagai ${client.user.tag}`);

    client.user.setPresence({
      activities: [{ name: process.env.DISCORD_BOT_ACTIVITY }],
      status: process.env.DISCORD_BOT_STATUS,
    });

    try {
      const allSettings = await BotSetting.getAllCache();

      // filter setting yang guild-nya ada dan fitur aktif
      const activeSettings = allSettings.filter((s) => client.guilds.cache.has(s.guildId) && (s.serverStatsOn || s.minecraftStatsOn));

      // fetch member di semua guild aktif
      await Promise.all(activeSettings.map((s) => client.guilds.cache.get(s.guildId)?.members.fetch()));

      // INVITE CACHE
      client.invites = new Map();
      for (const [guildId, guild] of client.guilds.cache) {
        try {
          const invites = await guild.invites.fetch();
          client.invites.set(guildId, invites);
        } catch (err) {
          console.warn(`Gagal fetch invites untuk ${guild.name}`);
        }
      }

      // INIT
      await updateStats(client, activeSettings);
      await updateMinecraftStats(client, activeSettings);

      // INIT EACH 5 MINUTES
      setInterval(async () => {
        await updateStats(client, activeSettings);
        await updateMinecraftStats(client, activeSettings);
      }, 5 * 60 * 1000); // 5 menit
    } catch (error) {
      console.error("Error during ready:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error during ready`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }

    console.log(`✅ ${client.user.tag} siap di semua server!`);
  },
};
