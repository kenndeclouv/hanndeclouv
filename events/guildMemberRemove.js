const { EmbedBuilder, Events } = require("discord.js");
const BotSetting = require("../database/models/BotSetting");
const Invite = require("../database/models/Invite");

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    console.log("welcomer out connected");
    const guild = member.guild;
    const guildId = guild.id;

    const setting = await BotSetting.getCache({ guildId: guildId });
    if (!setting || !setting.welcomeOutOn) return;

    const channel = guild.channels.cache.get(setting.welcomeOutChannelId);
    if (!channel) return console.log("welcome channel not found");

    // ======== invite tracker logic ========
    // const invites = await Invite.findAll({ where: { guildId } });
    // let inviterTag = "tidak diketahui";

    // for (const invite of invites) {
    //   if (invite.userId === member.id) continue; // skip kalo invite diri sendiri
    //   const invitedBy = await Invite.findOne({ where: { guildId, userId: invite.userId } });
    //   if (invitedBy) {
    //     // kurangi count invite-nya
    //     invitedBy.invites = Math.max(0, invitedBy.invites - 1); // biar gak minus
    //     await invitedBy.save();
    //     inviterTag = `<@${invitedBy.userId}>`;
    //     break;
    //   }
    // }

    // embed keluar
    const goodbyeEmbed = new EmbedBuilder()
      .setColor("#f7f7f7")
      .setTitle(`> huhuuu ${member.user.displayName} keluarr 😭`)
      // .setDescription(`${member.user.displayName} kami selalu merindukanmuu 😭\n`)
      .setDescription(setting.welcomeOutText ? `<@${member.user.id}> ${setting.welcomeOutText}` : `huhuuu <@${member.user.id}> keluar dari server inii\nsemoga kamuu kembalii😭`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({
        text: `sistem ${guild.name}`,
        iconURL: member.client.user.displayAvatarURL({ dynamic: true }),
      });

    channel.send({ embeds: [goodbyeEmbed] });
  },
};
