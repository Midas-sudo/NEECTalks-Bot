const config = require("./config.json");
const Discord = require("discord.js");
const db = require("quick.db");
const fs = require("fs");

var video_db = db.table("video_db");
var viewer_db = db.table("viewer_db");
//var stats_db = db.table("stats_db");
const client = new Discord.Client();

const {prefix, token, voiceChannelId, textChannelId, botID, url} = config; //Information loaded from config

var size = 0;
var oldsize = 0;
//var zero_point;

client.on("ready", () => {
  video_db = new db.table("video_db");
  viewer_db = new db.table("viewer_db");
  stats_db = new db.table("stats_db");
  console.log("I am ready!");
});

client.on("message", (message) => {
  if (message.content.startsWith("marco")) {
    message.channel.send("polo");
  }
});

client.login(token);

client.on("voiceStateUpdate", (oldmember, newmember) => {
  let voice_channelId = voiceChannelId;

  if (oldmember.channel == voice_channelId && (newmember.channel != oldmember.channel || newmember.channel == null || newmember.channel == undefined)){
    var user_id = oldmember.id;
    oldsize = size;
    size = size - 1;
    if (user_id == botID) return;
    var current_time = Date.now();
    viewer_db.set(`${user_id}.exit_time`, current_time);
    var entry_time = viewer_db.get(`${user_id}.entry_time`);

    total_time = current_time - entry_time; //(mills)
    total_time = total_time / 1000 / 60;
    viewer_db.add(`${user_id}.total`, total_time);
  }

  if (newmember.channel == voice_channelId && (oldmember.channel != newmember.channel || oldmember.channel == null || oldmember.channel == undefined)){
    var user_id = oldmember.id;
    oldsize = size;
    size = size + 1;
    if (user_id == botID){
      //zero_point = Date.now();
      return;
    }

    var current_time = Date.now();
    console.log(current_time);
    viewer_db.set(`${user_id}.entry_time`, current_time);
    /*if(stats_db.get(`${user_id}`) === undefined){
      stats_db.set(`${user_id}.1.entry_time`, current_time-zero_point);
    }else{
      var a=1;
      while(stats_db.get(`${user_id}${}`))
    }*/

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
        song = url[Math.floor(Math.random() * config.url.length)];
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
  var name = song.split("/");
  var name_size = name.length;

  var name_no_ext = name[name_size - 1].slice(0, -4);
  console.log(name_no_ext);

  var episode_time = video_db.get(`${name_no_ext}.lenght`);

  for (a = 0; a < size; a++) {
    console.log(data[a]);
    if (data[a].data.total > episode_time / 10) {
      video_db.add(`${name_no_ext}.views`, 1);
    }
    viewer_db.delete(`${data[a].ID}`);
  }
}
