import fetch from "node-fetch";
import FormData from "form-data";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
export const aliases = ["hd", "hdr"]

export async function handler(ann, m) {
    // Reaction helper
    const react = async emoji => {
        try {
            if (typeof m.react === "function") await m.react(emoji);
        } catch {}
    };

    await react("⏳");

    try {
        // Manual quoted detection fallback
        if (!m.quoted) {
            const quotedMsg = m.message?.extendedTextMessage?.contextInfo;
            if (quotedMsg?.quotedMessage) {
                const proto = await import("@whiskeysockets/baileys/WAProto/index.js");
                const { jidNormalizedUser } = await import("@whiskeysockets/baileys");

                m.quoted = proto.WebMessageInfo.fromObject({
                    key: {
                        remoteJid: m.chat,
                        fromMe: jidNormalizedUser(quotedMsg.participant) === jidNormalizedUser(ann.user.id),
                        id: quotedMsg.stanzaId,
                        participant: quotedMsg.participant,
                    },
                    message: quotedMsg.quotedMessage,
                });

                m.quoted.id = quotedMsg.stanzaId;
                m.quoted.chat = m.chat;
                m.quoted.sender = quotedMsg.participant;
                m.quoted.fromMe = jidNormalizedUser(m.quoted.sender) === jidNormalizedUser(ann.user.id);
                m.quoted.text =
                    m.quoted.message?.conversation ||
                    m.quoted.message?.extendedTextMessage?.text ||
                    m.quoted.message?.imageMessage?.caption ||
                    m.quoted.message?.videoMessage?.caption ||
                    "";
                m.quoted.mentionedJid = quotedMsg.mentionedJid || [];

                m.quoted.delete = () =>
                    ann.sendMessage(m.chat, {
                        delete: {
                            remoteJid: m.chat,
                            fromMe: m.quoted.fromMe,
                            id: m.quoted.id,
                            participant: m.quoted.sender,
                        },
                    });
            }
        }

        // Fallback ann.downloadMediaMessage
        if (!ann.downloadMediaMessage) {
            ann.downloadMediaMessage = async message => {
                return await downloadMediaMessage(message, "buffer", {}, {
                    logger: ann.logger,
                    reuploadRequest: ann.updateMediaMessage,
                    getAuth: ann.authState?.creds,
                });
            };
        }

        const q = m.quoted || m;
        if (!q || typeof q !== "object") throw "📷 Kirim atau balas gambar terlebih dahulu.";

        const msg =
            q.message?.imageMessage ||
            q.msg?.imageMessage ||
            Object.values(q.message || {})[0];

        if (!msg || typeof msg !== "object" || !msg.mimetype)
            throw "📷 Kirim atau balas gambar terlebih dahulu.";

        const mime = msg.mimetype || "";
        if (typeof mime !== "string" || !/image\/(jpe?g|png)/.test(mime))
            throw `Format *${mime}* gak didukung, bro.`;

        const img = await ann.downloadMediaMessage(q);
        if (!img) throw "Gagal mengunduh gambar.";

        // Dynamic file extension
        const ext = mime.split("/")[1];
        const imageUrl = await uploadToCatbox(img, ext);
        console.log("✅ Image uploaded:", imageUrl);

        const api = `https://zenz.biz.id/tools/remini?url=${encodeURIComponent(imageUrl)}`;
        const res = await fetch(api);
        if (!res.ok) throw "API error nih bro.";

        const json = await res.json();
        console.log("✅ API JSON:", json);

        if (!json.status || !json.result?.result_url) {
            console.error("❌ JSON Invalid:", json);
            throw "Response API gak valid.";
        }

        const arrayBuffer = await fetch(json.result.result_url).then(v => v.arrayBuffer());
        const buffer = Buffer.from(arrayBuffer);

        // Optional: Limit size (example: 4MB)
        if (buffer.length > 4 * 1024 * 1024)
            throw "Ukuran hasil terlalu besar buat dikirim, bro.";

        await ann.sendMessage(m.chat, {
            image: buffer,
            caption: "*Done Kak (⁠≧⁠▽⁠≦⁠)*"
        }, { quoted: m });

        await react("✅");
    } catch (e) {
        console.error("❌ ERROR:", e);
        await react("❌");
        await m.reply(typeof e === "string" ? e : "Error nih bro, coba lagi nanti.");
    }

    return ann;
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;

async function uploadToCatbox(buffer, ext = "jpg") {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, `image.${ext}`);

    const res = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: form
    });

    const url = await res.text();
    if (!url.startsWith("https://")) throw "Error pas upload ke Catbox.";
    return url.trim();
}