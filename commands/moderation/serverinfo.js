const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { checkPermission, embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays information about the server."),
  adminOnly: true,
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });
    if (!(await checkPermission(interaction.member))) {
      return interaction.editReply({
        content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
        ephemeral: true,
      });
    }
    const guild = interaction.guild;

    // Define readable verification levels and explicit content filter levels
    const verificationLevels = {
      0: "🟢 None",
      1: "🟡 Low",
      2: "🟠 Medium",
      3: "🔴 High",
      4: "🛡️ Very High",
    };

    const explicitContentFilterLevels = {
      0: "❌ Disabled",
      1: "👤 Members without roles",
      2: "✅ All members",
    };

    // Emojis for fields
    const emojis = {
      name: "🏷️",
      region: "🌍",
      members: "👥",
      created: "📅",
      owner: "👑",
      description: "📝",
      verification: "🔒",
      boost: "🚀",
      boosts: "💎",
      afk: "💤",
      afkTimeout: "⏰",
      filter: "🛡️",
      roles: "🔖",
      emojis: "😃",
      stickers: "🏷️",
    };

    // Format creation date
    const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

    // Server banner or splash
    const bannerURL = guild.bannerURL({ size: 1024 });
    const splashURL = guild.splashURL({ size: 1024 });

    // Owner mention
    const ownerMention = guild.ownerId ? `<@${guild.ownerId}>` : "Unknown";

    // Buttons for invite and banner
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Server Icon")
        .setStyle(ButtonStyle.Link)
        .setURL(guild.iconURL({ size: 1024, dynamic: true }) || "https://discord.com"),
      ...(bannerURL
        ? [
          new ButtonBuilder()
            .setLabel("Server Banner")
            .setStyle(ButtonStyle.Link)
            .setURL(bannerURL),
        ]
        : []),
      ...(splashURL
        ? [
          new ButtonBuilder()
            .setLabel("Server Splash")
            .setStyle(ButtonStyle.Link)
            .setURL(splashURL),
        ]
        : [])
    );

    // Creating an embed for server information
    const serverInfoEmbed = new EmbedBuilder()
      .setColor("Random")
      // .setTitle(`> ${emojis.name} **${guild.name}**`)
      .setThumbnail(guild.iconURL({ size: 1024, dynamic: true }))
      .setDescription(
        [
          `## ${emojis.name} **${guild.name}**`,
          `${emojis.description} **Description:**\n${guild.description || "*No description available.*"}`,
          "",
          `${emojis.owner} **Owner:** ${ownerMention}`,
          `${emojis.created} **Created:** ${createdAt}`,
          `${emojis.region} **Region:** ${guild.preferredLocale}`,
          "",
          `${emojis.members} **Members:** \`${guild.memberCount}\``,
          `${emojis.roles} **Roles:** \`${guild.roles.cache.size}\``,
          `${emojis.emojis} **Emojis:** \`${guild.emojis.cache.size}\``,
          `${emojis.stickers} **Stickers:** \`${guild.stickers.cache.size}\``,
          "",
          `${emojis.verification} **Verification Level:** ${verificationLevels[guild.verificationLevel]}`,
          `${emojis.filter} **Explicit Content Filter:** ${explicitContentFilterLevels[guild.explicitContentFilter]}`,
          "",
          `${emojis.boost} **Boost Level:** \`${guild.premiumTier}\``,
          `${emojis.boosts} **Total Boosts:** \`${guild.premiumSubscriptionCount}\``,
          "",
          `${emojis.afk} **AFK Channel:** ${guild.afkChannel ? `<#${guild.afkChannel.id}>` : "None"}`,
          `${emojis.afkTimeout} **AFK Timeout:** \`${guild.afkTimeout / 60} minutes\``
        ].join("\n")
      )
      .setFooter(embedFooter(interaction))
      .setTimestamp();

    // Add banner image if available
    if (bannerURL) {
      serverInfoEmbed.setImage(bannerURL);
    } else if (splashURL) {
      serverInfoEmbed.setImage(splashURL);
    }

    return interaction.editReply({
      embeds: [serverInfoEmbed],
      components: [row],
    });
  },
};
