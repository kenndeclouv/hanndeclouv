const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
const BotSetting = require("../../database/models/BotSetting");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("close")
        .setDescription("Buka toko di server ini."),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: "🚫 | Perintah ini hanya bisa digunakan di server.",
                ephemeral: true,
            });
        }

        await interaction.deferReply({ ephemeral: true });

        const guildId = interaction.guild.id;

        try {
            let setting = await BotSetting.getCache({ guildId });
            if (!setting) {
                setting = await BotSetting.create({
                    guildId,
                    guildName: interaction.guild.name
                });
            }

            const channel = interaction.guild.channels.cache.get(setting.openCloseChannelId);
            const type = setting.openCloseType;

            if (!channel) {
                return interaction.editReply({
                    content: "❌ | Channel untuk close store tidak ditemukan atau belum diatur.",
                    ephemeral: true
                });
            }

            const nameFormat = setting.closeChannelNameFormat || "🔴・store-close";
            const embedData = setting.closeChannelMessageFormat?.[0];
            let embed = null;

            if (embedData?.title || embedData?.description) {
                embed = new EmbedBuilder();

                if (embedData.title) embed.setTitle(embedData.title);
                if (embedData.description) embed.setDescription(embedData.description);
                if (embedData.color) embed.setColor(embedData.color); // bisa string atau hex
                embed.setFooter(embedFooter(interaction));
                embed.setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                embed.setTimestamp();
            }


            if (type == "channelname") {
                await channel.setName(nameFormat).catch(() => null);
            } else if (type == "channelmessage") {
                await channel.send({ content: "@everyone", embeds: embed ? [embed] : [] }).catch(() => null);
            } else if (type == "channelnameandmessage") {
                await channel.setName(nameFormat).catch(() => null);
                await channel.send({ content: "@everyone", embeds: embed ? [embed] : [] }).catch(() => null);
            }

            return interaction.editReply({
                content: "✅ | Toko berhasil ditutup sesuai pengaturan.",
                ephemeral: true
            });

        } catch (error) {
            console.error("❌ Error during store close:", error);

            if (process.env.WEBHOOK_ERROR_LOGS) {
                const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

                const errorEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("> ❌ Error command /close")
                    .setDescription(`\`\`\`${error}\`\`\``)
                    .setFooter({ text: `Server: ${interaction.guild?.name || "Unknown"}` })
                    .setTimestamp();

                webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);
            }

            return interaction.editReply({
                content: "❌ | Terjadi kesalahan saat membuka toko. Silakan coba lagi.",
                ephemeral: true
            });
        }
    }
};
