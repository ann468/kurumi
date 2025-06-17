import axios from "axios";
import { convertToSticker } from "../../lib/sticker.js";

const handler = async (ann, m, { args }) => {
    if (!args.length)
        return m.reply("⚠️ Ketik teksnya dulu, contoh: .brat Hallo aku Kurumi.AI");

    const text = args.join(" ").trim();
    if (!text) return m.reply("⚠️ Teks kosong.");

    const apiUrl = `https://api.ownblox.my.id/api/brat?text=${encodeURIComponent(
        text
    )}`;
    try {
        const response = await axios.get(apiUrl, {
            responseType: "arraybuffer"
        });
        const buffer = Buffer.from(response.data);

        const sticker = await convertToSticker(buffer);
        if (!sticker || !Buffer.isBuffer(sticker)) {
            return m.reply("❌ Gagal convert ke stiker.");
        }

        await ann.sendMessage(m.chat, { sticker }, { quoted: m });
    } catch (e) {
        console.error("❌ Error di handler .brat:", e.message || e);
        m.reply("❌ Gagal generate stiker brat. Coba lagi nanti.");
    }
};

handler.command = ["brat", "sbrat", "stickerbrat"];
handler.help = ["brat <teks>"];
handler.tags = ["sticker"];
export default handler;
