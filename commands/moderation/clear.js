const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

const { checkPermission } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("menghapus pesan dari channel. (tidak bisa yang lebih dari 2 minggu)")
    .addIntegerOption((option) => option.setName("amount").setDescription("jumlah pesan untuk dihapus (0 = semua yang bisa)").setRequired(true)),

  adminOnly: true,

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({
        content: "❌ kamu tidak punya izin untuk pakai perintah ini.",
      });
    }

    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.editReply({
        content: "❌ kamu gak punya izin MANAGE_MESSAGES.",
      });
    }

    const amount = interaction.options.getInteger("amount");

    if (amount === 0) {
      await executeClearChannel(interaction);
      return;
    }

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);
      const totalDeleted = deleted.size;

      if (totalDeleted === 0) {
        return interaction.editReply({
          content: "❌ gak ada pesan yang bisa dihapus.",
        });
      }

      const embed = new EmbedBuilder().setColor("Green").setTitle("> clear").setDescription(`**${totalDeleted}** pesan berhasil dihapus.`).setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.editReply({
        content: "❌ terjadi kesalahan saat menghapus pesan.",
      });
    }
  },
};

// fungsi clear channel
async function executeClearChannel(interaction) {
  try {
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("confirmClear").setLabel("Confirm").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("cancelClear").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("> Konfirmasi Hapus Channel")
      .setDescription(
        "⚠️ **Apakah kamu yakin ingin menghapus semua pesan di channel ini?**\n\n" +
          "Perhatian: Ini akan **menghapus channel ini dan membuat channel baru** dengan pengaturan yang sama. **ID channel akan berubah** setelah proses ini.\n\n" +
          "Tekan `Confirm` untuk melanjutkan, atau `Cancel` untuk membatalkan."
      )
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
      components: [confirmRow],
      ephemeral: true,
    });

    const filter = (btn) => btn.customId === "confirmClear" || btn.customId === "cancelClear";

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 15000,
      componentType: ComponentType.Button,
    });

    collector.on("collect", async (btnInteraction) => {
      if (btnInteraction.user.id !== interaction.user.id) {
        return btnInteraction.reply({
          content: "❌ ini bukan konfirmasi buat kamu.",
          ephemeral: true,
        });
      }

      if (btnInteraction.customId === "confirmClear") {
        const oldPosition = interaction.channel.position;
        const newChannel = await interaction.channel.clone();
        await interaction.channel.delete();
        await newChannel.setPosition(oldPosition);

        try {
          await newChannel.send(`✅ Channel berhasil dibersihkan oleh ${interaction.member}`);
          // await newChannel.send("https://media.tenor.com/2roX3uxz_68AAAAC/cat-space.gif");
        } catch (err) {
          console.error("Error sending messages after channel clear:", err);
        }
      } else if (btnInteraction.customId === "cancelClear") {
        const cancelEmbed = new EmbedBuilder().setColor("Red").setTitle("> Penghapusan Channel Dibatalkan").setDescription("❌ Penghapusan channel dibatalkan oleh pengguna.").setTimestamp();

        await interaction.editReply({
          embeds: [cancelEmbed],
          components: [],
        });
      }
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: "⏰ Konfirmasi penghapusan channel kadaluarsa.",
          components: [],
        });
      }
    });
  } catch (err) {
    console.error("An error occurred while executing the clearchannel command: " + err.message);

    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({
        content: "❌ terjadi kesalahan saat menjalankan perintah ini. coba lagi nanti.",
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        content: "❌ terjadi kesalahan saat menjalankan perintah ini. coba lagi nanti.",
        ephemeral: true,
      });
    }
  }
}
