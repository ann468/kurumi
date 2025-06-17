import fs from "fs";
import path from "path";

export const aliases = ["makecmd", "mkcmd"];
export const help = ["makecmd <nama>"];
export const tags = ["owner"];
export const category = "owner";

export async function handler(ann, m, { args }) {
    const nama = args[0];
    if (!nama)
        return m.reply("Format: *.makecmd <nama>*\nContoh: *.makecmd pingz*");

    const cmdPath = path.join(process.cwd(), "commands", `${nama}.js`);
    if (fs.existsSync(cmdPath)) return m.reply("⚠️ Command sudah ada.");

    const template = `
// commands/${nama}.js
export const aliases = ["${nama}"];
export const help = ["${nama} - deskripsi singkat"];
export const tags = ["tools"];
export const category = "utility";

export async function handler(ann, m, { args }) {
    await m.reply("✅ Ini respons default dari *${nama}*");
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.botAdmin = false;
`.trim();

    fs.writeFileSync(cmdPath, template);
    return m.reply(
        `✅ Sukses bikin command *${nama}*!\n> Cek: *commands/${nama}.js*`
    );
}

handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.botAdmin = false;
