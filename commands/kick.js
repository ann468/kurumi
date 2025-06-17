export const aliases = ["kickmember", "remove"];

export async function handler(ann, m) {
    await m.react("⏱️");
    try {
        const metadata = await ann.groupMetadata(m.chat);
        if (!m.isAdmin) {
            await m.react("❎");
            return m.reply("❌ Kamu harus jadi admin grup untuk bisa kick.");
        }
        const target = getTargetFromMessage(m);
        if (!target) {
            await m.react("❎");
            return m.reply("❌ Tag atau reply anggota yang mau di kick.");
        }
        if (target === m.sender) {
            await m.react("❎");
            return m.reply("❌ Kamu gak bisa kick diri sendiri!");
        }
        const targetParticipant = metadata.participants.find(
            p => p.id === target
        );
        if (targetParticipant?.admin) {
            await m.react("❎");
            return m.reply("❌ Gak bisa kick admin lain!");
        }
        // Eksekusi kick
        await ann.groupParticipantsUpdate(m.chat, [target], "remove");
        await m.thumbReply(`Sukses kick @${target.split("@")[0]} dari grup!`, {
            title: "✅ Kick berhasil!",
            mentions: [target]
        });
        await m.react("✅");
    } catch (e) {
        console.error(e);
        await m.react("❎");
        return m.reply("❌ Gagal kick member, mungkin aku gak cukup izin.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = true;
handler.admin = true;
handler.botAdmin = true;

function getTargetFromMessage(m) {
    if (m.mentionedJid && m.mentionedJid.length) return m.mentionedJid[0];
    if (m.quoted) return m.quoted.sender;
    return null;
}
