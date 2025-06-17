import fs from "fs";

const dbPath = "./database/user.json";

if (!global.db) global.db = {};
if (!global.db.user) {
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync("./database", { recursive: true });
    fs.writeFileSync(dbPath, "[]");
  }
  global.db.user = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
}

export function getUser(id, name = "Unknown") {
  let user = global.db.user.find(u => u.id === id);
  if (!user) {
    user = {
      id,
      name,
      level: 1,
      exp: 0,
      hp: 100,
      maxHp: 100,
      mp: 50,
      atk: 10,
      def: 5,
      gold: 100,
      job: "Novice",
      inventory: [],
      skill: [],
      equipped: { weapon: null, armor: null },
      cooldowns: {}
    };
    global.db.user.push(user);
    saveUser();
  }
  return user;
}

export function updateUserName(id, name) {
  const user = global.db.user.find(u => u.id === id);
  if (user && user.name !== name) {
    user.name = name;
    saveUser();
  }
}

export function saveUser() {
  fs.writeFileSync(dbPath, JSON.stringify(global.db.user, null, 2));
}