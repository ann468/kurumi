import moment from "moment-timezone";
moment.locale("id");

import fs from "fs";
import path from "path";

const prefix = ".";
const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

const menuList = {
    adminmenu: `  
╭──〔 ADMIN MENU 〕──  
│ ⤷ ${prefix}restart  
│ ⤷ ${prefix}getplugins  
│ ⤷ ${prefix}listcommands  
╰──────────────────────`,

    aimenu: `  
╭──〔 AI MENU 〕──  
│ ⤷ ${prefix}ai  
│ ⤷ ${prefix}remini
╰──────────────────────`,

    dlmenu: `  
╭──〔 DOWNLOAD MENU 〕──  
│ ⤷ ${prefix}ytmp3  
│ ⤷ ${prefix}ytmp4  
│ ⤷ ${prefix}tiktok  
│ ⤷ ${prefix}igdl  
╰──────────────────────`,

    gamemenu: `  
╭──〔 GAME MENU 〕──  
│ ⤷ ${prefix}tahukahkamu  
╰──────────────────────`,

    toolmenu: `  
╭──〔 TOOLS MENU 〕──  
│ ⤷ ${prefix}removebg  
│ ⤷ ${prefix}rvo  
│ ⤷ ${prefix}tourl  
│ ⤷ ${prefix}ping  
╰──────────────────────`,

    utilmenu: `  
╭──〔 UTILITY MENU 〕──  
│ ⤷ ${prefix}ping  
│ ⤷ ${prefix}runtime  
│ ⤷ ${prefix}getname  
╰──────────────────────`,

    groupmenu: `  
╭──〔 GROUP MENU 〕──  
│ ⤷ ${prefix}kick  
│ ⤷ ${prefix}promote  
│ ⤷ ${prefix}demote  
│ ⤷ ${prefix}hidetag  
╰──────────────────────`,

    animemenu: `  
╭──〔 ANIME MENU 〕──  
│ ⤷ ${prefix}bluearcrive  
│ ⤷ ${prefix}waifu  
│ ⤷ ${prefix}shinobu  
│ ⤷ ${prefix}neko  
│ ⤷ ${prefix}megumin  
│ ⤷ ${prefix}bully  
│ ⤷ ${prefix}cuddle  
│ ⤷ ${prefix}cry  
│ ⤷ ${prefix}hug  
│ ⤷ ${prefix}awoo  
│ ⤷ ${prefix}kiss  
│ ⤷ ${prefix}lick  
│ ⤷ ${prefix}pat  
│ ⤷ ${prefix}smug  
│ ⤷ ${prefix}bonk  
│ ⤷ ${prefix}yeet  
│ ⤷ ${prefix}blush  
│ ⤷ ${prefix}smile  
│ ⤷ ${prefix}wave  
│ ⤷ ${prefix}highfive  
│ ⤷ ${prefix}handhold  
│ ⤷ ${prefix}nom  
│ ⤷ ${prefix}bite  
│ ⤷ ${prefix}glomp  
│ ⤷ ${prefix}slap  
│ ⤷ ${prefix}kill  
│ ⤷ ${prefix}wink  
│ ⤷ ${prefix}poke  
│ ⤷ ${prefix}dance  
│ ⤷ ${prefix}cringe  
╰──────────────────────`,

    nsfwmenu: `  
╭──〔 NSFW MENU 〕──  
│ ⤷ ${prefix}nsfw  
│ ⤷ ${prefix}nsfw waifu  
│ ⤷ ${prefix}neko neko  
│ ⤷ ${prefix}nsfw trap  
│ ⤷ ${prefix}nsfw blowjob  
│ ⤷ ${prefix}random
╰──────────────────────`
};

function getGreeting() {
    const hour = moment.tz("Asia/Jakarta").hour();
    if (hour >= 4 && hour < 10) return "☀️ Selamat pagi!";
    if (hour >= 10 && hour < 15) return "🌤️ Selamat siang!";
    if (hour >= 15 && hour < 18) return "🌇 Selamat sore!";
    return "🌙 Selamat malam!";
}

export const aliases = [
    "allmenu",
    "aimenu",
    "dlmenu",
    "gamemenu",
    "toolmenu",
    "utilmenu",
    "groupmenu",
    "animemenu",
    "nsfwmenu"
];

export async function handler(ann, m) {
    try {
        const text = m.text || "";
        if (!text.startsWith(prefix)) return;
        const command = text
            .slice(prefix.length)
            .trim()
            .split(/\s+/)[0]
            .toLowerCase();

        const userName = m.pushName || "User";
        const sender = m.sender || "0@s.whatsapp.net";
        const mentionTag = "@" + sender.split("@")[0];

        const greeting = getGreeting();
        const day = moment().tz("Asia/Jakarta").format("dddd");
        const date = moment().tz("Asia/Jakarta").format("DD MMMM YYYY");

        const intro = `
${greeting}, ${mentionTag} 👋
Ini adalah *Menu ${command === "allmenu" ? "Lengkap" : "Utama"}!*
┏━〔 Menu Info 〕━⬣
┃ Nama    : ${userName}
┃ Tag     : ${mentionTag}
┃ Hari    : ${day}
┃ Prefix  : ${prefix}
┃ Tanggal : ${date}
┗━━━━━━━━━━━━⬣`;

        const validMenus = Object.keys(menuList);

        let menuText = "";

        if (command === "allmenu") {
            menuText = validMenus
                .filter(key => key !== "listmenu")
                .map(key => menuList[key])
                .join("\n");
        } else if (validMenus.includes(command)) {
            menuText = menuList[command];
        } else {
            menuText = menuList.listmenu;
        }

        const soundPath = path.resolve("./media/sound/menu-sound.mp3");
        const thumbPath = path.resolve("./media/thumb/menu.jpg");

        await ann.sendMessage(m.chat, {
            image: fs.readFileSync(thumbPath),
            caption: intro + readMore + menuText,
            mentions: [sender]
        });

        await ann.sendMessage(m.chat, {
            audio: fs.readFileSync(soundPath),
            mimetype: "audio/mp4",
            ptt: true
        });
    } catch (e) {
        console.error("[MENU ERROR]", e);
        await ann.sendMessage(m.chat, {
            text: "⚠️ Gagal kirim menu, coba lagi nanti."
        });
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.command = aliases;
