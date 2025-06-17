export function handler(ann, m) {
    console.log(m);
    m.reply("Ini sebuah perintah restart");
    return ann;
}

handler.private = false;
handler.onlyOwner = true;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;