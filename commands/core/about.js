const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require("discord.js");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder().setName("about").setDescription("😋 A brief introduction about this bot"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setDescription(`## ${interaction.client.user.username} here!\nhaloo! Aku ${interaction.client.user.username}\nOwnerkuu ituu kenndeclouv dm diaa yakk kalo ada apaa apaa, atauu ajak collab :)\n\n:date: birthdate\n\`27 /05 / 2022\`\n:computer: owner\n\`kenndeclouv\`\n\nmau invite aku ke server kamu\n   atau cek website ku? Klik tombol di bawah yaa\n\n-# © all rights reserved`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter(embedFooter(interaction))
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("🚀 Invite Bot")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot+applications.commands`),
        new ButtonBuilder().setLabel("🌐 Website").setStyle(ButtonStyle.Link).setURL("https://kythia.my.id"),
        new ButtonBuilder().setLabel("👑 Owner Web").setStyle(ButtonStyle.Link).setURL("https://kenndeclouv.my.id")
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error("Error during about command execution:", error);

      const webhookClient = new WebhookClient({
        url: process.env.WEBHOOK_ERROR_LOGS,
      });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> ❌ Error command /about")
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
        .setTimestamp();

      webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);

      return interaction.editReply({
        content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi.",
        ephemeral: true,
      });
    }
  },
};
