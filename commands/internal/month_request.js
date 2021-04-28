const fs = require("fs");
const { exec } = require("child_process");
const execSync = require("child_process").execSync;
module.exports = {
  name: "month_request",
  description: "First command to initiat the statistics request",
  execute(message, args) {
    var client = message.client;
    var size_lista = client.episodes.lista_ep.length;
    var list = [];
    console.log(size_lista);
    for (a = 1; a <= size_lista; a++) {
      try {
        if (!fs.existsSync(`${process.cwd()}/records/play/NEECTalks${a}.txt`)) {
          console.log("here");
          continue;
        }
      } catch (err) {
        message.channel.send(`<@&705078660838719498> Something went wrong (#000) ${err}`);
        console.error(err);
      }
      list.push(`${process.cwd()}/records/play/NEECTalks${a}.txt`);
      console.log(a);
    }
    console.log(list);

    size_lista = list.length;
    message.channel.send("Processing...");
    console.log("Processing...");
    for (a = 0; a < size_lista; a++) {
      execSync(`"${process.cwd()}/botParser" "${list[a]}"`, (error, stdout, stderr) => {
        if (error) {
          message.channel.send(`<@&705078660838719498> Something went wrong (#001), maybe the file doesn't exist. Check for typos. ${error}`);
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          message.channel.send(`<@&705078660838719498> Something went wrong (#002), maybe the file doesn't exist. Check for typos. ${stderr}`);
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        if (stdout == "No such file") {
          console.log("No file");
          message.channel.send(`<@&705078660838719498> Something went wrong (#003), maybe the file doesn't exist. Check for typos. ${stdout}`);
          return;
        }
      });
      var number = list[a].split("/play/NEECTalks")[1].split(".")[0];

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

      try {
        if (fs.existsSync(`${process.cwd()}/records/play_time_csv/NEECTalks${number}.txt.csv`)) {
          fs.readFileSync(`${process.cwd()}/records/play_time_csv/NEECTalks${number}.txt.csv`, "utf8", function (err, data) {
            console.log(data);
            old_values = data.split(",");
            old_size = old_values.length;
          });
        }
      } catch (err) {
        message.channel.send(`<@&705078660838719498> Something went wrong (#00-1) ${err}`);
        console.error(err);
      }

      /*fs.readFileSync(`${process.cwd()}/records/play_time_csv/NEECTalks${number}.txt.csv`, "utf8", function (err, data) {
        if (err) {

          var old_size = old_values.length;
        } else {
          console.log(data);
          var old_values = data.split(",");
          var old_size = old_values.length;
        }*/

      fs.writeFileSync(
        `${process.cwd()}/records/outputs/Output_NEECTalk${number}_ByTime.csv`,
        `Total:,30,60,90,120,150,180,210,240,270,300,330,360,390,420,450,480,510,540,570,600,630,660,690,720,750,780,810,840,870,900,930,960,990,1020,1050,1080,1110,1140,1170,1200,1230,1260,1290,1320,1350,1380,1410,1440,1470,1500,1530,1560,1590,1620,1650,1680,1710,1740,1770,1800,1830,1860,1890,1920,1950,1980,2010,2040,2070,2100,2130,2160,2190,2220,2250,2280,2310,2340,2370,2400,2430,2460,2490,2520,2550,2580,2610,2640,2670,2700,2730,2760,2790,2820,2850,2880,2910,2940,2970,3000\n`,
        (err) => {
          if (err) {
            message.channel.send(`<@&705078660838719498> Something went wrong (#004) ${err}`);
            console.log(err);
          }
        }
      );
      fs.readFile(`${process.cwd()}/parsed.csv`, "utf8", function (err, raw_data) {
        if (err) {
          console.log(err);
          message.channel.send(`<@&705078660838719498> Something went wrong (#005) ${err}`);
          continue;
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
        fs.appendFileSync(`${process.cwd()}/records/outputs/Output_NEECTalks${number}_ByTime.csv`, `${old_values.join(",")}\n`, (err) => {
          if (err) {
            message.channel.send(`<@&705078660838719498> Something went wrong (#006) ${err}`);
            console.log(err);
          }
        });
        fs.writeFileSync(`${process.cwd()}/records/play_time_csv/NEECTalks${number}.txt.csv`, `${old_values.join(",")}\n`, "utf8", function (err) {
          if (err) {
            message.channel.send(`<@&705078660838719498> Something went wrong (#007) ${err}`);
            return console.log(err);
          }
        });
        for (i = 1; i < old_size; i++) {
          old_values[i] = (old_values[i] / old_values[0]) * 100;
        }
        fs.appendFileSync(`Output.csv`, `${old_values.join(",")}\n`, (err) => {
          if (err) {
            message.channel.send(`<@&705078660838719498> Something went wrong (#008) ${err}`);
            console.log(err);
          }
        }); //${args[0]}
        console.log("Aqui");
        const attachment = new Discord.MessageAttachment(`${process.cwd()}/records/outputs/Output_NEECTalks${number}_ByTime.csv`);
        message.channel.send("<@&705078660838719498>", attachment);
      });

      client.internal_commands.get("delay").execute("10000");
      /*});
      /*exec(`rm  "${list[a]}"`, (error, stdout, stderr) => {
        if (error) {
          message.channel.send(`<@&705078660838719498> Something went wrong (#009) ${error}`);
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          message.channel.send(`<@&705078660838719498> Something went wrong (#010) ${stderr}`);
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });*/
    }

    /*
    fs.readdir(`${process.cwd()}/records/month/`, (err, folder) => {
      if (err) {
        message.channel.send(`<@&705078660838719498> Something went wrong (#011) ${err}`);
        console.log(err);
      } else {
        console.log("\nCurrent directory filenames:");
        folder.forEach((folder) => {
          fs.readdir(`${process.cwd()}/records/month/${folder}`, (err, files) => {
            if (err) {
              message.channel.send(`<@&705078660838719498> Something went wrong (#012) ${err}`);
              console.log(err);
            } else {
              var files_size = files.length;

              if (args[0] == "total") {
                files.forEach((file) => {
                  exec(`python3 ${process.cwd()}/neecbot.py ${process.cwd()}/records/play/month/${folder}/${file}`, (error, stdout, stderr) => {
                    if (error) {
                      message.channel.send(`<@&705078660838719498> Something went wrong (#013), maybe the file doesn't exist. Check for typos. ${error}`);
                      console.log(`error: ${error.message}`);
                      return;
                    }
                    if (stderr) {
                      message.channel.send(`<@&705078660838719498> Something went wrong (#014), maybe the file doesn't exist. Check for typos. ${stderr}`);
                      console.log(`stderr: ${stderr}`);
                      return;
                    }
                    console.log(`stdout: ${stdout}`);
                    if (stdout == "No such file") {
                      console.log("No file");
                      message.channel.send(`<@&705078660838719498> Something went wrong (#015), maybe the file doesn't exist. Check for typos. ${stdout}`);
                      return;
                    }
                  });
                  client.internal_commands.get("delay").execute("5000");

                  const attachment = new Discord.MessageAttachment(`${process.cwd()}/${file}_result.csv`);
                  message.channel.send("<@&705078660838719498>", attachment);

                  exec(`rm  ${process.cwd()}/${file}_result.csv`, (error, stdout, stderr) => {
                    if (error) {
                      message.channel.send(`<@&705078660838719498> Something went wrong (#016) ${error}`);
                      console.log(`error: ${error.message}`);
                      return;
                    }
                    if (stderr) {
                      message.channel.send(`<@&705078660838719498> Something went wrong (#017) ${stderr}`);
                      console.log(`stderr: ${stderr}`);
                      return;
                    }
                    console.log(`stdout: ${stdout}`);
                  });
                });
              } else if (args[0] == "one") {
                exec(`python3 ${process.cwd()}/neecbot.py ${process.cwd()}/records/play/month/${folder}/${files[files_size - 1]}`, (error, stdout, stderr) => {
                  if (error) {
                    message.channel.send(`<@&705078660838719498> Something went wrong (#018), maybe the file doesn't exist. Check for typos. ${error}`);
                    console.log(`error: ${error.message}`);
                    return;
                  }
                  if (stderr) {
                    message.channel.send(`<@&705078660838719498> Something went wrong (#019), maybe the file doesn't exist. Check for typos. ${stderr}`);
                    console.log(`stderr: ${stderr}`);
                    return;
                  }
                  console.log(`stdout: ${stdout}`);
                  if (stdout == "No such file") {
                    console.log("No file");
                    message.channel.send(`<@&705078660838719498> Something went wrong (#020), maybe the file doesn't exist. Check for typos. ${stdout}`);
                    return;
                  }
                });
                client.internal_commands.get("delay").execute("5000");

                const attachment = new Discord.MessageAttachment(`${process.cwd()}/${files[files_size - 1]}_result.csv`);
                message.channel.send("<@&705078660838719498>", attachment);

                exec(`rm  ${process.cwd()}/${files[files_size - 1]}_result.csv`, (error, stdout, stderr) => {
                  if (error) {
                    message.channel.send(`<@&705078660838719498> Something went wrong (#021) ${error}`);
                    console.log(`error: ${error.message}`);
                    return;
                  }
                  if (stderr) {
                    message.channel.send(`<@&705078660838719498> Something went wrong (#022) ${stderr}`);
                    console.log(`stderr: ${stderr}`);
                    return;
                  }
                  console.log(`stdout: ${stdout}`);
                });
              } else {
                message.channel.send(`<@&705078660838719498> Tens de especificar se queres estatisticas de todos os meses (total) ou so de um (one)`);
              }
            }
          });

          console.log(folder, args);
        });
      }
    });*/
  },
};
