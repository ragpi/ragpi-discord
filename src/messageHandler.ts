import {
  Collection,
  Message,
  MessageType,
  OmitPartialGroupDMChannel,
} from 'discord.js';
import { config } from './config';
import { ChatMessage, ChatRequest, ChatResponse } from './types';
import { logger } from './logger';

const shouldProcessMessage = (message: Message<boolean>): boolean => {
  if (message.author.bot || !message.content) return false;

  const allowedChannels = config.DISCORD_CHANNEL_IDS;

  const channelId = message.channel.isThread()
    ? message.channel.parentId
    : message.channel.id;

  if (!channelId || !allowedChannels.includes(channelId)) return false;

  if (config.DISCORD_REQUIRE_MENTION) {
    if (!message.mentions.users.has(message.client.user?.id || ''))
      return false;
  }

  return true;
};

const formatChatHistory = (
  chatHistory: Collection<string, Message<boolean>>,
): ChatMessage[] => {
  const messages = chatHistory
    .filter((msg) => msg.content && msg.type === MessageType.Default)
    .map((msg): ChatMessage => {
      return {
        role: msg.author.id === msg.client.user?.id ? 'assistant' : 'user',
        content: msg.content,
      };
    })
    .reverse();

  return messages;
};

const fetchChatResponse = async (
  request: ChatRequest,
): Promise<ChatResponse> => {
  const response = await fetch(`${config.RAGPI_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.RAGPI_API_KEY ? { 'x-api-key': config.RAGPI_API_KEY } : {}),
    },
    body: JSON.stringify(request),
  });

  if (response.ok) {
    return response.json() as Promise<ChatResponse>;
  } else {
    const error = await response.json();
    logger.error('Error:', JSON.stringify(error, null, 2));
    throw new Error('An error occurred while fetching chat response');
  }
};

const sendMessage = async (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
  content: string,
) => {
  if (content.length >= 2000) {
    const messages = content.match(/[\s\S]{1,2000}/g);
    if (!messages) return;
    for (const msg of messages) {
      await message.channel.send(msg);
    }
  } else {
    await message.channel.send(content);
  }
};

export const handleMessage = async (
  message: OmitPartialGroupDMChannel<Message<boolean>>,
): Promise<void> => {
  if (!shouldProcessMessage(message)) return;

  logger.debug(
    `Processing message from user ${message.author.id} in channel ${message.channel.id}`,
  );

  try {
    const chatHistory = await message.channel.messages.fetch();
    const messages = formatChatHistory(chatHistory);

    await message.channel.sendTyping();

    const request: ChatRequest = {
      sources: config.RAGPI_SOURCES,
      messages,
    };

    const response = await fetchChatResponse(request);

    await sendMessage(message, response.message);

    logger.debug(`Successfully responded in channel ${message.channel.id}`);
  } catch (error) {
    logger.error(error);
    await message.channel.send(
      'Sorry, an error occurred. Please try again later.',
    );
  }
};
