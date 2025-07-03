// File: modals/embed-create.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const EmbedModel = require("../database/models/Embed");
const { embedFooter } = require("../helpers");

module.exports = async (interaction) => {
    const [_, channelId, colorRaw] = interaction.customId.split("|");

    const title = interaction.fields.getTextInputValue("titleInput");
    let description = interaction.fields.getTextInputValue("descInput");
    const buttonsRaw = interaction.fields.getTextInputValue("buttonsInput") || null;
    const fieldsRaw = interaction.fields.getTextInputValue("fieldsInput") || null;
    const imageUrl = interaction.fields.getTextInputValue("imageInput") || null;

    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return interaction.reply({ content: "❌ Channel gak ditemukan!", ephemeral: true });

    description = description.replace(/\\n/g, "\n");

    const buttonsData = [];
    if (buttonsRaw) {
        const entries = buttonsRaw.split("~~");
        for (const entry of entries) {
            const [label, link] = entry.trim().split("|");
            if (!label || !link || !/^https?:\/\//.test(link)) {
                return interaction.reply({ content: "❌ Format tombol salah/link invalid!", ephemeral: true });
            }
            buttonsData.push({ label, link, style: ButtonStyle.Link });
        }
    }

    const fieldsData = [];
    if (fieldsRaw) {
        const entries = fieldsRaw.split("~~");
        for (const entry of entries) {
            const [name, value] = entry.trim().split("|");
            if (!name || !value) {
                return interaction.reply({ content: "❌ Format fields salah!", ephemeral: true });
            }
            fieldsData.push({ name, value, inline: false });
        }
    }

    const saved = await EmbedModel.create({
        guildId: interaction.guildId,
        title,
        description,
        channelId,
        buttons: buttonsData,
        fields: fieldsData,
    });

    const embed = new EmbedBuilder()
        .setTitle("> " + title)
        .setDescription(description)
        .setColor(colorRaw || "Blue")
        .setFooter(embedFooter(interaction))
        .setTimestamp();

    if (fieldsData.length > 0) embed.addFields(...fieldsData);
    if (imageUrl) embed.setImage(imageUrl);

    const rows = [];
    let row = new ActionRowBuilder();
    for (const btn of buttonsData) {
        if (row.components.length === 5) {
            rows.push(row);
            row = new ActionRowBuilder();
        }
        row.addComponents(new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel(btn.label).setURL(btn.link));
    }
    if (row.components.length > 0) rows.push(row);

    const message = await channel.send({ embeds: [embed], components: rows });

    saved.messageId = message.id;
    saved.changed("messageId", true);
    await saved.saveAndUpdateCache("id");

    await interaction.reply({ content: `✅ Embed berhasil dikirim ke ${channel}!`, ephemeral: true });
};
