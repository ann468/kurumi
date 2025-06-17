import fetch from "node-fetch";

export function handler(ann, m) {
    fetch("https://api.ownblox.my.id/api/tahukahkamu")
        .then(res => res.json())
        .then(data => {
            if (!data?.result) {
                return m.reply("Gagal ambil fakta, coba lagi nanti ya 😢");
            }
            m.reply(`📘 *Tahukah Kamu?*\n${data.result}`);
        })
        .catch(err => {
            console.error("Error di .tahukahkamu:", err);
            m.reply("⚠️ Lagi error bang, API-nya ngambek kayaknya.");
        });

    return ann;
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;