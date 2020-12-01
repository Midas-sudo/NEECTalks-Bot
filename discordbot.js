const config = require("./config.json");
const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const client = new Discord.Client();
 
var size = 0;
var oldsize = 0;

client.on("ready", () => {
  console.log("I am ready!");
});
 

client.on("message", (message) => {
  if (message.content.startsWith("marco")) {
    message.channel.send("polo");
  }
});


client.login(config.token);

client.on('voiceStateUpdate', (oldmember, newmember)=>{
      let channelId = config.voiceChannelId;
      
      if(oldmember.channel==channelId && (newmember.channel!=oldmember.channel || newmember.channel == null)){
            oldsize=size;
            size = size-1;
      }

      if(newmember.channel==channelId && (oldmember.channel!=newmember.channel || oldmember.channel == null)){
            oldsize =size;
            size = size+1;
      }

      if(size == 1 && oldsize == 0){
            newmember.channel.join().then(connection => {
                  console.log("Successfully connected.");
                  song = config.url[Math.floor(Math.random() * config.url.length)]
                  console.log("now playing " + song)
                  const dispatcher = connection.play(ytdl(song), { filter: 'audioonly' });
                  dispatcher.on("end", end => {voiceChannel.leave();});
                }).catch(e => {
                  console.error(e);
                });
      }
      if(oldsize ==2 && size == 1){
            oldmember.channel.leave();
      }
      console.log("size: "+ size)
      
 })
    