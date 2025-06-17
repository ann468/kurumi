import fs from "fs";
import path from "path";
import url from "url";

export const name = "listplugins";
export const aliases = ["listplugin", "listcommand", "listcmd"];

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith(".js") || file.endsWith(".ts")) {
            arrayOfFiles.push(fullPath);
        }
    }

    return arrayOfFiles;
}

export async function handler(ann, m) {
    try {
        const commandsPath = path.resolve("./commands");
        const files = getAllFiles(commandsPath);

        if (!files.length)
            return m.thumbReply("📂 Tidak ada plugin ditemukan.", {
                title: "List Plugin Kosong!"
            });

        let result = `🧩 *List Plugin Detected:*\n\n`;

        for (let filePath of files) {
            const relativePath = path.relative(commandsPath, filePath).replace(/\\/g, "/");
            const fileName = path.basename(filePath, path.extname(filePath)); // nama file aja
            try {
                const plugin = await import(url.pathToFileURL(filePath));
                const aliases = plugin.aliases || [];
                const extraCmds = plugin.command || [];

                const allCommands = [fileName, ...aliases, ...extraCmds]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join(", ");

                result += `➤ ${relativePath}\n    ↳ Command: ${allCommands}\n`;
            } catch (e) {
                console.warn(`⚠️ Gagal import ${relativePath}:`, e);
                continue;
            }
        }

        await m.thumbReply(result.trim(), {
            title: `📜 Daftar Plugin (${files.length})`
        });
    } catch (e) {
        console.error("[ListPlugin Error]", e);
        await m.thumbReply("❌ Gagal menampilkan daftar plugin.", {
            title: "List Plugin Error!"
        });
    }
}

handler.private = false;
handler.onlyOwner = true;