const { Events, EmbedBuilder, WebhookClient } = require("discord.js");
const BotSetting = require("../database/models/BotSetting");
require("dotenv").config();
module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    // Inisialisasi pengaturan default untuk server baru jika belum ada
    try {
      const [setting, created] = await BotSetting.findOrCreate({
        where: { guildId: guild.id },
        defaults: {
          guildId: guild.id,
          // tambahkan default lain jika perlu
        },
      });
      if (created) {
        console.log(`Pengaturan default dibuat untuk server: ${guild.name}`);
      }
    } catch (error) {
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /restart`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter(`Error dari server ${interaction.guild.name}`)
        .setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      console.error("Gagal membuat pengaturan default BotSetting:", error);
    }

    // Webhook URL yang udah di-setup
    const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_GUILD_INVITE });

    const errorEmbed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`> ✅ **${guild.client.user.username}** DIINVITE`)
      .setDescription(`Haloo kenn! kabarr baikk nihh, **${guild.client.user.username}** masuk ke server ${guild.name} (ID: ${guild.id})`)
      .setTimestamp();

    // Kirim ke webhook
    webhookClient
      .send({
        embeds: [errorEmbed],
      })
      .catch(console.error);

    // Kalau mau ngirim info ke server tertentu, bisa pake code ini
    const channel = guild.systemChannel; // Kalau ada channel sistem default
    if (channel) {
      const welcomeEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(`> 🎉 Terima kasih sudah mengundangku!`)
        .setDescription(
          `Halo semuanya! Aku **${guild.client.user.username}** siap membantu server ini!\n\n` +
            `Berikut beberapa langkah awal yang bisa kamu lakukan:\n` +
            `• Gunakan perintah \`/help\` untuk melihat semua fitur dan commandku.\n` +
            `• Atur pengaturan server dengan \`/set\` (khusus admin).\n` +
            `• Cek websiteku di [kenndeclouv.my.id](https://kenndeclouv.my.id) untuk dokumentasi dan info lebih lanjut.\n\n` +
            `Jika butuh bantuan, mention aku atau hubungi ownerku <@${process.env.OWNER_ID}>!\n\n` +
            `Selamat bersenang-senang! 🚀`
        )
        .setThumbnail(guild.client.user.displayAvatarURL())
        .setFooter({
          text: `Bot ${guild.client.user.username} siap melayani!`,
          iconURL: guild.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      channel.send({ embeds: [welcomeEmbed] }).catch(() => {
        // fallback jika embed gagal
        channel.send(`Halo, aku **${guild.client.user.username}** baru bergabung! Gunakan \`/help\` untuk mulai.`);
      });
    }
  },
};