// const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require("discord.js");
// require("dotenv").config();
// module.exports = {
//   data: new SlashCommandBuilder().setName("about").setDescription("perkenalan singkat tentang bot ini 😋"),
//   async execute(interaction) {
//     await interaction.channel.sendTyping();

//     try {
//       const embed = new EmbedBuilder()
//         .setColor("Blue")
//         .setTitle("> <:kennmchead:1364843655252410378> halooo! ")
//         .setDescription(
//           `haloo! Aku **${interaction.client.user.username}**\n` +
//             `Ownerkuu ituu  <@${process.env.OWNER_ID}> dm diaa yakk kalo ada apaa apaa, atauu ajak collab :)\n\n` +
//             `:date: birthdate\n` +
//             `\`27/05/2022\`\n` +
//             `:computer: owner\n` +
//             `\`kenndeclouv\`\n` +
//             `\n` +
//             `${interaction.member ? interaction.member : "kamuu"} mau invite aku ke server kamu\n` +
//             `   atau cek website ku? Klik tombol di bawah yaa~`
//         )
//         .setThumbnail(interaction.client.user.displayAvatarURL())
//         .setFooter({
//           text: "terimakasii udah pake aku yaa 😋",
//           iconURL: interaction.client.user.displayAvatarURL(),
//         })
//         .setTimestamp();

//       const row = new ActionRowBuilder().addComponents(
//         new ButtonBuilder()
//           .setLabel("🚀 Invite Bot")
//           .setStyle(ButtonStyle.Link)
//           .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot+applications.commands`),
//         new ButtonBuilder().setLabel("🌐 Website").setStyle(ButtonStyle.Link).setURL("https://kenndeclouv.my.id") // ganti ini sama web kamu yaa
//       );

//       await interaction.reply({ embeds: [embed], components: [row] });
//     } catch (error) {
//       console.error("Error during about command execution:", error);
//       // Send DM to owner about the error
//       const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

//       const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /about`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

//       // Kirim ke webhook
//       webhookClient
//         .send({
//           embeds: [errorEmbed],
//         })
//         .catch(console.error);
//       return interaction.reply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
//     }
//   },
// };
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require("discord.js");
const BotSetting = require("../../database/models/BotSetting");
require("dotenv").config();

const { t } = require("../../helpers");
const getLang = async (guildId) => {
  const setting = await BotSetting.getCache({ guildId: guildId });
  return setting?.lang;
};

module.exports = {
  data: new SlashCommandBuilder().setName("about").setDescription("😋 A brief introduction about this bot"),

  async execute(interaction) {
    await interaction.channel.sendTyping();

    try {
      const lang = await getLang(interaction.guildId);

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`> <:kennmchead:1364843655252410378> ${t("ABOUT_TITLE", lang)}`)
        .setDescription(
          t("ABOUT_DESCRIPTION", lang, {
            botName: interaction.client.user.username,
            ownerId: process.env.OWNER_ID,
            userMention: interaction.member?.toString() || "kamuu",
          })
        )
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: t("ABOUT_FOOTER", lang),
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(t("ABOUT_INVITE_BUTTON", lang))
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot+applications.commands`),
        new ButtonBuilder().setLabel(t("ABOUT_WEBSITE_BUTTON", lang)).setStyle(ButtonStyle.Link).setURL("https://kenndeclouv.my.id")
      );

      await interaction.reply({ embeds: [embed], components: [row] });
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

      return interaction.reply({
        content: t("ABOUT_ERROR", lang),
        ephemeral: true,
      });
    }
  },
};
