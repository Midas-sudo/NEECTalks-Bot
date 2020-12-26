const config = require("./config.json");
const Discord = require("discord.js");
const db = require("quick.db");

var video_db = db.table("video_db");
var viewer_db = db.table("viewer_db");
const client = new Discord.Client();

var size = 0;
var oldsize = 0;

client.on("ready", () => {
  video_db = new db.table("video_db");
  viewer_db = new db.table("viewer_db");
  console.log("I am ready!");
});

client.on("message", (message) => {
  if (message.content.startsWith("marco")) {
    message.channel.send("polo");
  }
});

client.login(config.token);

client.on("voiceStateUpdate", (oldmember, newmember) => {
  let channelId = config.voiceChannelId;

  if (
    oldmember.channel == channelId &&
    (newmember.channel != oldmember.channel ||
      newmember.channel == null ||
      newmember.channel == undefined)
  ) {
    var user_id = oldmember.id;
    oldsize = size;
    size = size - 1;
    if (user_id == "730431452566651022") return; //Alterar o valor do id do bot para o config
    var current_time = Date.now();
    viewer_db.set(`${user_id}.exit_time`, current_time);
    var entry_time = viewer_db.get(`${user_id}.entry_time`);

    total_time = current_time - entry_time; //(mills)
    total_time = total_time / 1000 / 60;
    viewer_db.add(`${user_id}.total`, total_time);
  }

  if (
    newmember.channel == channelId &&
    (oldmember.channel != newmember.channel ||
      oldmember.channel == null ||
      oldmember.channel == undefined)
  ) {
    var user_id = oldmember.id;
    oldsize = size;
    size = size + 1;
    if (user_id == "730431452566651022") return; //Alterar o valor do id do bot para o config

    var current_time = Date.now();
    console.log(current_time);
    viewer_db.set(`${user_id}.entry_time`, current_time);
    var data = viewer_db.all();
  }

  if (size == 1 && oldsize == 0) {
    var user_id = oldmember.id;
    var current_time = Date.now();
    console.log(current_time);
    viewer_db.set(`${user_id}.entry_time`, current_time);

    newmember.channel
      .join()
      .then((connection) => {
        console.log("Successfully connected.");
        song = config.url[Math.floor(Math.random() * config.url.length)];
        viewer_db.set(`${user_id}.tag`, song);
        console.log("now playing " + song);
        const dispatcher = connection.play(song);
        dispatcher.on("end", (end) => {
          voiceChannel.leave();
          add_db();
        });
      })
      .catch((e) => {
        console.error(e);
      });
  }
  if (oldsize == 2 && size == 1) {
    oldmember.channel.leave();
    add_db();
  }
  console.log("size: " + size);
});

function add_db() {
  var data = viewer_db.all();
  var size = data.length;
  var a = 0;
  const name = song.split("/");
  var name_size = name.length;
  console.log(name[name_size - 1]);
  var name1 = name[name_size - 1].slice(0, -4);
  console.log(name1);

  var episode_time = video_db.get("NEECTalk3.lenght");
  for (a = 0; a < size; a++) {
    console.log(data[a]);
    if (data[a].data.total > episode_time / 10) {
      video_db.add(`${name[name_size - 1]}.views`, 1);
    }
    viewer_db.set(`${data[a].ID}.total`, 0);
  }
}
