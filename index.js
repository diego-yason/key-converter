const https = require("https");
const Discord = require("discord.js");

const client = new Discord.Client();

const { _KEY } = require("./keys.json");

client.once("ready", () => {
    console.log("ready");
})

client.on("message", message => {
    const { content } = message;

    if (content.startsWith("convert")) {
        const args = content.trim().split(/[ ]+/);
        args.shift()
        
        https.get({
            hostname: "https://backpack.tf",
            path: "",
        }, currencyDetails => {
            
        })
    }
});

client.login(_KEY);