const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");
const User = require("../../database/models/User");
const Squad = require("../../database/models/Squad"); // Import model Squad
const BotSetting = require("../../database/models/BotSetting"); // Import model Squad
const { parseDuration, addXp, checkPermission } = require("../../helpers");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("squad")
    .setDescription("Command squad.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Buat squad baru.")
        .addStringOption((option) => option.setName("name").setDescription("Nama squad").setRequired(true))
        .addStringOption((option) => option.setName("emoji").setDescription("Emoji squad").setRequired(true))
        .addStringOption((option) => option.setName("color").setDescription("Warna squad (hex, contoh: #ff0000)").setRequired(true))
        .addMentionableOption((option) => option.setName("owner").setDescription("Ketua atau owner squad").setRequired(true))
        .addStringOption((option) => option.setName("rules").setDescription("Aturan squad (opsional)").setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("war")
        .setDescription("Mulai perang squad.")
        .addStringOption((option) => option.setName("time").setDescription("Durasi perang (contoh: 1h30m)").setRequired(true))
        .addStringOption((option) => option.setName("reward_type").setDescription("Jenis reward").setRequired(true).addChoices({ name: "Uang", value: "money" }, { name: "XP", value: "xp" }))
        .addIntegerOption((option) => option.setName("reward_amount").setDescription("Jumlah reward").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("join")
        .setDescription("Bergabung ke squad.")
        .addStringOption(
          (option) => option.setName("squad").setDescription("Nama squad").setRequired(true).setAutocomplete(true) // Aktifkan autocomplete
        )
    )
    .addSubcommand((subcommand) => subcommand.setName("leave").setDescription("Keluar dari squad."))
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Hapus squad yang ada.")
        .addStringOption((option) => option.setName("squad").setDescription("Nama squad yang ingin dihapus").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("verify")
        .setDescription("Verify suatu squad")
        .addStringOption((option) => option.setName("squad").setDescription("Nama squad yang ingin dihapus").setRequired(true).setAutocomplete(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("List semua squad.")),

  async autocomplete(interaction) {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "squad") {
      const squads = await Squad.findAll({ where: { guildId: interaction.guild.id } });
      const choices = squads.map((squad) => ({
        name: `[${squad.emoji}] ${squad.name}`,
        value: squad.name,
      }));
      // Discord only allows up to 25 choices in autocomplete
      await interaction.respond(choices.slice(0, 25));
    }
  },

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const setting = BotSetting.getCache({ guildId: guildId });
      switch (subcommand) {
        case "create": {
          const name = interaction.options.getString("name");
          const emoji = interaction.options.getString("emoji");
          const color = interaction.options.getString("color");
          const owner = interaction.options.getMentionable("owner");
          const rules = interaction.options.getString("rules") || null;

          // Cek apakah squad dengan nama ini sudah ada
          const existingSquad = await Squad.findOne({ where: { name } });
          if (existingSquad) {
            return interaction.editReply("❌ Squad dengan nama itu sudah ada!");
          }

          // Cek apakah role sudah ada
          let role = interaction.guild.roles.cache.find((r) => r.name === name);
          if (!role) {
            try {
              role = await interaction.guild.roles.create({
                name: `[${emoji}] ${name}`,
                color: color,
                mentionable: true,
                reason: `Squad role created by ${interaction.user.tag}`,
              });
            } catch (err) {
              console.error(err);
              return interaction.editReply("❌ Gagal membuat role squad. Pastikan bot punya izin MANAGE_ROLES dan warna valid!");
            }
          }

          // Buat squad di database
          try {
            const squad = await Squad.create({
              guildId: interaction.guild.id,
              name,
              emoji,
              color,
              ownerId: owner.id,
              roleId: role.id,
              rules,
              isVerified: false,
              memberId: JSON.stringify([owner.id]),
            });

            // Berikan role ke owner
            const member = interaction.guild.members.cache.get(owner.id);
            if (member) {
              await member.roles.add(role);
            }

            const embed = new EmbedBuilder()
              .setTitle(`> ✅ Squad Berhasil Dibuat!`)
              .setColor("Green")
              .setDescription(`**[${emoji}] ${name}** telah berhasil dibuat!`)
              .addFields({ name: "Owner", value: `<@${owner.id}>`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true })
              .setTimestamp();
            if (rules) {
              embed.addFields({ name: "Aturan", value: rules });
            }
            // Buat post di forum (channel id: 1365979218948915211) untuk squad baru
            try {
              const forumChannel = interaction.guild.channels.cache.get("1365979218948915211");
              if (forumChannel && forumChannel.isTextBased && forumChannel.type === ChannelType.GuildForum) {
                const forumEmbed = new EmbedBuilder()
                  .setTitle(`> Thread Resmi Squad [${emoji}] ${name}`)
                  .setDescription(`Selamat datang di thread resmi squad **[${emoji}] ${name}**!`)
                  .addFields({ name: "Owner", value: `<@${owner.id}>`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true })
                  .setColor(color)
                  .setTimestamp();
                if (rules) {
                  forumEmbed.addFields({ name: "Aturan", value: rules });
                }
                const squadThread = await forumChannel.threads.create({
                  name: `[${emoji}] ${name}`,
                  message: {
                    embeds: [forumEmbed],
                  },
                  appliedTags: [],
                  reason: `Thread squad baru dibuat oleh ${interaction.user.tag}`,
                });
                squad.threadId = squadThread.id;
                await squad.save();
              }
            } catch (err) {
              console.error("Gagal membuat post forum squad:", err);
              // Tidak perlu gagal total, hanya log error
            }
            // Buat channel khusus squad di kategori 1365978998190112878
            const everyoneRole = interaction.guild.roles.everyone;
            const categoryId = "1365978998190112878";
            try {
              const channelName = `${emoji}┃${name}`;
              // Permission: hanya role squad + admin yang bisa lihat, selain itu tidak
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
              const squadChannel = await interaction.guild.channels.create({
                name: channelName,
                type: 0, // 0 = GUILD_TEXT
                parent: categoryId,
                permissionOverwrites,
                reason: `Channel squad baru untuk ${name}`,
              });
              // Greeting message
              const squadWelcomeEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`> 🎉 Selamat datang di squad [${emoji}] ${name}!`)
                .addFields({ name: "Owner", value: `<@${owner.id}>`, inline: true }, { name: "Role", value: `<@&${role.id}>`, inline: true })
                .setDescription((rules ? `**Aturan squad:**\n${rules}\n` : "") + `\nAyo mulai diskusi dan koordinasi bersama squadmu di sini!`)
                .setTimestamp()
                .setFooter({ text: "Squad System", iconURL: interaction.client.user.displayAvatarURL() });
              squad.channelId = squadChannel.id;
              await squad.save();
              await squadChannel.send({ embeds: [squadWelcomeEmbed] });
            } catch (err) {
              console.error("Gagal membuat channel squad:", err);
              // Tidak perlu gagal total, hanya log error
            }
            // Buat channel voice khusus squad di kategori yang sama
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
              const squadVoice = await interaction.guild.channels.create({
                name: voiceChannelName,
                type: 2, // 2 = GUILD_VOICE
                parent: categoryId,
                permissionOverwrites: voicePermissionOverwrites,
                reason: `Voice channel squad baru untuk ${name}`,
              });
              squad.voiceId = squadVoice.id;
              await squad.save();
            } catch (err) {
              console.error("Gagal membuat voice channel squad:", err);
              // Tidak perlu gagal total, hanya log error
            }

            await interaction.editReply({ embeds: [embed] });
          } catch (err) {
            console.error(err);
            await interaction.editReply("❌ Gagal membuat squad. Coba lagi nanti.");
          }
          return;
        }

        case "join": {
          const squadName = interaction.options.getString("squad");
          const member = await interaction.guild.members.fetch(interaction.user.id);

          // Cari squad di database
          const squad = await Squad.findOne({ where: { name: squadName } });
          if (!squad) {
            await interaction.editReply("❌ Squad tidak ditemukan!");
            return;
          }

          if (!squad.isVerified) {
            await interaction.editReply("❌ Squad belum diverifikasi!");
            return;
          }

          // Cari role berdasarkan ID dari database, bukan nama
          const role = interaction.guild.roles.cache.get(squad.roleId);
          if (!role) {
            await interaction.editReply("❌ Role squad tidak ditemukan di server!");
            return;
          }

          // Cek apakah user sudah punya role squad lain
          const allSquads = await Squad.findAll();
          const squadRoleIds = allSquads.map((s) => s.roleId);
          const userSquadRoles = member.roles.cache.filter((r) => squadRoleIds.includes(r.id));
          if (userSquadRoles.size > 0) {
            await interaction.editReply("❌ Kamu sudah bergabung dengan squad lain. Keluar dulu sebelum bergabung ke squad baru.");
            return;
          }

          // Berikan role ke pengguna
          await member.roles.add(role);

          // Update daftar memberId di database
          let memberIds = [];
          try {
            memberIds = JSON.parse(squad.memberId || "[]");
          } catch (e) {
            memberIds = [];
          }
          if (!memberIds.includes(member.id)) {
            memberIds.push(member.id);
            squad.memberId = JSON.stringify(memberIds);
            await squad.save();
          }

          // Kirim embed ke channelId dan ownerId
          const joinEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> 🎉 Anggota Baru Bergabung ke Squad")
            .setDescription(`<@${member.id}> telah bergabung ke squad **[${squad.emoji}] ${squad.name}**!`)
            .setImage("https://i.ibb.co.com/SwRSnRyp/giphy.gif")
            .setTimestamp();

          // Kirim ke channel squad jika ada
          if (squad.channelId) {
            try {
              const channel = await interaction.guild.channels.fetch(squad.channelId);
              if (channel) {
                await channel.send({ embeds: [joinEmbed] });
              }
            } catch (e) {
              // Channel mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          // Kirim DM ke owner squad
          try {
            const ownerUser = await interaction.client.users.fetch(squad.ownerId);
            if (ownerUser) {
              await ownerUser.send({ embeds: [joinEmbed] });
            }
          } catch (e) {
            // Ignore DM errors
          }

          await interaction.editReply(`🎉 Selamatt kamu sekarang menjadi keluarga **[${squad.emoji}] ${squadName}**!`);
          return;
        }

        case "leave": {
          const member = await interaction.guild.members.fetch(interaction.user.id);

          // Ambil semua squad dan roleId-nya
          const squads = await Squad.findAll();
          const squadRoleIds = squads.map((squad) => squad.roleId);

          // Temukan role squad yang dimiliki user
          const rolesToRemove = member.roles.cache.filter((role) => squadRoleIds.includes(role.id));

          // Hapus role squad dari user
          if (rolesToRemove.size === 0) {
            await interaction.editReply("❌ Kamu tidak tergabung dalam squad manapun.");
            return;
          }

          await member.roles.remove(rolesToRemove);

          // Hapus user dari daftar memberId di setiap squad yang dia tinggalkan
          for (const squad of squads) {
            if (rolesToRemove.has(squad.roleId)) {
              let memberIds = [];
              try {
                memberIds = JSON.parse(squad.memberId || "[]");
              } catch (e) {
                memberIds = [];
              }
              if (memberIds.includes(member.id)) {
                memberIds = memberIds.filter((id) => id !== member.id);
                squad.memberId = JSON.stringify(memberIds);
                await squad.save();
              }
            }
          }

          // Kirim embed ke owner squad dan channel squad (jika ada)
          for (const squad of squads) {
            const leaveEmbed = new EmbedBuilder()
              .setColor("Orange")
              .setTitle("> 🚪 Anggota Keluar dari Squad")
              .setDescription(`<@${member.id}> telah keluar dari squad **[${squad.emoji}] ${squad.name}**.`)
              .setImage("https://i.ibb.co.com/CKRgxdyT/giphy.gif")
              .setTimestamp();
            if (rolesToRemove.has(squad.roleId)) {
              // Kirim DM ke owner squad
              try {
                const ownerUser = await interaction.client.users.fetch(squad.ownerId);
                await ownerUser.send({ embeds: [leaveEmbed] }).catch(() => {});
              } catch (e) {
                // Ignore DM error
              }

              // Kirim ke channel squad jika ada
              if (squad.channelId) {
                try {
                  const channel = await interaction.guild.channels.fetch(squad.channelId);
                  if (channel) {
                    await channel.send({ embeds: [leaveEmbed] });
                  }
                } catch (e) {
                  // Channel mungkin sudah dihapus, abaikan error
                }
              }
            }
          }

          await interaction.editReply("✅ Kamu telah keluar dari squad!");
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

          // Ambil semua squad dari database
          const squads = await Squad.findAll({ where: { isVerified: true } });
          if (squads.length < 2) {
            return interaction.editReply("❌ Minimal harus ada 2 squad yang telah diverifikasi untuk perang!");
          }

          // Buat embed dengan daftar squad
          const embed = new EmbedBuilder()
            .setTitle("> ⚔️ **SQUAD WAR** ⚔️")
            .setDescription(`Pilih squad dengan klik emoji di bawah!\nBerakhir: <t:${endTimestamp}:R>\n\n${squads.map((squad) => `**[${squad.emoji}] ${squad.name}**`).join("\n")}`)
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
          await interaction.editReply("✅ War squad telah dimulaii!");
          // Tambahkan reaksi untuk setiap squad
          for (const squad of squads) {
            try {
              await message.react(squad.emoji);
            } catch (e) {
              // Jika gagal react, hapus semua reaksi dan batalkan event
              await message.reactions.removeAll().catch(() => {});
              return interaction.editReply(`❌ Gagal menambahkan reaksi emoji "${squad.emoji}" pada squad "${squad.name}". Pastikan emoji valid dan bot memiliki akses.`);
            }
          }

          // Kumpulkan reaksi
          const filter = (reaction, user) => squads.some((squad) => squad.emoji === reaction.emoji.toString()) && !user.bot;

          const collector = message.createReactionCollector({ filter, time: duration });

          collector.on("end", async (collected) => {
            // Hitung total reaksi per squad
            const results = squads.map((squad) => {
              const reaction = collected.get(squad.emoji);
              // reaction?.count: jumlah total, dikurangi 1 (bot)
              return {
                name: squad.name,
                emoji: squad.emoji,
                count: reaction ? Math.max(0, reaction.count - 1) : 0,
                roleId: squad.roleId,
              };
            });

            // Cek jika tidak ada vote sama sekali
            const totalVotes = results.reduce((acc, curr) => acc + curr.count, 0);
            if (totalVotes === 0) {
              const noVoteEmbed = new EmbedBuilder().setTitle("> 🎖️ **HASIL SQUAD WAR**").setDescription("Tidak ada yang berpartisipasi dalam squad war.").setColor("#2b2d31");
              await message.edit({ embeds: [noVoteEmbed] });
              return;
            }

            // Tentukan pemenang (jika seri, ambil yang pertama)
            const winner = results.reduce((prev, current) => (current.count > prev.count ? current : prev), results[0]);

            // Update embed
            const resultEmbed = new EmbedBuilder()
              .setTitle("> 🎖️ **HASIL SQUAD WAR**")
              .setDescription(`**[${winner.emoji}] ${winner.name}** menang dengan **${winner.count}** vote!\n\n` + results.map((res) => `**[${res.emoji}] ${res.name}** : ${res.count} vote`).join("\n"))
              .setImage("https://i.ibb.co.com/G4kwYNS9/giphy.gif")
              .setColor("Gold");

            await message.edit({ embeds: [resultEmbed] });

            // Beri reward ke anggota squad pemenang
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
                  addXp(user.userId, rewardAmount, message, channel);
                }
                await user.save();

                // Kirim DM embed ke user
                try {
                  const dmEmbed = new EmbedBuilder()
                    .setColor("Gold")
                    .setTitle("> 🎉 Selamat! Squad kamu menang Squad War!")
                    .setDescription(
                      `Kamu mendapatkan reward **${rewardAmount} ${rewardType === "money" ? "uang" : "XP"}** karena squad **${winner.emoji} ${winner.name}** menang!\n\nTerima kasih telah berpartisipasi!`
                    )
                    .setTimestamp()
                    .setFooter({ text: "Squad War", iconURL: interaction.client.user.displayAvatarURL() });
                  const userObj = await interaction.client.users.fetch(member.id);
                  await userObj.send({ embeds: [dmEmbed] }).catch(() => {});
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
          const squads = await Squad.findAll({ where: { guildId } });

          if (!squads || squads.length === 0) {
            return await interaction.editReply("❌ Tidak ada squad yang terdaftar di server ini.");
          }

          const embed = new EmbedBuilder()
            .setTitle("> 📋 Daftar Squad")
            .setColor("White")
            .addFields(
              squads.map((squad, idx) => ({
                name: `${idx + 1}. [${squad.emoji}] ${squad.name} ${squad.isVerified ? "<:verified:1366151614230167582>" : ""}`,
                value: `Warna: \`${squad.color}\`\n` + `Owner: <@${squad.ownerId}>\n` + `Role: <@&${squad.roleId}>\n` + `Anggota: ${JSON.parse(squad.memberId || "[]").length}`,
                inline: false,
              }))
            )
            .setTimestamp();

          await interaction.editReply({ embeds: [embed] });
          return;
        }

        case "delete": {
          const name = interaction.options.getString("squad");
          const guildId = interaction.guild.id;

          // Cari squad berdasarkan nama dan guild
          const squad = await Squad.findOne({ where: { name, guildId } });
          if (!squad) {
            return await interaction.editReply("❌ Squad tidak ditemukan.");
          }

          // Hanya owner squad atau admin yang bisa hapus
          const isOwner = squad.ownerId === interaction.user.id;
          const member = await interaction.guild.members.fetch(interaction.user.id);
          const isAdmin = member.permissions.has("Administrator");
          if (!isOwner && !isAdmin) {
            return await interaction.editReply("❌ Hanya owner squad atau admin yang bisa menghapus squad ini.");
          }

          // Hapus role squad jika ada
          try {
            const role = interaction.guild.roles.cache.get(squad.roleId);
            if (role) {
              await role.delete("Squad deleted via /squad delete");
            }
          } catch (err) {
            console.log("Role tidak bisa dihapus");
            // Role mungkin sudah dihapus, abaikan error
          }

          // Hapus channelId jika ada
          if (squad.channelId) {
            try {
              const channel = interaction.guild.channels.cache.get(squad.channelId);
              if (channel) {
                await channel.delete("Squad deleted via /squad delete");
              }
            } catch (err) {
              // Channel mungkin sudah dihapus, abaikan error
              console.log("Channel tidak bisa dihapus");
            }
          }

          // Hapus voiceId jika ada
          if (squad.voiceId) {
            try {
              const voiceChannel = interaction.guild.channels.cache.get(squad.voiceId);
              if (voiceChannel) {
                await voiceChannel.delete("Squad deleted via /squad delete");
              }
            } catch (err) {
              // Voice channel mungkin sudah dihapus, abaikan error
              console.log("Voice tidak bisa dihapus");
            }
          }

          // Hapus threadId jika ada
          if (squad.threadId) {
            try {
              const thread = interaction.guild.channels.cache.get(squad.threadId);
              if (thread) {
                await thread.delete("Squad deleted via /squad delete");
              }
            } catch (err) {
              // Thread mungkin sudah dihapus, abaikan error
              console.log("threat tidak bisa dihapus");
            }
          }

          // Hapus squad dari database
          await squad.destroy();

          await interaction.editReply(`✅ Squad **${squad.emoji} ${squad.name}** berhasil dihapus!`);
          return;
        }

        case "verify": {
          // Only allow admins to verify squads
          if (!(await checkPermission(interaction.member))) {
            return interaction.editReply({
              content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
              ephemeral: true,
            });
          }

          const squadName = interaction.options.getString("squad");
          const squad = await Squad.findOne({ where: { name: squadName, guildId } });

          if (!squad) {
            return interaction.editReply("❌ Squad tidak ditemukan.");
          }

          if (squad.isVerified) {
            return interaction.editReply(`✅ Squad **[${squad.emoji}] ${squad.name}** sudah terverifikasi sebelumnya.`);
          }

          squad.isVerified = true;
          await squad.save();

          // Optionally, send a message to the squad owner
          try {
            const ownerUser = await interaction.client.users.fetch(squad.ownerId);
            const verifyEmbed = new EmbedBuilder()
              .setColor("Green")
              .setTitle("> <:verified:1366151614230167582> Squad Terverifikasi!")
              .setDescription(`Squad kamu **[${squad.emoji}] ${squad.name}** telah diverifikasi oleh admin server!`)
              .setImage("https://i.ibb.co.com/SwRSnRyp/giphy.gif")
              .setTimestamp();

            await ownerUser.send({ embeds: [verifyEmbed] });
          } catch (e) {
            // Ignore DM errors
          }

          // Ubah nama thread jika ada
          if (squad.threadId) {
            try {
              const thread = await interaction.guild.channels.fetch(squad.threadId);
              if (thread) {
                await thread.setName(`[${squad.emoji}] ${squad.name} ✅`);
              }
            } catch (e) {
              // Thread mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          // Kirim embed verifikasi ke thread (jika ada)
          const verifiedEmbed = new EmbedBuilder()
            .setColor("Green")
            .setTitle("> <:verified:1366151614230167582> Squad Terverifikasi!")
            .setDescription(`<@&${squad.roleId}> \nSquad **[${squad.emoji}] ${squad.name}** telah diverifikasi oleh admin server!`)
            .setImage("https://i.ibb.co.com/SwRSnRyp/giphy.gif")
            .setTimestamp();

          if (squad.threadId) {
            try {
              const thread = await interaction.guild.channels.fetch(squad.threadId);
              if (thread) {
                await thread.send({ embeds: [verifiedEmbed] });
              }
            } catch (e) {
              console.log("❌ Error ketika mengirim embed verified");
              // Thread mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          if (squad.channelId) {
            try {
              const channel = await interaction.guild.channels.fetch(squad.channelId);
              if (channel) {
                await channel.send({ embeds: [verifiedEmbed] });
              }
            } catch (e) {
              console.log("❌ Error ketika mengirim embed verified");
              // Thread mungkin sudah dihapus atau tidak ditemukan, abaikan error
            }
          }

          await interaction.editReply(`✅ Squad **[${squad.emoji}] ${squad.name}** berhasil diverifikasi!`);
          return;
        }
      }
    } catch (error) {
      console.error("Error during squad command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /squad`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

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
