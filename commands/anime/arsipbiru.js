
import fetch from "node-fetch";

export const name = "arsipbiru";
export const aliases = ["ba", "bluearchive"];
export const category = "anime";
export const description =
    "Ngirim gambar random dari Blue Archive (2 sumber API)";

export async function handler(ann, m) {
    await m.react("⏱️");
    const sources = [
        async () => {
            const res = await fetch("https://flowfalcon.dpdns.org/random/ba");
            if (!res.ok) throw new Error(`FlowFalcon status ${res.status}`);
            return Buffer.from(await res.arrayBuffer());
        },
        async () => {
            const res = await fetch("https://zenz.biz.id/random/ba");
            if (!res.ok) throw new Error(`Zenz status ${res.status}`);
            return Buffer.from(await res.arrayBuffer());
        }
    ];
    try {
        const pick = sources[Math.floor(Math.random() * sources.length)];
        const image = await pick();
        if (!Buffer.isBuffer(image) || image.length === 0) {
            throw new Error("Invalid image buffer");
        }
        await ann.sendMessage(
            m.chat,
            {
                image,
                caption: "💙 Nih gambar random dari *Blue Archive* buat kamu~"
            },
            await m.react("✅"),
            { quoted: m }
        );
    } catch (err) {
      await m.react("❎"),
        console.error("[arsipbiru.js]", err);
        await m.reply("❌ Error saat ambil gambar. Coba lagi nanti.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
