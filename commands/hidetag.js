export const aliases = ["h", "ht"];

export async function handler(ann, m) {
    console.log(m);
    m.text =
        m.type === "conversation"
            ? m.message.conversation
            : m.message[m.type]?.caption ||
              m.message[m.type]?.text ||
              m.message[m.type]?.description ||
              m.message[m.type]?.title ||
              m.message[m.type]?.contentText ||
              m.message[m.type]?.selectedDisplayText ||
              "";

    let teks = m.text.trim().split(/ +/).slice(1).join(" ");
    if (!teks) teks = "";

    await m.react("⏱️");

    try {
        const metadata = await ann.groupMetadata(m.chat);
        const participants = metadata.participants
            .filter(p => !p.isBot)
            .map(p => p.id);

        const quoted = m.quoted;

        // Handle /kosong/ tanpa reply
        if (!quoted && teks.toLowerCase() === "/kosong/") {
            await ann.sendMessage(
                m.chat,
                { text: "", mentions: participants },
                { quoted: m }
            );
            await m.react("✅");
            return;
        }

        if (quoted && quoted.message) {
            const mediaType = Object.keys(quoted.message)[0];
            const supportedMedia = [
                "imageMessage",
                "videoMessage",
                "audioMessage",
                "stickerMessage"
            ];

            // Kalau media didukung, proses kirim ulang
            if (supportedMedia.includes(mediaType)) {
                const mediaBuffer = await ann.downloadMediaMessage(quoted);
                await ann.sendMessage(
                    m.chat,
                    {
                        [mediaType.replace("Message", "")]: mediaBuffer,
                        caption:
                            (mediaType === "imageMessage" ||
                                mediaType === "videoMessage") &&
                            teks.length > 0
                                ? teks
                                : undefined,
                        mimetype:
                            mediaType === "audioMessage"
                                ? quoted.message.audioMessage.mimetype
                                : undefined,
                        mentions: participants
                    },
                    { quoted: m }
                );
            } else {
                // Selain media, anggap aja teks biasa
                const quotedText =
                    quoted.text ||
                    quoted.message?.conversation ||
                    quoted.message?.extendedTextMessage?.text ||
                    quoted.message?.[mediaType]?.text ||
                    quoted.message?.[mediaType]?.caption;

                if (quotedText || teks) {
                    await ann.sendMessage(
                        m.chat,
                        {
                            text: teks.length > 0 ? teks : quotedText,
                            mentions: participants
                        },
                        { quoted: m }
                    );
                } else {
                    await m.react("❎");
                    return m.reply(
                        `❌ Tidak bisa proses media *${mediaType}*!\n\n✅ Coba reply ke:\n- Gambar\n- Video\n- Audio\n- Stiker\n- Teks`
                    );
                }
            }
        } else {
            // Kalau gak reply apa-apa
            await ann.sendMessage(
                m.chat,
                {
                    text: teks,
                    mentions: participants
                },
                { quoted: m }
            );
        }

        await m.react("✅");
    } catch (err) {
        console.error("🔥 ERROR saat kirim media/teks:", err);
        await m.react("❎");
        return m.reply("❌ *ERROR:* Gagal kirim. Coba lagi nanti, bro!");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = true;handler.onlyAdmin = true;
handler.botAdmin = true;

