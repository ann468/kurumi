export const aliases = ["rvo", "revive"];

export async function handler(ann, m) {
    if (!m.quoted) return m.reply("❗Reply ke foto/video 1x lihat dulu dong!");

    const q = m.quoted;

    const msg = q.message?.viewOnceMessage?.message || q.message;

    const mimeType = Object.keys(msg || {})[0];
    if (!mimeType?.startsWith("image") && !mimeType?.startsWith("video")) {
        return m.reply("⚠️ Ini bukan foto/video view once ya.");
    }
    try {
        const media = await ann.downloadMediaMessage(q);
        const sendType = mimeType.startsWith("image") ? "image" : "video";
        await m.react("⏱️");

        const originalCaption =
            msg?.imageMessage?.caption || msg?.videoMessage?.caption || "";
        await ann.sendMessage(
            m.chat,
            {
                [sendType]: media,
                caption: originalCaption,
                viewOnce: false
            },
            { quoted: m }
        );
        await m.react("️✅");
    } catch (e) {
        console.error(e);
        await m.react("❎");
        m.reply("❌ Gagal revive media, coba lagi nanti ya.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
