import Jimp from "jimp";
import { writeFileSync, unlinkSync } from "fs";

export const aliases = ["setppgc", "setppgrup"];

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
        image.resize(640, 640);
        const path = `./tmp-ppgc-${Date.now()}.jpg`;
        await image.quality(80).writeAsync(path);

        await ann.updateProfilePicture(m.chat, { url: path });
        unlinkSync(path);

        await m.react("✅");
        await m.reply("✅ Foto profil grup berhasil diganti, boss!");
    } catch (e) {
        console.error("❌ Error setppgc:", e);
        await m.react("❎");
        await m.reply("❌ Gagal ganti foto profil grup. Coba lagi ya.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = true;
handler.onlyAdmin = true;
handler.BotAdmin = true;
