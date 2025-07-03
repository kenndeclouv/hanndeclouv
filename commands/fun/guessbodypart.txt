const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guessbodypart')
        .setDescription('Tebak gambar NSFW yang diblur 😋🥵'),

    async execute(interaction) {
        await interaction.deferReply();
        // Cek channel NSFW
        const channel = interaction.channel;
        const isDM = !channel || channel.type === ChannelType.DM;
        if (!isDM && !channel.nsfw) {
            return interaction.editReply({
                content: "Command ini hanya bisa dipakai di channel NSFW 😭",
                ephemeral: true,
            });
        }

        // Kategori yang valid
        const categories = ['ass', 'pussy', 'boobs', 'thigh', 'anal', 'neko'];
        const selectedCategory = categories[Math.floor(Math.random() * categories.length)];

        // Ambil gambar dari API
        const fetchContent = async () => {
            const url = `https://nekobot.xyz/api/image?type=${selectedCategory}`;
            const res = await axios.get(url);
            const data = res.data;

            if (!data || !data.message) throw new Error("Gagal ambil data 😭");
            return data.message;
        };

        let imageUrl;
        try {
            imageUrl = await fetchContent();
        } catch (err) {
            return interaction.editReply({ content: 'Gagal ngambil gambar nihh 😭', ephemeral: true });
        }

        const answer = selectedCategory.toLowerCase();
        const duration = 60; // detik
        const endTime = Math.floor((Date.now() + duration * 1000) / 1000);

        const embed = new EmbedBuilder()
            .setTitle('> 🔞 Tebak Body Part Yuk!')
            .setDescription('Ketik jawabanmu di chat yaa 😋\nKamu punya waktu 1 menit!')
            .setImage(imageUrl)
            .setColor('Red')
            .addFields({ name: 'Time Left', value: `<t:${endTime}:R>`, inline: true })
            .setFooter({ text: 'Tebakanmu langsung ketik di chat yaa 😋' })
            .setTimestamp();

        const gameMessage = await interaction.editReply({ embeds: [embed], fetchReply: true });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: duration * 1000 });

        let lastUserMessage;
        let lastBotReply;

        collector.on('collect', async m => {
            const guess = m.content.toLowerCase();

            // Hapus pesan sebelumnya
            if (lastUserMessage) {
                try { await lastUserMessage.delete(); } catch { }
            }
            if (lastBotReply) {
                try { await lastBotReply.delete(); } catch { }
            }

            lastUserMessage = m;

            if (
                (answer === 'ass' && guess.match(/\b(pantat|ass|bokong|butt)\b/)) ||
                (answer === 'pussy' && guess.match(/\b(memek|pussy|vagina|pepek|kucing)\b/)) ||
                (answer === 'boobs' && guess.match(/\b(susu|boobs|payudara|tetek|dada|breast)\b/)) ||
                (answer === 'thigh' && guess.match(/\b(paha|thigh)\b/)) ||
                (answer === 'anal' && guess.match(/\b(anal|anus)\b/)) ||
                (answer === 'neko' && guess.match(/\b(kucing|neko)\b/))
            ) {
                collector.stop('guessed');

                const winEmbed = new EmbedBuilder()
                    .setTitle('> 🎉 Bener Bangett 😋🔥')
                    .setDescription(`Itu adalah **${answer.toUpperCase()}** yakk 😋🔥`)
                    .setImage(imageUrl)
                    .setColor('Green')
                    .setTimestamp();

                return gameMessage.edit({ embeds: [winEmbed] });
            } else {
                lastBotReply = await interaction.channel.send('😋 Salah nihh, coba lagii yakk!');
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'guessed') {
                const loseEmbed = new EmbedBuilder()
                    .setTitle('> ⏰ Waktu Habis 😭')
                    .setDescription(`Yahh waktunya udah habis yaa 😋\nJawabannya itu **${answer.toUpperCase()}** yakk!`)
                    .setImage(imageUrl)
                    .setColor('Red')
                    .setTimestamp();

                try { await gameMessage.edit({ embeds: [loseEmbed] }); } catch { }
            }
        });
    },
};