export const aliases = ["removeall"];

export async function handler(ann, m) {
    await m.react("⚠️");
    try {
        const metadata = await ann.groupMetadata(m.chat);

        if (!m.isAdmin) {
            await m.react("❌");
            return m.reply("❌ Lu bukan admin bro, gak bisa pakai ini.");
        }

        const groupOwner = metadata.owner;
        const participants = metadata.participants;
        const adminIDs = participants.filter(p => p.admin).map(p => p.id);

        // Filter yang bukan admin dan bukan owner
        const targets = participants
            .filter(p => !adminIDs.includes(p.id) && p.id !== groupOwner)
            .map(p => p.id);

        if (targets.length === 0) {
            await m.react("😶");
            return m.reply("⚠️ Gak ada member biasa buat di-kick.");
        }

        await m.reply(`🚨 Menendang ${targets.length} member non-admin...`);

        for (let target of targets) {
            try {
                await ann.groupParticipantsUpdate(m.chat, [target], "remove");
                await delay(1200); // anti spam
            } catch (err) {
                console.log(`❌ Gagal kick ${target}:`, err);
            }
        }

        await m.react("✅");
        return m.reply("✅ Semua member non-admin sudah di-kick!");
    } catch (e) {
        console.error(e);
        await m.react("❌");
        return m.reply(
            "❌ Gagal kick massal. Bot mungkin gak punya izin cukup."
        );
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = true;
handler.admin = true;
handler.botAdmin = true;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
