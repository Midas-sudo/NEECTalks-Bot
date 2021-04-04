const Discord = require("discord.js");

module.exports = {
  name: "list",
  description: "Gives a list of episodes",
  execute(message, args) {
    var client = message.client;
    let message_embed = new Discord.MessageEmbed();

    var size_lista = client.episodes.lista_ep.length;
    var content = "";
    var barraN = "\n";
    var numero;
    for (a = 0; a < size_lista; a++) {
      numero = `**#${a + 1} - **`;
      content = content.concat(numero, client.episodes.lista_ep[a], "\n\n");
      console.log(client.episodes.lista_ep[a]);
    }
    console.log(content);
    message_embed.setTitle("Lista de Episódios - NEECTalks").setColor(0x1e94d3).setDescription(content);
    message.channel.send(message_embed);
  },
};
