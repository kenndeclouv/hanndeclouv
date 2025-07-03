const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { checkCooldown, embedFooter } = require("../../helpers");
const BotSetting = require("../../database/models/BotSetting");
const Inventory = require("../../database/models/Inventory");
const User = require("../../database/models/User");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hack")
    .setDescription("Hack user lain.")
    .addUserOption((option) => option.setName("target").setDescription("User yang ingin di hack").setRequired(true)),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    try {
      const targetUser = interaction.options.getUser("target");
      const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
      const target = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });

      let botSetting = await BotSetting.getCache({ guildId: interaction.guild.id });

      // Cooldown check
      const cooldown = checkCooldown(user.lastHack, botSetting.hackCooldown);
      if (cooldown.remaining) {
        return interaction.editReply({ content: `🕒 | kamu dapat meng-hack lainnya dalam **${cooldown.time}**!` });
      }
      // validasi data user
      if (!user || !target) {
        return interaction.editReply({
          content: `❌ | Pengguna atau target tidak ditemukan dalam sistem.`,
        });
      }

      if (targetUser.id === interaction.user.id) {
        return interaction.editReply({
          content: `❌ | kamu tidak dapat meng-hack diri sendiri!`,
        });
      }

      if (target.bank <= 0) {
        return interaction.editReply({
          content: `❌ | Target tidak memiliki uang di bank untuk di-hack.`,
        });
      }

      if (user.bank <= 20) {
        return interaction.editReply({
          content: `❌ | kamu tidak memiliki uang di bank untuk meng-hack.`,
        });
      }

      // buat embed fake hack
      const embed = new EmbedBuilder()
        .setDescription("## 💵 Hacking in Progress...")
        .setDescription(`${interaction.user.username} sedang meng-hack ${targetUser.username}... dengan kemungkinan berhasil **${user.hackMastered || 10}%**`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .setColor("#f7f7f7")
        .setTimestamp(new Date());

      // kirim embed fake hack
      await interaction.editReply({ embeds: [embed] });

      const desktop = await Inventory.findOne({ where: { userId: user.userId, itemName: "🖥️ Desktop" } });
      let successChance = 1;
      if (desktop) {
        successChance = 1.5;
      }
      // simulasi hasil hack
      setTimeout(async () => {
        const hackResult = Math.random() < ((user.hackMastered || 10) / 100) * successChance ? "success" : "failure";

        if (hackResult === "success") {
          // transfer semua uang target ke user
          user.bank += target.bank;
          if (user.hackMastered < 100) {
            user.hackMastered = (user.hackMastered || 10) + 1;
          }
          target.bank = 0;
          user.changed("bank", true);
          target.changed("bank", true);
          await user.saveAndUpdateCache("userId");
          await target.saveAndUpdateCache("userId");

          const successEmbed = new EmbedBuilder()
            .setColor("Green")
            .setDescription("## 💵 Hack berhasil!")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`🎉 | kamu berhasil meng-hack **${targetUser.username}** dan mendapatkan semua uang di bank mereka!`)
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          await interaction.editReply({ embeds: [successEmbed] });
        } else {
          // penalti jika gagal
          const penalty = Math.floor(Math.random() * 20) + 1;
          if (user.bank >= penalty) {
            user.bank -= penalty;
            target.bank += penalty;
            user.changed("bank", true);
            target.changed("bank", true);
            await user.saveAndUpdateCache("userId");
            await target.saveAndUpdateCache("userId");
          }

          const failureEmbed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("## 💵 Hack gagal!")
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(`❌ | kamu gagal meng-hack **${targetUser.username}** dan kehilangan **${penalty}** uang dari bank kamu.`)
            .setTimestamp()
            .setFooter(embedFooter(interaction));

          await interaction.editReply({ embeds: [failureEmbed] });
        }
      }, 5000); // delay 5 detik
    } catch (error) {
      console.error(error);
      interaction.editReply({
        content: "❌ | Terjadi kesalahan saat mencoba menjalankan perintah ini.",
      });
    }
  },
};
