import { getUser, updateUserName } from "../../lib/rpg.js";
import fs from "fs";

export const aliases = ["me", "status"];

export async function handler(ann, m) {
    const user = getUser(m.sender, m.pushName || "Unknown");
    updateUserName(m.sender, m.pushName || "Unknown");

    await m.react("⏱️");

    let txt = `🎮 *RPG PROFILE*\n`;
    txt += `👤 Nama: ${user.name}\n`;
    txt += `🏅 Level: ${user.level}\n`;
    txt += `⭐ EXP: ${user.exp}\n`;
    txt += `❤️ HP: ${user.hp}\n`;
    txt += `❤️ HP: ${user.maxHp}\n`; 
    txt += `🔋 MP: ${user.mp}\n`;
    txt += `⚔️ ATK: ${user.atk}\n`;
    txt += `🛡️ DEF: ${user.def}\n`;
    txt += `💰 Gold: ${user.gold}\n`;
    txt += `🧙 Job: ${user.job}\n`;

    const thumbnailBuffer = fs.readFileSync("./media/thumb/rpg.jpg");
    await m.thumbReply(txt, {
        title: "RPG PROFILE STATUS",
        thumbnail: thumbnailBuffer
    });
    await m.react("✅");
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
