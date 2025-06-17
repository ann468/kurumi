// randomimg.js
import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type";

export const aliases = ["waifupict"];

export async function handler(ann, m) {
    await m.react("⏱️");
    const rawURL =
        "https://raw.githubusercontent.com/ann468/Kurumi.AI/main/sfw.txt";
    try {
        const res = await fetch(rawURL);
        if (!res.ok) throw new Error(`Gagal fetch list: ${res.status}`);
        const text = await res.text();
        const links = text
            .split("\n")
            .map(x => x.trim())
            .filter(Boolean);
        if (!links.length) throw new Error("List kosong!");
        const randomLink = links[Math.floor(Math.random() * links.length)];
        const imgRes = await fetch(randomLink);
        const buffer = await imgRes.buffer();
        const type = await fileTypeFromBuffer(buffer);
        if (!type || !type.mime.startsWith("image")) {
            throw new Error("Bukan file gambar valid.");
        }
        await ann.sendMessage(
            m.chat,
            {
                image: buffer,
                mimetype: type.mime,
                caption: "🎴 Nih gambar random HD dari Kurumi.AI"
            },
            await m.react("✅"),
            { quoted: m }
        );
    } catch (e) {
        await m.react("❎");
        console.error("[❌ ERROR handler randomimg]", e.message);
        await m.reply("⚠️ Gagal ambil/kirim gambar HD, coba lagi nanti ya.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.botAdmin = false;
