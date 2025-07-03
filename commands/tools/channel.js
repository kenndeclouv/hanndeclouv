const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, WebhookClient } = require("discord.js");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("delete-category-channels")
        .setDescription("Menghapus semua channel di dalam kategori tertentu, dan opsional menghapus kategorinya juga.")
        .addChannelOption(option =>
            option
                .setName("category")
                .setDescription("Pilih kategori yang ingin dihapus semua channelnya")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName("delete_category")
                .setDescription("Hapus juga kategori setelah semua channel dihapus? (default: tidak)")
                .setRequired(false)
        ),
        // .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: "🚫 | Perintah ini hanya bisa digunakan di server.",
                ephemeral: true,
            });
        }
        await interaction.deferReply({ ephemeral: true });
        try {
            const category = interaction.options.getChannel("category");
            const deleteCategory = interaction.options.getBoolean("delete_category") ?? false;

            if (!category || category.type !== ChannelType.GuildCategory) {
                return interaction.editReply({
                    content: "❌ | Kategori tidak valid.",
                    ephemeral: true,
                });
            }

            // Ambil semua channel di kategori
            const channelsInCategory = interaction.guild.channels.cache.filter(
                ch => ch.parentId === category.id
            );

            let deleted = 0;
            for (const channel of channelsInCategory.values()) {
                await channel.delete(`Dihapus oleh ${interaction.user.tag} via /delete-category-channels`);
                deleted++;
            }

            let categoryDeleted = false;
            let replyMsg = `✅ Berhasil menghapus **${deleted}** channel dari kategori **${category.name}**.`;

            if (deleteCategory) {
                await category.delete(`Kategori dihapus oleh ${interaction.user.tag} via /delete-category-channels`);
                categoryDeleted = true;
                replyMsg += `\n✅ Kategori **${category.name}** juga telah dihapus.`;
            }

            if (deleted === 0 && !categoryDeleted) {
                // Tidak ada channel, dan kategori tidak dihapus
                return interaction.editReply({
                    content: `Tidak ada channel di kategori **${category.name}**.`,
                    ephemeral: true,
                });
            }

            await interaction.editReply({
                content: replyMsg,
                ephemeral: true,
            });
        } catch (error) {
            console.error("Error during delete-category-channels command execution:", error);
            // Kirim error ke webhook jika ada
            const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle("> ❌ Error command /delete-category-channels")
                .setDescription(`\`\`\`${error}\`\`\``)
                .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
                .setTimestamp();

            webhookClient
                .send({ embeds: [errorEmbed] })
                .catch(console.error);

            return interaction.editReply({
                content: "❌ | Terjadi kesalahan saat menghapus channel/kategori. Silakan coba lagi.",
                ephemeral: true,
            });
        }
    },
};
