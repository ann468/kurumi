import "../config/bot.js";
import {
    isJidGroup,
    isJidUser,
    isJidStatusBroadcast,
    isJidNewsletter,
    jidDecode,
    jidNormalizedUser,
    getContentType,
    downloadMediaMessage,
    jidEncode
} from "@whiskeysockets/baileys";
import fs from "fs";
import notifyEvent from "../utils/notifyEvent.js";
import baileys from "@whiskeysockets/baileys";
import { toAudio, toPTT, toVideo, ffmpeg } from "../lib/converter.js";
import { uploadToCatbox } from "../lib/uploader.js";

export const getDefaultBody = () => `©${global.ann.name}`;
const { proto } = baileys;

export default async function messageUpsert(ann, m) {
    try {
        const now = Math.floor(Date.now() / 1000);
        const messageTime = m.messageTimestamp;
        if (now - messageTime > 10) return;
        if (!m.message) return;
        if (
            (!m.mentionedJid || m.mentionedJid.length === 0) &&
            m.message?.extendedTextMessage?.contextInfo?.mentionedJid
        ) {
            m.mentionedJid =
                m.message.extendedTextMessage.contextInfo.mentionedJid;
        }
        m.id = m.key.id;
        m.chat = m.key.remoteJid;
        m.isGroup = isJidGroup(m.chat);
        m.isPrivate = isJidUser(m.chat);
        m.isStory = isJidStatusBroadcast(m.chat);
        m.isNewsletter = isJidNewsletter(m.chat);
        m.sender = m.isNewsletter
            ? ""
            : m.isGroup || m.isStory
            ? m.key.participant || jidNormalizedUser(m.participant)
            : m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isOwner =
            !!global.db.owner.find(o => o.id === m.sender) ||
            jidDecode(m.sender)?.user === global?.owner?.number;
        m.isPremium = !!global.db.premium.find(
            user => jidEncode(user, "s.whatsapp.net") === m.sender
        );
        m.isNsfw = !!global.db.nsfw[m.chat];
        m.type = getContentType(m.message);
        m.body =
            m.type === "conversation"
                ? m.message.conversation
                : m.message[m.type].caption ||
                  m.message[m.type].text ||
                  m.message[m.type].singleSelectReply?.selectedRowId ||
                  m.message[m.type].selectedButtonId ||
                  (m.message[m.type].nativeFlowResponseMessage?.paramsJson
                      ? JSON.parse(
                            m.message[m.type].nativeFlowResponseMessage
                                .paramsJson
                        ).id
                      : "") ||
                  "";
        m.text =
            m.type === "conversation"
                ? m.message.conversation
                : m.message[m.type].caption ||
                  m.message[m.type].text ||
                  m.message[m.type].description ||
                  m.message[m.type].title ||
                  m.message[m.type].contentText ||
                  m.message[m.type].selectedDisplayText ||
                  "";
        ann.downloadMediaMessage = async message => {
            try {
                return await downloadMediaMessage(
                    message,
                    "buffer",
                    {},
                    {
                        logger: ann.logger,
                        reuploadRequest: ann.updateMediaMessage,
                        getAuth: ann.authState.creds
                    }
                );
            } catch (err) {
                console.error("❌ Error saat download media:", err);
                return null;
            }
        };

        if (!proto?.WebMessageInfo) {
            console.error(
                "❌ proto.WebMessageInfo undefined. Cek versi baileys lo!"
            );
            process.exit(1);
        }

        // Buat handler quoted
        const quotedMsg = m.message?.extendedTextMessage?.contextInfo;
        if (quotedMsg?.quotedMessage) {
            const isFromMe =
                jidNormalizedUser(quotedMsg.participant) ===
                jidNormalizedUser(ann.user.id);

            m.quoted = proto.WebMessageInfo.fromObject({
                key: {
                    remoteJid: m.chat,
                    fromMe: isFromMe,
                    id: quotedMsg.stanzaId,
                    participant: quotedMsg.participant
                },
                message: quotedMsg.quotedMessage
            });

            m.quoted.id = quotedMsg.stanzaId;
            m.quoted.chat = m.chat;
            m.quoted.sender = quotedMsg.participant;
            m.quoted.fromMe = isFromMe;

            const qmsg = m.quoted.message || {};
            m.quoted.text =
                qmsg?.conversation ||
                qmsg?.extendedTextMessage?.text ||
                qmsg?.imageMessage?.caption ||
                qmsg?.videoMessage?.caption ||
                "";

            m.quoted.mentionedJid = quotedMsg.mentionedJid || [];

            m.quoted.delete = () =>
                ann.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        fromMe: m.quoted.fromMe,
                        id: m.quoted.id,
                        participant: m.quoted.sender
                    }
                });
        } else {
            m.quoted = null;
        }
        m.isCommand = m.body.trim().startsWith(global.ann.prefix);
        m.cmd = m.body
            .trim()
            .normalize("NFKC")
            .replace(global.ann.prefix, "")
            .split(" ")[0]
            .toLowerCase();
        const argString = m.body
            .trim()
            .replace(/^\S*\b/, "")
            .trim();
        m.args = argString.includes(global.ann.splitArgs)
            ? argString
                  .split(global.ann.splitArgs)
                  .map(arg => arg.trim().normalize("NFKC"))
                  .filter(arg => arg)
            : argString
                  .split(/\s+/)
                  .map(arg => arg.trim().normalize("NFKC"))
                  .filter(arg => arg);
        m.reply = text =>
            ann.sendMessage(
                m.chat,
                {
                    text,
                    mentions: [m.sender]
                },
                {
                    quoted: {
                        key: {
                            id: m.id,
                            fromMe: false,
                            remoteJid: "status@broadcast",
                            participant: "0@s.whatsapp.net"
                        },
                        message: {
                            conversation: `💬 ${m.text}`
                        }
                    }
                }
            );
        m.thumbReply = (
            text,
            {
                title,
                body = `©${global?.ann?.name || "kurumiAI"}`,
                thumbnail = null,
                sourceUrl = "",
                mentions = []
            } = {}
        ) => {
            return ann.sendMessage(
                m.chat,
                {
                    text,
                    contextInfo: {
                        mentionedJid: mentions,
                        externalAdReply: {
                            title,
                            body,
                            thumbnail:
                                thumbnail ||
                                fs.readFileSync("./media/thumb/thumb.jpg"),
                            mediaType: 1,
                            renderLargerThumbnail: false,
                            showAdAttribution: true,
                            sourceUrl
                        }
                    }
                },
                {
                    quoted: {
                        key: {
                            id: m.id,
                            fromMe: false,
                            remoteJid: "status@broadcast",
                            participant: "0@s.whatsapp.net"
                        },
                        message: {
                            conversation: `💬 ${m.text}`
                        }
                    }
                }
            );
        };
        m.react = async emoji => {
            try {
                await ann.sendMessage(m.chat, {
                    react: {
                        text: emoji,
                        key: m.key
                    }
                });
            } catch (e) {
                console.error("❌ Gagal kirim react:", e);
            }
        };
        try {
            notifyEvent(
                "Message Upsert",
                `
Dari: ${m.sender}
Nama: ${m.pushName || "No Name"}
Pesan: ${m.text}
`.trim()
            );
            if (m.isGroup) {
                const metadata = await ann.groupMetadata(m.chat);
                const participant = metadata.participants.find(
                    p => p.id === m.sender
                );
                m.isAdmin =
                    participant?.admin?.toLowerCase() === "admin" ||
                    participant?.admin?.toLowerCase() === "superadmin";
                const normalizeJid = jid =>
                    jid?.split("@")[0]?.split(":")[0] + "@s.whatsapp.net";
                const botId = normalizeJid(ann.user.id);
                const botParticipant = metadata.participants.find(
                    p => normalizeJid(p.id) === botId
                );
                m.isBotAdmin = Boolean(
                    botParticipant &&
                        ["admin", "superadmin"].includes(
                            botParticipant.admin?.toLowerCase()
                        )
                );
            }
            for await (let command of global.ann.commands) {
                if (
                    (command.command === m.cmd ||
                        (command.aliases || []).includes(m.cmd)) &&
                    command.handler
                ) {
                    // ❌ Private-only command, blokir kalau di grup
                    if (command.handler["private"] === true && m.isGroup) {
                        return m.thumbReply(
                            "Perintah ini hanya bisa digunakan di chat *Private*",
                            {
                                title: "AKSES DITOLAK"
                            }
                        );
                    }
                    // ❌ Group-only command, blokir kalau di private
                    if (command.handler.onlyGroup === true && !m.isGroup) {
                        return m.thumbReply(
                            "Perintah ini hanya bisa digunakan di dalam *Grup*",
                            {
                                title: "AKSES DITOLAK"
                            }
                        );
                    }
                    // ❌ Hanya owner
                    if (
                        command.handler["onlyOwner"] === true &&
                        !m.isOwner &&
                        !m.fromMe
                    ) {
                        return m.thumbReply(
                            "Perintah ini hanya bisa digunakan oleh *Owner*",
                            {
                                title: "AKSES DITOLAK"
                            }
                        );
                    }
                    // ❌ Hanya user premium
                    if (
                        command.handler["onlyPremium"] &&
                        !m.isOwner &&
                        !m.fromMe &&
                        !m.isPremium
                    ) {
                        return m.thumbReply(
                            "Perintah ini hanya bisa digunakan oleh *User Premium*",
                            {
                                title: "AKSES DITOLAK"
                            }
                        );
                    }
                    // ❌ Hanya admin grup
                    if (command.handler.onlyAdmin && !m.isAdmin) {
                        return m.thumbReply(
                            "Perintah ini hanya bisa digunakan oleh *Admin Grup*",
                            {
                                title: "AKSES DITOLAK"
                            }
                        );
                    }
                    // ❌ Bot harus adminn isBotAdmin
                    if (command.handler.botAdmin && !m.isBotAdmin) {
                        return m.thumbReply(
                            `${global.ann.name} harus menjadi admin untuk menjalankan perintah ini.`,
                            {
                                title: "AKSES DITOLAK"
                            }
                        );
                    }

                    // ✅ Command lolos semua pengecekan
                    console.log(`\x1b[44;1m\x20COMMAND\x20\x1b[0m\x20${m.cmd}`);
                    await command.handler(ann, m, { args: m.args });
                    return;
                }
            }
            switch (m.cmd) {
                case "menu-case":
                    {
                        m.reply("menu Case");
                    }
                    break;
                default:
                    break;
            }
        } catch (err) {
            notifyEvent(
                "Message Upsert",
                `
Dari: ${m.sender}
Nama: ${m.pushName || "No Name"}
Pesan: ${m.text}
Error: ${err.message}
`.trim(),
                "error"
            );
            console.log(err);
            m.reply(`*ERROR:* ${err.message}`);
        }
    } catch (err) {
        console.log(err);
    }
}
