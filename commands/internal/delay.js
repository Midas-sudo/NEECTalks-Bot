module.exports = {
  name: "delay",
  description: "Ping!",
  execute(time) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < time);
  },
};
