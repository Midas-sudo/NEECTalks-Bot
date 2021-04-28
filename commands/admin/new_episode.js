require("quick.db");
const fs = require("fs");
var { google } = require("googleapis");
const ffmpeg = require("fluent-ffmpeg");
const readline = require("readline");
const ytdl = require("ytdl-core");

module.exports = {
  name: "new_episode",
  description: "Adds a episode by url",
  execute(message, args, video_db) {
    var client = message.client;
    var Title, Description, Time, Ep_number;
    var id;
    var service = google.youtube("v3");

    if (args[0].length <= 15) {
      id = args[0];
      console.log(id);
    } else {
      if (args[0].startsWith("youtube.com/watch?v=")) {
        id = args[0].substring(20);
      } else if (args[0].startsWith("www.youtube.com/watch?v=")) {
        id = args[0].substring(24);
      } else if (args[0].startsWith("https://www.youtube.com/watch?v=")) {
        id = args[0].substring(32);
      } else if (args[0].startsWith("https://youtu.be/")) {
        id = args[0].substring(17);
      }
      if (id.indexOf("&") != -1) {
        id = id.substring(0, id.indexOf("&"));
        console.log(id);
      }
    }

    service.videos.list(
      {
        auth: client.authicatedApi,
        part: "snippet,contentDetails",
        id: id,
      },
      function (err, response) {
        if (err) {
          console.log("The API returned an error: " + err);
          return;
        }
        console.log(response.data);
        var channels = response.data.items;
        if (channels.length == 0) {
          console.log("No channel found.");
        } else {
          Title = channels[0].snippet.title.split("|");
          Description = channels[0].snippet.description;
          Time = channels[0].contentDetails.duration.substring(2);
          Time = Time.split("M");
          console.log(Title[0], Description, Time);

          Ep_number = client.episodes.url.length + 1;

          let stream = ytdl(id, {
            filter: "audioonly",
          });

          let start = Date.now();
          ffmpeg(stream)
            .audioBitrate(128)
            .save(`${process.cwd()}/episodes/NEECTalks${Ep_number}.m4a`)
            .on("progress", (p) => {
              readline.cursorTo(process.stdout, 0);
              process.stdout.write(`${p.targetSize}kb downloaded`);
            })
            .on("error", function (err, stdout, stderr) {
              console.log("ffmpeg stdout:\n" + stdout);
              console.log("ffmpeg stderr:\n" + stderr);
              return;
            })
            .on("end", () => {
              video_db.set(`NEECTalks${Ep_number}.name`, Title[0]);
              video_db.set(`NEECTalks${Ep_number}.description`, Description);
              video_db.set(`NEECTalks${Ep_number}.lenght`, Time[0] + 1);
              video_db.set(`NEECTalks${Ep_number}.views`, 0);
              client.episodes.url.push(`./episodes/NEECTalks${Ep_number}.m4a`);
              client.episodes.lista_ep.push(`${Title[0]} (${Time[0]} minutos)`);
              fs.writeFile(client.episodes_list_name, JSON.stringify(client.episodes, null, 2), function writeJSON(err) {
                //Writes to the config file the new JSON Object with the new prefix
                if (err) return console.log(err);
                console.log(JSON.stringify(client.episodes));
                console.log("writing to " + client.episodes_list_name);
              });
              fs.mkdir(`${process.cwd()}/records/month/NEECTalks${Ep_number}/`, { recursive: true }, (err) => {
                if (err) throw err;
              });
              console.log(`\ndone, thanks - ${(Date.now() - start) / 1000}s`);
              message.channel.send(`<@&705078660838719498> Episode Successfully Added! :white_check_mark:`);
            });
        }
      }
    );
  },
};
