require("dotenv").config();
const { WebhookClient, ActivityType, EmbedBuilder } = require("discord.js");
const BotSetting = require("../database/models/BotSetting");
const { updateStats, updateMinecraftStats } = require("../helpers");
const pteroUpdater = require("../tasks/pteroUpdater");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`✅ bot siap sebagai ${client.user.tag}`);

    // set presence
    client.user.setPresence({
      activities: [
        {
          name: process.env.DISCORD_BOT_ACTIVITY,
          type: ActivityType[process.env.DISCORD_BOT_ACTIVITY_TYPE], // misal: Playing
        },
      ],
      status: process.env.DISCORD_BOT_STATUS || "online",
    });

    const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

    try {
      const runStatsUpdate = async () => {
        const allSettings = await BotSetting.getAllCache();

        const activeSettings = allSettings.filter(
          (s) =>
            client.guilds.cache.has(s.guildId) &&
            (s.serverStatsOn || s.minecraftStatsOn)
        );

        // fetch member (penting buat ngitung presence/online)
        await Promise.all(
          activeSettings.map((s) =>
            client.guilds.cache.get(s.guildId)?.members.fetch().catch(() => null)
          )
        );

        await updateStats(client, activeSettings);
        await updateMinecraftStats(client, activeSettings);
      };

      // init pertama
      await runStatsUpdate();

      // update setiap 5 menit
      setInterval(async () => {
        try {
          await runStatsUpdate();
        } catch (err) {
          console.error("[INTERVAL STATS ERROR]", err);
        }
      }, 5 * 60 * 1000); // 5 menit
    } catch (error) {
      console.error("❌ Error during ready:", error);

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> ❌ Error during ready event")
        .setDescription(`\`\`\`${error?.stack || error}\`\`\``)
        .setFooter({ text: `${client.user.tag}` })
        .setTimestamp();

      webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);
    }
    // PTERODACTYL
    // await pteroUpdater(client);
    console.log(`✅ ${client.user.tag} siap di semua server!`);
  },
};