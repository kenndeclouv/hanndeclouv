// const fs = require("fs");
// const path = require("path");

// const commandsDir = path.join(__dirname, "../commands");
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

// const buildFullPath = (options = [], prefix = []) => {
//   const paths = [];

//   for (const opt of options) {
//     const currentPath = [...prefix, opt.name];

//     if (opt.options) {
//       const nestedPaths = buildFullPath(opt.options, currentPath);
//       paths.push(...nestedPaths);
//     } else {
//       paths.push({
//         path: currentPath,
//         option: opt
//       });
//     }
//   }

//   return paths;
// };

// const buildCommandUsage = (commandName, pathParts, options = []) => {
//   let usage = `/${commandName}`;

//   // Tambahkan group/subcommand path
//   for (const part of pathParts) {
//     usage += ` ${part}`;
//   }

//   // Tambahkan options
//   for (const opt of options) {
//     usage += ` [${opt.name}]`;
//   }

//   return usage;
// };

// const buildMarkdown = (commandJson) => {
//   let md = `### /${commandJson.name}\n\n`;
//   md += `**Deskripsi:** ${commandJson.description || "-"}\n\n`;

//   const allPaths = buildFullPath(commandJson.options || []);
//   const usageMap = new Map();

//   // Kelompokkan berdasarkan path unik
//   const pathGroups = new Map();
//   for (const { path, option } of allPaths) {
//     const key = path.join(':');

//     if (!pathGroups.has(key)) {
//       pathGroups.set(key, {
//         path,
//         options: []
//       });
//     }

//     pathGroups.get(key).options.push(option);
//   }

//   // Bangun usage untuk setiap path unik
//   md += `### Usage:\n`;
//   pathGroups.forEach((group) => {
//     const usage = buildCommandUsage(commandJson.name, group.path, group.options);
//     usageMap.set(usage, group.options);
//     md += `\`${usage}\`\n`;
//   });

//   // Bangun opsi untuk setiap path unik
//   if (allPaths.length > 0) {
//     md += `\n### Options:\n`;

//     pathGroups.forEach((group, key) => {
//       const scope = group.path.length > 0
//         ? ` (${group.path.join(' > ')})`
//         : '';

//       md += `#### Untuk perintah${scope}:\n`;

//       group.options.forEach((opt) => {
//         md += `- \`${opt.name}\`${opt.required ? " (required)" : ""} — ${opt.description || "-"}\n`;

//         if (opt.choices?.length > 0) {
//           md += `  - Pilihan: ${opt.choices.map(c => `\`${c.value}\``).join(", ")}\n`;
//         }

//         // Bangun contoh penggunaan yang akurat
//         const exampleValue = opt.choices?.[0]?.value || '[value]';
//         const exampleUsage = buildCommandUsage(
//           commandJson.name,
//           group.path,
//           [{ ...opt, name: `${opt.name}:${exampleValue}` }]
//         );

//         md += `  - **Contoh Penggunaan:** \`${exampleUsage}\`\n`;
//       });
//     });
//   }

//   md += `\n---\n\n`;
//   return md;
// };

// const allFiles = getAllCommandFiles(commandsDir);
// const docsMap = {};

// for (const { fullPath, relativePath } of allFiles) {
//   const command = require(fullPath);
//   if (!command.data?.toJSON) continue;

//   const json = command.data.toJSON();
//   const parts = relativePath.split(path.sep);
//   const folder = parts.length > 1 ? parts[0] : "root";

//   if (!docsMap[folder]) docsMap[folder] = [];
//   docsMap[folder].push(buildMarkdown(json));
// }

// fs.mkdirSync(docsDir, { recursive: true });

// Object.entries(docsMap).forEach(([folder, entries]) => {
//   const filePath = path.join(docsDir, `${folder}.md`);
//   const header = `## 📁 Command: ${folder}\n\n`;
//   const fullContent = header + entries.join("\n");
//   fs.writeFileSync(filePath, fullContent);
//   console.log(`✅ ${filePath} dibuat!`);
// });

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
      results = results.concat(getAllCommandFiles(fullPath, relativePath));
    } else if (file.endsWith(".js")) {
      results.push({ fullPath, relativePath });
    }
  });
  return results;
};

const buildCommandPath = (options = [], prefix = []) => {
  const paths = [];

  for (const opt of options) {
    const currentPath = [...prefix, opt.name];
    
    if (opt.options) {
      const nestedPaths = buildCommandPath(opt.options, currentPath);
      paths.push(...nestedPaths);
    } else {
      paths.push({
        path: currentPath,
        option: opt
      });
    }
  }

  return paths;
};

const buildCommandUsage = (commandName, pathParts, options = []) => {
  let usage = `/${commandName}`;
  
  // Add group/subcommand path
  for (const part of pathParts) {
    usage += ` ${part}`;
  }
  
  // Add options
  for (const opt of options) {
    usage += ` [${opt.name}]`;
  }
  
  return usage;
};

const buildMarkdown = (commandJson) => {
  let md = `### /${commandJson.name}\n\n`;
  md += `**Deskripsi:** ${commandJson.description || "-"}\n\n`;

  const allPaths = buildCommandPath(commandJson.options || []);
  const pathGroups = new Map();

  // Group by unique path
  for (const { path, option } of allPaths) {
    const key = path.join(':');
    if (!pathGroups.has(key)) {
      pathGroups.set(key, {
        path,
        options: []
      });
    }
    pathGroups.get(key).options.push(option);
  }

  // Build usage section
  md += `### Usage:\n`;
  pathGroups.forEach((group) => {
    const usage = buildCommandUsage(commandJson.name, group.path, group.options);
    md += `\`${usage}\`\n`;
  });

  // Build options section if any
  if (allPaths.length > 0) {
    md += `\n### Options:\n`;
    
    pathGroups.forEach((group) => {
      const scope = group.path.length > 0 
        ? ` (${group.path.join(' > ')})` 
        : '';
      
      md += `### Untuk perintah${scope}:\n`;
      
      group.options.forEach((opt) => {
        md += `- \`${opt.name}\`${opt.required ? " (required)" : ""} — ${opt.description || "-"}\n`;
        
        if (opt.choices?.length > 0) {
          md += `  - Pilihan: ${opt.choices.map(c => `\`${c.value}\``).join(", ")}\n`;
        }
        
        // Build accurate example
        const exampleValue = opt.choices?.[0]?.value || '[value]';
        const examplePath = group.path.length > 0 
          ? `${commandJson.name} ${group.path.join(' ')}` 
          : commandJson.name;
        
        md += `  - **Contoh Penggunaan:** \`/${examplePath} ${opt.name}:${exampleValue}\`\n`;
      });
    });
  }

  md += `\n---\n\n`;
  return md;
};

const allFiles = getAllCommandFiles(commandsDir);
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

fs.mkdirSync(docsDir, { recursive: true });

Object.entries(docsMap).forEach(([folder, entries]) => {
  const filePath = path.join(docsDir, `${folder}.md`);
  const header = `## 📁 Command: ${folder}\n\n`;
  const fullContent = header + entries.join("\n");
  fs.writeFileSync(filePath, fullContent);
  console.log(`📄 ${filePath} created!`);
});