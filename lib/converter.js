import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Util umum untuk FFmpeg conversion
async function ffmpeg(buffer, args = [], ext = "", ext2 = "") {
    return new Promise(async (resolve, reject) => {
        try {
            const tmpDir = path.join(__dirname, "media/tmp");
            await fs.promises.mkdir(tmpDir, { recursive: true });

            const tmp = path.join(tmpDir, `${Date.now()}.${ext}`);
            const out = `${tmp}.${ext2}`;
            await fs.promises.writeFile(tmp, buffer);

            const proc = spawn("ffmpeg", ["-y", "-i", tmp, ...args, out]);

            proc.on("error", reject);

            proc.on("close", async code => {
                try {
                    await fs.promises.unlink(tmp);
                    if (code !== 0)
                        return reject(
                            new Error(`FFmpeg exited with code ${code}`)
                        );
                    const result = await fs.promises.readFile(out);
                    await fs.promises.unlink(out);
                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}

// 🔊 Convert to WhatsApp Playable Audio
function toAudio(buffer, ext) {
    return ffmpeg(
        buffer,
        ["-vn", "-ac", "2", "-b:a", "128k", "-ar", "44100", "-f", "mp3"],
        ext,
        "mp3"
    );
}

// 🎙️ Convert to WhatsApp PTT (opus)
function toPTT(buffer, ext) {
    return ffmpeg(
        buffer,
        [
            "-vn",
            "-c:a",
            "libopus",
            "-b:a",
            "128k",
            "-vbr",
            "on",
            "-compression_level",
            "10"
        ],
        ext,
        "opus"
    );
}

// 🎞️ Convert to WhatsApp-compatible MP4
function toVideo(buffer, ext) {
    return ffmpeg(
        buffer,
        [
            "-c:v",
            "libx264",
            "-c:a",
            "aac",
            "-ab",
            "128k",
            "-ar",
            "44100",
            "-crf",
            "32",
            "-preset",
            "slow"
        ],
        ext,
        "mp4"
    );
}

// 🖼️ Convert image to WebP sticker (no metadata)
function toStickerImage(buffer, ext = "jpg") {
    return ffmpeg(
        buffer,
        [
            "-vf",
            "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
            "-vcodec",
            "libwebp",
            "-lossless",
            "1",
            "-compression_level",
            "6",
            "-qscale",
            "80",
            "-preset",
            "picture"
        ],
        ext,
        "webp"
    );
}

// 🎥 Convert video to WebP sticker (animated)
function toStickerVideo(buffer, ext = "mp4") {
    return ffmpeg(
        buffer,
        [
            "-vf",
            "scale=512:512:force_original_aspect_ratio=decrease,fps=15",
            "-vcodec",
            "libwebp",
            "-lossless",
            "0",
            "-compression_level",
            "6",
            "-qscale",
            "75",
            "-preset",
            "default",
            "-loop",
            "0",
            "-an",
            "-vsync",
            "0"
        ],
        ext,
        "webp"
    );
}

export { ffmpeg, toAudio, toPTT, toVideo, toStickerImage, toStickerVideo };
