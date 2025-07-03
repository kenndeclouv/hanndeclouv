const {
    SlashCommandBuilder,
    ChannelType,
    PermissionFlagsBits,
    WebhookClient,
    EmbedBuilder
} = require('discord.js');
const BotSetting = require("../../database/models/BotSetting");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("autosetup")
        .setDescription("Setup otomatis fitur tertentu")
        .addSubcommand(subcommand =>
            subcommand.setName("testimony")
                .setDescription("Setup otomatis channel testimoni & feedback")
                .addBooleanOption(option =>
                    option.setName("newcategory")
                        .setDescription("Buat category baru atau tidak")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("category_id")
                        .setDescription("Gunakan category ID yang sudah ada (abaikan jika buat category)")
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("server-stats")
                .setDescription("Setup otomatis channel statistik server")
                .addBooleanOption(option =>
                    option.setName("newcategory")
                        .setDescription("Buat category baru atau tidak")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("category_id")
                        .setDescription("Gunakan category ID yang sudah ada (abaikan jika buat category)")
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName("minecraft")
                .setDescription("Setup otomatis channel statistik Minecraft server")
                .addBooleanOption(option =>
                    option.setName("newcategory")
                        .setDescription("Buat category baru atau tidak")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option.setName("category_id")
                        .setDescription("Gunakan category ID yang sudah ada (abaikan jika buat category)")
                        .setRequired(false)
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const subcommand = interaction.options.getSubcommand();

            const guild = interaction.guild;
            const newCategory = interaction.options.getBoolean("newcategory");
            const existingCategoryId = interaction.options.getString("category_id");

            switch (subcommand) {
                case "testimony": {
                    let category = null;

                    if (newCategory) {
                        category = await guild.channels.create({
                            name: "📝・testimoni",
                            type: ChannelType.GuildCategory,
                        });
                    } else {
                        category = guild.channels.cache.get(existingCategoryId);
                        if (!category || category.type !== ChannelType.GuildCategory) {
                            return interaction.editReply({ content: "❌ Category ID tidak valid!" });
                        }
                    }

                    const testimonyChannel = await guild.channels.create({
                        name: "📦・testimoni",
                        type: ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });

                    const feedbackChannel = await guild.channels.create({
                        name: "💬・feedback",
                        type: ChannelType.GuildText,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });

                    const countChannel = await guild.channels.create({
                        name: "0 Testimonies",
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });

                    // simpan ke database
                    const botSetting = await BotSetting.getCache({ guildId: guild.id });
                    botSetting.testimonyChannelId = testimonyChannel.id;
                    botSetting.feedbackChannelId = feedbackChannel.id;
                    botSetting.testimonyCountChannelId = countChannel.id;
                    botSetting.testimonyCountFormat = "{count} Testimonies";

                    await botSetting.saveAndUpdateCache("guildId");

                    await interaction.editReply({
                        content: `✅ Berhasil setup otomatis testimoni!\n\n📦 <#${testimonyChannel.id}>\n💬 <#${feedbackChannel.id}>\n🔢 <#${countChannel.id}>`,
                    });
                    break;
                }
                case "server-stats": {
                    let category = null;

                    if (newCategory) {
                        category = await guild.channels.create({
                            name: "📊・server-stats",
                            type: ChannelType.GuildCategory,
                        });
                    } else {
                        category = guild.channels.cache.get(existingCategoryId);
                        if (!category || category.type !== ChannelType.GuildCategory) {
                            return interaction.editReply({ content: "❌ Category ID tidak valid!" });
                        }
                    }

                    // Create stats channels
                    const totalMembers = guild.memberCount;
                    const onlineMembers = guild.members.cache.filter(m => m.presence && ["online", "idle", "dnd"].includes(m.presence.status)).size;
                    const botCount = guild.members.cache.filter(m => m.user.bot).size;
                    const humanCount = totalMembers - botCount;

                    const totalMembersChannel = await guild.channels.create({
                        name: `👥 Total: ${totalMembers}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });

                    const onlineMembersChannel = await guild.channels.create({
                        name: `🟢 Online: ${onlineMembers}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });

                    const humanMembersChannel = await guild.channels.create({
                        name: `🙎 Users: ${humanCount}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });

                    const botMembersChannel = await guild.channels.create({
                        name: `🤖 Bots: ${botCount}`,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });

                    // simpan ke database
                    const botSetting = await BotSetting.getCache({ guildId: guild.id });
                    botSetting.serverStatsCategoryId = category.id;
                    botSetting.serverStatsOn = true;
                    botSetting.serverStats = [
                        {
                            channelId: totalMembersChannel.id,
                            format: "👥 Total: {memberstotal}",
                            enabled: true
                        },
                        {
                            channelId: onlineMembersChannel.id,
                            format: "🟢 Online: {online}",
                            enabled: true
                        },
                        {
                            channelId: humanMembersChannel.id,
                            format: "🙎 Users: {humans}",
                            enabled: true
                        },
                        {
                            channelId: botMembersChannel.id,
                            format: "🤖 Bots: {bots}",
                            enabled: true
                        }
                    ];
                    await botSetting.saveAndUpdateCache("guildId");

                    await interaction.editReply({
                        content: `✅ Berhasil setup otomatis server stats!\n\n👥 <#${totalMembersChannel.id}>\n🟢 <#${onlineMembersChannel.id}>\n🙎 <#${humanMembersChannel.id}>\n🤖 <#${botMembersChannel.id}>`,
                    });
                    break;
                }
                case "minecraft": {
                    let category = null;

                    if (newCategory) {
                        category = await guild.channels.create({
                            name: "🌐・minecraft-stats",
                            type: ChannelType.GuildCategory,
                        });
                    } else {
                        category = guild.channels.cache.get(existingCategoryId);
                        if (!category || category.type !== ChannelType.GuildCategory) {
                            return interaction.editReply({ content: "❌ Category ID tidak valid!" });
                        }
                    }

                    // simpan ke database
                    const botSetting = await BotSetting.getCache({ guildId: guild.id });

                    // ambil IP dan Port dulu biar bisa generate nama
                    const ip = botSetting.minecraftIp || "0.0.0.0";
                    const port = botSetting.minecraftPort || 25565;

                    const ipName = `🌐 ${ip}`;
                    const portName = `🔌 ${port}`;
                    const statusName = `🔵 DONE SETUP`;
                    const playersName = `🎮 0/0`;

                    // bikin channel satu per satu
                    const ipChannel = await guild.channels.create({
                        name: ipName,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });
                    botSetting.minecraftIpChannelId = ipChannel.id;

                    const portChannel = await guild.channels.create({
                        name: portName,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });
                    botSetting.minecraftPortChannelId = portChannel.id;

                    const statusChannel = await guild.channels.create({
                        name: statusName,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });
                    botSetting.minecraftStatusChannelId = statusChannel.id;

                    const playersChannel = await guild.channels.create({
                        name: playersName,
                        type: ChannelType.GuildVoice,
                        parent: category.id,
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone,
                                deny: [PermissionFlagsBits.Connect],
                                allow: [PermissionFlagsBits.ViewChannel],
                            },
                        ],
                    });
                    botSetting.minecraftPlayersChannelId = playersChannel.id;

                    await botSetting.saveAndUpdateCache("guildId");

                    await interaction.editReply({
                        content: `✅ Berhasil setup Minecraft server stat channel 😋\n\n🌐 <#${ipChannel.id}>\n🔌 <#${portChannel.id}>\n🔵 <#${statusChannel.id}>\n🎮 <#${playersChannel.id}>`
                    });
                    break;
                }
            }

        } catch (error) {
            console.error("Error during invite command execution:", error);
            // Send DM to owner about the error
            const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

            const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /autosetup`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

            // Kirim ke webhook
            webhookClient
                .send({
                    embeds: [errorEmbed],
                })
                .catch(console.error);
            return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
        }
    },
};
