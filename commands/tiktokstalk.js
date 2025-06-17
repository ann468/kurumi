// commands/tiktokstalk.js
import fetch from "node-fetch";

export const name = "tiktokstalk";
export const aliases = ["ttstalk"];
export const category = "stalker";
export const description = "Stalk profil TikTok seseorang ✨";

export async function handler(ann, m, { args }) {
    if (!args[0])
        return m.reply(
            "Masukin username TikTok-nya, contoh: .ttstalk annturu22"
        );

    try {
        await m.react("⏱️");
        const res = await fetch(
            `https://zenz.biz.id/stalker/tiktok?username=${encodeURIComponent(
                args[0]
            )}`
        );
        const json = await res.json();

        if (!json.status) throw new Error("Gagal ambil data dari API");

        const user = json.result.user;
        const stats = json.result.statsV2;

        let caption = `👤 *${user.nickname}*\n`;
        caption += `🆔 @${user.uniqueId}\n`;
        caption += `🌎 *Region:* ${user.region || "?"}\n`;
        caption += `📝 *Bio:*\n${user.signature || "-"}\n\n`;
        caption += `📊 *Statistik:*\n`;
        caption += `• Followers: ${stats.followerCount}\n`;
        caption += `• Following: ${stats.followingCount}\n`;
        caption += `• Likes: ${stats.heartCount}\n`;
        caption += `• Video: ${stats.videoCount}\n`;
        caption += `• Teman: ${stats.friendCount}\n`;

        await ann.sendMessage(
            m.chat,
            {
                image: { url: user.avatarLarger },
                caption
            },
            await m.react("✅"),
            { quoted: m }
        );
    } catch (err) {
      await m.react("❎"),
        console.error("[tiktokstalk.js]", err);
        await m.reply("❌ Gagal stalk TikTok. Pastikan username-nya bener ya.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
