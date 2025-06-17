import fs from "fs";
import path from "path";

export const name = "getplugin";
export const aliases = ["getcmd"];

export async function handler(ann, m) {
    const args = m.args;
    if (!args[0]) {
        return m.thumbReply(
            "🚫 Kamu harus masukin nama plugin!\n\nContoh: *.getplugin ping*",
            {
                title: "Get Plugin Gagal"
            }
        );
    }

    const pluginName = args[0].toLowerCase().replace(/\.js$/, "");
    const pluginPath = path.resolve(`./commands/${pluginName}.js`);

    if (!fs.existsSync(pluginPath)) {
        return m.thumbReply(
            `❌ Plugin *${pluginName}.js* tidak ditemukan di folder commands.`,
            {
                title: "Plugin Tidak Ada"
            }
        );
    }

    const content = fs.readFileSync(pluginPath, "utf-8");
    const chunks = content.match(/[\s\S]{1,3000}/g) || [];

    for (const chunk of chunks) {
        await m.thumbReply(
            `\`\`\`
/*
Dilarang menyebarkan plugin ke orang lain atau claim plugin!
✦ Plugin Powered by kurumi.AI
✦ WhatsApp Bot by Ann
✦ TikTok: https://tiktok.com/@annturu22
✦ WhatsApp Channel: https://whatsapp.com/channel/0029Vb8kMwn3mFY2OxEOHx07
*/\n
${chunk}
\`\`\``,
            {
                title: `📂 Plugin: ${pluginName}.js`
            }
        );
    }
}

handler.private = true;
handler.onlyOwner = true;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;