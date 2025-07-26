const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require("discord.js");
const TicketConfig = require("../../database/models/TicketConfig");
const { checkPermission, embedFooter } = require("../../helpers");
const { createTicketTranscript } = require("../../helpers");
const Ticket = require("../../database/models/Ticket");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Perintah sistem tiket")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Atur sistem tiket")
        .addChannelOption((option) => option.setName("channel").setDescription("Channel untuk pembuatan tiket").setRequired(true))
        .addRoleOption((option) => option.setName("staff-role").setDescription("Role untuk staf").setRequired(true))
        .addChannelOption((option) => option.setName("logs").setDescription("Channel log untuk tiket").setRequired(true))
        .addChannelOption((option) => option.setName("transcript").setDescription("Channel untuk transkrip").setRequired(true))
        .addStringOption((option) => option.setName("title").setDescription("Judul untuk pesan tiket").setRequired(true))
        .addStringOption((option) => option.setName("description").setDescription("Deskripsi untuk pesan tiket").setRequired(true))
        .addStringOption((option) => option.setName("name").setDescription("Nama untuk tiket").setRequired(true))
        .addStringOption((option) => option.setName("format").setDescription("Format untuk tiket (contoh: {username}-support)[{username}, {guildname}, {date}, {timestamp}]").setRequired(true))
        .addStringOption((option) => option.setName("button").setDescription("Nama tombol untuk pesan tiket (contoh: Buat Tiket, Support, dll)").setRequired(false))
        .addStringOption((option) =>
          option
            .setName("buttoncolor")
            .setDescription("Warna tombol untuk pesan tiket (contoh: Primary, Secondary, Success, Danger, Link)")
            .setRequired(false)
            .addChoices(
              { name: "Primary", value: "Primary" },
              { name: "Secondary", value: "Secondary" },
              { name: "Success", value: "Success" },
              { name: "Danger", value: "Danger" },
              { name: "Link", value: "Link" }
            )
        )
        .addStringOption((option) => option.setName("image").setDescription("Image untuk pesan tiket (jika tidak ada, akan menggunakan avatar bot)").setRequired(false))
        .addStringOption((option) => option.setName("thumbnail").setDescription("Thumbnail untuk pesan tiket (jika tidak ada, akan menggunakan avatar bot)").setRequired(false))
        .addStringOption((option) => option.setName("footer-text").setDescription("Text untuk footer").setRequired(false))
        .addStringOption((option) => option.setName("footer-icon").setDescription("Icon untuk footer").setRequired(false))

        // .addStringOption((option) => option.setName("ticket-title").setDescription("Judul untuk pesan tiket").setRequired(false))
        .addStringOption((option) => option.setName("ticket-category").setDescription("Buat channel tiket di ketegori yang ditentukan").setRequired(false))
        .addStringOption((option) => option.setName("ticket-description").setDescription("Deskripsi untuk pesan tiket").setRequired(false))
        .addStringOption((option) => option.setName("ticket-image").setDescription("Image untuk pesan tiket").setRequired(false))
        .addStringOption((option) => option.setName("ticket-thumbnail").setDescription("Thumbnail untuk pesan tiket").setRequired(false))
        .addStringOption((option) => option.setName("ticket-footer-text").setDescription("Text untuk footer").setRequired(false))
        .addStringOption((option) => option.setName("ticket-footer-icon").setDescription("Icon untuk footer").setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Hapus pengguna dari channel tiket")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan dihapus").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Tambahkan pengguna ke channel tiket")
        .addUserOption((option) => option.setName("user").setDescription("Pengguna yang akan ditambahkan").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("close").setDescription("Tutup tiket dan hapus channel tiket."))
    .addSubcommand((subcommand) => subcommand.setName("transcript").setDescription("Dapatkan transkrip dari tiket.")),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭"
      });
    }
    await interaction.deferReply();

    try {
      if (!(await checkPermission(interaction.member))) {
        return interaction.editReply({
          content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
          ephemeral: true,
        });
      }
      const { options } = interaction;
      const subcommand = options.getSubcommand();

      switch (subcommand) {
        case "setup": {
          const channel = options.getChannel("channel");
          const staffRole = options.getRole("staff-role");
          const logsChannel = options.getChannel("logs");
          const transcriptChannel = options.getChannel("transcript");
          const title = options.getString("title");
          const description = options.getString("description");
          const name = options.getString("name");
          const format = options.getString("format");
          const button = options.getString("button");
          const buttonColor = options.getString("buttoncolor");
          const image = options.getString("image");
          const thumbnail = options.getString("thumbnail");
          const footerText = options.getString("footer-text");
          const footerIcon = options.getString("footer-icon");

          const ticketCategoryId = options.getString("ticket-category");
          const ticketDescription = options.getString("ticket-description");
          const ticketImage = options.getString("ticket-image");
          const ticketThumbnail = options.getString("ticket-thumbnail");
          const ticketFooterText = options.getString("ticket-footer-text");
          const ticketFooterIcon = options.getString("ticket-footer-icon");

          // Buat tiket config baru
          const ticket = new TicketConfig({
            guildId: interaction.guild.id,
            // userId: interaction.user.id,
            channelId: channel.id,
            staffRoleId: staffRole.id,
            logsChannelId: logsChannel.id,
            transcriptChannelId: transcriptChannel.id,

            name,
            format,
            title,
            description,
            button,
            buttonColor,
            image,
            thumbnail,
            footerText,
            footerIcon,

            ticketCategoryId,
            ticketDescription,
            ticketImage,
            ticketThumbnail,
            ticketFooterText,
            ticketFooterIcon,
          });

          await ticket.saveAndUpdateCache("guildId");

          // Buat embed pembuatan tiket
          const ticketEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .setTitle(title)
            .setDescription(description ? description : `haloo ${interaction.user}! tiketmu udah terbuat! tolong tunggu staff <@&${staffRole.id}> untuk bantu yaa`);
          if (ticketImage) ticketEmbed.setImage(ticketImage);
          if (ticketThumbnail) ticketEmbed.setThumbnail(ticketThumbnail ? ticketThumbnail : interaction.client.user.displayAvatarURL({ dynamic: true }));
          if (ticketFooterText) ticketEmbed.setFooter({ iconURL: ticketFooterIcon ? ticketFooterIcon : interaction.client.user.displayAvatarURL({ dynamic: true }), text: ticketFooterText ? ticketFooterText : embedFooter(interaction) });

          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticketcreate").setLabel(`${button ? button : "Buat Tiket"}`).setStyle(buttonColor ? buttonColor : ButtonStyle.Primary));

          // Kirim embed di channel yang ditentukan
          const message = await channel.send({ embeds: [ticketEmbed], components: [row] });
          const ticketConfig = await TicketConfig.getCache({ guildId: interaction.guild.id });
          ticketConfig.messageId = message.id;
          ticketConfig.changed("messageId", true);
          await ticketConfig.saveAndUpdateCache("guildId"); // Simpan messageId ke database

          return await interaction.editReply(`🎫 | Sistem tiket berhasil diatur di ${channel}. Judul: **${title}**.\nFormat: **${format}**.`);
        }
        case "remove": {
          const user = options.getUser("user");
          const member = await interaction.guild.members.fetch(user.id);

          // Periksa apakah anggota ada di channel tiket
          if (interaction.channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) {
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
            return await interaction.editReply(`❌ | **${user.tag}** telah dihapus dari channel tiket.`);
          } else {
            return await interaction.editReply(`⚠️ | **${user.tag}** tidak ada di channel tiket.`);
          }
        }
        case "add": {
          const user = options.getUser("user");
          const member = await interaction.guild.members.fetch(user.id);

          // Periksa apakah anggota ada di channel tiket
          if (!interaction.channel.permissionsFor(member).has(PermissionsBitField.Flags.ViewChannel)) {
            await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true });

            // Kirim pesan embed ke DM user yang di-add
            try {
              const dmEmbed = new EmbedBuilder()
                .setColor("Blue")
                .setDescription(
                  `Kamu telah ditambahkan ke channel tiket [#${interaction.channel.name}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}) di server **${interaction.guild.name}**.\n\nSilakan cek channel tersebut untuk membantu atau berdiskusi.`
                )
                .setTimestamp()
                .setFooter(embedFooter(interaction));

              await user.send({ embeds: [dmEmbed] });
            } catch (err) {
              // DM gagal, bisa jadi user menonaktifkan DM
            }

            return await interaction.editReply(`✅ | **${user.tag}** telah ditambahkan ke channel tiket.`);
          } else {
            return await interaction.editReply(`⚠️ | **${user.tag}** sudah ada di channel tiket.`);
          }
        }
        case "close": {
          // Tutup tiket
          const ticket = await Ticket.getCache({ channelId: interaction.channel.id });
          if (!ticket) {
            return interaction.editReply(`❌ | Channel ini tidak terkait dengan tiket yang terbuka.`);
          }

          // Ambil channel log dan transkrip dari database
          const logsChannel = interaction.guild.channels.cache.get(ticket.logsChannelId);
          const transcriptChannel = interaction.guild.channels.cache.get(ticket.transcriptChannelId);

          try {
            // Panggil fungsi untuk buat transkrip
            const transcriptText = await createTicketTranscript(interaction.channel);

            // Kirim transkrip ke channel transkrip
            await transcriptChannel.send({
              content: `Transkrip untuk tiket #${ticket.ticketNumber} dibuat oleh <@${ticket.userId}>.`,
              files: [
                {
                  attachment: Buffer.from(transcriptText, "utf-8"),
                  name: `ticket_${ticket.ticketNumber}_transcript.txt`,
                },
              ],
            });

            // Opsional, kirim notifikasi ke channel log
            if (logsChannel) {
              await logsChannel.send(`📝 | Tiket yang dibuka oleh <@${ticket.userId}> ditutup oleh ${interaction.user.tag} dan transkrip disimpan.`);
            }

            // Hapus tiket dari database
            // await Ticket.destroy({ where: { channelId: interaction.channel.id } });

            // Hapus channel tiket
            await interaction.channel.delete();
            return interaction.editReply(`✅ | Tiket berhasil ditutup!`);
          } catch (error) {
            console.error("Gagal membuat transkrip:", error);
            return interaction.editReply(`❌ | Terjadi kesalahan saat membuat transkrip. Silakan coba lagi nanti.`);
          }
        }
        case "transcript": {
          // Ambil tiket dari database
          const ticket = await Ticket.getCache({ channelId: interaction.channel.id });
          if (!ticket) {
            return interaction.editReply(`❌ | Channel ini tidak terkait dengan tiket yang terbuka.`);
          }

          try {
            // Buat transkrip dari tiket
            const transcriptText = await createTicketTranscript(interaction.channel);

            // Kirim transkrip ke channel transkrip
            const transcriptChannel = interaction.guild.channels.cache.get(ticket.transcriptChannelId);
            await transcriptChannel.send({
              content: `Transkrip untuk tiket #${ticket.ticketNumber} dibuat oleh <@${ticket.userId}>.`,
              files: [
                {
                  attachment: Buffer.from(transcriptText, "utf-8"),
                  name: `ticket_${ticket.ticketNumber}_transcript.txt`,
                },
              ],
            });

            return await interaction.editReply(`📜 | Transkrip untuk tiket ini telah dikirim ke ${transcriptChannel}.`);
          } catch (error) {
            console.error("Gagal membuat transkrip:", error);
            return interaction.editReply(`❌ | Terjadi kesalahan saat membuat transkrip. Silakan coba lagi nanti.`);
          }
        }
      }
    } catch (error) {
      console.error("Error during ticket command execution:", error);
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
