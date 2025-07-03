const TicketConfig = require("../database/models/TicketConfig");
const { createTicket } = require("../helpers");

module.exports = async (interaction) => {
    const ticketConfig = await TicketConfig.findOne({ where: { guildId: interaction.guild.id } });
    if (!ticketConfig) {
        return interaction.reply({ content: "❌ | Sistem tiket belum dikonfigurasi.", ephemeral: true });
    }
    return createTicket(interaction, ticketConfig);
};
