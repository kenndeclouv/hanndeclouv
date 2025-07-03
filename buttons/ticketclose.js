const Ticket = require("../database/models/Ticket");
const { closeTicket } = require("../helpers");

module.exports = async (interaction) => {
    const ticket = await Ticket.findOne({ where: { channelId: interaction.channel.id } });
    if (!ticket) {
        return interaction.reply({ content: "❌ | Ticket tidak ada dalam sistem.", ephemeral: true });
    }
    return closeTicket(interaction);
};