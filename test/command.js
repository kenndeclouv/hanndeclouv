const fs = require("fs");
const path = require("path");

class MockInteraction {
  constructor({ commandName, subcommandName = null, optionsData = {} }) {
    this.commandName = commandName;
    this.optionsData = optionsData;
    this.guildId = "1314236534484112370";
    this.user = { id: "123456789012345678" };
    this.deferred = false;
    this.replied = false;

    // Enhanced mock options to handle all Discord option types
    this.options = {
      getSubcommand: () => subcommandName,
      getString: (name) => optionsData[name] || "dummy_string_" + Math.random().toString(36).slice(2),
      getInteger: (name) => optionsData[name] || Math.floor(Math.random() * 1000),
      getNumber: (name) => optionsData[name] || Math.random() * 1000,
      getBoolean: (name) => optionsData[name] || true,
      getUser: (name) =>
        optionsData[name] || {
          id: "1365429439332089998",
          username: "meiyiyiyun",
          bot: false,
          avatar: "https://cdn.discordapp.com/avatars/1365429439332089998/b94ad6c770ec3cb1966485e44dce25ab?size=1024",
        },
      getChannel: (name) =>
        optionsData[name] || {
          id: "1314236534484111375",
          name: "🏠┃general",
          type: 0,
          send: () => Promise.resolve(),
        },
      getRole: (name) =>
        optionsData[name] || {
          id: "1314579201759907865",
          name: "[👑] DECLOUV FAM",
          color: 0xffffff,
          permissions: "ADMINISTRATOR",
        },
      getAttachment: (name) =>
        optionsData[name] || {
          url: "https://dummy.img",
          proxyURL: "https://dummy-proxy.img",
          name: "dummy.png",
        },
      getMentionable: (name) => optionsData[name] || { id: "1314376223580881017", type: "mentionable" },
      getStringChoices: () => optionsData.choices || ["choice1", "choice2"],
    };
  }

  // Interaction methods
  isCommand() {
    return true;
  }

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

function generateDummyData(option) {
  // Generate more realistic dummy data based on option requirements
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

(async () => {
  console.log("🚀 Starting comprehensive command testing...\n");

  const commandsPath = path.join(__dirname, "../commands");

  // Fungsi rekursif untuk cari semua file .js
  const getCommandFiles = (dir) => {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    return files
      .flatMap((file) => {
        const res = path.resolve(dir, file.name);
        return file.isDirectory() ? getCommandFiles(res) : res;
      })
      .filter(
        (file) => file.endsWith(".js") && !file.includes("_") && !file.includes("test") // Skip file test
      );
  };

  const commandFiles = getCommandFiles(commandsPath);
  console.log(`🔍 Found ${commandFiles.length} command files:`);
  commandFiles.forEach((file) => console.log(`- ${path.relative(commandsPath, file)}`));

  let totalTests = 0;
  let successfulTests = 0;
  let failedTests = 0;

  for (const filePath of commandFiles) {
    const command = require(filePath);
    if (!command.data?.name || !command.execute) continue;

    const processCommand = async (commandData, parentCommand = null) => {
      const commandPath = parentCommand ? `${parentCommand.name} ${commandData.name}` : commandData.name;

      // Handle subcommand groups
      if (commandData.type === 2) {
        for (const subcommand of commandData.options || []) {
          await processCommand(subcommand, commandData);
        }
        return;
      }

      // Build options data
      const dummyOptions = {};
      for (const opt of commandData.options || []) {
        dummyOptions[opt.name] = generateDummyData(opt);

        // Handle choices if present
        if (opt.choices?.length) {
          dummyOptions[opt.name] = opt.choices[Math.floor(Math.random() * opt.choices.length)].value;
        }
      }

      // Create mock interaction
      const mock = new MockInteraction({
        commandName: parentCommand ? parentCommand.name : commandData.name,
        subcommandName: commandData.type === 1 ? commandData.name : null,
        optionsData: dummyOptions,
      });

      // Execute test
      try {
        totalTests++;
        console.log(`🧪 Testing /${commandPath}`);
        await command.execute(mock);

        if (!mock.deferred && !mock.replied) {
          throw new Error("Command did not reply or defer!");
        }

        successfulTests++;
        console.log(`✅ Success: /${commandPath}\n`);
      } catch (error) {
        failedTests++;
        console.error(`❌ FAILED: /${commandPath}`);
        console.error("Error:", error.stack || error, "\n");
      }
    };

    // Process main command and subcommands
    if (command.data.options?.length) {
      for (const option of command.data.options) {
        await processCommand(option, command.data);
      }
    } else {
      await processCommand(command.data);
    }
  }

  // Print final report
  console.log("📊 Test Summary:");
  console.log(`Total Commands Tested: ${commandFiles.length}`);
  console.log(`Total Tests Executed: ${totalTests}`);
  console.log(`Success: ${successfulTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log("\n🎉 All commands tested! 💻🔧");
})();
