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
figlet("KYTHIA", "Larry 3D 2", (err, data) => {
  if (err) return console.log("figlet error:", err);
  console.log(data);
});

/**
 * 🧠 command handler system
 * - membaca semua command berdasarkan folder kategori
 * - menyimpan ke collection client.commands
 */
const slashCommandsPath = path.join(__dirname, "commands");

client.commands = new Collection();
client.aliases = new Collection(); // ⬅️ penting, biar aliasnya ke-track

fs.readdirSync(slashCommandsPath).forEach((category) => {
  const commandFiles = fs
    .readdirSync(path.join(slashCommandsPath, category))
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(path.join(slashCommandsPath, category, file));
    if (!command || !command.data || typeof command.data.name !== "string") {
      console.warn(`⚠️ Command ${file} tidak valid atau gak punya .data`);
      continue;
    }

    client.commands.set(command.data.name, command);

    // 🏷️ ini harus di DALAM loop file, bukan di luar
    if (Array.isArray(command.aliases)) {
      for (const alias of command.aliases) {
        client.aliases.set(alias, command.data.name);
      }
    }
  }
});

/**
 * 📡 event handler system
 * - membaca semua file di folder events
 * - register event ke client secara dinamis
 */

function loadEventsRecursively(dir, client) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // ⬇️ recursive ke subfolder
      loadEventsRecursively(fullPath, client);
    } else if (file.isFile() && file.name.endsWith(".js")) {
      const event = require(fullPath);
      if (!event.name || typeof event.execute !== "function") {
        console.warn(`⚠️ Lewatkan ${fullPath}, tidak valid`);
        continue;
      }

      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }

      console.log(`📡 Event loaded: ${event.name} (${fullPath.replace(__dirname, "")})`);
    }
  }
}

// 👇 panggil di index utama
const eventsPath = path.join(__dirname, "events");
loadEventsRecursively(eventsPath, client);

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
    fs.readdirSync(slashCommandsPath).forEach((category) => {
      const commandFiles = fs.readdirSync(`${slashCommandsPath}/${category}`).filter((file) => file.endsWith(".js"));

      for (const file of commandFiles) {
        const command = require(`${slashCommandsPath}/${category}/${file}`);
        if (!command || !command.data || typeof command.data.toJSON !== "function") {
          console.warn(`⚠️ Command ${file} tidak valid atau gak punya .data`);
          continue;
        }

        commands.push(command.data.toJSON());
        console.log(`✅ command diload: ${command.data.name}`);
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
