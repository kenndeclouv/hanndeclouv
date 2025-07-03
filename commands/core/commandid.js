const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("command-id")
    .setDescription("cari ID dari command dan generate command mention-nya 😋")
    .addStringOption((opt) => opt.setName("name").setDescription("nama command yang mau dicari").setRequired(true)),
  adminOnly: true,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      // Pastikan cuma owner yang bisa restart
      if (interaction.user.id !== process.env.OWNER_ID) {
        return interaction.editReply({ content: "❌ kamuu bukan ownerkuu wlee!", ephemeral: true });
      }
      const input = interaction.options.getString("name");
      const parts = input.trim().split(/\s+/); // pisah dari string ke array: ['set', 'view', dst]
      const commandName = parts[0];

      await interaction.client.application.commands.fetch();
      const cmd = interaction.client.application.commands.cache.find((c) => c.name === commandName);

      if (!cmd) {
        return interaction.editReply({
          content: `❌ command \`${commandName}\` gak ketemu 😭`,
          ephemeral: true,
        });
      }

      const mention = `</${parts.join(" ")}:${cmd.id}>`;

      return interaction.editReply({
        content: `✅ ketemu!\n\n📎 ID: \`${cmd.id}\`\n💬 Mention: ${mention}`,
        ephemeral: true,
      });
    } catch (error) {}
  },
};
