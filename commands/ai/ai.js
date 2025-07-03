const { SlashCommandBuilder, WebhookClient } = require("discord.js");
const BotSetting = require("../../database/models/BotSetting");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ai")
        .setDescription("Aktifkan atau matikan mode AI di channel ini")
        .addStringOption(option =>
            option
                .setName("mode")
                .setDescription("Pilih untuk mengaktifkan atau menonaktifkan AI di channel ini")
                .setRequired(true)
                .addChoices(
                    { name: "Aktifkan", value: "active" },
                    { name: "Nonaktifkan", value: "disable" }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            if (!interaction.guild || !interaction.channel) {
                return interaction.editReply({ content: "❌ | Perintah ini hanya dapat digunakan di dalam server dan channel.", ephemeral: true });
            }

            const channelId = interaction.channel.id;
            // Get the BotSetting row for this guild
            const botSetting = await BotSetting.getCache({ guildId: interaction.guild.id });

            if (!botSetting) {
                return interaction.editReply({ content: "❌ | Pengaturan bot untuk server ini belum ditemukan.", ephemeral: true });
            }

            let aiChannelIds = Array.isArray(botSetting.aiChannelIds) ? [...botSetting.aiChannelIds] : [];

            const mode = interaction.options.getString("mode");

            if (mode === "active") {
                if (aiChannelIds.includes(channelId)) {
                    return interaction.editReply({ content: "🤖 AI sudah aktif di channel ini!", ephemeral: true });
                }

                aiChannelIds.push(channelId);
                botSetting.aiChannelIds = aiChannelIds;
                botSetting.changed("aiChannelIds", true);
                await botSetting.saveAndUpdateCache("guildId");
                return interaction.editReply({ content: "✅ AI mode **AKTIF** di channel ini.", ephemeral: true });
            }

            if (mode === "disable") {
                const index = aiChannelIds.indexOf(channelId);
                if (index === -1) {
                    return interaction.editReply({ content: "❌ AI belum aktif di channel ini.", ephemeral: true });
                }

                aiChannelIds.splice(index, 1);
                botSetting.aiChannelIds = aiChannelIds;
                botSetting.changed("aiChannelIds", true);
                await botSetting.saveAndUpdateCache("guildId");
                return interaction.editReply({ content: "🛑 AI mode **DINONAKTIFKAN** di channel ini.", ephemeral: true });
            }

            // Fallback for unknown mode
            return interaction.editReply({ content: "❌ Mode tidak dikenali.", ephemeral: true });
        } catch (error) {
            console.error("Error during invite command execution:", error);
            // Send DM to owner about the error
            const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

            const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /ai`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

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
