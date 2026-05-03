const { Client, GatewayIntentBits, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Pong!');
  }

  if (message.content === '!hello') {
    message.reply(`Hello, ${message.author.username}!`);
  }

  if (message.content === '!help') {
    message.reply(
      '**Available commands:**\n' +
      '`!ping` — Check if the bot is alive\n' +
      '`!hello` — Say hello\n' +
      '`!help` — Show this help message'
    );
  }
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN environment variable.');
  process.exit(1);
}

client.login(token);
