const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("🖼️ User's avatar")
    .addUserOption((option) => option.setName("user").setDescription("User yang ingin dilihat avatarnya").setRequired(false)),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const user = interaction.options.getUser("user") || interaction.user;
      const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
      const embed = new EmbedBuilder()
        .setColor("Blue")
        .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
        .setDescription(`[Download Avatar](${avatarURL})`)
        .setImage(avatarURL)
        .setFooter(embedFooter(interaction))
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
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
