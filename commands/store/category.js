const { SlashCommandBuilder, EmbedBuilder, WebhookClient, PermissionFlagsBits } = require("discord.js");
const ProductCategory = require("../../database/models/ProductCategory");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("category")
        .setDescription("Kelola kategori produk di database toko.")
        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("Membuat kategori produk baru.")
                .addStringOption(option =>
                    option
                        .setName("name")
                        .setDescription("Nama kategori produk")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("Deskripsi kategori (opsional)")
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("edit")
                .setDescription("Edit kategori produk yang sudah ada.")
                .addStringOption(option =>
                    option
                        .setName("old_name")
                        .setDescription("Nama kategori yang ingin diedit")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName("new_name")
                        .setDescription("Nama kategori baru (opsional)")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("Deskripsi baru (opsional)")
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("delete")
                .setDescription("Hapus kategori produk.")
                .addStringOption(option =>
                    option
                        .setName("name")
                        .setDescription("Nama kategori yang ingin dihapus")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("Lihat semua kategori produk yang tersedia.")
        ),
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild?.id;
        if (!guildId) return interaction.respond([]);

        try {
            const categories = await ProductCategory.findAll({ guildId: guildId });

            const filtered = categories
                .filter(c => c.name.toLowerCase().includes(focusedValue.toLowerCase()))
                .slice(0, 25) // max 25 hasil
                .map(c => ({ name: c.name, value: c.name }));

            return interaction.respond(filtered);
        } catch (err) {
            console.error("❌ Autocomplete error:", err);
            return interaction.respond([]);
        }
    },

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: "🚫 | Perintah ini hanya bisa digunakan di server.",
                ephemeral: true,
            });
        }
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case "create": {
                    const name = interaction.options.getString("name").trim();
                    const description = interaction.options.getString("description")?.trim() || null;

                    // Cek apakah kategori dengan nama yang sama sudah ada
                    const existing = await ProductCategory.getCache({ guildId: guildId, name: name });

                    if (existing) {
                        return interaction.editReply({
                            content: `❌ | Kategori dengan nama **${name}** sudah ada.`,
                            ephemeral: true,
                        });
                    }

                    const category = await ProductCategory.create({
                        guildId,
                        name,
                        description,
                    });

                    const embed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("✅ Kategori Berhasil Dibuat")
                        .addFields(
                            { name: "Nama", value: category.name, inline: true },
                            { name: "Deskripsi", value: category.description || "-", inline: true }
                        )
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                case "edit": {
                    const oldName = interaction.options.getString("old_name").trim();
                    const newName = interaction.options.getString("new_name")?.trim();
                    const newDescription = interaction.options.getString("description")?.trim();

                    const category = await ProductCategory.getCache({ guildId: guildId, name: oldName });

                    if (!category) {
                        return interaction.editReply({
                            content: `❌ | Kategori dengan nama **${oldName}** tidak ditemukan.`,
                            ephemeral: true,
                        });
                    }

                    // Jika ingin ganti nama, cek apakah nama baru sudah dipakai kategori lain
                    if (newName && newName !== oldName) {
                        const existing = await ProductCategory.getCache({ guildId: guildId, name: newName });
                        if (existing) {
                            return interaction.editReply({
                                content: `❌ | Kategori dengan nama **${newName}** sudah ada.`,
                                ephemeral: true,
                            });
                        }
                    }

                    if (!newName && !newDescription) {
                        return interaction.editReply({
                            content: "❌ | Tidak ada perubahan yang diberikan.",
                            ephemeral: true,
                        });
                    }

                    if (newName) category.name = newName;
                    if (typeof newDescription !== "undefined") category.description = newDescription;

                    await category.save();

                    const embed = new EmbedBuilder()
                        .setColor("Yellow")
                        .setTitle("✏️ Kategori Berhasil Diedit")
                        .addFields(
                            { name: "Nama", value: category.name, inline: true },
                            { name: "Deskripsi", value: category.description || "-", inline: true }
                        )
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                case "delete": {
                    const name = interaction.options.getString("name").trim();

                    const category = await ProductCategory.getCache({ guildId: guildId, name: name });

                    if (!category) {
                        return interaction.editReply({
                            content: `❌ | Kategori dengan nama **${name}** tidak ditemukan.`,
                            ephemeral: true,
                        });
                    }

                    await category.destroy();

                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("🗑️ Kategori Berhasil Dihapus")
                        .addFields(
                            { name: "Nama", value: name, inline: true }
                        )
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                case "list": {
                    const categories = await ProductCategory.findAll({ where: { guildId } });

                    if (!categories.length) {
                        return interaction.editReply("📦 | Belum ada kategori yang dibuat.");
                    }

                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle("📦 Daftar Kategori Produk")
                        .setDescription(
                            categories.map(c => `• **${c.name}**\n> ${c.description || "_(tanpa deskripsi)_"}`).join("\n\n")
                        )
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], ephemeral: true });
                }

            }
        } catch (error) {
            console.error("Error during category command execution:", error);
            // Kirim error ke webhook jika ada
            if (process.env.WEBHOOK_ERROR_LOGS) {
                const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
                const errorEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("> ❌ Error command /category")
                    .setDescription(`\`\`\`${error}\`\`\``)
                    .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
                    .setTimestamp();

                webhookClient
                    .send({ embeds: [errorEmbed] })
                    .catch(console.error);
            }

            return interaction.editReply({
                content: "❌ | Terjadi kesalahan saat menjalankan perintah kategori. Silakan coba lagi.",
                ephemeral: true,
            });
        }
    },
};
