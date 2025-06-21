const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder, WebhookClient } = require("discord.js");
const Checklist = require("../../database/models/Checklist");
const { checkPermission } = require("../../helpers");
require("dotenv").config();
module.exports = {
  data: new SlashCommandBuilder()
    .setName("checklist")
    .setDescription("Kelola checklist")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Tambah item ke checklist")
        .addStringOption((option) => option.setName("item").setDescription("Item checklist").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Hapus item dari checklist")
        .addIntegerOption((option) => option.setName("index").setDescription("Nomor item yang akan dihapus").setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("toggle")
        .setDescription("Tandai item checklist selesai/belum")
        .addIntegerOption((option) => option.setName("index").setDescription("Nomor item yang akan di-toggle").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("list").setDescription("Lihat semua checklist"))
    .addSubcommand((subcommand) => subcommand.setName("clear").setDescription("Hapus semua checklist")),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "🚫 | This command can't use here😭",
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    try {
      const subcommand = interaction.options.getSubcommand();
      if (!(await checkPermission(interaction.member))) {
        return interaction.editReply({
          content: "❌ Kamu tidak punya izin untuk menggunakan perintah ini.",
          ephemeral: true,
        });
      }

      switch (subcommand) {
        case "add":
          await addChecklist(interaction);
          break;
        case "remove":
          await removeChecklist(interaction);
          break;
        case "toggle":
          await toggleChecklist(interaction);
          break;
        case "list":
          await listChecklist(interaction);
          break;
        case "clear":
          await clearChecklist(interaction);
          break;
        default:
          await interaction.editReply("Subcommand tidak dikenal.");
      }
    } catch (error) {
      console.error("Error during checklist command execution:", error);
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

/**
  ===============================================
                PRIVATE FUNCTION
  ===============================================
 */

async function addChecklist(interaction) {
  const item = interaction.options.getString("item");
  const guildId = interaction.guild.id;

  let checklist = await Checklist.findOne({ where: { guildId } });
  if (!checklist) {
    checklist = await Checklist.create({ guildId, items: "[]" });
  }
  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }
  items.push({ text: item, checked: false });
  await checklist.update({ items: JSON.stringify(items) });

  await interaction.editReply(`Item checklist ditambahkan: \`${item}\``);
}

async function removeChecklist(interaction) {
  const index = interaction.options.getInteger("index") - 1;
  const guildId = interaction.guild.id;

  let checklist = await Checklist.findOne({ where: { guildId } });
  if (!checklist) return interaction.editReply("Checklist kosong.");

  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }
  if (index < 0 || index >= items.length) {
    return interaction.editReply("Nomor item tidak valid.");
  }
  const removed = items.splice(index, 1);
  await checklist.update({ items: JSON.stringify(items) });

  await interaction.editReply(`Item checklist dihapus: \`${removed[0].text}\``);
}

async function toggleChecklist(interaction) {
  const index = interaction.options.getInteger("index") - 1;
  const guildId = interaction.guild.id;

  let checklist = await Checklist.findOne({ where: { guildId } });
  if (!checklist) return interaction.editReply("Checklist kosong.");

  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }
  if (index < 0 || index >= items.length) {
    return interaction.editReply("Nomor item tidak valid.");
  }
  items[index].checked = !items[index].checked;
  await checklist.update({ items: JSON.stringify(items) });

  await interaction.editReply(`Item checklist \`${items[index].text}\` sekarang ${items[index].checked ? "✅ selesai" : "❌ belum selesai"}.`);
}

async function listChecklist(interaction) {
  const guildId = interaction.guild.id;
  let checklist = await Checklist.findOne({ where: { guildId } });
  if (!checklist) return interaction.editReply("Checklist kosong.");

  let items = [];
  try {
    items = JSON.parse(checklist.items);
  } catch {
    items = [];
  }
  if (items.length === 0) return interaction.editReply("Checklist kosong.");

  const desc = items.map((item, i) => `${item.checked ? "✅" : "⬜"} \`${i + 1}\` ${item.text}`).join("\n");

  const embed = new EmbedBuilder()
    .setTitle("> Checklist Server")
    .setDescription(desc)
    .setColor("Green")
    .setFooter({ text: `Total: ${items.length} item` });

  await interaction.editReply({ embeds: [embed] });
}

async function clearChecklist(interaction) {
  const guildId = interaction.guild.id;
  let checklist = await Checklist.findOne({ where: { guildId } });
  if (!checklist) return interaction.editReply("Checklist sudah kosong.");

  await checklist.update({ items: "[]" });
  await interaction.editReply("Checklist telah dikosongkan.");
}
