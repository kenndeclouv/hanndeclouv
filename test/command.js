const fs = require("fs");
const path = require("path");

/**
 * Mensimulasikan objek interaksi Discord untuk pengujian.
 * @class
 */
class MockInteraction {
  constructor({ commandName, subcommandName = null, optionsData = {}, mode = "guild" }) { // mode = guild|dm
    this.commandName = commandName;
    this.optionsData = optionsData;
    this.guildId = mode === "guild" ? "1314236534484112370" : null;
    this.guild = mode === "guild"
      ? { id: "1314236534484112370", name: "kenndeclouv test server" }
      : null;
    this.channel = {
      id: "1314236534484111375",
      name: "🏠┃general",
      send: (msg) => {
        console.log(`💬 [channel.send]`, msg);
        return Promise.resolve({ id: "mock-msg-id" });
      },
      sendTyping: () => console.log("⌨️ [channel.sendTyping]"),
    };
    this.user = { id: "1158654757183959091", username: "kenndeclouv" };
    this.deferred = false;
    this.replied = false;

    // Mock options yang disempurnakan untuk menangani semua jenis opsi Discord
    this.options = {
      getSubcommand: () => subcommandName,
      getString: (name) => name in optionsData ? optionsData[name] : "dummy_string_" + Math.random().toString(36).slice(2),
      getInteger: (name) => name in optionsData ? optionsData[name] : Math.floor(Math.random() * 1000),
      getNumber: (name) => name in optionsData ? optionsData[name] : Math.random() * 1000,
      getBoolean: (name) => name in optionsData ? optionsData[name] : true,
      getUser: (name) => name in optionsData ? optionsData[name] : {
        id: "1365429439332089998",
        username: "meiyiyiyun",
        bot: false,
        avatar: "https://cdn.discordapp.com/avatars/1365429439332089998/b94ad6c770ec3cb1966485e44dce25ab?size=1024",
      },
      getChannel: (name) => name in optionsData ? optionsData[name] : {
        id: "1314236534484111375",
        name: "🏠┃general",
        type: 0,
        send: () => Promise.resolve(),
      },
      getRole: (name) => name in optionsData ? optionsData[name] : {
        id: "1314579201759907865",
        name: "[👑] DECLOUV FAM",
        color: 0xffffff,
        permissions: "ADMINISTRATOR",
      },
      getAttachment: (name) => name in optionsData ? optionsData[name] : {
        url: "https://dummy.img",
        proxyURL: "https://dummy-proxy.img",
        name: "dummy.png",
      },
      getMentionable: (name) => name in optionsData ? optionsData[name] : { id: "1314376223580881017", type: "mentionable" },
    };
  }

  isCommand() { return true; }

  deferReply(options) {
    this.deferred = true;
    console.log("⏳ Deferring reply...");
    return Promise.resolve();
  }

  reply(response) {
    this.replied = true;
    this._logResponse("✅ Reply", response);
    return Promise.resolve();
  }

  editReply(response) {
    if (!this.deferred) throw new Error("Cannot edit without deferring first!");
    this._logResponse("✏️ Edit Reply", response);
    return Promise.resolve();
  }

  followUp(response) {
    this._logResponse("📩 Follow Up", response);
    return Promise.resolve();
  }

  _logResponse(type, response) {
    const content = typeof response === "string" ? response : response?.content;
    const components = response?.components ? ` [components: ${response.components.length}]` : "";
    const embeds = response?.embeds ? ` [embeds: ${response.embeds.length}]` : "";
    console.log(`${type}: ${content || ""}${components}${embeds}`);
  }
}

/**
 * Menghasilkan data dummy berdasarkan tipe opsi perintah.
 * @param {object} option - Objek opsi perintah.
 * @returns {*} Data dummy yang sesuai.
 */
function generateDummyData(option) {
  const generate = {
    3: () => `dummy_${option.name}_${Math.random().toString(36).slice(2)}`, // STRING
    4: () => Math.floor(Math.random() * 1000), // INTEGER
    5: () => Math.random() > 0.5, // BOOLEAN
    6: () => ({ id: "usr_" + Math.random().toString(36).slice(2), username: "dummy_user" }), // USER
    7: () => ({ id: "chn_" + Math.random().toString(36).slice(2), name: "dummy_channel" }), // CHANNEL
    8: () => ({ id: "rol_" + Math.random().toString(36).slice(2), name: "dummy_role" }), // ROLE
    10: () => Math.random() * 1000, // NUMBER
    11: () => ({ url: `https://dummy.com/${Date.now()}.png` }), // ATTACHMENT
  };
  return generate[option.type] ? generate[option.type]() : null;
}

/**
 * Fungsi utama untuk menjalankan semua tes perintah.
 */
(async () => {
  console.log("🚀 Memulai pengujian perintah secara komprehensif...\n");

  const slashCommandsPath = path.join(__dirname, "../commands");

  // Fungsi rekursif untuk mencari semua file .js
  const getCommandFiles = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    return files
      .flatMap((file) => {
        const res = path.resolve(dir, file.name);
        return file.isDirectory() ? getCommandFiles(res) : res;
      })
      .filter(
        (file) => file.endsWith(".js") && !file.includes("_") && !file.includes("test")
      );
  };

  const commandFiles = getCommandFiles(slashCommandsPath);
  console.log(`🔍 Ditemukan ${commandFiles.length} file perintah:`);
  commandFiles.forEach((file) => console.log(`- ${path.relative(slashCommandsPath, file)}`));
  console.log("\n" + "-".repeat(30) + "\n");

  let totalTests = 0;
  let successfulTests = 0;
  let failedTests = 0;

  for (const filePath of commandFiles) {
    const command = require(filePath);
    if (!command.data?.name || !command.execute) continue;

    // ======================= FIX UTAMA =======================
    // 1. Konversi builder ke objek JSON. Ini memperbaiki masalah `.choices`.
    const commandJSON = typeof command.data.toJSON === 'function' ? command.data.toJSON() : command.data;
    // =========================================================

    /**
     * Memproses dan menguji satu unit perintah (bisa perintah utama, grup, atau subcommand).
     * @param {object} commandToTest - Objek perintah/subcommand yang akan diuji.
     * @param {object|null} parentCommand - Parent dari commandToTest (misalnya, grup untuk subcommand).
     */
    const processCommand = async (commandToTest, parentCommand = null) => {
      const commandPath = parentCommand ? `${parentCommand.name} ${commandToTest.name}` : commandToTest.name;

      // Jika ini adalah grup subcommand, lakukan rekursi ke dalam setiap subcommand-nya.
      if (commandToTest.type === 2) { // 2 = SUB_COMMAND_GROUP
        for (const subcommand of commandToTest.options || []) {
          await processCommand(subcommand, commandToTest);
        }
        return;
      }

      // Pada titik ini, commandToTest adalah perintah utama atau subcommand tunggal.
      // Keduanya dapat memiliki opsi yang perlu diisi data dummy.
      const dummyOptions = {};
      // Opsi untuk diproses adalah milik commandToTest.
      const optionsToProcess = commandToTest.options || [];

      for (const opt of optionsToProcess) {
        // Lewati jika opsi adalah subcommand/grup karena sudah ditangani di atas.
        if (opt.type === 1 || opt.type === 2) continue;

        if (opt.choices?.length > 0) {
          // ✅ INI SEKARANG BERFUNGSI: Pilih dari choices yang tersedia.
          const selected = opt.choices[Math.floor(Math.random() * opt.choices.length)];
          dummyOptions[opt.name] = selected.value;
        } else {
          // Generate data dummy jika tidak ada choices.
          dummyOptions[opt.name] = generateDummyData(opt);
        }
      }

      // Tentukan nama perintah dan subcommand untuk MockInteraction.
      const rootCommandName = commandJSON.name; // Selalu gunakan nama dari file perintah utama.
      let subcommandName = null;
      if (parentCommand) {
        // Jika ada parent, berarti commandToTest adalah subcommand.
        subcommandName = commandToTest.name;
      }

      const mock = new MockInteraction({
        commandName: rootCommandName,
        subcommandName: subcommandName,
        optionsData: dummyOptions,
      });

      // Jalankan tes
      try {
        totalTests++;
        console.log(`🧪 Menguji /${commandPath}`);
        await command.execute(mock);

        if (!mock.deferred && !mock.replied) {
          throw new Error("Perintah tidak membalas atau menunda (defer)!");
        }

        successfulTests++;
        console.log(`✅ Sukses: /${commandPath}\n`);
      } catch (error) {
        failedTests++;
        console.error(`❌ GAGAL: /${commandPath}`);
        console.error("Error:", error.stack || error, "\n");
      }
    };

    // ======================= FIX UTAMA =======================
    // 2. Logika yang lebih baik untuk membedakan perintah dengan subcommand vs. opsi biasa.
    const hasSubcommands = commandJSON.options?.some(opt => opt.type === 1 || opt.type === 2);

    if (hasSubcommands) {
      // Jika ada subcommand/grup, proses setiap opsi level atas satu per satu.
      for (const option of commandJSON.options) {
        await processCommand(option, commandJSON);
      }
    } else {
      // Jika hanya perintah sederhana (dengan atau tanpa opsi), proses perintah itu sendiri.
      await processCommand(commandJSON);
    }
    // =========================================================
  }

  // Cetak laporan akhir
  console.log("\n" + "=".repeat(40));
  console.log("📊 Ringkasan Tes:");
  console.log(`Total Perintah Diuji: ${commandFiles.length}`);
  console.log(`Total Tes Dieksekusi: ${totalTests}`);
  console.log(`✅ Sukses: ${successfulTests}`);
  console.log(`❌ Gagal: ${failedTests}`);
  console.log("=".repeat(40) + "\n");
  console.log("🎉 Semua perintah telah diuji! 💻🔧");
})();
