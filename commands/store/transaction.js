const { SlashCommandBuilder, EmbedBuilder, WebhookClient } = require("discord.js");
const { Product, ProductCategory } = require("../../database/models");
const Transaction = require("../../database/models/Transaction");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("transaction")
        .setDescription("Kelola transaksi pembelian produk di toko.")
        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("Buat transaksi pembelian produk.")
                .addStringOption(option =>
                    option
                        .setName("product")
                        .setDescription("Nama produk yang ingin dibeli")
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("deskripsi produk")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("quantity")
                        .setDescription("Jumlah produk yang ingin dibeli")
                        .setRequired(true)
                )
                .addUserOption(option =>
                    option
                        .setName("buyer")
                        .setDescription("Pembeli (user Discord)")
                        .setRequired(true)
                )
                .addAttachmentOption(option =>
                    option
                        .setName("image")
                        .setDescription("gambar (opsional)")
                        .setRequired(false)
                )
        ),
    // .addSubcommand(sub =>
    //     sub
    //         .setName("list")
    //         .setDescription("Lihat semua transaksi yang tercatat.")
    // ),
    aliases: ["trx", "transaksi"],

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const focusedName = interaction.options.getFocused(true).name;
        const guildId = interaction.guild?.id;

        if (!guildId) return interaction.respond([]);

        if (focusedName === "product") {
            // Ambil produk beserta kategori
            const products = await Product.findAll({ where: { guildId }, include: [{ model: Category, as: "category" }] });
            return interaction.respond(
                products
                    .filter(p => p.name.toLowerCase().includes(focused.toLowerCase()))
                    .slice(0, 25)
                    .map(p => ({
                        name: p.category && p.category.name
                            ? `${p.name} - ${p.category.name}`
                            : p.name,
                        value: p.name
                    }))
            );
        }
        return interaction.respond([]);
    },

    async execute(interaction) {
        if (!interaction.guild) {
            return interaction.reply({
                content: "🚫 | Perintah ini hanya bisa digunakan di server.",
                ephemeral: true,
            });
        }
        await interaction.deferReply();

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        try {
            switch (subcommand) {
                case "create": {
                    const productName = interaction.options.getString("product").trim();
                    const quantity = interaction.options.getInteger("quantity");
                    const buyer = interaction.options.getUser("buyer");
                    const description = interaction.options.getString("description");
                    const image = interaction.options.getAttachment("image");

                    if (quantity < 1) {
                        return interaction.editReply({
                            content: "❌ | Jumlah pembelian minimal 1.",
                            ephemeral: true,
                        });
                    }

                    const product = await Product.findOne({ where: { guildId, name: productName } });

                    if (!product) {
                        return interaction.editReply({
                            content: `❌ | Produk dengan nama **${productName}** tidak ditemukan.`,
                            ephemeral: true,
                        });
                    }

                    if (typeof product.stock === "number" && product.stock !== null && product.stock < quantity) {
                        return interaction.editReply({
                            content: `❌ | Stok produk **${product.name}** tidak mencukupi. Sisa stok: ${product.stock}`,
                            ephemeral: true,
                        });
                    }

                    // Kurangi stock jika ada
                    if (typeof product.stock === "number" && product.stock !== null) {
                        product.stock -= quantity;
                        await product.save();
                    }

                    // Buat transaksi
                    const trx = await Transaction.create({
                        guildId,
                        description,
                        userId: buyer.id,
                        productId: product.id,
                        quantity,
                        total: product.price * quantity,
                        status: "success"
                    });

                    // let des = description
                    const embed = new EmbedBuilder()
                        .setColor("Green")
                        // .setTitle("> 🎉 Transaksi Berhasil!")
                        .setThumbnail(image ? image.url : (product.image || null))
                        .setDescription([
                            `## 🎉 Transaksi Berhasil!`,
                            "",
                            description ? `\`\`\`${description}\`\`\`` : "",
                            `> **🛒 Produk:** \`${product.name}\``,
                            `> **🔢 Jumlah:** \`${quantity}\``,
                            `> **💸 Harga Satuan:** \`Rp ${product.price.toLocaleString("id-ID")}\``,
                            `> **💰 Total:** \`Rp ${(product.price * quantity).toLocaleString("id-ID")}\``,
                            `> **👤 Pembeli:** <@${buyer.id}>`,
                            `> **📦 Sisa Stok:** \`${typeof product.stock === "number" ? product.stock : "-"}\``,
                            "",
                            `-# Terimakasih sudah membeli di ${interaction.guild.name}`,
                        ].filter(Boolean).join("\n"))
                        .addFields(
                            { name: "Status", value: "✅ **Sukses**", inline: true },
                            { name: "Tanggal", value: `<t:${Math.floor(trx.createdAt.getTime() / 1000)}:F>`, inline: true }
                        )
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed], content: `<@${buyer.id}>` });
                }
                case "list": {
                    const transactions = await Transaction.findAll({
                        where: { guildId },
                        include: [
                            { model: Product, as: "product" }
                        ],
                        order: [["createdAt", "DESC"]],
                        limit: 25
                    });

                    if (!transactions.length) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Grey")
                                    .setTitle("📄 Daftar Transaksi Kosong")
                                    .setDescription("Belum ada transaksi yang tercatat di toko ini.")
                                    .setFooter(embedFooter(interaction))
                            ],
                            ephemeral: true
                        });
                    }

                    let desc = "";
                    transactions.forEach((trx, i) => {
                        const no = String(i + 1).padStart(2, "0");
                        const buyerMention = `<@${trx.userId}>`;
                        const productName = trx.product?.name || "-";
                        const qty = trx.quantity;
                        const total = `Rp ${trx.total.toLocaleString("id-ID")}`;
                        desc += `**\`${no}.\` ${productName}** x${qty} oleh ${buyerMention}\n> Total: ${total}\n`;
                    });

                    const embed = new EmbedBuilder()
                        .setColor("Blue")
                        .setTitle("> 📄 Daftar Transaksi Terakhir")
                        .setDescription(desc)
                        .setFooter(embedFooter(interaction))
                        .setTimestamp();

                    return await interaction.editReply({ embeds: [embed] });
                }
                default: {
                    return interaction.editReply({
                        content: "❌ | Subcommand tidak dikenali.",
                        ephemeral: true,
                    });
                }
            }
        } catch (error) {
            console.error("Error during transaction command execution:", error);
            // Kirim error ke webhook jika ada
            if (process.env.WEBHOOK_ERROR_LOGS) {
                const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
                const errorEmbed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("> ❌ Error command /transaction")
                    .setDescription(`\`\`\`${error}\`\`\``)
                    .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
                    .setTimestamp();

                webhookClient
                    .send({ embeds: [errorEmbed] })
                    .catch(console.error);
            }

            return interaction.editReply({
                content: "❌ | Terjadi kesalahan saat menjalankan perintah transaksi. Silakan coba lagi.",
                ephemeral: true,
            });
        }
    },
};