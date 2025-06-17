import FormData from "form-data";
import fetch from "node-fetch";

export async function uploadToCatbox(buffer) {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, "image.jpg");

    try {
        const res = await fetch("https://catbox.moe/user/api.php", {
            method: "POST",
            body: form
        });

        const text = await res.text();
        if (text.startsWith("https://")) {
            return { url: text };
        }

        console.error("❌ Catbox upload failed:", text);
        return {};
    } catch (err) {
        console.error("❌ Catbox error:", err);
        return {};
    }
}