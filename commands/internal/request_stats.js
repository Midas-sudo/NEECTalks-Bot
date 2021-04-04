const fs = require("fs");
const Discord = require("discord.js");
const { exec } = require("child_process");

module.exports = {
  name: "request_stats",
  description: "Requests Stats",
  execute(message, args) {
    var client = message.client;

    fs.readFile(`./records/play/${args[0]}.csv`, "utf8", function (err, data) {
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
        `Output_${args[0]}.csv`,
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
        fs.appendFile(`Output_${args[0]}.csv`, `${old_values.join(",")}\n`, (err) => {
          if (err) console.log(err);
        });
        fs.writeFile(`./records/play/${args[0]}.csv`, `${old_values.join(",")}\n`, "utf8", function (err) {
          if (err) return console.log(err);
        });
        /*for(i=1; i<old_size; i++){
            old_values[i] = (old_values[i]/old_values[0]*100);
          }
          fs.appendFile( `Output.csv`, `${old_values.join(',')}\n`,(err) => {if(err) console.log(err);});${args[0]}*/
        console.log("Aqui");
        const attachment = new Discord.MessageAttachment(`Output_${args[0]}.csv`);
        message.channel.send(message.author, attachment);
      });
    });
    /*exec(`rm  ./records/play/${args[0]}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });*/
  },
};
