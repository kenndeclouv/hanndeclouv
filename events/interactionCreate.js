/**
 * ==========================================================
 *  Event Handler: interactionCreate.js
 *  --------------------------------------
 *  Handler utama untuk semua event interaction Discord:
 *  - Slash Command
 *  - Button
 *  - Autocomplete
 *  - Error Handling
 *  --------------------------------------
 *  copyright © 2025 kenndeclouv
 *  dibuat oleh: chaadeclouv
 * ==========================================================
 */

/**
 * 🔧 Import module & model yang dibutuhkan
 */
const { Events, WebhookClient, EmbedBuilder } = require("discord.js");
const TicketConfig = require("../database/models/TicketConfig");
const BotSetting = require("../database/models/BotSetting");
const { createTicket, closeTicket } = require("../helpers");
const Ticket = require("../database/models/Ticket");
const Embed = require("../database/models/Embed");
require("dotenv").config();
const path = require("path");
const fs = require("fs");

const buttonHandlers = new Map();

// load semua file dari folder /button/
const buttonDir = path.join(__dirname, "..", "buttons");
const files = fs.readdirSync(buttonDir).filter(file => file.endsWith(".js"));

for (const file of files) {
  const handler = require(path.join(buttonDir, file));
  const name = file.replace(".js", ""); // misal: create_ticket.js -> create_ticket
  buttonHandlers.set(name, handler);
}

module.exports = {
  name: Events.InteractionCreate,

  /**
   * 🚀 Fungsi utama untuk handle semua interaction
   * @param {import('discord.js').Interaction} interaction - interaction dari Discord.js
   * @param {import('discord.js').Client} client - client Discord
   */
  async execute(interaction, client) {
    try {
      // ==========================
      // 1. Handler Slash Command
      // ==========================
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Jika di DM, skip permission dan setting guild
        if (!interaction.guild) {
          // Eksekusi command langsung
          return await command.execute(interaction, client);
        }

        // Cek permission command
        if (command.permissions?.length) {
          const missingPermissions = command.permissions.filter((p) => !interaction.guild.members.me.permissions.has(p));
          if (missingPermissions.length > 0) {
            return interaction.reply({
              content: `⚠️ | Kamu tidak punya permission: \`${missingPermissions.join(", ")}\`.`,
              ephemeral: true,
            });
          }
        }

        // Validasi khusus mute/unmute
        if (["mute", "unmute"].includes(command.name)) {
          const member = interaction.options.getMember("user");
          if (!member?.voice?.channel) {
            return interaction.reply({
              content: `🚫 | User harus di voice channel buat ${command.name === "mute" ? "mute" : "unmute"}.`,
              ephemeral: true,
            });
          }
        }

        // Cek setting fitur server
        const setting = await BotSetting.getCache({ guildId: interaction.guildId });
        const commandFeatureMap = {
          adventure: "adventureOn",
          economy: "economyOn",
          giveaway: "giveawayOn",
          invites: "invitesOn",
          leveling: "levelingOn",
          pet: "petOn",
          suggestion: "suggestionOn",
          ticket: "ticketOn",
          clan: "clanOn",
          nsfw: "nsfwOn",
          checklist: "checklistOn",
          checklist: "checklistOn",
        };
        const requiredSetting = commandFeatureMap[interaction.commandName];
        if (requiredSetting && !setting[requiredSetting] && interaction.user.id !== process.env.OWNER_ID) {
          return interaction.reply({
            content: "fitur ini dimatiin di server inii yaa 😭",
            ephemeral: true,
          });
        }

        // Eksekusi command
        return await command.execute(interaction, client);
      }

      // ==========================
      // 2. Handler Button Interaction
      // ==========================
      if (interaction.isButton()) {
        console.log("✅ Tombol ke-trigger:", interaction.customId);
        const customId = interaction.customId;

        // Abaikan semua tombol tictactoe
        if (interaction.customId.startsWith('tictactoe-')) {
          return; // Biarkan collector game yang menangani
        }

        // exact match
        if (buttonHandlers.has(customId)) {
          return buttonHandlers.get(customId)(interaction);
        }

        // prefix match (misal: react-xxx → react.js)
        for (const [name, handler] of buttonHandlers.entries()) {
          if (customId.startsWith(`${name}-`)) {
            return handler(interaction);
          }
        }
      }

      // ==========================
      // 3. Handler Autocomplete
      // ==========================
      if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command?.autocomplete) {
          try {
            await command.autocomplete(interaction);
          } catch (err) {
            console.error("❌ Autocomplete Error:", err);
          }
        }
      }
      // ==========================
      // 4. Handler Modal Submit
      // ==========================
      if (interaction.isModalSubmit()) {
        const [prefix] = interaction.customId.split("|"); // e.g. 'embed-create'
        const modalPath = path.join(__dirname, "../modals", `${prefix}.js`);
        if (!fs.existsSync(modalPath)) return;

        try {
          const handler = require(modalPath);
          await handler(interaction);
        } catch (err) {
          console.error(`❌ Error handle modal '${prefix}'`, err);
          if (!interaction.replied) {
            await interaction.reply({ content: "❌ Gagal memproses modal ini 😭", ephemeral: true });
          }
        }
        return;
      }
    } catch (err) {
      // ==========================
      // 4. Global Error Handler
      // ==========================
      console.error("❌ Global Interaction Handler Error:", err);

      const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_ERROR_LOGS });
      const errorEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("> ❌ Error event interaction create")
        .setDescription(`\`\`\`${err.stack || err}\`\`\``)
        .setFooter({ text: `Error dari server ${interaction.guild?.name || (interaction.user?.username ? `DM dari ${interaction.user.username}` : "Unknown")}` })
        .setTimestamp();

      // Kirim error ke webhook
      webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "💀 | Ada error saat proses interaksi.",
          ephemeral: true,
        }).catch(() => { });
      }
    }
  },
};