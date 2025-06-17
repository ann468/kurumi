export const aliases = ["whereami", "id"];

export async function handler(ann, m) {
    const id = m.chat;
    let type = "Unknown";

    if (id.endsWith("@g.us")) type = "Group";
    else if (id.endsWith("@s.whatsapp.net")) type = "Private Chat";
    else if (id.endsWith("@newsletter")) type = "Newsletter";
    else if (id === "status@broadcast") type = "Status Broadcast";

    await m.reply(`📍 *Info Chat:*\n🆔 ID: ${id}\n📦 Type: ${type}`);
}

handler.private = false;
handler.onlyOwner = true;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
