export const aliases = ["promoteadmin", "angkat"];

export async function handler(ann, m) {
    await m.react("⏱️");
    try {
        const metadata = await ann.groupMetadata(m.chat);
        const target = m.mentionedJid?.[0] || m.quoted?.sender;
        if (!target) {
            await m.react("❎");
            return m.reply("❌ Tag atau reply orang yang mau di-promote.");
        }
        const participant = metadata.participants.find(p => p.id === target);
        if (participant?.admin) {
            await m.react("❎");
            return m.thumbReply("❌ Dia udah jadi admin, santaiin aja 😅", {
              title: "AKSES DITOLAK"
            });
        }
        await ann.groupParticipantsUpdate(m.chat, [target], "promote");
        await m.thumbReply(
            `Sukses promote @${target.split("@")[0]} jadi admin!`,
            {
                title: "🎉 Promote sukses!",
                mentions: [target]
            }
        );
        await m.react("✅");
    } catch (err) {
        console.error(err);
        await m.react("❎");
        return m.reply("❌ Gagal promote. Bot mungkin bukan admin.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = true;
handler.onlyAdmin = true;
handler.botAdmin = true;
