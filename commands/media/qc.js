import { convertToSticker } from "../../lib/sticker.js";
import axios from "axios";

// 🔒 Ambil foto profil secara aman
async function getProfilePictureSafe(ann, jid) {
    try {
        if (typeof ann.fetchProfilePictureUrl === "function") {
            return await ann.fetchProfilePictureUrl(jid, "image");
        } else if (typeof ann.profilePictureUrl === "function") {
            return await ann.profilePictureUrl(jid, "image");
        }
    } catch (e) {
        console.warn("⚠️ Gagal ambil PP:", e);
    }
    return "https://telegra.ph/file/24fa902ead26340f3df2c.png";
}

// 👤 Ambil nama user secara aman (no more nomor)
async function getNameSafe(ann, jid) {
    try {
        if (typeof ann.getName === "function") {
            return await ann.getName(jid);
        }

        const contact = ann.contacts?.[jid];
        if (contact?.name) return contact.name;
        if (contact?.notify) return contact.notify;

        if (typeof ann.onWhatsApp === "function") {
            const wa = await ann.onWhatsApp(jid);
            if (Array.isArray(wa) && wa[0]?.notify) {
                return wa[0].notify;
            }
        }

        return jid.split("@")[0]; // fallback
    } catch (e) {
        console.warn("⚠️ Gagal ambil nama:", e);
        return jid.split("@")[0];
    }
}

const handler = async (ann, m, { args }) => {
    let text = args.join(" ").trim();
    if (!text && m.quoted?.text) text = m.quoted.text;
    if (!text) return m.reply("❗ Mana teksnya?");

    const who = m.mentionedJid?.[0] || (m.fromMe ? ann.user.jid : m.sender);

    // ✅ Ambil nama & foto profil
    const name = await getNameSafe(ann, who);
    const profile = await getProfilePictureSafe(ann, who);

    // 🌐 Bangun URL ke API
    const apiUrl = [
        `https://api.ownblox.my.id/api/qc`,
        `?text=${encodeURIComponent(text)}`,
        `&name=${encodeURIComponent(name)}`,
        `&profile=${encodeURIComponent(profile)}`
    ].join("");

    await m.reply("🧪 Generating QC...");

    try {
        const { data } = await axios.get(apiUrl, {
            responseType: "arraybuffer"
        });

        const sticker = await convertToSticker(data);
        if (!sticker) throw new Error("❌ Gagal buat stiker.");

        return ann.sendMessage(m.chat, { sticker }, { quoted: m });
    } catch (e) {
        console.error("❌ QC Error:", e);
        return m.reply("❌ Gagal generate QC.");
    }
};

handler.help = ["qc"];
handler.tags = ["sticker"];
handler.command = /^qc$/i;

export default handler;