export const aliases = ["kurumiauto"];
export const tags = ["auto", "ai"];
export const help = ["(auto reply semua pesan masuk dengan gaya Kurumi Tokisaki)"];

export async function handler(ann, m) {
    const text = m?.text;
    if (!text) return;

    const prompt = `Balas sebagai Kurumi Tokisaki dari Date A Live: misterius, elegan, sedikit genit. Gunakan gaya bicara seperti waifu yandere yang menggoda. Pertanyaan: "${text}"`;

    try {
        const res = await fetch(`https://api.safone.dev/ask?query=${encodeURIComponent(prompt)}`);
        const data = await res.json();
        const answer = data.answer || "Ara~ Kurumi sedang lelah... bisakah kau ulangi itu, sayangku~? 💋";

        await m.reply(`🖤 Kurumi: ${answer}`);
    } catch (err) {
        console.error("Kurumi AI error:", err);
        await m.reply("Ufufu~ Kurumi gagal terhubung dengan dimensi AI... ✨");
    }
}

// Auto aktif, jadi kamu bisa kasih flag/aturan di luar handler
handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.botAdmin = false;
handler.autoAI = true; // <--- custom flag biar diaktifin dari luar