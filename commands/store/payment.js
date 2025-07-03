const { SlashCommandBuilder, EmbedBuilder, WebhookClient, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const PaymentMethod = require("../../database/models/PaymentMethod");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("payment")
        .setDescription("Kelola metode pembayaran di database toko.")
        .addSubcommand(sub =>
            sub
                .setName("create")
                .setDescription("Membuat metode pembayaran baru.")
                .addStringOption(option =>
                    option.setName("name").setDescription("Nama metode pembayaran").setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("description").setDescription("Deskripsi metode pembayaran (opsional)")
                )
                .addStringOption(option =>
                    option.setName("emoji").setDescription("Emoji metode pembayaran (opsional)")
                )
                .addAttachmentOption(option =>
                    option.setName("image").setDescription("Gambar metode pembayaran (opsional)")
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("edit")
                .setDescription("Edit metode pembayaran yang sudah ada.")
                .addStringOption(option =>
                    option.setName("old_name").setDescription("Nama metode pembayaran yang ingin diedit").setRequired(true).setAutocomplete(true)
                )
                .addStringOption(option =>
                    option.setName("new_name").setDescription("Nama metode pembayaran baru (opsional)")
                )
                .addStringOption(option =>
                    option.setName("description").setDescription("Deskripsi metode pembayaran (opsional)")
                )
                .addStringOption(option =>
                    option.setName("emoji").setDescription("Emoji metode pembayaran (opsional)")
                )
                .addAttachmentOption(option =>
                    option.setName("image").setDescription("Gambar metode pembayaran (opsional)")
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("delete")
                .setDescription("Hapus metode pembayaran.")
                .addStringOption(option =>
                    option.setName("name").setDescription("Nama metode pembayaran yang ingin dihapus").setRequired(true).setAutocomplete(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("Lihat semua metode pembayaran yang tersedia.")
        ),
    aliases: ["bayar", "pay"],
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const guildId = interaction.guild?.id;
        if (!guildId) return interaction.respond([]);

        const methods = await PaymentMethod.findAll({ where: { guildId } });
        return interaction.respond(
            methods
                .filter(m => m.name.toLowerCase().includes(focused.toLowerCase()))
                .slice(0, 25)
                .map(m => ({ name: m.name, value: m.name }))
        );
    },

    async execute(interaction) {
        const guildId = interaction.guild?.id;
        if (!guildId) return interaction.reply({ content: "❌ | Harus dijalankan di dalam server.", ephemeral: true });

        await interaction.deferReply({ ephemeral: true });
        const sub = interaction.options.getSubcommand(false);

        try {
            switch (sub) {
                case "create": {
                    const name = interaction.options.getString("name").trim();
                    const description = interaction.options.getString("description")?.trim() || null;
                    const emoji = interaction.options.getString("emoji")?.trim() || null;
                    const image = interaction.options.getAttachment("image")?.url || null;

                    const exist = await PaymentMethod.findOne({ where: { guildId, name } });
                    if (exist) return interaction.editReply({ content: `❌ | Metode "${name}" sudah ada.`, ephemeral: true });

                    const data = await PaymentMethod.create({ guildId, name, description, emoji, image });

                    const embed = new EmbedBuilder()
                        .setColor("Green")
                        .setTitle("✅ Metode Pembayaran Dibuat")
                        .addFields(
                            { name: "Nama", value: data.name, inline: true },
                            { name: "Deskripsi", value: description || "-", inline: true },
                            { name: "Emoji", value: emoji || "-", inline: true },
                            { name: "Gambar", value: image || "-", inline: false }
                        )
                        .setFooter(embedFooter(interaction));

                    return interaction.editReply({ embeds: [embed], ephemeral: true });
                }

                case "edit": {
                    const oldName = interaction.options.getString("old_name").trim();
                    const newName = interaction.options.getString("new_name")?.trim();
                    const description = interaction.options.getString("description")?.trim();
                    const emoji = interaction.options.getString("emoji")?.trim();
                    const image = interaction.options.getAttachment("image")?.url;

                    const data = await PaymentMethod.findOne({ where: { guildId, name: oldName } });
                    if (!data) return interaction.editReply({ content: `❌ | Metode "${oldName}" tidak ditemukan.`, ephemeral: true });

                    if (newName && newName !== oldName) {
                        const nameExist = await PaymentMethod.findOne({ where: { guildId, name: newName } });
                        if (nameExist) return interaction.editReply({ content: `❌ | Nama baru "${newName}" sudah dipakai.`, ephemeral: true });
                        data.name = newName;
                    }

                    if (typeof description !== "undefined") data.description = description;
                    if (typeof emoji !== "undefined") data.emoji = emoji;
                    if (typeof image !== "undefined") data.image = image;

                    await data.save();

                    const embed = new EmbedBuilder()
                        .setColor("Yellow")
                        .setTitle("✏️ Metode Pembayaran Diedit")
                        .addFields(
                            { name: "Nama", value: data.name, inline: true },
                            { name: "Deskripsi", value: data.description || "-", inline: true },
                            { name: "Emoji", value: data.emoji || "-", inline: true },
                            { name: "Gambar", value: data.image || "-", inline: false }
                        )
                        .setFooter(embedFooter(interaction));

                    return interaction.editReply({ embeds: [embed], ephemeral: true });
                }

                case "delete": {
                    const name = interaction.options.getString("name").trim();
                    const data = await PaymentMethod.findOne({ where: { guildId, name } });
                    if (!data) return interaction.editReply({ content: `❌ | Metode "${name}" tidak ditemukan.`, ephemeral: true });
                    await data.destroy();

                    return interaction.editReply({ content: `✅ | Metode **${name}** berhasil dihapus.`, ephemeral: true });
                }
                default: {
                    const methods = await PaymentMethod.findAll({ where: { guildId } });

                    if (!methods.length) {
                        return interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor("Grey")
                                    // .setTitle("💳 Daftar Metode Pembayaran Kosong")
                                    .setDescription("## 💳 Daftar Metode Pembayaran Kosong\nBelum ada metode pembayaran yang dibuat di toko ini.\n\nJika kamu admin, gunakan `/payment create` untuk menambah metode baru!")
                                    // .setThumbnail("https://cdn-icons-png.flaticon.com/512/4072/4072301.png")
                                    .setFooter(embedFooter(interaction))
                            ],
                            ephemeral: true
                        });
                    }

                    const options = methods.map(m => ({
                        label: m.name,
                        value: m.id.toString(),
                        // description: m.description?.slice(0, 50) || "_Tanpa deskripsi_"
                        description: `klik untuk membayar dengan ${m.name}`
                    }));

                    const select = new StringSelectMenuBuilder()
                        .setCustomId("select_payment_method")
                        .setPlaceholder("Pilih metode pembayaran")
                        .addOptions(options);

                    const row = new ActionRowBuilder().addComponents(select);

                    const introEmbed = new EmbedBuilder()
                        .setColor("Blue")
                        .setDescription("## 💳 Daftar Metode Pembayaran\nSilakan pilih metode pembayaran dari dropdown di bawah ini untuk melihat detailnya.")
                        // .setThumbnail("https://cdn-icons-png.flaticon.com/512/3081/3081559.png")
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
                        const selectedMethod = methods.find(m => m.id.toString() === selectedId);

                        if (!selectedMethod) {
                            return i.update({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor("Grey")
                                        .setDescription(`## 💳 Metode tidak ditemukan.`)
                                ],
                                components: [row]
                            });
                        }

                        let desc = `## 💳 Detail Metode Pembayaran\n### ${selectedMethod.emoji ? selectedMethod.emoji + " " : ""}**${selectedMethod.name}**\n`;
                        desc += `> ${selectedMethod.description?.trim() || "_(tanpa deskripsi)_"}\n\n-# Jangan lupa untuk menyertakan bukti pembayaran`;
                        // if (selectedMethod.image) {
                        //     desc += `\n\n[Gambar](${selectedMethod.image})`;
                        // }

                        const embed = new EmbedBuilder()
                            .setColor("Green")
                            // .setTitle(`💳 Detail Metode Pembayaran`)
                            .setDescription(desc)
                            .setFooter(embedFooter(interaction))
                            .setTimestamp();

                        if (selectedMethod.image) {
                            embed.setImage(selectedMethod.image);
                        }

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

                // default: {
                //     const methods = await PaymentMethod.findAll({ where: { guildId } });
                //     if (!methods.length) return interaction.editReply({ content: `❌ | Belum ada metode yang ditambahkan.`, ephemeral: true });

                //     // Use unique customId for this user to avoid conflicts and handle select interaction
                //     const customId = `payment_select_${interaction.user.id}_${Date.now()}`;

                //     const menu = new StringSelectMenuBuilder()
                //         .setCustomId(customId)
                //         .setPlaceholder("Pilih metode pembayaran")
                //         .addOptions(methods.map(m => ({
                //             label: m.name,
                //             description: m.description?.substring(0, 50) || "-",
                //             value: m.name
                //         })));

                //     const row = new ActionRowBuilder().addComponents(menu);
                //     const embed = new EmbedBuilder()
                //         .setColor("Aqua")
                //         .setTitle("💳 Metode Pembayaran")
                //         .setDescription("Pilih metode pembayaran yang ingin kamu lihat lebih detail dari menu di bawah.");

                //     const msg = await interaction.editReply({ embeds: [embed], components: [row], ephemeral: true });

                //     // Create a collector to handle the select menu interaction
                //     // const message = await interaction.fetchReply();
                //     const filter = i =>
                //         i.customId === customId &&
                //         i.user.id === interaction.user.id;

                //     const collector = message.createMessageComponentCollector({ filter, time: 60_000 });

                //     collector.on("collect", async selectInteraction => {
                //         const selected = selectInteraction.values[0];
                //         const method = methods.find(m => m.name === selected);

                //         if (!method) {
                //             await selectInteraction.reply({
                //                 content: `❌ | Metode tidak ditemukan.`,
                //                 ephemeral: true
                //             });
                //             return;
                //         }

                //         const detailEmbed = new EmbedBuilder()
                //             .setColor("Green")
                //             .setTitle(`💳 Detail Metode: ${method.name}`)
                //             .addFields(
                //                 { name: "Deskripsi", value: method.description || "-", inline: false },
                //                 { name: "Emoji", value: method.emoji || "-", inline: true },
                //                 { name: "Gambar", value: method.image ? `[Klik untuk lihat](${method.image})` : "-", inline: true }
                //             )
                //             .setFooter({ text: `ID: ${method.id}` });

                //         await selectInteraction.update({
                //             embeds: [detailEmbed],
                //             components: [],
                //             ephemeral: true
                //         });
                //         collector.stop();
                //     });

                //     collector.on("end", async collected => {
                //         if (msg.editable) {
                //             // Disable the menu after timeout or after selection
                //             const disabledRow = new ActionRowBuilder().addComponents(
                //                 menu.setDisabled(true)
                //             );
                //             await interaction.editReply({
                //                 components: [disabledRow],
                //                 ephemeral: true
                //             }).catch(() => { });
                //         }
                //     });

                //     return;
                // }

                //             if (sub === "list") {
                //                 const methods = await PaymentMethod.findAll({ where: { guildId } });
                //                 if (!methods.length) return interaction.editReply({ content: `❌ | Belum ada metode yang ditambahkan.`, ephemeral: true });

                //                 const desc = methods.map((m, i) => `**${i + 1}.** ${m.emoji || "💳"} \`${m.name}\`
                // > ${m.description || "_tanpa deskripsi_"}
                // > [Gambar](${m.image || "-"})`).join("\n\n");

                //                 const embed = new EmbedBuilder()
                //                     .setColor("Blue")
                //                     .setTitle("💳 Daftar Metode Pembayaran")
                //                     .setDescription(desc)
                //                     .setFooter({ text: `${methods.length} total`, iconURL: interaction.guild.iconURL() || undefined });

                //                 return interaction.editReply({ embeds: [embed], ephemeral: true });
                //             }
            }
        } catch (e) {
            console.error(e);
            if (process.env.WEBHOOK_ERROR_LOGS) {
                const client = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
                client.send({ embeds: [new EmbedBuilder().setColor("Red").setTitle("❌ Error /paymentmethod").setDescription(`\`\`\`${e}\`\`\``)] });
            }
            return interaction.editReply({ content: `❌ | Terjadi error: ${e.message || e}`, ephemeral: true });
        }
    },
};