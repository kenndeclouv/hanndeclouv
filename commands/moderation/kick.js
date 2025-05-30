const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkPermission } = require("../../helpers");
const BotSetting = require("../../database/models/BotSetting");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick user dari server.")
    .addUserOption((option) => option.setName("user").setDescription("User untuk dikick").setRequired(true)),
  adminOnly: true,
  async execute(interaction) {
    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({
        content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
        ephemeral: true,
      });
    }
    const setting = BotSetting.getCache({ guildId: interaction.guild.id });
    const user = interaction.options.getUser("user");

    if (!interaction.member.permissions.has("KICK_MEMBERS")) {
      return interaction.reply({ content: "Kamu tidak memiliki izin untuk mengeluarkan member.", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id);

    if (member) {
      await member.kick("Member dikeluarkan oleh command.");
      if (setting.modLogChannelId) {
        const modLogChannel = interaction.guild.channels.cache.get(setting.modLogChannelId);
        if (modLogChannel) {
          const modLogEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("> Mod Log: Member Kicked")
            .setDescription(`**Member:** ${user.tag}\n**Kicked by:** ${interaction.user.tag}`)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp()
            .setFooter({
              text: `Mod action by ${interaction.user.tag}`,
              iconURL: interaction.user.displayAvatarURL(),
            });

          modLogChannel.send({ embeds: [modLogEmbed] });
        }
      }
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> Member dikeluarkan")
        .setDescription(`**${user.tag}** telah dikeluarkan dari server oleh **${interaction.user.tag}** melalui command.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setTimestamp()
        .setFooter({ text: `Dikeluarkan oleh ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
      return interaction.reply({ embeds: [embed] });
    } else {
      return interaction.reply({ content: "User tidak ada di server ini!", ephemeral: true });
    }
  },
};
