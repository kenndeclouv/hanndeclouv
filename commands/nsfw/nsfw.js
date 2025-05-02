const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, WebhookClient } = require("discord.js");
const axios = require("axios");
const User = require("../../database/models/User");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("nsfw")
    .setDescription("kirim konten nsfw random (hanya di channel nsfw)")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("kategori konten")
        .setRequired(true)
        .addChoices(
          { name: "hass", value: "hass" },
          { name: "hmidriff", value: "hmidriff" },
          { name: "pgif", value: "pgif" },
          { name: "4k", value: "4k" },
          { name: "hentai", value: "hentai" },
          { name: "holo", value: "holo" },
          { name: "hneko", value: "hneko" },
          { name: "neko", value: "neko" },
          { name: "hkitsune", value: "hkitsune" },
          { name: "kemonomimi", value: "kemonomimi" },
          { name: "anal", value: "anal" },
          { name: "hanal", value: "hanal" },
          { name: "gonewild", value: "gonewild" },
          { name: "kanna", value: "kanna" },
          { name: "ass", value: "ass" },
          { name: "pussy", value: "pussy" },
          { name: "thigh", value: "thigh" },
          { name: "hthigh", value: "hthigh" },
          { name: "coffee", value: "coffee" },
          { name: "food", value: "food" },
          { name: "paizuri", value: "paizuri" },
          { name: "tentacle", value: "tentacle" },
          { name: "boobs", value: "boobs" },
          { name: "hboobs", value: "hboobs" },
          { name: "yaoi", value: "yaoi" }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Ambil user dari database (pakai findOne supaya bisa update nsfwCount)
      let user = await User.findOne({ where: { userId: interaction.user.id } });
      if (!user) {
        user = await User.create({ userId: interaction.user.id });
      }

      const channel = interaction.channel;
      const isDM = !channel || channel.type === ChannelType.DM;

      if (!isDM && !channel.nsfw) {
        return interaction.reply({
          content: "command ini hanya bisa dipakai di channel nsfw 😭",
          ephemeral: true,
        });
      }

      const category = interaction.options.getString("category");

      const fetchContent = async () => {
        const url = `https://nekobot.xyz/api/image?type=${category}`;
        const res = await axios.get(url);
        const data = res.data;

        if (!data || !data.message) throw new Error("gagal ambil data 😭");
        return data.message;
      };

      const buildButton = (disabled = false) =>
        new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`refresh_${category}`).setLabel("🔁 liat yang lain").setStyle(ButtonStyle.Primary).setDisabled(disabled));

      const sendContent = async () => {
        // Tambahkan 1 ke nsfwCount setiap kali request
        user.nsfwCount = (user.nsfwCount || 0) + 1;
        await user.save();

        const img = await fetchContent();

        const embed = new EmbedBuilder()
          .setColor("Random")
          .setTitle(`${category}`)
          .setImage(img)
          .setFooter({ text: `category: ${category}` });

        const row = buildButton();
        await interaction.editReply({
          embeds: [embed],
          components: [row],
        });
      };

      await sendContent();

      const waitForRefresh = async () => {
        try {
          const i = await interaction.channel.awaitMessageComponent({
            filter: (btnInt) => btnInt.customId === `refresh_${category}` && btnInt.user.id === interaction.user.id,
            time: 60000,
          });

          await i.deferUpdate();
          await sendContent();
          await waitForRefresh(); // biar tombolnya bisa dipencet terus selama 1 menit
        } catch (err) {
          const disabledRow = buildButton(true);
          interaction.editReply({ components: [disabledRow] }).catch(() => {});
        }
      };

      await waitForRefresh();
    } catch (error) {
      console.error("Error during nsfw command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /nsfw`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

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
