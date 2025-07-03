const { Events, AuditLogEvent, WebhookClient } = require("discord.js");

const userCreateMap = new Map(); // <guildId, { userId: { count, last } }>

const MAX_CREATES = 3;
const TIME_WINDOW = 5000; // 5 detik

module.exports = {
    name: Events.ChannelCreate,

    async execute(channel) {
        try {
            const guild = channel.guild;
            if (!guild || !channel.client.user) return;

            const audit = await guild.fetchAuditLogs({
                type: AuditLogEvent.ChannelCreate,
                limit: 5,
            });

            const entry = audit.entries.find(e => e.target?.id === channel.id && e.createdTimestamp > Date.now() - 15000);
            if (!entry || !entry.executor || entry.executor.bot) return;

            const userId = entry.executor.id;
            const now = Date.now();

            if (!userCreateMap.has(guild.id)) userCreateMap.set(guild.id, {});
            const guildData = userCreateMap.get(guild.id);

            if (!guildData[userId]) {
                guildData[userId] = { count: 1, last: now };
            } else {
                const diff = now - guildData[userId].last;
                guildData[userId].last = now;
                guildData[userId].count = diff < TIME_WINDOW ? guildData[userId].count + 1 : 1;
            }

            if (guildData[userId].count >= MAX_CREATES) {
                const member = await guild.members.fetch(userId).catch(() => null);
                if (!member || !member.kickable) return;

                await member.kick("🚨 Anti-nuke: Spam membuat channel");

                const logChannel = channel.client.channels.cache.get(process.env.ANTINUKE_LOG_CHANNEL);
                if (logChannel?.isTextBased()) {
                    logChannel.send(`🚨 **${member.user.tag}** telah di-**KICK** karena mencoba NUKING dengan spam membuat channel!`);
                }

                guildData[userId].count = 0;
            }
        } catch (error) {
            console.error("Error invite create :", error);
            // Send DM to owner about the error
            const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

            const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error invite create`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

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
