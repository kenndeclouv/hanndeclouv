const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Menghapus pesan dari channel. (tidak bisa yang lebih dari 2 minggu)")
    .addIntegerOption((option) => option.setName("amount").setDescription("Jumlah pesan untuk dihapus (0 = semua yg bisa)").setRequired(true)),
  adminOnly: true,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({ content: "❌ Kamu tidak punya izin untuk pakai perintah ini." });
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.editReply({ content: "Kamu gak punya izin MANAGE_MESSAGES." });
    }

    const amount = interaction.options.getInteger("amount");

    if (amount === 0) {
      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("confirm_clear").setLabel("✅ Ya, hapus semua!").setStyle(ButtonStyle.Danger),

        new ButtonBuilder().setCustomId("cancel_clear").setLabel("❌ Batal").setStyle(ButtonStyle.Secondary)
      );

      const confirmEmbed = new EmbedBuilder().setColor("Red").setTitle("> ⚠️ Konfirmasi Penghapusan").setDescription("Kamu yakin mau menghapus **semua pesan yang bisa dihapus** di channel ini?").setTimestamp();

      const confirmation = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [confirmRow],
        ephemeral: true,
      });

      const collector = confirmation.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15_000,
      });

      collector.on("collect", async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
          return btnInteraction.reply({ content: "Ini bukan buat kamu!", ephemeral: true });
        }

        if (btnInteraction.customId === "cancel_clear") {
          await btnInteraction.update({
            content: "❌ Penghapusan dibatalkan.",
            embeds: [],
            components: [],
          });
          return;
        }

        if (btnInteraction.customId === "confirm_clear") {
          let totalDeleted = 0;
          let messages;
          do {
            messages = await interaction.channel.messages.fetch({ limit: 100 });
            const deletable = messages.filter((msg) => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);
            const deleted = await interaction.channel.bulkDelete(deletable, true);
            totalDeleted += deleted.size;
          } while (messages.size >= 100);

          const successEmbed = new EmbedBuilder().setColor("Green").setTitle("> Clear").setDescription(`**${totalDeleted}** pesan berhasil dihapus.`).setTimestamp();

          await btnInteraction.update({ embeds: [successEmbed], components: [] });
        }
      });

      collector.on("end", async (collected, reason) => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: "⏱ Waktu habis. Penghapusan dibatalkan.",
            embeds: [],
            components: [],
          });
        }
      });

      return;
    }

    // kalau bukan amount 0, langsung hapus
    const deleted = await interaction.channel.bulkDelete(amount, true);
    const totalDeleted = deleted.size;

    const embed = new EmbedBuilder().setColor("Green").setTitle("> Clear").setDescription(`**${totalDeleted}** pesan berhasil dihapus.`).setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  },
};
