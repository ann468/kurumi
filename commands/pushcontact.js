export const aliases = ["pushkontak", "blastpm", "dmall"];

export async function handler(ann, m, { args }) {
    const metadata = await ann.groupMetadata(m.chat);
    const participants = metadata.participants;
    if (!m.fromMe)
        return m.reply("❌ Perintah ini hanya bisa dijalankan oleh bot.");
    const text = args.join(" ");
    if (!text.trim()) {
        return m.reply(
            "⚠️ Kasih teks yang mau dikirim!\n\nContoh: `.pushkontak Halo semua!`"
        );
    }
    const mem = participants
        .filter(v => v.id.endsWith(".net") && v.id !== m.sender)
        .map(v => v.id);
    await m.reply(
        `🚀 Mengirim pesan ke *${
            mem.length
        }* member grup...\nEstimasi selesai dalam *${mem.length * 1} detik*.`
    );
    const fakeQuoted = {
        key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
        },
        message: {
            conversation: "K U R U M I . A I"
        }
    };
    for (let id of mem) {
        await sleep(1000);
        await ann.sendMessage(id, { text }, { quoted: fakeQuoted }).catch(e => {
            console.log(`❌ Gagal kirim ke ${id}:`, e);
        });
    }
    await m.reply(`✅ Semua pesan udah dikirim ke *${mem.length}* member.`);
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = true;
handler.onlyAdmin = false;
handler.BotAdmin = false;
