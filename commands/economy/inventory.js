const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const Inventory = require("../../database/models/Inventory");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder().setName("inventory").setDescription("Lihat semua item di inventaris kamu."),
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

      const inventoryItems = await Inventory.getAllCache({ userId: user.userId });

      if (inventoryItems.length === 0) {
        return interaction.editReply({ content: "Inventaris kamu kosong." });
      }

      const itemCounts = inventoryItems.reduce((acc, item) => {
        acc[item.itemName] = (acc[item.itemName] || 0) + 1;
        return acc;
      }, {});

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setDescription("## 🎒 Inventori kamu")
        .setDescription("Item yang kamu miliki:")
        .setTimestamp()
        .setFooter(embedFooter(interaction));

      Object.entries(itemCounts).forEach(([itemName, count]) => {
        embed.addFields({ name: `${itemName} (${count})`, value: `kamu memiliki item ini sebanyak ${count} barang`, inline: true });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during inventory command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
