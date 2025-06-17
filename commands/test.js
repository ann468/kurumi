const handler = async (ann, m) => {
    await m.reply("Aktif Kak!");
};

handler.command = ["test"];
handler.help = ["test - cek koneksi"];
handler.tags = ["info"];

export default handler;
