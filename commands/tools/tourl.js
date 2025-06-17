import axios from "axios";
import FormData from "form-data";

async function uploadToCatbox(buffer, mime = "image/jpeg") {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
        filename: "upload.jpg",
        contentType: mime
    });

    const res = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders()
    });

    return res.data.trim();
}

export async function handler(ann, m) {
    if (!ann.downloadMediaMessage) {
        const { downloadMediaMessage } = await import(
            "@whiskeysockets/baileys"
        );
        ann.downloadMediaMessage = async msg => {
            return await downloadMediaMessage(
                msg,
                "buffer",
                {},
                {
                    logger: ann.logger,
                    reuploadRequest: ann.updateMediaMessage,
                    getAuth: ann.authState?.creds
                }
            );
        };
    }

    const quoted = m.quoted || m;
    const mediaList = [];

    if (
        quoted?.message?.imageMessage ||
        quoted?.message?.videoMessage ||
        quoted?.message?.documentMessage
    ) {
        mediaList.push(quoted);
    } else {
        await m.react("❎");
        await m.reply("❌ Kirim atau reply gambar ya.");
        return ann;
    }

    try {
        await m.react("⏱️");

        for (const media of mediaList) {
            const mime =
                media.message?.imageMessage?.mimetype ||
                media.message?.videoMessage?.mimetype ||
                media.message?.documentMessage?.mimetype ||
                "";

            if (!mime.startsWith("image/") && !mime.startsWith("video/"))
                continue;

            const buffer = await ann.downloadMediaMessage(media);
            const url = await uploadToCatbox(buffer, mime);

            if (url.startsWith("https://")) {
                await m.reply(url);
            } else {
                await m.reply("⚠️ Gagal upload.");
            }
        }

        await m.react("✅");
    } catch (e) {
        console.error("Upload error:", e);
        await m.react("❎");
        await m.reply("❌ Error waktu upload. Coba lagi ya.");
    }

    return ann;
}

