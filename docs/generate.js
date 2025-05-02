const fs = require("fs");
const path = require("path");

const commandsDir = path.join(__dirname, "../commands");
const docsDir = path.join(__dirname, "./");

const getAllCommandFiles = (dir, base = "") => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(base, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getAllCommandFiles(fullPath, path.join(base, file)));
    } else if (file.endsWith(".js")) {
      results.push({ fullPath, relativePath });
    }
  });
  return results;
};

const extractOptions = (options = [], prefix = []) => {
  const result = [];

  for (const opt of options) {
    if (opt.type === 1 || opt.type === 2) {
      // subcommand atau subcommand group
      const subPrefix = [...prefix, opt.name];
      const nested = extractOptions(opt.options || [], subPrefix);
      result.push({
        type: opt.type,
        name: opt.name,
        description: opt.description,
        options: nested.map((n) => n.options).flat(),
        fullPath: subPrefix,
      });
    } else {
      result.push({
        type: opt.type,
        name: opt.name,
        description: opt.description,
        required: opt.required,
        choices: opt.choices || [],
        options: [{ ...opt }],
        fullPath: prefix,
      });
    }
  }

  return result;
};

const buildMarkdown = (commandJson) => {
  let md = `## /${commandJson.name}\n\n`;
  md += `**Deskripsi:** ${commandJson.description || "-"}\n\n`;

  const allParsed = extractOptions(commandJson.options || []);

  const uniqueUsages = new Map();

  md += `### Usage:\n`;
  if (allParsed.length === 0) {
    md += `\`/${commandJson.name}\`\n`;
  } else {
    allParsed.forEach((item) => {
      const usage = `/${commandJson.name}${item.fullPath.map((p) => ` ${p}`).join("")}${item.options.map((o) => ` [${o.name}]`).join("")}`;
      uniqueUsages.set(usage, true);
    });
    [...uniqueUsages.keys()].forEach((u) => {
      md += `\`${u}\`\n`;
    });
  }

  if (allParsed.length > 0) {
    md += `\n### Options:\n`;
    allParsed.forEach((item) => {
      item.options.forEach((opt) => {
        md += `- \`${opt.name}\`${opt.required ? " (required)" : ""} — ${opt.description || "-"}\n`;
        if (opt.choices?.length > 0) {
          md += `  - Pilihan: ${opt.choices.map((c) => `\`${c.name}\``).join(", ")}\n`;
        }
        // Contoh penggunaan
        if (opt.choices?.length > 0) {
          md += `  - **Contoh Penggunaan:** \`/${commandJson.name} ${opt.name}:${opt.choices[0].name}\`\n`;
        } else {
          md += `  - **Contoh Penggunaan:** \`/${commandJson.name} ${opt.name}:[value]\`\n`;
        }
      });
    });
  }

  md += `\n---\n\n`;
  return md;
};

const allFiles = getAllCommandFiles(commandsDir);
const docsMap = {};

for (const { fullPath, relativePath } of allFiles) {
  const command = require(fullPath);
  if (!command.data?.toJSON) continue;

  const json = command.data.toJSON();
  const parts = relativePath.split(path.sep);
  const folder = parts.length > 1 ? parts[0] : "root";

  if (!docsMap[folder]) docsMap[folder] = [];
  docsMap[folder].push(buildMarkdown(json));
}

fs.mkdirSync(docsDir, { recursive: true });

Object.entries(docsMap).forEach(([folder, entries]) => {
  const filePath = path.join(docsDir, `${folder}.md`);
  const header = `# 📁 Command: ${folder}\n\n`;
  const fullContent = header + entries.join("\n");
  fs.writeFileSync(filePath, fullContent);
  console.log(`✅ ${filePath} dibuat!`);
});
// const fs = require("fs");
// const path = require("path");

// const commandsDir = path.join(__dirname, "commands");
// const docsDir = path.join(__dirname, "docs");

// const getAllCommandFiles = (dir, base = "") => {
//   let results = [];
//   const list = fs.readdirSync(dir);
//   list.forEach((file) => {
//     const fullPath = path.join(dir, file);
//     const relativePath = path.join(base, file);
//     const stat = fs.statSync(fullPath);
//     if (stat.isDirectory()) {
//       results = results.concat(getAllCommandFiles(fullPath, path.join(base, file)));
//     } else if (file.endsWith(".js")) {
//       results.push({ fullPath, relativePath });
//     }
//   });
//   return results;
// };

// const buildMarkdown = (commandJson) => {
//   let md = `## /${commandJson.name}\n\n`;
//   md += `**Deskripsi:** ${commandJson.description || "-"}\n\n`;

//   const subcommands = commandJson.options?.filter((opt) => opt.type === 1); // SUBCOMMAND

//   if (subcommands?.length > 0) {
//     md += `### Subcommands:\n`;
//     subcommands.forEach((s) => {
//       md += `- \`${s.name}\` - ${s.description}\n`;
//     });
//     md += `\n`;

//     md += `### Usage:\n`;
//     subcommands.forEach((s) => {
//       let usage = `/${commandJson.name} ${s.name}`;
//       if (s.options?.length > 0) {
//         s.options.forEach((arg) => {
//           usage += ` [${arg.name}]`;
//         });
//       }
//       md += `\`${usage}\`\n`;
//     });
//   } else {
//     // command biasa
//     md += `### Usage:\n`;
//     let usage = `/${commandJson.name}`;
//     if (commandJson.options?.length > 0) {
//       commandJson.options.forEach((opt) => {
//         usage += ` [${opt.name}]`;
//       });
//     }
//     md += `\`${usage}\`\n`;
//   }

//   // tampilkan detail options dengan contoh
//   const allOptions = subcommands?.flatMap((s) => s.options || []) ?? commandJson.options ?? [];
//   if (allOptions.length > 0) {
//     md += `\n### Options:\n`;
//     allOptions.forEach((opt) => {
//       md += `- \`${opt.name}\`${opt.required ? " (required)" : ""} — ${opt.description || "-"}\n`;
//       if (opt.choices?.length > 0) {
//         md += `  - Pilihan: ${opt.choices.map((c) => `\`${c.name}\``).join(", ")}\n`;
//       }
//       // Contoh penggunaan
//       if (opt.choices?.length > 0) {
//         md += `  - **Contoh Penggunaan:** \`/${commandJson.name} ${opt.name} ${opt.choices[0].name}\`\n`;
//       } else {
//         md += `  - **Contoh Penggunaan:** \`/${commandJson.name} ${opt.name} [value]\`\n`;
//       }
//     });
//   }

//   md += `\n---\n\n`;
//   return md;
// };

// const allFiles = getAllCommandFiles(commandsDir);

// const docsMap = {}; // key = subfolder, value = list of markdowns

// for (const { fullPath, relativePath } of allFiles) {
//   const command = require(fullPath);
//   if (!command.data?.toJSON) continue;

//   const json = command.data.toJSON();
//   const parts = relativePath.split(path.sep); // split by subfolder

//   const folder = parts.length > 1 ? parts[0] : "root";

//   if (!docsMap[folder]) docsMap[folder] = [];
//   docsMap[folder].push(buildMarkdown(json));
// }

// // buat per file .md sesuai folder
// fs.mkdirSync(docsDir, { recursive: true });

// Object.entries(docsMap).forEach(([folder, entries]) => {
//   const filePath = path.join(docsDir, `${folder}.md`);
//   const header = `# 📁 Command: ${folder}\n\n`;
//   const fullContent = header + entries.join("\n");
//   fs.writeFileSync(filePath, fullContent);
//   console.log(`✅ ${filePath} dibuat!`);
// });
