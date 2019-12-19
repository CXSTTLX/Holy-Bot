const Discord = require("discord.js");
const Enmap = require("enmap");
const file = require("fs");

const client = new Discord.Client();
const config = require("./config.json");
client.config = config;
client.commands = new Enmap();

file.readdir(`./${config.routes.EVENTS}/`, (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./${config.routes.EVENTS}/${file}`);
    const eventName = file.split(config.separator).shift();
    client.on(eventName, event.bind(null, client));
  });
});

file.readdir(`./${config.routes.COMMANDS}/`, (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(config.file)) return;
    const props = require(`./${config.routes.COMMANDS}/${file}`);
    const commandName = file.split(config.separator).shift();
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

client.login(config.token);