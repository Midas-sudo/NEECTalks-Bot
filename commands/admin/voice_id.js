const fs = require("fs");
module.exports = {
  name: "voice_id",
  description: "Changes the voice channel id.",
  execute(message, args, config) {
    var client = message.client;

    config.voiceChannelId = args[0]; //Sets the new voice channel ID in the JSON object loaded in the start of the code
    fs.writeFile(client.config_name, JSON.stringify(config, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new ID
      if (err) return console.log(err);
      console.log(JSON.stringify(config));
      console.log("writing to " + client.config_name);
    });
    client.config.voiceChannelId = args[0]; //Changes the prefix of the variable that has the old prefix
    message.channel.send(`**ID do voice channel alterado com sucesso. Novo ID: ${args[0]}**`); //Send's message confirming the change of the ID
  },
};
