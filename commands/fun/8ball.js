const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('🔮 Tanyakan sesuatu ke bola ajaib')
        .addStringOption(option => option.setName('pertanyaan').setDescription('Apa yang mau kamu tanyakan?').setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('pertanyaan');

        const answers = [
            '✨ Iya, percaya aja 😋',
            '🫶 Mungkin iya, siapa tauu 🥺',
            '😭 Tidak, sabar yaa...',
            '😙 Mungkin tidak, coba lagi besok!',
            '🥺 Aku juga ngga tauu, coba tanya hatimu 😋',
            '🥵 Sudah pasti iya, gas poll!',
            '😋 Sudah pasti tidak, udah nasib yaa 😭',
            '🔮 Rahasia dong, ngga bisa aku kasih tau 😋',
            '🤔 Hmmm, tanya lagi nanti yaa...'
        ];

        const answer = answers[Math.floor(Math.random() * answers.length)];

        const thinkingEmbed = new EmbedBuilder()
            .setTitle('> 🔮 Magic 8 Ball lagi mikir...')
            .setDescription('Bentar yaa aku ramalin duluu 😋🔮')
            .setColor('Blue')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: 'kenndeclouv 8ball engine' })
            .setTimestamp();

        await interaction.reply({ embeds: [thinkingEmbed] });

        setTimeout(async () => {
            const resultEmbed = new EmbedBuilder()
                .setTitle('> 🔮 Magic 8 Ball Result')
                .setColor('Random')
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                // .setDescription(`## 🔮 Magic 8 Ball Result\n### **❓ Pertanyaan:**\n${question}\n\n### **🎯 Jawaban:**\n${answer}`)
                .setDescription(`### **❓ Pertanyaan:**\n${question}\n\n### **🎯 Jawaban:**\n${answer}`)
                .setFooter({ text: 'semoga jawaban ini memuaskan yaa 😋' })
                .setTimestamp();

            await interaction.editReply({ embeds: [resultEmbed] });
        }, 2000);
    },
};
