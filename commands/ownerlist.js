export const aliases = ["creator", "dev", "owner"];

export async function handler(ann, m) {
    const listOwner = Array.isArray(global.db?.owner) ? global.db.owner : [];
    if (!listOwner.length) {
        return ann.sendMessage(
            m.chat,
            { text: "⚠️ Gak ada owner terdaftar." },
            { quoted: m }
        );
    }
    const contactList = listOwner.map(owner => {
        const id = owner.id;
        const num = id.split("@")[0];
        const name = owner.name || num;
        const vcard = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${name}`,
            `TEL;type=CELL;type=VOICE;waid=${num}:+${num}`,
            "END:VCARD"
        ].join("\n");

        return { vcard };
    });
    await ann.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: "Owner Bot",
                contacts: contactList
            }
        },
        { quoted: m }
    );
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
