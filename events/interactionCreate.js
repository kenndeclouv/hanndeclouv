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
          squad: "squadOn",
          nsfw: "nsfwOn",
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

        // Tombol create_ticket
        if (customId === "create_ticket") {
          const ticketConfig = await TicketConfig.findOne({ where: { guildId: interaction.guild.id } });
          if (!ticketConfig) return interaction.reply({ content: "❌ | Sistem tiket belum dikonfigurasi.", ephemeral: true });
          return createTicket(interaction, ticketConfig);
        }

        if (customId === "ticket_close") {
          const ticket = await Ticket.findOne({ where: { channelId: interaction.channel.id } });
          if (!ticket) return interaction.reply({ content: "❌ | Ticket tidak ada dalam sistem.", ephemeral: true });
          return closeTicket(interaction);
        }

        // Tombol react-role (format: react-<embedId>-<buttonIndex>)
        if (customId.startsWith("react-")) {
          const [_, embedId, buttonIndex] = customId.split("-");

          const embedData = await Embed.findByPk(embedId);
          if (!embedData) return;

          const buttonData = embedData.buttons[buttonIndex];
          if (!buttonData) return;

          const role = interaction.guild.roles.cache.get(buttonData.roleId);
          const member = interaction.member;

          if (!role) return interaction.reply({ content: "❌ Role tidak ditemukan.", ephemeral: true });

          // Toggle role
          if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            await interaction.reply({
              content: `✅ Role **${role.name}** dihapus!`,
              ephemeral: true,
            });
          } else {
            await member.roles.add(role);
            await interaction.reply({
              content: `✅ Role **${role.name}** ditambahkan!`,
              ephemeral: true,
            });
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
        .setFooter({ text: `Error dari server ${interaction.guild?.name || "Unknown"}` })
        .setTimestamp();

      // Kirim error ke webhook
      webhookClient.send({ embeds: [errorEmbed] }).catch(console.error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "💀 | Ada error saat proses interaksi.",
          ephemeral: true,
        });
      }
    }
  },
};