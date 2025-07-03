const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../database/models/User");
const { embedFooter } = require("../../helpers");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("account")
    .setDescription("Buat akun pengguna dan pilih jenis bank.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Buat akun pengguna baru")
        .addStringOption((option) =>
          option
            .setName("bank")
            .setDescription("Pilih jenis bank")
            .setRequired(true)
            .addChoices(
              { name: "BCA", value: "bca" },
              { name: "BNI", value: "bni" },
              { name: "BRI", value: "bri" },
              { name: "Mandiri", value: "mandiri" },
              { name: "Danamon", value: "danamon" },
              { name: "Permata", value: "permata" },
              { name: "CIMB Niaga", value: "cimbniaga" },
              { name: "Maybank", value: "maybank" },
              { name: "HSBC", value: "hsbc" },
              { name: "DBS", value: "dbs" },
              { name: "OCBC", value: "ocbc" },
              { name: "UOB", value: "uob" }
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("edit")
        .setDescription("Edit akun pengguna")
        .addStringOption((option) =>
          option
            .setName("bank")
            .setDescription("Pilih jenis bank baru")
            .setRequired(true)
            .addChoices(
              { name: "BCA", value: "bca" },
              { name: "BNI", value: "bni" },
              { name: "BRI", value: "bri" },
              { name: "Mandiri", value: "mandiri" },
              { name: "Danamon", value: "danamon" },
              { name: "Permata", value: "permata" },
              { name: "CIMB Niaga", value: "cimbniaga" },
              { name: "Maybank", value: "maybank" },
              { name: "HSBC", value: "hsbc" },
              { name: "DBS", value: "dbs" },
              { name: "OCBC", value: "ocbc" },
              { name: "UOB", value: "uob" }
            )
        )
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const subcommand = interaction.options.getSubcommand();
      const bankType = interaction.options.getString("bank");
      const userId = interaction.user.id;

      switch (subcommand) {
        case "create": {
          // Check if user already has an account
          const existingUser = await User.getCache({ userId: userId, guildId: interaction.guild.id });
          if (existingUser) {
            return interaction.editReply({ content: "kamu sudah memiliki akun." });
          }

          // Create new user account
          await User.create({ userId, guildId: interaction.guild.id, bankType, cash: 0, bank: 0 });

          const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription("## 💳 Akun Berhasil Dibuat")
            .setDescription(`Akun berhasil dibuat dengan jenis bank: **${bankType.toUpperCase()}**`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(embedFooter(interaction));
          return interaction.editReply({ embeds: [embed] });
        }
        case "edit": {
          // Check if user has an account
          const existingUser = await User.getCache({ userId: userId, guildId: interaction.guild.id });
          if (!existingUser) {
            return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/account create` untuk membuat akun." });
          }

          // Update user's bank type
          existingUser.bankType = bankType;
          existingUser.changed("bankType", true);
          await existingUser.saveAndUpdateCache("userId");

          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription("## 💳 Akun Berhasil Diedit")
            .setDescription(`Jenis bank berhasil diubah menjadi: **${bankType.toUpperCase()}**`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(embedFooter(interaction));
          return interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error during account command execution:", error);
      return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};
