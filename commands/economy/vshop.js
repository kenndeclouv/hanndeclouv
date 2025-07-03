const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const Inventory = require("../../database/models/Inventory");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder().setName("vshop").setDescription("Lihat dan beli item dari toko."),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
      if (!user) {
        return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun." });
      }

      const items = [
        { name: "🧪 Poison", price: 250, description: "Poison yang dapat meracuni musuh jika kamu dicuri." },
        { name: "🚓 Guard", price: 200, description: "Penjaga untuk melindungi diri dari pencuri." },
        { name: "🍪 Pet Food", price: 200, description: "Makanan untuk hewan peliharaan kamu." },
        { name: "💻 Laptop", price: 2000, description: "Laptop untuk meningkatkan kecepatan kerja." },
        { name: "🖥️ Desktop", price: 2000, description: "Desktop untuk meningkatkan kemungkinan berhasil hack." },
      ];

      // Beautiful new UI for the shop
      const embed = new EmbedBuilder()
        .setColor("#00B2FF")
        // .setTitle("🛒・Virtual Shop")
        .setDescription([
          `## 🛒・Virtual Shop\nSelamat datang di **Toko Virtual**!`,
          `Pilih item di bawah untuk dibeli dan tingkatkan pengalamanmu!`,
          "",
          `**Kamu punya:** 💵 \`${user.cash}\` uang`
        ].join("\n"))
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setImage("https://i.ibb.co/6bQ7QwK/shop-banner.png")
        .setTimestamp()
        .setFooter(embedFooter(interaction));

      items.forEach((item, idx) => {
        embed.addFields({
          name: `${item.name}  |  💵 ${item.price} uang`,
          value: [
            `> ${item.description}`,
            // `> **ID:** \`${item.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}\``,
            idx < items.length - 1 ? "‎" : "" // invisible char for spacing
          ].join("\n"),
          inline: false
        });
      });

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_item")
          .setPlaceholder("Pilih item untuk dibeli")
          .addOptions(
            items.map((item) => ({
              label: item.name,
              description: `Harga: ${item.price} uang`,
              value: item.name.toLowerCase(),
            }))
          )
      );

      await interaction.editReply({ embeds: [embed], components: [row] });

      const filter = (i) => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

      collector.on("collect", async (i) => {
        if (i.customId === "select_item") {
          await i.deferUpdate();
          const selectedItem = items.find((item) => item.name.toLowerCase() === i.values[0]);

          if (!selectedItem) return;

          if (user.cash < selectedItem.price) {
            await interaction.editReply({
              content: "kamu tidak memiliki uang yang cukup untuk membeli item ini.",
              embeds: [], // hapus embed
              components: [],
            });
            return;
          }

          const confirmRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("confirm_purchase").setLabel("Konfirmasi Pembelian").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("cancel_purchase").setLabel("Batal").setStyle(ButtonStyle.Danger)
          );

          await interaction.editReply({
            content: `kamu akan membeli **${selectedItem.name}** seharga **${selectedItem.price} uang**. Konfirmasi pembelian?`,
            embeds: [], // hapus embed
            components: [confirmRow],
          });

          const confirmationFilter = (btn) => btn.user.id === interaction.user.id;
          const confirmationCollector = interaction.channel.createMessageComponentCollector({ filter: confirmationFilter, time: 15000, max: 1 });

          confirmationCollector.on("collect", async (btn) => {
            await btn.deferUpdate();
            if (btn.customId === "confirm_purchase") {
              user.cash -= selectedItem.price;
              user.changed("cash", true);
              await user.saveAndUpdateCache("userId");

              await Inventory.create({
                guildId: user.guildId,
                userId: user.userId,
                itemName: selectedItem.name,
              });

              await interaction.editReply({
                content: `kamu berhasil membeli **${selectedItem.name}**!`,
                embeds: [], // hapus embed
                components: [],
              });
            } else if (btn.customId === "cancel_purchase") {
              await interaction.editReply({
                content: "Pembelian dibatalkan.",
                embeds: [], // hapus embed
                components: [],
              });
            }
          });

          confirmationCollector.on("end", () => {
            interaction.editReply({
              components: [],
            });
          });
        }
      });

      collector.on("end", () => {
        interaction.editReply({
          content: "Waktu habis. Silakan gunakan kembali perintah `/shop` untuk mengakses toko.",
          embeds: [], // hapus embed
          components: [],
        });
      });
    } catch (error) {
      console.error("Error during shop command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
