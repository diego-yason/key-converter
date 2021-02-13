/*
    feature to do list

    TODO: Make fabricator completer (just find how much is needed left)
*/

const Discord = require("discord.js");
const axios = require("axios");

const client = new Discord.Client();

const { BACKPACK, CURRCOV, DISCORD, STEAM } = require("./keys.json");

// API Functions
async function getCurrency() {
    try {
        return await axios.get("https://backpack.tf/api/IGetCurrencies/v1", {
            params: {
                key: BACKPACK,
            },
        });
    } catch (error) {
        console.log("BP.TF" + error);
    }
}

async function convertToPeso() {
    try {
        return await axios.get("https://free.currconv.com/api/v7/convert", {
            params: {
                apiKey: CURRCOV,
                q: "USD_PHP",
            },
        });
    } catch (error) {
        console.log("Currency Converter" + error);
    }
}

async function information() {
    const bp = await getCurrency();
    const currcov = await convertToPeso();

    return {
        ApiData: {
            Backpack: bp.data,
        },
        value: { // in usd
            metal: hundredths(bp.data.response.currencies.metal.price.value),
            keys: hundredths(bp.data.response.currencies.metal.price.value * bp.data.response.currencies.keys.price.value),
            earbuds: hundredths(bp.data.response.currencies.metal.price.value * bp.data.response.currencies.keys.price.value * bp.data.response.currencies.earbuds.price.value),
            peso: currcov.results.USD_PHP.val,
        },
    };
}

async function search(itemname) {
    try {
        return await axios.get("https://backpack.tf/api/classifieds/search/v1", {
            params: {
                key: BACKPACK,
                intent: "sell",
                item: itemname,
            },
        });
    } catch (error) {
        console.log("BP.TF Search " + error);
    }
}

async function getKillstreak(level) {
    try {
        axios.get("https://backpack.tf/api/classifieds/search/v1", {
            params: {
                key: BACKPACK,
                intent: "sell",
                slot: "primary,melee,secondary",
                killstreak_tier: level, // 1 for normal, 2 for specialized
                craftable: 1,
                quality: 6,
            },
        });
    } catch (error) {
        console.log("BP.TF Search " + error);
    }
}

// Non-API Functions
function hundredths(amount) {
    return ((Math.round(amount * 100)) / 100);
}

// Discord code
client.once("ready", () => {
    console.log("Ready");
});

client.on("message", async message => {
    const { content } = message;

    if (content.startsWith("tf!")) {
        content.slice(0, 3);
        const args = content.trim().split(/ +/);

        switch (args.shift()) {
            case "get":
                const { value } = await information();

                switch (args[0]) {
                    case "ref":
                    case "metal":
                        message.reply(`The current value of 1 refined metal is PHP${hundredths(value.metal * value.peso)}`);
                        break;
                    case "key":
                    case "keys":
                        message.reply(`The current value of 1 Mann Co. Supply Crate Key is PHP${hundredths(value.keys * value.metal * value.peso)}`);
                        break;
                    case "earbuds":
                        message.reply(`The current value of 1 earbud is PHP${hundredths(value.keys * value.metal * value.earbuds * value.peso)}`);
                        break;
                }
                break;
            case "convert":
                break;
            case "!f":
            case "fabricator":
                break;
        }
    }
});

client.login(DISCORD);