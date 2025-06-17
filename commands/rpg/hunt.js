import { getUser, updateUserName, saveUser } from "../../lib/rpg.js";
import fs from "fs";

export const aliases = ["berburu", "memburu", "buru"];

export async function handler(ann, m) {
    const user = getUser(m.sender, m.pushName || "Unknown");
    updateUserName(m.sender, m.pushName || "Unknown");

    // Setup cooldown
    const now = Date.now();
    const cd = 1000 * 60 * 2; // 2 menit
    user.cooldowns = user.cooldowns || {};
    const remaining = (user.cooldowns.hunt || 0) - now;

    if (remaining > 0) {
        const wait = Math.ceil(remaining / 1000);
        await m.react("❎");
        return m.reply(`⏳ Tunggu ${wait} detik lagi buat berburu.`);
    }

    await m.react("⏱️");

    const monsterList = [
        // Common (30)
        { name: "Skeleton", type: "common" },
        { name: "Zombie", type: "common" },
        { name: "Dire Wolf", type: "common" },
        { name: "Wild Boar", type: "common" },
        { name: "Cave Rat", type: "common" },
        { name: "Swamp Frog", type: "common" },
        { name: "Forest Spider", type: "common" },
        { name: "Mud Golem", type: "common" },
        { name: "Island Sparrow", type: "common" },
        { name: "Marsh Gazelle", type: "common" },
        { name: "Rabid Dog", type: "common" },
        { name: "Cave Lizard", type: "common" },
        { name: "Goblin", type: "common" },
        { name: "Kobold", type: "common" },
        { name: "Bandit", type: "common" },
        { name: "Thief", type: "common" },
        { name: "Orc Grunt", type: "common" },
        { name: "Slime", type: "common" },
        { name: "Bat Swarm", type: "common" },
        { name: "Rat Swarm", type: "common" },
        { name: "Cursed Chicken", type: "common" },
        { name: "Mad Cow", type: "common" },
        { name: "Roadside Thief", type: "common" },
        { name: "Pickpocket", type: "common" },
        { name: "Goblin Scout", type: "common" },
        { name: "Kobold Miner", type: "common" },
        { name: "Angry Crow", type: "common" },
        { name: "Poison Toad", type: "common" },
        { name: "Jungle Snake", type: "common" },
        { name: "Desert Scarab", type: "common" },
        // Uncommon (25)
        { name: "Ghoul", type: "uncommon" },
        { name: "Wraith", type: "uncommon" },
        { name: "Elder Treant", type: "uncommon" },
        { name: "Moss Troll", type: "uncommon" },
        { name: "Spectral Hound", type: "uncommon" },
        { name: "Sand Wraith", type: "uncommon" },
        { name: "Cursed Doll", type: "uncommon" },
        { name: "Bone Hound", type: "uncommon" },
        { name: "Swamp Troll", type: "uncommon" },
        { name: "Ice Imp", type: "uncommon" },
        { name: "Fire Sprite", type: "uncommon" },
        { name: "Shadow Scout", type: "uncommon" },
        { name: "Phantom Archer", type: "uncommon" },
        { name: "Dark Knight", type: "uncommon" },
        { name: "Fallen Priest", type: "uncommon" },
        { name: "Bloodworm", type: "uncommon" },
        { name: "Shambling Mound", type: "uncommon" },
        { name: "Rock Golem", type: "uncommon" },
        { name: "Ghost Knight", type: "uncommon" },
        { name: "Poison Serpent", type: "uncommon" },
        { name: "Forest Nymph", type: "uncommon" },
        { name: "Cave Bear", type: "uncommon" },
        { name: "Razor Boar", type: "uncommon" },
        { name: "Jungle Panther", type: "uncommon" },
        { name: "Frost Wolf", type: "uncommon" },
        // Rare (20)
        { name: "Lich", type: "rare" },
        { name: "Banshee", type: "rare" },
        { name: "Griffin", type: "rare" },
        { name: "Wyvern", type: "rare" },
        { name: "Manticore", type: "rare" },
        { name: "Blood Revenant", type: "rare" },
        { name: "Frost Revenant", type: "rare" },
        { name: "Flame Revenant", type: "rare" },
        { name: "Crystal Golem", type: "rare" },
        { name: "Ancient Hydra", type: "rare" },
        { name: "Storm Serpent", type: "rare" },
        { name: "Hellhound", type: "rare" },
        { name: "Necrotic Beast", type: "rare" },
        { name: "Ember Drake", type: "rare" },
        { name: "Shadow Fiend", type: "rare" },
        { name: "Soul Eater", type: "rare" },
        { name: "Blaze Golem", type: "rare" },
        { name: "Thunder Elemental", type: "rare" },
        { name: "Soul Harvester", type: "rare" },
        { name: "Toxic Revenant", type: "rare" },
        // Epic (15)
        { name: "Phoenix", type: "epic" },
        { name: "Chimera", type: "epic" },
        { name: "Shadow Wraith", type: "epic" },
        { name: "Nether Fiend", type: "epic" },
        { name: "Doom Bringer", type: "epic" },
        { name: "Obsidian Drake", type: "epic" },
        { name: "Iron Behemoth", type: "epic" },
        { name: "Flayer Beast", type: "epic" },
        { name: "Spectral Dragon", type: "epic" },
        { name: "Starcaller", type: "epic" },
        { name: "Celestial Guardian", type: "epic" },
        { name: "Abyssal Kraken", type: "epic" },
        { name: "Storm Giant", type: "epic" },
        { name: "Void Warden", type: "epic" },
        { name: "Eclipse Dragon", type: "epic" },
        // Legendary (7)
        { name: "Necromancer", type: "legendary" },
        { name: "Death Knight", type: "legendary" },
        { name: "Hydra King", type: "legendary" },
        { name: "Kraken Lord", type: "legendary" },
        { name: "Void Lord", type: "legendary" },
        { name: "Archangel", type: "legendary" },
        { name: "Demon Lord", type: "legendary" },
        // Mythic (3)
        { name: "Ancient Dragon", type: "mythic" },
        { name: "Time Devourer", type: "mythic" },
        { name: "World Serpent", type: "mythic" }
    ];
    const lootItems = [
        // Common
        { name: "Potion", type: "common" },
        { name: "Herb", type: "common" },
        { name: "Rusty Sword", type: "common" },
        { name: "Torn Armor", type: "common" },
        { name: "Wind Charm", type: "common" },
        { name: "Healing Salve", type: "common" },
        { name: "Throwing Knife", type: "common" },
        { name: "Berry Pack", type: "common" },
        // Uncommon
        { name: "Silver Ring", type: "uncommon" },
        { name: "Fire Orb", type: "uncommon" },
        { name: "Thunder Crystal", type: "uncommon" },
        { name: "Frost Core", type: "uncommon" },
        { name: "Shadow Dagger", type: "uncommon" },
        { name: "Silver Bracelet", type: "uncommon" },
        { name: "Ice Crystal", type: "uncommon" },
        // Rare
        { name: "Magic Scroll", type: "rare" },
        { name: "Golden Amulet", type: "rare" },
        { name: "Dragon Bone", type: "rare" },
        { name: "Dark Essence", type: "rare" },
        { name: "Ancient Coin", type: "rare" },
        { name: "Scroll of Binding", type: "rare" },
        { name: "Bloodstone", type: "rare" },
        // Epic
        { name: "Phoenix Feather", type: "epic" },
        { name: "Blaze Rod", type: "epic" },
        { name: "Void Crystal", type: "epic" },
        { name: "Mystic Staff", type: "epic" },
        { name: "Enchanted Bow", type: "epic" },
        { name: "Celestial Orb", type: "epic" },
        { name: "Inferno Tome", type: "epic" },
        // Legendary
        { name: "Dragon Scale", type: "legendary" },
        { name: "Crystal Shard", type: "legendary" },
        { name: "Holy Relic", type: "legendary" },
        { name: "Philosopher's Stone", type: "legendary" },
        { name: "Eternal Flame", type: "legendary" },
        // Mythic
        { name: "Time Relic", type: "mythic" },
        { name: "World Tear", type: "mythic" },
        { name: "Genesis Shard", type: "mythic" },
        // Chance fail drop (null)
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ];
    // Pilih monster
    const { name: monsterName, type: monsterType } =
        monsterList[Math.floor(Math.random() * monsterList.length)];
    // Pilih loot
    const possibleLoot = lootItems.filter(
        item => !item || item.type === monsterType || item.type === "common"
    );
    const loot = possibleLoot[Math.floor(Math.random() * possibleLoot.length)];

    const goldEarned = Math.floor(Math.random() * 40 + 10);
    const expEarned = Math.floor(Math.random() * 25 + 5);
    const hpLost = Math.floor(Math.random() * 20 + 5);

    // Update user stats
    user.exp += expEarned;
    user.gold += goldEarned;
    user.hp = Math.max(1, user.hp - hpLost);
    if (loot) user.inventory.push(loot.name);

    if (user.exp >= neededExp) {
        user.exp -= neededExp;
        user.level++;
        user.maxHp += 20;
        user.hp += 30;
        if (user.hp > user.maxHp) user.hp = user.maxHp;
        await m.reply(
            `🔺 Kamu naik ke level ${user.level}!\n❤️ HP max bertambah jadi ${user.maxHp}\n✨ HP kamu juga otomatis regenerasi +30! Saat ini HP kamu ${user.hp}/${user.maxHp}`
        );
    }
    // Set cooldown dan simpan data
    user.cooldowns.hunt = now + cd;
    saveUser();
    // Format hasil battle
    let txt = `🗡️ Kamu melawan *${monsterName}* [${monsterType.toUpperCase()}]!\n`;
    txt += `🏅 EXP: +${expEarned}\n`;
    txt += `💰 Gold: +${goldEarned}\n`;
    txt += `❤️ HP: -${hpLost}\n`;
    txt += loot
        ? `🎁 Loot: *${loot.name}* [${loot.type.toUpperCase()}]\n`
        : `🎁 Loot: Gagal dapat item 😿\n`;

    // Kirim reply pakai thumbnail
    const thumbnailBuffer = fs.readFileSync("./media/thumb/rpg.jpg");
    await m.thumbReply(txt, {
        title: "Hasil Berburu RPG",
        thumbnail: thumbnailBuffer
    });

    await m.react("✅");
}

handler.private = false;
handler.onlyOwner = false;
handler.onlyPremium = false;
handler.onlyGroup = false;
handler.onlyAdmin = false;
handler.BotAdmin = false;
