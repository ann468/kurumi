export const aliases = ["animehariini"];

export async function handler(ann, m, { args }) {
    const fetch = (await import("node-fetch")).default;

    const hariInput = (args[0] || "").toLowerCase();
    const hariIndo = [
        "minggu",
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu"
    ];
    const hariEng = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];
    const hariMap = Object.fromEntries(hariIndo.map((h, i) => [h, hariEng[i]]));

    let hariIndex;
    if (hariIndo.includes(hariInput)) {
        hariIndex = hariIndo.indexOf(hariInput);
    } else {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const wib = new Date(utc + 3600000 * 7);
        hariIndex = wib.getDay();
    }

    const hariEngTarget = hariEng[hariIndex];
    const hariIndoTarget = hariIndo[hariIndex];

    const url = `https://api.jikan.moe/v4/schedules/${hariEngTarget}`;

    try {
        const res = await fetch(url);
        const json = await res.json();

        if (!json.data || json.data.length === 0) {
            return m.reply(
                `📭 Gak ada anime tayang hari ${capitalize(hariIndoTarget)} ya~`
            );
        }

        const list = json.data.slice(0, 20).map(anime => {
            const title = anime.title;
            const genres = anime.genres?.map(g => g.name).join(", ") || "-";
            return `> ${title}\n* GENRE: ${genres}`;
        });

        const msg = `*_JADWAL ANIME HARI ${hariIndoTarget.toUpperCase()}_*\n\n${list.join(
            "\n"
        )}`;
        return m.reply(msg);
    } catch (e) {
        console.error(`[ERR JIKAN]`, e);
        return m.reply(
            "❌ Gagal ambil data dari Jikan API, coba lagi nanti ya~"
        );
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
