// const {
//   SlashCommandBuilder,
//   ActionRowBuilder,
//   StringSelectMenuBuilder,
//   EmbedBuilder,
//   WebhookClient,
// } = require("discord.js");
// const fs = require("fs");
// const path = require("path");
// require("dotenv").config();

// module.exports = {
//   data: new SlashCommandBuilder()
//     .setName("help")
//     .setDescription("Menampilkan daftar perintah bot dengan detail super lengkap."),

//   async execute(interaction) {
//     await interaction.deferReply();
//     try {
//       // ambil folder command
//       const commandFolders = fs.readdirSync(path.join(__dirname, ".."));

//       const categories = [];
//       const embeds = {};
//       let totalCommands = 0;

//       const maxEmbedLength = 4096;

//       function getMarkdownContent(category) {
//         const filePath = path.join(__dirname, "../../docs", `${category}.md`);
//         if (!fs.existsSync(filePath)) return '📂 Dokumentasi belum tersedia untuk kategori ini.';

//         let content = fs.readFileSync(filePath, "utf-8");

//         // Potong kalau lebih dari 4096 karakter
//         if (content.length > maxEmbedLength) {
//           content = content.substring(0, maxEmbedLength - 50) + '\n\n📄 Konten terlalu panjang, sebagian terpotong...';
//         }

//         return content;
//       }

//       // looping semua folder command
//       for (const folder of commandFolders) {
//         const folderPath = path.join(__dirname, "..", folder);
//         if (!fs.statSync(folderPath).isDirectory()) continue;

//         const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

//         if (commandFiles.length > 0) {
//           categories.push({ label: folder, value: folder });
//           totalCommands += commandFiles.length;

//           const markdownContent = getMarkdownContent(folder);

//           embeds[folder] = new EmbedBuilder()
//             .setColor("Blue")
//             // .setTitle(`📂 Kategori: ${folder}`)
//             .setTitle(" ")
//             .setThumbnail(interaction.client.user.displayAvatarURL())
//             .setDescription(`${markdownContent}`) // pastiin ini string dan udah dipotong
//             .setFooter({
//               text: `Gunakan select menu untuk memilih kategori lain.`,
//               iconURL: interaction.client.user.displayAvatarURL(),
//             });

//         }
//       }

//       // buat embed home
//       const homeEmbed = new EmbedBuilder()
//         .setColor("#5865F2")
//         .setTitle("> 🤖 **Bot Help Center**")
//         .setThumbnail(interaction.client.user.displayAvatarURL())
//         .setDescription(
//           `👋 **Selamat datang di pusat bantuan bot!**\n
// 🔎 **Tips Cepat:**
// • Pilih kategori di bawah untuk melihat daftar perintah beserta penjelasannya.
// • Klik nama perintah untuk detail lebih lanjut (jika tersedia).
// • Gunakan \`/\` di chat untuk auto-complete perintah.

// 📊 **Statistik:**
// > Total kategori: **${categories.length}**
// > Total perintah: **${totalCommands}**

// 🆘 **Butuh bantuan lebih lanjut?**
// • Join support server: [Klik di sini](https://discord.gg/syGqdtsN)
// • Atau mention admin server.

// ✨ **Selamat menjelajah fitur bot!**`
//         )
//         .addFields(
//           { name: "📂 Cara Menggunakan", value: "Pilih kategori di bawah ini untuk melihat dokumentasi lengkap setiap perintah." }
//         )
//         .setFooter({
//           text: `Powered by ${interaction.client.user.username} • Pilih kategori di bawah ini`,
//           iconURL: interaction.client.user.displayAvatarURL(),
//         });

//       // buat select menu
//       const selectMenu = new ActionRowBuilder().addComponents(
//         new StringSelectMenuBuilder()
//           .setCustomId("help-menu")
//           .setPlaceholder("Pilih kategori perintah")
//           .addOptions(categories)
//       );

//       const message = await interaction.editReply({ embeds: [homeEmbed], components: [selectMenu] });

//       const collector = message.createMessageComponentCollector({ time: 60000 });

//       collector.on("collect", async (i) => {
//         if (i.user.id !== interaction.user.id) {
//           return i.reply({ content: "❌ | Ini bukan interaksi Anda!", ephemeral: true });
//         }

//         const selectedCategory = i.values[0];
//         await i.update({ embeds: [embeds[selectedCategory]], components: [selectMenu] });
//       });

//       collector.on("end", () => {
//         interaction.editReply({ components: [] }).catch(() => { });
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
//               .addFields(
//                 { name: "User", value: `${interaction.user.tag} (${interaction.user.id})` },
//                 ...(interaction.guild ? [{ name: "Guild", value: `${interaction.guild.name} (${interaction.guild.id})` }] : [])
//               )
//               .setTimestamp(),
//           ],
//         })
//         .catch(console.error);

//       interaction.editReply({
//         content: "❌ | Terjadi kesalahan saat menampilkan bantuan. Silakan coba lagi nanti.",
//         ephemeral: true,
//       });
//     }
//   },
// };
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  WebhookClient,
} = require("discord.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Menampilkan daftar perintah bot dengan detail super lengkap."),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const commandFolders = fs.readdirSync(path.join(__dirname, ".."));

      const categories = [];
      const pages = {};
      let totalCommands = 0;

      function smartSplit(content, maxLength = 4000) {
        const chunks = [];
        let remaining = content;

        while (remaining.length > maxLength) {
          // Cari posisi newline terdekat sebelum maxLength
          let splitIndex = remaining.lastIndexOf('\n', maxLength);
          if (splitIndex === -1) splitIndex = remaining.lastIndexOf(' ', maxLength);
          if (splitIndex === -1) splitIndex = maxLength;

          // Pastikan ngga motong di tengah block code
          const currentChunk = remaining.substring(0, splitIndex);
          const openCodeBlocks = (currentChunk.match(/`/g) || []).length;

          if (openCodeBlocks % 2 !== 0) {
            // Kalau block code belum ketutup, cari penutup berikutnya
            const nextClose = remaining.indexOf('`', splitIndex);
            if (nextClose !== -1 && nextClose - splitIndex <= maxLength - splitIndex) {
              splitIndex = nextClose + 1; // Include penutup `
            }
          }

          chunks.push(remaining.substring(0, splitIndex).trim());
          remaining = remaining.substring(splitIndex).trim();
        }

        if (remaining.length > 0) chunks.push(remaining);

        return chunks;
      }


      const maxEmbedLength = 4000;

      function splitContent(content, maxLength = 4000) {
        const chunks = [];
        for (let i = 0; i < content.length; i += maxLength) {
          chunks.push(content.substring(i, i + maxLength));
        }
        return chunks;
      }

      function getMarkdownContent(category) {
        const filePath = path.join(__dirname, "../../docs", `${category}.md`);
        if (!fs.existsSync(filePath)) return ['📂 Dokumentasi belum tersedia untuk kategori ini.'];

        let content = fs.readFileSync(filePath, "utf-8");
        return smartSplit(content, maxEmbedLength);
      }

      for (const folder of commandFolders) {
        const folderPath = path.join(__dirname, "..", folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

        if (commandFiles.length > 0) {
          categories.push({ label: folder, value: folder });
          totalCommands += commandFiles.length;

          const markdownPages = getMarkdownContent(folder);

          pages[folder] = markdownPages;
        }
      }

      const homeEmbed = new EmbedBuilder()
        .setColor("#5865F2")
        .setTitle("> 🤖 **Bot Help Center**")
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(
          `👋 **Selamat datang di pusat bantuan bot!**\n
🔎 **Tips Cepat:**
• Pilih kategori di bawah untuk melihat daftar perintah beserta penjelasannya.
• Klik nama perintah untuk detail lebih lanjut (jika tersedia).
• Gunakan \`/\` di chat untuk auto-complete perintah.

📊 **Statistik:**
> Total kategori: **${categories.length}**
> Total perintah: **${totalCommands}**

🆘 **Butuh bantuan lebih lanjut?**
• Join support server: [Klik di sini](https://discord.gg/syGqdtsN)
• Atau mention admin server.

✨ **Selamat menjelajah fitur bot!**`
        )
        .addFields({ name: "📂 Cara Menggunakan", value: "Pilih kategori di bawah ini untuk melihat dokumentasi lengkap setiap perintah." })
        .setFooter({
          text: `Powered by ${interaction.client.user.username} • Pilih kategori di bawah ini`,
          iconURL: interaction.client.user.displayAvatarURL(),
        });

      const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Pilih kategori perintah")
          .addOptions(categories)
      );

      const message = await interaction.editReply({ embeds: [homeEmbed], components: [selectMenu] });

      const collector = message.createMessageComponentCollector({ time: 60000 });

      const pageState = {};

      collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: "❌ | Ini bukan interaksi Anda!", ephemeral: true });
        }

        if (i.isStringSelectMenu()) {
          const selectedCategory = i.values[0];
          pageState[i.user.id] = { category: selectedCategory, page: 0 };

          const embed = new EmbedBuilder()
            .setColor("Blue")
            // .setTitle(`📂 Kategori: ${selectedCategory}`)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription(pages[selectedCategory][0])
            .setFooter({
              text: `Halaman 1 dari ${pages[selectedCategory].length}`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("prev_page").setLabel("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(true),
            new ButtonBuilder().setCustomId("next_page").setLabel("⏭️").setStyle(ButtonStyle.Secondary).setDisabled(pages[selectedCategory].length <= 1)
          );

          await i.update({ embeds: [embed], components: [selectMenu, buttonRow] });
        }

        if (i.isButton()) {
          const state = pageState[i.user.id];
          if (!state) return i.reply({ content: "❌ | Tidak ada kategori yang sedang dipilih.", ephemeral: true });

          const { category } = state;
          let { page } = state;

          if (i.customId === "prev_page") page--;
          if (i.customId === "next_page") page++;

          if (page < 0) page = 0;
          if (page >= pages[category].length) page = pages[category].length - 1;

          pageState[i.user.id].page = page;

          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`📂 Kategori: ${category}`)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setDescription(pages[category][page])
            .setFooter({
              text: `Halaman ${page + 1} dari ${pages[category].length}`,
              iconURL: interaction.client.user.displayAvatarURL(),
            });

          const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("prev_page").setLabel("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId("next_page").setLabel("⏭️").setStyle(ButtonStyle.Secondary).setDisabled(page === pages[category].length - 1)
          );

          await i.update({ embeds: [embed], components: [selectMenu, buttonRow] });
        }
      });

      collector.on("end", () => {
        interaction.editReply({ components: [] }).catch(() => { });
      });
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
