// const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");
// const { checkPermission } = require("../../helpers");

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("clear")
//     .setDescription("menghapus pesan dari channel. (tidak bisa yang lebih dari 2 minggu)")
//     .addIntegerOption((option) => option.setName("amount").setDescription("jumlah pesan untuk dihapus (0 = semua yang bisa)").setRequired(true)),
//   adminOnly: true,
//   async execute(interaction) {
//     await interaction.deferReply({ ephemeral: true });

//     if (!(await checkPermission(interaction.member))) {
//       return interaction.editReply({
//         content: "❌ kamu tidak punya izin untuk pakai perintah ini.",
//       });
//     }

//     if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
//       return interaction.editReply({
//         content: "❌ kamu gak punya izin MANAGE_MESSAGES.",
//       });
//     }

//     const amount = interaction.options.getInteger("amount");

//     if (amount === 0) {
//       const confirmRow = new ActionRowBuilder().addComponents(
//         new ButtonBuilder().setCustomId("confirm_clear").setLabel("✅ ya, hapus semua!").setStyle(ButtonStyle.Danger),
//         new ButtonBuilder().setCustomId("cancel_clear").setLabel("❌ batal").setStyle(ButtonStyle.Secondary)
//       );

//       const confirmEmbed = new EmbedBuilder().setColor("Red").setTitle("> ⚠️ konfirmasi penghapusan").setDescription("kamu yakin mau menghapus **semua pesan yang bisa dihapus** di channel ini?").setTimestamp();

//       const confirmation = await interaction.editReply({
//         embeds: [confirmEmbed],
//         components: [confirmRow],
//         ephemeral: true,
//       });

//       const collector = confirmation.createMessageComponentCollector({
//         componentType: ComponentType.Button,
//         time: 15_000,
//       });

//       collector.on("collect", async (btnInteraction) => {
//         if (btnInteraction.user.id !== interaction.user.id) {
//           return btnInteraction.reply({
//             content: "ini bukan buat kamu!",
//             ephemeral: true,
//           });
//         }

//         if (btnInteraction.customId === "cancel_clear") {
//           await btnInteraction.update({
//             content: "❌ penghapusan dibatalkan.",
//             embeds: [],
//             components: [],
//           });
//           collector.stop();
//           return;
//         }

//         if (btnInteraction.customId === "confirm_clear") {
//           let totalDeleted = 0;
//           let fetched;

//           do {
//             fetched = await interaction.channel.messages.fetch({ limit: 100 });
//             const deletable = fetched.filter((msg) => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000);

//             if (deletable.size === 0) break;

//             const deleted = await interaction.channel.bulkDelete(deletable, true);
//             totalDeleted += deleted.size;

//             // kasih delay biar gak kena rate limit
//             await new Promise((res) => setTimeout(res, 1000));
//           } while (fetched.size >= 100);

//           const successEmbed = new EmbedBuilder().setColor("Green").setTitle("> clear").setDescription(`**${totalDeleted}** pesan berhasil dihapus.`).setTimestamp();

//           await btnInteraction.update({
//             embeds: [successEmbed],
//             components: [],
//           });

//           collector.stop();
//         }
//       });

//       collector.on("end", async (collected) => {
//         if (collected.size === 0) {
//           await interaction.editReply({
//             content: "⏱ waktu habis. penghapusan dibatalkan.",
//             embeds: [],
//             components: [],
//           });
//         }
//       });

//       return;
//     }

//     // kalau bukan amount 0, langsung hapus
//     try {
//       const deleted = await interaction.channel.bulkDelete(amount, true);
//       const totalDeleted = deleted.size;

//       if (totalDeleted === 0) {
//         return interaction.editReply({
//           content: "❌ gak ada pesan yang bisa dihapus.",
//         });
//       }

//       const embed = new EmbedBuilder().setColor("Green").setTitle("> clear").setDescription(`**${totalDeleted}** pesan berhasil dihapus.`).setTimestamp();

//       return interaction.editReply({ embeds: [embed] });
//     } catch (error) {
//       console.error(error);
//       return interaction.editReply({
//         content: "❌ terjadi kesalahan saat menghapus pesan.",
//       });
//     }
//   },
// };
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
      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("confirm_clear").setLabel("✅ ya, hapus semua!").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("cancel_clear").setLabel("❌ batal").setStyle(ButtonStyle.Secondary)
      );

      const confirmEmbed = new EmbedBuilder().setColor("Red").setTitle("> ⚠️ konfirmasi penghapusan").setDescription("kamu yakin mau menghapus **semua pesan yang bisa dihapus** di channel ini?").setTimestamp();

      const confirmation = await interaction.editReply({
        embeds: [confirmEmbed],
        components: [confirmRow],
        ephemeral: true,
      });

      const replyMessage = await interaction.fetchReply(); // ini id-nya biar nanti di-skip pas hapus
      const replyMessageId = replyMessage.id;

      const collector = confirmation.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15_000,
      });

      collector.on("collect", async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
          return btnInteraction.reply({
            content: "ini bukan buat kamu!",
            ephemeral: true,
          });
        }

        if (btnInteraction.customId === "cancel_clear") {
          await btnInteraction.update({
            content: "❌ penghapusan dibatalkan.",
            embeds: [],
            components: [],
          });
          collector.stop();
          return;
        }

        if (btnInteraction.customId === "confirm_clear") {
          let totalDeleted = 0;
          let fetched;

          do {
            fetched = await interaction.channel.messages.fetch({ limit: 100 });
            const deletable = fetched.filter(
              (msg) => Date.now() - msg.createdTimestamp < 14 * 24 * 60 * 60 * 1000 && msg.id !== replyMessageId // skip interaction message
            );

            if (deletable.size === 0) break;

            const deleted = await interaction.channel.bulkDelete(deletable, true);
            totalDeleted += deleted.size;

            await new Promise((res) => setTimeout(res, 1000));
          } while (fetched.size >= 100);

          const successEmbed = new EmbedBuilder().setColor("Green").setTitle("> clear").setDescription(`**${totalDeleted}** pesan berhasil dihapus.`).setTimestamp();

          await btnInteraction.update({
            embeds: [successEmbed],
            components: [],
          });

          collector.stop();
        }
      });

      collector.on("end", async (collected) => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: "⏱ waktu habis. penghapusan dibatalkan.",
            embeds: [],
            components: [],
          });
        }
      });

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
