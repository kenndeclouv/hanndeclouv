/**
 * dokumentasi kode utama bot discord
 * file: index.js (entry point bot)
 * copyright © 2025 kenndeclouv
 * dibuat oleh: chaadeclouv
 *
 * ini adalah file utama pemrosesan bot discord berbasis discord.js v14,
 * dilengkapi handler modular untuk command, event, automod, dan startup system.
 * bot juga tersambung dengan database (mysql) menggunakan sequelize.
 */

/**
 * 🔧 import module & komponen internal
 */
const { Collection, REST, Routes } = require("discord.js");
const sequelize = require("./database/sequelize");
const system = require("./system");
const client = require("./client");
const figlet = require("figlet");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

/**
 * 🎉 tampilan figlet greeting saat bot run
 */
figlet("KENNDECLOUV's BOT", "Larry 3D 2", (err, data) => {
  if (err) return console.log("figlet error:", err);
  console.log(data);
});

/**
 * 🧠 command handler system
 * - membaca semua command berdasarkan folder kategori
 * - menyimpan ke collection client.commands
 */
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
fs.readdirSync(commandsPath).forEach((category) => {
  const commandFiles = fs.readdirSync(path.join(commandsPath, category)).filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, category, file));
    client.commands.set(command.data.name, command);
  }
});

/**
 * 📡 event handler system
 * - membaca semua file di folder events
 * - register event ke client secara dinamis
 */
const eventsPath = path.join(__dirname, "events");
fs.readdirSync(eventsPath).forEach((file) => {
  const event = require(`${eventsPath}/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

/**
 * 🛡️ sistem auto moderation & message listener
 */
client.on("messageCreate", system);

/**
 * 💾 koneksi dan sinkronisasi database
 */
sequelize.sync().then(() => {
  console.log("Database & table telah dibuat!");
});

/**
 * 🧠 fungsi deploy slash command ke discord
 */
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
const deployCommands = async () => {
  try {
    console.log("🌀 Memulai refresh perintah aplikasi (/)");
    const commands = [];
    fs.readdirSync(commandsPath).forEach((category) => {
      const commandFiles = fs.readdirSync(`${commandsPath}/${category}`).filter((file) => file.endsWith(".js"));
      for (const file of commandFiles) {
        const command = require(`${commandsPath}/${category}/${file}`);
        commands.push(command.data.toJSON());
        console.log(`command yang diload: ${command.data.name}`);
      }
    });
    await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID), { body: commands });
    console.log("✅ Berhasil refresh perintah aplikasi (/)");
  } catch (error) {
    console.error("❌ Gagal refresh perintah aplikasi (/):", error);
  }
};

/**
 * ✅ proses saat bot sudah ready
 */
client.once("ready", async () => {
  await deployCommands();
});

/**
 * 🔐 login bot
 */
client.login(process.env.DISCORD_BOT_TOKEN);
