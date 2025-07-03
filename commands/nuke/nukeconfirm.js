const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("confirmnuke")
        .setDescription("☢️ konfirmasi untuk menghancurkan server.")
        .addStringOption(option =>
            option.setName("type")
                .setDescription("Tipe nukenya (add/remove)")
                .setRequired(true)
                .addChoices(
                    { name: "add", value: "add" },
                    { name: "remove", value: "remove" }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;
        const userId = interaction.user.id;
        const type = interaction.options.getString("type");

        if (!global.nukeConfirm || global.nukeConfirm[userId] !== guild.id) {
            return interaction.reply({
                content: "❌ kamu belum meminta konfirmasi nuke, jalankan `/nuke` dulu.",
                ephemeral: true,
            });
        }

        await interaction.reply(`☢️ nuking with type: **${type}**...`);

        if (type === "remove") {
            // delete all channels
            guild.channels.cache.forEach(async (channel) => {
                try {
                    await channel.delete();
                } catch (e) { }
            });

            // delete all roles
            guild.roles.cache.forEach(async (role) => {
                try {
                    if (
                        role.managed ||
                        role.id === guild.id ||
                        role.position >= guild.members.me.roles.highest.position
                    ) return;
                    await role.delete();
                } catch (e) { }
            });

            // delete all emojis
            guild.emojis.cache.forEach(async (emoji) => {
                try {
                    await emoji.delete();
                } catch (e) { }
            });

            // delete all webhooks
            const channels = await guild.channels.fetch();
            for (const [id, channel] of channels) {
                try {
                    const webhooks = await channel.fetchWebhooks();
                    for (const webhook of webhooks.values()) {
                        await webhook.delete();
                    }
                } catch (e) { }
            }

            // kick all members
            guild.members.cache.forEach(async (member) => {
                try {
                    if (!member.user.bot && member.id !== interaction.user.id) {
                        await member.kick("nuked");
                    }
                } catch (e) { }
            });

            // rename server
            try {
                await guild.setName("☢️ fully nuked by your bot");
                await guild.setIcon(null);
            } catch (e) { }

            // add final channel
            try {
                await guild.channels.create({
                    name: "nuked🔥",
                    type: ChannelType.GuildText,
                    topic: "semuanya telah musnah 😈",
                });
            } catch (e) { }
        }

        if (type === "add") {
            // create spam channels
            for (let i = 0; i < 10; i++) {
                try {
                    const channel = await guild.channels.create({
                        name: `you-are-fcked-${i}`,
                        type: ChannelType.GuildText,
                    });
                    // spam messages
                    for (let j = 0; j < 5; j++) {
                        await channel.send(`@everyone server ini telah diambil alih 😈💥`);
                    }
                } catch (e) { }
            }

            // create spam roles
            for (let i = 0; i < 10; i++) {
                try {
                    await guild.roles.create({
                        name: `hacked-role-${i}`,
                        color: "Red",
                        hoist: false,
                        permissions: [],
                    });
                } catch (e) { }
            }
        }

        delete global.nukeConfirm[userId];
    },
};