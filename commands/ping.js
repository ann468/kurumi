export const aliases = ["latency", "delay"];
export const tags = ["info"];
export const help = ["ping", "latency", "delay"];

export async function handler(ann, m) {
    await m.reply("🏓 Pong! Bot aktif.");
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.botAdmin = false;
