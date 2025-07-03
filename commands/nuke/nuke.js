const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("nuke")
        .setDescription("⚠️ menghancurkan server sepenuhnya.")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guild = interaction.guild;
        const member = interaction.member;

        // konfirmasi dulu
        await interaction.reply({
            content: "⚠️ kamu yakin mau nuke server ini? ketik `/confirmnuke` buat lanjut!",
            ephemeral: true,
        });

        // simpan konfirmasi secara global, bebas kamu implement kayak gimana
        global.nukeConfirm = global.nukeConfirm || {};
        global.nukeConfirm[interaction.user.id] = guild.id;
    },
};
