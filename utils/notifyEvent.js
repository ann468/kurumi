import moment from "moment-timezone";
moment.locale("id");
import chalk from "chalk";

export default function notifyEvent(ev, body, type) {
    const bgColor =
        type !== "error" ? chalk.white.bold.bgBlueBright : chalk.bold.bgRed;
    const time = moment
        .tz("Asia/Jakarta")
        .format("dddd, DD, MMMM, YYYY - HH:mm:ss");
    console.log(`
${bgColor(` ${global.ann.name} `)} | ${time}
${bgColor(` ${ev} `)}
${typeof body !== "string" ? JSON.stringify(body) : String(body)}
`);
}