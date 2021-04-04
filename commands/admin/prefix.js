const fs = require("fs");
module.exports = {
  name: "prefix",
  description: "Changes the prefix of the bot",
  execute(message, args, config) {
    var client = message.client;

    config.prefix = args[0]; //Sets the new prefix in the JSON object loaded in the start of the code
    fs.writeFile(client.config_name, JSON.stringify(config, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new prefix
      if (err) return console.log(err);
      console.log(JSON.stringify(config));
      console.log("writing to " + client.config_name);
    });
    client.config.prefix = args[0]; //Changes the prefix of the variable that has the old prefix
    message.channel.send(`**Prefixo alterado com sucesso. Novo Prefixo: ${args[0]}**`); //Send's message confirming the change of the prefix
  },
};
