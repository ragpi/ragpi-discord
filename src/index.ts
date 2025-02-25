import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from './config';
import { handleMessage } from './messageHandler';
import { logger } from './logger';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  logger.info(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, handleMessage);

client.login(config.DISCORD_TOKEN).catch(console.error);
