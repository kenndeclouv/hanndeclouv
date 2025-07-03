const Embed = require("../database/models/Embed");

module.exports = async (interaction) => {
    const [_, embedId, buttonIndex] = interaction.customId.split("-");
    const embedData = await Embed.findByPk(embedId);
    if (!embedData) return;

    const buttonData = embedData.buttons[buttonIndex];
    if (!buttonData) return;

    const role = interaction.guild.roles.cache.get(buttonData.roleId);
    const member = interaction.member;

    if (!role) {
        return interaction.reply({ content: "❌ Role tidak ditemukan.", ephemeral: true });
    }

    if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        await interaction.reply({
            content: `✅ Role **${role.name}** dihapus!`,
            ephemeral: true,
        });
    } else {
        await member.roles.add(role);
        await interaction.reply({
            content: `✅ Role **${role.name}** ditambahkan!`,
            ephemeral: true,
        });
    }
};
