const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");
const Pterodactyl = require("../../database/models/Pterodactyl"); // Pastikan path benar
const { generateNodeEmbed } = require("../../helpers");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ptero")
        .setDescription("Kelola panel dan node Pterodactyl") // Menambahkan deskripsi utama agar tidak undefined
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName("set")
                .setDescription("Atur panel Ptero")
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("panel")
                        .setDescription("Set API key dan link panel Pterodactyl")
                        .addStringOption(opt =>
                            opt.setName("apikey")
                                .setDescription("API key dari Pterodactyl")
                                .setRequired(false)
                        )
                        .addStringOption(opt =>
                            opt.setName("link")
                                .setDescription("Link panel Pterodactyl")
                                .setRequired(false)
                        )
                )
        )
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName("status")
                .setDescription("Kelola status node monitor")
                .addSubcommand(subcommand =>
                    subcommand
                        .setName("nodes")
                        .setDescription("Lihat status semua node")
                        .addStringOption(opt =>
                            opt.setName("action")
                                .setDescription("Aksi yang ingin dilakukan: add/remove")
                                .setRequired(true)
                                .addChoices(
                                    { name: "add", value: "add" },
                                    { name: "remove", value: "remove" }
                                )
                        )
                )
        ),

    async execute(interaction) {
        const subcommandGroup = interaction.options.getSubcommandGroup(false);
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;

        // Cari atau buat data ptero
        let ptero = await Pterodactyl.findOne({ where: { guildId } });
        if (!ptero) {
            ptero = await Pterodactyl.create({
                guildId,
                apiKey: null,
                link: null,
                messageIds: []
            });
        }

        switch (subcommandGroup) {
            case "set": {
                if (sub === "panel") {
                    const apikey = interaction.options.getString("apikey");
                    const link = interaction.options.getString("link");

                    if (!apikey && !link) {
                        return interaction.reply({
                            content: "❌ Minimal satu field harus diisi!",
                            ephemeral: true
                        });
                    }

                    let updateMessage = "✅ Data berhasil diperbarui:\n";

                    if (apikey) {
                        // Validasi dasar API key
                        if (!/^[a-zA-Z0-9]{40}$/.test(apikey)) {
                            return interaction.reply({
                                content: "❌ Format API key tidak valid!",
                                ephemeral: true
                            });
                        }
                        ptero.apiKey = apikey;
                        updateMessage += "API Key: ✔️\n";
                    }

                    if (link) {
                        // Validasi dasar URL
                        try {
                            new URL(link);
                        } catch {
                            return interaction.reply({
                                content: "❌ Format URL tidak valid!",
                                ephemeral: true
                            });
                        }
                        ptero.link = link.replace(/\/$/, ""); // Hapus trailing slash
                        updateMessage += "Link Panel: ✔️\n";
                    }

                    await ptero.save();
                    return interaction.reply({
                        content: updateMessage,
                        ephemeral: true
                    });
                }
                break;
            }
            case "status": {
                const action = interaction.options.getString("action");
                // "nodes" = just show status, "add" = add monitor, "remove" = remove monitor
                if (sub === "nodes" && action === "add") {
                    // Add status node monitor to this channel
                    await interaction.deferReply({ ephemeral: true });

                    if (!ptero.apiKey || !ptero.link) {
                        return interaction.editReply("❌ Kamu belum setup panel dengan `/ptero set panel`");
                    }

                    try {
                        const embed = await generateNodeEmbed(ptero, interaction.client.user);

                        const msg = await interaction.channel.send({ embeds: [embed] });

                        // Update messageIds
                        const newMessage = {
                            channelId: msg.channel.id,
                            messageId: msg.id
                        };

                        if (!Array.isArray(ptero.messageIds)) {
                            ptero.messageIds = [];
                        }

                        // Prevent duplicate
                        const exists = ptero.messageIds.some(m =>
                            m.messageId === newMessage.messageId
                        );

                        if (!exists) {
                            ptero.messageIds = [...ptero.messageIds, newMessage];
                            await ptero.save();
                        }

                        await interaction.editReply("✅ Status node monitor berhasil ditambahkan ke channel ini!");
                    } catch (error) {
                        console.error("[Ptero] Error:", error);

                        let errorMessage = "❌ Gagal menambahkan status node monitor";

                        if (error.response) {
                            errorMessage += `\nStatus: ${error.response.status}`;
                            if (error.response.data?.errors) {
                                errorMessage += `\nPesan: ${error.response.data.errors[0]?.detail || 'Unknown error'}`;
                            }
                        } else if (error.request) {
                            errorMessage += "\nPanel tidak merespons";
                        } else {
                            errorMessage += `\n${error.message}`;
                        }

                        await interaction.editReply(errorMessage);
                    }
                } else if (sub === "nodes" && action === "remove") {
                    // Remove status node monitor from this channel
                    await interaction.deferReply({ ephemeral: true });

                    if (!Array.isArray(ptero.messageIds) || ptero.messageIds.length === 0) {
                        return interaction.editReply("❌ Tidak ada status node monitor yang terdaftar di database.");
                    }

                    // Find all messageId in this channel
                    const channelId = interaction.channel.id;
                    const toRemove = ptero.messageIds.filter(m => m.channelId === channelId);

                    if (toRemove.length === 0) {
                        return interaction.editReply("❌ Tidak ada status node monitor di channel ini.");
                    }

                    let removedCount = 0;
                    for (const { messageId } of toRemove) {
                        try {
                            const msg = await interaction.channel.messages.fetch(messageId);
                            await msg.delete();
                            removedCount++;
                        } catch (e) {
                            // Message might already be deleted, ignore
                        }
                    }

                    // Remove from database
                    ptero.messageIds = ptero.messageIds.filter(m => m.channelId !== channelId);
                    await ptero.save();

                    await interaction.editReply(`✅ Berhasil menghapus ${removedCount} status node monitor dari channel ini.`);
                }
                break;
            }
        }

    }
};