import axios from "axios";
import fs from "fs";
import path from "path";

export const aliases = ["etts", "eleven", "voiceme"];

export async function handler(ann, m) {
    const apikey = "sk_cd33d45123f1ba67826e5fc448ef317c522cfee9997ee7e4";

    const rawText = m.text || "";
    const prefixAndCommand = rawText.split(" ")[0]; // .tts
    const content = rawText.replace(prefixAndCommand, "").trim();

    if (!content)
        return m.reply(
            "🗣️ Masukin teks dong. Contoh: `.tts bella Aku suka kamu`"
        );

    const [voiceNameRaw, ...textParts] = content.split(" ");
    const message = textParts.join(" ");
    const voiceName = voiceNameRaw?.toLowerCase();

    if (!message)
        return m.reply("⚠️ Format salah. Contoh: `.tts bella Aku suka kamu`");

    const voiceMap = {
        rachel: "21m00Tcm4TlvDq8ikWAM",
        bella: "EXAVITQu4vr4xnSDxMaL",
        antoni: "ErXwobaYiN019PkySvjV",
        elliot: "MF3mGyEYCl7XYWbV9V6O",
        domi: "AZnzlk1XvdvUeBnXmlld",
        doni: "ErXwobaYiN019PkySvjV"
    };

    const voiceId = voiceMap[voiceName] || voiceMap["rachel"];

    // Pastikan folder tmp-nya ada
    const tmpDir = path.resolve("./tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const outputPath = path.join(tmpDir, `voice_${Date.now()}.mp3`);

    try {
        const response = await axios({
            method: "post",
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            headers: {
                "xi-api-key": apikey,
                "Content-Type": "application/json"
            },
            responseType: "stream",
            data: {
                text: message,
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            }
        });

        const writer = fs.createWriteStream(outputPath);

        await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        await ann.sendMessage(
            m.chat,
            {
                audio: { url: outputPath },
                mimetype: "audio/mpeg",
                ptt: true
            },
            { quoted: m }
        );
        fs.unlinkSync(outputPath);
    } catch (err) {
        console.error("❌ TTS Error:", err?.response?.data || err.message);
        m.reply("🚫 Gagal generate suara. Cek API key atau voice_id.");
    }
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
