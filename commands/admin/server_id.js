const fs = require("fs");
module.exports = {
  name: "server_id",
  description: "Cahnges the server id.",
  execute(message, args, config) {
    var client = message.client;

    config.serverlId = args[0]; //Sets the new text channel ID in the JSON object loaded in the start of the code
    fs.writeFile(client.config_name, JSON.stringify(config, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new ID
      if (err) return console.log(err);
      console.log(JSON.stringify(config));
      console.log("writing to " + client.config_name);
    });

    client.config.serverId = args[0]; //Changes the text channel ID of the variable that has the old ID
    message.channel.send(`**ID do Server alterado com sucesso. Novo ID: ${args[0]}**`); //Send's message confirming the change of the ID
  },
};
