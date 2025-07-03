const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const BotSetting = require("../../database/models/BotSetting");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Kirim feedback pembelian produk')
        .addStringOption(option =>
            option.setName('product')
                .setDescription('Nama produk')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('rate')
                .setDescription('Rating 1-10')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('note')
                .setDescription('Catatan/feedback')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Screenshot')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guildId = interaction.guild.id;
            const buyerId = interaction.user.id;
            const product = interaction.options.getString('product');
            const rate = interaction.options.getInteger('rate');
            const note = interaction.options.getString('note');
            const attachment = interaction.options.getAttachment('image');

            const botSetting = await BotSetting.getCache({ guildId: guildId });

            // Buat embed feedback
            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setDescription(
                    `## 💰 Buyer Feedback\n` +
                    `Thanks for the feedback <@${buyerId}> 🎉\n\n` +
                    `➡️ **Product:** ${product}\n` +
                    `➡️ **Buyer:** <@${buyerId}>\n` +
                    `➡️ **Rate:** ${'⭐'.repeat(Math.max(1, Math.min(rate, 10)))}\n` +
                    `➡️ **Note:** \`\`\`${note}\`\`\`\n\n` +
                    `-# Thanks For Your Feedback at ${interaction.guild.name}!`
                )
                .setTimestamp()
                .setFooter({ text: `Feedback by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });

            // Tambahkan gambar jika ada dan bertipe image
            if (attachment && attachment.contentType && attachment.contentType.startsWith('image/')) {
                embed.setImage(attachment.url);
            }

            // Kirim ke channel feedback
            const feedbackChannel = await interaction.client.channels.fetch(botSetting.feedbackChannelId).catch(() => null);

            if (!feedbackChannel) {
                return interaction.editReply({ content: '❌ Channel feedback tidak ditemukan. Hubungi admin.' });
            }

            // Jika file bukan gambar, kirim sebagai attachment
            if (attachment && attachment.contentType && !attachment.contentType.startsWith('image/')) {
                const message = await feedbackChannel.send({
                    embeds: [embed],
                    content: `<@${buyerId}>`,
                    files: [{
                        attachment: attachment.url,
                        name: attachment.name,
                    }]
                });
                await message.react('🎉');
            } else {
                const message = await feedbackChannel.send({ embeds: [embed], content: `<@${buyerId}>` });
                await message.react('🎉');
            }

            await interaction.editReply({ content: '✅ Feedback berhasil dikirim!' });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Terjadi kesalahan saat mengirim feedback.' });
        }
    }
};
