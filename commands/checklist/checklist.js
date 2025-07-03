const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const Checklist = require("../../database/models/Checklist");
const { checkPermission, embedFooter } = require("../../helpers");
require("dotenv").config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("checklist")
    .setDescription("Kelola checklist")
    .addSubcommandGroup(group => group
      .setName("server")
      .setDescription("Kelola checklist server (public)")
      .addSubcommand(subcommand => subcommand
        .setName("add")
        .setDescription("Tambah item ke checklist server")
        .addStringOption(option => option.setName("item").setDescription("Item checklist").setRequired(true))
      )
      .addSubcommand(subcommand => subcommand
        .setName("remove")
        .setDescription("Hapus item dari checklist server")
        .addIntegerOption(option => option.setName("index").setDescription("Nomor item yang akan dihapus").setRequired(true))
      )
      .addSubcommand(subcommand => subcommand
        .setName("toggle")
        .setDescription("Tandai item checklist server selesai/belum")
        .addIntegerOption(option => option.setName("index").setDescription("Nomor item yang akan di-toggle").setRequired(true))
      )
      .addSubcommand(subcommand => subcommand
        .setName("list")
        .setDescription("Lihat semua checklist server"))
      .addSubcommand(subcommand => subcommand
        .setName("clear")
        .setDescription("Hapus semua checklist server"))
    )
    .addSubcommandGroup(group => group
      .setName("personal")
      .setDescription("Kelola checklist personal")
      .addSubcommand(subcommand => subcommand
        .setName("add")
        .setDescription("Tambah item ke checklist personal")
        .addStringOption(option => option.setName("item").setDescription("Item checklist").setRequired(true))
      )
      .addSubcommand(subcommand => subcommand
        .setName("remove")
        .setDescription("Hapus item dari checklist personal")
        .addIntegerOption(option => option.setName("index").setDescription("Nomor item yang akan dihapus").setRequired(true))
      )
      .addSubcommand(subcommand => subcommand
        .setName("toggle")
        .setDescription("Tandai item checklist personal selesai/belum")
        .addIntegerOption(option => option.setName("index").setDescription("Nomor item yang akan di-toggle").setRequired(true))
      )
      .addSubcommand(subcommand => subcommand
        .setName("list")
        .setDescription("Lihat semua checklist personal"))
      .addSubcommand(subcommand => subcommand
        .setName("clear")
        .setDescription("Hapus semua checklist personal"))
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }
    // await interaction.deferReply({ ephemeral: true });

    try {
      const group = interaction.options.getSubcommandGroup();
      const subcommand = interaction.options.getSubcommand();
      const guildId = interaction.guild.id;
      const userId = group === "personal" ? interaction.user.id : null;

      // Cek izin untuk command server
      if (group === "server" && !(await checkPermission(interaction.member))) {
        return interaction.reply({
          content: "❌ Kamu tidak punya izin untuk menggunakan perintah server.",
          ephemeral: true,
        });
      }

      switch (subcommand) {
        case "add":
          await addChecklist(interaction, guildId, userId, group);
          break;
        case "remove":
          await removeChecklist(interaction, guildId, userId, group);
          break;
        case "toggle":
          await toggleChecklist(interaction, guildId, userId, group);
          break;
        case "list":
          await listChecklist(interaction, guildId, userId, group);
          break;
        case "clear":
          await clearChecklist(interaction, guildId, userId, group);
          break;
        default:
          await interaction.reply("Subcommand tidak dikenal.");
      }
    } catch (error) {
      console.error("Error during checklist command execution:", error);
      // Send DM to owner about the error
      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });

      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle(`> ❌ Error command /adventure`)
        .setDescription(`\`\`\`${error}\`\`\``)
        .setFooter({ text: `Error dari server ${interaction.guild.name}` })
        .setTimestamp();

      // Kirim ke webhook
      webhookClient
        .send({
          embeds: [errorEmbed],
        })
        .catch(console.error);
      return interaction.reply({ content: "❌ | Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi." });
    }
  },
};

/**
  ===============================================
                PRIVATE FUNCTION
  ===============================================
 */

async function addChecklist(interaction, guildId, userId, group) {
  const item = interaction.options.getString("item");

  const [checklist, created] = await Checklist.findOrCreate({
    where: { guildId, userId },
    defaults: { items: "[]" }
  });

  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }

  items.push({ text: item, checked: false });
  await checklist.update({ items: JSON.stringify(items) });

  const scope = userId ? "Personal" : "Server";
  const color = userId ? 0x00bfff : 0x43b581; // blue for personal, green for server

  const embed = new EmbedBuilder()
    .setTitle(`✅ Item Ditambahkan ke Checklist ${scope}`)
    .setDescription(`**Item:**\n> \`${item}\``)
    .setColor(color)
    .setFooter(embedFooter(interaction))
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: group === "personal" ? true : false
  });
}

async function removeChecklist(interaction, guildId, userId, group) {
  const index = interaction.options.getInteger("index") - 1;

  const checklist = await Checklist.getCache({ guildId: guildId, userId: userId });
  if (!checklist) {
    const scope = userId ? "Personal" : "Server";
    const embed = new EmbedBuilder()
      .setTitle(`❌ Checklist ${scope} Kosong`)
      .setDescription(`Tidak ada item yang bisa dihapus.`)
      .setColor("Red")
      .setTimestamp();
    return interaction.reply({
      embeds: [embed],
      ephemeral: group === "personal" ? true : false
    });
  }

  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }

  if (index < 0 || index >= items.length) {
    const embed = new EmbedBuilder()
      .setTitle("❌ Nomor Item Tidak Valid")
      .setDescription("Silakan cek nomor item yang ingin dihapus.")
      .setColor("Red")
      .setTimestamp();
    return interaction.reply({
      embeds: [embed],
      ephemeral: group === "personal" ? true : false
    });
  }

  const removed = items.splice(index, 1);
  await checklist.update({ items: JSON.stringify(items) });

  const scope = userId ? "Personal" : "Server";
  const color = userId ? 0x00bfff : 0x43b581;

  const embed = new EmbedBuilder()
    .setTitle(`🗑️ Item Dihapus dari Checklist ${scope}`)
    .setDescription(`**Item:**\n> \`${removed[0].text}\``)
    .setColor(color)
    .setFooter(embedFooter(interaction))
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: group === "personal" ? true : false
  });
}

async function toggleChecklist(interaction, guildId, userId, group) {
  const index = interaction.options.getInteger("index") - 1;

  const checklist = await Checklist.getCache({ guildId: guildId, userId: userId });
  if (!checklist) {
    const scope = userId ? "Personal" : "Server";
    const embed = new EmbedBuilder()
      .setTitle(`❌ Checklist ${scope} Kosong`)
      .setDescription(`Tidak ada item yang bisa diubah statusnya.`)
      .setColor("Red")
      .setTimestamp();
    return interaction.reply({
      embeds: [embed],
      ephemeral: group === "personal" ? true : false
    });
  }

  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }

  if (index < 0 || index >= items.length) {
    const embed = new EmbedBuilder()
      .setTitle("❌ Nomor Item Tidak Valid")
      .setDescription("Silakan cek nomor item yang ingin diubah statusnya.")
      .setColor("Red")
      .setTimestamp();
    return interaction.reply({
      embeds: [embed],
      ephemeral: group === "personal"
    });
  }

  items[index].checked = !items[index].checked;
  await checklist.update({ items: JSON.stringify(items) });

  const scope = userId ? "Personal" : "Server";
  const color = items[index].checked ? 0x43b581 : 0xffcc00; // green for done, yellow for undone
  const status = items[index].checked ? "✅ Selesai" : "⬜ Belum Selesai";

  const embed = new EmbedBuilder()
    .setTitle(`🔄 Status Item Checklist ${scope} Diubah`)
    .addFields(
      { name: "Item", value: `\`${items[index].text}\``, inline: true },
      { name: "Status", value: status, inline: true }
    )
    .setColor(color)
    .setFooter(embedFooter(interaction))
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: group === "personal"
  });
}

async function listChecklist(interaction, guildId, userId, group) {
  const checklist = await Checklist.getCache({ guildId: guildId, userId: userId });
  if (!checklist) {
    const scope = userId ? "Personal" : "Server";
    const embed = new EmbedBuilder()
      .setTitle(`❌ Checklist ${scope} Kosong`)
      .setDescription(`Belum ada item di checklist ini.`)
      .setColor("Red")
      .setTimestamp();
    return interaction.reply({
      embeds: [embed],
      ephemeral: group === "personal"
    });
  }

  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }

  if (items.length === 0) {
    const scope = userId ? "Personal" : "Server";
    const embed = new EmbedBuilder()
      .setTitle(`❌ Checklist ${scope} Kosong`)
      .setDescription(`Belum ada item di checklist ini.`)
      .setColor("Red")
      .setTimestamp();
    return interaction.reply({
      embeds: [embed],
      ephemeral: group === "personal" ? true : false
    });
  }

  const scope = userId ? "Personal" : "Server";
  const color = userId ? "Blue" : "Green";

  // Split into fields if too long
  const maxFieldLength = 1024;
  let descArr = [];
  let current = "";
  items.forEach((item, i) => {
    const line = `${item.checked ? "✅" : "⬜"} \`${i + 1}\` ${item.text}\n`;
    if ((current + line).length > maxFieldLength) {
      descArr.push(current);
      current = "";
    }
    current += line;
  });
  if (current) descArr.push(current);

  const embed = new EmbedBuilder()
    .setTitle(`📋 Checklist ${scope}`)
    .setColor(color)
    .setTimestamp()
    .setFooter(embedFooter(interaction));

  descArr.forEach((desc, idx) => {
    embed.addFields({
      name: descArr.length > 1 ? `Daftar Item (${idx + 1})` : "Daftar Item",
      value: desc
    });
  });

  await interaction.reply({
    embeds: [embed],
    ephemeral: group === "personal" ? true : false
  });
}

async function clearChecklist(interaction, guildId, userId, group) {
  const checklist = await Checklist.getCache({ guildId: guildId, userId: userId });
  if (!checklist) {
    const scope = userId ? "Personal" : "Server";
    const embed = new EmbedBuilder()
      .setTitle(`❌ Checklist ${scope} Sudah Kosong`)
      .setDescription(`Tidak ada item yang perlu dihapus.`)
      .setColor("Red")
      .setTimestamp();
    return interaction.reply({
      embeds: [embed],
      ephemeral: group === "personal"
    });
  }

  await checklist.update({ items: "[]" });
  const scope = userId ? "Personal" : "Server";
  const color = userId ? "Blue" : "Green";

  const embed = new EmbedBuilder()
    .setTitle(`🧹 Checklist ${scope} Telah Dikosongkan`)
    .setDescription(`Semua item telah dihapus dari checklist ini.`)
    .setColor(color)
    .setTimestamp();

  await interaction.reply({
    embeds: [embed],
    ephemeral: group === "personal"
  });
}