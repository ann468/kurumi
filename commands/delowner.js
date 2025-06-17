export const aliases = ["hapusowner", "removeowner"];

export async function handler(ann, m, { args }) {
  await m.react("⏱️");
    let targetId;
    if (m.quoted) {
        targetId = m.quoted.sender;
    } else {
        const nomor = args[0]?.replace(/\D/g, "");
        if (!nomor) {
          await m.react("❎");
            return m.reply(
                "❌ Ketik: .delowner 628xxxx atau reply ke orangnya."
            );
        }
        targetId = nomor + "@s.whatsapp.net";
    }

    if (targetId === m.sender) {
      await m.react("❎");
        return m.reply("❌ Lu gak bisa hapus diri sendiri, bro.");
    }

    const index = global.db.owner.findIndex(o => o.id === targetId);
    if (index === -1) {
      await m.react("❎");
        return m.reply("⚠️ Dia bukan owner, ngapain dihapus?");
    }

    global.db.owner.splice(index, 1);
    await global.db.save("owner");
    await m.react("✅");
    return m.reply("✅ Owner berhasil dihapus.");
}

handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
