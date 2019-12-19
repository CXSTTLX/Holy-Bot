exports.run = (_client, message, _args) => {
    const response = "Mira capo no me hagas calentar"
    message.channel.send(response).catch(console.error);
}