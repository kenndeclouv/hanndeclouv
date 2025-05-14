const { DataTypes, Model } = require("sequelize");
const sequelize = require("../sequelize"); // koneksi sequelize
const CacheableModel = require("../modelCache");

class BotSetting extends CacheableModel {
  static init(sequelize) {
    return super.init(
      {
        guildId: { type: DataTypes.STRING, allowNull: false, unique: true },
        lang: { type: DataTypes.STRING, defaultValue: "id" },

        // AUTOMOD
        whitelist: { type: DataTypes.JSON, defaultValue: [] },
        badwords: { type: DataTypes.JSON, defaultValue: [] },

        // COMMON SETTING
        admins: { type: DataTypes.JSON, defaultValue: [] },
        ignoredChannels: { type: DataTypes.JSON, defaultValue: [] },
        modLogChannelId: { type: DataTypes.STRING },

        // SERVER STATS
        memberCountChannelId: { type: DataTypes.STRING },
        onlineCountChannelId: { type: DataTypes.STRING },

        // FEATURE ON/OFF
        antiInviteOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        antiLinkOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        antiSpamOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        antiBadwordOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        serverStatsOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        economyOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        giveawayOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        invitesOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        suggestionOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        ticketOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        petOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        clanOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        adventureOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        levelingOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        welcomeInOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        welcomeOutOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        minecraftStatsOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        nsfwOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        checklistOn: { type: DataTypes.BOOLEAN, defaultValue: false },
        invitesOn: { type: DataTypes.BOOLEAN, defaultValue: false },

        rolePrefixOn: { type: DataTypes.BOOLEAN, defaultValue: false },

        // LEVELING
        levelingChannelId: { type: DataTypes.STRING },
        levelingCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        levelingXp: { type: DataTypes.INTEGER, defaultValue: 0 },
        roleRewards: { type: DataTypes.JSON, defaultValue: [] },

        // WELCOMER
        welcomeInChannelId: { type: DataTypes.STRING, allowNull: true },
        welcomeOutChannelId: { type: DataTypes.STRING, allowNull: true },
        welcomeRoleId: { type: DataTypes.STRING, allowNull: true },
        welcomeInText: { type: DataTypes.STRING, allowNull: true },
        welcomeOutText: { type: DataTypes.STRING, allowNull: true },

        clanCategoryId: { type: DataTypes.STRING, allowNull: true },
        clanForumId: { type: DataTypes.STRING, allowNull: true },

        // COOLDOWNS
        dailyCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        begCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        lootboxCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        workCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        robCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        hackCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        petCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },
        gachaCooldown: { type: DataTypes.INTEGER, defaultValue: 0 },

        // MINECRAFT
        minecraftIp: { type: DataTypes.STRING, allowNull: true },
        minecraftPort: { type: DataTypes.INTEGER, allowNull: true },

        minecraftIpChannelId: { type: DataTypes.STRING, allowNull: true },
        minecraftPortChannelId: { type: DataTypes.STRING, allowNull: true },
        minecraftStatusChannelId: { type: DataTypes.STRING, allowNull: true },
        minecraftPlayersChannelId: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        modelName: "BotSetting",
        tableName: "bot_settings",
        timestamps: false,
      }
    );
  }
}

BotSetting.init(sequelize);

module.exports = BotSetting;
