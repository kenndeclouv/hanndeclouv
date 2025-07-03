const { SlashCommandBuilder, EmbedBuilder, WebhookClient, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
// const Product = require("../../database/models/Product");
// const ProductCategory = require("../../database/models/ProductCategory");
const { Product, ProductCategory } = require("../../database/models")
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("product")
        .setDescription("Kelola produk di database toko.")
        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("Membuat produk baru.")
                .addStringOption(option =>
                    option
                        .setName("name")
                        .setDescription("Nama produk")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("category")
                        .setDescription("Kategori produk")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("price")
                        .setDescription("Harga produk")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("Deskripsi produk (opsional)")
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option
                        .setName("stock")
                        .setDescription("Stok produk (opsional)")
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("edit")
                .setDescription("Edit produk yang sudah ada.")
                .addStringOption(option =>
                    option
                        .setName("old_name")
                        .setDescription("Nama produk yang ingin diedit")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName("new_name")
                        .setDescription("Nama produk baru (opsional)")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName("category")
                        .setDescription("Kategori produk")
                        .setRequired(false)
                        .setAutocomplete(true)
                )

                .addIntegerOption(option =>
                    option
                        .setName("price")
                        .setDescription("Harga baru (opsional)")
                        .setRequired(false)
                )
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("Deskripsi baru (opsional)")
                        .setRequired(false)
                )
                .addIntegerOption(option =>
                    option
                        .setName("stock")
                        .setDescription("Stok baru (opsional)")
                        .setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("delete")
                .setDescription("Hapus produk.")
                .addStringOption(option =>
                    option
                        .setName("name")
                        .setDescription("Nama produk yang ingin dihapus")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("Lihat semua produk yang tersedia.")
        ),
    aliases: ["produk", "product"],
    // .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const sub = interaction.options.getSubcommand();
        const focusedName = interaction.options.getFocused(true).name;
        const guildId = interaction.guild?.id;

        if (!guildId) return interaction.respond([]);

        if (focusedName === "category") {
            const categories = await ProductCategory.findAll({ where: { guildId } });
            return interaction.respond(
                categories
                    .filter(c => c.name.toLowerCase().includes(focused.toLowerCase()))
                    .slice(0, 25)
                    .map(c => ({ name: c.name, value: c.name }))
            );
        } else {
            const products = await Product.findAll({ where: { guildId } });
            return interaction.respond(
                products
                    .filter(p => p.name.toLowerCase().includes(focused.toLowerCase()))
                    .slice(0, 25)
                    .map(p => ({ name: p.name, value: p.name }))
            );
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
                    const price = interaction.options.getInteger("price");
                    const description = interaction.options.getString("description")?.trim() || null;
                    const stock = interaction.options.getInteger("stock");
                    const categoryName = interaction.options.getString("category");
                    let productCategoryId = null;

                    if (categoryName) {
                        const category = await ProductCategory.getCache({ guildId, name: categoryName });
                        if (!category) {
                            return interaction.editReply({ content: `❌ | Kategori **${categoryName}** tidak ditemukan.`, ephemeral: true });
                        }
                        productCategoryId = category.id;
                    }

                    // Cek apakah produk dengan nama yang sama sudah ada
                    const existing = await Product.findOne({ where: { guildId: guildId, name: name } });

                    if (existing) {
                        return interaction.editReply({
                            content: `❌ | Produk dengan nama **${name}** sudah ada.`,
                            ephemeral: true,
                        });
                    }

                    const product = await Product.create({
                        guildId,
                        name,
                        productCategoryId,
                        price,
                        description,
                        stock,
                    });

                    const embed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("✅ Produk Berhasil Dibuat")
                        .addFields(
                            { name: "Nama", value: product.name, inline: true },
                            { name: "Harga", value: product.price.toString(), inline: true },
                            { name: "Deskripsi", value: product.description || "-", inline: true },
                            { name: "Stok", value: product.stock !== null && product.stock !== undefined ? product.stock.toString() : "-", inline: true }
                        )
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                case "edit": {
                    const oldName = interaction.options.getString("old_name").trim();
                    const newName = interaction.options.getString("new_name")?.trim();
                    const newPrice = interaction.options.getInteger("price");
                    const newDescription = interaction.options.getString("description")?.trim();
                    const newStock = interaction.options.getInteger("stock");
                    const categoryName = interaction.options.getString("category");

                    const product = await Product.findOne({ where: { guildId: guildId, name: oldName } });

                    if (!product) {
                        return interaction.editReply({
                            content: `❌ | Produk dengan nama **${oldName}** tidak ditemukan.`,
                            ephemeral: true,
                        });
                    }

                    // Jika ingin ganti nama, cek apakah nama baru sudah dipakai produk lain
                    if (newName && newName !== oldName) {
                        const existing = await Product.findOne({ where: { guildId: guildId, name: newName } });
                        if (existing) {
                            return interaction.editReply({
                                content: `❌ | Produk dengan nama **${newName}** sudah ada.`,
                                ephemeral: true,
                            });
                        }
                    }

                    if (!newName && typeof newPrice === "undefined" && typeof newDescription === "undefined" && typeof newStock === "undefined") {
                        return interaction.editReply({
                            content: "❌ | Tidak ada perubahan yang diberikan.",
                            ephemeral: true,
                        });
                    }

                    if (categoryName) {
                        const category = await ProductCategory.getCache({ guildId, name: categoryName });
                        if (!category) {
                            return interaction.editReply({ content: `❌ | Kategori **${categoryName}** tidak ditemukan.`, ephemeral: true });
                        }
                        product.productCategoryId = category.id;
                    }

                    if (newName) product.name = newName;
                    if (typeof newPrice !== "undefined") product.price = newPrice;
                    if (typeof newDescription !== "undefined") product.description = newDescription;
                    if (typeof newStock !== "undefined") product.stock = newStock;

                    await product.save();

                    const embed = new EmbedBuilder()
                        .setColor("Yellow")
                        .setTitle("✏️ Produk Berhasil Diedit")
                        .addFields(
                            { name: "Nama", value: product.name, inline: true },
                            { name: "Harga", value: product.price.toString(), inline: true },
                            { name: "Deskripsi", value: product.description || "-", inline: true },
                            { name: "Stok", value: product.stock !== null && product.stock !== undefined ? product.stock.toString() : "-", inline: true }
                        )
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                case "delete": {
                    const name = interaction.options.getString("name").trim();

                    const product = await Product.findOne({ where: { guildId: guildId, name: name } });

                    if (!product) {
                        return interaction.editReply({
                            content: `❌ | Produk dengan nama **${name}** tidak ditemukan.`,
                            ephemeral: true,
                        });
                    }

                    await product.destroy();

                    const embed = new EmbedBuilder()
                        .setColor("Red")
                        .setTitle("🗑️ Produk Berhasil Dihapus")
                        .addFields(
                            { name: "Nama", value: name, inline: true }
                        )
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                default: {
                    const products = await Product.findAll({
                        where: { guildId },
                        include: [{ model: ProductCategory, as: "category" }],
                    });

                    if (!products.length) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Grey")
                                    .setTitle("📦 Daftar Produk Kosong")
                                    .setDescription("Belum ada produk yang dibuat di toko ini.\n\nGunakan `/product create` untuk menambah produk baru!")
                                    .setThumbnail("https://cdn-icons-png.flaticon.com/512/4072/4072301.png")
                                    .setFooter(embedFooter(interaction))
                            ],
                            ephemeral: true
                        });
                    }

                    const categories = await ProductCategory.findAll({ where: { guildId } });

                    const options = categories.map(c => ({
                        label: c.name,
                        value: c.id.toString(),
                        description: c.description?.slice(0, 50) || "Tanpa deskripsi"
                    }));

                    if (!options.length) {
                        return interaction.editReply({
                            content: "❌ | Belum ada kategori dibuat. Buat dulu lewat `/category create`.",
                            ephemeral: true
                        });
                    }

                    const select = new StringSelectMenuBuilder()
                        .setCustomId("select_category")
                        .setPlaceholder("Pilih kategori untuk melihat produk")
                        .addOptions(options);

                    const row = new ActionRowBuilder().addComponents(select);

                    const introEmbed = new EmbedBuilder()
                        .setColor("Blue")
                        // .setTitle("🛒 Daftar Produk ")
                        .setDescription("## 🛒 Daftar Produk Kami\nSilakan pilih kategori dari dropdown di bawah ini untuk melihat produk yang kami sediakan di masing-masing kategori.")
                        .setThumbnail("https://cdn-icons-png.flaticon.com/512/3081/3081559.png")
                        .setFooter(embedFooter(interaction));

                    const msg = await interaction.editReply({
                        embeds: [introEmbed],
                        components: [row],
                        ephemeral: true
                    });

                    const collector = msg.createMessageComponentCollector({
                        time: 120000,
                        filter: (i) => i.user.id === interaction.user.id,
                    });

                    collector.on("collect", async (i) => {
                        const selectedId = i.values[0];
                        const selectedCategory = categories.find(c => c.id.toString() === selectedId);
                        const filtered = products.filter(p => p.productCategoryId?.toString() === selectedId);

                        if (!filtered.length) {
                            return i.update({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor("Grey")
                                        // .setTitle(`📦 ${selectedCategory.name}`)
                                        .setDescription(`## 📦 ${selectedCategory.name}\nKategori ini belum memiliki produk apa pun.`)
                                ],
                                components: [row]
                            });
                        }

                        let desc = `## 📦 ${selectedCategory.name}\n`;
                        filtered.forEach((p, i) => {
                            const no = String(i + 1).padStart(2, "0");
                            const price = `💵 Rp ${p.price.toLocaleString("id-ID")}`;
                            const stock = p.stock !== null && p.stock !== undefined ? `📦 Stock: ${p.stock}` : "📦 Stock: -";
                            const description = p.description?.trim() || "_(tanpa deskripsi)_";
                            desc += `### \n**\`${no}.\` ${p.name}**\n> ${price}\n> \`\`\`${description}\`\`\`<:black_continue_arrow_right:1387738128898457733> ${stock}\n`;
                        });

                        const embed = new EmbedBuilder()
                            .setColor("Green")
                            .setDescription(desc)
                            .setFooter(embedFooter(interaction))
                            .setTimestamp();


                        await i.update({ embeds: [embed], components: [row] });
                    });

                    collector.on("end", () => {
                        if (msg.editable) {
                            const disabledRow = new ActionRowBuilder().addComponents(select.setDisabled(true));
                            msg.edit({ components: [disabledRow] }).catch(() => { });
                        }
                    });
                    break;
                }
            }
        } catch (error) {
            console.error("Error during product command execution:", error);
            // Kirim error ke webhook jika ada
            if (process.env.WEBHOOK_ERROR_LOGS) {
                const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
                const errorEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("> ❌ Error command /product")
                    .setDescription(`\`\`\`${error}\`\`\``)
                    .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
                    .setTimestamp();

                webhookClient
                    .send({ embeds: [errorEmbed] })
                    .catch(console.error);
            }

            return interaction.editReply({
                content: "❌ | Terjadi kesalahan saat menjalankan perintah produk. Silakan coba lagi.",
                ephemeral: true,
            });
        }
    },
};