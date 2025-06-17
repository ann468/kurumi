export const aliases = ["demoteadmin", "turunkan"];

export async function handler(ann, m) {
    await m.react("⏱️");

    try {
        const metadata = await ann.groupMetadata(m.chat);

        const target = m.mentionedJid?.[0] || m.quoted?.sender;
        if (!target) {
            await m.react("❎");
            return m.reply("❌ Tag atau reply orang yang mau di-demote.");
        }

        const participant = metadata.participants.find(p => p.id === target);
        if (!participant?.admin) {
            await m.react("❎");
            return m.reply("❌ Dia bukan admin, ngapain di-demote? 😅");
        }

        await ann.groupParticipantsUpdate(m.chat, [target], "demote");

        await m.thumbReply(
            `Berhasil menurunkan jabatan admin dari @${target.split("@")[0]}`,
            {
                title: "🔻 Demote sukses!",
                mentions: [target]
            }
        );

        await m.react("✅");
    } catch (err) {
        console.error(err);
        await m.react("❎");
        return m.reply("❌ Gagal demote. Cek apakah bot udah jadi admin.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = true;
handler.onlyAdmin = true;
handler.botAdmin = true;
