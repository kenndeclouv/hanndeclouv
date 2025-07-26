const Pterodactyl = require("../database/models/Pterodactyl");
const { generateNodeEmbed } = require("../helpers");

module.exports = async (client) => {
    setInterval(async () => {
        const records = await Pterodactyl.findAll();

        for (const record of records) {
            const { link, apiKey, messageIds } = record;
            if (!link || !apiKey || !messageIds?.length) continue;

            const embed = await generateNodeEmbed(record, client.user);

            for (const { channelId, messageId } of messageIds) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    const message = await channel.messages.fetch(messageId);
                    await message.edit({ embeds: [embed] });
                } catch (e) {
                    console.log(`[PteroUpdater] gagal update message ${messageId} di ${channelId}: ${e.message}`);
                }
            }
        }
    }, 60_000);
};