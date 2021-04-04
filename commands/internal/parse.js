const fs = require("fs");
const { exec } = require("child_process");
module.exports = {
  name: "parse",
  description: "First command to initiat the statistics request",
  execute(message, args) {
    var client = message.client;

    if (args[0].split(/[0-9]/)[0] != "NEECTalks" || !args[0].endsWith(".txt")) {
      message.channel.send(`Nome incorreto, nome tem de ser do tipo NEECTalksX.txt sendo X o número do episódio`);
      return;
    }

    try {
      if (!fs.existsSync(`./records/play/${args[0]}`)) {
        console.log("No file");
        message.channel.send(`${message.author} Something went wrong (#822), maybe the file doesn't exist. Check for typos`);
        return;
      }
    } catch (err) {
      console.error(err);
    }

    exec(`./botParser ./records/play/${args[0]}`, (error, stdout, stderr) => {
      if (error) {
        message.channel.send(`${message.author} Something went wrong (#245), maybe the file doesn't exist. Check for typos\n ${error.message}`);

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
    client.internal_commands.get("delay").execute("10000");
    client.internal_commands.get("request_stats").execute(message, args);
  },
};
