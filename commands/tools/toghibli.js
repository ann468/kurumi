import fetch from "node-fetch";
import FormData from "form-data";
import { uploadToCatbox } from "../../lib/uploader.js";

export const aliases = ["togibli"];

export async function handler(ann, m, { args }) {
    let prompt = "soft lighting, dreamy atmosphere, cinematic shot";
    const raw = args.join(" ");

    // Parse prompt override pakai "|"
    if (raw.includes("|")) {
        const parts = raw.split("|");
        prompt = parts.slice(1).join("|").trim() || prompt;
    } else if (raw.trim()) {
        prompt = raw.trim();
    }

    let imageUrl;
    let buffer = null;

    // Ambil imageMessage dari quoted / langsung
    const quotedImage =
        m.quoted?.message?.imageMessage || m.quoted?.imageMessage;
    const directImage = m.message?.imageMessage || m.imageMessage;

    try {
        if (quotedImage) {
            buffer = await ann.downloadMediaMessage(m.quoted);
        } else if (directImage) {
            buffer = await ann.downloadMediaMessage(m);
        }
    } catch (err) {
        console.error("❌ Download media error:", err);
        return m.reply("❌ Gagal download gambar.");
    }

    // Kalau ada buffer, upload ke Catbox
    if (buffer) {
        const result = await uploadToCatbox(buffer);
        if (!result.url) return m.reply("❌ Gagal upload gambar.");
        imageUrl = result.url;
    } else {
        // Cek link dari argumen
        const maybeUrl = args.find(arg => arg.startsWith("http"));
        if (!maybeUrl) {
            return m.reply(
                `📸 Kirim gambar *langsung*, *balas gambar*, atau kasih URL!\nContoh:\n.toghibli https://img.xxx/img.jpg | cozy vibes`
            );
        }
        imageUrl = maybeUrl;
    }

    // Info pemrosesan
    await m.reply(`⏳ Mengubah ke *Ghibli style*...\nPrompt: ${prompt}`);

    try {
        const res = await fetch(
            `https://flowfalcon.dpdns.org/tools/toghibli?url=${encodeURIComponent(
                imageUrl
            )}&prompt=${encodeURIComponent(prompt)}`
        );
        const json = await res.json();

        const ghibliUrl = json?.result?.data?.[0]?.url;
        if (!ghibliUrl) throw new Error("Gagal ambil hasil dari API");

        // Kirim hasil gambar
        await ann.sendMessage(
            m.chat,
            {
                image: { url: ghibliUrl },
                caption: `🎨 *Ghibli style*\n🧠 Prompt: ${prompt}`
            },
            { quoted: m }
        );
    } catch (err) {
        console.error("❌ API Error:", err);
        m.reply("❌ Gagal memproses API Ghibli. Coba lagi nanti.");
    }
}
