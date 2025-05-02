const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { createTicketTranscript } = require("../../helpers");
const Ticket = require("../../database/models/Ticket");
const TicketConfig = require("../../database/models/TicketConfig");
const { checkPermission } = require("../../helpers");

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
    await interaction.deferReply({ ephemeral: true });

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

          // Buat tiket config baru
          const ticket = new TicketConfig({
            guildId: interaction.guild.id,
            // userId: interaction.user.id,
            channelId: channel.id,
            staffRoleId: staffRole.id,
            logsChannelId: logsChannel.id,
            transcriptChannelId: transcriptChannel.id,

            title,
            description,
          });

          await ticket.save();

          // Buat embed pembuatan tiket
          const ticketEmbed = new EmbedBuilder()
            .setColor("#0099ff")
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .setTitle(title)
            .setDescription(description)
            .setFooter({ text: "Klik tombol di bawah untuk membuat tiket." });

          const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("create_ticket").setLabel("Buat Tiket").setStyle(ButtonStyle.Primary));

          // Kirim embed di channel yang ditentukan
          await channel.send({ embeds: [ticketEmbed], components: [row] });
          return await interaction.editReply(`🎫 | Sistem tiket berhasil diatur di ${channel}. Judul: **${title}**.`);
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
                .setTitle("> 🎫 Kamu telah ditambahkan ke tiket!")
                .setDescription(
                  `Kamu telah ditambahkan ke channel tiket [#${interaction.channel.name}](https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}) di server **${interaction.guild.name}**.\n\nSilakan cek channel tersebut untuk membantu atau berdiskusi.`
                )
                .setTimestamp()
                .setFooter({ text: `Sistem Tiket ${interaction.guild.name}` });

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
          const ticket = await Ticket.findOne({ where: { channelId: interaction.channel.id } });
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
          const ticket = await Ticket.findOne({ where: { channelId: interaction.channel.id } });
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
