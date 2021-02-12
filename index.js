const Discord = require("discord.js");
const axios = require("axios");

const client = new Discord.Client();

const { BACKPACK, CURRCOV, _KEY } = require("./keys.json");

async function getCurrency() {
    try {
        return await axios.get("https://backpack.tf/api/IGetCurrencies/v1", {
            params: {
                key: BACKPACK.KEY
            }
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
                q: "USD_PHP"
            }
        })
    } catch (error) {
        console.log("Currency Converter" + error);
    }
}

function hundredths(amount) {
    return ((Math.round(amount*100))/100);
}

client.once("ready", () => {
    console.log("Ready");
});

client.on("message", async message => {
    const { content } = message

    const args = content.trim().split(/ +/);
    args.shift();

    if (content.startsWith("get")) {
        const backpack = await getCurrency();
        const conversion = await convertToPeso();

        if (!backpack || !conversion) {
            message.reply("One of the APIs failed. Can't get currencies.")
            return;
        }

        const currency = backpack.data.response.currencies;
        const keys = currency.keys.price.value;
        const metal = currency.metal.price.value;
        const earbuds = currency.earbuds.price.value;
        const PHP = conversion.data.results.USD_PHP.val;

        switch (args[0]) {
            case "ref":
            case "metal":
                message.reply(`The current value of 1 refined metal is PHP${hundredths(metal*PHP)}`);
                break;
            case "key":
            case "keys":
                message.reply(`The current value of 1 Mann Co. Supply Crate Key is PHP${hundredths(keys*metal*PHP)}`);
                break;
            case "earbuds":
                message.reply(`The current value of 1 earbud is PHP${hundredths(keys*metal*earbuds*PHP)}`);
                break;
        }
    }

    if (content.startsWith("convert")) {

    }
});

client.login(_KEY);