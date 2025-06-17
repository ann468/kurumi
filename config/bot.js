import fs from "fs";
import path from "path";
import axios from "axios";

var repoDATAWANumber =
    "https://github.com/ann468/datawa/blob/main/numbers.json";
var rawDATAWANumber = repoDATAWANumber
    .replace("https://github", "https://raw.githubusercontent")
    .replace("/blob/", "/");

const pkg = JSON.parse(fs.readFileSync("package.json"));

global.ann = {
    name: "kurumi.AI",
    number: "",
    numbers: repoDATAWANumber ? (await axios.get(rawDATAWANumber)).data : null,
    version: pkg["version"],
    prefix: ".",
    splitArgs: "|",
    locale: "id",
    timezone: "Asia/Jakarta",
    adsUrl: "https://tiktok.com/@annturu22",
    newsletterJid: "",commands: await (async () => {
    const commands = [];
    const commandsPath = path.join(process.cwd(), "commands");

    const files = fs
        .readdirSync(commandsPath, { recursive: true })
        .filter(file => file.endsWith(".js"));

    for await (let file of files) {
        const filePath = path.join(commandsPath, file);
        const mod = await import(filePath);

        // Ambil default export atau named export
        const fileCont = mod?.default || mod;

        // Ambil handler function
        const handlerFn = fileCont?.handler || fileCont;
        if (typeof handlerFn !== "function") {
            console.log(`⚠️  ${file} tidak punya handler function.`);
            continue;
        }

        // Ambil nama file sebagai main command
        const mainCommand = path.basename(filePath).replace(".js", "").toLowerCase();

        // Validasi & ambil aliases
        const rawAliases =
            fileCont.command ||
            handlerFn.command ||
            fileCont.aliases ||
            handlerFn.aliases ||
            [];

        const aliases = Array.isArray(rawAliases)
            ? rawAliases.map(a => a.toLowerCase())
            : [String(rawAliases).toLowerCase()];

        // Ambil kategori dari folder /commands/<category>/<command>.js
        const category = path
            .relative(commandsPath, path.dirname(filePath))
            .split(path.sep)[0] || "uncategorized";

        // Validasi help & tags
        const help = Array.isArray(fileCont.help || handlerFn.help)
            ? (fileCont.help || handlerFn.help)
            : [];

        const tags = Array.isArray(fileCont.tags || handlerFn.tags)
            ? (fileCont.tags || handlerFn.tags)
            : [];

        // Deteksi duplikat nama
        const allNames = [mainCommand, ...aliases];
        for (let cmdName of allNames) {
            const dup = commands.find(c =>
                [c.command, ...(c.aliases || [])].includes(cmdName)
            );
            if (dup) {
                console.error(`❌ Duplikat command terdeteksi: "${cmdName}"\n`);
                console.error(`📁 File pertama: ${dup.filePath}`);
                console.error(`📁 File kedua  : ${filePath}\n`);
                console.error("🚫 Mohon ubah alias/command agar tidak bentrok.");
                process.exit(1);
            }
        }

        // Push command ke list
        commands.push({
            command: mainCommand,
            aliases,
            handler: handlerFn,
            help,
            tags,
            category,
            filePath
        });
    }

    return commands;
})(),
    
    setting: JSON.parse(fs.readFileSync("./config/setting.json")),
    saveSetting: function () {
        fs.writeFileSync(
            "./config/setting.json",
            JSON.stringify(global.ann.setting)
        );
        return global.ann.setting;
    }
};

global.owner = {
    name: "Xiao Ann",
    number: ""
};

const ensureDBFile = (filePath, defaultData) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
        console.log(`📁 File baru dibuat: ${filePath}`);
    }
    return JSON.parse(fs.readFileSync(filePath));
};

global.db = {
    user: ensureDBFile("./database/user.json", []),
    premium: ensureDBFile("./database/premium.json", []),
    group: ensureDBFile("./database/group.json", []),
    owner: ensureDBFile("./database/owner.json", []),
    nsfw: ensureDBFile("./database/nsfw.json", {}),
    sewa: ensureDBFile("./database/sewa.json", {}),
    save: async function (dbName) {
        fs.writeFileSync(
            `./database/${dbName.toLowerCase()}.json`,
            JSON.stringify(global.db[dbName.toLowerCase()])
        );
        return global.db[dbName.toLowerCase()];
    }
};
