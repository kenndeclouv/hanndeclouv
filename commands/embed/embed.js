const { SlashCommandBuilder, ChannelType } = require("@discordjs/builders");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, WebhookClient } = require("discord.js");
const Embed = require("../../database/models/Embed"); // Sesuaikan path
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Perintah untuk membuat berbagai hal")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Buat embed (bisa tombol link dan fields) ")
        .addChannelOption((option) => option.setName("channel").setDescription("Channel tujuan embed").setRequired(true))
        .addStringOption((option) => option.setName("title").setDescription("Judul embed").setRequired(false))
        .addStringOption((option) => option.setName("description").setDescription("Deskripsi embed").setRequired(false))
        .addStringOption((option) => option.setName("buttons").setDescription("Tombol (Format: Tulisan|LINK|Style(Primary, Secondary, Success, Danger), pisahkan dengan ~~)").setRequired(false))
        .addStringOption((option) => option.setName("fields").setDescription("Fields (Format: Judul|Isi pisahkan dengan ~~)").setRequired(false))
        .addAttachmentOption((option) => option.setName("image").setDescription("foto").setRequired(false))
        .addStringOption((option) => option.setName("color").setDescription("Warna embed (hex code atau nama warna)").setRequired(false))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Hapus embed react role")
        .addStringOption((option) => option.setName("message_id").setDescription("ID pesan embed react role yang ingin dihapus").setRequired(true))
    )
    .addSubcommandGroup((group) =>
      group
        .setName("role")
        .setDescription("Buat embed dengan button yang memberikan role saat direact.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("create")
            .setDescription("Buat embed dengan tombol role reaction")
            .addStringOption((option) => option.setName("title").setDescription("Judul embed").setRequired(true))
            .addStringOption((option) => option.setName("description").setDescription("Deskripsi embed").setRequired(true))
            .addChannelOption((option) => option.setName("channel").setDescription("Channel tujuan embed").setRequired(true))
            .addStringOption((option) => option.setName("buttons").setDescription("Tombol (Format: Label|RoleID|Style(Primary, Secondary, Success, Danger), pisahkan dengan ~~)").setRequired(true))
            .addStringOption((option) => option.setName("color").setDescription("Warna embed (hex code atau nama warna)").setRequired(false))
        )
    ),
  adminOnly: true,

  async execute(interaction) {
    // Allow global usage for embed create/delete, but restrict role create to guilds only
    await interaction.deferReply();

    const group = interaction.options.getSubcommandGroup(false);
    const subcommand = interaction.options.getSubcommand();

    try {
      switch (group) {
        case "role": {
          // Only allow in guilds where the bot is present
          if (!interaction.guild) {
            return interaction.editReply({
              content: "❌ Perintah role hanya bisa digunakan di server (guild) tempat bot berada.",
              ephemeral: true,
            });
          }
          switch (subcommand) {
            case "create": {
              // Cek permission
              if (!interaction.memberPermissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.editReply({ content: "❌ Kamu butuh izin **Manage Roles**!" });
              }

              // Ambil data dari input
              const title = interaction.options.getString("title");
              let description = interaction.options.getString("description");
              const channel = interaction.options.getChannel("channel");
              const buttonsInput = interaction.options.getString("buttons");
              const color = interaction.options.getString("color") || "Blue";

              // Replace karakter khusus dengan line break
              description = description.replace(/\\n/g, "\n");

              // Parsing tombol
              const buttonsData = [];
              const buttonEntries = buttonsInput.split(/~~\s*/);

              for (const entry of buttonEntries) {
                const [label, roleId, style] = entry.split("|");

                // Validasi format
                if (!label || !roleId || !style) {
                  return interaction.editReply({ content: "❌ Format tombol salah! Gunakan: `Label|RoleID|Style`" });
                }

                // Validasi style
                const validStyles = Object.keys(ButtonStyle).filter((k) => isNaN(k));
                if (!validStyles.includes(style)) {
                  return interaction.editReply({ content: `❌ Style tidak valid! Pilihan: ${validStyles.join(", ")}` });
                }

                buttonsData.push({
                  label,
                  roleId,
                  style: ButtonStyle[style],
                });
              }

              // Validasi role
              for (const btn of buttonsData) {
                const role = interaction.guild.roles.cache.get(btn.roleId);

                if (!role) {
                  return interaction.editReply({ content: `❌ Role ${btn.roleId} tidak ditemukan!` });
                }

                if (role.comparePositionTo(interaction.guild.members.me.roles.highest) >= 0) {
                  return interaction.editReply({ content: `❌ Role ${role.name} lebih tinggi dari roleku!` });
                }
              }

              // Simpan ke database
              let newEmbed;
              try {
                newEmbed = await Embed.create({
                  guildId: interaction.guildId,
                  title,
                  description,
                  channelId: channel.id,
                  buttons: buttonsData,
                });
              } catch (error) {
                console.error(error);
                return interaction.editReply({ content: "❌ Gagal menyimpan embed ke database!" });
              }

              // Generate custom ID
              const buttonsWithId = buttonsData.map((btn, i) => ({
                ...btn,
                customId: `reactrole-${newEmbed.id}-${i}`,
              }));

              newEmbed.buttons = buttonsWithId;
              try {
                await newEmbed.save();
              } catch (error) {
                console.error(error);
                return interaction.editReply({ content: "❌ Gagal menyimpan tombol ke database!" });
              }

              // Buat tombol Discord
              const actionRow = new ActionRowBuilder();
              buttonsWithId.forEach((btn) => {
                actionRow.addComponents(new ButtonBuilder().setCustomId(btn.customId).setLabel(btn.label).setStyle(btn.style));
              });

              // Kirim embed
              const embed = new EmbedBuilder()
                .setTitle("> " + title)
                .setDescription(description)
                .setColor(color)
                .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

              let message;
              try {
                message = await channel.send({
                  embeds: [embed],
                  components: [actionRow],
                });
              } catch (error) {
                console.error(error);
                return interaction.editReply({ content: "❌ Gagal mengirim embed ke channel!" });
              }

              try {
                await newEmbed.update({ messageId: message.id });
              } catch (error) {
                console.error(error);
                // Don't fail the command, just log
              }

              return interaction.editReply({ content: `✅ Embed berhasil dikirim ke ${channel}!` });
            }
          }
          break;
        }
        default: {
          switch (subcommand) {
            case "create": {
              // Allow in DM or guild, but only require ManageRoles if in guild
              if (interaction.guild && !interaction.memberPermissions.has(PermissionsBitField.Flags.ManageRoles)) {
                return interaction.editReply({ content: "❌ Kamu butuh izin **Manage Roles**!" });
              }

              const title = interaction.options.getString("title");
              let description = interaction.options.getString("description") || null;
              const channel = interaction.options.getChannel("channel");
              const buttonsInput = interaction.options.getString("buttons") || null;
              const fieldsInput = interaction.options.getString("fields") || null;
              const image = interaction.options.getAttachment("image");
              const color = interaction.options.getString("color") || "Blue";

              if (description) description = description.replace(/\\n/g, "\n");

              // Cek validitas link pada tombol (jika ada)
              if (buttonsInput) {
                const buttonEntries = buttonsInput.split(/~~\s*/);
                for (const entry of buttonEntries) {
                  const [label, link] = entry.split("|");
                  if (link && !/^https?:\/\/\S+$/i.test(link)) {
                    return interaction.editReply({ content: "❌ Link tombol tidak valid! Pastikan menggunakan format URL yang benar (harus diawali http:// atau https://)" });
                  }
                }
              }

              const buttonsData = [];
              if (buttonsInput) {
                const buttonEntries = buttonsInput.split(/~~\s*/);

                for (const entry of buttonEntries) {
                  const [label, link] = entry.split("|");

                  if (!label || !link) {
                    return interaction.editReply({ content: "❌ Format tombol salah! Gunakan: `Label|Link`" });
                  }

                  buttonsData.push({
                    label,
                    link,
                    style: ButtonStyle.Link,
                  });
                }
              }

              // Parsing fields
              const fieldsData = [];
              if (fieldsInput) {
                const fieldEntries = fieldsInput.split(/~~\s*/);

                for (const entry of fieldEntries) {
                  const [name, value] = entry.split("|");

                  if (!name || !value) {
                    return interaction.editReply({ content: "❌ Format fields salah! Gunakan: `Judul|Isi`, pisahkan dengan ~~" });
                  }

                  fieldsData.push({
                    name,
                    value,
                    inline: false, // bisa juga true kalo mau fields sejajar
                  });
                }
              }

              // Only store to DB if in a guild the bot is in
              let newEmbed = null;
              let storeToDb = !!interaction.guild;
              if (storeToDb) {
                try {
                  newEmbed = await Embed.create({
                    guildId: interaction.guildId,
                    title,
                    description,
                    channelId: channel.id,
                    buttons: buttonsData,
                    fields: fieldsData,
                  });
                } catch (error) {
                  console.error(error);
                  return interaction.editReply({ content: "❌ Gagal menyimpan embed ke database!" });
                }
              }

              const buttons = buttonsData;

              if (storeToDb && newEmbed) {
                newEmbed.buttons = buttons;
                try {
                  await newEmbed.save();
                } catch (error) {
                  console.error(error);
                  return interaction.editReply({ content: "❌ Gagal menyimpan tombol ke database!" });
                }
              }

              const rows = [];
              let currentRow = new ActionRowBuilder();
              buttonsData.forEach((btn) => {
                if (currentRow.components.length === 5) {
                  // maksimal 5 per row
                  rows.push(currentRow);
                  currentRow = new ActionRowBuilder();
                }

                currentRow.addComponents(new ButtonBuilder().setLabel(btn.label).setStyle(btn.style).setURL(btn.link));
              });
              if (currentRow.components.length > 0) rows.push(currentRow);

              const embed = new EmbedBuilder()
                .setTitle("> " + title)
                .setDescription(description)
                .setColor(color)
                .setFooter({ text: `Sistem`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp();

              // tambahin fields kalo ada
              if (fieldsData.length > 0) {
                embed.addFields(...fieldsData);
              }

              // tambahin image kalo ada
              if (image) {
                embed.setImage(image.url);
              }

              let message;
              try {
                message = await channel.send({
                  embeds: [embed],
                  components: rows,
                });
              } catch (error) {
                console.error(error);
                return interaction.editReply({ content: "❌ Gagal mengirim embed ke channel!" });
              }

              if (storeToDb && newEmbed) {
                try {
                  await newEmbed.update({ messageId: message.id });
                } catch (error) {
                  console.error(error);
                }
              }

              return interaction.editReply({ content: `✅ Embed berhasil dikirim ke ${channel}!` });
            }

            case "delete": {
              const messageId = interaction.options.getString("message_id");
              if (!messageId) {
                return interaction.editReply({ content: "❌ Mohon berikan ID embed yang ingin dihapus." });
              }

              // Only try to delete from DB if in a guild
              if (interaction.guild) {
                // Cari embed di database
                const reactEmbed = await Embed.findOne({ where: { messageId } });

                if (!reactEmbed) {
                  return interaction.editReply({ content: `❌ Embed dengan ID \`${messageId}\` tidak ditemukan di database.` });
                }

                let deletedMessage = false;

                try {
                  const guild = interaction.guild;
                  const channel = await guild.channels.fetch(reactEmbed.channelId).catch(() => null);

                  if (channel) {
                    const msg = await channel.messages.fetch(messageId).catch(() => null);
                    if (msg) {
                      await msg.delete();
                      deletedMessage = true;
                    }
                  }
                } catch (err) {
                  console.error(`Gagal hapus pesan embed:`, err);
                  // lanjut aja, mungkin pesan emang udah kehapus
                }

                try {
                  await reactEmbed.destroy();
                } catch (err) {
                  console.error(`Gagal hapus data embed dari database:`, err);
                  return interaction.editReply({ content: "❌ Gagal menghapus data embed dari database!" });
                }

                return interaction.editReply({
                  content: `✅ Embed dengan ID \`${messageId}\` berhasil dihapus${deletedMessage ? " (pesan di channel juga dihapus)" : ""}.`,
                });
              } else {
                // In DM, just try to delete the message if possible (no DB)
                // We can't fetch a message in DM by ID unless it's in the current channel
                try {
                  const channel = interaction.channel;
                  const msg = await channel.messages.fetch(messageId).catch(() => null);
                  if (msg) {
                    await msg.delete();
                    return interaction.editReply({ content: `✅ Embed dengan ID \`${messageId}\` berhasil dihapus (pesan di DM dihapus).` });
                  } else {
                    return interaction.editReply({ content: `❌ Tidak dapat menemukan pesan dengan ID \`${messageId}\` di DM ini.` });
                  }
                } catch (err) {
                  console.error(`Gagal hapus pesan embed di DM:`, err);
                  return interaction.editReply({ content: "❌ Gagal menghapus pesan embed di DM!" });
                }
              }
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error("Error during /embed command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /embed`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({ text: `Error dari server ${interaction.guild ? interaction.guild.name : "DM/Unknown"}` })
        .setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      // Only reply if not already replied
      return interaction.editReply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};