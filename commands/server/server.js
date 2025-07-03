// const {
//     SlashCommandBuilder,
//     PermissionFlagsBits,
//     ChannelType,
//     WebhookClient,
//     AttachmentBuilder,
//     EmbedBuilder,
// } = require("discord.js");
// const fs = require("fs");
// const path = require("path");
// require("dotenv").config();

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName("server")
//         .setDescription("Perintah terkait server")
//         .addSubcommand(sub =>
//             sub
//                 .setName("backup")
//                 .setDescription("Backup struktur server ke file JSON")
//         )
//         .addSubcommand(sub =>
//             sub
//                 .setName("restore")
//                 .setDescription("Restore struktur server dari file backup JSON")
//                 .addAttachmentOption(opt =>
//                     opt.setName("file").setDescription("File backup server (.json)").setRequired(true)
//                 )
//                 .addBooleanOption(opt =>
//                     opt.setName("clear").setDescription("Hapus semua channel & role terlebih dahulu?").setRequired(false)
//                 )
//         ),
//     aliases: ["srv"],
//     async execute(interaction) {
//         await interaction.deferReply({ ephemeral: true });

//         try {
//             const subcommand = interaction.options.getSubcommand();

//             switch (subcommand) {
//                 case "backup": {
//                     const guild = interaction.guild;
//                     if (!guild) return interaction.editReply("❌ Gagal mengambil data server");

//                     try {
//                         const roles = guild.roles.cache
//                             .filter(r => !r.managed && r.id !== guild.id)
//                             .sort((a, b) => b.position - a.position)
//                             .map(role => ({
//                                 id: role.id,
//                                 name: role.name,
//                                 color: role.color,
//                                 hoist: role.hoist,
//                                 permissions: role.permissions.bitfield.toString(),
//                                 mentionable: role.mentionable,
//                             }));

//                         const channels = guild.channels.cache
//                             .sort((a, b) => a.position - b.position)
//                             .map(channel => ({
//                                 name: channel.name,
//                                 type: channel.type,
//                                 parent: channel.parent?.name || null,
//                                 position: channel.position,
//                                 topic: channel.topic || null,
//                                 nsfw: channel.nsfw || false,
//                                 rateLimitPerUser: channel.rateLimitPerUser || 0,
//                                 permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
//                                     id: po.id,
//                                     allow: po.allow.bitfield.toString(),
//                                     deny: po.deny.bitfield.toString(),
//                                     type: po.type,
//                                 })),
//                             }));

//                         const backupData = {
//                             guildId: guild.id,
//                             guildName: guild.name,
//                             createdAt: new Date().toISOString(),
//                             roles,
//                             channels,
//                         };

//                         const filePath = path.join(__dirname, `../../temp/backup-${guild.id}.json`);
//                         fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

//                         const file = new AttachmentBuilder(filePath);
//                         await interaction.editReply({
//                             content: `✅ Backup selesai! Ini file struktur servernya 😋`,
//                             files: [file],
//                         });

//                         setTimeout(() => {
//                             if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//                         }, 10000);
//                     } catch (err) {
//                         console.error(err);
//                         return interaction.editReply("❌ Gagal membuat backup server.");
//                     }
//                     break;
//                 }
//                 case "restore": {
//                     const file = interaction.options.getAttachment("file");
//                     const clearBefore = interaction.options.getBoolean("clear") ?? false;

//                     if (!file.name.endsWith(".json")) {
//                         return interaction.editReply("❌ File harus berupa `.json` dari hasil backup.");
//                     }

//                     try {
//                         const res = await fetch(file.url);
//                         const backup = await res.json();
//                         const guild = interaction.guild;

//                         if (clearBefore) {
//                             await Promise.all(guild.channels.cache.map(c => c.deletable && c.delete().catch(() => { })));
//                             await Promise.all(guild.roles.cache.filter(r => r.editable && r.name !== "@everyone").map(r => r.delete().catch(() => { })));
//                         }

//                         const roleMap = {};
//                         for (const roleData of backup.roles.slice().reverse()) {
//                             const { permissions, id, ...roleProps } = roleData;
//                             const role = await guild.roles.create({
//                                 ...roleProps,
//                                 permissions: BigInt(permissions),
//                                 reason: "Restore backup"
//                             });
//                             roleMap[id] = role;
//                         }

//                         const categories = {};
//                         for (const ch of backup.channels.filter(c => c.type === ChannelType.GuildCategory)) {
//                             const category = await guild.channels.create({
//                                 name: ch.name,
//                                 type: ChannelType.GuildCategory,
//                                 position: ch.position,
//                             });
//                             categories[ch.name] = category;
//                         }

//                         for (const ch of backup.channels.filter(c => c.type !== ChannelType.GuildCategory)) {
//                             const options = {
//                                 name: ch.name,
//                                 type: ch.type,
//                                 topic: ch.topic,
//                                 nsfw: ch.nsfw,
//                                 rateLimitPerUser: ch.rateLimitPerUser,
//                                 position: ch.position,
//                                 parent: ch.parent && categories[ch.parent] ? categories[ch.parent].id : null,
//                                 permissionOverwrites: ch.permissionOverwrites?.map(po => ({
//                                     id: roleMap[po.id]?.id ?? po.id,
//                                     allow: BigInt(po.allow),
//                                     deny: BigInt(po.deny),
//                                     type: po.type,
//                                 })),
//                             };

//                             await guild.channels.create(options);
//                         }

//                         return interaction.editReply("✅ Struktur server berhasil direstore 😋");
//                     } catch (err) {
//                         console.error(err);
//                         return interaction.editReply("❌ Gagal restore. File mungkin rusak atau struktur tidak cocok.");
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error("Error during server command execution:", error);
//             const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

//             const errorEmbed = new EmbedBuilder()
//                 .setColor("Red")
//                 .setTitle(`> ❌ Error command /server`)
//                 .setDescription(`\`\`\`${error}\`\`\``)
//                 .setFooter({ text: `Error dari server ${interaction.guild.name}` })
//                 .setTimestamp();

//             webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);
//             return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
//         }
//     },
// };

const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    WebhookClient,
    AttachmentBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");
const { checkIsPremium } = require("../../helpers");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("Perintah terkait server")
        .addSubcommand(sub =>
            sub
                .setName("backup")
                .setDescription("Backup struktur server ke file JSON")
        )
        .addSubcommand(sub =>
            sub
                .setName("restore")
                .setDescription("Restore struktur server dari file backup JSON")
                .addAttachmentOption(opt =>
                    opt.setName("file").setDescription("File backup server (.json)").setRequired(true)
                )
                .addBooleanOption(opt =>
                    opt.setName("clear").setDescription("Hapus semua channel & role terlebih dahulu?").setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("clone")
                .setDescription("Clone struktur dari server lain yang bot join dan langsung restore ke server ini")
                .addStringOption(opt =>
                    opt.setName("name").setDescription("Nama server sumber").setRequired(true).setAutocomplete(true)
                )
                .addBooleanOption(opt =>
                    opt.setName("clear").setDescription("Hapus semua channel & role terlebih dahulu?").setRequired(false)
                )
        ),
    aliases: ["srv"],

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const choices = interaction.client.guilds.cache
            .filter(g => g.members.me.permissions.has(PermissionFlagsBits.Administrator))
            .map(g => ({ name: g.name, value: g.id }))
            .filter(g => g.name.toLowerCase().includes(focused.toLowerCase()))
            .slice(0, 25);
        return interaction.respond(choices);
    },

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case "backup": {
                    const guild = interaction.guild;
                    if (!guild) return interaction.editReply("❌ Gagal mengambil data server");

                    try {
                        const roles = guild.roles.cache
                            .filter(r => !r.managed && r.id !== guild.id)
                            .sort((a, b) => b.position - a.position)
                            .map(role => ({
                                id: role.id,
                                name: role.name,
                                color: role.color,
                                hoist: role.hoist,
                                permissions: role.permissions.bitfield.toString(),
                                mentionable: role.mentionable,
                            }));

                        const channels = guild.channels.cache
                            .sort((a, b) => a.position - b.position)
                            .map(channel => ({
                                name: channel.name,
                                type: channel.type,
                                parent: channel.parent?.name || null,
                                position: channel.position,
                                topic: channel.topic || null,
                                nsfw: channel.nsfw || false,
                                rateLimitPerUser: channel.rateLimitPerUser || 0,
                                permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
                                    id: po.id,
                                    allow: po.allow.bitfield.toString(),
                                    deny: po.deny.bitfield.toString(),
                                    type: po.type,
                                })),
                            }));

                        const backupData = {
                            guildId: guild.id,
                            guildName: guild.name,
                            createdAt: new Date().toISOString(),
                            roles,
                            channels,
                        };

                        const filePath = path.join(__dirname, `../../temp/backup-${guild.id}.json`);
                        fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

                        const file = new AttachmentBuilder(filePath);
                        await interaction.editReply({
                            content: `✅ Backup selesai! Ini file struktur servernya 😋`,
                            files: [file],
                        });

                        setTimeout(() => {
                            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                        }, 10000);
                    } catch (err) {
                        console.error(err);
                        return interaction.editReply("❌ Gagal membuat backup server.");
                    }
                    break;
                }
                case "restore":
                case "clone": {
                    let backup;
                    const clearBefore = interaction.options.getBoolean("clear") ?? false;

                    if (subcommand === "restore") {
                        const file = interaction.options.getAttachment("file");
                        if (!file.name.endsWith(".json")) {
                            return interaction.editReply("❌ File harus berupa `.json` dari hasil backup.");
                        }
                        const res = await fetch(file.url);
                        backup = await res.json();
                    } else {
                        const isPremium = await checkIsPremium(interaction.user.id);
                        if (!isPremium) {
                            const premiumEmbed = new EmbedBuilder()
                                .setColor("Yellow")
                                .setDescription("## Fitur Premium\nFitur ini cuma buat **premium** user yaa.\nHubungi owner buat langganan!")
                                .setFooter({ text: "Upgrade ke premium untuk akses fitur ini.", iconURL: interaction.client.user.displayAvatarURL() });

                            const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setLabel("Upgrade Premium")
                                    .setStyle(ButtonStyle.Link)
                                    .setURL("https://kythia.my.id/premium") // Ganti URL sesuai kebutuhan
                            );

                            return interaction.editReply({
                                embeds: [premiumEmbed],
                                components: [row]
                            });
                        }

                        const guildId = interaction.options.getString("name");
                        const sourceGuild = interaction.client.guilds.cache.get(guildId);
                        if (!sourceGuild) return interaction.editReply("❌ Tidak bisa menemukan server itu, pastikan bot join dan punya izin admin.");

                        const roles = sourceGuild.roles.cache
                            .filter(r => !r.managed && r.id !== sourceGuild.id)
                            .sort((a, b) => b.position - a.position)
                            .map(role => ({
                                id: role.id,
                                name: role.name,
                                color: role.color,
                                hoist: role.hoist,
                                permissions: role.permissions.bitfield.toString(),
                                mentionable: role.mentionable,
                            }));

                        const channels = sourceGuild.channels.cache
                            .sort((a, b) => a.position - b.position)
                            .map(channel => ({
                                name: channel.name,
                                type: channel.type,
                                parent: channel.parent?.name || null,
                                position: channel.position,
                                topic: channel.topic || null,
                                nsfw: channel.nsfw || false,
                                rateLimitPerUser: channel.rateLimitPerUser || 0,
                                permissionOverwrites: channel.permissionOverwrites.cache.map(po => ({
                                    id: po.id,
                                    allow: po.allow.bitfield.toString(),
                                    deny: po.deny.bitfield.toString(),
                                    type: po.type,
                                })),
                            }));

                        backup = {
                            guildId: sourceGuild.id,
                            guildName: sourceGuild.name,
                            createdAt: new Date().toISOString(),
                            roles,
                            channels,
                        };
                    }

                    const guild = interaction.guild;
                    if (clearBefore) {
                        await Promise.all(guild.channels.cache.map(c => c.deletable && c.delete().catch(() => { })));
                        await Promise.all(guild.roles.cache.filter(r => r.editable && r.name !== "@everyone").map(r => r.delete().catch(() => { })));
                    }

                    const roleMap = {};
                    for (const roleData of backup.roles.slice().reverse()) {
                        const { permissions, id, ...roleProps } = roleData;
                        const role = await guild.roles.create({
                            ...roleProps,
                            permissions: BigInt(permissions),
                            reason: "Restore backup"
                        });
                        roleMap[id] = role;
                    }

                    const categories = {};
                    for (const ch of backup.channels.filter(c => c.type === ChannelType.GuildCategory)) {
                        const category = await guild.channels.create({
                            name: ch.name,
                            type: ChannelType.GuildCategory,
                            position: ch.position,
                        });
                        categories[ch.name] = category;
                    }

                    for (const ch of backup.channels.filter(c => c.type !== ChannelType.GuildCategory)) {
                        const options = {
                            name: ch.name,
                            type: ch.type,
                            topic: ch.topic,
                            nsfw: ch.nsfw,
                            rateLimitPerUser: ch.rateLimitPerUser,
                            position: ch.position,
                            parent: ch.parent && categories[ch.parent] ? categories[ch.parent].id : null,
                            permissionOverwrites: ch.permissionOverwrites?.map(po => ({
                                id: roleMap[po.id]?.id ?? po.id,
                                allow: BigInt(po.allow),
                                deny: BigInt(po.deny),
                                type: po.type,
                            })),
                        };

                        await guild.channels.create(options);
                    }

                    return interaction.editReply(`✅ Struktur server berhasil di${subcommand === "clone" ? "clone & " : ""}restore 😋`);
                }
            }
        } catch (error) {
            console.error("Error during server command execution:", error);
            const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle(`> ❌ Error command /server`)
                .setDescription(`\`\`\`${error}\`\`\``)
                .setFooter({ text: `Error dari server ${interaction.guild.name}` })
                .setTimestamp();

            webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);
            return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
        }
    },
};
