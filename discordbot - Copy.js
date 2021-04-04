const config = require("./config.json");
const Discord = require("discord.js");
const db = require("quick.db");
const fs = require("fs");
const { exec } = require("child_process");

const client = new Discord.Client();

//////////////////////////// Commands Loading /////////////////////////////////////

client.admin_commands = new Discord.Collection();
client.user_commands = new Discord.Collection();

const admin_files = fs.readdirSync("./commands/admin/").filter((file) => file.endsWith(".js"));
const user_files = fs.readdirSync("./commands/user/").filter((file) => file.endsWith(".js"));

for (const file of admin_files) {
  const command = require(`./commands/admin/${file}`);
  client.admin_commands.set(command.name, command);
}
for (const file of user_files) {
  const command = require(`./commands/user/${file}`);
  client.user_commands.set(command.name, command);
}

///////////////////////////////////////////////////////////////////////////////////
client.on_air = false;

let dispatcher;
let message_embed = new Discord.MessageEmbed();

client.configs = config;

console.log(client.configs.prefix);

//const { prefix, token, voiceChannelId, textChannelId, serverId, botID, url, manager_role, lista_ep } = config; //Information loaded from config

var size = 0;
var oldsize = 0;
var zero_point;
var cur_ep_name;

client.on("ready", () => {
  client.video_db = new db.table("video_db");
  client.viewer_db = new db.table("viewer_db");
  client.stats_db = new db.table("stats_db");
  console.log("I am ready!");
});

/*********************************************
 * Event Listener:
 *
 * Trigger: Message sent;
 * Parameters: The message object;
 *
 * Effect: Evaluates if the message starts with the prefix, if it was sent by a member with a specific role;
 * Outcomes: ${prefix}views - Sends message back to sender telling the total number of views;
 *           ${prefix}reset - Resets views back to 0;
 *           ${prefix}prefix ## - Changes the prefix to ##;
 *
 * *******************************************/
client.on("message", async (message) => {
  //Checks if message is from another bot, if it doesn't starts with the prefix and if its from a user with the manager_role

  if (message.author.bot || !message.content.startsWith(prefix)) return;
  console.log(message.content);
  if (
    (message.content == `${prefix}skip` ||
      message.content == `${prefix}next` ||
      message.content == `${prefix}prox` ||
      message.content == `${prefix}proximo` ||
      message.content == `${prefix}próximo` ||
      message.content == `${prefix}próx`) &&
    message.member.voice.channelID != voiceChannelId
  ) {
    message.channel.send(`${message.author} Tens de estar dentro da sala das NEECTalks para dar skip.`);
    return;
  }
  //Splits the message into args
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  const text_channel = message.guild.channels.cache.get(textChannelId);

  if (command == "skip" && message.member.voice.channelID == voiceChannelId) {
    if (args.length > 0) {
      if (args[0] == "last" || args[0] == "ultimo" || args[0] == "último") {
        last();
        return;
      }
      if (!isNaN(args[0])) {
        skippy_n(args[0]);
        return;
      }
      message.channel.send("O comando tem de ser do tipo: N!skip 'vazio'/número/last");
      list();
      return;
    }
    skippy();
    return;
  } else if (command == "list" || command == "lista") {
    list();
    return;
  } else if (command == "prox" || command == "próx" || command == "proximo" || command == "próximo" || command == "next") {
    next();
    return;
  } else if (command == "info") {
    info();
    return;
  } else if (command == "help") {
    message.channel.send({
      embed: {
        color: 0x1e94d3,
        title: "NEECTalks Bot Help Page",
        description: "Ahh I see you are looking for some guidance",
        fields: [
          {
            name: "Alguns comandos são:",
            value: "-------------------------------------------",
          },
          {
            name: `${prefix}list // ${prefix}lista`,
            value: `Mostra a lista de episódios disponíveis.`,
          },
          {
            name: `${prefix}next`,
            value: `Toca o próximo episódio.`,
          },
          {
            name: `${prefix}skip`,
            value: `Exemplos:\n\`${prefix}skip\`: Skip aleatório;\n\`${prefix}skip last\`: Skip para o último episódio;\n\`${prefix}skip 1\`: Skip para o episódio 1;`,
          },
          {
            name: `${prefix}help`,
            value: `Mostra esta mensagem`,
          },
          {
            name: `${prefix}info`,
            value: `Mostra mais informações do episódio que tiver a tocar neste momento`,
          },
        ],
      },
    });
  }

  if (!message.member.roles.cache.get(manager_role)) return;

  //Checks if the command is one of these 3
  if (command == "prefix") {
    config.prefix = args[0]; //Sets the new prefix in the JSON object loaded in the start of the code
    fs.writeFile(config_name, JSON.stringify(config, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new prefix
      if (err) return console.log(err);
      console.log(JSON.stringify(config));
      console.log("writing to " + config_name);
    });
    prefix = args[0]; //Changes the prefix of the variable that has the old prefix
    message.channel.send(`**Prefixo alterado com sucesso. Novo Prefixo: ${args[0]}**`); //Send's message confirming the change of the prefix
  } else if (command == "vc_id") {
    config.voiceChannelId = args[0]; //Sets the new voice channel ID in the JSON object loaded in the start of the code
    fs.writeFile(config_name, JSON.stringify(config, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new ID
      if (err) return console.log(err);
      console.log(JSON.stringify(config));
      console.log("writing to " + config_name);
    });
    voiceChannelId = args[0]; //Changes the voice channel ID of the variable that has the old ID
    message.channel.send(`**ID do voice channel alterado com sucesso. Novo ID: ${args[0]}**`); //Send's message confirming the change of the ID
  } else if (command == "text_id") {
    config.textChannelId = args[0]; //Sets the new text channel ID in the JSON object loaded in the start of the code
    fs.writeFile(config_name, JSON.stringify(config, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new ID
      if (err) return console.log(err);
      console.log(JSON.stringify(config));
      console.log("writing to " + config_name);
    });
    textChannelId = args[0]; //Changes the text channel ID of the variable that has the old ID
    message.channel.send(`**ID do text channel alterado com sucesso. Novo ID: ${args[0]}**`); //Send's message confirming the change of the ID
  } else if (command == "serv_id") {
    config.serverlId = args[0]; //Sets the new text channel ID in the JSON object loaded in the start of the code
    fs.writeFile(config_name, JSON.stringify(config, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new ID
      if (err) return console.log(err);
      console.log(JSON.stringify(config));
      console.log("writing to " + config_name);
    });
    serverId = args[0]; //Changes the text channel ID of the variable that has the old ID
    //Gets current name of the viewer text channel and splits the number from the name
    channel_name = client.guilds.cache.get(serverId).channels.cache.get(textChannelId).name.split("-");
    //Getting the current number (this only occures when bot comes online)
    view_number = channel_name[2];
    console.log(channel_name, view_number);
    message.channel.send(`**ID do Server alterado com sucesso. Novo ID: ${args[0]}**`); //Send's message confirming the change of the ID
  } else if (command == "stats") {
    parse(args, message);
    return;
  } else if (command == "finish") {
    request_stats(args, message);
  } else if (command == `help`) {
    message.channel.send({
      embed: {
        color: 0x1e94d3,
        title: "Help para os Neecos",
        description: "Ahh I see you are looking for some guidance",
        fields: [
          {
            name: `${prefix}prefix`,
            value: `Este comando define um novo prefixo passado como argumento.\n\`\`\`Exemplo: ${prefix}prefix ##\n Neste caso o novo prefixo passaria a ser ##\`\`\``,
          },
          {
            name: `${prefix}vc_id`,
            value: `Este comando define um novo id, para o voice channel, passado como argumento.\n\`\`\`Exemplo: ${prefix}vc_id 123456789987654321\n Neste caso o novo id passaria a ser 123456789987654321\`\`\``,
          },
          {
            name: `${prefix}text_id`,
            value: `Este comando define um novo id, para o text channel, passado como argumento.\n\`\`\`Exemplo: ${prefix}text_id 123456789987654321\n Neste caso o novo id passaria a ser 123456789987654321\`\`\``,
          },
          {
            name: `${prefix}serv_id`,
            value: `Este comando define um novo id, para o server, passado como argumento. ATENÇÂO este comando tem de ser executado apenas depois de mudar o id do textChannel\n\`\`\`Exemplo: ${prefix}serv_id 123456789987654321\n Neste caso o novo id passaria a ser 123456789987654321\`\`\``,
          },
          {
            name: `${prefix}stats`,
            value: `Este comando retorna as estatísticas avanças de um episodio das NEECTalks especificado como argumento do commando. \n\`\`\`Exemplo: ${prefix}stats NEECTalk1.txt\n Neste caso o episódio a ser analisádo seria NEECTalk1.txt\`\`\``,
          },
          {
            name: `${prefix}${prefix}help`,
            value: `Este comando mostra esta mensagem`,
          },
        ],
      },
    });
  }
});

client.login(token);

client.on("voiceStateUpdate", (oldmember, newmember) => {
  let voice_channelId = voiceChannelId;

  if (
    oldmember.channel == voice_channelId &&
    (newmember.channel != oldmember.channel || newmember.channel == null || newmember.channel == undefined) &&
    size != 0
  ) {
    var user_id = oldmember.id;
    oldsize = size;
    size = size - 1;

    if (user_id === botID) {
      on_air = false;
      return;
    }

    var current_time = Date.now();
    viewer_db.set(`${user_id}.exit_time`, current_time);
    var entry_time = viewer_db.get(`${user_id}.entry_time`);

    total_time = current_time - entry_time; //(mills)
    total_time = total_time / 1000 / 60;
    viewer_db.add(`${user_id}.total`, total_time);

    var a = 1;
    while (stats_db.get(`${user_id}.${a}.exit_time`) != null) {
      a++;
    }
    stats_db.set(`${user_id}.${a}.exit_time`, current_time - zero_point);
  }

  if (newmember.channel == voice_channelId && (oldmember.channel != newmember.channel || oldmember.channel == null || oldmember.channel == undefined)) {
    var user_id = oldmember.id;
    oldsize = size;
    size = size + 1;

    if (user_id === botID) {
      zero_point = Date.now();
      return;
    }

    var current_time = Date.now();
    console.log(current_time);
    viewer_db.set(`${user_id}.entry_time`, current_time);

    if (stats_db.get(`${user_id}`) === null) {
      if (zero_point === undefined) {
        stats_db.set(`${user_id}.1.entry_time`, 0);
      } else {
        stats_db.set(`${user_id}.1.entry_time`, current_time - zero_point);
      }
    } else {
      var a = 1;
      while (stats_db.get(`${user_id}.${a}`) != null) {
        a++;
      }
      console.log(current_time, zero_point, current_time - zero_point);
      stats_db.set(`${user_id}.${a}.entry_time`, current_time - zero_point);
    }
  }

  if (size == 1 && oldsize == 0) {
    var user_id = oldmember.id;
    var current_time = Date.now();
    console.log(current_time);
    viewer_db.set(`${user_id}.entry_time`, current_time);

    client.guilds.cache
      .get(serverId)
      .channels.cache.get(voiceChannelId)
      .join()
      .then((connection) => {
        console.log("Successfully connected.");
        on_air = true;
        song = url[Math.floor(Math.random() * config.url.length)];
        viewer_db.set(`${user_id}.tag`, song);
        console.log("now playing " + song);
        var name = song.split("/");
        var name_size = name.length;
        var name_no_ext = name[name_size - 1].slice(0, -4);
        var episode_name = video_db.get(`${name_no_ext}.name`);
        cur_ep_name = name_no_ext;
        message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(`Para mais informações podes sempre enviar ${prefix}info`);
        client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
        dispatcher = connection.play(song);
        dispatcher.on("finish", (end) => {
          on_air = false;
          add_db();
          next();
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }
  if (oldsize == 2 && size == 1) {
    client.guilds.cache.get(serverId).channels.cache.get(voiceChannelId).leave();
    zero_point = undefined;
    add_db();
  }
  console.log("size: " + size);
});

function info() {
  if (on_air) {
    var episode_name = video_db.get(`${cur_ep_name}.name`);
    var episode_desc = video_db.get(`${cur_ep_name}.description`);
    message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(episode_desc);
    client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
  } else {
    message_embed.setTitle("É preciso estar a dar um episódio para saberes mais informações");
    client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
  }
}

function add_db() {
  var data_viewers = viewer_db.all();
  var data_stats = stats_db.all();
  var size_viewers = data_viewers.length;
  var size_stats = data_stats.length;
  var a = 0,
    b = 0,
    c = 0,
    acess = 0,
    size = 0,
    tempos,
    values;
  var name = song.split("/");
  var name_size = name.length;
  var name_no_ext = name[name_size - 1].slice(0, -4);
  var episode_time = video_db.get(`${name_no_ext}.lenght`);
  let date_obj = new Date();
  var day = date_obj.getDate();
  var month = date_obj.getMonth() + 1;
  var year = date_obj.getFullYear();

  console.log(name_no_ext, `Date: ${day}/${month}/${year}`);

  console.log(data_stats);
  for (b = 0; b < size_stats; b++) {
    acess += Object.keys(data_stats[b].data).length;
  }

  fs.appendFile(`${name_no_ext}.txt`, `ID ${acess} ${day}/${month}/${year} ${episode_time * 60}\n`, (err) => {
    if (err) console.log(err);
  });
  for (b = 0; b < size_stats; b++) {
    console.log(data_stats[b]);
    size = Object.keys(data_stats[b].data).length;
    tempos = Object.values(data_stats[b].data);
    for (c = 0; c < size; c++) {
      values = Object.values(tempos[c]);
      console.log(values);
      if (~~(values[1] / 1000) == 0) {
        fs.appendFile(`${name_no_ext}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${episode_time * 60}\n`, (err) => {
          if (err) console.log(err);
        });
      } else {
        fs.appendFile(`${name_no_ext}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${~~(values[1] / 1000)}\n`, (err) => {
          if (err) console.log(err);
        });
      }
    }

    stats_db.delete(`${data_stats[b].ID}`);
  }
  fs.appendFile(`${name_no_ext}.txt`, `\n`, (err) => {
    if (err) console.log(err);
  });

  fs.appendFile(`./${name_no_ext}/${month}-${year}.txt`, `ID ${acess} ${day}/${month}/${year} ${episode_time * 60}\n`, (err) => {
    if (err) console.log(err);
  });
  for (b = 0; b < size_stats; b++) {
    console.log(data_stats[b]);
    size = Object.keys(data_stats[b].data).length;
    tempos = Object.values(data_stats[b].data);
    for (c = 0; c < size; c++) {
      values = Object.values(tempos[c]);
      console.log(values);
      if (~~(values[1] / 1000) == 0) {
        fs.appendFile(`./${name_no_ext}/${month}-${year}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${episode_time * 60}\n`, (err) => {
          if (err) console.log(err);
        });
      } else {
        fs.appendFile(`./${name_no_ext}/${month}-${year}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${~~(values[1] / 1000)}\n`, (err) => {
          if (err) console.log(err);
        });
      }
    }
  }
  fs.appendFile(`./${name_no_ext}/${month}-${year}.txt`, `\n`, (err) => {
    if (err) console.log(err);
  });

  for (a = 0; a < size_viewers; a++) {
    console.log(data_viewers[a]);
    if (data_viewers[a].data.total > episode_time / 10) {
      video_db.add(`${name_no_ext}.views`, 1);
    }
    viewer_db.delete(`${data_viewers[a].ID}`);
  }
}

function parse(args, message) {
  if (args[0].split(/[0-9]/)[0] != "NEECTalk" || !args[0].endsWith(".txt")) {
    message.channel.send(`Nome incorreto, nome tem de ser do tipo NEECTalkX.txt sendo X o número do episódio`);
    return;
  }

  try {
    if (!fs.existsSync(args[0])) {
      console.log("No file");
      message.channel.send(`${message.author} Something went wrong (#822), maybe the file doesn't exist. Check for typos`);
      return;
    }
  } catch (err) {
    console.error(err);
  }

  exec(`./botParser ${args[0]}`, (error, stdout, stderr) => {
    if (error) {
      message.channel.send(`${message.author} Something went wrong (#245), maybe the file doesn't exist. Check for typos`);
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      message.channel.send(`${message.author} Something went wrong (#387), maybe the file doesn't exist. Check for typos`);
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    if (stdout == "No such file") {
      console.log("No file");
      message.channel.send(`${message.author} Something went wrong (#875), maybe the file doesn't exist. Check for typos`);
      return;
    }
  });
  message.channel.send("Processing...");
  setTimeout(request_stats, 10000, args, message);
}

function request_stats(args, message) {
  fs.readFile(`${args[0]}.csv`, "utf8", function (err, data) {
    if (err) {
      var old_values = [
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
        "0",
      ];
      var old_size = old_values.length;
    } else {
      console.log(data);
      var old_values = data.split(",");
      var old_size = old_values.length;
    }

    fs.writeFile(
      `Output.csv`,
      `Total:,30,60,90,120,150,180,210,240,270,300,330,360,390,420,450,480,510,540,570,600,630,660,690,720,750,780,810,840,870,900,930,960,990,1020,1050,1080,1110,1140,1170,1200,1230,1260,1290,1320,1350,1380,1410,1440,1470,1500,1530,1560,1590,1620,1650,1680,1710,1740,1770,1800,1830,1860,1890,1920,1950,1980,2010,2040,2070,2100,2130,2160,2190,2220,2250,2280,2310,2340,2370,2400,2430,2460,2490,2520,2550,2580,2610,2640,2670,2700,2730,2760,2790,2820,2850,2880,2910,2940,2970,3000\n`,
      (err) => {
        if (err) console.log(err);
      }
    );

    fs.readFile("parsed.csv", "utf8", function (err, raw_data) {
      if (err) {
        message.channel.send(`${message.author} Something went wrong (#679)`);
        return console.log(err);
      }
      console.log(raw_data);
      var lines = raw_data.split("\n");
      var line_lenght = lines.length;
      var number_people;
      for (a = 0; a < line_lenght; a++) {
        var new_values = lines[a].split(",");
        var new_size = new_values.length;

        //number_people = number_people + parseInt(new_values[0], 10);
        //console.log(new_values[0], parseInt(new_values[0], 10), number_people);
        for (b = 0; b < new_size - 1; b++) {
          old_values[b] = parseInt(old_values[b], 10) + parseInt(new_values[b], 10);
        }
      }
      //console.log(number_people, old_values[0]);
      //old_values[0] = parseInt(old_values[0], 10) + number_people;
      fs.appendFile(`Output.csv`, `${old_values.join(",")}\n`, (err) => {
        if (err) console.log(err);
      });
      fs.writeFile(`${args[0]}.csv`, `${old_values.join(",")}\n`, "utf8", function (err) {
        if (err) return console.log(err);
      });
      /*for(i=1; i<old_size; i++){
        old_values[i] = (old_values[i]/old_values[0]*100);
      }
      fs.appendFile( `Output.csv`, `${old_values.join(',')}\n`,(err) => {if(err) console.log(err);});${args[0]}*/
      console.log("Aqui");
      const attachment = new Discord.MessageAttachment("./Output.csv");
      message.channel.send(message.author, attachment);
    });
  });
  exec(`rm  ${args[0]}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
}

function skippy() {
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

  dispatcher.destroy();
  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .join()
    .then((connection) => {
      console.log("Successfully connected.");
      on_air = true;
      song = url[Math.floor(Math.random() * config.url.length)];
      console.log("now playing " + song);
      var name = song.split("/");
      var name_size = name.length;
      var name_no_ext = name[name_size - 1].slice(0, -4);
      var episode_name = video_db.get(`${name_no_ext}.name`);
      var episode_desc = video_db.get(`${name_no_ext}.description`);
      cur_ep_name = name_no_ext;
      message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(`Para mais informações podes sempre enviar ${prefix}info`);
      client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
      dispatcher = connection.play(song);
      dispatcher.on("finish", (end) => {
        on_air = false;
        add_db();
        next();
      });
    })
    .catch((e) => {
      console.error(e);
    });

  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .members.forEach(function (member) {
      if (member.id == botID) return;
      var user_id = member.id;
      var current_time = Date.now();
      zero_point = current_time;

      console.log(current_time);
      viewer_db.set(`${user_id}.entry_time`, current_time);

      if (stats_db.get(`${user_id}`) === null) {
        if (zero_point === undefined) {
          stats_db.set(`${user_id}.1.entry_time`, 0);
        } else {
          stats_db.set(`${user_id}.1.entry_time`, current_time - zero_point);
        }
      } else {
        var a = 1;
        while (stats_db.get(`${user_id}.${a}`) != null) {
          a++;
        }
        console.log(current_time, zero_point, current_time - zero_point);
        stats_db.set(`${user_id}.${a}.entry_time`, current_time - zero_point);
      }
    });
}

function skippy_n(command) {
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

  dispatcher.destroy();
  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .join()
    .then((connection) => {
      on_air = true;
      console.log("Successfully connected.");
      if (url.length < command || command < 0) {
        client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send("O número do episódio não é válido");
        list();
        return;
      }
      song = url[command - 1];
      console.log("now playing " + song);
      var name = song.split("/");
      var name_size = name.length;
      var name_no_ext = name[name_size - 1].slice(0, -4);
      var episode_name = video_db.get(`${name_no_ext}.name`);
      var episode_desc = video_db.get(`${name_no_ext}.description`);
      cur_ep_name = name_no_ext;
      message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(`Para mais informações podes sempre enviar ${prefix}info`);
      client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
      dispatcher = connection.play(song);
      dispatcher.on("finish", (end) => {
        on_air = false;
        add_db();
        next();
      });
    })
    .catch((e) => {
      console.error(e);
    });

  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .members.forEach(function (member) {
      if (member.id == botID) return;
      var user_id = member.id;
      var current_time = Date.now();
      zero_point = current_time;

      console.log(current_time);
      viewer_db.set(`${user_id}.entry_time`, current_time);

      if (stats_db.get(`${user_id}`) === null) {
        if (zero_point === undefined) {
          stats_db.set(`${user_id}.1.entry_time`, 0);
        } else {
          stats_db.set(`${user_id}.1.entry_time`, current_time - zero_point);
        }
      } else {
        var a = 1;
        while (stats_db.get(`${user_id}.${a}`) != null) {
          a++;
        }
        console.log(current_time, zero_point, current_time - zero_point);
        stats_db.set(`${user_id}.${a}.entry_time`, current_time - zero_point);
      }
    });
}

function last() {
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

  dispatcher.destroy();
  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .join()
    .then((connection) => {
      on_air = true;
      console.log("Successfully connected.");
      song = url[url.length - 1];
      console.log("now playing " + song);
      var name = song.split("/");
      var name_size = name.length;
      var name_no_ext = name[name_size - 1].slice(0, -4);
      var episode_name = video_db.get(`${name_no_ext}.name`);
      var episode_desc = video_db.get(`${name_no_ext}.description`);
      cur_ep_name = name_no_ext;
      message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(`Para mais informações podes sempre enviar ${prefix}info`);
      client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
      dispatcher = connection.play(song);
      dispatcher.on("finish", (end) => {
        on_air = false;
        add_db();
        next();
      });
    })
    .catch((e) => {
      console.error(e);
    });

  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .members.forEach(function (member) {
      if (member.id == botID) return;
      var user_id = member.id;
      var current_time = Date.now();
      zero_point = current_time;

      console.log(current_time);
      viewer_db.set(`${user_id}.entry_time`, current_time);

      if (stats_db.get(`${user_id}`) === null) {
        if (zero_point === undefined) {
          stats_db.set(`${user_id}.1.entry_time`, 0);
        } else {
          stats_db.set(`${user_id}.1.entry_time`, current_time - zero_point);
        }
      } else {
        var a = 1;
        while (stats_db.get(`${user_id}.${a}`) != null) {
          a++;
        }
        console.log(current_time, zero_point, current_time - zero_point);
        stats_db.set(`${user_id}.${a}.entry_time`, current_time - zero_point);
      }
    });
}

function next() {
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

  dispatcher.destroy();
  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .join()
    .then((connection) => {
      on_air = true;
      console.log("Successfully connected.");
      cur_ep_name = cur_ep_name.slice(-1);
      if (url.length == cur_ep_name) {
        cur_ep_name = 0;
      }
      song = url[cur_ep_name];
      console.log("now playing " + song);
      var name = song.split("/");
      var name_size = name.length;
      var name_no_ext = name[name_size - 1].slice(0, -4);
      var episode_name = video_db.get(`${name_no_ext}.name`);
      var episode_desc = video_db.get(`${name_no_ext}.description`);
      cur_ep_name = name_no_ext;
      message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(`Para mais informações podes sempre enviar ${prefix}info`);
      client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
      dispatcher = connection.play(song);
      dispatcher.on("finish", (end) => {
        on_air = false;
        add_db();
        next();
      });
    })
    .catch((e) => {
      console.error(e);
    });

  client.guilds.cache
    .get(serverId)
    .channels.cache.get(voiceChannelId)
    .members.forEach(function (member) {
      if (member.id == botID) return;
      var user_id = member.id;
      var current_time = Date.now();
      zero_point = current_time;

      console.log(current_time);
      viewer_db.set(`${user_id}.entry_time`, current_time);

      if (stats_db.get(`${user_id}`) === null) {
        if (zero_point === undefined) {
          stats_db.set(`${user_id}.1.entry_time`, 0);
        } else {
          stats_db.set(`${user_id}.1.entry_time`, current_time - zero_point);
        }
      } else {
        var a = 1;
        while (stats_db.get(`${user_id}.${a}`) != null) {
          a++;
        }
        console.log(current_time, zero_point, current_time - zero_point);
        stats_db.set(`${user_id}.${a}.entry_time`, current_time - zero_point);
      }
    });
}

function list() {
  var size_lista = lista_ep.length;
  var content = "";
  var barraN = "\n";
  var numero;
  for (a = 0; a < size_lista; a++) {
    numero = `**#${a + 1} - **`;
    content = content.concat(numero, lista_ep[a], "\n\n");
    console.log(lista_ep[a]);
  }
  console.log(content);
  message_embed.setTitle("Lista de Episódios - NEECTalks").setColor(0x1e94d3).setDescription(content);
  client.guilds.cache.get(serverId).channels.cache.get(textChannelId).send(message_embed);
}
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
} /*
        console.log("Aqui");
        const attachment = new Discord.MessageAttachment("./Output_NEECTalk${a}.csv");
        message.channel.send("<@&705078660838719498>", attachment);
      });
    });
    exec(`rm  NEECTalk${a}.txt`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
    });
  }
}*/


        /*for(i=1; i<old_size; i++){
          old_values[i] = (old_values[i]/old_values[0]*100);
        }
        fs.appendFile( `Output.csv`, `${old_values.join(',')}\n`,(err) => {if(err) console.log(err);});${args[0]}*/
