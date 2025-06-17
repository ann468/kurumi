export async function handler(ann, m, { args }) {
    await m.react("⏱️");
    let targetId;
    if (m.quoted) {
        targetId = m.quoted.sender;
    } else {
        const nomor = args[0]?.replace(/\D/g, "");
        if (!nomor) await m.react("❎");
        return m.reply("❌ Ketik: .addowner 628xxxx atau reply ke orangnya.");
        targetId = nomor + "@s.whatsapp.net";
    }

    if (targetId === m.sender) {
        return m.reply("❌ Gak bisa nambahin diri sendiri jadi owner.");
        await m.react("❎");
    }

    if (global.db.owner.find(o => o.id === targetId)) {
        await m.react("❎");
        return m.reply("⚠️ Dia udah owner cuy.");
    }

    global.db.owner.push({ id: targetId });
    await global.db.save("owner");
    await m.react("✅");
    return m.reply("✅ Owner baru berhasil ditambahkan!");
}

handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
