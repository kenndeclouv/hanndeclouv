const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType, WebhookClient } = require("discord.js");
const fs = require("fs");
const path = require("path");
const BotSetting = require("../../database/models/BotSetting");
const { checkPermission } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Menampilkan daftar perintah bot dengan paginasi."),

  async execute(interaction) {
    try {
      const setting = await BotSetting.getCache({ guildId: interaction.guild.id });
      const commandFolders = fs.readdirSync(path.join(__dirname, ".."));

      const embeds = [];
      let totalCommands = 0;

      const homeEmbed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Selamat datang di menu bantuan bot!")
        .setDescription(`Bot ini menyediakan berbagai perintah. Gunakan tombol di bawah untuk melihat daftar perintah dalam setiap kategori.`)
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: "Klik tombol di bawah untuk melihat perintah dalam kategori ini",
          iconURL: interaction.client.user.displayAvatarURL(),
        });
      embeds.push(homeEmbed); // halaman beranda

      const settingMap = {
        giveaway: "giveawayOn",
        economy: "economyOn",
        ticket: "ticketOn",
        pet: "petOn",
        squad: "squadOn",
        adventure: "adventureOn",
        leveling: "levelingOn",
        invites: "invitesOn",
        suggestion: "suggestionOn",
        nsfw: "nsfwOn",
        checklist: "checklistOn",
      };

      for (const folder of commandFolders) {
        const settingKey = settingMap[folder.toLowerCase()];
        if (settingKey && !setting[settingKey]) continue;

        const folderPath = path.join(__dirname, "..", folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle(`> Kategori ${folder}`)
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setDescription(`Daftar perintah dalam kategori ${folder}`)
          .setFooter({
            text: "Klik tombol di bawah untuk melihat perintah dalam kategori ini",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

        let fieldCount = 0;

        for (const file of commandFiles) {
          const command = require(path.join(folderPath, file));
          if (command.adminOnly && !(await checkPermission(interaction.member))) continue;

          const options = command.data.options ?? [];

          // Command tanpa subcommand
          if (options.length === 0) {
            if (fieldCount < 25) {
              embed.addFields({
                name: `**\`/${command.data.name}\`**`,
                value: command.data.description || "Tidak ada deskripsi",
              });
              totalCommands++;
              fieldCount++;
            }
            continue;
          }

          for (const option of options) {
            if (option.type === ApplicationCommandOptionType.Subcommand) {
              if (fieldCount < 25) {
                embed.addFields({
                  name: `**\`/${command.data.name} ${option.name}\`**`,
                  value: `Subcommand: ${option.description || "Tidak ada deskripsi"}`,
                });
                totalCommands++;
                fieldCount++;
              }
            } else if (option.type === ApplicationCommandOptionType.SubcommandGroup && option.options) {
              for (const sub of option.options) {
                if (sub.type !== ApplicationCommandOptionType.Subcommand) continue;
                if (fieldCount < 25) {
                  embed.addFields({
                    name: `**\`/${command.data.name} ${option.name} ${sub.name}\`**`,
                    value: `Subcommand: ${sub.description || "Tidak ada deskripsi"}`,
                  });
                  totalCommands++;
                  fieldCount++;
                }
              }
            }
          }
        }

        if (fieldCount > 0) {
          embeds.push(embed); // push hanya jika ada perintah yg valid
        }
      }

      // update homeEmbed dengan totalCommand yang sudah fix
      embeds[0].setDescription(
        `Bot ini menyediakan berbagai perintah. Gunakan tombol di bawah untuk melihat daftar perintah dalam setiap kategori.\n\n**Total perintah: \`${totalCommands}\`**\n\n**Perintah yang tersedia:**`
      );

      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("previous").setLabel("<<").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("home").setLabel("Beranda").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("next").setLabel(">>").setStyle(ButtonStyle.Primary)
      );

      let currentPage = 0;
      const message = await interaction.reply({
        embeds: [embeds[currentPage]],
        ephemeral: true,
        components: [buttons],
        fetchReply: true,
      });

      const collector = message.createMessageComponentCollector({ time: 60000 });

      collector.on("collect", async (i) => {
        if (i.customId === "previous") {
          currentPage = (currentPage - 1 + embeds.length) % embeds.length;
        } else if (i.customId === "home") {
          currentPage = 0;
        } else if (i.customId === "next") {
          currentPage = (currentPage + 1) % embeds.length;
        }

        await i.update({ embeds: [embeds[currentPage]], components: [buttons] });
      });

      collector.on("end", async () => {
        buttons.components.forEach((btn) => btn.setDisabled(true));
        await interaction.editReply({ components: [buttons] });
      });
    } catch (error) {
      console.error("Error during /help command:", error);
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> ❌ Error command /help")
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({ text: `Error dari server ${interaction.guild.name}` })
        .setTimestamp();

      webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);
      return interaction.editReply({
        content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi.",
      });
    }
  },
};