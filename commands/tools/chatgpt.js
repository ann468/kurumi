export async function handler(ann, m) {
    // ambil seluruh teks setelah command alias
    const text = (m.text || m.body || "").trim().split(/\s+/).slice(1).join(" ");
    if (!text) return m.reply("❗ Contoh: .ai siapa itu kurumi tokisaki");

    try {
        const res = await fetch(`https://zenz.biz.id/ai/claila?model=chatgpt&message=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!json.status) {
            return m.reply("❌ Gagal mengambil data dari AI.");
        }

        const hasil = `🤖 *AI Model: ${json.model.toUpperCase()}*\n\n📥 *Input:* ${json.input}\n\n📤 *Output:*\n${json.result}`;
        await m.reply(hasil);
    } catch (err) {
        console.error(err);
        await m.reply("⚠️ Terjadi kesalahan saat menghubungi AI. Coba lagi nanti.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;