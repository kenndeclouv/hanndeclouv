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
const { embedFooter } = require("../../helpers");
require("dotenv").config();

// Simpan collector per pengguna
const userCollectors = new Map();

// Tambahkan folder yang ingin dikecualikan dari daftar help
const EXCLUDED_FOLDERS = ["core", "premium"];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Menampilkan daftar perintah bot dengan detail super lengkap."),

  async execute(interaction) {
    await interaction.deferReply();
    try {
      const slashCommandFolders = fs.readdirSync(path.join(__dirname, ".."));

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
        const filePath = path.join(__dirname, "../../docs/commands", `${category}.md`);
        if (!fs.existsSync(filePath)) return ['📂 Dokumentasi belum tersedia untuk kategori ini.'];

        let content = fs.readFileSync(filePath, "utf-8");
        return smartSplit(content, maxEmbedLength);
      }

      for (const folder of slashCommandFolders) {
        // Lewati folder yang ada di daftar pengecualian
        if (EXCLUDED_FOLDERS.includes(folder)) continue;

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
        .setColor("Blue")
        // .setTitle("> 🤖 **Bot Help Center**")
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(
          `## Kythia help you\n👋 **Selamat datang di pusat bantuan bot!**\n### 🔎 **Tips Cepat:**
      • Pilih kategori di bawah untuk melihat daftar perintah beserta penjelasannya.
      • Klik nama perintah untuk detail lebih lanjut (jika ada).
      • Gunakan \`/\` di chat untuk auto-complete perintah.
      • Kamu bisa menggunakan prefix \`k.\` atau \`!\` di chat untuk message command (still in development).
      
      ### 📊 **Statistik:**
      • Total kategori: **${categories.length}**
      • Total perintah: **${totalCommands}**
      
      ### 🆘 **Butuh bantuan lebih lanjut?**
      • Join support server: [Klik di sini](https://discord.gg/HmUTjbAhGu)
      • Atau mention admin server.
      
      ✨ **Selamat menjelajah fitur bot!**\n\n-# Pilih kategori di bawah ini untuk melihat dokumentasi lengkap setiap perintah.`
        )
        // .addFields({ name: "📂 Cara Menggunakan", value: "Pilih kategori di bawah ini untuk melihat dokumentasi lengkap setiap perintah." })
        .setFooter(embedFooter(interaction));

      const selectMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Pilih kategori perintah")
          .addOptions(categories)
      );
      const message = await interaction.editReply({
        embeds: [homeEmbed],
        components: [selectMenu]
      });

      const client = interaction.client;

      // Hentikan collector lama jika ada
      if (userCollectors.has(interaction.user.id)) {
        const oldCollector = userCollectors.get(interaction.user.id);
        oldCollector.stop();
        userCollectors.delete(interaction.user.id);
      }

      // Buat collector TANPA batas waktu
      const collector = message.createMessageComponentCollector();
      const pageState = {};

      // Simpan collector baru
      userCollectors.set(interaction.user.id, collector);

      // Tangani penghapusan pesan
      const deleteListener = (deletedMessage) => {
        if (deletedMessage.id === message.id) {
          collector.stop();
        }
      };
      client.on('messageDelete', deleteListener);

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
            new ButtonBuilder().setCustomId("prev_page").setLabel("◀️").setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId("next_page").setLabel("▶️").setStyle(ButtonStyle.Secondary).setDisabled(page === pages[category].length - 1)
          );

          await i.update({ embeds: [embed], components: [selectMenu, buttonRow] });
        }
      });

      collector.on("end", (_, reason) => {
        // Hapus listener penghapusan pesan
        client.off('messageDelete', deleteListener);

        // Hapus dari map jika masih terkait
        if (userCollectors.get(interaction.user.id) === collector) {
          userCollectors.delete(interaction.user.id);
        }

        // Nonaktifkan komponen jika pesan masih ada
        message.edit({ components: [] }).catch(() => { });
      });

    } catch (error) {
      // ... [kode error handling sebelumnya] ...
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