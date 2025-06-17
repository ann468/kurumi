import "./config/bot.js";
import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    isJidNewsletter
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";

/// UTILS
import question from "./utils/question.js";

import messagesUpsert from "./events/messages.upsert.js";

(async function start(usePairingCode = true) {
    const session = await useMultiFileAuthState("session");
    const ann = makeWASocket({
        version: (await fetchLatestBaileysVersion()).version,
        printQRInTerminal: !usePairingCode,
        auth: session.state,
        logger: pino({ level: "silent" }).child({ level: "silent" }),
        shouldIgnoreJid: jid => isJidNewsletter(jid)
    });
    if (usePairingCode && !ann.user && !ann.authState.creds.registered) {
        if (
            await (async () => {
                return (
                    (
                        await question(
                            "Ingin terhubung menggunakan pairing code? [Y/n]: "
                        )
                    ).toLowerCase() === "n"
                );
            })()
        )
            return start(false);
        const waNumber = (
            await question("Masukkan nomor WhatsApp Anda: +")
        ).replace(/\D/g, "");
        /// VALIDASI wa Number
        if (global.ann.number && global.ann.number !== waNumber) {
            console.log(
                `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan WhatsApp bot ini\x1b[0m\n ->  MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
            );
            return process.exit();
        }
        /// Validasi waNumber dari github
        if (
            typeof global.ann.numbers === "object" &&
            !global.ann.numbers?.includes(waNumber)
        ) {
            console.log(
                `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan WhatsApp bot ini\x1b[0m\n -> SILAHKAN kontollllll SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
            );
            return process.exit();
        }

        const code = await ann.requestPairingCode(waNumber);
        console.log(`\x1b[44;1m\x20PAIRING CODE\x20\x1b[0m\x20${code}`);
    }
    ann.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "close") {
            console.log(lastDisconnect.error);
            const { statusCode, error } = lastDisconnect.error.output.payload;
            if (statusCode === 401 && error === "Unauthorized") {
                await fs.promises.rm("session", {
                    recursive: true,
                    force: true
                });
            }
            return start();
        }
        if (connection === "open") {
            /// VALIDASI wa Number
            if (
                global.ann.number &&
                global.ann.number !== ann.user.id.split(":")[0]
            ) {
                console.log(
                    `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan WhatsApp bot ini\x1b[0m\n -> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
                );
                return process.exit();
            }
            if (
                typeof global.ann.numbers === "object" &&
                !!global.ann.numbers?.find(
                    number => number !== ann.user.id.split(":")[0]
                )
            ) {
                console.log(
                    `\x1b[35;1mNomor ini tidak memiliki akses untuk menggunakan WhatsApp bot ini\x1b[0m\n -> SILAHKAN MEMESAN SCRIPT INI KE ${global.owner.name} WA ${global.owner.number}`
                );
                return process.exit();
            }

            console.log(
                "Berhasil terhubung dengan: " + ann.user.id.split(":")[0]
            );
            setInterval(async () => {
                const now = Date.now();
                for (const groupId in global.db.sewa) {
                    if (global.db.sewa[groupId] < now) {
                        try {
                            await ann.sendMessage(groupId, {
                                text: `⏱️ Masa sewa bot telah *habis*. dan Bot akan keluar dari grup ini.`
                            });

                            await ann.groupLeave(groupId);
                            delete global.db.sewa[groupId];
                            await global.db.save("sewa");

                            console.log(
                                `[AUTO-LEAVE] Keluar dari ${groupId} (expired)`
                            );
                        } catch (err) {
                            console.error(
                                `[AUTO-LEAVE ERROR] ${groupId}:`,
                                err.message
                            );
                        }
                    }
                }
            }, 60 * 1000);
        }
    });
    ann.ev.on("creds.update", session.saveCreds);
    ann.ev.on("messages.upsert", ({ messages }) =>
        messagesUpsert(ann, messages[0])
    );
})();
