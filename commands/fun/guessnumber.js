const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('../../helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guessnumber')
        .setDescription('Tebak angka yang dipikirin bot 😋')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Pilih tingkat kesulitan')
                .setRequired(true)
                .addChoices(
                    { name: 'Easy (1 - 50)', value: 'easy' },
                    { name: 'Medium (1 - 100)', value: 'medium' },
                    { name: 'Hard (1 - 500)', value: 'hard' },
                )
        ),

    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        let maxNumber = 100;

        if (mode === 'easy') maxNumber = 50;
        if (mode === 'medium') maxNumber = 100;
        if (mode === 'hard') maxNumber = 500;

        const number = Math.floor(Math.random() * maxNumber) + 1;
        let attempts = 0;

        const duration = 60; // detik
        const endTime = Math.floor((Date.now() + duration * 1000) / 1000);

        const embed = new EmbedBuilder()
            .setTitle('> 🎯 Tebak Angka yokk!')
            .setDescription(`Aku lagi mikirin angka antara **1 - ${maxNumber}** nihh 😋\nKetik angkanya di chat yaa!\n\n-# Ketik angkamu langsung di chat yakk! 😋`)
            .addFields(
                { name: 'Mode', value: `${mode.toUpperCase()}`, inline: true },
                { name: 'Time Left', value: `<t:${endTime}:R>`, inline: true }
            )
            .setColor('Blue')
            .setFooter(embedFooter(interaction))
            .setTimestamp();

        const gameMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        const filter = m => m.author.id === interaction.user.id && !isNaN(m.content);
        const collector = interaction.channel.createMessageCollector({ filter, time: duration * 1000 });

        let lastUserMessage;
        let lastBotReply;

        collector.on('collect', async m => {
            const guess = parseInt(m.content);
            attempts++;

            // Hapus chat sebelumnya kalau udah ada
            if (lastUserMessage) {
                try { await lastUserMessage.delete(); } catch { }
            }
            if (lastBotReply) {
                try { await lastBotReply.delete(); } catch { }
            }

            lastUserMessage = m;

            if (guess === number) {
                collector.stop('guessed');

                const winEmbed = new EmbedBuilder()
                    .setTitle('> 🎉 Kamu Menang!')
                    .setDescription(`🎯 Angkanya adalah **${number}** 😋\nKamu butuh **${attempts}x** tebakan buat nemuin angka ini!`)
                    .setColor('Green')
                    .setTimestamp();

                return gameMessage.edit({ embeds: [winEmbed] });
            }

            const distance = Math.abs(guess - number);
            let feedback = '';

            if (distance <= 5) {
                feedback = guess < number
                    ? '📈🔥 Hampir bener nihh! Kurang besar dikit lagii 😋'
                    : '📉🔥 Hampir bener nihh! Kurang kecil dikit lagii 😋';
            } else {
                feedback = guess < number
                    ? '📈 Terlalu kecil nihh, coba lagi yakk 😋'
                    : '📉 Terlalu besar nihh, coba lagi yakk 😋';
            }

            // Kirim feedback baru
            lastBotReply = await interaction.channel.send(feedback);
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'guessed') {
                const loseEmbed = new EmbedBuilder()
                    .setTitle('> ⏰ Waktu Habis 😭')
                    .setDescription(`Yahh waktunya udah habis yaa 😋\nJawabannya adalah **${number}**`)
                    .setColor('Red')
                    .setTimestamp();

                try { await gameMessage.edit({ embeds: [loseEmbed] }); } catch { }
            }
        });
    },
};