const Discord = require("discord.js");

module.exports = {
  name: "info",
  description: "Gives additional information of the episode playing",
  execute(message, args, video_db) {
    var client = message.client;
    let message_embed = new Discord.MessageEmbed();

    if (client.on_air) {
      console.log(client.utils.cur_ep_name);
      var episode_name = video_db.get(`${client.utils.cur_ep_name}.name`);
      var episode_desc = video_db.get(`${client.utils.cur_ep_name}.description`);
      message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(episode_desc);
      message.channel.send(message_embed);
    } else {
      message_embed.setTitle("É preciso estar a dar um episódio para saberes mais informações");
      message.channel.send(message_embed);
    }
  },
};
