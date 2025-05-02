const { EmbedBuilder, Events, WebhookClient } = require("discord.js");
const BotSetting = require("../database/models/BotSetting");
const { fixPrefix } = require("../helpers");
const Invite = require("../database/models/Invite");
const User = require("../database/models/User");
require("dotenv").config();
let invitesCache = new Map(); // penyimpanan sementara invite cache

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    console.log("welcomer connected");

    // buat akun untuk user
    let user = await User.findOne({ where: { userId: member.user.id } });
    if (!user) {
      user = await User.create({ userId: member.user.id });
    }
    const guild = member.guild;
    const guildId = guild.id;

    // ambil setting welcome
    const setting = await BotSetting.getCache({ guildId: guildId });
    if (!setting || !setting.welcomeInOn) return;

    const channel = guild.channels.cache.get(setting.welcomeInChannelId);
    if (!channel) return console.log("Welcome channel not found");

    // ======== invite tracker logic ========
    let oldInvites = invitesCache.get(guildId);
    let newInvites;

    try {
      newInvites = await guild.invites.fetch();
      invitesCache.set(guildId, newInvites);
    } catch (e) {
      console.error("Failed to fetch invites:", e);
      newInvites = null;
    }

    let usedInvite = null;
    if (oldInvites && newInvites) {
      usedInvite = newInvites.find((inv) => {
        const old = oldInvites.get(inv.code);
        return old && inv.uses > old.uses;
      });
    }

    let inviterTag = "tidak diketahui";
    if (usedInvite && usedInvite.inviter) {
      inviterTag = `${usedInvite.inviter.username}`;

      // simpan ke DB
      const existing = await Invite.findOne({ where: { userId: usedInvite.inviter.id, guildId } });
      if (existing) {
        existing.invites += 1;
        await existing.save();
      } else {
        await Invite.create({ userId: usedInvite.inviter.id, guildId, invites: 1 });
      }
    }

    // ======== tambah role welcome ========
    if (setting.welcomeRoleId) {
      try {
        const welcomeRole = guild.roles.cache.get(setting.welcomeRoleId);
        if (welcomeRole) {
          await member.roles.add(welcomeRole);
          console.log(`Added welcome role to ${member.user.tag}`);
        }
      } catch (err) {
        console.error(`Failed to add welcome role: ${err}`);
      }
    }
    // ======== fix prefix member ========
    await fixPrefix(member.guild);
    // ======== buat embed welcome ========
    const welcomeEmbed = new EmbedBuilder()
      .setColor("#f7f7f7")
      .setTitle(`> halooo ${member.user.displayName}!`)
      .setDescription(setting.welcomeInText ? `<@${member.user.id}> ${setting.welcomeInText}` : `wihhh <@${member.user.id}> gabung ke server kitaa!\nsemoga betah di server kitaa yakk!`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: `sistem ${guild.name}`,
        iconURL: member.client.user.displayAvatarURL({ dynamic: true }),
      });

    channel.send({ embeds: [welcomeEmbed] });

    // Coba kirim embed welcome ke DM user
    try {
      // Bikin embed DM greeting yang lebih ramah dan seru!
      const dmWelcomeEmbed = new EmbedBuilder()
        .setColor("Green")
        .setTitle(`> 🎉 Selamat datang di ${guild.name}!`)
        .setDescription(
          `Haiii ${member.user.username}!\n\n` +
            "Senang banget kamu udah join ke server ini!\n" +
            "Jangan ragu buat kenalan, ngobrol, atau tanya-tanya apa aja di sini yaa~\n\n" +
            "Semoga kamu betah dan dapet banyak temen baru di sini! \n\n" +
            "Yuk, cek channel perkenalan atau rules dulu biar makin asik!\n\n" +
            "Have fun dan selamat bersenang-senang!"
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setFooter({
          text: `Welcome by ${guild.name} Team`,
          iconURL: member.client.user.displayAvatarURL({ dynamic: true }),
        });

      await member.send({ embeds: [dmWelcomeEmbed] });
    } catch (error) {
      console.error("Error during guild member add interaction:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command  guild member add interaction`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter(`Error dari server ${interaction.guild.name}`)
        .setTimestamp();

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