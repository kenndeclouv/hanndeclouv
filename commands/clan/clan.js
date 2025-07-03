const { SlashCommandBuilder, EmbedBuilder, ChannelType, WebhookClient } = require("discord.js");
const User = require("../../database/models/User");
const Clan = require("../../database/models/Clan"); // Import model Clan
const BotSetting = require("../../database/models/BotSetting"); // Import model Clan
const { parseDuration, addXp, checkPermission, embedFooter } = require("../../helpers");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("clan")
    .setDescription("Command clan.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Buat clan baru.")
        .addStringOption((option) => option.setName("name").setDescription("Nama clan").setRequired(true))
        .addStringOption((option) => option.setName("emoji").setDescription("Emoji clan").setRequired(true))
        .addMentionableOption((option) => option.setName("owner").setDescription("Ketua atau owner clan").setRequired(true))
        .addStringOption((option) => option.setName("color").setDescription("Warna clan (hex, contoh: #ff0000), atau kosongkan untuk warna random").setRequired(false))
        .addStringOption((option) => option.setName("rules").setDescription("Aturan clan (opsional), pisahkan dengan ','").setRequired(false))
        .addAttachmentOption((option) => option.setName("logo").setDescription("Logo/gambar clan").setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("war")
        .setDescription("Mulai perang clan.")
        .addStringOption((option) => option.setName("time").setDescription("Durasi perang (contoh: 1h30m)").setRequired(true))
        .addStringOption((option) => option.setName("reward_type").setDescription("Jenis reward").setRequired(true).addChoices({ name: "Uang", value: "money" }, { name: "XP", value: "xp" }))
        .addIntegerOption((option) => option.setName("reward_amount").setDescription("Jumlah reward").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("join")
        .setDescription("Bergabung ke clan.")
        .addStringOption(
          (option) => option.setName("clan").setDescription("Nama clan").setRequired(true).setAutocomplete(true) // Aktifkan autocomplete
        )
    )
    .addSubcommand((subcommand) => subcommand.setName("leave").setDescription("Keluar dari clan."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Hapus clan yang ada.")
        .addStringOption((option) => option.setName("clan").setDescription("Nama clan yang ingin dihapus").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("verify")
        .setDescription("Verify suatu clan")
        .addStringOption((option) => option.setName("clan").setDescription("Nama clan yang ingin dihapus").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("transfer")
        .setDescription("Transfer kepemilikan suatu clan")
        .addStringOption((option) => option.setName("clan").setDescription("Nama clan yang ingin dihapus").setRequired(true).setAutocomplete(true))
        .addMentionableOption((option) => option.setName("owner").setDescription("Ketua atau owner clan").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List semua clan.")),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "clan") {
      const clans = await Clan.findAll({ where: { guildId: interaction.guild.id } });
      const choices = clans.map((clan) => ({
        name: `${clan.name}`,
        value: clan.name,
      }));
      // Discord only allows up to 25 choices in autocomplete
      await interaction.respond(choices.slice(0, 25));
    }
  },

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
      const guildId = interaction.guild.id;
      const setting = await BotSetting.getCache({ guildId: guildId });

      switch (subcommand) {
        case "create": {
          const name = interaction.options.getString("name");
          const emoji = interaction.options.getString("emoji");
          const color = interaction.options.getString("color") || `#${Math.floor(Math.random() * 16777215).toString(16)}`;
          const owner = interaction.options.getMentionable("owner");
          const logo = interaction.options.getAttachment("logo"); // bisa null
          // const rules = interaction.options.getString("rules") || null;
          const rawRules = interaction.options.getString("rules") || null;
          const rules = rawRules
            ? rawRules
              .split(",")
              .map((rule, index) => `${index + 1}. ${rule.trim()}`)
              .join("\n")
            : null;

          // Cek apakah clan dengan nama ini sudah ada
          const existingClan = await Clan.getCache({ name: name, guildId: guildId });
          if (existingClan) {
            return interaction.editReply("❌ Clan dengan nama itu sudah ada!");
          }

          // Cek apakah user sudah punya role clan lain
          const member = await interaction.guild.members.fetch(owner.id);
          const allClans = await Clan.getAllCache({ guildId: guildId });
          const clanRoleIds = allClans.map((s) => s.roleId);
          const userClanRoles = member.roles.cache.filter((r) => clanRoleIds.includes(r.id));
          if (userClanRoles.size > 0) {
            await interaction.editReply("❌ Kamu sudah bergabung dengan clan lain. Keluar dulu sebelum membuat clan baru.");
            return;
          }

          // // Cek apakah role sudah ada
          // let role = interaction.guild.roles.cache.find((r) => r.name === name);
          // if (!role) {
          //   try {
          //     // role = await interaction.guild.roles.create({
          //     //   name: `[${emoji}] ${name}`,
          //     //   color: color,
          //     //   mentionable: true,
          //     //   hoist: true,
          //     //   reason: `Clan role created by ${interaction.user.tag}`,
          //     // });
          //     // cari role clan terakhir yang udah dibuat (yang namanya diawali dengan '[')
          //     const clanRoles = interaction.guild.roles.cache
          //       .filter((r) => r.name.startsWith("[")) // filter role clan
          //       .sort((a, b) => b.position - a.position); // urut dari atas ke bawah

          //     const lastClanRole = clanRoles.first(); // role clan tertinggi

          //     role = await interaction.guild.roles.create({
          //       name: `[${emoji}] ${name}`,
          //       color: color,
          //       mentionable: true,
          //       hoist: true,
          //       reason: `Clan role created by ${interaction.user.tag}`,
          //       position: lastClanRole ? lastClanRole.position - 1 : 0, // kalo belum ada clan, taro paling bawah
          //     });
          //   } catch (err) {
          //     console.error(err);
          //     return interaction.editReply("❌ Gagal membuat role clan. Pastikan bot punya izin MANAGE_ROLES dan warna valid!");
          //   }
          // }
          // Nama final role
          const roleName = `[${emoji}] ${name}`;

          // Cek apakah role sudah ada
          let role = interaction.guild.roles.cache.find((r) => r.name === roleName);

          if (!role) {
            try {
              // cari role clan terakhir yang udah dibuat (yang namanya diawali dengan '[')
              const clanRoles = interaction.guild.roles.cache
                .filter((r) => r.name.startsWith("[")) // filter role clan
                .sort((a, b) => b.position - a.position); // urut dari atas ke bawah

              const lastClanRole = clanRoles.first(); // role clan tertinggi

              role = await interaction.guild.roles.create({
                name: roleName,
                color: color,
                mentionable: true,
                hoist: true,
                reason: `Clan role created by ${interaction.user.tag}`,
                position: lastClanRole ? lastClanRole.position - 1 : 0, // kalo belum ada clan, taro paling bawah
              });
            } catch (err) {
              console.error(err);
              return interaction.editReply("❌ Gagal membuat role clan. Pastikan bot punya izin MANAGE_ROLES dan warna valid!");
            }
          }

          // Buat clan di database
          try {
            const clan = await Clan.create({
              guildId: interaction.guild.id,
              name,
              emoji,
              color,
              ownerId: owner.id,
              roleId: role.id,
              rules,
              logoUrl: logo.url,
              isVerified: false,
              memberId: JSON.stringify([owner.id]),
            });

            clan.saveAndUpdateCache("guildId");
            // Berikan role ke owner
            const member = interaction.guild.members.cache.get(owner.id);
            if (member) {
              await member.roles.add(role);
            }

            const embed = new EmbedBuilder()
              .setTitle(`> ✅ Clan Berhasil Dibuat!`)
              .setColor("Green")
              .setDescription(`**${name}** telah berhasil dibuat!`)
              .addFields({ name: "Owner", value: `<@${owner.id}>`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true })
              .setTimestamp();
            if (rules) {
              embed.addFields({ name: "Aturan", value: rules });
            }
            // Buat post di forum untuk clan baru
            try {
              const forumChannel = interaction.guild.channels.cache.get(setting.clanForumId);
              if (forumChannel && forumChannel.isTextBased && forumChannel.type === ChannelType.GuildForum) {
                const forumEmbed = new EmbedBuilder()
                  .setTitle(`> Thread Resmi Clan ${name}`)
                  .setDescription(`Selamat datang di thread resmi clan **${name}**!`)
                  .addFields({ name: "Owner", value: `<@${owner.id}>`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true })
                  .setColor(color)
                  .setTimestamp();
                if (rules) {
                  forumEmbed.addFields({ name: "Aturan", value: rules });
                }
                if (logo && logo.contentType?.startsWith("image/")) {
                  forumEmbed.setImage(logo.url); // langsung set gambarnya di embed
                }
                const clanThread = await forumChannel.threads.create({
                  name: `${name}`,
                  message: {
                    embeds: [forumEmbed],
                  },
                  appliedTags: [],
                  reason: `Thread clan baru dibuat oleh ${interaction.user.tag}`,
                });
                clan.threadId = clanThread.id;
                await clan.saveAndUpdateCache("guildId");
              }
            } catch (err) {
              console.error("Gagal membuat post forum clan:", err);
              // Tidak perlu gagal total, hanya log error
            }
            // Buat channel khusus clan di kategori
            const everyoneRole = interaction.guild.roles.everyone;
            const categoryId = setting.clanCategoryId;
            try {
              const channelName = `${emoji}┃${name}`;
              // Permission: hanya role clan + admin yang bisa lihat, selain itu tidak
              const permissionOverwrites = [
                {
                  id: everyoneRole.id,
                  deny: ["ViewChannel"],
                },
                {
                  id: role.id,
                  allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
                },
                // Optional: owner bisa manage channel
                {
                  id: owner.id,
                  allow: ["ViewChannel", "SendMessages", "ReadMessageHistory", "ManageChannels"],
                },
              ];
              const clanChannel = await interaction.guild.channels.create({
                name: channelName,
                type: 0, // 0 = GUILD_TEXT
                parent: categoryId,
                permissionOverwrites,
                reason: `Channel clan baru untuk ${name}`,
              });
              // Greeting message
              const clanWelcomeEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`> 🎉 Selamat datang di clan ${name}!`)
                .addFields({ name: "Owner", value: `<@${owner.id}>`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true })
                .setDescription((rules ? `**Aturan clan:**\n${rules}\n` : "") + `\nAyo mulai diskusi dan koordinasi bersama clanmu di sini!`)
                .setTimestamp()
                .setFooter(embedFooter(interaction));
              clan.channelId = clanChannel.id;
              await clan.saveAndUpdateCache("guildId");
              await clanChannel.send({ embeds: [clanWelcomeEmbed] });
            } catch (err) {
              console.error("Gagal membuat channel clan:", err);
              // Tidak perlu gagal total, hanya log error
            }
            // Buat channel voice khusus clan di kategori yang sama
            try {
              const voiceChannelName = `${emoji}┃${name}`;
              const voicePermissionOverwrites = [
                {
                  id: everyoneRole.id,
                  deny: ["ViewChannel"],
                },
                {
                  id: role.id,
                  allow: ["ViewChannel", "Connect", "Speak", "UseVAD", "Stream"],
                },
                {
                  id: owner.id,
                  allow: ["ViewChannel", "Connect", "Speak", "UseVAD", "Stream", "ManageChannels"],
                },
              ];
              const clanVoice = await interaction.guild.channels.create({
                name: voiceChannelName,
                type: 2, // 2 = GUILD_VOICE
                parent: categoryId,
                permissionOverwrites: voicePermissionOverwrites,
                reason: `Voice channel clan baru untuk ${name}`,
              });
              clan.voiceId = clanVoice.id;
              await clan.saveAndUpdateCache("guildId");
            } catch (err) {
              console.error("Gagal membuat voice channel clan:", err);
              // Tidak perlu gagal total, hanya log error
            }

            await interaction.editReply({ embeds: [embed] });
          } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Gagal membuat clan. Coba lagi nanti.");
          }
          return;
        }

        case "join": {
          const clanName = interaction.options.getString("clan");
          const member = await interaction.guild.members.fetch(interaction.user.id);

          // Cari clan di database
          const clan = await Clan.getCache({ name: clanName, guildId: guildId });
          if (!clan) {
            await interaction.editReply("❌ Clan tidak ditemukan!");
            return;
          }

          if (!clan.isVerified) {
            await interaction.editReply("❌ Clan belum diverifikasi!");
            return;
          }

          // Cari role berdasarkan ID dari database, bukan nama
          const role = interaction.guild.roles.cache.get(clan.roleId);
          if (!role) {
            await interaction.editReply("❌ Role clan tidak ditemukan di server!");
            return;
          }

          // Cek apakah user sudah punya role clan lain
          const allClans = await Clan.findAll({ where: { guildId } });
          const clanRoleIds = allClans.map((s) => s.roleId);
          const userClanRoles = member.roles.cache.filter((r) => clanRoleIds.includes(r.id));
          if (userClanRoles.size > 0) {
            await interaction.editReply("❌ Kamu sudah bergabung dengan clan lain. Keluar dulu sebelum bergabung ke clan baru.");
            return;
          }

          // Berikan role ke pengguna
          await member.roles.add(role);

          // Update daftar memberId di database
          let memberIds = [];
          try {
            memberIds = JSON.parse(clan.memberId || "[]");
          } catch (e) {
            memberIds = [];
          }
          if (!memberIds.includes(member.id)) {
            memberIds.push(member.id);
            clan.memberId = JSON.stringify(memberIds);
            await clan.saveAndUpdateCache("guildId");
          }

          // Kirim embed ke channelId dan ownerId
          const joinEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> 🎉 Anggota Baru Bergabung ke Clan")
            .setDescription(`<@${member.id}> telah bergabung ke clan **${clan.name}**!`)
            // .setImage("https://i.ibb.co.com/SwRSnRyp/giphy.gif")
            .setImage("https://i.ibb.co/PZRWhHbH/giphy.gif")
            .setTimestamp();

          // Kirim ke channel clan jika ada
          if (clan.channelId) {
            try {
              const channel = await interaction.guild.channels.fetch(clan.channelId);
              if (channel) {
                await channel.send({ embeds: [joinEmbed] });
              }
            } catch (e) {
              // Channel mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          // Kirim DM ke owner clan
          try {
            const ownerUser = await interaction.client.users.fetch(clan.ownerId);
            if (ownerUser) {
              await ownerUser.send({ embeds: [joinEmbed] });
            }
          } catch (e) {
            // Ignore DM errors
          }

          await interaction.editReply(`🎉 Selamatt kamu sekarang menjadi keluarga **${clanName}**!`);
          return;
        }

        case "leave": {
          const member = await interaction.guild.members.fetch(interaction.user.id);

          // Ambil semua clan dan roleId-nya
          const clans = await Clan.getAllCache({ guildId: guildId });
          const clanRoleIds = clans.map((clan) => clan.roleId);

          // Temukan role clan yang dimiliki user
          const rolesToRemove = member.roles.cache.filter((role) => clanRoleIds.includes(role.id));

          // Hapus role clan dari user
          if (rolesToRemove.size === 0) {
            await interaction.editReply("❌ Kamu tidak tergabung dalam clan manapun.");
            return;
          }

          // Cek apakah user adalah owner dari clan manapun
          for (const clan of clans) {
            if (rolesToRemove.has(clan.roleId) && clan.ownerId === member.id) {
              await interaction.editReply("❌ Kamu tidak bisa keluar dari clan karena kamu adalah owner. Berikan kepemilikan ke orang lain terlebih dahulu atau hapus clan.");
              return;
            }
          }

          await member.roles.remove(rolesToRemove);

          // Hapus user dari daftar memberId di setiap clan yang dia tinggalkan
          for (const clan of clans) {
            if (rolesToRemove.has(clan.roleId)) {
              let memberIds = [];
              try {
                memberIds = JSON.parse(clan.memberId || "[]");
              } catch (e) {
                memberIds = [];
              }
              if (memberIds.includes(member.id)) {
                memberIds = memberIds.filter((id) => id !== member.id);
                clan.memberId = JSON.stringify(memberIds);
                await clan.saveAndUpdateCache("guildId");
              }
            }
          }

          // Kirim embed ke owner clan dan channel clan (jika ada)
          for (const clan of clans) {
            const leaveEmbed = new EmbedBuilder()
              .setColor("Orange")
              .setTitle("> 🚪 Anggota Keluar dari Clan")
              .setDescription(`<@${member.id}> telah keluar dari clan **${clan.name}**.`)
              .setImage("https://i.ibb.co.com/CKRgxdyT/giphy.gif")
              .setTimestamp();
            if (rolesToRemove.has(clan.roleId)) {
              // Kirim DM ke owner clan
              try {
                const ownerUser = await interaction.client.users.fetch(clan.ownerId);
                await ownerUser.send({ embeds: [leaveEmbed] }).catch(() => { });
              } catch (e) {
                // Ignore DM error
              }

              // Kirim ke channel clan jika ada
              if (clan.channelId) {
                try {
                  const channel = await interaction.guild.channels.fetch(clan.channelId);
                  if (channel) {
                    await channel.send({ embeds: [leaveEmbed] });
                  }
                } catch (e) {
                  // Channel mungkin sudah dihapus, abaikan error
                }
              }
            }
          }

          await interaction.editReply("✅ Kamu telah keluar dari clan!");
          return;
        }

        case "war": {
          if (!(await checkPermission(interaction.member))) {
            return interaction.editReply({
              content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
              ephemeral: true,
            });
          }

          // Parse duration and validate
          const duration = parseDuration(interaction.options.getString("time"));
          if (!duration || isNaN(duration) || duration <= 0) {
            return interaction.editReply("❌ Durasi tidak valid. Contoh: 1h30m");
          }
          const rewardType = interaction.options.getString("reward_type");
          const rewardAmount = interaction.options.getInteger("reward_amount");
          if (!["money", "xp"].includes(rewardType)) {
            return interaction.editReply("❌ Jenis reward tidak valid.");
          }
          if (!rewardAmount || rewardAmount <= 0) {
            return interaction.editReply("❌ Jumlah reward harus lebih dari 0.");
          }
          const endTime = Date.now() + duration;
          const endTimestamp = Math.floor(endTime / 1000);

          // Ambil semua clan dari database
          const clans = await Clan.getAllCache({ guildId: guildId, isVerified: true });
          if (clans.length < 2) {
            return interaction.editReply("❌ Minimal harus ada 2 clan yang telah diverifikasi untuk perang!");
          }

          // Buat embed dengan daftar clan
          const embed = new EmbedBuilder()
            .setTitle("> ⚔️ **clan WAR** ⚔️")
            .setDescription(`Pilih clan dengan klik emoji di bawah!\nBerakhir: <t:${endTimestamp}:R>\n\n${clans.map((clan) => `**${clan.name}**`).join("\n")}`)
            .addFields({
              name: "Hadiah",
              value: `${rewardAmount} ${rewardType === "money" ? "💰" : "⭐"}`,
            })
            // .setImage("https://i.ibb.co.com/8nhH4v1q/2-PWBLDJ2-Kt-B1-X6o9v-Y.webp")
            .setImage("https://i.ibb.co.com/G4NnqRL7/giphy.gif")
            .setColor("White")
            .setFooter({
              text: `Berakhir: ${new Date(endTime).toLocaleString()}`,
            });

          const message = await interaction.channel.send({ embeds: [embed], fetchReply: true });
          await interaction.editReply("✅ War clan telah dimulaii!");
          // Tambahkan reaksi untuk setiap clan
          for (const clan of clans) {
            try {
              await message.react(clan.emoji);
            } catch (e) {
              // Jika gagal react, hapus semua reaksi dan batalkan event
              await message.reactions.removeAll().catch(() => { });
              return interaction.editReply(`❌ Gagal menambahkan reaksi emoji "${clan.emoji}" pada clan "${clan.name}". Pastikan emoji valid dan bot memiliki akses.`);
            }
          }

          // Kumpulkan reaksi
          const filter = (reaction, user) => clans.some((clan) => clan.emoji === reaction.emoji.toString()) && !user.bot;

          const collector = message.createReactionCollector({ filter, time: duration });

          collector.on("end", async (collected) => {
            // Hitung total reaksi per clan
            const results = clans.map((clan) => {
              const reaction = collected.get(clan.emoji);
              // reaction?.count: jumlah total, dikurangi 1 (bot)
              return {
                name: clan.name,
                emoji: clan.emoji,
                count: reaction ? Math.max(0, reaction.count - 1) : 0,
                roleId: clan.roleId,
              };
            });

            // Cek jika tidak ada vote sama sekali
            const totalVotes = results.reduce((acc, curr) => acc + curr.count, 0);
            if (totalVotes === 0) {
              const noVoteEmbed = new EmbedBuilder().setTitle("> 🎖️ **HASIL clan WAR**").setDescription("Tidak ada yang berpartisipasi dalam clan war.").setColor("#2b2d31");
              await message.edit({ embeds: [noVoteEmbed] });
              return;
            }

            // Tentukan pemenang (jika seri, ambil yang pertama)
            const winner = results.reduce((prev, current) => (current.count > prev.count ? current : prev), results[0]);

            // Update embed
            const resultEmbed = new EmbedBuilder()
              .setTitle("> 🎖️ **HASIL clan WAR**")
              .setDescription(`**[${winner.emoji}] ${winner.name}** menang dengan **${winner.count}** vote!\n\n` + results.map((res) => `**[${res.emoji}] ${res.name}** : ${res.count} vote`).join("\n"))
              .setImage("https://i.ibb.co.com/G4kwYNS9/giphy.gif")
              .setColor("Gold");

            await message.edit({ embeds: [resultEmbed] });

            // Beri reward ke anggota clan pemenang
            if (!winner.roleId) return; // Tidak ada roleId, tidak bisa reward
            const winnerRole = interaction.guild.roles.cache.get(winner.roleId);
            if (!winnerRole) return;

            const members = await interaction.guild.members.fetch();
            const winnerMembers = members.filter((m) => m.roles.cache.has(winnerRole.id));
            // Pastikan channel leveling tersedia sebelum digunakan
            let channel = null;
            if (setting.levelingChannelId) {
              channel = interaction.guild.channels.cache.get(setting.levelingChannelId) || null;
            }

            for (const member of winnerMembers.values()) {
              const user = await User.findOne({ where: { userId: member.id } });
              // Create a fake message object with author and guild for addXp
              const message = {
                author: {
                  id: member.id,
                  displayAvatarURL: () => member.user.displayAvatarURL(),
                  username: member.user.username,
                  tag: member.user.tag,
                  toString: () => `<@${member.id}>`,
                },
                guild: interaction.guild,
                client: interaction.client,
                member: member,
              };
              if (user) {
                if (rewardType === "money") {
                  user.cash += rewardAmount;
                } else {
                  // user.xp += rewardAmount;
                  addXp(user.guildId, user.userId, rewardAmount, message, channel);
                }
                await user.save();

                // Kirim DM embed ke user
                try {
                  const dmEmbed = new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("> 🎉 Selamat! Clan kamu menang Clan War!")
                    .setDescription(
                      `Kamu mendapatkan reward **${rewardAmount} ${rewardType === "money" ? "uang" : "XP"}** karena clan **${winner.emoji} ${winner.name}** menang!\n\nTerima kasih telah berpartisipasi!`
                    )
                    .setTimestamp()
                    .setFooter(embedFooter(interaction));
                  const userObj = await interaction.client.users.fetch(member.id);
                  await userObj.send({ embeds: [dmEmbed] }).catch(() => { });
                } catch (dmErr) {
                  // ignore DM error
                }
              }
            }
          });
          return;
        }

        case "list": {
          const guildId = interaction.guild.id;
          const clans = await Clan.getAllCache({ guildId: guildId });

          if (!clans || clans.length === 0) {
            return await interaction.editReply("❌ Tidak ada clan yang terdaftar di server ini.");
          }

          const embed = new EmbedBuilder()
            .setTitle("> 📋 Daftar Clan")
            .setColor("White")
            .addFields(
              clans.map((clan, idx) => ({
                name: `${idx + 1}. ${clan.name} ${clan.isVerified ? "<:verified:1366151614230167582>" : ""}`,
                // value: `Warna: \`${clan.color}\`\n` + `Owner: <@${clan.ownerId}>\n` + `Role: <@&${clan.roleId}>\n` + `Anggota: ${JSON.parse(clan.memberId || "[]").length}`,
                value:
                  `Warna: \`${clan.color}\`\n` +
                  `Owner: <@${clan.ownerId}>\n` +
                  `Role: <@&${clan.roleId}>\n` +
                  `Anggota: ${JSON.parse(clan.memberId || "[]")
                    .map((id) => `<@${id}>`)
                    .join(", ") || "Belum ada"
                  }`,
                inline: false,
              }))
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          return;
        }

        case "delete": {
          const name = interaction.options.getString("clan");
          const guildId = interaction.guild.id;

          // Cari clan berdasarkan nama dan guild
          const clan = await Clan.getCache({ name: name, guildId: guildId });
          if (!clan) {
            return await interaction.editReply("❌ Clan tidak ditemukan.");
          }

          // Hanya owner clan atau admin yang bisa hapus
          const isOwner = clan.ownerId === interaction.user.id;
          const member = await interaction.guild.members.fetch(interaction.user.id);
          const isAdmin = member.permissions.has("Administrator");
          if (!isOwner && !isAdmin) {
            return await interaction.editReply("❌ Hanya owner clan atau admin yang bisa menghapus clan ini.");
          }
          // Hapus role clan jika ada
          try {
            const role = interaction.guild.roles.cache.get(clan.roleId);
            if (role) {
              await role.delete("Clan deleted via /clan delete");
            }
          } catch (err) {
            console.log("Role tidak bisa dihapus");
            // Role mungkin sudah dihapus, abaikan error
          }

          // Hapus channelId jika ada
          if (clan.channelId) {
            try {
              const channel = interaction.guild.channels.cache.get(clan.channelId);
              if (channel) {
                await channel.delete("Clan deleted via /clan delete");
              }
            } catch (err) {
              // Channel mungkin sudah dihapus, abaikan error
              console.log("Channel tidak bisa dihapus");
            }
          }

          // Hapus voiceId jika ada
          if (clan.voiceId) {
            try {
              const voiceChannel = interaction.guild.channels.cache.get(clan.voiceId);
              if (voiceChannel) {
                await voiceChannel.delete("Clan deleted via /clan delete");
              }
            } catch (err) {
              // Voice channel mungkin sudah dihapus, abaikan error
              console.log("Voice tidak bisa dihapus");
            }
          }

          // Hapus threadId jika ada
          if (clan.threadId) {
            try {
              const thread = interaction.guild.channels.cache.get(clan.threadId);
              if (thread) {
                await thread.delete("Clan deleted via /clan delete");
              }
            } catch (err) {
              // Thread mungkin sudah dihapus, abaikan error
              console.log("threat tidak bisa dihapus");
            }
          }

          // Hapus clan dari database
          await clan.destroy();

          await interaction.editReply(`✅ Clan **${clan.name}** berhasil dihapus!`);
          return;
        }

        case "verify": {
          // Only allow admins to verify clans
          if (!(await checkPermission(interaction.member))) {
            return interaction.editReply({
              content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
              ephemeral: true,
            });
          }

          const clanName = interaction.options.getString("clan");
          const clan = await Clan.getCache({ name: clanName, guildId: guildId });

          if (!clan) {
            return interaction.editReply("❌ Clan tidak ditemukan.");
          }

          if (clan.isVerified) {
            return interaction.editReply(`✅ Clan **${clan.name}** sudah terverifikasi sebelumnya.`);
          }

          clan.isVerified = true;
          await clan.saveAndUpdateCache("guildId");

          // Optionally, send a message to the clan owner
          try {
            const ownerUser = await interaction.client.users.fetch(clan.ownerId);
            const verifyEmbed = new EmbedBuilder()
              .setColor("Green")
              .setTitle("> <:verified:1366151614230167582> Clan Terverifikasi!")
              .setDescription(`Clan kamu **${clan.name}** telah diverifikasi oleh admin server!`)
              .setImage("https://i.ibb.co.com/SwRSnRyp/giphy.gif")
              .setTimestamp();

            await ownerUser.send({ embeds: [verifyEmbed] });
          } catch (e) {
            // Ignore DM errors
          }

          // Ubah nama thread jika ada
          if (clan.threadId) {
            try {
              const thread = await interaction.guild.channels.fetch(clan.threadId);
              if (thread) {
                await thread.setName(`${clan.name} ✅`);
              }
            } catch (e) {
              // Thread mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          // Kirim embed verifikasi ke thread (jika ada)
          const verifiedEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> <:verified:1366151614230167582> Clan Terverifikasi!")
            .setDescription(`<@&${clan.roleId}> \nClan **${clan.name}** telah diverifikasi oleh admin server!`)
            .setImage("https://i.ibb.co.com/SwRSnRyp/giphy.gif")
            .setTimestamp();

          if (clan.threadId) {
            try {
              const thread = await interaction.guild.channels.fetch(clan.threadId);
              if (thread) {
                await thread.send({ embeds: [verifiedEmbed] });
              }
            } catch (e) {
              console.log("❌ Error ketika mengirim embed verified");
              // Thread mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          if (clan.channelId) {
            try {
              const channel = await interaction.guild.channels.fetch(clan.channelId);
              if (channel) {
                await channel.send({ embeds: [verifiedEmbed] });
              }
            } catch (e) {
              console.log("❌ Error ketika mengirim embed verified");
              // Thread mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          await interaction.editReply(`✅ Clan **${clan.name}** berhasil diverifikasi!`);
          return;
        }

        case "transfer": {
          const clanName = interaction.options.getString("clan");
          const newOwner = interaction.options.getMentionable("owner");

          // Cari clan di database
          const clan = await Clan.getCache({ name: clanName, guildId: guildId });
          if (!clan) {
            await interaction.editReply("❌ Clan tidak ditemukan!");
            return;
          }

          // Cek apakah user adalah owner clan saat ini
          if (clan.ownerId !== interaction.user.id) {
            await interaction.editReply("❌ Hanya owner clan yang bisa mentransfer kepemilikan!");
            return;
          }

          // Cek apakah new owner adalah member clan
          let memberIds = [];
          try {
            memberIds = JSON.parse(clan.memberId || "[]");
          } catch (e) {
            memberIds = [];
          }

          if (!memberIds.includes(newOwner.id)) {
            await interaction.editReply("❌ User yang dituju harus menjadi member clan terlebih dahulu!");
            return;
          }

          // Update owner di database
          clan.ownerId = newOwner.id;
          await clan.saveAndUpdateCache("guildId");

          // Update permission channel clan jika ada
          if (clan.channelId) {
            try {
              const channel = await interaction.guild.channels.fetch(clan.channelId);
              if (channel) {
                await channel.permissionOverwrites.edit(interaction.user.id, {
                  ManageChannels: false,
                  ManageMessages: false,
                });
                await channel.permissionOverwrites.edit(newOwner.id, {
                  ManageChannels: true,
                  ManageMessages: true,
                });
              }
            } catch (e) {
              console.log("❌ Error ketika update permission channel");
            }
          }

          // Update permission voice channel jika ada
          if (clan.voiceId) {
            try {
              const voiceChannel = await interaction.guild.channels.fetch(clan.voiceId);
              if (voiceChannel) {
                await voiceChannel.permissionOverwrites.edit(interaction.user.id, {
                  ManageChannels: false,
                });
                await voiceChannel.permissionOverwrites.edit(newOwner.id, {
                  ManageChannels: true,
                });
              }
            } catch (e) {
              console.log("❌ Error ketika update permission voice channel");
            }
          }

          const transferEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> ✅ Transfer Owner Berhasil!")
            .setDescription(`Kepemilikan clan **${clan.name}** telah ditransfer dari <@${interaction.user.id}> ke <@${newOwner.id}>`)
            .setTimestamp();

          // Kirim notifikasi ke channel clan
          if (clan.channelId) {
            try {
              const channel = await interaction.guild.channels.fetch(clan.channelId);
              if (channel) {
                await channel.send({ embeds: [transferEmbed] });
              }
            } catch (e) {
              console.log("❌ Error ketika mengirim notifikasi transfer");
            }
          }

          await interaction.editReply({ embeds: [transferEmbed] });
          return;
        }
      }
    } catch (error) {
      console.error("Error during clan command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /clan`).setDescription(`\`\`\`${error}\`\`\``).setFooter({ text: `Error dari server ${interaction.guild.name}` }).setTimestamp();

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
