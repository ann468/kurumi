export default {
    aliases: ["ngecek"],
    tags: ["info"],
    category: "utility",
    help: ["ping", "latency", "delay"],
    async handler(ann, m) {
        await m.reply("🏓 cek default mode!");
    }
};
