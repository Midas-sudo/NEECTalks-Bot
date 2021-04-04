const config = require("./jsons/config.json");
const episodes_list = require("./jsons/episodes_list.json");
const Discord = require("discord.js");
const db = require("quick.db");
const fs = require("fs");
const { exec } = require("child_process");
var readline = require("readline");
var { google } = require("googleapis");
var OAuth2 = google.auth.OAuth2;

const client = new Discord.Client();
let message_embed = new Discord.MessageEmbed();

//////////////////////////// Commands Loading /////////////////////////////////////

client.admin_commands = new Discord.Collection();
client.internal_commands = new Discord.Collection();
client.user_commands = new Discord.Collection();

const admin_files = fs.readdirSync("./commands/admin/").filter((file) => file.endsWith(".js"));
const internal_files = fs.readdirSync("./commands/internal/").filter((file) => file.endsWith(".js"));
const user_files = fs.readdirSync("./commands/user/").filter((file) => file.endsWith(".js"));

for (const file of admin_files) {
  const command = require(`./commands/admin/${file}`);
  client.admin_commands.set(command.name, command);
}
for (const file of internal_files) {
  const command = require(`./commands/internal/${file}`);
  client.internal_commands.set(command.name, command);
}
for (const file of user_files) {
  const command = require(`./commands/user/${file}`);
  client.user_commands.set(command.name, command);
}

////////////////////// Configurations and Episode List ////////////////////////////
client.on_air = false;
client.config = config;
client.episodes = episodes_list;
client.dispatcher = undefined;
client.config_name = "./jsons/config.json";
client.episodes_list_name = "./jsons/episodes_list.json";
client.authicatedApi;

///////////////////////////////// Variables needed ////////////////////////////////

client.utils = { size: 0, oldsize: 0, zero_point: undefined, cur_ep_name: undefined };
var video_db;
var viewer_db;
var stats_db;

client.on("ready", () => {
  video_db = new db.table("video_db");
  viewer_db = new db.table("viewer_db");
  stats_db = new db.table("stats_db");

  //console.log("NEECTalks are online!");
});
/*********************************************
 * Event Listener:
 *
 * Trigger: Message sent;
 * Parameters: The message object;
 *
 * Effect: Evaluates if the message starts with the prefix, if it was sent by a member with a specific role;
 * Outcomes: ${client.config.prefix}views - Sends message back to sender telling the total number of views;
 *           ${client.config.prefix}reset - Resets views back to 0;
 *           ${client.config.prefix}prefix ## - Changes the prefix to ##;
 *
 * *******************************************/
client.on("message", async (message) => {
  //Checks if message is from another bot, if it doesn't starts with the prefix and if its from a user with the manager_role

  if (message.author.bot || !message.content.startsWith(client.config.prefix)) return;

  const args = message.content.slice(client.config.prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command.match(/^(skip)$/)) {
    //Checks if member is in voice channel
    if (message.member.voice.channelID == client.config.voiceChannelId) {
      //Checks if a value was specified else it just skips to the next one
      if (args.length > 0) {
        if (args[0].match(/^(last|ultimo|último)$/)) {
          client.user_commands.get("last").execute(message, args, stats_db, viewer_db, video_db);
          return;
        }
        if (!isNaN(args[0])) {
          client.user_commands.get("skip_n").execute(message, args, stats_db, viewer_db, video_db);
          return;
        }
        message.channel.send("O comando tem de ser do tipo: N!skip 'vazio'/número/last");
        client.user_commands.get("list").execute(message, args);
        return;
      } else {
        client.user_commands.get("next").execute(message, args, stats_db, viewer_db, video_db);
        return;
      }
    } else {
      message.channel.send(`${message.author} Tens de estar dentro da sala das NEECTalks para dar skip.`);
      return;
    }
  } else if (command.match(/^(list|lista)$/)) {
    client.user_commands.get("list").execute(message, args);
    return;
  } else if (command == "prox" || command == "próx" || command == "proximo" || command == "próximo" || command == "next") {
    client.user_commands.get("next").execute(message, args, stats_db, viewer_db, video_db);
    return;
  } else if (command == "info") {
    client.user_commands.get("info").execute(message, args, video_db);
    return;
  } else if (command == "help") {
    client.user_commands.get("help").execute(message, args);
  }

  if (!message.member.roles.cache.get(client.config.manager_role)) return;

  if (command == "prefix") {
    client.admin_commands.get("prefix").execute(message, args, config);
    return;
  } else if (command == "vc_id") {
    client.admin_commands.get("voice_id").execute(message, args, config);
    return;
  } else if (command == "text_id") {
    client.admin_commands.get("text_id").execute(message, args, config);
    return;
  } else if (command == "serv_id") {
    client.admin_commands.get("serv_id").execute(message, args, config);
    return;
  } else if (command == "stats") {
    client.internal_commands.get("parse").execute(message, args, config);
    return;
  } else if (command == `help`) {
    client.admin_commands.get("help").execute(message, args, config);
    return;
  } else if (command == "new_episode") {
    client.admin_commands.get("new_episode").execute(message, args, video_db);
  }
});

client.on("voiceStateUpdate", (oldmember, newmember) => {
  let voice_channelId = client.config.voiceChannelId;

  if (oldmember.channel == voice_channelId && (newmember.channel != oldmember.channel || newmember.channel == null || newmember.channel == undefined) && client.utils.size != 0) {
    var user_id = oldmember.id;
    client.utils.oldsize = client.utils.size;
    client.utils.size = client.utils.size - 1;

    if (user_id === client.config.botID) {
      client.on_air = false;
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
    stats_db.set(`${user_id}.${a}.exit_time`, current_time - client.utils.zero_point);
  }

  if (newmember.channel == voice_channelId && (oldmember.channel != newmember.channel || oldmember.channel == null || oldmember.channel == undefined)) {
    var user_id = oldmember.id;
    client.utils.oldsize = client.utils.size;
    client.utils.size = client.utils.size + 1;

    if (user_id === client.config.botID) {
      client.utils.zero_point = Date.now();
      return;
    }

    var current_time = Date.now();
    console.log(current_time);
    viewer_db.set(`${user_id}.entry_time`, current_time);

    if (stats_db.get(`${user_id}`) === null) {
      if (client.utils.zero_point === undefined) {
        stats_db.set(`${user_id}.1.entry_time`, 0);
        console.log("First");
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
  }

  if (client.utils.size == 1 && client.utils.oldsize == 0) {
    var user_id = oldmember.id;
    var current_time = Date.now();
    console.log(current_time);
    viewer_db.set(`${user_id}.entry_time`, current_time);

    client.guilds.cache
      .get(client.config.serverId)
      .channels.cache.get(client.config.voiceChannelId)
      .join()
      .then((connection) => {
        console.log("Successfully connected.");
        client.on_air = true;
        song = client.episodes.url[Math.floor(Math.random() * client.episodes.url.length)];
        viewer_db.set(`${user_id}.tag`, song);
        console.log("now playing " + song);
        var name = song.split("/");
        var name_size = name.length;
        var name_no_ext = name[name_size - 1].slice(0, -4);
        console.log(name_no_ext);
        var episode_name = video_db.get(`${name_no_ext}.name`);
        client.utils.cur_ep_name = name_no_ext;
        message_embed.setTitle(episode_name).setColor(0x1e94d3).setDescription(`Para mais informações podes sempre enviar ${client.config.prefix}info`);
        client.guilds.cache.get(client.config.serverId).channels.cache.get(client.config.textChannelId).send(message_embed);
        client.dispatcher = connection.play(song);
        client.dispatcher.on("finish", (end) => {
          client.on_air = false;
          console.log(video_db);
          client.internal_commands.get("add_db").execute(client, stats_db, viewer_db, video_db);
          client.user_commands.get("next").execute(client, stats_db, viewer_db, video_db);
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }
  if (client.utils.oldsize == 2 && client.utils.size == 1) {
    client.guilds.cache.get(client.config.serverId).channels.cache.get(client.config.voiceChannelId).leave();
    client.utils.zero_point = undefined;
    client.internal_commands.get("add_db").execute(client, stats_db, viewer_db, video_db);
  }
  console.log("size: " + client.utils.size);
});

client.login(client.config.token);

/*********************************************
 *
 * Google API for Youtube Scrappying:
 *
 * *******************************************/

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ["https://www.googleapis.com/auth/youtube.readonly"];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + "/jsons/";
var TOKEN_PATH = TOKEN_DIR + "youtube-nodejs.json";

// Load client secrets from a local file.
fs.readFile("./jsons/client_secret.json", function processClientSecrets(err, content) {
  if (err) {
    console.log("Error loading client secret file: " + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the YouTube API.
  authorize(JSON.parse(content));
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 *
 */
function authorize(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function (err, token) {
    if (err) {
      getNewToken(oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      client.authicatedApi = oauth2Client;
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 *
 *
 */
function getNewToken(oauth2Client) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url: ", authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", function (code) {
    rl.close();
    oauth2Client.getToken(code, function (err, token) {
      if (err) {
        console.log("Error while trying to retrieve access token", err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      client.authicatedApi = oauth2Client;
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log("Token stored to " + TOKEN_PATH);
  });
}
