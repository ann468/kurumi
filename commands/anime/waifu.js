export const aliases = [
    "neko",
    "shinobu",
    "megumin",
    "bully",
    "cuddle",
    "cry",
    "hug",
    "awoo",
    "kiss",
    "lick",
    "pat",
    "smug",
    "bonk",
    "yeet",
    "blush",
    "smile",
    "wave",
    "highfive",
    "handhold",
    "nom",
    "bite",
    "glomp",
    "slap",
    "kill",
    "wink",
    "poke",
    "dance",
    "cringe"
];

export async function handler(ann, m, extra = {}) {
    await m.react("⏱️");
    const { args = [], prefix = "." } = extra;
    const text = m.body?.trim() || "";
    const category = text.slice(1).split(" ")[0].toLowerCase();

    const url = `https://api.waifu.pics/sfw/${category}`;

    try {
        const res = await fetch(url);
        const json = await res.json();

        if (!json || !json.url)
            return m.reply(
                "⚠️ Gagal ambil gambar. Pastikan kategorinya valid."
            );

        await ann.sendMessage(
            m.chat,
            {
                image: { url: json.url },
                caption: `🔹 *Kategori:* ${category}`
            },
            { quoted: m }
        );
        await m.react("✅");
    } catch (e) {
        await m.react("❎");
        console.error(e);
        m.reply("❌ Terjadi kesalahan saat mengambil gambar.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
