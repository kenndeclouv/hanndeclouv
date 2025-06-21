const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const Suggestion = require("../../database/models/Suggestion");
const { checkPermission } = require("../../helpers");
const { Sequelize } = require("sequelize");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("suggestion")
    .setDescription("Suggestion commands")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Setup suggestion channel")
        .addChannelOption((option) => option.setName("channel").setDescription("Channel for suggestions").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("accept")
        .setDescription("Accept a suggestion")
        .addStringOption((option) => option.setName("message_id").setDescription("Message ID of the suggestion").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("decline")
        .setDescription("Decline a suggestion")
        .addStringOption((option) => option.setName("message_id").setDescription("Message ID of the suggestion").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("send")
        .setDescription("Kirimkan saranmu!")
        .addStringOption((option) => option.setName("saran").setDescription("Isi sarannya").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("Tampilkan semua saran")),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply({ ephemeral: true });
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;

      if (subcommand === "setup") {
        if (!(await checkPermission(interaction.member))) {
          return interaction.editReply({
            content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
            ephemeral: true,
          });
        }

        const channel = interaction.options.getChannel("channel");
        let suggestionSetup = await Suggestion.findOne({ where: { guildId: guildId } });

        if (!suggestionSetup) {
          suggestionSetup = new Suggestion({ guildId, channelId: channel.id });
          await suggestionSetup.save();
        } else {
          suggestionSetup.channelId = channel.id;
          await suggestionSetup.save();
        }

        // kirim embed panduan
        const guideEmbed = new EmbedBuilder()
          .setColor("Blue")
          .setTitle("📢 Panduan Mengirim Saran")
          .setDescription(
            `halo @everyone 🥰\n\nuntuk mengirimkan saran, tinggal kirim pesannya di channel ini atau pakai command \`/suggestion send\`!\n\n> 💡 tips:\n- sopan dan jelas\n- sertakan alasan kalau perlu\n- jangan toxic yaa 🥺\n\nterima kasih untuk kontribusinyaa 💕`
          )
          .setFooter({ text: "system suggestion" })
          .setTimestamp();

        await channel.send({ content: "@everyone", embeds: [guideEmbed] });
        return interaction.editReply(`✅ | Channel saran berhasil ${suggestionSetup ? "diupdate" : "diatur"} ke ${channel}.`);
      } else if (subcommand === "accept" || subcommand === "decline") {
        if (!(await checkPermission(interaction.member))) {
          return interaction.editReply({
            content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
            ephemeral: true,
          });
        }

        const messageId = interaction.options.getString("message_id");
        const suggestionData = await Suggestion.findOne({ where: { guildId: guildId } });
        if (!suggestionData) return interaction.editReply("❌ | Tidak ada konfigurasi channel saran.");

        const channel = await interaction.guild.channels.fetch(suggestionData.channelId);
        let message;

        try {
          message = await channel.messages.fetch(messageId);
        } catch (err) {
          return interaction.editReply("❌ | Gagal mengambil pesan. Pastikan ID valid dan bot punya akses.");
        }

        if (!message.embeds.length) {
          return interaction.editReply("❌ | Embed tidak ditemukan di pesan tersebut.");
        }

        const embed = EmbedBuilder.from(message.embeds[0])
          .setColor(subcommand === "accept" ? "Green" : "Red")
          .setTitle(subcommand === "accept" ? `✅ Saran diterima oleh ${interaction.user.tag}` : `❌ Saran ditolak oleh ${interaction.user.tag}`);

        await message.edit({ embeds: [embed] });
        // Update suggestion status in database
        await Suggestion.update({ status: subcommand === "accept" ? "accepted" : "declined" }, { where: { messageId: messageId } });
        return interaction.editReply(`✅ | Saran berhasil ${subcommand === "accept" ? "diterima" : "ditolak"}.`);
      } else if (subcommand === "send") {
        const suggestionText = interaction.options.getString("saran");
        const suggestionData = await Suggestion.findOne({ where: { guildId: guildId } });
        if (!suggestionData) return interaction.editReply("❌ | Channel saran belum di-setup.");

        const channel = await interaction.guild.channels.fetch(suggestionData.channelId);

        const suggestionEmbed = new EmbedBuilder()
          .setColor("Yellow")
          .setTitle("💡 Saran Baru")
          .setDescription(suggestionText)
          .setFooter({ text: `Dikirim oleh: ${interaction.user.tag}` })
          .setTimestamp();

        const sent = await channel.send({ embeds: [suggestionEmbed] });
        await sent.react("👍");
        await sent.react("👎");

        // Save suggestion to database
        await Suggestion.create({
          guildId: guildId,
          channelId: suggestionData.channelId,
          messageId: sent.id,
          userId: interaction.user.id,
          content: suggestionText,
        });

        return interaction.editReply("✅ | Saranmu sudah dikirim ke channel suggestion!");
      } else if (subcommand === "list") {
        if (!(await checkPermission(interaction.member))) {
          return interaction.editReply({
            content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
            ephemeral: true,
          });
        }

        const suggestions = await Suggestion.findAll({
          where: {
            guildId: guildId,
            content: {
              [Sequelize.Op.not]: null,
            },
          },
        });

        if (!suggestions || suggestions.length === 0) {
          return interaction.editReply("❌ | Belum ada member yang pernah membuat saran apapun.");
        }

        // bagi per 5 embed biar gak panjang banget
        const embeds = [];

        for (let i = 0; i < suggestions.length; i += 5) {
          const chunk = suggestions.slice(i, i + 5);
          const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("📬 Daftar Saran")
            .setTimestamp()
            .setFooter({ text: `Menampilkan ${i + 1}-${i + chunk.length} dari total ${suggestions.length} saran` });

          chunk.forEach((s, idx) => {
            embed.addFields({
              name: `> #${i + idx + 1} • ${s.status.toUpperCase()}`,
              value: `👤 <@${s.userId}>\n📝 ${s.content.length > 150 ? s.content.substring(0, 150) + "..." : s.content}\n🕒 <t:${Math.floor(new Date(s.createdAt).getTime() / 1000)}:R>\n ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬`,
              inline: false,
            });
          });

          embeds.push(embed);
        }

        return interaction.editReply({ embeds });
      }
    } catch (error) {
      console.error("Error during suggestion command execution:", error);
      return interaction.editReply({
        content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi.",
      });
    }
  },
};
