import { writeFileSync } from "fs";
import path from "path";
import { randomBytes } from "crypto";

export async function createExif(packname, author) {
    const json = {
        "sticker-pack-id": "com.kurumi.exif",
        "sticker-pack-name": packname,
        "sticker-pack-publisher": author,
        emojis: ["🔥", "💖"]
    };

    const exifAttr = Buffer.from(JSON.stringify(json), "utf8");
    const exifHeader = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00
    ]);
    const exifBody = Buffer.concat([exifHeader, exifAttr]);

    const filename = path.join(
        "/data/data/com.termux/files/home/kurumi/media/cache",
        randomBytes(6).toString("hex") + ".exif"
    );
    writeFileSync(filename, exifBody);
    return filename;
}
