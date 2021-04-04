module.exports = {
  name: "help",
  description: "Help command for normal user",
  execute(message, args) {
    var client = message.client;
    message.channel.send({
      embed: {
        color: 0x1e94d3,
        title: "NEECTalks Bot Help Page",
        description: "Ahh I see you are looking for some guidance",
        fields: [
          {
            name: "Alguns comandos são:",
            value: "-------------------------------------------",
          },
          {
            name: `${client.config.prefix}list // ${client.config.prefix}lista`,
            value: `Mostra a lista de episódios disponíveis.`,
          },
          {
            name: `${client.config.prefix}next`,
            value: `Toca o próximo episódio.`,
          },
          {
            name: `${client.config.prefix}skip`,
            value: `Exemplos:\n\`${client.config.prefix}skip\`: Skip aleatório;\n\`${client.config.prefix}skip last\`: Skip para o último episódio;\n\`${client.config.prefix}skip 1\`: Skip para o episódio 1;`,
          },
          {
            name: `${client.config.prefix}help`,
            value: `Mostra esta mensagem`,
          },
          {
            name: `${client.config.prefix}info`,
            value: `Mostra mais informações do episódio que tiver a tocar neste momento`,
          },
        ],
      },
    });
  },
};
