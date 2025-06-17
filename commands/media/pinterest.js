// plugins/pinterest.js
import fetch from 'node-fetch';
export const aliases = ['pin', 'pinsearch'];

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export async function handler(ann, m, { args }) {
    if (!args || !args.length) {
        return m.reply('📌 Contoh: .pin kurumi 5');
    }

    let count = 5; // default
    // Cek apakah arg terakhir angka jumlah
    const lastArg = args[args.length - 1];
    if (!isNaN(lastArg)) {
        count = Math.min(Math.max(parseInt(lastArg), 1), 10);
        args.pop(); // hapus angka dari query
    }

    const query = args.join(' ');

    try {
        await ann.sendMessage(m.chat, { react: { text: '⏱️', key: m.key } });

        const res = await fetch(`https://api.ownblox.my.id/api/pinterest?q=${encodeURIComponent(query)}`);
        const body = await res.json();

        if (body.status !== 200 || !body.results || !body.results.length) {
            await ann.sendMessage(m.chat, { react: { text: '❎', key: m.key } });
            return m.reply('😕 Gak ada hasilnya nih...');
        }

        // Filter gambar unik
        const uniqueResults = [...new Map(body.results.map(item => [item.image, item])).values()];
        const selected = shuffleArray(uniqueResults).slice(0, count);

        for (const item of selected) {
            await ann.sendMessage(m.chat, { image: { url: item.image } }, { quoted: m });
            await new Promise(res => setTimeout(res, 500));
        }

        await ann.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('Pinterest Error:', e);
        await ann.sendMessage(m.chat, { react: { text: '❎', key: m.key } });
        m.reply('⚠️ Gagal nyari gambar, coba lagi nanti.');
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;