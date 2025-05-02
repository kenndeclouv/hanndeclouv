// file: commands/setting/setting.js
const { SlashCommandBuilder, EmbedBuilder, WebhookClient, ChannelType } = require("discord.js");
const BotSetting = require("../../database/models/BotSetting");
const { checkPermission } = require("../../helpers");
require("dotenv").config();
const builder = new SlashCommandBuilder()
  .setName("set")
  .setDescription("Konfigurasi pengaturan Bot")
  // AUTOMOD
  .addSubcommandGroup((group) =>
    group
      .setName("automod")
      .setDescription("Pengaturan automod")
      .addSubcommand((sub) =>
        sub
          .setName("whitelist")
          .setDescription("Tambah/hapus dari whitelist")
          .addStringOption((opt) => opt.setName("action").setDescription("Tambah/hapus").setRequired(true).addChoices({ name: "Tambahkan", value: "add" }, { name: "Hapus", value: "remove" }))
          .addMentionableOption((opt) => opt.setName("target").setDescription("User/role").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("badwords")
          .setDescription("Tambah/hapus kata kasar")
          .addStringOption((opt) => opt.setName("action").setDescription("Tambah/hapus").setRequired(true).addChoices({ name: "Tambahkan", value: "add" }, { name: "Hapus", value: "remove" }))
          .addStringOption((opt) => opt.setName("word").setDescription("Kata").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("exception-channel")
          .setDescription("Tambah/hapus pengecualian channel")
          .addStringOption((opt) => opt.setName("action").setDescription("Tambah/hapus").setRequired(true).addChoices({ name: "Tambahkan", value: "add" }, { name: "Hapus", value: "remove" }))
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel untuk pengecualian").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("log-channel")
          .setDescription("Channel untuk dijadikan log automod")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Pilih channel untuk dijadikan log automod").setRequired(true))
      )
      .addSubcommand((sub) => sub.setName("badwords-list").setDescription("Lihat daftar badwords"))
      .addSubcommand((sub) => sub.setName("exception-channel-list").setDescription("Lihat channel yang dikecualikan"))
      .addSubcommand((sub) => sub.setName("whitelist-list").setDescription("Lihat whitelist"))
  )
  // ON OFF FITUR
  .addSubcommandGroup((group) =>
    group
      .setName("fitur")
      .setDescription("Aktif atau Nonaktifkan fitur di server ini")
      .addSubcommand((sub) =>
        sub
          .setName("anti-invites")
          .setDescription("Aktif/nonaktifkan deteksi tautan undangan")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("anti-links")
          .setDescription("Aktif/nonaktifkan deteksi tautan umum")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("anti-spam")
          .setDescription("Aktif/nonaktifkan deteksi spam")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("anti-badwords")
          .setDescription("Aktif/nonaktifkan ban kata kasar")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("server-stats")
          .setDescription("Aktif/nonaktif server stats")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("economy")
          .setDescription("Aktif/nonaktif fitur economy")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("giveaway")
          .setDescription("Aktif/nonaktif fitur giveaway")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("invites")
          .setDescription("Aktif/nonaktif fitur invites")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("suggestion")
          .setDescription("Aktif/nonaktif fitur suggestion")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("ticket")
          .setDescription("Aktif/nonaktif fitur ticket")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("pet")
          .setDescription("Aktif/nonaktif fitur pet")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("squad")
          .setDescription("Aktif/nonaktif fitur squad")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("adventure")
          .setDescription("Aktif/nonaktif fitur adventure")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("leveling")
          .setDescription("Aktif/nonaktif fitur leveling")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("welcome-in")
          .setDescription("Aktif/nonaktif fitur welcome in")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("welcome-out")
          .setDescription("Aktif/nonaktif fitur welcome out")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("nsfw")
          .setDescription("Aktif/nonaktif fitur konten nsfw")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("checklist")
          .setDescription("Aktif/nonaktif fitur checklist")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
      .addSubcommand((sub) =>
        sub
          .setName("minecraft-stats")
          .setDescription("Aktif/nonaktif fitur minecraft server stats")
          .addStringOption((opt) => opt.setName("status").setDescription("Aktifkan/nonaktifkan").setRequired(true).addChoices({ name: "Aktifkan", value: "enable" }, { name: "Nonaktifkan", value: "disable" }))
      )
  )
  // SERVER STATS
  .addSubcommandGroup((group) =>
    group
      .setName("stats")
      .setDescription("Pengaturan statistik server")
      .addSubcommand((sub) =>
        sub
          .setName("member-count-channel")
          .setDescription("Set channel total member")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel untuk stats").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("online-count-channel")
          .setDescription("Set channel member online")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel untuk stats").setRequired(true))
      )
  )
  // ADMINS
  .addSubcommandGroup((group) =>
    group
      .setName("admin")
      .setDescription("Pengaturan admin bot")
      .addSubcommand((sub) =>
        sub
          .setName("edit")
          .setDescription("Tambah/hapus admin")
          .addStringOption((opt) => opt.setName("action").setDescription("Tambah/hapus").setRequired(true).addChoices({ name: "Tambahkan", value: "add" }, { name: "Hapus", value: "remove" }))
          .addMentionableOption((opt) => opt.setName("target").setDescription("User/role admin").setRequired(true))
      )
      .addSubcommand((sub) => sub.setName("admin-list").setDescription("Lihat daftar admin"))
  )
  // WELCOME IN - OUT
  .addSubcommandGroup((group) =>
    group
      .setName("welcome")
      .setDescription("Pengaturan sistem welcome")
      .addSubcommand((sub) =>
        sub
          .setName("in-channel")
          .setDescription("Set channel welcome in")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel welcome in").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("out-channel")
          .setDescription("Set channel welcome out")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel welcome out").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("role")
          .setDescription("Set role welcome")
          .addRoleOption((opt) => opt.setName("role").setDescription("Role untuk welcome").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("in-text")
          .setDescription("Set teks welcome in")
          .addStringOption((opt) => opt.setName("text").setDescription("Teks untuk welcome in").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("out-text")
          .setDescription("Set teks welcome out")
          .addStringOption((opt) => opt.setName("text").setDescription("Teks untuk welcome out").setRequired(true))
      )
  )
  // COOLDOWN
  .addSubcommandGroup((group) =>
    group
      .setName("cooldown")
      .setDescription("Pengaturan cooldown dalam sistem")
      .addSubcommand((sub) =>
        sub
          .setName("daily")
          .setDescription("Set cooldown daily")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("beg")
          .setDescription("Set cooldown beg")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("lootbox")
          .setDescription("Set cooldown lootbox")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("work")
          .setDescription("Set cooldown work")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("rob")
          .setDescription("Set cooldown rob")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("hack")
          .setDescription("Set cooldown hack")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("pet")
          .setDescription("Set cooldown pet")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("gacha")
          .setDescription("Set cooldown gacha")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
  )
  // LEVELING
  .addSubcommandGroup((group) =>
    group
      .setName("leveling")
      .setDescription("Pengaturan sistem leveling")
      .addSubcommand((sub) =>
        sub
          .setName("channel")
          .setDescription("Set channel untuk pesan level up")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel untuk pesan level up").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("cooldown")
          .setDescription("Set cooldown mendapatkan XP")
          .addIntegerOption((opt) => opt.setName("cooldown").setDescription("Cooldown dalam detik").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("xp")
          .setDescription("Set jumlah XP per pesan")
          .addIntegerOption((opt) => opt.setName("xp").setDescription("Jumlah XP yang didapat per pesan").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("rolereward")
          .setDescription("Set role reward untuk level tertentu")
          .addStringOption((opt) => opt.setName("action").setDescription("Tambah atau hapus role reward").setRequired(true).addChoices({ name: "Tambah", value: "add" }, { name: "Hapus", value: "remove" }))
          .addIntegerOption((opt) => opt.setName("level").setDescription("Level yang dibutuhkan").setRequired(true))
          .addRoleOption((opt) => opt.setName("role").setDescription("Role yang akan diberikan").setRequired(true))
      )
  )

  // BOT APPARANCE
  .addSubcommandGroup((group) =>
    group
      .setName("appearance")
      .setDescription("Pengaturan tampilan bot")
      .addSubcommand((sub) =>
        sub
          .setName("activity")
          .setDescription("Ubah aktifitas bot")
          .addStringOption((opt) =>
            opt
              .setName("activity")
              .setDescription("Aktifitas bot")
              .setRequired(true)
              .addChoices({ name: "Online", value: "online" }, { name: "Do Not Disturb", value: "dnd" }, { name: "Offline", value: "offline" }, { name: "Idle", value: "idle" })
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName("status")
          .setDescription("Ubah status/deskripsi bot")
          .addStringOption((opt) => opt.setName("status").setDescription("Deskripsi aktivitas bot").setRequired(true))
      )
  )

  // Minecraft server pengaturan: ip, port, ip-channel, port-channel, status-channel
  .addSubcommandGroup((group) =>
    group
      .setName("minecraft")
      .setDescription("Pengaturan server Minecraft")
      .addSubcommand((sub) =>
        sub
          .setName("setup")
          .setDescription("Setup semua channel stat Minecraft otomatis")
          .addChannelOption((opt) => opt.setName("category").setDescription("Kategori tempat channel dibuat").addChannelTypes(ChannelType.GuildCategory).setRequired(true))
      )

      .addSubcommand((sub) =>
        sub
          .setName("ip")
          .setDescription("Set IP server Minecraft")
          .addStringOption((opt) => opt.setName("ip").setDescription("IP server Minecraft").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("port")
          .setDescription("Set port server Minecraft")
          .addIntegerOption((opt) => opt.setName("port").setDescription("Port server Minecraft").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("ip-channel")
          .setDescription("Set channel untuk menampilkan IP server Minecraft")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel untuk IP Minecraft").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("port-channel")
          .setDescription("Set channel untuk menampilkan port server Minecraft")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel untuk port Minecraft").setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName("status-channel")
          .setDescription("Set channel untuk status server Minecraft")
          .addChannelOption((opt) => opt.setName("channel").setDescription("Channel untuk status Minecraft").setRequired(true))
      )
  )
  // STANDALONE
  .addSubcommand((sub) => sub.setName("view").setDescription("Lihat semua pengaturan bot"));

module.exports = {
  data: builder,
  adminOnly: true,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // CHECK PERMISSION
      if (!(await checkPermission(interaction.member))) {
        return interaction.editReply({
          content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
          ephemeral: true,
        });
      }

      // GET
      const group = interaction.options.getSubcommandGroup(false);
      const sub = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const status = interaction.options.getString("status");
      const action = interaction.options.getString("action");
      const target = interaction.options.getMentionable("target");
      const channel = interaction.options.getChannel("channel");

      // FETCH OR CREATE BOT SETTING
      let botSetting = await BotSetting.getCache({ guildId: guildId });

      if (!botSetting) {
        botSetting = new BotSetting({ guildId: guildId });
        await botSetting.saveAndUpdateCache("guildId");
      }

      // EMBED
      const embed = new EmbedBuilder()
        .setTitle("> Setting")
        .setColor("Blue")
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({
          text: "Sistem",
          iconURL: interaction.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      switch (group) {
        case "automod": {
          switch (sub) {
            case "whitelist": {
              const targetId = target.id;
              console.log("Data awal whitelist dari database:", botSetting.whitelist);
              let whitelist = botSetting.whitelist;

              if (!Array.isArray(whitelist) && typeof whitelist === "string") {
                console.log("Whitelist adalah string JSON, mencoba parse...");
                try {
                  whitelist = JSON.parse(whitelist); // ubah string jadi array
                } catch (error) {
                  console.error("Gagal parse whitelist JSON, reset ke array kosong.", error);
                  whitelist = [];
                }
              } else if (!Array.isArray(whitelist)) {
                console.log("Whitelist bukan array atau JSON, reset ke array kosong.");
                whitelist = [];
              }

              if (action === "add") {
                if (whitelist.includes(targetId)) {
                  embed.setDescription("Pengguna/role ini sudah ada dalam daftar diperbolehkan.");
                  return interaction.editReply({ embeds: [embed] });
                }
                whitelist.push(targetId); // tambah data baru
                botSetting.whitelist = whitelist; // update field whitelist
                botSetting.changed("whitelist", true);
                await botSetting.saveAndUpdateCache("guildId"); // simpan ke database

                const isRole = interaction.guild.roles.cache.has(targetId);
                embed.setDescription(isRole ? `Role <@&${targetId}> berhasil ditambahkan!` : `User <@${targetId}> berhasil ditambahkan!`);
                // embed.setDescription(interaction.guild.members.cache.get(targetId) ? `Ditambahkan user <@${targetId}> ke daftar diperbolehkan.` : `Ditambahkan role <@&${targetId}> ke daftar diperbolehkan.`);
                return interaction.editReply({ embeds: [embed] });
              } else if (action === "remove") {
                if (!whitelist.includes(targetId)) {
                  embed.setDescription("Pengguna/role ini tidak ada dalam daftar diperbolehkan.");
                  return interaction.editReply({ embeds: [embed] });
                }
                whitelist = whitelist.filter((id) => id !== targetId); // hapus data
                botSetting.whitelist = whitelist; // update field whitelist
                botSetting.changed("whitelist", true);
                await botSetting.saveAndUpdateCache("guildId"); // simpan ke database

                const isRole = interaction.guild.roles.cache.has(targetId);
                embed.setDescription(isRole ? `Role <@&${targetId}> berhasil dihapus!` : `User <@${targetId}> berhasil dihapus!`);
                // embed.setDescription(interaction.guild.members.cache.get(targetId) ? `Dihapus user <@${targetId}> dari daftar diperbolehkan.` : `Dihapus role <@&${targetId}> dari daftar diperbolehkan.`);
                return interaction.editReply({ embeds: [embed] });
              } else {
                embed.setDescription("Aksi tidak valid untuk whitelist. Gunakan 'add' atau 'remove'.");
                return interaction.editReply({ embeds: [embed] });
              }
            }
            case "whitelist-list": {
              // Pastikan whitelist adalah array yang valid
              let whitelist = botSetting.whitelist;

              // Jika whitelist bukan array, coba parse menjadi array
              if (typeof whitelist === "string") {
                whitelist = JSON.parse(whitelist);
              }

              if (!Array.isArray(whitelist)) {
                whitelist = []; // fallback ke array kosong jika parsing gagal
              }

              if (whitelist.length === 0) {
                embed.setDescription("Daftar yang diperbolehkan automod kosong.");
                return interaction.editReply({ embeds: [embed] });
              }

              const whitelistString = whitelist
                .map((id) => {
                  const member = interaction.guild.members.cache.get(id);
                  if (member) {
                    return `<@${id}>`;
                  }
                  const role = interaction.guild.roles.cache.get(id);
                  if (role) {
                    return `<@&${id}>`;
                  }
                  return `ID tidak valid: ${id}`;
                })
                .join("\n");

              embed.setDescription(`Daftar yang diperbolehkan automod:\n${whitelistString}`);
              return interaction.editReply({ embeds: [embed] });
            }

            case "badwords": {
              let badwords = botSetting.badwords;

              if (!Array.isArray(badwords) && typeof badwords === "string") {
                try {
                  badwords = JSON.parse(badwords);
                } catch (error) {
                  console.error("gagal parse badwords, reset ke array kosong:", error);
                  badwords = [];
                }
              } else if (!Array.isArray(badwords)) {
                badwords = [];
              }

              const word = interaction.options.getString("word");
              if (!word) {
                embed.setDescription("kata yang ingin ditambahkan atau dihapus harus diisi.");
                return interaction.editReply({ embeds: [embed] });
              }

              if (action === "add") {
                if (badwords.includes(word.toLowerCase())) {
                  embed.setDescription("kata tersebut sudah ada di daftar badword.");
                  return interaction.editReply({ embeds: [embed] });
                }

                badwords.push(word.toLowerCase());
                botSetting.badwords = badwords;
                botSetting.changed("badwords", true);
                await botSetting.saveAndUpdateCache("guildId");

                embed.setDescription(`kata \`${word}\` berhasil ditambahkan ke daftar badword.`);
                return interaction.editReply({ embeds: [embed] });
              } else if (action === "remove") {
                if (!badwords.includes(word.toLowerCase())) {
                  embed.setDescription("kata tersebut tidak ada di daftar badword.");
                  return interaction.editReply({ embeds: [embed] });
                }

                badwords = badwords.filter((w) => w !== word.toLowerCase());
                botSetting.badwords = badwords;
                botSetting.changed("badwords", true);
                await botSetting.saveAndUpdateCache("guildId");

                embed.setDescription(`kata \`${word}\` barhasil dihapus dari daftar badword.`);
                return interaction.editReply({ embeds: [embed] });
              }
              break;
            }
            case "badwords-list": {
              let badwords = botSetting.badwords;

              if (typeof badwords === "string") {
                try {
                  badwords = JSON.parse(badwords);
                } catch (err) {
                  console.error("gagal parse badwords:", err);
                  badwords = [];
                }
              }

              if (!Array.isArray(badwords)) {
                badwords = [];
              }

              if (badwords.length === 0) {
                embed.setDescription("Daftar kata kasar automod kosong.");
                return interaction.editReply({ embeds: [embed] });
              }

              const badwordsString = badwords.map((w) => `• \`${w}\``).join("\n");

              embed.setDescription(`Daftar kata kasar automod:\n${badwordsString}`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "exception-channel": {
              const targetId = channel.id;
              let ignoredChannels = botSetting.ignoredChannels;

              if (!Array.isArray(ignoredChannels) && typeof ignoredChannels === "string") {
                console.log("ignoredChannels adalah string JSON, mencoba parse...");
                try {
                  ignoredChannels = JSON.parse(ignoredChannels);
                } catch (error) {
                  console.error("Gagal parse ignoredChannels JSON, reset ke array kosong.", error);
                  ignoredChannels = [];
                }
              } else if (!Array.isArray(ignoredChannels)) {
                console.log("ignoredChannels bukan array atau JSON, reset ke array kosong.");
                ignoredChannels = [];
              }

              if (action === "add") {
                if (ignoredChannels.includes(targetId)) {
                  embed.setDescription("Channel ini sudah ada dalam daftar pengecualian.");
                  return interaction.editReply({ embeds: [embed] });
                }
                ignoredChannels.push(targetId);
                botSetting.ignoredChannels = ignoredChannels;
                botSetting.changed("ignoredChannels", true);
                await botSetting.saveAndUpdateCache("guildId");

                embed.setDescription(`Channel <#${targetId}> berhasil ditambahkan ke daftar pengecualian!`);
                return interaction.editReply({ embeds: [embed] });
              } else if (action === "remove") {
                if (!ignoredChannels.includes(targetId)) {
                  embed.setDescription("Channel ini tidak ada dalam daftar pengecualian.");
                  return interaction.editReply({ embeds: [embed] });
                }
                ignoredChannels = ignoredChannels.filter((id) => id !== targetId);
                botSetting.ignoredChannels = ignoredChannels;
                botSetting.changed("ignoredChannels", true);
                await botSetting.saveAndUpdateCache("guildId");

                embed.setDescription(`Channel <#${targetId}> berhasil dihapus dari daftar pengecualian!`);
                return interaction.editReply({ embeds: [embed] });
              } else {
                embed.setDescription("Aksi tidak valid untuk pengecualian channel. Gunakan 'add' atau 'remove'.");
                return interaction.editReply({ embeds: [embed] });
              }
            }

            case "exception-channel-list": {
              let ignoredChannels = botSetting.ignoredChannels;

              if (typeof ignoredChannels === "string") {
                try {
                  ignoredChannels = JSON.parse(ignoredChannels);
                } catch (e) {
                  ignoredChannels = [];
                }
              }

              if (!Array.isArray(ignoredChannels)) ignoredChannels = [];

              if (ignoredChannels.length === 0) {
                embed.setDescription("Daftar pengecualian channel kosong.");
                return interaction.editReply({ embeds: [embed] });
              }

              const list = ignoredChannels
                .map((id) => {
                  const channel = interaction.guild.channels.cache.get(id);
                  return channel ? `<#${id}>` : `ID tidak valid: ${id}`;
                })
                .join("\n");

              embed.setDescription(`Daftar Channel yang Dikecualikan:\n${list}`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "log-channel": {
              const targetChannel = channel;

              if (!targetChannel.isTextBased()) {
                embed.setDescription("Channel yang dipilih harus berupa text channel.");
                return interaction.editReply({ embeds: [embed] });
              }

              botSetting.modLogChannelId = targetChannel.id;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Channel <#${targetChannel.id}> berhasil diatur sebagai channel log automod!`);
              return interaction.editReply({ embeds: [embed] });
            }
          }
        }
        case "fitur": {
          switch (sub) {
            case "anti-invites":
            case "anti-links":
            case "anti-spam":
            case "anti-badwords":
            case "server-stats":
            case "economy":
            case "giveaway":
            case "invites":
            case "suggestion":
            case "ticket":
            case "pet":
            case "adventure":
            case "squad":
            case "leveling":
            case "welcome-in":
            case "nsfw":
            case "checklist":
            case "minecraft-stats":
            case "welcome-out": {
              const featureMap = {
                "anti-invites": ["antiInviteOn", "deteksi tautan undangan"],
                "anti-links": ["antiLinkOn", "deteksi tautan"],
                "anti-spam": ["antiSpamOn", "deteksi spam"],
                "anti-badwords": ["antiBadwordOn", "deteksi kata kasar"],
                "server-stats": ["serverStatsOn", "server stats"],
                economy: ["economyOn", "economy"],
                giveaway: ["giveawayOn", "giveaway"],
                invites: ["invitesOn", "invites"],
                suggestion: ["suggestionOn", "suggestion"],
                ticket: ["ticketOn", "ticket"],
                pet: ["petOn", "pet"],
                squad: ["squadOn", "squad"],
                adventure: ["adventureOn", "adventure"],
                leveling: ["levelingOn", "leveling"],
                "welcome-in": ["welcomeInOn", "welcome in"],
                "welcome-out": ["welcomeOutOn", "welcome out"],
                nsfw: ["nsfwOn", "konten nsfw"],
                checklist: ["checklistOn", "checklist"],
                "minecraft-stats": ["minecraftStatsOn", "checklist"],
                invites: ["invitesOn", "invites"],
              };

              const [settingKey, featureName] = featureMap[sub];
              botSetting[settingKey] = status === "enable";
              await botSetting.saveAndUpdateCache("guildId");
              embed.setDescription(`Fitur ${featureName} telah ${status === "enable" ? "diaktifkan" : "dinonaktifkan"}.`);
              return interaction.editReply({ embeds: [embed] });
            }
          }
        }
        case "stats": {
          switch (sub) {
            case "member-count-channel": {
              const targetChannel = channel;

              botSetting.memberCountChannelId = targetChannel.id;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Channel <#${targetChannel.id}> berhasil diatur sebagai stats server total member!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "online-count-channel": {
              const targetChannel = channel;

              botSetting.onlineCountChannelId = targetChannel.id;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Channel <#${targetChannel.id}> berhasil diatur sebagai stats server member yang online!`);
              return interaction.editReply({ embeds: [embed] });
            }
          }
        }
        case "cooldown": {
          const cooldown = interaction.options.getInteger("cooldown");
          const cooldownMap = {
            daily: ["dailyCooldown", "daily"],
            beg: ["begCooldown", "beg"],
            lootbox: ["lootboxCooldown", "lootbox"],
            work: ["workCooldown", "work"],
            rob: ["robCooldown", "rob"],
            hack: ["hackCooldown", "hack"],
            pet: ["petCooldown", "pet"],
            gacha: ["gachaCooldown", "gacha"],
          };

          const [settingKey, featureName] = cooldownMap[sub];
          botSetting[settingKey] = cooldown;
          await botSetting.saveAndUpdateCache("guildId");

          embed.setDescription(`Cooldown ${featureName} telah diatur menjadi \`${cooldown}\` detik.`);
          return interaction.editReply({ embeds: [embed] });
        }
        case "welcome": {
          switch (sub) {
            case "in-channel": {
              const targetChannel = channel;
              botSetting.welcomeInChannelId = targetChannel.id;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Channel <#${targetChannel.id}> berhasil diatur sebagai channel welcome!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "out-channel": {
              const targetChannel = channel;
              botSetting.welcomeOutChannelId = targetChannel.id;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Channel <#${targetChannel.id}> berhasil diatur sebagai channel welcome!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "role": {
              const targetRole = interaction.options.getRole("role");
              botSetting.welcomeRoleId = targetRole.id;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Role <@&${targetRole.id}> berhasil diatur sebagai role welcome!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "in-text": {
              const text = interaction.options.getString("text");
              botSetting.welcomeInText = text;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Teks welcome in berhasil diatur menjadi:\n\`${text}\``);
              return interaction.editReply({ embeds: [embed] });
            }
            case "out-text": {
              const text = interaction.options.getString("text");
              botSetting.welcomeOutText = text;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Teks welcome out berhasil diatur menjadi:\n\`${text}\``);
              return interaction.editReply({ embeds: [embed] });
            }
          }
        }
        case "appearance": {
          switch (sub) {
            case "activity": {
              const activity = interaction.options.getString("activity");
              botSetting.botActivity = activity;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Status aktivitas bot berhasil diubah menjadi \`${activity}\`!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "status": {
              const status = interaction.options.getString("status");
              botSetting.botStatus = status;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Status deskripsi bot berhasil diubah menjadi \`${status}\`!`);
              return interaction.editReply({ embeds: [embed] });
            }
          }
        }
        case "leveling": {
          switch (sub) {
            case "channel": {
              const targetChannel = interaction.options.getChannel("channel");
              botSetting.levelingChannelId = targetChannel.id;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Channel <#${targetChannel.id}> berhasil diatur sebagai channel level up!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "cooldown": {
              const cooldown = interaction.options.getInteger("cooldown");
              botSetting.levelingCooldown = cooldown * 1000; // Convert to milliseconds
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`Cooldown leveling berhasil diatur menjadi \`${cooldown}\` detik!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "xp": {
              const xp = interaction.options.getInteger("xp");
              botSetting.levelingXp = xp;
              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(`XP per pesan berhasil diatur menjadi \`${xp}\` XP!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "rolereward": {
              const role = interaction.options.getRole("role");
              const level = interaction.options.getInteger("level");
              const action = interaction.options.getString("action");

              if (!botSetting.roleRewards) {
                botSetting.roleRewards = [];
              }

              if (action === "add") {
                // hapus reward lama kalau ada di level itu
                botSetting.roleRewards = botSetting.roleRewards.filter((r) => r.level !== level);

                // tambahkan reward baru
                botSetting.roleRewards.push({
                  level,
                  role: role.id,
                });

                embed.setDescription(`role <@&${role.id}> berhasil ditambahkan sebagai reward untuk level \`${level}\`!`);
              } else if (action === "remove") {
                const initial = botSetting.roleRewards.length;
                botSetting.roleRewards = botSetting.roleRewards.filter((r) => r.level !== level);

                if (botSetting.roleRewards.length === initial) {
                  embed.setDescription(`gaada role reward yang cocok untuk level \`${level}\`!`);
                } else {
                  embed.setDescription(`role reward untuk level \`${level}\` berhasil dihapus!`);
                }
              }
              botSetting.changed("roleRewards", true);
              await botSetting.saveAndUpdateCache("guildId"); // benerin ini juga
              return interaction.editReply({ embeds: [embed] });
            }
          }
        }
        // Minecraft server pengaturan
        case "minecraft": {
          switch (sub) {
            case "setup": {
              const category = interaction.options.getChannel("category");
              if (!category || category.type !== ChannelType.GuildCategory) {
                embed.setDescription("Channel yang dipilih bukan kategori yang valid 😭");
                return interaction.editReply({ embeds: [embed] });
              }

              const createStatChannel = async (name, field) => {
                const ch = await interaction.guild.channels.create({
                  name,
                  type: ChannelType.GuildVoice,
                  parent: category.id,
                });

                botSetting[field] = ch.id;
                return ch;
              };

              // ambil IP dan Port dulu biar bisa generate nama
              const ip = botSetting.minecraftIp || "0.0.0.0";
              const port = botSetting.minecraftPort || 25565;

              const ipName = `🌐 ${ip}`;
              const portName = `🔌 ${port}`;
              const statusName = `🔵 DONE SETUP`;
              const playersName = `🎮 0/0`;

              // bikin channel satu per satu
              const ipChannel = await createStatChannel(ipName, "minecraftIpChannelId");
              const portChannel = await createStatChannel(portName, "minecraftPortChannelId");
              const statusChannel = await createStatChannel(statusName, "minecraftStatusChannelId");
              const playersChannel = await createStatChannel(playersName, "minecraftPlayersChannelId");

              await botSetting.saveAndUpdateCache("guildId");

              embed.setDescription(
                [
                  "Berhasil setup Minecraft server stat channel 😋",
                  `Kategori: <#${category.id}>`,
                  `- IP: <#${ipChannel.id}>`,
                  `- Port: <#${portChannel.id}>`,
                  `- Status: <#${statusChannel.id}>`,
                  `- Players: <#${playersChannel.id}>`,
                ].join("\n")
              );

              return interaction.editReply({ embeds: [embed] });
            }

            case "ip": {
              const ip = interaction.options.getString("ip");
              botSetting.minecraftIp = ip;
              await botSetting.saveAndUpdateCache("guildId");
              embed.setDescription(`IP server Minecraft berhasil diatur menjadi \`${ip}\`!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "port": {
              const port = interaction.options.getInteger("port");
              botSetting.minecraftPort = port;
              await botSetting.saveAndUpdateCache("guildId");
              embed.setDescription(`Port server Minecraft berhasil diatur menjadi \`${port}\`!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "ip-channel": {
              botSetting.minecraftIpChannelId = channel.id;
              await botSetting.saveAndUpdateCache("guildId");
              embed.setDescription(`Channel untuk menampilkan IP Minecraft berhasil diatur ke <#${channel.id}>!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "port-channel": {
              botSetting.minecraftPortChannelId = channel.id;
              await botSetting.saveAndUpdateCache("guildId");
              embed.setDescription(`Channel untuk menampilkan port Minecraft berhasil diatur ke <#${channel.id}>!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "status-channel": {
              botSetting.minecraftStatusChannelId = channel.id;
              await botSetting.saveAndUpdateCache("guildId");
              embed.setDescription(`Channel untuk status server Minecraft berhasil diatur ke <#${channel.id}>!`);
              return interaction.editReply({ embeds: [embed] });
            }
            case "players-channel": {
              botSetting.minecraftPlayersChannelId = channel.id;
              await botSetting.saveAndUpdateCache("guildId");
              embed.setDescription(`Channel untuk status server Minecraft berhasil diatur ke <#${channel.id}>!`);
              return interaction.editReply({ embeds: [embed] });
            }
          }
        }

        default: {
          if (!botSetting || !botSetting.dataValues) {
            embed.setDescription("❌ belum ada pengaturan yang tersimpan untuk server ini.");
            return interaction.editReply({ embeds: [embed] });
          }

          const settings = botSetting.dataValues;
          let description = `> **🛠️ pengaturan bot saat ini:**\n\n`;

          const kategori = {
            umum: [],
            boolean: [],
            array: [],
            lainnya: [],
          };

          for (const [key, value] of Object.entries(settings)) {
            if (["id", "guildId"].includes(key)) continue;

            const formattedKey = `\`${key}\``;

            if (typeof value === "boolean") {
              kategori.boolean.push(`• ${formattedKey}: ${value ? "✅ aktif" : "❌ nonaktif"}`);
            } else if (Array.isArray(value)) {
              if (value.length === 0) {
                kategori.array.push(`• ${formattedKey}: 🚫 tidak ada data`);
              } else {
                let list = "";
                value.forEach((item, i) => {
                  if (typeof item === "object" && item.level && item.roleId) {
                    list += `   └ 🥇 level ${item.level} → <@&${item.roleId}>\n`;
                  } else {
                    list += `   └ 🔹 ${item}\n`;
                  }
                });
                kategori.array.push(`• ${formattedKey}:\n${list}`);
              }
            } else if (typeof value === "string" || typeof value === "number") {
              kategori.umum.push(`• ${formattedKey}: ${value}`);
            } else {
              kategori.lainnya.push(`• ${formattedKey}: ⚠️ tidak dikenali`);
            }
          }

          if (kategori.boolean.length) {
            description += `__**🧷 fitur aktif/nonaktif**__\n${kategori.boolean.join("\n")}\n\n`;
          }

          if (kategori.umum.length) {
            description += `__**⚙️ pengaturan umum**__\n${kategori.umum.join("\n")}\n\n`;
          }

          if (kategori.array.length) {
            description += `__**📦 data terstruktur**__\n${kategori.array.join("\n")}\n\n`;
          }

          if (kategori.lainnya.length) {
            description += `__**❓ lainnya**__\n${kategori.lainnya.join("\n")}\n\n`;
          }

          embed.setTitle("📋 pengaturan bot").setColor("Blue").setDescription(description).setTimestamp().setFooter({
            text: "semua pengaturan diambil dari database cache",
            iconURL: interaction.client.user.displayAvatarURL(),
          });

          return interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error("Error during set command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder().setColor("Red").setTitle(`> ❌ Error command /set`).setDescription(`\`\`\`${error}\`\`\``).setFooter(`Error dari server ${interaction.guild.name}`).setTimestamp();

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
