const { Events, AuditLogEvent, WebhookClient } = require("discord.js");

const userActionMap = new Map(); // <guildId, { userId: { count, last } }>

const MAX_ACTIONS = 3; // misal 3 channel dihapus
const TIME_WINDOW = 5000; // dalam ms

module.exports = {
    name: Events.ChannelDelete,

    async execute(channel) {
        try {
            const guild = channel.guild;
            if (!guild || !channel.client.user) return;

            // ambil audit log yg target-nya channel yang barusan kehapus
            const audit = await guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelDelete,
                limit: 5
            });

            const entry = audit.entries.find(e => e.target?.id === channel.id && e.createdTimestamp > Date.now() - 15000);
            if (!entry || !entry.executor || entry.executor.bot) return;

            const userId = entry.executor.id;
            const now = Date.now();

            // per guild
            if (!userActionMap.has(guild.id)) userActionMap.set(guild.id, {});
            const guildData = userActionMap.get(guild.id);

            // inisialisasi
            if (!guildData[userId]) {
                guildData[userId] = { count: 1, last: now };
            } else {
                const diff = now - guildData[userId].last;
                guildData[userId].last = now;
                guildData[userId].count = diff < TIME_WINDOW ? guildData[userId].count + 1 : 1;
            }

            if (guildData[userId].count >= MAX_ACTIONS) {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (!member || !member.kickable) return;

                await member.kick("🚨 Anti-nuke: Terlalu banyak hapus channel");

                // log ke channel kalau ada
                const logChannel = channel.client.channels.cache.get(process.env.ANTINUKE_LOG_CHANNEL);
                if (logChannel?.isTextBased()) {
                    logChannel.send({
                        content: `🚨 **${member.user.tag}** telah di-**KICK** karena mencoba NUKING channel (hapus banyak dalam waktu singkat)!`,
                    });
                }

                // reset count
                guildData[userId].count = 0;
            }

        } catch (error) {
            console.error("Error invite create :", error);
            // Send DM to owner about the error
            const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

            const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error channel delete`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

            // Kirim ke webhook
            webhookClient
                .send({
                    embeds: [errorEmbed],
                })
                .catch(console.error);
            return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
        }
    }
};