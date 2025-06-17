import fetch from "node-fetch";

export const name = "nsfw";
export const aliases = ["randomnsfw", "acaksfw", "random-hentai"];

export async function handler(ann, m, extra = {}) {
    const args = extra.args || m.args || [];
    const chatId = m.chat;
    const fromMe = m.fromMe;
    const isPremium = m.isPremium;
    if (!global.db.nsfw || typeof global.db.nsfw !== "object") {
        global.db.nsfw = {};
    }
    const data = global.db.nsfw;
    const categories = ["waifu", "neko", "trap", "blowjob"];
    let param = args[0]?.toLowerCase();
    await m.react("⏱️");
    if (
        !param ||
        (!["on", "off", "random"].includes(param) &&
            !categories.includes(param))
    ) {
        const status = data[chatId] ? "ON" : "OFF";
        await m.react("✅");
        return m.thumbReply(
            `🔞 *NSFW Menu*\n\nPilih kategori:\n• *waifu*\n• *neko*\n• *trap*\n• *blowjob*\n• *random* (acak dari FlowFalcon)\n\nContoh:\n.nsfw waifu\n.nsfw random\n\n📌 Aktifkan NSFW:\n.nsfw on\n.nsfw off\n\n📍 Status sekarang: *${status}*`,
            { title: `🔞 NSFW ${status}` }
        );
    }
    if (["on", "off"].includes(param)) {
        let isGroupAdmin = false;
        if (m.isGroup) {
            try {
                const groupMeta = await ann.groupMetadata(chatId);
                const adminList = groupMeta.participants
                    .filter(p => p.admin)
                    .map(p => p.id);
                isGroupAdmin = adminList.includes(m.sender);
            } catch (e) {
                console.error("Gagal ambil metadata grup:", e);
            }
        }
        if (!isGroupAdmin && !fromMe && !isGroup) {
            await m.react("❌");
            return m.thumbReply(
                "❌ Perintah ini hanya bisa digunakan oleh *Admin Grup*.",
                { title: "AKSES DITOLAK" }
            );
        }
        if (param === "on") {
            data[chatId] = true;
            await m.thumbReply("✅ Mode NSFW *diaktifkan* untuk chat ini.", {
                title: "🔞 NSFW ON"
            });
        } else {
            delete data[chatId];
            await m.thumbReply("❌ Mode NSFW *dimatikan* untuk chat ini.", {
                title: "🔞 NSFW OFF"
            });
        }
        await m.react("✅");
        global.db.nsfw = data;
        await global.db.save("nsfw");
        return;
    }
    if (!data[chatId]) {
        await m.react("❌");
        return m.thumbReply(
            `⚠️ Mode NSFW *OFF* untuk chat ini.\nAktifkan dulu:\n.nsfw on`,
            { title: "🔞 NSFW OFF" }
        );
    }
    if (!isPremium && !fromMe) {
        await m.react("❌");
        return m.thumbReply(
            "🔒 Fitur ini hanya tersedia untuk *User Premium*.",
            { title: "AKSES DITOLAK" }
        );
    }
    if (param === "random") {
        try {
            const res = await fetch("https://flowfalcon.dpdns.org/random/nsfw");
            const contentType = res.headers.get("content-type");
            if (!res.ok || !contentType.startsWith("image/")) {
                throw new Error("Response bukan gambar");
            }
            const buffer = await res.buffer();
            await ann.sendMessage(
                chatId,
                {
                    image: buffer,
                    caption: `🔞 Random NSFW`
                },
                { quoted: m }
            );
            await m.react("✅");
        } catch (e) {
            console.error("[NSFW - FlowFalcon Random] Error:", e);
            await m.react("❌");
            return m.reply(
                "❌ Gagal ambil gambar NSFW acak.\nCoba `.nsfw waifu` sebagai alternatif."
            );
        }
        return;
    }
    if (categories.includes(param)) {
        try {
            const res = await fetch(`https://api.waifu.pics/nsfw/${param}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (!json.url) throw new Error("No URL");
            await ann.sendMessage(
                chatId,
                {
                    image: { url: json.url },
                    caption: `🔞 NSFW *${param}*`
                },
                { quoted: m }
            );
            await m.react("✅");
        } catch (e) {
            console.error("Fetch/send error:", e);
            await m.react("❌");
            return m.reply("Gagal mengambil gambar NSFW. Coba lagi nanti.");
        }
        return;
    }
}

export default { name, aliases, handler };
