/*
    feature to do list

    TODO: Make fabricator completer (just find how much is needed left)
    TODO: Integrate Mongo for user id storage
*/

const Discord = require("discord.js");
const axios = require("axios");

const client = new Discord.Client();

const { BACKPACK, CURRCOV, DISCORD, STEAM, KINGMARINE } = require("./keys.json");

// API Functions
// Backpack API
async function getCurrency() {
    await axios.get("https://backpack.tf/api/IGetCurrencies/v1", {
        params: {
            key: BACKPACK,
        },
    })
    .then(response => {
        return response;
    })
    .catch(err => {
        // TODO: error handling
    });
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
    await axios.get("https://backpack.tf/api/classifieds/search/v1", {
        params: {
            key: BACKPACK,
            intent: "sell",
            item: itemname,
        },
    })
    .then(response => {
        return response;
    })
    .catch(err => {
        // TODO: error handling
    });
}

async function getKillstreak(level) {
    axios.get("https://backpack.tf/api/classifieds/search/v1", {
        params: {
            key: BACKPACK,
            intent: "sell",
            slot: "primary,melee,secondary",
            killstreak_tier: level, // 1 for normal, 2 for specialized
            craftable: 1,
            quality: 6,
        },
    })
    .then(response => {
        return response;
    })
    .catch(err => {
        // TODO: error handling
    });
}

// CurrencyConverter API
async function convertToPeso() {
    await axios.get("https://free.currconv.com/api/v7/convert", {
        params: {
            apiKey: CURRCOV,
            q: "USD_PHP",
        },
    })
    .then(response => {
        return response;
    })
    .catch(err => {
        // TODO: error handling
    });
}

// Steam API

async function getPlayerInventory(message, userid) {
    await axios.get("http://api.steampowered.com/IEconItems_440/GetPlayerItems/v0001/", {
        params: {
            steamid: userid,
            key: STEAM,
        },
    })
    .then(response => {
        const data = response.result;

        switch (data.status) {
            case "1":
                return response;
            case "15":
                message.reply("Your backpack is private, I cannot access your items. If you recently changed settings");
        }
      })
    .catch(err => {
        if (err.response) {
            switch (err.response.status) {
                case "400":
                    message.reply("Error 400. Have you added your SteamID using `tf!userid`?");
                    break;
                case "429":
                    message.reply("Error 429. Too many API requests made recently. Please wait.");
                    break;
                case "500":
                case "503":
                    message.reply(`Error ${err.response.status}. Try again later.`);
                    break;
            }
        } else if (err.request) {

        } else {
            message.reply(`Unknown Error: Calling <@${KINGMARINE}>!`);
        }
    });
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
    const { content, author } = message;

    if (content.startsWith("tf!")) {
        content.slice(0, 3);
        const args = content.trim().split(/ +/);

        const { value } = await information();

        switch (args.shift()) {
            case "get":

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
                // TODO: For now the bot will assume it's me who making the request add in mongodb and stuff
                const items = await getPlayerInventory(message, "76561198346478322");
                break;
            case "complete":
                break;
        }
    }
});

client.login(DISCORD);