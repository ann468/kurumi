// commands/teraboxdl.js
import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type";

export const name = "teraboxdl";
export const aliases = ["tbdl"];
export const category = "downloader";
export const description = "Download dan kirim file dari link Terabox 📥";

export async function handler(ann, m, { args }) {
    const url = args[0];
    if (!url || !url.includes("1024terabox.com")) {
        return m.reply(
            "🚫 Masukin link Terabox yang valid!\n" +
                "Contoh: .tbdl https://1024terabox.com/s/1SNu9WpVJUBISUYbfDVUDKg"
        );
    }
    try {
        const api = `https://flowfalcon.dpdns.org/download/terabox?url=${encodeURIComponent(
            url
        )}`;
        const res = await fetch(api);
        const json = await res.json();
        if (!json.status || !json.result) {
            return m.reply("⚠️ Gagal ambil link dari API.");
        }
        const dlLink = json.result;
        const mediaRes = await fetch(dlLink);
        if (!mediaRes.ok)
            throw new Error(`Fetch file failed: ${mediaRes.status}`);
        const buffer = Buffer.from(await mediaRes.arrayBuffer());
        const type = await fileTypeFromBuffer(buffer);
        const mime = type?.mime || "application/octet-stream";
        const ext = type?.ext || "bin";
        await ann.sendMessage(
            m.chat,
            {
                document: buffer,
                mimetype: mime,
                fileName: `terabox_file.${ext}`,
                caption: "📦 Nih file dari Terabox udah dikirim langsung~"
            },
            { quoted: m }
        );
    } catch (err) {
        console.error("[teraboxdl.js]", err);
        await m.reply(
            "❌ Gagal download/kirim file. " +
                "Mungkin filenya terlalu besar, link rusak, atau ada masalah jaringan."
        );
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
