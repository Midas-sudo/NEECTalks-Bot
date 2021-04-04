module.exports = {
  name: "help",
  description: "help",
  execute(message, args) {
    var client = message.client;

    message.channel.send({
      embed: {
        color: 0x1e94d3,
        title: "Help para os Neecos",
        description: "Ahh I see you are looking for some guidance",
        fields: [
          {
            name: `${client.config.prefix}prefix`,
            value: `Este comando define um novo prefixo passado como argumento.\n\`\`\`Exemplo: ${client.config.prefix}prefix ##\n Neste caso o novo prefixo passaria a ser ##\`\`\``,
          },
          {
            name: `${client.config.prefix}vc_id`,
            value: `Este comando define um novo id, para o voice channel, passado como argumento.\n\`\`\`Exemplo: ${client.config.prefix}vc_id 123456789987654321\n Neste caso o novo id passaria a ser 123456789987654321\`\`\``,
          },
          {
            name: `${client.config.prefix}text_id`,
            value: `Este comando define um novo id, para o text channel, passado como argumento.\n\`\`\`Exemplo: ${client.config.prefix}text_id 123456789987654321\n Neste caso o novo id passaria a ser 123456789987654321\`\`\``,
          },
          {
            name: `${client.config.prefix}serv_id`,
            value: `Este comando define um novo id, para o server, passado como argumento. ATENÇÂO este comando tem de ser executado apenas depois de mudar o id do textChannel\n\`\`\`Exemplo: ${client.config.prefix}serv_id 123456789987654321\n Neste caso o novo id passaria a ser 123456789987654321\`\`\``,
          },
          {
            name: `${client.config.prefix}stats`,
            value: `Este comando retorna as estatísticas avanças de um episodio das NEECTalks especificado como argumento do commando. \n\`\`\`Exemplo: ${client.config.prefix}stats NEECTalk1.txt\n Neste caso o episódio a ser analisádo seria NEECTalk1.txt\`\`\``,
          },
          {
            name: `${client.config.prefix}help`,
            value: `Este comando mostra esta mensagem`,
          },
        ],
      },
    });
  },
};
