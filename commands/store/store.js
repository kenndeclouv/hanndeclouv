const { SlashCommandBuilder, ChannelType } = require("discord.js");
const BotSetting = require("../../database/models/BotSetting");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("store")
        .setDescription("Pengaturan store di server ini.")
        .addSubcommand(sub =>
            sub
                .setName("set")
                .setDescription("Setup channel dan konfigurasi store open/close.")
                .addChannelOption(opt =>
                    opt.setName("channel")
                        .setDescription("Channel untuk open/close store.")
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName("type")
                        .setDescription("Tipe aksi store (ubah nama channel, kirim pesan, atau keduanya).")
                        .addChoices(
                            { name: "Ubah Nama Channel", value: "channelname" },
                            { name: "Kirim Pesan Embed", value: "channelmessage" },
                            { name: "Nama + Pesan", value: "channelnameandmessage" }
                        )
                        .setRequired(true)
                )

                // OPEN
                .addStringOption(opt =>
                    opt.setName("open_nameformat")
                        .setDescription("Format nama channel saat store DIBUKA.")
                )
                .addStringOption(opt =>
                    opt.setName("open_title")
                        .setDescription("Judul embed saat store DIBUKA.")
                )
                .addStringOption(opt =>
                    opt.setName("open_description")
                        .setDescription("Deskripsi embed store DIBUKA.")
                )
                .addStringOption(opt =>
                    opt.setName("open_color")
                        .setDescription("Warna embed DIBUKA (ex: Green)")
                )

                // CLOSE
                .addStringOption(opt =>
                    opt.setName("close_nameformat")
                        .setDescription("Format nama channel saat store DITUTUP.")
                )
                .addStringOption(opt =>
                    opt.setName("close_title")
                        .setDescription("Judul embed saat store DITUTUP.")
                )
                .addStringOption(opt =>
                    opt.setName("close_description")
                        .setDescription("Deskripsi embed store DITUTUP.")
                )
                .addStringOption(opt =>
                    opt.setName("close_color")
                        .setDescription("Warna embed DITUTUP (ex: Red)")
                )
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const sub = interaction.options.getSubcommand();

        if (sub !== "set") return;

        const channel = interaction.options.getChannel("channel");
        const type = interaction.options.getString("type");

        // OPEN
        const openName = interaction.options.getString("open_nameformat") || "🟢・store-open";
        const openTitle = interaction.options.getString("open_title") || "🟢 STORE OPEN";
        const openDesc = interaction.options.getString("open_description");
        const openColor = interaction.options.getString("open_color") || "Green";

        // CLOSE
        const closeName = interaction.options.getString("close_nameformat") || "🔴・store-closed";
        const closeTitle = interaction.options.getString("close_title") || "🔴 STORE CLOSE";
        const closeDesc = interaction.options.getString("close_description");
        const closeColor = interaction.options.getString("close_color") || "Red";

        // validasi kalau tipenya butuh message
        if (["channelmessage", "channelnameandmessage"].includes(type)) {
            if (!openTitle || !openDesc || !closeTitle || !closeDesc) {
                return interaction.reply({
                    content: "❌ | Karena kamu memilih tipe yang mengirim embed, kamu wajib mengisi `open_title`, `open_description`, `close_title`, dan `close_description`.",
                    ephemeral: true
                });
            }
        }

        // Format embed OPEN
        const openEmbed = (openTitle || openDesc) ? [{
            title: openTitle || undefined,
            description: openDesc || undefined,
            color: openColor
        }] : [];

        // Format embed CLOSE
        const closeEmbed = (closeTitle || closeDesc) ? [{
            title: closeTitle || undefined,
            description: closeDesc || undefined,
            color: closeColor
        }] : [];

        // simpan ke DB
        try {
            const existing = await BotSetting.findOne({ where: { guildId } });

            const data = {};

            // hanya update kalau user isi
            if (channel) data.openCloseChannelId = channel.id;
            if (type) data.openCloseType = type;

            if (openName) data.openChannelNameFormat = openName;
            if (closeName) data.closeChannelNameFormat = closeName;

            // OPEN EMBED
            if (openTitle || openDesc || openColor) {
                const final = {
                    title: openTitle ?? existing.openChannelMessageFormat?.[0]?.title,
                    description: openDesc ?? existing.openChannelMessageFormat?.[0]?.description,
                    color: openColor ?? existing.openChannelMessageFormat?.[0]?.color
                };
                data.openChannelMessageFormat = [final];
            }

            // CLOSE EMBED
            if (closeTitle || closeDesc || closeColor) {
                const final = {
                    title: closeTitle ?? existing.closeChannelMessageFormat?.[0]?.title,
                    description: closeDesc ?? existing.closeChannelMessageFormat?.[0]?.description,
                    color: closeColor ?? existing.closeChannelMessageFormat?.[0]?.color
                };
                data.closeChannelMessageFormat = [final];
            }

            // validasi kalau embed required
            if (["channelmessage", "channelnameandmessage"].includes(type || existing.openCloseType)) {
                const isOpenValid = data.openChannelMessageFormat?.[0]?.title && data.openChannelMessageFormat?.[0]?.description;
                const isCloseValid = data.closeChannelMessageFormat?.[0]?.title && data.closeChannelMessageFormat?.[0]?.description;
                if (!isOpenValid || !isCloseValid) {
                    return interaction.reply({
                        content: "❌ | Karena kamu memilih tipe yang mengirim embed, kamu wajib mengisi `open_title`, `open_description`, `close_title`, dan `close_description`.",
                        ephemeral: true
                    });
                }
            }

            // update DB
            await BotSetting.update(data, { where: { guildId } });

            return interaction.reply({
                content: "✅ | Konfigurasi store berhasil diperbarui!",
                ephemeral: true
            });

        } catch (e) {
            console.error("❌ Error saat store set:", e);
            return interaction.reply({
                content: "❌ | Gagal menyimpan pengaturan. Coba lagi nanti.",
                ephemeral: true
            });
        }
    }
};
