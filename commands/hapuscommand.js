import fs from "fs";
import path from "path";

export const aliases = ["delcmd", "rmcmd"];
export const help = ["delcmd <nama>"];
export const tags = ["owner"];
export const category = "owner";

export async function handler(ann, m, { args }) {
    const nama = args[0];
    if (!nama)
        return m.reply("Format: *.delcmd <nama>*\nContoh: *.delcmd pingz*");

    const cmdPath = path.join(process.cwd(), "commands", `${nama}.js`);
    if (!fs.existsSync(cmdPath))
        return m.reply("⚠️ Command itu nggak ditemukan.");

    try {
        fs.unlinkSync(cmdPath);
        return m.reply(`✅ Command *${nama}* berhasil dihapus.`);
    } catch (err) {
        console.error(err);
        return m.reply("❌ Gagal menghapus command. Cek console.");
    }
}

handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.botAdmin = false;
