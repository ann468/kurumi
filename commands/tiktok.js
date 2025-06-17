import fetch from "node-fetch";

export const name = "tiktok";
export const aliases = ["ttdl", "tiktokdl", "tt"];
export const description = "Download video TikTok tanpa watermark";
export const category = "downloader";

export async function handler(ann, m) {
    const parts = m.text.trim().split(/\s+/);
    const url = parts[1];

    if (!url || !/^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com/.test(url)) {
        return m.reply(
            "🌀 Kirim link TikTok-nya kak!\nContoh: .tiktok https://vt.tiktok.com/xxxx"
        );
    }

    await m.react("⏱️");

    try {
        const res = await fetch(
            `https://api.ownblox.my.id/api/ttdl?url=${encodeURIComponent(url)}`
        );
        const data = await res.json();

        if (!data.status || !data.result?.video) {
            await m.react("❎");
            return m.thumbReply("❌ Gagal mengambil video. Coba lagi nanti.", {
                title: "TikTok Downloader",
            });
        }

        const { video, audio, title, author } = data.result;

        await ann.sendMessage(
            m.chat,
            {
                video: { url: video },
                caption: `✨ *${title}*\n👤 *By:* ${author}\n📥 Tanpa watermark`
            },
            { quoted: m }
        );

        if (audio) {
            await ann.sendMessage(
                m.chat,
                {
                    audio: { url: audio },
                    mimetype: "audio/mpeg"
                },
                { quoted: m }
            );
        }

        await m.react("✅");
    } catch (e) {
        console.error("[TIKTOK ERROR]", e.message || e);
        await m.react("⚠️");
        m.reply("⚠️ Terjadi kesalahan saat menghubungi API.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;