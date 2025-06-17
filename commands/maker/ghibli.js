import fetch from "node-fetch";
export const aliases = ["gibliimg"]

export async function handler(ann, m) {
    const args = m.text?.trim().split(/\s+/) || [];
    const cmdName = m.cmd || m.command || args[0]?.replace(/^\./, "") || "";
    const prompt = args.slice(1).join(" ").trim();

    if (!prompt) {
        m.reply(`Masukin prompt-nya dong!\nContoh: .${cmdName} cewek imut bawa payung di tengah hujan`);
        return ann;
    }

    m.reply("🎨 Lagi bikin Ghibli versimu...");

    try {
        const res = await fetch(`https://api.ownblox.my.id/api/ghibliimage?prompt=${encodeURIComponent(prompt)}`);
        const contentType = res.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const data = await res.json();
            if (!data.image) return m.reply("Gagal ambil gambar 😢");

            return ann.sendMessage(
                m.chat,
                {
                    image: { url: data.image },
                    caption: `✨ Ghibli Style\n🎬 Prompt: *${prompt}*`
                },
                { quoted: m }
            );
        } else if (contentType.startsWith("image/")) {
            const arrayBuffer = await res.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return ann.sendMessage(
                m.chat,
                {
                    image: buffer,
                    caption: `✨ Ghibli Style\n🎬 Prompt: *${prompt}*`
                },
                { quoted: m }
            );
        } else {
            m.reply("API ngasih respon aneh 😵, coba lagi nanti.");
        }
    } catch (err) {
        console.error(err);
        m.reply("💥 Error bang, kemungkinan API-nya down.");
    }

    return ann;
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;