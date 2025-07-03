
// const fs = require("fs");
// const path = require("path");
// const { ApplicationCommandOptionType } = require("discord.js");

// const slashCommandsDir = path.join(__dirname, "../commands");
// const docsDir = path.join(__dirname, "./");

// const getAllCommandFiles = (dir, base = "") => {
//   let results = [];
//   const list = fs.readdirSync(dir);
//   list.forEach((file) => {
//     const fullPath = path.join(dir, file);
//     const relativePath = path.join(base, file);
//     const stat = fs.statSync(fullPath);
//     if (stat.isDirectory()) {
//       results = results.concat(getAllCommandFiles(fullPath, relativePath));
//     } else if (file.endsWith(".js")) {
//       results.push({ fullPath, relativePath });
//     }
//   });
//   return results;
// };

// // Map Discord.js option types to human-readable names
// const OPTION_TYPE_MAP = {
//   [ApplicationCommandOptionType.Subcommand]: "Subcommand",
//   [ApplicationCommandOptionType.SubcommandGroup]: "Subcommand Group",
//   [ApplicationCommandOptionType.String]: "Text",
//   [ApplicationCommandOptionType.Integer]: "Number",
//   [ApplicationCommandOptionType.Boolean]: "True/False",
//   [ApplicationCommandOptionType.User]: "User",
//   [ApplicationCommandOptionType.Channel]: "Channel",
//   [ApplicationCommandOptionType.Role]: "Role",
//   [ApplicationCommandOptionType.Mentionable]: "Mentionable",
//   [ApplicationCommandOptionType.Number]: "Decimal",
//   [ApplicationCommandOptionType.Attachment]: "File",
// };

// // Build command structure recursively
// const buildCommandStructure = (options = []) => {
//   return options.map(option => {
//     const base = {
//       name: option.name,
//       description: option.description,
//       type: OPTION_TYPE_MAP[option.type] || "Unknown",
//       required: option.required || false,
//     };

//     if (option.choices?.length) {
//       base.choices = option.choices.map(c => ({ name: c.name, value: c.value }));
//     }

//     if (option.options?.length) {
//       base.options = buildCommandStructure(option.options);
//     }

//     return base;
//   });
// };

// // Generate accurate usage examples
// const generateUsageExamples = (commandName, structure) => {
//   const examples = [];

//   const buildExample = (parts, current) => {
//     const namePart = current.name;
//     const valuePlaceholder = current.choices?.length
//       ? current.choices[0].value
//       : current.type === "Boolean"
//         ? "true"
//         : current.type === "File"
//           ? "file.json"
//           : `[${current.name}]`;

//     parts.push(`${namePart}:${valuePlaceholder}`);

//     if (current.options) {
//       current.options.forEach(sub => buildExample([...parts], sub));
//     } else {
//       examples.push(`/${commandName} ${parts.join(" ")}`);
//     }
//   };

//   structure.forEach(option => {
//     if (option.type === "Subcommand") {
//       const parts = [option.name];

//       if (option.options) {
//         option.options.forEach(opt => {
//           buildExample([...parts], opt);
//         });
//       } else {
//         examples.push(`/${commandName} ${option.name}`);
//       }
//     } else if (option.type === "Subcommand Group") {
//       option.options.forEach(subCmd => {
//         const groupParts = [option.name, subCmd.name];

//         if (subCmd.options) {
//           subCmd.options.forEach(opt => {
//             buildExample([...groupParts], opt);
//           });
//         } else {
//           examples.push(`/${commandName} ${groupParts.join(" ")}`);
//         }
//       });
//     }
//   });

//   return examples;
// };

// // Build markdown documentation
// const buildMarkdown = (commandJson) => {
//   let md = `### /${commandJson.name}\n\n`;
//   md += `**Description:** ${commandJson.description || "-"}\n\n`;

//   // Build command structure
//   const structure = buildCommandStructure(commandJson.options || []);

//   // Generate accurate usage examples
//   const examples = generateUsageExamples(commandJson.name, structure);

//   if (examples.length > 0) {
//     md += `### Usage Examples:\n`;
//     examples.forEach(example => {
//       md += `- \`${example}\`\n`;
//     });
//     md += "\n";
//   }

//   // Build detailed command structure
//   if (structure.length > 0) {
//     md += `### Command Structure:\n`;

//     const renderOptions = (options, depth = 0) => {
//       let content = "";
//       const indent = "  ".repeat(depth);

//       options.forEach(opt => {
//         content += `${indent}- **${opt.name}** (${opt.type})${opt.required ? " [Required]" : ""}\n`;
//         content += `${indent}  - ${opt.description || "No description"}\n`;

//         if (opt.choices?.length) {
//           content += `${indent}  - Choices: ${opt.choices.map(c => `\`${c.value}\``).join(", ")}\n`;
//         }

//         if (opt.options?.length) {
//           content += `${indent}  - Sub-options:\n`;
//           content += renderOptions(opt.options, depth + 2);
//         }
//       });

//       return content;
//     };

//     md += renderOptions(structure);
//   }

//   md += `\n---\n\n`;
//   return md;
// };

// // Main execution
// const allFiles = getAllCommandFiles(slashCommandsDir);
// const docsMap = {};

// for (const { fullPath, relativePath } of allFiles) {
//   delete require.cache[require.resolve(fullPath)];
//   const command = require(fullPath);

//   if (!command.data?.toJSON) {
//     console.log(`⏩ Skipping ${relativePath} - not a valid command`);
//     continue;
//   }

//   try {
//     const json = command.data.toJSON();
//     const parts = relativePath.split(path.sep);
//     const folder = parts.length > 1 ? parts[0] : "root";

//     if (!docsMap[folder]) docsMap[folder] = [];
//     docsMap[folder].push(buildMarkdown(json));
//     console.log(`✅ Processed ${relativePath}`);
//   } catch (error) {
//     console.error(`❌ Error processing ${relativePath}:`, error.message);
//   }
// }

// // Ensure docs directory exists
// fs.mkdirSync(docsDir, { recursive: true });

// // Write documentation files
// Object.entries(docsMap).forEach(([folder, entries]) => {
//   const filePath = path.join(docsDir, `${folder}.md`);
//   const header = `## 📁 Command Category: ${folder}\n\n`;
//   const fullContent = header + entries.join("\n");
//   fs.writeFileSync(filePath, fullContent);
//   console.log(`📄 Documentation created: ${filePath}`);
// });
const fs = require("fs");
const path = require("path");
const { ApplicationCommandOptionType } = require("discord.js");

const slashCommandsDir = path.join(__dirname, "../commands");
const docsDir = path.join(__dirname, "./");

const getAllCommandFiles = (dir, base = "") => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(base, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllCommandFiles(fullPath, relativePath));
    } else if (file.endsWith(".js")) {
      results.push({ fullPath, relativePath });
    }
  });
  return results;
};

// Map Discord.js option types to human-readable names
const OPTION_TYPE_MAP = {
  [ApplicationCommandOptionType.Subcommand]: "Subcommand",
  [ApplicationCommandOptionType.SubcommandGroup]: "Subcommand Group",
  [ApplicationCommandOptionType.String]: "Text",
  [ApplicationCommandOptionType.Integer]: "Number",
  [ApplicationCommandOptionType.Boolean]: "True/False",
  [ApplicationCommandOptionType.User]: "User",
  [ApplicationCommandOptionType.Channel]: "Channel",
  [ApplicationCommandOptionType.Role]: "Role",
  [ApplicationCommandOptionType.Mentionable]: "Mentionable",
  [ApplicationCommandOptionType.Number]: "Decimal",
  [ApplicationCommandOptionType.Attachment]: "File",
};

// Generate accurate usage examples for subcommands
const generateSubcommandExample = (commandName, subcommand, group = null) => {
  const pathParts = [commandName];
  if (group) pathParts.push(group);
  pathParts.push(subcommand.name);

  const exampleParts = [];

  (subcommand.options || []).forEach(opt => {
    let exampleValue = `[${opt.name}]`;

    if (opt.choices?.length) {
      exampleValue = opt.choices[0].value;
    } else if (opt.type === ApplicationCommandOptionType.Boolean) {
      exampleValue = "true";
    } else if (opt.type === ApplicationCommandOptionType.Attachment) {
      exampleValue = "file.png";
    } else if (opt.type === ApplicationCommandOptionType.Number) {
      exampleValue = "99.99";
    } else if (opt.type === ApplicationCommandOptionType.Integer) {
      exampleValue = "100";
    } else if (opt.type === ApplicationCommandOptionType.User) {
      exampleValue = "@user";
    } else if (opt.type === ApplicationCommandOptionType.Channel) {
      exampleValue = "#channel";
    } else if (opt.type === ApplicationCommandOptionType.Role) {
      exampleValue = "@role";
    }

    exampleParts.push(`${opt.name}:${exampleValue}`);
  });

  const example = `/${pathParts.join(" ")}${exampleParts.length > 0 ? " " : ""}${exampleParts.join(" ")}`;
  return example;
};

// Build markdown documentation
const buildMarkdown = (commandJson) => {
  let md = `### /${commandJson.name}\n\n`;
  md += `**Description:** ${commandJson.description || "-"}\n\n`;

  // Process subcommands and groups
  const subcommands = [];

  (commandJson.options || []).forEach(option => {
    if (option.type === ApplicationCommandOptionType.Subcommand) {
      subcommands.push({
        group: null,
        ...option
      });
    } else if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
      (option.options || []).forEach(subCmd => {
        if (subCmd.type === ApplicationCommandOptionType.Subcommand) {
          subcommands.push({
            group: option.name,
            ...subCmd
          });
        }
      });
    }
  });

  // Generate usage examples
  if (subcommands.length > 0) {
    md += `### Usage:\n`;

    const uniqueExamples = new Set();

    subcommands.forEach(subcommand => {
      const example = generateSubcommandExample(
        commandJson.name,
        subcommand,
        subcommand.group
      );

      // Avoid duplicates
      if (!uniqueExamples.has(example)) {
        uniqueExamples.add(example);
        md += `- \`${example}\`\n`;
      }
    });

    md += "\n";
  }

  // Add command options details
  if (subcommands.length > 0) {
    md += `### Options:\n`;

    subcommands.forEach(subcommand => {
      const fullPath = subcommand.group
        ? `${subcommand.group} ${subcommand.name}`
        : subcommand.name;

      md += `### For \`${fullPath}\`:\n`;
      md += `${subcommand.description || "No description"}\n`;

      if (subcommand.options?.length > 0) {
        subcommand.options.forEach(opt => {
          md += `- \`${opt.name}\` (${OPTION_TYPE_MAP[opt.type] || "Option"})`;

          if (opt.required) {
            md += ` **[Required]**`;
          }

          if (opt.autocomplete) {
            md += ` *(autocomplete)*`;
          }

          md += `\n`;
          md += `  - ${opt.description || "No description"}\n`;

          if (opt.choices?.length) {
            md += `  - Choices: ${opt.choices.map(c => `\`${c.value}\``).join(", ")}\n`;
          }
        });
      } else {
        md += `*No options*\n`;
      }

      md += "\n";
    });
  }

  md += `\n---\n\n`;
  return md;
};

// Main execution
const allFiles = getAllCommandFiles(slashCommandsDir);
const docsMap = {};

for (const { fullPath, relativePath } of allFiles) {
  delete require.cache[require.resolve(fullPath)];
  const command = require(fullPath);

  if (!command.data?.toJSON) {
    console.log(`⏩ Skipping ${relativePath} - not a valid command`);
    continue;
  }

  try {
    const json = command.data.toJSON();
    const parts = relativePath.split(path.sep);
    const folder = parts.length > 1 ? parts[0] : "root";

    if (!docsMap[folder]) docsMap[folder] = [];
    docsMap[folder].push(buildMarkdown(json));
    console.log(`✅ Processed ${relativePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${relativePath}:`, error.message);
  }
}

// Ensure docs directory exists
fs.mkdirSync(docsDir, { recursive: true });

// Write documentation files
Object.entries(docsMap).forEach(([folder, entries]) => {
  const filePath = path.join(docsDir, `${folder}.md`);
  const header = `## 📁 Command Category: ${folder}\n\n`;
  const fullContent = header + entries.join("\n");
  fs.writeFileSync(filePath, fullContent);
  console.log(`📄 Documentation created: ${filePath}`);
});