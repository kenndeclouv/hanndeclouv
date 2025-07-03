const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const BotSetting = require("../../database/models/BotSetting");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testimony')
        .setDescription('Kirim testimoni pembelian produk')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('User yang membeli')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('product')
                .setDescription('Nama produk')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('payment')
                .setDescription('Metode Pembayaran')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('price')
                .setDescription('Harga produk')
                .setRequired(true)
        )
        .addAttachmentOption(option =>
            option.setName('image')
                .setDescription('Bukti/testimoni (gambar/file)')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const guildId = interaction.guild.id;
            const user = interaction.options.getUser('user');
            const product = interaction.options.getString('product');
            const payment = interaction.options.getString('payment');
            const price = interaction.options.getInteger('price');
            const attachment = interaction.options.getAttachment('image');

            const botSetting = await BotSetting.getCache({ guildId: interaction.guild.id });

            botSetting.testimonyCount += 1;
            botSetting.changed("testimonyCount");
            await botSetting.saveAndUpdateCache("guildId")
            // Buat embed testimoni
            const embed = new EmbedBuilder()
                .setColor('Blue')
                // .setTitle('📝 Testimoni Pembelian')
                .setDescription(
                    `## ORDER COMPLETE\nTerima kasih <@${user.id}> telah membeli di ${interaction.guild.name}\n\n` +
                    `👤 **User:** <@${user.id}>\n` +
                    `📦 **Product:** ${product}\n` +
                    `💳 **Payment:** ${payment}\n` +
                    `💰 **Harga:** Rp${price.toLocaleString('id-ID')}\n\n` +
                    `Jangan lupa feedbacknya di <#${botSetting.feedbackChannelId}> yaa <@${user.id}> !`
                    // + `\n⭐ **Nilai Testimoni:** ${testi}/1000`
                )
                .setTimestamp()
                // .setImage(attachment.url)
                .setFooter({ text: `Testimoni #${botSetting.testimonyCount}`, iconURL: interaction.user.displayAvatarURL() });

            if (attachment && attachment.contentType && attachment.contentType.startsWith('image/')) {
                embed.setImage(attachment.url);
            }

            // Kirim ke channel testimoni (ganti ID channel sesuai kebutuhan)
            // const testimonyChannel = interaction.client.channels.cache.get(botSetting.testimonyChannelId);
            const testimonyChannel = await interaction.client.channels.fetch(botSetting.testimonyChannelId).catch(() => null);
            const testimonyCountChannel = await interaction.client.channels.fetch(botSetting.testimonyCountChannelId).catch(() => null);

            if (!testimonyChannel) {
                return interaction.editReply({ content: '❌ Channel testimoni tidak ditemukan. Hubungi admin.' });
            }

            if (attachment && !attachment.contentType.startsWith('image/')) {
                // Jika file bukan gambar, kirim sebagai attachment
                await testimonyChannel.send({
                    content: `<@${user.id}>`,
                    embeds: [embed], files: [{
                        attachment: attachment.url,
                        name: attachment.name,
                    }]
                });
            } else {
                await testimonyChannel.send({ embeds: [embed], content: `<@${user.id}>` });
            }

            // ambil format dari database
            let format = botSetting.testimonyCountFormat || '{count} Testimonies';

            // ganti {count} pake angka real
            const newName = format.replace(/{count}/gi, botSetting.testimonyCount);

            // update nama channel kalo beda
            if (testimonyCountChannel && testimonyCountChannel.name !== newName) {
                try {
                    await testimonyCountChannel.setName(newName);
                } catch (err) {
                    console.error(`❌ Gagal update nama channel testimoni:`, err);
                }
            }


            await interaction.editReply({ content: '✅ Testimoni berhasil dikirim!' });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Terjadi kesalahan saat mengirim testimoni.' });
        }
    }
};
