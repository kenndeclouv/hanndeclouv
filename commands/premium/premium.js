const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType,
    WebhookClient,
    AttachmentBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ButtonBuilder
} = require("discord.js");
const Premium = require("../../database/models/Premium");
const { Op } = require("sequelize");
const { embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("premium")
        .setDescription("Kelola status premium user (add, delete, edit, list, info)")
        .addSubcommand(sub =>
            sub
                .setName("add")
                .setDescription("Tambah user ke premium")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User yang ingin diberi premium").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("days").setDescription("Jumlah hari premium (default 30)").setRequired(false)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("delete")
                .setDescription("Hapus status premium user")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User yang ingin dihapus premium-nya").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("edit")
                .setDescription("Edit masa aktif premium user")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User yang ingin diedit premium-nya").setRequired(true)
                )
                .addIntegerOption(opt =>
                    opt.setName("days").setDescription("Jumlah hari premium baru").setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("Lihat daftar user premium")
        )
        .addSubcommand(sub =>
            sub
                .setName("info")
                .setDescription("Lihat info premium user")
                .addUserOption(opt =>
                    opt.setName("user").setDescription("User yang ingin dicek").setRequired(true)
                )
        ),
    aliases: ["prem"],

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            // Only allow owner to use add, delete, edit, list
            const ownerId = process.env.OWNER_ID;
            const subcommand = interaction.options.getSubcommand();

            if (["add", "delete", "edit", "list"].includes(subcommand) && interaction.user.id !== ownerId) {
                return interaction.editReply("❌ | Hanya owner yang bisa mengelola premium user.");
            }

            if (subcommand === "add") {
                const user = interaction.options.getUser("user");
                const days = interaction.options.getInteger("days") ?? 30;
                const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

                let premium = await Premium.findOne({ where: { userId: user.id } });
                if (premium) {
                    premium.isPremium = true;
                    premium.expiresAt = expiresAt;
                    await premium.save();
                } else {
                    premium = await Premium.create({
                        userId: user.id,
                        isPremium: true,
                        expiresAt
                    });
                }

                return interaction.editReply(`✅ Premium untuk <@${user.id}> berhasil diaktifkan selama ${days} hari (sampai <t:${Math.floor(expiresAt.getTime() / 1000)}:R>)`);
            }

            if (subcommand === "delete") {
                const user = interaction.options.getUser("user");
                const premium = await Premium.findOne({ where: { userId: user.id } });
                if (!premium) {
                    return interaction.editReply("❌ User ini belum premium.");
                }
                await premium.destroy();
                return interaction.editReply(`✅ Premium untuk <@${user.id}> berhasil dihapus.`);
            }

            if (subcommand === "edit") {
                const user = interaction.options.getUser("user");
                const days = interaction.options.getInteger("days");
                const premium = await Premium.findOne({ where: { userId: user.id } });
                if (!premium) {
                    return interaction.editReply("❌ User ini belum premium.");
                }
                const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
                premium.expiresAt = expiresAt;
                await premium.save();
                return interaction.editReply(`✅ Masa aktif premium <@${user.id}> diubah menjadi ${days} hari (sampai <t:${Math.floor(expiresAt.getTime() / 1000)}:R>)`);
            }

            if (subcommand === "list") {
                const now = new Date();
                const list = await Premium.findAll({
                    where: {
                        isPremium: true,
                        expiresAt: { [Op.gt]: now }
                    },
                    order: [["expiresAt", "ASC"]]
                });

                if (!list.length) {
                    return interaction.editReply("Belum ada user premium aktif.");
                }

                const embed = new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("Daftar User Premium Aktif")
                    .setDescription(
                        list
                            .map(
                                (p, i) =>
                                    `${i + 1}. <@${p.userId}> - sampai <t:${Math.floor(new Date(p.expiresAt).getTime() / 1000)}:R>`
                            )
                            .join("\n")
                    )
                    .setFooter(embedFooter(interaction));

                return interaction.editReply({ embeds: [embed] });
            }

            if (subcommand === "info") {
                const user = interaction.options.getUser("user");
                const premium = await Premium.findOne({ where: { userId: user.id } });
                if (!premium || !premium.isPremium || new Date(premium.expiresAt) < new Date()) {
                    return interaction.editReply(`❌ <@${user.id}> tidak memiliki status premium aktif.`);
                }
                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(`Info Premium: ${user.tag}`)
                    .addFields(
                        { name: "User", value: `<@${user.id}> (${user.id})` },
                        { name: "Status", value: premium.isPremium ? "🟩 Aktif" : "🟥 Tidak Aktif" },
                        { name: "Berlaku Sampai", value: `<t:${Math.floor(new Date(premium.expiresAt).getTime() / 1000)}:F>`, inline: false }
                    );
                return interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error("Error during premium command execution:", error);
            const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

            const errorEmbed = new EmbedBuilder()
                .setColor("Red")
                .setTitle(`> ❌ Error command /premium`)
                .setDescription(`\`\`\`${error}\`\`\``)
                .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
                .setTimestamp();

            webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);
            return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
        }
    },
};
