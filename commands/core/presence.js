const { SlashCommandBuilder, ActivityType, WebhookClient, EmbedBuilder } = require("discord.js");
require("dotenv").config();

const STATUS_OPTIONS = [
    { name: "Online", value: "online" },
    { name: "Idle", value: "idle" },
    { name: "Do Not Disturb", value: "dnd" },
    { name: "Invisible", value: "invisible" },
];

const ACTIVITY_TYPE_OPTIONS = Object.entries(ActivityType)
    .filter(([k, v]) => typeof v === "number")
    .map(([k, v]) => ({ name: k, value: k }));

module.exports = {
    data: new SlashCommandBuilder()
        .setName("presence")
        .setDescription("Ubah presence bot")
        .addStringOption((opt) =>
            opt
                .setName("status")
                .setDescription("Status bot (online, idle, dnd, invisible)")
                .setRequired(true)
                .addChoices(...STATUS_OPTIONS)
        )
        .addStringOption((opt) =>
            opt
                .setName("type")
                .setDescription("Tipe aktivitas (Playing, Streaming, Listening, Watching, Competing, Custom)")
                .setRequired(true)
                .addChoices(...ACTIVITY_TYPE_OPTIONS)
        )
        .addStringOption((opt) =>
            opt
                .setName("activity")
                .setDescription("Nama aktivitas (misal: Main di Hotel😋)")
                .setRequired(true)
        ),
    adminOnly: true,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            // Only allow owner
            if (interaction.user.id !== process.env.OWNER_ID) {
                return interaction.editReply({ content: "❌ kamuu bukan ownerkuu wlee!", ephemeral: true });
            }

            const status = interaction.options.getString("status");
            const type = interaction.options.getString("type");
            const activity = interaction.options.getString("activity");

            if (!["online", "idle", "dnd", "invisible"].includes(status)) {
                return interaction.editReply({
                    content: "❌ Status nggak valid. Gunakan: online, idle, dnd, invisible",
                    ephemeral: true,
                });
            }

            if (!ActivityType[type]) {
                return interaction.editReply({
                    content: `❌ ActivityType \`${type}\` nggak valid. Gunakan: ${Object.keys(ActivityType).join(", ")}`,
                    ephemeral: true,
                });
            }

            await interaction.client.user.setPresence({
                activities: [
                    {
                        name: activity,
                        type: ActivityType[type],
                    },
                ],
                status: status,
            });

            return interaction.editReply({
                content: `✅ Presence diubah ke: \`${type} ${activity}\` (status: ${status}) 😋`,
                ephemeral: true,
            });
        } catch (err) {
            console.error(err);
            // Optional: log error to webhook
            if (process.env.WEBHOOK_ERROR_LOGS) {
                const webhook = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
                webhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("> ❌ Error command /presence")
                            .setDescription(`\`\`\`${err.stack || err}\`\`\``)
                            .addFields(
                                { name: "User", value: `${interaction.user.tag} (${interaction.user.id})` },
                                ...(interaction.guild ? [{ name: "Guild", value: `${interaction.guild.name} (${interaction.guild.id})` }] : [])
                            )
                            .setTimestamp(),
                    ],
                }).catch(() => { });
            }
            return interaction.editReply({
                content: "❌ Gagal mengubah presence.",
                ephemeral: true,
            });
        }
    },
};