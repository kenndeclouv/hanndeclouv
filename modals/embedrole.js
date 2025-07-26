// File: modals/embed-role.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const EmbedModel = require("../database/models/Embed");
const { embedFooter } = require("../helpers");

module.exports = async (interaction) => {
    try {
        const [_, channelId, colorRaw] = interaction.customId.split("|");

        const title = interaction.fields.getTextInputValue("titleInput");
        let description = interaction.fields.getTextInputValue("descInput");
        const buttonsRaw = interaction.fields.getTextInputValue("buttonsInput");

        const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
        if (!channel) return interaction.reply({ content: "❌ Channel tidak ditemukan!", ephemeral: true });

        if (!buttonsRaw) return interaction.reply({ content: "❌ Tombol tidak boleh kosong!", ephemeral: true });

        description = description.replace(/\\n/g, "\n");

        const buttonsData = [];
        const entries = buttonsRaw.split("~~");
        for (const entry of entries) {
            const [label, roleId, style] = entry.trim().split("|");

            if (!label || !roleId || !style) {
                return interaction.reply({ content: "❌ Format tombol salah! Gunakan: Label|RoleID|Style", ephemeral: true });
            }

            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) return interaction.reply({ content: `❌ Role ID ${roleId} tidak ditemukan!`, ephemeral: true });

            if (role.comparePositionTo(interaction.guild.members.me.roles.highest) >= 0) {
                return interaction.reply({ content: `❌ Role ${role.name} lebih tinggi dari role bot!`, ephemeral: true });
            }

            const validStyles = Object.keys(ButtonStyle).filter((k) => isNaN(k));
            if (!validStyles.includes(style)) {
                return interaction.reply({ content: `❌ Style tombol tidak valid! Pilihan: ${validStyles.join(", ")}`, ephemeral: true });
            }

            buttonsData.push({ label, roleId, style: ButtonStyle[style] });
        }

        const saved = await EmbedModel.create({
            guildId: interaction.guildId,
            title,
            description,
            channelId,
            buttons: buttonsData,
        });

        const buttonsWithId = buttonsData.map((btn, i) => ({
            ...btn,
            customId: `reactrole-${saved.id}-${i}`,
        }));

        saved.buttons = buttonsWithId;
        await saved.saveAndUpdateCache("id");

        const embed = new EmbedBuilder()
            .setTitle("> " + title)
            .setDescription(description)
            .setColor(colorRaw || "Blue")
            .setFooter(embedFooter(interaction))
            .setTimestamp();

        const row = new ActionRowBuilder();
        for (const btn of buttonsWithId) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(btn.customId)
                    .setLabel(btn.label)
                    .setStyle(btn.style)
            );
        }

        const message = await channel.send({ embeds: [embed], components: [row] });

        // Update messageId using the cache-aware method
        saved.messageId = message.id;
        await saved.saveAndUpdateCache("id");

        await interaction.reply({ content: `✅ Embed role berhasil dikirim ke ${channel}!`, ephemeral: true });
    } catch (error) {
        console.error("[EmbedRole Modal] Error:", error);
        await interaction.reply({
            content: "❌ Terjadi kesalahan saat membuat embed role!",
            ephemeral: true
        });
    }
};