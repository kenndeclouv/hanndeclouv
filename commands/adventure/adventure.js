const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require("discord.js");
const User = require("../../database/models/UserAdventure"); // Model user buat karakter
const Inventory = require("../../database/models/InventoryAdventure"); // Buat item & loot
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adventure")
    .setDescription("Mulai petualanganmu di dunia RPG!")
    .addSubcommand((subcommand) => subcommand.setName("start").setDescription("Mulai petualanganmu!"))
    .addSubcommand((subcommand) => subcommand.setName("battle").setDescription("Lawan monster di dungeon!"))
    .addSubcommand((subcommand) => subcommand.setName("stats").setDescription("Lihat stats karaktermu!"))
    .addSubcommand((subcommand) => subcommand.setName("inventory").setDescription("Cek barangmu!"))
    .addSubcommand((subcommand) => subcommand.setName("recall").setDescription("Kembali ke kota!"))
    .addSubcommand((subcommand) => subcommand.setName("shop").setDescription("Beli item di toko!")),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭"
      });
    }
    await interaction.deferReply();

    try {
      const subcommand = interaction.options.getSubcommand();
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      let user = await User.getCache({ userId: userId, guildId: interaction.guild.id });
      if (!user) {
        if (subcommand === "start") {
          user = await User.create({
            guildId,
            userId,
            level: 1,
            xp: 0,
            hp: 100,
            gold: 50,
            strength: 10,
            defense: 5,
          });
          return interaction.editReply({
            content: `✨ Karaktermu berhasil dibuat! Kamu siap untuk memulai petualanganmu! 🎉`
          });
        } else {
          return interaction.editReply({
            content: "❌ Kamu belum punya karakter! Gunakan `/adventure start` dulu!"
          });
        }
      }

      switch (subcommand) {
        case "start": {
          const embed = new EmbedBuilder()
            // .setTitle(`> Petualanganmu dimulai!`)
            .setDescription(`## 🎉 Petualanganmu dimulai!\nKamu siap untuk memulai petualanganmu!`)
            .setColor("Blue")
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Petualanganmu dimulai dari sini!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        }

        case "stats": {
          // Emoji for each stat
          const statEmojis = {
            level: "🆙",
            xp: "✨",
            hp: "💖",
            gold: "💰",
            strength: "⚔️",
            defense: "🛡️"
          };

          // Progress bar for XP (assuming 100xp per level for demo)
          const xpForNextLevel = 100 * user.level;
          const xpProgress = Math.min(user.xp / xpForNextLevel, 1);
          const progressBarLength = 20;
          const filledLength = Math.round(progressBarLength * xpProgress);
          const progressBar = `▰`.repeat(filledLength) + `▱`.repeat(progressBarLength - filledLength);

          const embed = new EmbedBuilder()
            .setColor("Blue")
            // .setAuthor({ name: `${interaction.user.username}'s Stats`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setDescription(`## 🌟 Stats Karakter ${interaction.user.username}\n Berikut adalah statistik karaktermu, tetap semangat meningkatkan levelnya!`)
            .addFields(
              { name: `${statEmojis.level} Level`, value: `**${user.level}**`, inline: true },
              { name: `${statEmojis.hp} HP`, value: `**${user.hp}**`, inline: true },

              { name: `${statEmojis.gold} Gold`, value: `**${user.gold}**`, inline: true },
              { name: `${statEmojis.strength} Strength`, value: `**${user.strength}**`, inline: true },

              { name: `${statEmojis.defense} Defense`, value: `**${user.defense}**`, inline: true },
              { name: '\u200B', value: '\u200B', inline: true }, // biar tetep 2 kolom rata

              { name: `${statEmojis.xp} XP Progress`, value: `${user.xp} / ${xpForNextLevel}\n${progressBar}`, inline: false }
            )
            .setFooter({ text: "📊 Stats karaktermu!", iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

          return interaction.editReply({ embeds: [embed] });
        }

        case "inventory": {
          const inventory = await Inventory.getAllCache({ userId: userId });

          if (inventory.length === 0) {
            const embed = new EmbedBuilder()
              .setColor("Blue")
              .setDescription(`## 🔍 Inventorimu kosong!\nKamu bisa mengambil item di sini!`)
              .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
              .setFooter({ text: "Kamu bisa mengambil item di sini!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
              .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
          }

          // hitung jumlah item
          const itemCount = {};
          inventory.forEach((item) => {
            if (itemCount[item.itemName]) {
              itemCount[item.itemName]++;
            } else {
              itemCount[item.itemName] = 1;
            }
          });

          // susun list
          const itemList = Object.entries(itemCount)
            .map(([itemName, count]) => `${itemName} x${count}`)
            .join("\n");

          const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle(`## 🎒 Inventorimu ${interaction.user.username}`)
            .setDescription(`Berikut adalah isi inventorimu:\n\n${itemList}`)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Gunakan itemmu dengan bijak!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();

          return interaction.editReply({ embeds: [embed] });
        }


        case "battle": {
          // Progress bar generator
          const generateHpBar = (currentHp, maxHp = 100, barLength = 20) => {
            const hpPercent = Math.max(0, currentHp / maxHp);
            const filledLength = Math.round(barLength * hpPercent);
            return `[${'▰'.repeat(filledLength)}${'▱'.repeat(barLength - filledLength)}] ${currentHp} HP`;
          };

          // Function to handle a single round of battle and return the result
          const handleBattleRound = async (interaction, user, items) => {
            const sword = items.find((item) => item?.itemName === "⚔️ Sword");
            const shield = items.find((item) => item?.itemName === "🛡️ Shield");
            const armor = items.find((item) => item?.itemName === "🥋 Armor");
            const revival = items.find((item) => item?.itemName === "🍶 Revival");

            let userStrength = user.strength + (sword ? 15 : 0);
            let userDefense = user.defense + (shield ? 10 : 0) + (armor ? 15 : 0);

            const playerDamage = Math.max(0, userStrength - Math.floor(Math.random() * 5));
            const monsterDamage = Math.max(0, user.monsterStrength - Math.floor(Math.random() * userDefense));

            user.hp = Math.max(0, user.hp - monsterDamage);
            user.monsterHp = Math.max(0, user.monsterHp - playerDamage);
            await user.saveAndUpdateCache();

            const embed = new EmbedBuilder().setTimestamp().setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }));

            // Button to continue the adventure
            const continueButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("adventure_continue")
                .setLabel("Lanjutkan Petualangan")
                .setStyle(ButtonStyle.Primary)
            );

            // Kalau user kalah
            if (user.hp <= 0) {
              if (revival) {
                revival.destroy();
                Inventory.clearCache({
                  guildId: user.guildId,
                  userId: user.userId,
                  itemName: "🍶 Revival",
                });
                return {
                  embeds: [
                    embed
                      // .setTitle(`> Kamu Bangkit!`)
                      .setDescription(`## 😇 Kamu Bangkit!\nKamu dibangkitkan oleh 🍶 Revival.\nKamu siap bertarung lagi!`)
                      .setColor("Green")
                      .setFooter({ text: "Petualanganmu belum berakhir!", iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) }),
                  ],
                  components: [continueButton],
                  end: false
                };
              }

              user.hp = Math.floor(100 * (1 + user.level * 0.1));
              user.monsterName = null;
              await user.saveAndUpdateCache();
              return {
                embeds: [
                  embed
                    // .setTitle(`> Kamu Kalah!`)
                    .setDescription(`## 💀 Kamu Kalah!\nKamu dikalahkan monster! Tapi kamu bangkit lagi dengan **${user.hp} HP**.`)
                    .setColor("Red")
                    .setFooter({ text: "Petualanganmu belum berakhir!", iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) }),
                ],
                components: [continueButton],
                end: true
              };
            }

            // Kalau monster mati
            if (user.monsterHp <= 0) {
              const goldEarned = user.monsterGoldDrop;
              const xpEarned = user.monsterXpDrop;
              const monsterName = user.monsterName;

              user.xp += xpEarned;
              user.gold += goldEarned;

              user.monsterName = null;
              user.monsterHp = 0;
              user.monsterStrength = 0;
              user.monsterGoldDrop = 0;
              user.monsterXpDrop = 0;

              const XP_REQUIRED = 50 * Math.pow(2, user.level - 1);
              if (user.xp >= XP_REQUIRED) {
                user.level++;
                user.strength += 5;
                user.defense += 3;
                user.hp = 100;
                await user.saveAndUpdateCache();
                return {
                  embeds: [
                    embed
                      // .setTitle(`> Level Up!`)
                      .setDescription(`## 🎉 Level Up!\nKamu naik ke level **${user.level}**!\nStatistikmu meningkat! 💪`)
                      .setColor("Green")
                      .setFooter({ text: "Teruskan petualanganmu!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }),
                  ],
                  components: [continueButton],
                  end: true
                };
              }

              await user.saveAndUpdateCache();
              return {
                embeds: [
                  embed
                    // .setTitle(`> Kamu Menang!`)
                    .setDescription(`## 🎉 Kamu Menang!\nKamu mengalahkan **${monsterName}**!\nKamu mendapatkan **${goldEarned} gold** dan **${xpEarned} XP**!`)
                    .setColor("Green")
                    .setFooter({ text: "Teruskan petualanganmu!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }),
                ],
                components: [continueButton],
                end: true
              };
            }

            // Battle masih lanjut
            return {
              embeds: [
                embed
                  // .setTitle(`⚔️ Pertarungan Berlanjut!`)
                  .setDescription(
                    `## ⚔️ Adventure Battle!\n` +
                    `**${interaction.user.username}** menyerang **${user.monsterName}**, memberikan **${playerDamage}** damage!\n` +
                    `**${user.monsterName}** menyerang balik, memberikan **${monsterDamage}** damage!`
                  )
                  .setColor("Blue")
                  .addFields(
                    { name: `💖 HP Kamu`, value: generateHpBar(user.hp), inline: false },
                    { name: `👹 HP ${user.monsterName}`, value: generateHpBar(user.monsterHp), inline: false }
                  )
                  .setFooter({ text: "Teruskan petualanganmu!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) }),
              ],
              components: [continueButton],
              end: false
            };
          };

          // Jika monster belum ada, buat monster baru
          if (!user.monsterName) {
            const monster = getRandomMonster(user.level);
            user.monsterName = monster.name;
            user.monsterHp = monster.hp;
            user.monsterStrength = monster.strength;
            user.monsterGoldDrop = monster.goldDrop;
            user.monsterXpDrop = monster.xpDrop;
            await user.saveAndUpdateCache();
          }

          const items = await Inventory.getCache([
            { guildId: guildId, userId: userId, itemName: "⚔️ Sword" },
            { guildId: guildId, userId: userId, itemName: "🛡️ Shield" },
            { guildId: guildId, userId: userId, itemName: "🥋 Armor" },
            { guildId: guildId, userId: userId, itemName: "🍶 Revival" },
          ]);

          // First round
          const result = await handleBattleRound(interaction, user, items);

          // Send the initial reply and set up the collector
          const reply = await interaction.editReply({
            embeds: result.embeds,
            components: result.components,
            fetchReply: true
          });

          // If the battle ended (user lost or monster died), don't set up a collector
          if (result.end) return;

          // Set up a collector for the continue button
          const filter = (i) => i.customId === "adventure_continue" && i.user.id === interaction.user.id;
          const collector = reply.createMessageComponentCollector({ filter, time: 60_000 });

          collector.on("collect", async (i) => {
            await i.deferUpdate();

            // Re-fetch user and items for up-to-date stats
            const freshUser = await User.getCache({ guildId, userId });
            const freshItems = await Inventory.getCache([
              { guildId: guildId, userId: userId, itemName: "⚔️ Sword" },
              { guildId: guildId, userId: userId, itemName: "🛡️ Shield" },
              { guildId: guildId, userId: userId, itemName: "🥋 Armor" },
              { guildId: guildId, userId: userId, itemName: "🍶 Revival" },
            ]);

            const nextResult = await handleBattleRound(i, freshUser, freshItems);

            await interaction.editReply({
              embeds: nextResult.embeds,
              components: nextResult.end ? [] : nextResult.components,
            });

            if (nextResult.end) collector.stop("battle_end");
          });

          collector.on("end", async (_, reason) => {
            if (reason !== "battle_end") {
              // Disable the button if time runs out
              const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("adventure_continue")
                  .setLabel("Lanjutkan Petualangan")
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(true)
              );
              await interaction.editReply({
                components: [disabledRow],
              });
            }
          });

          return;
        }

        case "recall": {
          // await interaction.deferReply();
          user.hp = Math.floor(100 * (1 + user.level * 0.1));
          user.monsterName = null;
          user.monsterHp = 0;
          user.monsterStrength = 0;
          user.monsterGoldDrop = 0;
          user.monsterXpDrop = 0;
          // await user.save();
          await user.saveAndUpdateCache();
          const embed = new EmbedBuilder()
            // .setTitle(`> Kamu recall!`)
            .setDescription(`## 🏠 Recall\nKamu recall dan kembali ke kota!\nHP kamu diisi kembali!`)
            .setColor("Blue")
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: "Kamu kembali ke kota!", iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        }

        // case "shop": {
        //   try {
        //     if (!user) {
        //       return interaction.editReply({ content: "kamu belum memiliki akun gunakan `/adventure start` untuk membuat akun." });
        //     }

        //     const items = [
        //       { name: "🛡️ Shield", price: 10, description: "Perisai yang kokoh untuk melindungi diri memberikan defense +10." },
        //       { name: "⚔️ Sword", price: 15, description: "Pedang yang kuat untuk bertarung melawan monster memberikan strength +10." },
        //       { name: "🥋 Armor", price: 30, description: "Armor yang kokoh untuk melindungi diri memberikan defense +15." },
        //       { name: "🍶 Revival", price: 35, description: "Menghidupkan kembali tanpa harus mati HP +100." },
        //     ];

        //     const embed = new EmbedBuilder()
        //       .setColor("Blue")
        //       // .setTitle("> Toko")
        //       .setDescription(`## 🛒 Shop\nSelamat datang di toko adventure! Pilih item yang ingin kamu beli:`)
        //       .setTimestamp()
        //       .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() });

        //     items.forEach((item) => {
        //       embed.addFields({ name: `${item.name}`, value: `Harga: **${item.price}** gold\n${item.description}`, inline: true });
        //     });

        //     const row = new ActionRowBuilder().addComponents(
        //       new StringSelectMenuBuilder()
        //         .setCustomId("select_item_adventure")
        //         .setPlaceholder("Pilih item untuk dibeli")
        //         .addOptions(
        //           items.map((item) => ({
        //             label: item.name,
        //             description: `Harga: ${item.price} gold`,
        //             value: item.name.toLowerCase(),
        //           }))
        //         )
        //     );

        //     await interaction.editReply({ embeds: [embed], components: [row] });

        //     const filter = (i) => i.user.id === interaction.user.id;
        //     const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

        //     collector.on("collect", async (i) => {
        //       if (i.customId === "select_item_adventure") {
        //         await i.deferUpdate();
        //         const selectedItem = items.find((item) => item.name.toLowerCase() === i.values[0]);

        //         if (!selectedItem) return;

        //         if (user.gold < selectedItem.price) {
        //           await interaction.editReply({
        //             content: "kamu tidak memiliki gold yang cukup untuk membeli item ini.",
        //             embeds: [], // hapus embed
        //             components: [],
        //           });
        //           return;
        //         }

        //         const confirmRow = new ActionRowBuilder().addComponents(
        //           new ButtonBuilder().setCustomId("confirm_purchase_adventure").setLabel("Konfirmasi Pembelian").setStyle(ButtonStyle.Success),
        //           new ButtonBuilder().setCustomId("cancel_purchase_adventure").setLabel("Batal").setStyle(ButtonStyle.Danger)
        //         );

        //         await interaction.editReply({
        //           content: `kamu akan membeli **${selectedItem.name}** seharga **${selectedItem.price} gold**. Konfirmasi pembelian?`,
        //           embeds: [], // hapus embed
        //           components: [confirmRow],
        //         });

        //         const confirmationFilter = (btn) => btn.user.id === interaction.user.id;
        //         const confirmationCollector = interaction.channel.createMessageComponentCollector({ filter: confirmationFilter, time: 15000, max: 1 });

        //         confirmationCollector.on("collect", async (btn) => {
        //           await btn.deferUpdate();
        //           if (btn.customId === "confirm_purchase_adventure") {
        //             user.gold -= selectedItem.price;
        //             // await user.save();
        //             await user.saveAndUpdateCache();

        //             await Inventory.create({
        //               guildId: user.guildId,
        //               userId: user.userId,
        //               itemName: selectedItem.name,
        //             });
        //             await Inventory.clearCache({ userId: user.userId });
        //             await interaction.editReply({
        //               content: `kamu berhasil membeli **${selectedItem.name}**!`,
        //               embeds: [], // hapus embed
        //               components: [],
        //             });
        //           } else if (btn.customId === "cancel_purchase_adventure") {
        //             await interaction.editReply({
        //               content: "Pembelian dibatalkan.",
        //               embeds: [], // hapus embed
        //               components: [],
        //             });
        //           }
        //         });

        //         confirmationCollector.on("end", () => {
        //           interaction.editReply({
        //             components: [],
        //           });
        //         });
        //       }
        //     });

        //     collector.on("end", () => {
        //       interaction.editReply({
        //         content: "Waktu habis. Silakan gunakan kembali perintah `/adventure shop` untuk mengakses toko.",
        //         embeds: [], // hapus embed
        //         components: [],
        //       });
        //     });
        //   } catch (error) {
        //     console.error("Error during shop command execution:", error);
        //     return interaction.editReply({ content: "❌ Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
        //   }
        // }
        case "shop": {
          try {
            if (!user) {
              const noAccountEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription('🚫 Kamu belum memiliki akun! Gunakan `/adventure start` untuk membuat akun.');
              return interaction.editReply({ embeds: [noAccountEmbed], components: [] });
            }

            const items = [
              { name: "🛡️ Shield", price: 10, description: "Perisai kokoh memberikan defense +10." },
              { name: "⚔️ Sword", price: 15, description: "Pedang kuat memberikan strength +10." },
              { name: "🥋 Armor", price: 30, description: "Armor tebal memberikan defense +15." },
              { name: "🍶 Revival", price: 35, description: "Item kebangkitan otomatis HP +100." },
            ];

            const embed = new EmbedBuilder()
              .setColor("Blue")
              .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
              // .setTitle(`🛒 Shop Adventure`)
              .setDescription(`## 🛒 Shop Adventure\nSelamat datang di toko adventure!\nPilih item yang ingin kamu beli dari menu di bawah ini.`)
              .setFooter({ text: `🪙 Gold kamu: ${user.gold}`, iconURL: interaction.client.user.displayAvatarURL() })
              .setTimestamp();

            items.forEach((item) => {
              embed.addFields({ name: `> ${item.name} - ${item.price} 🪙`, value: `${item.description}`, inline: false });
            });

            const row = new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder()
                .setCustomId("select_item_adventure")
                .setPlaceholder("Pilih item untuk dibeli")
                .addOptions(
                  items.map((item) => ({
                    label: item.name,
                    description: `Harga: ${item.price} gold`,
                    value: item.name.toLowerCase(),
                  }))
                )
            );

            await interaction.editReply({ embeds: [embed], components: [row] });

            const filter = (i) => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on("collect", async (i) => {
              if (i.customId === "select_item_adventure") {
                await i.deferUpdate();
                const selectedItem = items.find((item) => item.name.toLowerCase() === i.values[0]);

                if (!selectedItem) return;

                if (user.gold < selectedItem.price) {
                  const noGoldEmbed = new EmbedBuilder()
                    .setColor('Red')
                    // .setTitle('💸 Gold Tidak Cukup!')
                    .setDescription(`## 🪙 Gold Tidak Cukup!\nKamu membutuhkan **${selectedItem.price} gold** untuk membeli ${selectedItem.name}, tapi kamu hanya punya **${user.gold} gold**.`)
                    .setFooter({ text: 'Coba cari gold lagi di adventure!' });
                  await interaction.editReply({ embeds: [noGoldEmbed], components: [] });
                  return;
                }

                const confirmEmbed = new EmbedBuilder()
                  .setColor('Yellow')
                  // .setTitle('🛒 Konfirmasi Pembelian')
                  .setDescription(`## 🛒 Konfirmasi Pembelian\nKamu akan membeli **${selectedItem.name}** seharga **${selectedItem.price} gold**.\n\nLanjutkan pembelian?`)
                  .setFooter({ text: `🪙 Gold kamu: ${user.gold}` });

                const confirmRow = new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setCustomId("confirm_purchase_adventure").setLabel("✅ Konfirmasi").setStyle(ButtonStyle.Success),
                  new ButtonBuilder().setCustomId("cancel_purchase_adventure").setLabel("❌ Batal").setStyle(ButtonStyle.Danger)
                );

                await interaction.editReply({ embeds: [confirmEmbed], components: [confirmRow] });

                const confirmationFilter = (btn) => btn.user.id === interaction.user.id;
                const confirmationCollector = interaction.channel.createMessageComponentCollector({ filter: confirmationFilter, time: 15000, max: 1 });

                confirmationCollector.on("collect", async (btn) => {
                  await btn.deferUpdate();
                  if (btn.customId === "confirm_purchase_adventure") {
                    user.gold -= selectedItem.price;
                    await user.saveAndUpdateCache();

                    await Inventory.create({
                      guildId: user.guildId,
                      userId: user.userId,
                      itemName: selectedItem.name,
                    });
                    await Inventory.clearCache({ userId: user.userId });

                    const successEmbed = new EmbedBuilder()
                      .setColor('Green')
                      // .setTitle('✅ Pembelian Berhasil!')
                      .setDescription(`## ✅ Pembelian Berhasil!\nKamu berhasil membeli **${selectedItem.name}** seharga **${selectedItem.price} gold**.`)
                      .setFooter({ text: `🪙 Gold sekarang: ${user.gold}` });

                    await interaction.editReply({ embeds: [successEmbed], components: [] });
                  } else if (btn.customId === "cancel_purchase_adventure") {
                    const cancelEmbed = new EmbedBuilder()
                      .setColor('Grey')
                      // .setTitle('❌ Pembelian Dibatalkan')
                      .setDescription(`## ❌ Pembelian Dibatalkan\nKamu membatalkan pembelian ${selectedItem.name}.`);
                    await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                  }
                });

                confirmationCollector.on("end", () => {
                  interaction.editReply({ components: [] }).catch(() => { });
                });
              }
            });

            collector.on("end", () => {
              const timeoutEmbed = new EmbedBuilder()
                .setColor('Red')
                // .setTitle('⏱️ Waktu Habis')
                .setDescription(`## ⏱️ Waktu Habis\nKamu terlalu lama memilih item. Gunakan kembali perintah \`/adventure shop\` untuk membuka toko.`);
              interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => { });
            });
          } catch (error) {
            console.error("Error during shop command execution:", error);
            const errorEmbed = new EmbedBuilder()
              .setColor('Red')
              // .setTitle('❌ Terjadi Kesalahan')
              .setDescription(`## ❌ Terjadi Kesalahan\nTerjadi kesalahan saat menjalankan perintah. Silakan coba lagi nanti.`);
            return interaction.editReply({ embeds: [errorEmbed], components: [] });
          }
        }

      }

      // ====== PRIVATE FUNCTION =========
      function getRandomMonster(level) {
        let monsterList = []; // deklarasi di luar switch

        if (level <= 2) {
          monsterList = [
            { name: "Slime", hp: 10, strength: 2, goldDrop: 5, xpDrop: 3 },
            { name: "Rat", hp: 15, strength: 3, goldDrop: 7, xpDrop: 5 },
            { name: "Bat", hp: 20, strength: 4, goldDrop: 10, xpDrop: 7 },
            { name: "Zombie", hp: 30, strength: 6, goldDrop: 15, xpDrop: 10 },
            { name: "Goblin", hp: 40, strength: 7, goldDrop: 20, xpDrop: 15 },
          ];
        } else if (level <= 4) {
          monsterList = [
            { name: "Orc", hp: 80, strength: 12, goldDrop: 25, xpDrop: 20 },
            { name: "Giant Spider", hp: 70, strength: 10, goldDrop: 20, xpDrop: 18 },
            { name: "Werewolf", hp: 100, strength: 15, goldDrop: 30, xpDrop: 25 },
            { name: "Troll", hp: 120, strength: 18, goldDrop: 40, xpDrop: 35 },
            { name: "Ent", hp: 150, strength: 20, goldDrop: 50, xpDrop: 40 },
          ];
        } else if (level <= 6) {
          monsterList = [
            { name: "Wyvern", hp: 250, strength: 40, goldDrop: 70, xpDrop: 60 },
            { name: "Vampire", hp: 120, strength: 25, goldDrop: 35, xpDrop: 30 },
            { name: "Hydra", hp: 300, strength: 50, goldDrop: 100, xpDrop: 80 },
            { name: "Lich", hp: 180, strength: 35, goldDrop: 50, xpDrop: 45 },
            { name: "Dragon", hp: 350, strength: 60, goldDrop: 120, xpDrop: 100 },
          ];
        } else {
          monsterList = [
            { name: "Behemoth", hp: 400, strength: 70, goldDrop: 150, xpDrop: 120 },
            { name: "Phoenix", hp: 350, strength: 65, goldDrop: 140, xpDrop: 110 },
            { name: "Leviathan", hp: 450, strength: 80, goldDrop: 180, xpDrop: 150 },
            { name: "Dark Sorcerer", hp: 300, strength: 75, goldDrop: 160, xpDrop: 130 },
            { name: "Colossus", hp: 500, strength: 90, goldDrop: 200, xpDrop: 180 },
          ];
        }

        return monsterList[Math.floor(Math.random() * monsterList.length)];
      }
    } catch (error) {
      console.error("Error during adventure command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /adventure`)
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