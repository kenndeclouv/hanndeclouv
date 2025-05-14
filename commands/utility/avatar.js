const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, WebhookClient } = require("discord.js");
require("dotenv").config();

const { t } = require("../../helpers");
const getLang = async (guildId) => {
  // TODO: Replace with DB lookup if needed
  return "id";
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("🖼️ User's avatar")
    .addUserOption((option) => option.setName("user").setDescription("User ").setRequired(false)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const lang = await getLang(interaction.guildId);

      const user = interaction.options.getUser("user") || interaction.user;
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
      const embed = new EmbedBuilder()
        .setColor("Random")
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setDescription(`[Download Avatar](${avatarURL})`)
        .setImage(avatarURL)
        .setFooter({ text: t("AVATAR_FOOTER", lang) })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error during avatar command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /avatar`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
        .setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.editReply({ content: t("ERROR", lang) });
    }
  },
};
