const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const StickyMessage = require("../../database/models/StickyMessage");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sticky")
        .setDescription("atur sticky message")
        .addSubcommand(sub =>
            sub.setName("set")
                .setDescription("set pesan sticky")
                .addStringOption(opt => opt.setName("pesan").setDescription("pesan stickynyaa").setRequired(true)))
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("hapus sticky message")),

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: "🚫 | This command can't use here😭",
                ephemeral: true,
            });
        }
        const sub = interaction.options.getSubcommand();
        const channelId = interaction.channel.id;

        switch (sub) {
            case "set": {
                const pesan = interaction.options.getString("pesan");

                // Cek apakah sudah ada sticky message di channel ini
                const existingSticky = await StickyMessage.getCache({ channelId });
                if (existingSticky) {
                    return interaction.reply({ content: "❌ Sticky message sudah ada di channel ini! Hapus dulu sebelum membuat yang baru.", ephemeral: true });
                }

                // Kirim embed sticky pertama kali
                const stickyEmbed = new EmbedBuilder()
                    .setTitle("> 📌 Sticky Message")
                    .setDescription(pesan)
                    .setColor("Yellow")
                    .setFooter(embedFooter(interaction));

                const message = await interaction.channel.send({ embeds: [stickyEmbed] });

                await StickyMessage.upsert({
                    channelId,
                    message: pesan,
                    messageId: message.id, // simpan juga message id
                });

                return interaction.reply({ content: "✅ Sticky message diatur yaa 😋", ephemeral: true });
            }

            case "remove": {
                const sticky = await StickyMessage.getCache({ channelId: channelId });
                if (sticky && sticky.messageId) {
                    try {
                        const oldMsg = await interaction.channel.messages.fetch(sticky.messageId).catch(() => null);
                        if (oldMsg) await oldMsg.delete().catch(() => { });
                    } catch (err) {
                        // ignore error
                    }
                }
                sticky.destroy();
                StickyMessage.clearCache({ channelId: channelId });
                // StickyMessage.saveAndUpdateCache("channelId");
                return interaction.reply({ content: "✅ Sticky message dihapus yaa 😋", ephemeral: true });
            }

        }
    }
};
