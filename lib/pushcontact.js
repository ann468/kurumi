export async function pushContact(ann, m, {
    contacts = []
} = {}) {
    const contactsFormatted = contacts.map(c => ({
        displayName: c.displayName,
        vcard: `
BEGIN:VCARD
VERSION:3.0
FN:${c.displayName}
ORG:${c.org || "-"}
TEL;type=CELL;type=VOICE;waid=${c.number}:${c.number}
END:VCARD
        `.trim()
    }));

    return await ann.sendMessage(m.chat, {
        contacts: {
            displayName: `${contacts.length} Kontak`,
            contacts: contactsFormatted
        }
    }, { quoted: m });
}