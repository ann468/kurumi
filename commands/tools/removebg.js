import fetch from "node-fetch";
import FormData from "form-data";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { fileTypeFromBuffer } from "file-type";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export const name = "removebg";
export const aliases = ["nobg"];

export async function handler(ann, m) {
    try {
        let buffer;

        // Cek media dari quoted
        if (m.quoted?.message?.imageMessage) {
            buffer = await downloadMediaMessage(m.quoted, "buffer", {
                reuploadRequest: ann
            });
        }
        else if (m.message?.imageMessage) {
            buffer = await downloadMediaMessage(m, "buffer", {
                reuploadRequest: ann
            });
        }
        else {
            const args = m.text?.trim().split(/\s+/).slice(1);
            if (!args || !args[0] || !/^https?:\/\//i.test(args[0])) {
                return m.reply(
                    "⚠️ Kirim/balas gambar, atau kasih URL gambar setelah command."
                );
            }
            const response = await fetch(args[0]);
            buffer = await response.buffer();
        }
        if (!buffer) return m.reply("❌ Gagal mengambil gambar.");
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", buffer, "image.jpg");
        const catRes = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: form
        });
        const catUrl = await catRes.text();
        if (!catUrl.includes("https://files.catbox.moe/")) {
            return m.reply("❌ Gagal upload ke Catbox.");
        }
        const zenz = await fetch(
            `https://zenz.biz.id/tools/removebg?url=${encodeURIComponent(
                catUrl
            )}`
        );
        const json = await zenz.json();
        if (!json.status || !json.result?.url) {
            return m.reply("❌ Gagal menghapus background.");
        }
        const resultBuffer = await fetch(json.result.url).then(res =>
            res.buffer()
        );
        const type = await fileTypeFromBuffer(resultBuffer);
        const ext = type?.ext || "png";
        const filePath = join("./", `removebg.${ext}`);
        writeFileSync(filePath, resultBuffer);
        await ann.sendMessage(
            m.chat,
            { image: resultBuffer, caption: "✅ Background berhasil dihapus!" },
            { quoted: m }
        );

        unlinkSync(filePath);
    } catch (err) {
        console.error("❌ Error RemoveBG:", err);
        m.reply("❌ Terjadi error saat proses removebg.");
    }
}
