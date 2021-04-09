require("quick.db");
const fs = require("fs");

module.exports = {
  name: "remove_episode",
  description: "Removes the last episode added",
  execute(message, args, video_db) {
    var client = message.client;

    var size = client.episodes.url.length;
    var episode_name = client.episodes.url[size - 1].split("/");
    var name = episode_name[2];
    var name_no_ext = name.split(".")[0];

    console.log(`Deleted ${name_no_ext} from the data base.`);
    video_db.delete(name_no_ext);

    console.log(client.episodes.url, client.episodes.lista_ep);
    client.episodes.url.pop();
    client.episodes.lista_ep.pop();
    console.log(`Removed last added episode from the url list resulting in:\n`, client.episodes.url);
    console.log(`Removed last added episode from the name list resulting in:\n`, client.episodes.lista_ep);

    console.log(`Written` + client.episodes + "to" + client.episodes_list_name);
    fs.writeFile(client.episodes_list_name, JSON.stringify(client.episodes, null, 2), function writeJSON(err) {
      //Writes to the config file the new JSON Object with the new prefix
      if (err) return console.log(err);
      console.log(JSON.stringify(client.episodes));
      console.log("writing to " + client.episodes_list_name);
    });
  },
};
