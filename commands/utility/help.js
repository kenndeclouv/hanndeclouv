// const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType, WebhookClient } = require("discord.js");
// const fs = require("fs");
// const path = require("path");
// const BotSetting = require("../../database/models/BotSetting");
// const { checkPermission } = require("../../helpers");
// require("dotenv").config();

// module.exports = {
//   data: new SlashCommandBuilder().setName("help").setDescription("Menampilkan daftar perintah bot dengan paginasi."),

//   async execute(interaction) {
//     try {
//       const setting = await BotSetting.getCache({ guildId: interaction.guild.id });
//       if (!setting) {
//         return interaction.reply({ content: "❌ | Pengaturan bot tidak ditemukan.", ephemeral: true });
//       }

//       const commandFolders = fs.readdirSync(path.join(__dirname, ".."));
//       const embeds = [];
//       let totalCommands = 0;

//       // Embed Beranda
//       const homeEmbed = new EmbedBuilder()
//         .setColor("#0099ff")
//         .setTitle("Selamat datang di menu bantuan bot!")
//         .setDescription(`Bot ini menyediakan berbagai perintah. Gunakan tombol di bawah untuk melihat daftar perintah dalam setiap kategori.\n\n**Total perintah: \`0\`**\n\n**Perintah yang tersedia:**`)
//         .setThumbnail(interaction.client.user.displayAvatarURL())
//         .setFooter({
//           text: "Klik tombol di bawah untuk melihat perintah dalam kategori ini",
//           iconURL: interaction.client.user.displayAvatarURL(),
//         });
//       embeds.push(homeEmbed);

//       // Mapping lengkap semua fitur
//       const settingMap = {
//         antiinvite: "antiInviteOn",
//         antilink: "antiLinkOn",
//         antispam: "antiSpamOn",
//         antibadword: "antiBadwordOn",
//         serverstats: "serverStatsOn",
//         economy: "economyOn",
//         giveaway: "giveawayOn",
//         invites: "invitesOn",
//         suggestion: "suggestionOn",
//         ticket: "ticketOn",
//         pet: "petOn",
//         squad: "squadOn",
//         adventure: "adventureOn",
//         leveling: "levelingOn",
//         welcomein: "welcomeInOn",
//         welcomeout: "welcomeOutOn",
//         minecraftstats: "minecraftStatsOn",
//         nsfw: "nsfwOn",
//         checklist: "checklistOn",
//       };

//       // Loop setiap folder command
//       for (const folder of commandFolders) {
//         const folderKey = folder.toLowerCase();
//         const settingKey = settingMap[folderKey];

//         // Skip folder jika setting tidak aktif
//         if (settingKey && !setting[settingKey]) continue;

//         const folderPath = path.join(__dirname, "..", folder);
//         if (!fs.statSync(folderPath).isDirectory()) continue;

//         const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));
//         const embed = new EmbedBuilder().setColor("#0099ff").setTitle(`> Kategori ${folder}`).setThumbnail(interaction.client.user.displayAvatarURL()).setFooter({
//           text: "Klik tombol di bawah untuk melihat perintah dalam kategori ini",
//           iconURL: interaction.client.user.displayAvatarURL(),
//         });

//         let fieldCount = 0;
//         let categoryCommands = 0;

//         // Loop setiap file command
//         for (const file of commandFiles) {
//           const commandPath = path.join(folderPath, file);
//           const command = require(commandPath);

//           // Skip command admin jika tidak memiliki izin
//           if (command.adminOnly && !(await checkPermission(interaction.member))) continue;

//           if (!command.data?.name) continue;

//           // Handle subcommands
//           const subCommands = command.data.options?.filter((opt) => [ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(opt.type)) || [];

//           if (subCommands.length === 0) {
//             // Command biasa
//             if (fieldCount >= 25) continue;
//             embed.addFields({
//               name: `**\`/${command.data.name}\`**`,
//               value: command.data.description || "Tidak ada deskripsi",
//             });
//             totalCommands++;
//             categoryCommands++;
//             fieldCount++;
//           } else {
//             // Subcommands
//             for (const opt of subCommands) {
//               if (opt.type === ApplicationCommandOptionType.SubcommandGroup) {
//                 for (const sub of opt.options) {
//                   if (fieldCount >= 25) break;
//                   embed.addFields({
//                     name: `**\`/${command.data.name} ${opt.name} ${sub.name}\`**`,
//                     value: sub.description || "Tidak ada deskripsi",
//                   });
//                   totalCommands++;
//                   categoryCommands++;
//                   fieldCount++;
//                 }
//               } else {
//                 if (fieldCount >= 25) continue;
//                 embed.addFields({
//                   name: `**\`/${command.data.name} ${opt.name}\`**`,
//                   value: opt.description || "Tidak ada deskripsi",
//                 });
//                 totalCommands++;
//                 categoryCommands++;
//                 fieldCount++;
//               }
//             }
//           }
//         }

//         if (categoryCommands > 0) {
//           embed.setDescription(`Daftar perintah dalam kategori ${folder} (**${categoryCommands}** perintah)`);
//           embeds.push(embed);
//         }
//       }

//       // Update total commands di embed beranda
//       embeds[0].data.description = embeds[0].data.description.replace("Total perintah: `0`", `Total perintah: \`${totalCommands}\``);

//       // Navigasi tombol
//       const buttons = new ActionRowBuilder().addComponents(
//         new ButtonBuilder()
//           .setCustomId("previous")
//           .setLabel("<<")
//           .setStyle(ButtonStyle.Primary)
//           .setDisabled(embeds.length <= 1),
//         new ButtonBuilder()
//           .setCustomId("home")
//           .setLabel("Beranda")
//           .setStyle(ButtonStyle.Secondary)
//           .setDisabled(embeds.length <= 1),
//         new ButtonBuilder()
//           .setCustomId("next")
//           .setLabel(">>")
//           .setStyle(ButtonStyle.Primary)
//           .setDisabled(embeds.length <= 1)
//       );

//       let currentPage = 0;
//       const message = await interaction.reply({
//         embeds: [embeds[currentPage]],
//         components: [buttons],
//         ephemeral: true,
//         fetchReply: true,
//       });

//       // Collector interaksi
//       const collector = message.createMessageComponentCollector({ time: 60000 });

//       collector.on("collect", async (i) => {
//         if (i.user.id !== interaction.user.id) {
//           return i.reply({ content: "❌ | Ini bukan interaksi Anda!", ephemeral: true });
//         }

//         switch (i.customId) {
//           case "previous":
//             currentPage = (currentPage - 1 + embeds.length) % embeds.length;
//             break;
//           case "home":
//             currentPage = 0;
//             break;
//           case "next":
//             currentPage = (currentPage + 1) % embeds.length;
//             break;
//         }

//         await i.update({ embeds: [embeds[currentPage]] });
//       });

//       collector.on("end", () => {
//         interaction.editReply({ components: [] }).catch(() => {});
//       });
//     } catch (error) {
//       console.error("Error in /help command:", error);
//       const webhook = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
//       webhook
//         .send({
//           embeds: [
//             new EmbedBuilder()
//               .setTitle("❌ Error Command: /help")
//               .setDescription(`\`\`\`${error.stack}\`\`\``)
//               .addFields({ name: "User", value: `${interaction.user.tag} (${interaction.user.id})` }, { name: "Guild", value: `${interaction.guild.name} (${interaction.guild.id})` })
//               .setTimestamp(),
//           ],
//         })
//         .catch(console.error);

//       interaction.reply({
//         content: "❌ | Terjadi kesalahan saat menampilkan bantuan. Silakan coba lagi nanti.",
//         ephemeral: true,
//       });
//     }
//   },
// };

// const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType, WebhookClient } = require("discord.js");
// const fs = require("fs");
// const path = require("path");
// const BotSetting = require("../../database/models/BotSetting");
// const { checkPermission } = require("../../helpers");
// require("dotenv").config();

// module.exports = {
//   data: new SlashCommandBuilder().setName("help").setDescription("Menampilkan daftar perintah bot dengan paginasi."),

//   async execute(interaction) {
//     try {
//       const setting = await BotSetting.getCache({ guildId: interaction.guild.id });
//       if (!setting) return interaction.reply({ content: "❌ | Pengaturan bot tidak ditemukan.", ephemeral: true });

//       const commandFolders = fs.readdirSync(path.join(__dirname, ".."));
//       const embeds = [];
//       let totalCommands = 0;

//       // Embed Beranda
//       const homeEmbed = new EmbedBuilder()
//         .setColor("#0099ff")
//         .setTitle("📚 Menu Bantuan Bot")
//         .setDescription([`**Total Perintah:** \`0\``, `**Kategori Tersedia:** \`0\``, "\nGunakan tombol di bawah untuk navigasi kategori:"].join("\n"))
//         .setThumbnail(interaction.client.user.displayAvatarURL());
//       embeds.push(homeEmbed);

//       // Mapping lengkap semua fitur
//       const settingMap = {
//         antiinvite: "antiInviteOn",
//         antilink: "antiLinkOn",
//         antispam: "antiSpamOn",
//         antibadword: "antiBadwordOn",
//         serverstats: "serverStatsOn",
//         economy: "economyOn",
//         giveaway: "giveawayOn",
//         invites: "invitesOn",
//         suggestion: "suggestionOn",
//         ticket: "ticketOn",
//         pet: "petOn",
//         squad: "squadOn",
//         adventure: "adventureOn",
//         leveling: "levelingOn",
//         welcomein: "welcomeInOn",
//         welcomeout: "welcomeOutOn",
//         minecraftstats: "minecraftStatsOn",
//         nsfw: "nsfwOn",
//         checklist: "checklistOn",
//       };

//       // Proses setiap kategori
//       let totalCategories = 0;
//       for (const folder of commandFolders) {
//         const folderKey = folder.toLowerCase();
//         const settingKey = settingMap[folderKey];
//         if (settingKey && !setting[settingKey]) continue;

//         const folderPath = path.join(__dirname, "..", folder);
//         if (!fs.statSync(folderPath).isDirectory()) continue;

//         const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));
//         const categoryEmbed = new EmbedBuilder().setColor("#2b2d31").setTitle(`📂 Kategori: ${folder.toUpperCase()}`).setDescription(`**Perintah dalam kategori ini:**`);

//         let categoryCommands = 0;
//         const commandList = [];

//         // Proses setiap command
//         for (const file of commandFiles) {
//           const command = require(path.join(folderPath, file));
//           if (command.adminOnly && !(await checkPermission(interaction.member))) continue;
//           if (!command.data?.name) continue;

//           // Format command utama
//           let commandEntry = `\n\`🞲 /${command.data.name}\``;
//           if (command.data.description) commandEntry += ` - *${command.data.description}*`;

//           // Proses subcommands
//           const subCommands = command.data.options?.filter((opt) => [ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(opt.type)) || [];

//           // Jika ada subcommands
//           if (subCommands.length > 0) {
//             commandEntry += "\n┌──────────────────";

//             for (const opt of subCommands) {
//               // Subcommand Group
//               if (opt.type === ApplicationCommandOptionType.SubcommandGroup) {
//                 commandEntry += `\n├─ **${opt.name}**`;
//                 for (const sub of opt.options) {
//                   commandEntry += `\n├── \`/${command.data.name} ${opt.name} ${sub.name}\``;
//                   if (sub.description) commandEntry += ` - ${sub.description}`;
//                   totalCommands++;
//                   categoryCommands++;
//                 }
//               }
//               // Subcommand biasa
//               else {
//                 commandEntry += `\n├─ \`/${command.data.name} ${opt.name}\``;
//                 if (opt.description) commandEntry += ` - ${opt.description}`;
//                 totalCommands++;
//                 categoryCommands++;
//               }
//             }
//             commandEntry += "\n└──────────────────";
//           } else {
//             totalCommands++;
//             categoryCommands++;
//           }

//           commandList.push(commandEntry);
//         }

//         // Tambahkan ke embed jika ada perintah
//         if (commandList.length > 0) {
//           totalCategories++;
//           // Discord embed field values have a max length of 1024 characters.
//           // If the commandList.join("\n") is too long, split it into multiple fields.
//           const MAX_FIELD_LENGTH = 1024;
//           let joined = commandList.join("\n");
//           if (joined.length <= MAX_FIELD_LENGTH) {
//             categoryEmbed.addFields({
//               name: `📌 Total: ${categoryCommands} Perintah`,
//               value: joined,
//               inline: false,
//             });
//           } else {
//             // Split into chunks
//             let chunks = [];
//             let current = "";
//             for (const entry of commandList) {
//               if ((current + entry + "\n").length > MAX_FIELD_LENGTH) {
//                 chunks.push(current);
//                 current = "";
//               }
//               current += (current ? "\n" : "") + entry;
//             }
//             if (current) chunks.push(current);
//             // Add each chunk as a field
//             for (let idx = 0; idx < chunks.length; idx++) {
//               categoryEmbed.addFields({
//                 name: idx === 0 ? `📌 Total: ${categoryCommands} Perintah` : "\u200b",
//                 value: chunks[idx],
//                 inline: false,
//               });
//             }
//           }
//           embeds.push(categoryEmbed);
//         }
//       }

//       // Update embed beranda
//       // Replace only the first two "0" in the description with totalCommands and totalCategories
//       let desc = embeds[0].data.description;
//       let replaced = desc.replace("0", totalCommands.toString());
//       replaced = replaced.replace("0", totalCategories.toString());
//       embeds[0].setDescription(replaced);

//       // Navigasi tombol
//       const buttons = new ActionRowBuilder().addComponents(
//         new ButtonBuilder().setCustomId("previous").setLabel("◀").setStyle(ButtonStyle.Secondary),
//         new ButtonBuilder().setCustomId("home").setLabel("🏠 Beranda").setStyle(ButtonStyle.Primary),
//         new ButtonBuilder().setCustomId("next").setLabel("▶").setStyle(ButtonStyle.Secondary)
//       );

//       const message = await interaction.reply({
//         embeds: [embeds[0]],
//         components: [buttons],
//         ephemeral: true,
//         fetchReply: true,
//       });

//       // Collector interaksi
//       const collector = message.createMessageComponentCollector({ time: 120_000 });
//       let currentPage = 0;

//       collector.on("collect", async (i) => {
//         if (i.user.id !== interaction.user.id) {
//           return i.reply({ content: "❌ | Ini bukan interaksi Anda!", ephemeral: true });
//         }

//         switch (i.customId) {
//           case "previous":
//             currentPage = currentPage > 0 ? currentPage - 1 : embeds.length - 1;
//             break;
//           case "home":
//             currentPage = 0;
//             break;
//           case "next":
//             currentPage = currentPage < embeds.length - 1 ? currentPage + 1 : 0;
//             break;
//         }

//         await i.update({ embeds: [embeds[currentPage]] });
//       });

//       collector.on("end", () => {
//         message.edit({ components: [] }).catch(() => {});
//       });
//     } catch (error) {
//       console.error("Error in /help:", error);
//       new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS }).send({
//         embeds: [
//           new EmbedBuilder()
//             .setTitle("🚨 HELP COMMAND ERROR")
//             .setDescription(`\`\`\`${error.stack}\`\`\``)
//             .addFields({ name: "User", value: interaction.user.tag, inline: true }, { name: "Guild", value: interaction.guild.name, inline: true })
//             .setTimestamp(),
//         ],
//       });
//       interaction.reply({ content: "❌ Gagal menampilkan menu bantuan!", ephemeral: true });
//     }
//   },
// };
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ApplicationCommandOptionType, WebhookClient } = require("discord.js");
const fs = require("fs");
const path = require("path");
const BotSetting = require("../../database/models/BotSetting");
const { checkPermission } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Menampilkan daftar perintah bot dengan paginasi."),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      if (!interaction.guild) {
        const embed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle(`> <:kennmchead:1375315784456343572> hi there! need some help?`)
          .setDescription(
            `here's a list of what i can do for you!\n\n` +
              `**🛠️ general commands**\n` +
              `\`/help\` - show this help message\n` +
              `\`/about\` - learn more about me\n` +
              `\`/ping\` - check my response speed\n\n` +
              `**🎮 fun commands**\n` +
              `\`/hug\` - send a warm hug\n` +
              `\`/kiss\` - send a sweet kiss\n` +
              `\`/pat\` - gently pat someone\n\n` +
              `**🔒 moderation commands**\n` +
              `\`/mute\` - mute a member in voice\n` +
              `\`/unmute\` - unmute a member in voice\n` +
              `\`/ban\` - ban a member\n` +
              `\`/kick\` - kick a member\n\n` +
              `**⚙️ other features**\n` +
              `some commands might only be available in servers, not in dms!\n\n` +
              `want to invite me to your server? click the button below!`
          )
          .setThumbnail(interaction.client.user.displayAvatarURL())
          .setFooter({
            text: `thanks for using ${interaction.client.user.username}!`,
            iconURL: interaction.client.user.displayAvatarURL(),
          })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("🚀 Invite Bot")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot+applications.commands`),
          new ButtonBuilder().setLabel("🌐 Website").setStyle(ButtonStyle.Link).setURL("https://kenndeclouv.my.id")
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
      } else if (interaction.guild) {
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
        embeds.push(homeEmbed);

        // Mapping lengkap semua fitur
        const settingMap = {
          antiinvite: "antiInviteOn",
          antilink: "antiLinkOn",
          antispam: "antiSpamOn",
          antibadword: "antiBadwordOn",
          serverstats: "serverStatsOn",
          economy: "economyOn",
          giveaway: "giveawayOn",
          invites: "invitesOn",
          suggestion: "suggestionOn",
          ticket: "ticketOn",
          pet: "petOn",
          clan: "clanOn",
          adventure: "adventureOn",
          leveling: "levelingOn",
          welcomein: "welcomeInOn",
          welcomeout: "welcomeOutOn",
          minecraftstats: "minecraftStatsOn",
          nsfw: "nsfwOn",
          checklist: "checklistOn",
        };

        for (const folder of commandFolders) {
          const settingKey = settingMap[folder.toLowerCase()];
          if (settingKey && !setting[settingKey]) continue;

          const folderPath = path.join(__dirname, "..", folder);
          if (!fs.statSync(folderPath).isDirectory()) continue;

          const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith(".js"));
          const embed = new EmbedBuilder().setColor("#0099ff").setTitle(`> Kategori ${folder}`).setThumbnail(interaction.client.user.displayAvatarURL()).setFooter({
            text: "Klik tombol di bawah untuk melihat perintah dalam kategori ini",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

          let fieldCount = 0;

          for (const file of commandFiles) {
            const command = require(path.join(folderPath, file));

            // Handle command data yang berbentuk function atau object
            let cmdData;
            try {
              cmdData = typeof command.data === "function" ? command.data.toJSON() : command.data;
            } catch (error) {
              console.error(`Error processing command ${file}:`, error);
              continue;
            }

            if (!cmdData?.name) continue;
            if (command.adminOnly && !(await checkPermission(interaction.member))) continue;

            // Proses command utama (jika tidak ada subcommand)
            const options = cmdData.options || [];
            const hasSubcommands = options.some((opt) => [ApplicationCommandOptionType.Subcommand, ApplicationCommandOptionType.SubcommandGroup].includes(opt.type));

            // Jika tidak ada subcommand, tambahkan command utama
            if (!hasSubcommands && fieldCount < 25) {
              embed.addFields({
                name: `**\`/${cmdData.name}\`**`,
                value: cmdData.description || "Tidak ada deskripsi",
              });
              totalCommands++;
              fieldCount++;
            }

            // Proses subcommands
            for (const option of options) {
              if (option.type === ApplicationCommandOptionType.Subcommand) {
                if (fieldCount < 25) {
                  embed.addFields({
                    name: `**\`/${cmdData.name} ${option.name}\`**`,
                    value: option.description || "Tidak ada deskripsi",
                  });
                  totalCommands++;
                  fieldCount++;
                }
              } else if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
                for (const sub of option.options || []) {
                  if (sub.type === ApplicationCommandOptionType.Subcommand && fieldCount < 25) {
                    embed.addFields({
                      name: `**\`/${cmdData.name} ${option.name} ${sub.name}\`**`,
                      value: sub.description || "Tidak ada deskripsi",
                    });
                    totalCommands++;
                    fieldCount++;
                  }
                }
              }
            }
          }

          if (fieldCount > 0) {
            embeds.push(embed);
          }
        }

        // Update deskripsi home embed
        embeds[0].setDescription(
          `Bot ini menyediakan berbagai perintah. Gunakan tombol di bawah untuk melihat daftar perintah dalam setiap kategori.\n\n` + `**Total perintah: \`${totalCommands}\`**\n\n**Perintah yang tersedia:**`
        );

        // Navigasi tombol
        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("<<")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(embeds.length <= 1),
          new ButtonBuilder()
            .setCustomId("home")
            .setLabel("Beranda")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(embeds.length <= 1),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel(">>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(embeds.length <= 1)
        );

        let currentPage = 0;
        const message = await interaction.reply({
          embeds: [embeds[currentPage]],
          components: [buttons],
          fetchReply: true,
        });

        // Collector interaksi
        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on("collect", async (i) => {
          // if (i.user.id !== interaction.user.id) {
          //   return i.reply({ content: "❌ | Ini bukan interaksi Anda!", ephemeral: true });
          // }

          switch (i.customId) {
            case "previous":
              currentPage = (currentPage - 1 + embeds.length) % embeds.length;
              break;
            case "home":
              currentPage = 0;
              break;
            case "next":
              currentPage = (currentPage + 1) % embeds.length;
              break;
          }

          await i.update({ embeds: [embeds[currentPage]] });
        });

        collector.on("end", () => {
          interaction.editReply({ components: [] }).catch(() => {});
        });
      }
    } catch (error) {
      console.error("Error in /help command:", error);
      const webhook = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
      webhook
        .send({
          embeds: [
            new EmbedBuilder()
              .setTitle("❌ Error Command: /help")
              .setDescription(`\`\`\`${error.stack}\`\`\``)
              .addFields(
                { name: "User", value: `${interaction.user.tag} (${interaction.user.id})` },
                ...(interaction.guild ? [{ name: "Guild", value: `${interaction.guild.name} (${interaction.guild.id})` }] : [])
              )
              .setTimestamp(),
          ],
        })
        .catch(console.error);

      interaction.editReply({
        content: "❌ | Terjadi kesalahan saat menampilkan bantuan. Silakan coba lagi nanti.",
        ephemeral: true,
      });
    }
  },
};
