import fs from "fs";

export const aliases = ["sewa", "sewagc"];
export const help = ["sewa <link> <hari> [jam] [menit]"];
export const tags = ["owner"];
export const category = "owner";

export async function handler(ann, m, { args }) {
    if (!m.isOwner) return m.reply("❌ Cuma owner yang bisa nyewa.");

    const [link, dayArg = "0", hourArg = "0", minArg = "0"] = args;
    if (!link || !link.startsWith("https://chat.whatsapp.com/")) {
        return m.reply(
            "⚠️ Format: *.sewa <link> <hari> [jam] [menit]*\nContoh: *.sewa https://chat.whatsapp.com/xxxxx 1 2 30*"
        );
    }

    const code = link.split("/")[3];
    if (!code) return m.reply("❌ Link tidak valid.");

    let groupId;
    try {
        groupId = await ann.groupAcceptInvite(code);
    } catch (e) {
        return m.reply(
            "❌ Gagal join grup.\n" +
            "Kemungkinan:\n" +
            "1. Link salah / tidak aktif.\n" +
            "2. Grup membutuhkan *persetujuan admin*.\n" +
            "3. Bot diblokir atau dibanned oleh WhatsApp."
        );
    }

    // ⛔️ Cek validitas groupId dulu sebelum lanjut
    if (!groupId || typeof groupId !== "string" || !groupId.endsWith("@g.us")) {
        return m.reply(
            "⚠️ Bot telah mengirim permintaan gabung grup.\n" +
            "Namun grup ini mengaktifkan fitur *persetujuan admin*.\n\n" +
            "✅ Silakan minta admin untuk menerima permintaan bot, lalu ulangi perintah *.sewa* setelah bot masuk."
        );
    }

    // ✅ Coba akses metadata buat memastikan bot udah beneran gabung
    try {
        await ann.groupMetadata(groupId);
    } catch (e) {
        return m.reply(
            "⚠️ Bot belum sepenuhnya masuk grup.\n" +
            "Grup ini menggunakan *persetujuan admin*. Tunggu admin menyetujui permintaan.\n" +
            "Setelah bot diterima, jalankan ulang perintah *.sewa*."
        );
    }

    const days = parseInt(dayArg);
    const hours = parseInt(hourArg);
    const minutes = parseInt(minArg);

    if (isNaN(days) || isNaN(hours) || isNaN(minutes)) {
        return m.reply(
            "❌ Format angka tidak valid.\nGunakan: *.sewa <link> <hari> [jam] [menit]*"
        );
    }

    const totalMs =
        days * 24 * 60 * 60 * 1000 +
        hours * 60 * 60 * 1000 +
        minutes * 60 * 1000;

    const expired = Date.now() + totalMs;

    global.db.sewa[groupId] = expired;
    await global.db.save("sewa");

    await ann.sendMessage(groupId, {
        text: `📥 Hallo aku *${global.ann.name}*.  
Bot telah berhasil bergabung ke grup ini atas permintaan penyewa.  
⏳ Durasi layanan: *${days} hari ${hours} jam ${minutes} menit*  
📆 Masa berlaku hingga: *${new Date(expired).toLocaleString()}*  
  
Terima kasih telah menggunakan layanan kami. 🤖`
    });

    return m.reply(
        `✅ Berhasil join grup dan disewa selama:\n` +
        `🗓️ *${days} hari ${hours} jam ${minutes} menit*\n` +
        `📌 Grup: ${groupId}\n` +
        `⏰ Expired: *${new Date(expired).toLocaleString()}*`
    );
}

handler.onlyOwner = true;