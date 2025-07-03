const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, WebhookClient } = require("discord.js");
// const { adminOnly } = require("../moderation/lock");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder().setName("restart").setDescription("🔁 restart bot"),
  adminOnly: true,
  async execute(interaction) {
    try {
      // Pastikan cuma owner yang bisa restart
      if (interaction.user.id !== process.env.OWNER_ID) {
        return interaction.reply({ content: "❌ kamuu bukan ownerkuu wlee!", ephemeral: true });
      }

      // Kirim embed dengan tombol konfirmasi
      const embed = new EmbedBuilder()
        .setColor("Yellow")
        // .setTitle("> ⚠️ Restart bot")
        .setDescription("## Restart bot\n<:kennmchead:1375315784456343572> kenn yakin mauu merestart bot inii?")
        .setThumbnail(interaction.client.user.displayAvatarURL());

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("confirm_restart").setLabel("iyaa, restart!").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("cancel_restart").setLabel("❌ nggaa").setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ content: "", embeds: [embed], components: [row], ephemeral: true });

      // Collector untuk tombol
      const filter = (i) => i.customId === "confirm_restart" || i.customId === "cancel_restart";
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "Ini bukan buat kamu!", ephemeral: true });
        }

        if (i.customId === "cancel_restart") {
          const cancelEmbed = new EmbedBuilder()
            .setColor("Yellow")
            // .setTitle("> ❌ Restart Dibatalkan")
            .setDescription("## ❌ Restart Dibatalkan\nrestart dibatalkann sama kenn.")
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();

          await i.update({
            content: "",
            embeds: [cancelEmbed],
            components: [],
          });
          return;
        }

        if (i.customId === "confirm_restart") {
          const restartEmbed = new EmbedBuilder()
            .setColor("Yellow")
            // .setTitle("> ♾️ Bot Restart")
            .setDescription("## ♾️ Bot Restart\nbot lagi direstart... tunggu bentar yakk kenn <:kennmchead:1375315784456343572>")
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp();
          await i.update({ embeds: [restartEmbed], components: [], content: "" });

          // Kasih delay bentar
          setTimeout(() => {
            process.exit(0); // Trigger restart
          }, 1000);
        }
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "time") {
          const timeoutEmbed = new EmbedBuilder()
            .setColor("Yellow")
            // .setTitle("> ⌛ Waktu habis")
            .setDescription("## ⌛ Waktu habis\nwaktu habis! kenn ngga ngapa ngapainn 😭")
            .setThumbnail(interaction.client.user.displayAvatarURL());

          await interaction.editReply({
            embeds: [timeoutEmbed],
            components: [],
          });
        }
      });
    } catch (error) {
      console.error("Error during restart command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /restart`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({ text: `Error dari ${interaction.guild?.name || "DM"}` })
        .setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
