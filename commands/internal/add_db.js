require("quick.db");
const fs = require("fs");

module.exports = {
  name: "add_db",
  description: "Add statistics to Database",
  execute(client, stats_db, viewer_db, video_db) {
    console.log(video_db);
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

    fs.appendFile(`./records/play/${name_no_ext}.txt`, `ID ${acess} ${day}/${month}/${year} ${episode_time * 60}\n`, (err) => {
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
          fs.appendFile(`./records/play/${name_no_ext}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${episode_time * 60}\n`, (err) => {
            if (err) console.log(err);
          });
        } else {
          fs.appendFile(`./records/play/${name_no_ext}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${~~(values[1] / 1000)}\n`, (err) => {
            if (err) console.log(err);
          });
        }
      }

      stats_db.delete(`${data_stats[b].ID}`);
    }
    fs.appendFile(`./records/play/${name_no_ext}.txt`, `\n`, (err) => {
      if (err) console.log(err);
    });

    fs.appendFile(`./records/month/${name_no_ext}/${month}-${year}.txt`, `ID ${acess} ${day}/${month}/${year} ${episode_time * 60}\n`, (err) => {
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
          fs.appendFile(`./records/month/${name_no_ext}/${month}-${year}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${episode_time * 60}\n`, (err) => {
            if (err) console.log(err);
          });
        } else {
          fs.appendFile(`./records/month/${name_no_ext}/${month}-${year}.txt`, `${data_stats[b].ID} ${(values[0] / 1000) | 0} ${~~(values[1] / 1000)}\n`, (err) => {
            if (err) console.log(err);
          });
        }
      }
    }
    fs.appendFile(`./records/month/${name_no_ext}/${month}-${year}.txt`, `\n`, (err) => {
      if (err) console.log(err);
    });

    for (a = 0; a < size_viewers; a++) {
      console.log(data_viewers[a]);
      if (data_viewers[a].data.total > episode_time / 10) {
        video_db.add(`${name_no_ext}.views`, 1);
      }
      viewer_db.delete(`${data_viewers[a].ID}`);
    }
  },
};
