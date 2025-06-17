export const aliases = ["animeinfo"];

export async function handler(ann, m) {
    const fetch = (await import("node-fetch")).default;

    try {
        const res = await fetch("https://api.jikan.moe/v4/news/anime");
        const json = await res.json();

        if (!json.data || json.data.length === 0) {
            return m.reply("📭 Belum ada berita anime terbaru nih~");
        }

        const slice = json.data.slice(0, 10); // ambil 10 berita pertama

        for (const item of slice) {
            const title = item.title;
            const img = item.images?.jpg?.image_url;
            const url = item.url;
            const caption = `*${title}*\n🔗 ${url}`;

            if (img) {
                await ann.sendMessage(
                    m.chat,
                    {
                        image: { url: img },
                        caption
                    },
                    { quoted: m }
                );
            } else {
                await m.reply(caption);
            }

            // beri jeda sekecil mungkin
            await new Promise(r => setTimeout(r, 500));
        }
    } catch (e) {
        console.error("[ERR ANI_NEWS]", e);
        return m.reply("❌ Gagal ambil berita anime, coba lagi nanti ya~");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
