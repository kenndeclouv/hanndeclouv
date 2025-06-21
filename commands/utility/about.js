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
    // await interaction.sendTyping();
    await interaction.deferReply();

    try {
      const lang = (await getLang(interaction.guildId)) ?? "en";

      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`> <:kennmchead:1375315784456343572> ${t("ABOUT_TITLE", lang)}`)
        .setDescription(
          t("ABOUT_DESCRIPTION", lang, {
            botName: interaction.client.user.username,
            // ownerId: process.env.OWNER_ID,
            // userMention: interaction.member?.toString() || "kamuu",
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
        content: t("ABOUT_ERROR", lang),
        ephemeral: true,
      });
    }
  },
};
