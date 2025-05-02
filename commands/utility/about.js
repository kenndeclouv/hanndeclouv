const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require("discord.js");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder().setName("about").setDescription("perkenalan singkat tentang bot ini 😋"),
  async execute(interaction) {
    await interaction.channel.sendTyping();

    try {
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle("> <:kennmchead:1364843655252410378> halooo! ")
        .setDescription(
          `haloo! Aku **${interaction.client.user.username}**\n` +
            `Ownerkuu ituu  <@${process.env.OWNER_ID}> dm diaa yakk kalo ada apaa apaa, atauu ajak collab :)\n\n` +
            `:date: birthdate\n` +
            `\`27/05/2022\`\n` +
            `:computer: owner\n` +
            `\`kenndeclouv\`\n` +
            `\n` +
            `${interaction.member ? interaction.member : "kamuu"} mau invite aku ke server kamu\n` +
            `   atau cek website ku? Klik tombol di bawah yaa~`
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: "terimakasii udah pake aku yaa 😋",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("🚀 Invite Bot")
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot+applications.commands`),
        new ButtonBuilder().setLabel("🌐 Website").setStyle(ButtonStyle.Link).setURL("https://kenndeclouv.my.id") // ganti ini sama web kamu yaa
      );

      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error("Error during about command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /about`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.reply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
