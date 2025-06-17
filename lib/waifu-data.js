import fs from 'fs';
import path from 'path';

const basePath = './media/library';
const waifuFiles = fs.readdirSync(basePath).filter(f => f.endsWith('.txt'));

const allWaifu = waifuFiles.map(file => file.replace('.txt', ''));

// Manual kategori (bisa lo ubah sesuai waifu lo)
const animeList = ["tokisaki_kurumi"];
const mangaList = ["kaede_hitotsuba"];
const donghuaList = allWaifu.filter(
  name => !animeList.includes(name) && !mangaList.includes(name)
);

function getRandomImageFromFile(category, filename) {
  const filePath = path.join(basePath, `${filename}.txt`);
  if (!fs.existsSync(filePath)) return null;

  const lines = fs.readFileSync(filePath, "utf-8")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) return null;
  const randomLine = lines[Math.floor(Math.random() * lines.length)];
  return randomLine;
}

export {
  allWaifu,
  animeList,
  mangaList,
  donghuaList,
  getRandomImageFromFile
};