const Discord = require("discord.js");
require("quick.db");

module.exports = {
  name: "next",
  description: "Skips to the next episode.",
  execute(client, stats_db, viewer_db, video_db) {
    let message_embed = new Discord.MessageEmbed();

    var data_viewers = viewer_db.all();
    var data_stats = stats_db.all();
    var size_viewers = data_viewers.length;
    var size_stats = data_stats.length;

    for (a = 0; a < size_viewers; a++) {
      viewer_db.delete(`${data_viewers[a].ID}`);
    }
    for (b = 0; b < size_stats; b++) {
      stats_db.delete(`${data_stats[b].ID}`);
    }

    client.dispatcher.destroy();
    client.guilds.cache
      .get(client.config.serverId)
      .channels.cache.get(client.config.voiceChannelId)
      .join()
      .then((connection) => {
        client.on_air = true;
        console.log("Successfully connected.");
        client.cur_ep_name = client.cur_ep_name.slice(-1);
        if (client.episodes.url.length == client.cur_ep_name) {
          client.cur_ep_name = 0;
        }
        song = client.episodes.url[client.cur_ep_name];
        console.log("now playing " + song);
        var name = song.split("/");
        var name_size = name.length;
        var name_no_ext = name[name_size - 1].slice(0, -4);
        var episode_name = video_db.get(`${name_no_ext}.name`);
        client.cur_ep_name = name_no_ext;
        message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(`Para mais informações podes sempre enviar ${client.config.prefix}info`);
        client.guilds.cache.get(client.config.serverId).channels.cache.get(client.config.textChannelId).send(message_embed);
        client.dispatcher = connection.play(song);
        client.dispatcher.on("finish", (end) => {
          client.on_air = false;
          client.internal_commands.get("add_db").execute(client, stats_db, viewer_db);
          client.user_commands.get("next").execute(client, stats_db, viewer_db, video_db);
        });
      })
      .catch((e) => {
        console.error(e);
      });

    client.guilds.cache
      .get(client.config.serverId)
      .channels.cache.get(client.config.voiceChannelId)
      .members.forEach(function (member) {
        if (member.id == client.config.botID) return;
        var user_id = member.id;
        var current_time = Date.now();
        client.utils.zero_point = current_time;

        console.log(current_time);
        viewer_db.set(`${user_id}.entry_time`, current_time);

        if (stats_db.get(`${user_id}`) === null) {
          if (client.utils.zero_point === undefined) {
            stats_db.set(`${user_id}.1.entry_time`, 0);
          } else {
            stats_db.set(`${user_id}.1.entry_time`, current_time - client.utils.zero_point);
          }
        } else {
          var a = 1;
          while (stats_db.get(`${user_id}.${a}`) != null) {
            a++;
          }
          console.log(current_time, client.utils.zero_point, current_time - client.utils.zero_point);
          stats_db.set(`${user_id}.${a}.entry_time`, current_time - client.utils.zero_point);
        }
      });
  },
};
