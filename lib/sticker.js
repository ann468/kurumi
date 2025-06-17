import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type"; // ✅ Tambahan penting!
import crypto from "crypto";
import fs from "fs";
import webpmux from "node-webpmux";
import { ffmpeg } from "./converter.js";

const { Image } = webpmux;

export async function toWebpSticker(imgBuffer, ext = "jpg") {
    return await ffmpeg(
        imgBuffer,
        [
            "-vf",
            "scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease," +
                "format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1",
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

export async function convertToSticker(
    input,
    url = null,
    packname = "Kurumi.AI",
    author = "Xiao Ann"
) {
    let buffer = input;

    if (url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`❌ Failed to fetch: ${res.statusText}`);
        buffer = await res.buffer();
    }

    const fileType = await fileTypeFromBuffer(buffer);
    const ext = fileType?.ext || "jpg";

    const webpBuffer = await toWebpSticker(buffer, ext);
    return await addExif(webpBuffer, packname, author);
}

export async function addExif(
    buffer,
    packname = "Kurumi.AI",
    author = "Xiao Ann"
) {
    const img = new Image();
    const json = {
        "sticker-pack-id": crypto.randomBytes(32).toString("hex"),
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        emojis: ["🔥", "🥵"]
    };

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);

    await img.load(buffer);
    img.exif = exif;

    const tmpPath = `./tmp/${Date.now()}_${crypto
        .randomBytes(4)
        .toString("hex")}.webp`;
    await img.save(tmpPath);
    const result = await fs.promises.readFile(tmpPath);
    await fs.promises.unlink(tmpPath);
    return result;
}
