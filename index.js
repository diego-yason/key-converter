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
        const PHP = conversion.data.results.USD_PHP.val;

        switch (args[0]) {
            case "ref":
            case "metal":
                const metal = currency.metal
                message.reply(`The current value of refined metal is PHP${Math.round(100*(metal.price.value*PHP))/100}`)
                break;
            case "key":
            case "keys":
                const keys = currency.keys
                break;
            case "earbuds":
                const earbuds = currency.earbuds
                break;
        }
    }

    if (content.startsWith("convert")) {

    }
});

client.login(_KEY);