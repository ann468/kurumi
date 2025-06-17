import { spawn } from "child_process";

(function start() {
    const ann = spawn(process.argv0, ["bot.js", ...process.argv.slice(2)], {
        stdio: ["inherit", "inherit", "inherit", "ipc"]
    });
    ann.on("message", msg => {
        if (msg === "restart") {
            ann.kill();
            ann.once("close", start);
        }
    })
        .on("exit", code => {
            if (code) start();
        })
        .on("error", console.log);
})();
