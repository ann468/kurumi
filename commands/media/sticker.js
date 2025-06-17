export const aliases = ["s", "stiker"];
import { convertToSticker } from "../../lib/sticker.js";

export async function handler(ann, m) {
    await m.react("⏱️");

    const msg = m.quoted || m;
    const mime = Object.keys(msg.message || {})[0];

    if (!/image|video/.test(mime)) {
        await m.react("❎");
        return m.reply("⚠️ Kirim atau reply gambar/video dulu.");
    }

    try {
        const media = await ann.downloadMediaMessage(msg);
        if (!media || !Buffer.isBuffer(media)) {
            await m.react("❎");
            return m.reply("❌ Gagal download media.");
        }

        const sticker = await convertToSticker(media);
        if (!sticker || !Buffer.isBuffer(sticker)) {
            await m.react("❎");
            return m.reply("❌ Gagal convert ke stiker.");
        }

        await ann.sendMessage(m.chat, { sticker }, { quoted: m });
        await m.react("✅");
    } catch (e) {
        await m.react("❎");
        console.error("❌ Error di handler .sticker:", e);
        m.reply("❌ Gagal bikin stiker. Coba lagi nanti.");
    }
}