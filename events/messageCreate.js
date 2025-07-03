const { Events, EmbedBuilder, ChannelType } = require("discord.js");
const BotSetting = require("../database/models/BotSetting");
const StickyMessage = require("../database/models/StickyMessage");
const system = require("../system");
const axios = require("axios");
require("dotenv").config();

function createFakeInteraction(message, commandName, args = []) {
    // Create a deferred message tracker
    let deferredMessage = null;
    let replied = false;
    let deferred = false;
    let ephemeral = false;
    let followUps = [];

    // Improved argument parsing
    const parsedArgs = {};
    const positionalArgs = [];

    // Parse key:value and positional arguments
    for (const arg of args) {
        if (arg.includes(':')) {
            const [key, value] = arg.split(':');
            parsedArgs[key.toLowerCase()] = value;
        } else {
            positionalArgs.push(arg);
        }
    }

    // Create base interaction object
    const fakeInteraction = {
        commandName,
        user: message.author,
        member: message.member,
        guild: message.guild,
        guildId: message.guild?.id,
        channel: message.channel,
        client: message.client,
        createdTimestamp: message.createdTimestamp,
        id: message.id,
        token: `fake_${message.id}`,
        deferred: false,
        replied: false,
        ephemeral: false,
        isCommand: () => true,
        inGuild: () => !!message.guild,
        inCachedGuild: () => !!message.guild,
        isAutocomplete: () => false,
        isChatInputCommand: () => true,
        isMessageContextMenuCommand: () => false,
        isUserContextMenuCommand: () => false,
        isRepliable: () => !replied,

        // Biar fake interaction reply selalu me-reply message command (kayak chatting)
        deferReply: async (options = {}) => {
            if (deferred || replied) return;
            deferred = true;
            fakeInteraction.deferred = true;
            ephemeral = options.ephemeral || false;

            const content = options.content || '⏳ Processing command...';
            deferredMessage = await message.reply({ content });
            return deferredMessage;
        },

        editReply: async (options) => {
            // Delete processing message if it exists
            if (deferredMessage) {
                try {
                    await deferredMessage.delete();
                    deferredMessage = null;
                } catch (error) {
                    console.error('Failed to delete processing message:', error);
                }
            }

            if (options) {
                // Always reply to the original command message
                return message.reply(options);
            }
        },

        reply: async (options) => {
            // Delete processing message if it exists
            if (deferredMessage) {
                try {
                    await deferredMessage.delete();
                    deferredMessage = null;
                } catch (error) {
                    console.error('Failed to delete processing message:', error);
                }
            }

            replied = true;
            fakeInteraction.replied = true;

            // Always reply to the original command message
            if (typeof options === 'string') {
                return message.reply(options);
            }
            return message.reply({
                content: options.content,
                embeds: options.embeds || [],
                components: options.components || [],
                ephemeral: options.ephemeral || false
            });
        },

        followUp: async (options) => {
            // Follow up juga reply ke message command
            const msg = await message.reply(options);
            followUps.push(msg);
            return msg;
        },

        deleteReply: async () => {
            if (deferredMessage) return deferredMessage.delete();
            if (replied) return message.delete();
            return false;
        },

        fetchReply: async () => {
            if (deferredMessage) return deferredMessage;
            if (replied) return message;
            return null;
        },

        // NEW: Automatic cleanup method
        cleanup: async () => {
            if (deferredMessage) {
                try {
                    await deferredMessage.delete();
                    deferredMessage = null;
                } catch (error) {
                    console.error('Cleanup failed:', error);
                }
            }
        }
    };

    // Enhanced options parser (unchanged from previous version)
    fakeInteraction.options = {
        argsMap: parsedArgs,
        positionalArgs,
        currentPosition: 0,

        getSubcommandGroup: () => null,
        getSubcommand: () => positionalArgs[0]?.toLowerCase() || null,

        getString: (name) => {
            if (name && parsedArgs[name.toLowerCase()]) {
                return parsedArgs[name.toLowerCase()];
            }
            if (positionalArgs.length > fakeInteraction.options.currentPosition) {
                return positionalArgs[fakeInteraction.options.currentPosition++];
            }
            return null;
        },

        getInteger: (name) => {
            const value = fakeInteraction.options.getString(name);
            if (!value) return null;
            const num = parseInt(value);
            return isNaN(num) ? null : num;
        },

        getBoolean: (name) => {
            const value = fakeInteraction.options.getString(name);
            if (!value) return null;
            return ['true', 'yes', '1'].includes(value.toLowerCase());
        },

        getNumber: (name) => {
            const value = fakeInteraction.options.getString(name);
            if (!value) return null;
            const num = parseFloat(value);
            return isNaN(num) ? null : num;
        },

        getUser: (name) => {
            const value = fakeInteraction.options.getString(name);
            if (!value) return message.mentions.users.first() || message.author;

            return message.mentions.users.get(value.replace(/[<@!>]/g, '')) ||
                message.client.users.cache.get(value) ||
                message.author;
        },

        getMember: (name) => {
            const user = fakeInteraction.options.getUser(name);
            if (!user) return null;
            return message.guild?.members.resolve(user) || null;
        },

        getChannel: (name) => {
            const value = fakeInteraction.options.getString(name);
            if (!value) return message.mentions.channels.first() || message.channel;

            return message.mentions.channels.get(value.replace(/[<#>]/g, '')) ||
                message.client.channels.cache.get(value) ||
                message.channel;
        },

        getRole: (name) => {
            const value = fakeInteraction.options.getString(name);
            if (!value) return message.mentions.roles.first() || null;

            return message.mentions.roles.get(value.replace(/[<@&>]/g, '')) ||
                message.guild?.roles.cache.get(value) ||
                null;
        },

        getMentionable: (name) => {
            return fakeInteraction.options.getUser(name) ||
                fakeInteraction.options.getRole(name) ||
                null;
        },

        getAttachment: () => null,

        getMessage: () => positionalArgs.join(' '),

        getRest: () => {
            const rest = positionalArgs.slice(fakeInteraction.options.currentPosition).join(' ');
            fakeInteraction.options.currentPosition = positionalArgs.length;
            return rest;
        }
    };

    // Automatic cleanup when the interaction is handled
    const originalExecute = fakeInteraction.execute;
    fakeInteraction.execute = async (command) => {
        try {
            const result = await command.execute(fakeInteraction);
            // Clean up after successful execution
            await fakeInteraction.cleanup();
            return result;
        } catch (error) {
            // Also clean up on error
            await fakeInteraction.cleanup();
            throw error;
        }
    };

    return fakeInteraction;
}

module.exports = {
    name: Events.MessageCreate,

    async execute(message, client) {
        if (!message || message.author?.bot || !message.guild || !message.channel) return;
        await system(message, client);

        // === Handle !message command dulu
        if (message.content.startsWith("k.") || message.content.startsWith("!")) {
            const args = message.content.startsWith("k.") ? message.content.slice(2).trim().split(/ +/) : message.content.slice(1).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();

            const realName = client.commands.has(cmdName)
                ? cmdName
                : client.aliases.get(cmdName);

            if (!realName) return;

            const command = client.commands.get(realName);
            if (!command) return;

            // 🔁 fake interaction object
            const fakeInteraction = createFakeInteraction(message, cmdName, args);

            // Patch: add getSubcommandGroup to fakeInteraction.options to avoid errors
            if (fakeInteraction.options && typeof fakeInteraction.options.getSubcommandGroup !== "function") {
                fakeInteraction.options.getSubcommandGroup = () => null;
            }

            try {
                await command.execute(fakeInteraction);
            } catch (err) {
                console.error(err);
                await message.reply("❌ error pas ngejalanin command.");
            }
        }

        // === Handle sticky message (JALAN DI SEMUA PESAN)
        try {
            const sticky = await StickyMessage.getCache({ channelId: message.channel.id });
            if (sticky) {
                try {
                    // hapus sticky sebelumnya
                    if (sticky.messageId) {
                        const oldMsg = await message.channel.messages.fetch(sticky.messageId).catch(() => null);
                        if (oldMsg) await oldMsg.delete().catch(() => { });
                    }

                    // kirim ulang sticky dalam bentuk embed yang rapi
                    const stickyEmbed = new EmbedBuilder()
                        .setTitle("> 📌 Sticky Message")
                        .setDescription(sticky.message)
                        .setColor("Yellow")
                        .setFooter({ text: "Sticky Message", iconURL: client.user.displayAvatarURL() });
                    const sent = await message.channel.send({ embeds: [stickyEmbed] });
                    sticky.messageId = sent.id;
                    sticky.changed("messageId", true);
                    await sticky.saveAndUpdateCache("channelId");
                } catch (err) {
                    console.error("❌ Sticky Message Error:", err);
                }
            }
        } catch (err) {
            console.error("❌ Gagal load sticky:", err);
        }

        // === Cek apakah channel AI aktif
        try {
            const botSetting = await BotSetting.getCache({ guildId: message.guild.id });
            if (!botSetting || !Array.isArray(botSetting.aiChannelIds)) return;
            if (!botSetting.aiChannelIds.includes(message.channel.id)) return;

            if (!message.content || typeof message.content !== "string" || !message.content.trim()) return;

            await message.channel.sendTyping();

            const response = await axios.post("https://api.pawan.krd/cosmosrp/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "kamu adalah AI Discord imut yang suka ngajak ngobrol dan pintar" },
                    { role: "user", content: message.content }
                ]
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.PAWAN_API_KEY}`
                }
            });

            const aiReply = response.data.choices[0].message.content;
            await message.reply({ content: aiReply });

        } catch (err) {
            console.error("❌ AI Message Error:", err);
            try {
                await message.channel.send("❌ Gagal menjawab dengan AI.");
            } catch (_) { }
        }
    }
}