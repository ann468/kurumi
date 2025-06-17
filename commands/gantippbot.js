import Jimp from "jimp";
import { writeFileSync, unlinkSync } from "fs";

export const aliases = ["setpp", "setppbot"];

export async function handler(ann, m) {
    await m.react("⏱️");
    const mediaMessage = m.quoted?.message?.imageMessage
        ? m.quoted
        : m.message?.imageMessage
        ? m
        : null;

    if (!mediaMessage) {
        return m.reply("❌ Kirim atau reply gambar dulu bang.");
    }

    try {
        const media = await ann.downloadMediaMessage(mediaMessage);
        const image = await Jimp.read(media);
        image.resize(640, 640); // Resize sesuai requirement WhatsApp
        const path = "./tmp-pp.jpg";
        await image.quality(80).writeAsync(path);

        await ann.updateProfilePicture(ann.user.id, { url: path });

        unlinkSync(path);

        await m.react("✅");
        await m.reply("✅ Foto profil bot berhasil diganti!");
    } catch (e) {
      await m.react("❎");
        console.error("❌ Error setppbot:", e);
        await m.reply("❌ Gagal ganti foto profil bot. Coba lagi ya, bang.");
    }
}

// Config tambahan
handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
